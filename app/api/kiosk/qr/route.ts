import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// GET /api/kiosk/qr - Gerar QR code para kiosk (sem autenticação)
export async function GET(request: NextRequest) {
  try {
    console.log('Kiosk QR API called')
    // Para o kiosk, vamos usar uma máquina padrão ou a primeira disponível
    const machine = await prisma.machine.findFirst({
      where: { isActive: true }
    })

    if (!machine) {
      // Se não houver máquina, criar uma padrão
      const defaultMachine = await prisma.machine.create({
        data: {
          name: 'Kiosk Principal',
          location: 'Entrada Principal',
          isActive: true
        }
      })
      
      return generateQRResponse(defaultMachine.id, defaultMachine.name, defaultMachine.location)
    }

    return generateQRResponse(machine.id, machine.name, machine.location)
  } catch (error) {
    console.error('Erro ao gerar QR code do kiosk:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

async function generateQRResponse(machineId: string, machineName: string, location: string) {
  // Gerar nonce único baseado em timestamp + random para garantir unicidade
  const timestamp = Date.now()
  const nonce = crypto.randomBytes(16).toString('hex') + '-' + timestamp
  
  // Criar dados do QR (válido por 60 segundos)
  const expiresAt = new Date(timestamp + 60 * 1000)
  
  // Dados que serão codificados no QR
  const qrData = JSON.stringify({
    machineId,
    nonce,
    timestamp,
    expires: expiresAt.getTime(),
    type: 'KIOSK_QR'
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

  return NextResponse.json({
    qrData,
    machineId,
    machineName,
    location,
    expiresAt: expiresAt.toISOString(),
    validFor: 60 // 60 segundos
  })
}
