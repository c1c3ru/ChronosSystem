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
  // Aplicar rate limiting (async)
  const rateLimitResult = await rateLimiters.qrScan(request)
  if (!rateLimitResult.success) {
    const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000)

    apiLogger.warn('Rate limit exceeded for QR scan', {
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      remaining: rateLimitResult.remaining,
      retryAfter
    })

    return new Response(
      JSON.stringify({
        error: 'Muitas tentativas. Tente novamente em alguns segundos.',
        retryAfter,
        code: 'RATE_LIMIT_EXCEEDED'
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          'Retry-After': retryAfter.toString()
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

    const { qrData, location, justification } = await request.json()

    if (!qrData) {
      return NextResponse.json({
        error: 'QR code é obrigatório',
        code: 'MISSING_QR_DATA'
      }, { status: 400 })
    }

    apiLogger.debug('Processing QR code', {
      userId: session.user.id,
      qrPreview: qrData.substring(0, 20) + '...'
    })

    let machineId: string
    let isSecureQR = false
    let qrEvent: any = null

    // ESTRATÉGIA 1: Tentar validar como QR seguro (HMAC-SHA256)
    const secureValidation = validateSecureQR(qrData)

    if (secureValidation.isValid && secureValidation.payload) {
      apiLogger.debug('Secure QR detected and valid', {
        machineId: secureValidation.payload.machineId,
        expiresIn: secureValidation.payload.expiresIn
      })
      isSecureQR = true
      machineId = secureValidation.payload.machineId
      const { nonce, timestamp, expiresIn } = secureValidation.payload

      // Verificar se o QR code existe no banco e não foi usado
      qrEvent = await prisma.qrEvent.findUnique({
        where: { nonce },
        include: { machine: true }
      })

      if (!qrEvent) {
        apiLogger.warn('Secure QR not found in database', { userId: session.user.id })
        return NextResponse.json({
          error: 'QR code não encontrado. Pode ter expirado ou ser inválido.',
          code: 'QR_NOT_FOUND'
        }, { status: 404 })
      }

      // Verificar se a máquina do QR corresponde à máquina esperada
      if (qrEvent.machineId !== machineId) {
        apiLogger.warn('QR machine mismatch', { expected: machineId, actual: qrEvent.machineId })
        return NextResponse.json({
          error: 'QR code inválido para esta máquina',
          code: 'INVALID_MACHINE'
        }, { status: 400 })
      }

      // Verificar se já foi usado
      if (qrEvent.used) {
        apiLogger.warn('QR already used', { userId: session.user.id })
        return NextResponse.json({
          error: 'QR code já foi utilizado. Gere um novo QR code.',
          code: 'QR_ALREADY_USED'
        }, { status: 400 })
      }

      // Verificar se expirou
      const currentTime = new Date()
      if (currentTime > qrEvent.expiresAt) {
        apiLogger.warn('QR expired', { expiresAt: qrEvent.expiresAt.toISOString() })
        return NextResponse.json({
          error: 'QR code expirado. Gere um novo QR code.',
          code: 'QR_EXPIRED'
        }, { status: 400 })
      }

      // Verificar se a máquina está ativa
      if (!qrEvent.machine.isActive) {
        apiLogger.warn('Machine inactive', { machineId })
        return NextResponse.json({
          error: 'Máquina não está ativa',
          code: 'MACHINE_INACTIVE'
        }, { status: 400 })
      }

    } else {
      apiLogger.debug('QR not secure, trying alternative formats')

      // ESTRATÉGIA 2: Tentar como JSON simples
      try {
        const qrJson = JSON.parse(qrData)
        machineId = qrJson.machineId || qrJson.id

        if (!machineId) {
          throw new Error('machineId não encontrado no JSON')
        }

        // Sanitizar machineId
        machineId = String(machineId).trim()

        apiLogger.debug('Simple JSON QR accepted', { machineId })

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
          apiLogger.warn('Empty QR code after processing')
          return NextResponse.json({
            error: 'QR code inválido ou vazio',
            code: 'INVALID_QR_DATA'
          }, { status: 400 })
        }

        apiLogger.debug('Direct text QR', { machineId })
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
      apiLogger.warn('Machine not found or inactive', { machineId })

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

    apiLogger.debug('Machine found', { machineName: machine.name, location: machine.location })

    // Buscar último registro para análise inteligente
    const lastRecord = await prisma.attendanceRecord.findFirst({
      where: { userId: session.user.id },
      orderBy: { timestamp: 'desc' }
    })

    // Obter horários de trabalho do usuário
    const workingHours = await getUserWorkingHours(session.user.id)
    const currentTime = new Date()

    // Verificar se há autorização especial para hoje (trabalho em feriado/fim de semana)
    const todayStart = new Date(currentTime)
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date(currentTime)
    todayEnd.setHours(23, 59, 59, 999)

    const specialAuthorization = await prisma.justification.findFirst({
      where: {
        userId: session.user.id,
        date: {
          gte: todayStart,
          lte: todayEnd
        },
        type: 'EXTRA_WORK',
        status: 'APPROVED'
      }
    })

    const hasAuthorization = !!specialAuthorization

    if (hasAuthorization) {
      apiLogger.info('Special authorization found for user', { userId: session.user.id, date: currentTime.toISOString() })
    }

    // Usar lógica inteligente para determinar tipo de registro
    const attendanceAnalysis = determineRecordType({
      userId: session.user.id,
      currentTime,
      lastRecord: lastRecord ? {
        type: lastRecord.type as 'ENTRY' | 'EXIT',
        timestamp: lastRecord.timestamp
      } : null,
      workingHours,
      isWeekend: isWeekend(currentTime),
      hasAuthorization
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
      isWeekend: isWeekend(currentTime),
      hasAuthorization
    }, recordType)

    apiLogger.debug('Intelligent analysis', {
      qrType: isSecureQR ? 'SECURE' : 'SIMPLE',
      suggestedType: recordType,
      reason: attendanceAnalysis.reason,
      confidence: attendanceAnalysis.confidence,
      warnings: validation.warnings.length,
      errors: validation.errors.length
    })

    // Se há erros críticos, bloquear registro
    if (!validation.isValid) {
      return NextResponse.json({
        error: `Registro bloqueado: ${validation.errors.join(', ')}`,
        warnings: validation.warnings,
        code: 'VALIDATION_FAILED'
      }, { status: 400 })
    }

    // Verificar se não há registro duplicado no mesmo minuto (qualquer tipo)
    const now = Date.now()
    const oneMinuteAgo = new Date(now - 60 * 1000)
    const recentRecord = await prisma.attendanceRecord.findFirst({
      where: {
        userId: session.user.id,
        timestamp: {
          gte: oneMinuteAgo
        }
        // Removido filtro 'type' para bloquear QUALQUER registro recente
      }
    })

    if (recentRecord) {
      const recordTypeLabel = recentRecord.type === 'ENTRY' ? 'entrada' : 'saída'
      return NextResponse.json({
        error: `Você já registrou ${recordTypeLabel} recentemente. Aguarde 1 minuto entre registros.`,
        code: 'DUPLICATE_RECORD',
        lastRecord: {
          type: recentRecord.type,
          time: recentRecord.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }
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
        longitude: location?.longitude,
        justification: justification || null // Adicionar justificativa se fornecida
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

      apiLogger.debug('Secure QR marked as used')
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

    apiLogger.audit('ATTENDANCE_RECORDED', 'ATTENDANCE_RECORD', {
      userId: session.user.id,
      recordType,
      time: recordTime,
      qrType: isSecureQR ? 'SECURE' : 'SIMPLE'
    })

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
    // Error already logged by apiLogger below

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
