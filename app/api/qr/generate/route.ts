import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// POST /api/qr/generate - Gerar QR code para máquina
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { machineId } = await request.json()

    if (!machineId) {
      return NextResponse.json({ error: 'ID da máquina é obrigatório' }, { status: 400 })
    }

    // Verificar se a máquina existe
    const machine = await prisma.machine.findUnique({
      where: { id: machineId }
    })

    if (!machine) {
      return NextResponse.json({ error: 'Máquina não encontrada' }, { status: 404 })
    }

    // Gerar nonce único
    const nonce = crypto.randomBytes(16).toString('hex')
    const timestamp = Date.now()
    
    // Criar dados do QR (válido por 5 minutos)
    const expiresAt = new Date(timestamp + 5 * 60 * 1000)
    
    // Dados que serão codificados no QR
    const qrData = JSON.stringify({
      machineId,
      nonce,
      timestamp,
      expires: expiresAt.getTime()
    })

    // Salvar evento QR no banco
    await prisma.qrEvent.create({
      data: {
        machineId,
        qrData,
        nonce,
        expiresAt,
        used: false
      }
    })

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'GENERATE_QR',
        resource: 'QR_CODE',
        details: `QR code gerado para máquina ${machine.name}`
      }
    })

    return NextResponse.json({
      qrData,
      machineId,
      machineName: machine.name,
      location: machine.location,
      expiresAt: expiresAt.toISOString(),
      validFor: 300 // 5 minutos em segundos
    })
  } catch (error) {
    console.error('Erro ao gerar QR code:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
