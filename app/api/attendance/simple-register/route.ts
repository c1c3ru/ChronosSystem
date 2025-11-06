import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateSecureQR, generateRecordHash } from '@/lib/qr-security'

// POST /api/attendance/simple-register - Registrar ponto com QR simples ou seguro
export const dynamic = 'force-dynamic'

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

    console.log('🔍 [SIMPLE] Processando QR code:', qrData.substring(0, 50) + '...')

    let machineId: string

    // Tentar validar como QR seguro primeiro
    const secureValidation = validateSecureQR(qrData)
    
    if (secureValidation.isValid && secureValidation.payload) {
      console.log('✅ [SIMPLE] QR seguro válido')
      machineId = secureValidation.payload.machineId
    } else {
      console.log('⚠️ [SIMPLE] QR não é seguro, tentando como texto simples...')
      
      // Tentar como JSON simples
      try {
        const qrJson = JSON.parse(qrData)
        machineId = qrJson.machineId || qrJson.id
        
        if (!machineId) {
          throw new Error('machineId não encontrado no JSON')
        }
        
        console.log('📝 [SIMPLE] QR JSON simples aceito, machineId:', machineId)
      } catch {
        // Usar como texto direto (ID da máquina)
        machineId = qrData.trim()
        console.log('📝 [SIMPLE] QR como texto direto, machineId:', machineId)
      }
    }

    // Verificar se a máquina existe e está ativa
    const machine = await prisma.machine.findFirst({
      where: {
        id: machineId,
        isActive: true
      }
    })

    if (!machine) {
      return NextResponse.json({ 
        error: `Máquina '${machineId}' não encontrada ou inativa` 
      }, { status: 400 })
    }

    console.log('🏢 [SIMPLE] Máquina encontrada:', machine.name, '-', machine.location)

    // Determinar tipo de registro (entrada ou saída)
    const lastRecord = await prisma.attendanceRecord.findFirst({
      where: { userId: session.user.id },
      orderBy: { timestamp: 'desc' }
    })

    const recordType = (!lastRecord || lastRecord.type === 'EXIT') ? 'ENTRY' : 'EXIT'

    // Verificar se não há registro duplicado no mesmo minuto
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

    // Criar hash para integridade
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

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'SIMPLE_QR_ATTENDANCE',
        resource: 'ATTENDANCE_RECORD',
        details: `Registro de ${recordType} via QR simples na máquina ${machine.name}`
      }
    })

    const recordTime = attendanceRecord.timestamp.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })

    console.log(`✅ [SIMPLE] ${recordType} registrada para ${session.user.email} às ${recordTime}`)

    return NextResponse.json({
      success: true,
      record: {
        id: attendanceRecord.id,
        type: recordType,
        timestamp: attendanceRecord.timestamp,
        time: recordTime,
        location: machine.location,
        machineName: machine.name
      },
      message: `${recordType === 'ENTRY' ? 'Entrada' : 'Saída'} registrada com sucesso às ${recordTime}!`
    })

  } catch (error) {
    console.error('❌ [SIMPLE] Erro ao processar registro:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
