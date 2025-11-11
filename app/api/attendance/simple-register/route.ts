import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateSecureQR, generateRecordHash } from '@/lib/qr-security'
import { rateLimiters } from '@/lib/rate-limit'
import { apiLogger } from '@/lib/logger'
import { determineRecordType, getUserWorkingHours, validateRecord, isWeekend } from '@/lib/attendance-logic'

// POST /api/attendance/simple-register - Registrar ponto com QR simples ou seguro
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // Aplicar rate limiting
  const rateLimitResult = rateLimiters.qrScan(request)
  if (!rateLimitResult.success) {
    apiLogger.warn('Rate limit exceeded for QR scan', {
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      remaining: rateLimitResult.remaining
    })
    
    return new Response(
      JSON.stringify({
        error: 'Muitas tentativas. Tente novamente em alguns segundos.',
        retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString()
        }
      }
    )
  }

  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      apiLogger.warn('Unauthorized QR scan attempt', {
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      })
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

    // Buscar último registro para análise inteligente
    const lastRecord = await prisma.attendanceRecord.findFirst({
      where: { userId: session.user.id },
      orderBy: { timestamp: 'desc' }
    })

    // Obter horários de trabalho do usuário
    const workingHours = await getUserWorkingHours(session.user.id)
    const currentTime = new Date()

    // Usar lógica inteligente para determinar tipo de registro
    const attendanceAnalysis = determineRecordType({
      userId: session.user.id,
      currentTime,
      lastRecord: lastRecord ? {
        type: lastRecord.type as 'ENTRY' | 'EXIT',
        timestamp: lastRecord.timestamp
      } : null,
      workingHours,
      isWeekend: isWeekend(currentTime)
    })

    const recordType = attendanceAnalysis.type

    // Validar se o registro faz sentido
    const validation = validateRecord({
      userId: session.user.id,
      currentTime,
      lastRecord: lastRecord ? {
        type: lastRecord.type as 'ENTRY' | 'EXIT',
        timestamp: lastRecord.timestamp
      } : null,
      workingHours,
      isWeekend: isWeekend(currentTime)
    }, recordType)

    console.log('🧠 [SMART] Análise inteligente:', {
      suggestedType: recordType,
      reason: attendanceAnalysis.reason,
      confidence: attendanceAnalysis.confidence,
      warnings: validation.warnings,
      errors: validation.errors
    })

    // Se há erros críticos, bloquear registro
    if (!validation.isValid) {
      return NextResponse.json({ 
        error: `Registro bloqueado: ${validation.errors.join(', ')}`,
        warnings: validation.warnings
      }, { status: 400 })
    }

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
      analysis: {
        reason: attendanceAnalysis.reason,
        confidence: attendanceAnalysis.confidence,
        suggestions: attendanceAnalysis.suggestions || [],
        warnings: validation.warnings
      },
      message: `${recordType === 'ENTRY' ? 'Entrada' : 'Saída'} registrada com sucesso às ${recordTime}!`,
      smartMessage: `${recordType === 'ENTRY' ? 'Entrada' : 'Saída'} detectada: ${attendanceAnalysis.reason}`
    })

  } catch (error) {
    console.error('❌ [SIMPLE] Erro ao processar registro:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
