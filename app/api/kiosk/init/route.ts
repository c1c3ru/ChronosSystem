import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { qrLogger } from '@/lib/logger'
import crypto from 'crypto'

function isProvisionSecretValid(request: NextRequest): boolean {
  const provisionSecret = process.env.KIOSK_PROVISION_SECRET
  if (!provisionSecret) {
    throw new Error('KIOSK_PROVISION_SECRET environment variable is required')
  }

  const providedSecret = request.headers.get('x-kiosk-secret') || ''
  const expectedBuffer = Buffer.from(provisionSecret)
  const providedBuffer = Buffer.from(providedSecret)

  return (
    expectedBuffer.length === providedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, providedBuffer)
  )
}

export async function GET(request: NextRequest) {
  try {
    if (!isProvisionSecretValid(request)) {
      qrLogger.security('Rejected unauthenticated kiosk init attempt', {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
      })
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const machineId = searchParams.get('machineId')

    let machine

    if (machineId) {
      machine = await prisma.machine.findUnique({
        where: { id: machineId },
      })
    } else {
      machine = await prisma.machine.findFirst({
        where: { isActive: true },
      })
    }

    if (!machine || !machine.isActive) {
      return NextResponse.json({ error: 'Máquina não encontrada ou inativa' }, { status: 404 })
    }

    const qrSecret = process.env.QR_SECRET
    if (!qrSecret) {
      throw new Error('QR_SECRET environment variable is required')
    }

    // Derivar uma semente mestra (machineSecret) única para esta máquina
    const machineSecret = crypto.createHmac('sha256', qrSecret).update(machine.id).digest('hex')

    qrLogger.info('Kiosk initialized with client-side secret', {
      machineId: machine.id,
    })

    return NextResponse.json({
      machineId: machine.id,
      machineName: machine.name,
      location: machine.location,
      machineSecret, // Semente Mestra para o algoritmo TOTP Client-Side
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    qrLogger.error('Error initializing kiosk', { error: errorMessage })
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
