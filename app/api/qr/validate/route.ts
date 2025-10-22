import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/qr/validate - Validar e processar QR code
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { qrData, location } = await request.json()

    if (!qrData) {
      return NextResponse.json({ error: 'Dados do QR code são obrigatórios' }, { status: 400 })
    }

    let parsedQRData
    try {
      parsedQRData = JSON.parse(qrData)
    } catch (error) {
      return NextResponse.json({ error: 'QR code inválido' }, { status: 400 })
    }

    const { machineId, nonce, expires } = parsedQRData

    // Verificar se o QR code não expirou
    if (Date.now() > expires) {
      return NextResponse.json({ error: 'QR code expirado' }, { status: 400 })
    }

    // Buscar evento QR no banco
    const qrEvent = await prisma.qrEvent.findUnique({
      where: { nonce },
      include: { machine: true }
    })

    if (!qrEvent) {
      return NextResponse.json({ error: 'QR code não encontrado' }, { status: 404 })
    }

    if (qrEvent.used) {
      return NextResponse.json({ error: 'QR code já foi utilizado' }, { status: 400 })
    }

    if (qrEvent.machineId !== machineId) {
      return NextResponse.json({ error: 'QR code inválido para esta máquina' }, { status: 400 })
    }

    // Verificar se a máquina está ativa
    if (!qrEvent.machine.isActive) {
      return NextResponse.json({ error: 'Máquina não está ativa' }, { status: 400 })
    }

    // Determinar tipo de registro baseado no último registro do usuário
    const lastRecord = await prisma.attendanceRecord.findFirst({
      where: { userId: session.user.id },
      orderBy: { timestamp: 'desc' }
    })

    const recordType = !lastRecord || lastRecord.type === 'EXIT' ? 'ENTRY' : 'EXIT'

    // Criar registro de ponto
    const attendanceRecord = await prisma.attendanceRecord.create({
      data: {
        userId: session.user.id,
        machineId: qrEvent.machineId,
        type: recordType,
        qrData,
        latitude: location?.latitude,
        longitude: location?.longitude,
        hash: `${session.user.id}-${qrEvent.machineId}-${recordType}-${Date.now()}`,
        prevHash: lastRecord?.hash
      },
      include: {
        machine: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Marcar QR como usado
    await prisma.qrEvent.update({
      where: { id: qrEvent.id },
      data: { used: true }
    })

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'VALIDATE_QR',
        resource: 'ATTENDANCE_RECORD',
        details: `Registro de ${recordType} processado via QR code na máquina ${qrEvent.machine.name}`
      }
    })

    return NextResponse.json({
      success: true,
      record: attendanceRecord,
      type: recordType,
      message: `${recordType === 'ENTRY' ? 'Entrada' : 'Saída'} registrada com sucesso!`,
      machine: {
        name: qrEvent.machine.name,
        location: qrEvent.machine.location
      },
      timestamp: attendanceRecord.timestamp
    })
  } catch (error) {
    console.error('Erro ao validar QR code:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
