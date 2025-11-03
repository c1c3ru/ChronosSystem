import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSecureQR } from '@/lib/qr-security'

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
  console.log('🔐 Gerando QR code seguro para máquina:', machineId)
  
  // Gerar QR code seguro com HMAC-SHA256
  const secureQR = generateSecureQR(machineId)
  
  // Calcular tempo de expiração
  const expiresAt = new Date(Date.now() + 60 * 1000)
  
  // Salvar evento QR no banco para auditoria
  await prisma.qrEvent.create({
    data: {
      machineId,
      qrData: secureQR.fullQR,
      nonce: JSON.parse(Buffer.from(secureQR.payload, 'base64url').toString()).nonce,
      expiresAt,
      used: false
    }
  })

  console.log('✅ QR code seguro gerado com sucesso')

  return NextResponse.json({
    qrData: secureQR.fullQR,
    machineId,
    machineName,
    location,
    expiresAt: expiresAt.toISOString(),
    validFor: 60, // 60 segundos
    security: {
      signed: true,
      algorithm: 'HMAC-SHA256',
      version: 'v1'
    }
  })
}
