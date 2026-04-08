import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateSecureQR, generateRecordHash } from '@/lib/qr-security'
import { getNowInFortaleza } from '@/lib/timezone'

// POST /api/attendance/qr-scan - Registrar ponto via QR code

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest) {
  // ⚠️ API DEPRECATED - Adicionar monitoramento
  console.warn('⚠️ [DEPRECATED] /api/attendance/qr-scan está deprecated. Use /api/attendance/qr-unified')
  console.warn('📊 [MIGRATION] IP:', request.headers.get('x-forwarded-for') || 'unknown')
  console.warn('📊 [MIGRATION] User-Agent:', request.headers.get('user-agent')?.substring(0, 100) || 'unknown')
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { qrData } = await request.json()

    if (!qrData) {
      return NextResponse.json({ error: 'QR code é obrigatório' }, { status: 400 })
    }

    console.log('🔍 [QR-SCAN] Validando QR code seguro...')

    // Validar QR code seguro com HMAC-SHA256
    const validation = validateSecureQR(qrData)
    
    if (!validation.isValid) {
      console.log('❌ [QR-SCAN] QR code inválido:', validation.error)
      return NextResponse.json({ 
        error: validation.error || 'QR code inválido',
        code: 'INVALID_QR'
      }, { status: 400 })
    }

    if (!validation.payload) {
      console.log('❌ [QR-SCAN] Payload não encontrado no QR code')
      return NextResponse.json({ 
        error: 'Payload não encontrado no QR code',
        code: 'MISSING_PAYLOAD'
      }, { status: 400 })
    }

    const { machineId, nonce, timestamp, expiresIn } = validation.payload

    console.log('✅ [QR-SCAN] QR code válido - Máquina:', machineId, 'Nonce:', nonce.substring(0, 8) + '...', 'Expira em:', expiresIn, 'segundos')

    // Verificar se o QR code existe no banco e não foi usado
    const qrEvent = await prisma.qrEvent.findUnique({
      where: { nonce },
      include: { machine: true }
    })

    if (!qrEvent) {
      console.log('❌ [QR-SCAN] QR code não encontrado no banco:', nonce.substring(0, 8) + '...')
      return NextResponse.json({ 
        error: 'QR code não encontrado. Pode ter expirado ou ser inválido.',
        code: 'QR_NOT_FOUND'
      }, { status: 404 })
    }

    // Verificar se a máquina do QR corresponde à máquina esperada
    if (qrEvent.machineId !== machineId) {
      console.log('❌ [QR-SCAN] QR code inválido para esta máquina:', machineId, 'vs', qrEvent.machineId)
      return NextResponse.json({ 
        error: 'QR code inválido para esta máquina',
        code: 'INVALID_MACHINE'
      }, { status: 400 })
    }

    // Verificar se já foi usado
    if (qrEvent.used) {
      console.log('❌ [QR-SCAN] QR code já foi usado:', nonce.substring(0, 8) + '...')
      return NextResponse.json({ 
        error: 'QR code já foi utilizado. Gere um novo QR code.',
        code: 'QR_ALREADY_USED'
      }, { status: 400 })
    }

    // Verificar se expirou (verificar no banco E no payload)
    const currentTime = getNowInFortaleza()
    if (currentTime > qrEvent.expiresAt) {
      console.log('❌ [QR-SCAN] QR code expirado no banco:', nonce.substring(0, 8) + '...', 'Expiração:', qrEvent.expiresAt.toISOString())
      return NextResponse.json({ 
        error: 'QR code expirado. Gere um novo QR code.',
        code: 'QR_EXPIRED'
      }, { status: 400 })
    }

    // Verificar se a máquina está ativa
    if (!qrEvent.machine.isActive) {
      console.log('❌ [QR-SCAN] Máquina inativa:', machineId)
      return NextResponse.json({ 
        error: 'Máquina não está ativa',
        code: 'MACHINE_INACTIVE'
      }, { status: 400 })
    }

    const machine = qrEvent.machine

    console.log('✅ [QR-SCAN] QR code válido e não usado - Máquina:', machine.name, '-', machine.location)

    // Determinar tipo de registro (entrada ou saída)
    const lastRecord = await prisma.attendanceRecord.findFirst({
      where: { userId: session.user.id },
      orderBy: { timestamp: 'desc' }
    })

    const recordType = (!lastRecord || lastRecord.type === 'EXIT') ? 'ENTRY' : 'EXIT'

    // Verificar se não há registro duplicado no mesmo minuto (proteção adicional)
    const now = getNowInFortaleza()
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)
    const recentRecord = await prisma.attendanceRecord.findFirst({
      where: {
        userId: session.user.id,
        timestamp: {
          gte: oneMinuteAgo
        },
        type: recordType
      }
    })

    if (recentRecord) {
      return NextResponse.json({ 
        error: `Registro de ${recordType === 'ENTRY' ? 'entrada' : 'saída'} já feito recentemente. Aguarde 1 minuto.` 
      }, { status: 400 })
    }

    // Buscar último hash para hash chain
    const prevRecord = await prisma.attendanceRecord.findFirst({
      orderBy: { timestamp: 'desc' },
      select: { hash: true }
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
        prevHash: lastRecord?.hash
      },
      include: {
        machine: {
          select: {
            name: true,
            location: true
          }
        }
      }
    })

    // Marcar QR como usado no banco para auditoria
    await prisma.qrEvent.update({
      where: { id: qrEvent.id },
      data: { 
        used: true,
        usedAt: getNowInFortaleza(),
        usedBy: session.user.id
      }
    })
    
    console.log('✅ [QR-SCAN] QR code marcado como usado no banco')

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'QR_SCAN_ATTENDANCE',
        resource: 'ATTENDANCE_RECORD',
        details: `Registro de ${recordType} via QR code na máquina ${machine.name}`
      }
    })

    console.log('✅ [QR-SCAN] Registro de ponto criado com sucesso:', {
      recordId: attendanceRecord.id,
      type: recordType,
      timestamp: attendanceRecord.timestamp.toISOString(),
      machine: machine.name
    })

    const response = NextResponse.json({
      success: true,
      record: {
        id: attendanceRecord.id,
        type: recordType,
        timestamp: attendanceRecord.timestamp,
        location: machine.location,
        machineName: machine.name
      },
      message: `${recordType === 'ENTRY' ? 'Entrada' : 'Saída'} registrada com sucesso!`,
      machine: {
        name: machine.name,
        location: machine.location
      },
      // Adicionar aviso de deprecação na resposta
      _deprecated: {
        warning: 'Esta API está deprecated. Use /api/attendance/qr-unified',
        replacement: '/api/attendance/qr-unified',
        sunset: '2024-12-31'
      }
    })

    // Adicionar headers de deprecação
    response.headers.set('X-API-Deprecated', 'true')
    response.headers.set('X-API-Replacement', '/api/attendance/qr-unified')
    response.headers.set('X-API-Sunset', '2024-12-31')
    response.headers.set('Warning', '299 - "API deprecated. Use /api/attendance/qr-unified"')

    return response

  } catch (error: any) {
    console.error('❌ [QR-SCAN] Erro ao processar QR scan:', error)
    
    // Verificar se é erro de QR_SECRET
    if (error.message && error.message.includes('QR_SECRET')) {
      return NextResponse.json({ 
        error: 'Erro de configuração do servidor: QR_SECRET não está configurado',
        code: 'SERVER_CONFIG_ERROR'
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}
