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
      expiresAt = new Date(payload.timestamp + (payload.expiresIn * 1000))
      
      console.log('✅ [KIOSK] QR code gerado:', {
        machineId,
        nonce: nonce.substring(0, 8) + '...',
        expiresAt: expiresAt.toISOString(),
        expiresIn: payload.expiresIn
      })
    } catch (decodeError: any) {
      console.error('❌ [KIOSK] Erro ao decodificar payload do QR:', decodeError)
      throw new Error(`Erro ao gerar QR code: ${decodeError.message}`)
    }
    
    // Salvar evento QR no banco para auditoria
    await prisma.qrEvent.create({
      data: {
        machineId,
        qrData: secureQR.fullQR,
        nonce,
        expiresAt,
        used: false
      }
    })

    console.log('✅ [KIOSK] QR code seguro gerado e salvo no banco')
    
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
        version: 'v1'
      }
    })
  } catch (error: any) {
    console.error('❌ [KIOSK] Erro ao gerar QR code:', error)
    
    // Verificar se é erro de QR_SECRET
    if (error.message && error.message.includes('QR_SECRET')) {
      return NextResponse.json({ 
        error: 'Erro de configuração: QR_SECRET não está configurado no servidor',
        details: error.message
      }, { status: 500 })
    }
    
    throw error
  }
}
