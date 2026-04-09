import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateSecureQR, generateRecordHash } from '@/lib/qr-security'
import { getNowInFortaleza } from '@/lib/timezone'
import { apiLogger } from '@/lib/logger'

// POST /api/attendance/qr-scan - Registrar ponto via QR code

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest) {
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'

  apiLogger.warn('Deprecated API called', {
    path: '/api/attendance/qr-scan',
    ip: clientIp,
    userAgent: request.headers.get('user-agent')?.substring(0, 50),
    replacement: '/api/attendance/qr-unified',
  })

  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { qrData } = await request.json()

    if (!qrData) {
      return NextResponse.json({ error: 'QR code é obrigatório' }, { status: 400 })
    }

    if (qrData.length > 500) {
      apiLogger.warn('QR data exceeds maximum length', { length: qrData.length })
      return NextResponse.json({ error: 'QR code inválido', code: 'INVALID_QR' }, { status: 400 })
    }

    apiLogger.debug('Validating secure QR code')

    // Validar QR code seguro com HMAC-SHA256
    const validation = validateSecureQR(qrData)

    if (!validation.isValid) {
      apiLogger.warn('Invalid QR code', { error: validation.error })
      return NextResponse.json(
        {
          error: validation.error || 'QR code inválido',
          code: 'INVALID_QR',
        },
        { status: 400 }
      )
    }

    if (!validation.payload) {
      apiLogger.warn('Missing QR payload')
      return NextResponse.json(
        {
          error: 'Payload não encontrado no QR code',
          code: 'MISSING_PAYLOAD',
        },
        { status: 400 }
      )
    }

    const { machineId, nonce, timestamp, expiresIn } = validation.payload

    apiLogger.debug('QR validated', { machineId, expiresIn })

    // Verificar se o QR code existe no banco e não foi usado
    const qrEvent = await prisma.qrEvent.findUnique({
      where: { nonce },
      include: { machine: true },
    })

    if (!qrEvent) {
      apiLogger.warn('QR event not found in database')
      return NextResponse.json(
        {
          error: 'QR code não encontrado. Pode ter expirado ou ser inválido.',
          code: 'QR_NOT_FOUND',
        },
        { status: 404 }
      )
    }

    // Verificar se a máquina do QR corresponde à máquina esperada
    if (qrEvent.machineId !== machineId) {
      apiLogger.warn('QR code used on wrong machine', {
        expected: machineId,
        actual: qrEvent.machineId,
      })
      return NextResponse.json(
        {
          error: 'QR code inválido para esta máquina',
          code: 'INVALID_MACHINE',
        },
        { status: 400 }
      )
    }

    // Verificar se já foi usado
    if (qrEvent.used) {
      apiLogger.warn('QR code already used')
      return NextResponse.json(
        {
          error: 'QR code já foi utilizado. Gere um novo QR code.',
          code: 'QR_ALREADY_USED',
        },
        { status: 400 }
      )
    }

    // Verificar se expirou (verificar no banco E no payload)
    const currentTime = getNowInFortaleza()
    if (currentTime > qrEvent.expiresAt) {
      apiLogger.warn('QR code expired', { expiresAt: qrEvent.expiresAt.toISOString() })
      return NextResponse.json(
        {
          error: 'QR code expirado. Gere um novo QR code.',
          code: 'QR_EXPIRED',
        },
        { status: 400 }
      )
    }

    // Verificar se a máquina está ativa
    if (!qrEvent.machine.isActive) {
      apiLogger.warn('Machine is inactive', { machineId })
      return NextResponse.json(
        {
          error: 'Máquina não está ativa',
          code: 'MACHINE_INACTIVE',
        },
        { status: 400 }
      )
    }

    const machine = qrEvent.machine

    apiLogger.debug('QR valid and unused', { machine: machine.name })

    // Determinar tipo de registro (entrada ou saída)
    const lastRecord = await prisma.attendanceRecord.findFirst({
      where: { userId: session.user.id },
      orderBy: { timestamp: 'desc' },
    })

    const recordType = !lastRecord || lastRecord.type === 'EXIT' ? 'ENTRY' : 'EXIT'

    // Verificar se não há registro duplicado no mesmo minuto (proteção adicional)
    const now = getNowInFortaleza()
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)
    const recentRecord = await prisma.attendanceRecord.findFirst({
      where: {
        userId: session.user.id,
        timestamp: {
          gte: oneMinuteAgo,
        },
        type: recordType,
      },
    })

    if (recentRecord) {
      return NextResponse.json(
        {
          error: `Registro de ${recordType === 'ENTRY' ? 'entrada' : 'saída'} já feito recentemente. Aguarde 1 minuto.`,
        },
        { status: 400 }
      )
    }

    // Buscar último hash para hash chain
    const prevRecord = await prisma.attendanceRecord.findFirst({
      orderBy: { timestamp: 'desc' },
      select: { hash: true },
    })

    // Criar hash para integridade (hash chain)
    const recordHash = generateRecordHash(
      session.user.id,
      machineId,
      recordType,
      Date.now(),
      prevRecord?.hash
    )

    // Criar registro de ponto
    const attendanceRecord = await prisma.attendanceRecord.create({
      data: {
        userId: session.user.id,
        machineId: machineId,
        type: recordType,
        timestamp: getNowInFortaleza(),
        qrData: qrData,
        hash: recordHash,
        prevHash: lastRecord?.hash,
      },
      include: {
        machine: {
          select: {
            name: true,
            location: true,
          },
        },
      },
    })

    // Marcar QR como usado no banco para auditoria
    await prisma.qrEvent.update({
      where: { id: qrEvent.id },
      data: {
        used: true,
        usedAt: getNowInFortaleza(),
        usedBy: session.user.id,
      },
    })

    apiLogger.debug('QR marked as used')

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'QR_SCAN_ATTENDANCE',
        resource: 'ATTENDANCE_RECORD',
        details: `Registro de ${recordType} via QR code na máquina ${machine.name}`,
      },
    })

    apiLogger.info('Attendance record created successfully', {
      recordId: attendanceRecord.id,
      type: recordType,
      machine: machine.name,
    })

    const response = NextResponse.json({
      success: true,
      record: {
        id: attendanceRecord.id,
        type: recordType,
        timestamp: attendanceRecord.timestamp,
        location: machine.location,
        machineName: machine.name,
      },
      message: `${recordType === 'ENTRY' ? 'Entrada' : 'Saída'} registrada com sucesso!`,
      machine: {
        name: machine.name,
        location: machine.location,
      },
      _deprecated: {
        warning: 'Esta API está deprecated. Use /api/attendance/qr-unified',
        replacement: '/api/attendance/qr-unified',
        sunset: '2025-06-30',
      },
    })

    // Adicionar headers de deprecação
    response.headers.set('X-API-Deprecated', 'true')
    response.headers.set('X-API-Replacement', '/api/attendance/qr-unified')
    response.headers.set('X-API-Sunset', '2025-06-30')
    response.headers.set('Warning', '299 - "API deprecated. Use /api/attendance/qr-unified"')

    return response
  } catch (error: any) {
    apiLogger.error('Error processing QR scan', {
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    })

    // Verificar se é erro de QR_SECRET
    if (error.message && error.message.includes('QR_SECRET')) {
      return NextResponse.json(
        {
          error: 'Erro de configuração do servidor: QR_SECRET não está configurado',
          code: 'SERVER_CONFIG_ERROR',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    )
  }
}
