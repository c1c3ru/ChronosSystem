import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSecureQR } from '@/lib/qr-security'
import { qrLogger } from '@/lib/logger'

// GET /api/kiosk/qr - Gerar QR code para kiosk (sem autenticação)
export async function GET(request: NextRequest) {
  try {
    qrLogger.debug('Kiosk QR API called')

    // Obter machineId do query param ou usar a primeira máquina ativa
    const { searchParams } = new URL(request.url)
    const machineId = searchParams.get('machineId')

    let machine

    if (machineId) {
      // Se machineId foi fornecido, usar essa máquina
      machine = await prisma.machine.findUnique({
        where: { id: machineId },
      })

      if (!machine || !machine.isActive) {
        return NextResponse.json({ error: 'Máquina não encontrada ou inativa' }, { status: 404 })
      }
    } else {
      // Caso contrário, usar a primeira máquina ativa
      machine = await prisma.machine.findFirst({
        where: { isActive: true },
      })

      if (!machine) {
        return NextResponse.json(
          { error: 'Nenhuma máquina disponível. Configure máquinas no painel admin.' },
          { status: 404 }
        )
      }
    }

    return generateQRResponse(machine.id, machine.name, machine.location)
  } catch (error: any) {
    qrLogger.error('Error generating kiosk QR code', { error: error.message })
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

async function generateQRResponse(machineId: string, machineName: string, location: string) {
  qrLogger.debug('Generating secure QR for machine', { machineId })

  try {
    // Gerar QR code seguro com HMAC-SHA256 (60 segundos de expiração)
    const secureQR = generateSecureQR(machineId, 60)

    // Extrair nonce do payload de forma segura
    let nonce: string
    let payload: any
    let expiresAt: Date

    try {
      // Decodificar payload
      const payloadJson = Buffer.from(secureQR.payload, 'base64url').toString('utf8')
      payload = JSON.parse(payloadJson)

      // Validar payload
      if (!payload.nonce) {
        throw new Error('Nonce não encontrado no payload')
      }
      if (!payload.timestamp) {
        throw new Error('Timestamp não encontrado no payload')
      }
      if (!payload.expiresIn) {
        throw new Error('expiresIn não encontrado no payload')
      }

      nonce = payload.nonce

      // Calcular tempo de expiração baseado no payload
      expiresAt = new Date(payload.timestamp + payload.expiresIn * 1000)

      qrLogger.debug('QR code generated', {
        machineId,
        expiresIn: payload.expiresIn,
      })
    } catch (decodeError: any) {
      qrLogger.error('Error decoding QR payload', { error: decodeError.message })
      throw new Error(`Erro ao gerar QR code: ${decodeError.message}`)
    }

    // Salvar evento QR no banco para auditoria
    await prisma.qrEvent.create({
      data: {
        machineId,
        qrData: secureQR.fullQR,
        nonce,
        expiresAt,
        used: false,
      },
    })

    qrLogger.debug('Secure QR saved to database', { machineId })

    return NextResponse.json({
      qrData: secureQR.fullQR,
      machineId,
      machineName,
      location,
      expiresAt: expiresAt.toISOString(),
      validFor: payload.expiresIn, // Usar expiresIn do payload
      security: {
        signed: true,
        algorithm: 'HMAC-SHA256',
        version: 'v1',
      },
    })
  } catch (error: any) {
    qrLogger.error('Error generating QR code', { error: error.message })

    // Verificar se é erro de QR_SECRET
    if (error.message && error.message.includes('QR_SECRET')) {
      return NextResponse.json(
        {
          error: 'Erro de configuração: QR_SECRET não está configurado no servidor',
          details: error.message,
        },
        { status: 500 }
      )
    }

    throw error
  }
}
