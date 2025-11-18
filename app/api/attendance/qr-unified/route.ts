import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateSecureQR, generateRecordHash } from '@/lib/qr-security'
import { rateLimiters } from '@/lib/rate-limit'
import { apiLogger } from '@/lib/logger'
import { determineRecordType, getUserWorkingHours, validateRecord, isWeekend } from '@/lib/attendance-logic'
import { getNowInFortaleza } from '@/lib/timezone'

/**
 * API UNIFICADA PARA QR CODES
 * 
 * Esta API substitui e consolida:
 * - /api/attendance/qr-scan (QR seguro com HMAC)
 * - /api/qr/validate (JSON simples)
 * - /api/attendance/simple-register (híbrido)
 * 
 * Suporta automaticamente:
 * ✅ QR codes seguros (HMAC-SHA256)
 * ✅ QR codes JSON simples
 * ✅ QR codes texto direto (ID da máquina)
 * ✅ Análise inteligente de tipo de registro
 * ✅ Rate limiting
 * ✅ Validação robusta
 * ✅ Hash chain para integridade
 * ✅ Auditoria completa
 */

// Force dynamic rendering
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
        retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        code: 'RATE_LIMIT_EXCEEDED'
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
      return NextResponse.json({ 
        error: 'Não autenticado',
        code: 'UNAUTHORIZED'
      }, { status: 401 })
    }

    const { qrData, location } = await request.json()

    if (!qrData) {
      return NextResponse.json({ 
        error: 'QR code é obrigatório',
        code: 'MISSING_QR_DATA'
      }, { status: 400 })
    }

    console.log('🔍 [QR-UNIFIED] Processando QR code para usuário:', session.user.email)
    console.log('🔍 [QR-UNIFIED] QR data preview:', qrData.substring(0, 50) + '...')

    let machineId: string
    let isSecureQR = false
    let qrEvent: any = null

    // ESTRATÉGIA 1: Tentar validar como QR seguro (HMAC-SHA256)
    const secureValidation = validateSecureQR(qrData)
    
    if (secureValidation.isValid && secureValidation.payload) {
      console.log('✅ [QR-UNIFIED] QR seguro detectado e válido')
      isSecureQR = true
      machineId = secureValidation.payload.machineId
      const { nonce, timestamp, expiresIn } = secureValidation.payload

      console.log('🔐 [QR-UNIFIED] QR seguro - Máquina:', machineId, 'Nonce:', nonce.substring(0, 8) + '...', 'Expira em:', expiresIn, 'segundos')

      // Verificar se o QR code existe no banco e não foi usado
      qrEvent = await prisma.qrEvent.findUnique({
        where: { nonce },
        include: { machine: true }
      })

      if (!qrEvent) {
        console.log('❌ [QR-UNIFIED] QR seguro não encontrado no banco:', nonce.substring(0, 8) + '...')
        return NextResponse.json({ 
          error: 'QR code não encontrado. Pode ter expirado ou ser inválido.',
          code: 'QR_NOT_FOUND'
        }, { status: 404 })
      }

      // Verificar se a máquina do QR corresponde à máquina esperada
      if (qrEvent.machineId !== machineId) {
        console.log('❌ [QR-UNIFIED] QR seguro inválido para esta máquina:', machineId, 'vs', qrEvent.machineId)
        return NextResponse.json({ 
          error: 'QR code inválido para esta máquina',
          code: 'INVALID_MACHINE'
        }, { status: 400 })
      }

      // Verificar se já foi usado
      if (qrEvent.used) {
        console.log('❌ [QR-UNIFIED] QR seguro já foi usado:', nonce.substring(0, 8) + '...')
        return NextResponse.json({ 
          error: 'QR code já foi utilizado. Gere um novo QR code.',
          code: 'QR_ALREADY_USED'
        }, { status: 400 })
      }

      // Verificar se expirou
      const currentTime = new Date()
      if (currentTime > qrEvent.expiresAt) {
        console.log('❌ [QR-UNIFIED] QR seguro expirado:', nonce.substring(0, 8) + '...', 'Expiração:', qrEvent.expiresAt.toISOString())
        return NextResponse.json({ 
          error: 'QR code expirado. Gere um novo QR code.',
          code: 'QR_EXPIRED'
        }, { status: 400 })
      }

      // Verificar se a máquina está ativa
      if (!qrEvent.machine.isActive) {
        console.log('❌ [QR-UNIFIED] Máquina inativa (QR seguro):', machineId)
        return NextResponse.json({ 
          error: 'Máquina não está ativa',
          code: 'MACHINE_INACTIVE'
        }, { status: 400 })
      }

    } else {
      console.log('⚠️ [QR-UNIFIED] QR não é seguro, tentando formatos alternativos...')
      
      // ESTRATÉGIA 2: Tentar como JSON simples
      try {
        const qrJson = JSON.parse(qrData)
        machineId = qrJson.machineId || qrJson.id
        
        if (!machineId) {
          throw new Error('machineId não encontrado no JSON')
        }
        
        // Sanitizar machineId
        machineId = String(machineId).trim()
        
        console.log('📝 [QR-UNIFIED] QR JSON simples aceito, machineId:', machineId)
        
        // Para QR JSON, verificar se tem expiração
        if (qrJson.expires && Date.now() > qrJson.expires) {
          return NextResponse.json({ 
            error: 'QR code expirado',
            code: 'QR_EXPIRED'
          }, { status: 400 })
        }
        
        // Se tem nonce, verificar no banco
        if (qrJson.nonce) {
          qrEvent = await prisma.qrEvent.findUnique({
            where: { nonce: qrJson.nonce },
            include: { machine: true }
          })
          
          if (qrEvent && qrEvent.used) {
            return NextResponse.json({ 
              error: 'QR code já foi utilizado',
              code: 'QR_ALREADY_USED'
            }, { status: 400 })
          }
        }
        
      } catch {
        // ESTRATÉGIA 3: Usar como texto direto (ID da máquina)
        machineId = qrData.trim()
        
        // Validar se machineId não está vazio após trim
        if (!machineId || machineId.length === 0) {
          console.log('❌ [QR-UNIFIED] QR code vazio após processamento')
          return NextResponse.json({ 
            error: 'QR code inválido ou vazio',
            code: 'INVALID_QR_DATA'
          }, { status: 400 })
        }
        
        console.log('📝 [QR-UNIFIED] QR como texto direto, machineId:', machineId)
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
      console.log('❌ [QR-UNIFIED] Máquina não encontrada ou inativa:', machineId)
      
      // Verificar se a máquina existe mas está inativa
      const inactiveMachine = await prisma.machine.findFirst({
        where: { id: machineId }
      })
      
      if (inactiveMachine && !inactiveMachine.isActive) {
        return NextResponse.json({ 
          error: `Máquina '${inactiveMachine.name}' está inativa. Contate o administrador.`,
          code: 'MACHINE_INACTIVE'
        }, { status: 400 })
      }
      
      // Máquina não existe
      return NextResponse.json({ 
        error: 'Máquina não encontrada. Verifique se o QR code está correto.',
        code: 'MACHINE_NOT_FOUND'
      }, { status: 404 })
    }

    console.log('🏢 [QR-UNIFIED] Máquina encontrada:', machine.name, '-', machine.location)

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

    console.log('🧠 [QR-UNIFIED] Análise inteligente:', {
      qrType: isSecureQR ? 'SECURE' : 'SIMPLE',
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
        warnings: validation.warnings,
        code: 'VALIDATION_FAILED'
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
        error: `Registro de ${recordType === 'ENTRY' ? 'entrada' : 'saída'} já feito recentemente. Aguarde 1 minuto.`,
        code: 'DUPLICATE_RECORD'
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
        timestamp: getNowInFortaleza(),
        qrData: qrData,
        hash: recordHash,
        prevHash: lastRecord?.hash,
        latitude: location?.latitude,
        longitude: location?.longitude
      },
      include: {
        machine: {
          select: {
            name: true,
            location: true
          }
        }
      }
    })

    // Para QR seguro, marcar nonce como usado
    if (isSecureQR && qrEvent) {
      // Marcar QR como usado no banco para auditoria
      await prisma.qrEvent.update({
        where: { id: qrEvent.id },
        data: { 
          used: true,
          usedAt: new Date(),
          usedBy: session.user.id
        }
      })
      
      console.log('✅ [QR-UNIFIED] QR seguro marcado como usado no banco')
    }

    // Para QR JSON com nonce, marcar como usado
    if (!isSecureQR && qrEvent) {
      await prisma.qrEvent.update({
        where: { id: qrEvent.id },
        data: { 
          used: true,
          usedAt: new Date(),
          usedBy: session.user.id
        }
      })
    }

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'QR_UNIFIED_ATTENDANCE',
        resource: 'ATTENDANCE_RECORD',
        details: `Registro de ${recordType} via QR ${isSecureQR ? 'seguro' : 'simples'} na máquina ${machine.name}`
      }
    })

    const recordTime = attendanceRecord.timestamp.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })

    console.log(`✅ [QR-UNIFIED] ${recordType} registrada para ${session.user.email} às ${recordTime} (${isSecureQR ? 'QR Seguro' : 'QR Simples'})`)

    // Resposta unificada
    const typeLabel = recordType === 'ENTRY' ? 'Entrada' : 'Saída'
    const typeIcon = recordType === 'ENTRY' ? 'login' : 'logout'
    
    return NextResponse.json({
      success: true,
      record: {
        id: attendanceRecord.id,
        type: recordType,
        typeLabel: typeLabel,
        typeIcon: typeIcon,
        timestamp: attendanceRecord.timestamp,
        time: recordTime,
        location: machine.location,
        machineName: machine.name
      },
      qrType: isSecureQR ? 'SECURE' : 'SIMPLE',
      analysis: {
        reason: attendanceAnalysis.reason,
        confidence: attendanceAnalysis.confidence,
        suggestions: attendanceAnalysis.suggestions || [],
        warnings: validation.warnings
      },
      machine: {
        name: machine.name,
        location: machine.location
      },
      message: `${typeLabel} registrada com sucesso às ${recordTime}!`,
      smartMessage: `${typeLabel} detectada: ${attendanceAnalysis.reason}`,
      displayMessage: `${typeLabel} às ${recordTime}\nMáquina: ${machine.name}`
    })

  } catch (error: any) {
    console.error('❌ [QR-UNIFIED] Erro ao processar QR scan:', error)
    
    apiLogger.error('QR scan processing error', {
      error: error.message,
      stack: error.stack,
      userId: (await getServerSession(authOptions))?.user?.id
    })
    
    // Verificar se é erro de QR_SECRET
    if (error.message && error.message.includes('QR_SECRET')) {
      return NextResponse.json({ 
        error: 'Erro de configuração do servidor: QR_SECRET não está configurado',
        code: 'SERVER_CONFIG_ERROR'
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}
