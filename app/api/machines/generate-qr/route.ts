import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateSecureQR } from '@/lib/qr-security'

/** TTL do payload HMAC e do QrEvent.expiresAt (segundos) — deve ser o mesmo valor em todo o fluxo */
const ADMIN_QR_TTL_SECONDS = 300

// GET /api/machines/generate-qr?machineId=xxx - Gerar QR code seguro para máquina
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Apenas admins e supervisores podem gerar QR codes
    if (!['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const machineId = searchParams.get('machineId')

    if (!machineId) {
      return NextResponse.json({ error: 'machineId é obrigatório' }, { status: 400 })
    }

    // Verificar se a máquina existe
    const machine = await prisma.machine.findUnique({
      where: { id: machineId },
      select: { id: true, name: true, location: true, isActive: true },
    })

    if (!machine) {
      return NextResponse.json({ error: 'Máquina não encontrada' }, { status: 404 })
    }

    if (!machine.isActive) {
      return NextResponse.json({ error: 'Máquina inativa' }, { status: 400 })
    }

    const qrData = generateSecureQR(machineId, ADMIN_QR_TTL_SECONDS)
    const payload = JSON.parse(Buffer.from(qrData.payload, 'base64url').toString())
    const expiresAt = new Date(payload.timestamp + payload.expiresIn * 1000)

    await prisma.qrEvent.create({
      data: {
        machineId: machineId,
        qrData: qrData.fullQR,
        nonce: payload.nonce,
        expiresAt,
        used: false,
      },
    })

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'GENERATE_QR_CODE',
        resource: 'MACHINE',
        details: `QR code gerado para máquina ${machine.name} (${machine.location})`,
      },
    })

    console.log(`🔐 [QR] QR code gerado para máquina ${machine.name}`)

    return NextResponse.json({
      success: true,
      qrData: qrData.fullQR,
      machine: {
        id: machine.id,
        name: machine.name,
        location: machine.location,
      },
      expiresIn: ADMIN_QR_TTL_SECONDS,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error: unknown) {
    console.error('Erro ao gerar QR code:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST /api/machines/generate-qr - Gerar QR code para múltiplas máquinas
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Apenas admins podem gerar QR codes em lote
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const { machineIds } = await request.json()

    if (!Array.isArray(machineIds) || machineIds.length === 0) {
      return NextResponse.json({ error: 'Lista de machineIds é obrigatória' }, { status: 400 })
    }

    // Buscar máquinas
    const machines = await prisma.machine.findMany({
      where: {
        id: { in: machineIds },
        isActive: true,
      },
      select: { id: true, name: true, location: true },
    })

    if (machines.length === 0) {
      return NextResponse.json({ error: 'Nenhuma máquina ativa encontrada' }, { status: 404 })
    }

    // Gerar QR codes para todas as máquinas
    const qrCodes = []
    const qrEvents = []

    for (const machine of machines) {
      const qrData = generateSecureQR(machine.id, ADMIN_QR_TTL_SECONDS)
      const payload = JSON.parse(Buffer.from(qrData.payload, 'base64url').toString())
      const expiresAt = new Date(payload.timestamp + payload.expiresIn * 1000)

      qrCodes.push({
        machineId: machine.id,
        machineName: machine.name,
        location: machine.location,
        qrData: qrData.fullQR,
        expiresAt: expiresAt.toISOString(),
      })

      qrEvents.push({
        machineId: machine.id,
        qrData: qrData.fullQR,
        nonce: payload.nonce,
        expiresAt,
        used: false,
      })
    }

    // Registrar eventos em lote
    await prisma.qrEvent.createMany({
      data: qrEvents,
    })

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'GENERATE_QR_BATCH',
        resource: 'MACHINE',
        details: `QR codes gerados para ${machines.length} máquinas`,
      },
    })

    console.log(`🔐 [QR] ${qrCodes.length} QR codes gerados em lote`)

    return NextResponse.json({
      success: true,
      qrCodes,
      count: qrCodes.length,
      expiresIn: ADMIN_QR_TTL_SECONDS,
    })
  } catch (error: unknown) {
    console.error('Erro ao gerar QR codes em lote:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
