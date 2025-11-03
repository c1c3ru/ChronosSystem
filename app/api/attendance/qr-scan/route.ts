import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateSecureQR, isNonceUsed, markNonceAsUsed, generateRecordHash } from '@/lib/qr-security'

// POST /api/attendance/qr-scan - Registrar ponto via QR code
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { qrData } = await request.json()

    if (!qrData) {
      return NextResponse.json({ error: 'QR code é obrigatório' }, { status: 400 })
    }

    console.log('🔍 Validando QR code seguro...')

    // Validar QR code seguro com HMAC-SHA256
    const validation = validateSecureQR(qrData)
    
    if (!validation.isValid) {
      console.log('❌ QR code inválido:', validation.error)
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { machineId, nonce, timestamp } = validation.payload!

    console.log('✅ QR code válido - Máquina:', machineId, 'Nonce:', nonce.slice(0, 8) + '...')

    // Verificar anti-replay (nonce único)
    if (isNonceUsed(nonce)) {
      console.log('❌ Nonce já foi usado:', nonce.slice(0, 8) + '...')
      return NextResponse.json({ error: 'QR code já foi utilizado (anti-replay)' }, { status: 400 })
    }

    // Verificar se a máquina existe e está ativa
    const machine = await prisma.machine.findFirst({
      where: {
        id: machineId,
        isActive: true
      }
    })

    if (!machine) {
      return NextResponse.json({ error: 'Máquina não encontrada ou inativa' }, { status: 400 })
    }

    console.log('🔍 Verificando máquina e nonce no banco...')

    // Determinar tipo de registro (entrada ou saída)
    const lastRecord = await prisma.attendanceRecord.findFirst({
      where: { userId: session.user.id },
      orderBy: { timestamp: 'desc' }
    })

    const recordType = (!lastRecord || lastRecord.type === 'EXIT') ? 'ENTRY' : 'EXIT'

    // Verificar se não há registro duplicado no mesmo minuto (proteção adicional)
    const now = Date.now()
    const oneMinuteAgo = new Date(now - 60 * 1000)
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
        timestamp: new Date(),
        qrData: qrData,
        hash: recordHash
      }
    })

    // Marcar nonce como usado (anti-replay)
    markNonceAsUsed(nonce)

    // Marcar QR como usado no banco para auditoria
    const existingQrEvent = await prisma.qrEvent.findFirst({
      where: { nonce: nonce }
    })
    
    if (existingQrEvent) {
      await (prisma.qrEvent as any).update({
        where: { id: existingQrEvent.id },
        data: { 
          used: true,
          usedAt: new Date(),
          usedBy: session.user.id
        }
      })
    }

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'QR_SCAN_ATTENDANCE',
        resource: 'ATTENDANCE_RECORD',
        details: `Registro de ${recordType} via QR code na máquina ${machine.name}`
      }
    })

    return NextResponse.json({
      success: true,
      record: {
        id: attendanceRecord.id,
        type: recordType,
        timestamp: attendanceRecord.timestamp,
        location: machine.location,
        machineName: machine.name
      },
      message: `${recordType === 'ENTRY' ? 'Entrada' : 'Saída'} registrada com sucesso!`
    })

  } catch (error) {
    console.error('Erro ao processar QR scan:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
