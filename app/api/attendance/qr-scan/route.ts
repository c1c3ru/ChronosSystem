import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // Decodificar dados do QR
    let qrInfo
    try {
      qrInfo = JSON.parse(qrData)
    } catch (error) {
      return NextResponse.json({ error: 'QR code inválido' }, { status: 400 })
    }

    const { machineId, nonce, timestamp, expires, type } = qrInfo

    // Validar estrutura do QR
    if (!machineId || !nonce || !timestamp || !expires || type !== 'KIOSK_QR') {
      return NextResponse.json({ error: 'QR code malformado' }, { status: 400 })
    }

    // Verificar se QR não expirou (60 segundos)
    const now = Date.now()
    if (now > expires) {
      return NextResponse.json({ error: 'QR code expirado. Gere um novo código.' }, { status: 400 })
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

    // Verificar se o QR já foi usado (garantir unicidade)
    const existingQrEvent = await prisma.qrEvent.findFirst({
      where: {
        nonce: nonce,
        used: true
      }
    })

    if (existingQrEvent) {
      return NextResponse.json({ error: 'QR code já foi utilizado' }, { status: 400 })
    }

    // Verificar se existe um QrEvent válido para este nonce
    const qrEvent = await prisma.qrEvent.findFirst({
      where: {
        nonce: nonce,
        machineId: machineId,
        used: false,
        expiresAt: {
          gt: new Date()
        }
      }
    })

    if (!qrEvent) {
      return NextResponse.json({ error: 'QR code inválido ou expirado' }, { status: 400 })
    }

    // Determinar tipo de registro (entrada ou saída)
    const lastRecord = await prisma.attendanceRecord.findFirst({
      where: { userId: session.user.id },
      orderBy: { timestamp: 'desc' }
    })

    const recordType = (!lastRecord || lastRecord.type === 'EXIT') ? 'ENTRY' : 'EXIT'

    // Verificar se não há registro duplicado no mesmo minuto (proteção adicional)
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

    // Criar hash para integridade
    const recordHash = require('crypto')
      .createHash('sha256')
      .update(`${session.user.id}-${machineId}-${recordType}-${Date.now()}`)
      .digest('hex')

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

    // Marcar QR como usado para garantir unicidade
    await (prisma.qrEvent as any).update({
      where: { id: qrEvent.id },
      data: { 
        used: true,
        usedAt: new Date(),
        usedBy: session.user.id
      }
    })

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
