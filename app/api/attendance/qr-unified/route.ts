import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { validateClientSecureQR, generateRecordHash } from '@/lib/qr-security'
import { rateLimiters } from '@/lib/rate-limit'
import { apiLogger } from '@/lib/logger'
import {
  determineRecordType,
  getUserWorkingHours,
  validateRecord,
  isWeekend,
} from '@/lib/attendance-logic'
import { getNowInFortaleza } from '@/lib/timezone'
import { updateHourBalance } from '@/lib/hour-calculator'

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
 * ❌ QR codes JSON simples (Desabilitado por segurança)
 * ❌ QR codes texto direto (Desabilitado por segurança)
 * ✅ Análise inteligente de tipo de registro
 * ✅ Rate limiting
 * ✅ Validação robusta
 * ✅ Hash chain para integridade
 * ✅ Auditoria completa
 */

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      apiLogger.warn('Unauthorized QR scan attempt', {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
      })
      return NextResponse.json(
        {
          error: 'Não autenticado',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      )
    }

    // Rate limit por IP + usuário (evita bloquear toda rede atrás do mesmo NAT)
    const rateLimitResult = await rateLimiters.qrScanUser(request, session.user.id)
    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000)

      apiLogger.warn('Rate limit exceeded for QR scan', {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userId: session.user.id,
        remaining: rateLimitResult.remaining,
        retryAfter,
      })

      return new Response(
        JSON.stringify({
          error: `Muitas tentativas. Tente novamente em ${Math.max(1, retryAfter)} segundos.`,
          retryAfter,
          code: 'RATE_LIMIT_EXCEEDED',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
            'Retry-After': retryAfter.toString(),
          },
        }
      )
    }

    const { qrData, location, justification } = await request.json()

    if (!qrData) {
      return NextResponse.json(
        {
          error: 'QR code é obrigatório',
          code: 'MISSING_QR_DATA',
        },
        { status: 400 }
      )
    }

    apiLogger.debug('Processing QR code', {
      userId: session.user.id,
      qrPreview: qrData.substring(0, 20) + '...',
    })

    let isSecureQR = false
    let qrEvent: Prisma.QrEventGetPayload<{ include: { machine: true } }> | null = null

    // ESTRATÉGIA ÚNICA E SEGURA: Validar como QR seguro TOTP Client-Side (HMAC-SHA256)
    const secureValidation = validateClientSecureQR(qrData)

    if (!secureValidation.isValid || !secureValidation.payload) {
      apiLogger.security('Insecure or invalid QR format attempted', {
        userId: session.user.id,
        error: secureValidation.error,
      })

      return NextResponse.json(
        {
          error:
            'Este sistema exige QR codes criptografados e seguros. O formato detectado não é aceito.',
          code: 'INSECURE_QR_FORMAT',
          details: secureValidation.error,
        },
        { status: 403 }
      )
    }

    apiLogger.debug('Secure QR detected', {
      machineId: secureValidation.payload.machineId,
      expiresIn: secureValidation.payload.expiresIn,
    })

    isSecureQR = true
    const machineId = secureValidation.payload.machineId
    const parts = qrData.split('.')
    const signatureNonce = parts[1]

    // Verificar se a máquina existe e está ativa
    const machine = await prisma.machine.findFirst({
      where: {
        id: machineId,
        isActive: true,
      },
    })

    if (!machine) {
      apiLogger.warn('Machine not found or inactive', { machineId })

      // Verificar se a máquina existe mas está inativa
      const inactiveMachine = await prisma.machine.findFirst({
        where: { id: machineId },
      })

      if (inactiveMachine && !inactiveMachine.isActive) {
        return NextResponse.json(
          {
            error: `Máquina '${inactiveMachine.name}' está inativa. Contate o administrador.`,
            code: 'MACHINE_INACTIVE',
          },
          { status: 400 }
        )
      }

      // Máquina não existe
      return NextResponse.json(
        {
          error: 'Máquina não encontrada. Verifique se o QR code está correto.',
          code: 'MACHINE_NOT_FOUND',
        },
        { status: 404 }
      )
    }

    // VERIFICAÇÃO ATÔMICA: Criar QrEvent para garantir que essa assinatura (nonce) não seja usada de novo
    // Como 'nonce' é único (@unique) no banco, se houver replay attack a tentativa de create falhará (P2002)
    try {
      await prisma.qrEvent.create({
        data: {
          machineId: machine.id,
          qrData: qrData,
          nonce: signatureNonce,
          expiresAt: new Date(Date.now() + 60 * 1000), // Mantido apenas por conformidade do schema
          used: true,
          usedAt: new Date(),
          usedBy: session.user.id,
        },
      })
    } catch (error: unknown) {
      apiLogger.warn('Replay attack detected or duplicate QR scan', {
        userId: session.user.id,
        nonce: signatureNonce,
      })

      return NextResponse.json(
        {
          error: 'Este QR code já foi utilizado. Aguarde a tela gerar um novo código.',
          code: 'QR_REPLAY_DETECTED',
        },
        { status: 400 }
      )
    }

    apiLogger.debug('Machine found', { machineName: machine.name, location: machine.location })

    // Buscar último registro para análise inteligente
    const lastRecord = await prisma.attendanceRecord.findFirst({
      where: { userId: session.user.id },
      orderBy: { timestamp: 'desc' },
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
          lte: todayEnd,
        },
        type: 'EXTRA_WORK',
        status: 'APPROVED',
      },
    })

    const hasAuthorization = !!specialAuthorization

    if (hasAuthorization) {
      apiLogger.info('Special authorization found for user', {
        userId: session.user.id,
        date: currentTime.toISOString(),
      })
    }

    // Usar lógica inteligente para determinar tipo de registro
    const attendanceAnalysis = determineRecordType({
      userId: session.user.id,
      currentTime,
      lastRecord: lastRecord
        ? {
            type: lastRecord.type as 'ENTRY' | 'EXIT',
            timestamp: lastRecord.timestamp,
          }
        : null,
      workingHours,
      isWeekend: isWeekend(currentTime),
      hasAuthorization,
    })

    const recordType = attendanceAnalysis.type

    // Validar se o registro faz sentido
    const validation = await validateRecord(
      {
        userId: session.user.id,
        currentTime,
        lastRecord: lastRecord
          ? {
              type: lastRecord.type as 'ENTRY' | 'EXIT',
              timestamp: lastRecord.timestamp,
            }
          : null,
        workingHours,
        isWeekend: isWeekend(currentTime),
        hasAuthorization,
      },
      recordType
    )

    apiLogger.debug('Intelligent analysis', {
      qrType: isSecureQR ? 'SECURE' : 'SIMPLE',
      suggestedType: recordType,
      reason: attendanceAnalysis.reason,
      confidence: attendanceAnalysis.confidence,
      warnings: validation.warnings.length,
      errors: validation.errors.length,
    })

    // Se há erros críticos, bloquear registro
    if (!validation.isValid) {
      const mensagemErro = validation.errors.join(', ')
      apiLogger.warn('Attendance validation failed', {
        userId: session.user.id,
        machineId,
        machineName: machine.name,
        errors: mensagemErro,
      })

      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'REJECTED_ATTENDANCE',
          resource: 'ATTENDANCE_RECORD',
          details: `Tentativa de ${recordType} rejeitada na máquina ${machine.name}. Motivo: ${mensagemErro}`,
        },
      })

      return NextResponse.json(
        {
          error: `Registro bloqueado: ${mensagemErro}`,
          warnings: validation.warnings,
          code: 'VALIDATION_FAILED',
        },
        { status: 400 }
      )
    }

    // Verificar se não há registro duplicado no mesmo minuto (qualquer tipo)
    const now = Date.now()
    const oneMinuteAgo = new Date(now - 60 * 1000)
    const recentRecord = await prisma.attendanceRecord.findFirst({
      where: {
        userId: session.user.id,
        timestamp: {
          gte: oneMinuteAgo,
        },
      },
    })

    if (recentRecord) {
      const recordTypeLabel = recentRecord.type === 'ENTRY' ? 'entrada' : 'saída'
      const mensagemDuplicada = `Você já registrou ${recordTypeLabel} recentemente. Aguarde 1 minuto entre registros.`

      apiLogger.warn('Duplicate attendance record attempt', {
        userId: session.user.id,
        machineId,
        machineName: machine.name,
        lastRecordType: recentRecord.type,
      })

      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'REJECTED_ATTENDANCE',
          resource: 'ATTENDANCE_RECORD',
          details: `Tentativa de ponto duplicado (${recordType}) na máquina ${machine.name}. Motivo: Já registrou ${recordTypeLabel} há menos de 1 minuto.`,
        },
      })

      return NextResponse.json(
        {
          error: mensagemDuplicada,
          code: 'DUPLICATE_RECORD',
          lastRecord: {
            type: recentRecord.type,
            time: recentRecord.timestamp.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        },
        { status: 400 }
      )
    }

    // Criar hash para integridade usando o último registro do próprio usuário
    const recordHash = generateRecordHash(
      session.user.id,
      machineId,
      recordType,
      currentTime.getTime(),
      lastRecord?.hash
    )

    // Criar registro de ponto
    const attendanceRecord = await prisma.attendanceRecord.create({
      data: {
        userId: session.user.id,
        machineId: machineId,
        type: recordType,
        timestamp: currentTime,
        qrData: qrData,
        hash: recordHash,
        prevHash: lastRecord?.hash,
        latitude: location?.latitude,
        longitude: location?.longitude,
        justification: justification || null, // Adicionar justificativa se fornecida
      },
      include: {
        machine: {
          select: {
            name: true,
            location: true,
          },
        },
      },
    })

    // Calcular saldo de horas após registro de ponto
    try {
      await updateHourBalance(session.user.id, attendanceRecord.timestamp)
      apiLogger.info('Saldo de horas atualizado via QR-Unified', { userId: session.user.id })
    } catch (hourError) {
      apiLogger.error('Erro ao calcular saldo de horas via QR-Unified', { error: hourError })
    }

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'QR_UNIFIED_ATTENDANCE',
        resource: 'ATTENDANCE_RECORD',
        details: `Registro de ${recordType} via QR ${isSecureQR ? 'seguro' : 'simples'} na máquina ${machine.name}`,
      },
    })

    const recordTime = attendanceRecord.timestamp.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })

    apiLogger.audit('ATTENDANCE_RECORDED', 'ATTENDANCE_RECORD', {
      userId: session.user.id,
      recordType,
      time: recordTime,
      qrType: isSecureQR ? 'SECURE' : 'SIMPLE',
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
        machineName: machine.name,
      },
      qrType: isSecureQR ? 'SECURE' : 'SIMPLE',
      analysis: {
        reason: attendanceAnalysis.reason,
        confidence: attendanceAnalysis.confidence,
        suggestions: (attendanceAnalysis as { suggestions?: string[] }).suggestions || [],
        warnings: validation.warnings,
      },
      machine: {
        name: machine.name,
        location: machine.location,
      },
      message: `${typeLabel} registrada com sucesso às ${recordTime}!`,
      smartMessage: `${typeLabel} detectada: ${attendanceAnalysis.reason}`,
      displayMessage: `${typeLabel} às ${recordTime}\nMáquina: ${machine.name}`,
    })
  } catch (error: unknown) {
    // Error already logged by apiLogger below
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined

    apiLogger.error('QR scan processing error', {
      error: errorMessage,
      stack: errorStack,
      userId: (await getServerSession(authOptions))?.user?.id,
    })

    // Verificar se é erro de QR_SECRET
    if (errorMessage.includes('QR_SECRET')) {
      return NextResponse.json(
        {
          error: 'Erro de configuração do servidor: QR_SECRET não está configurado',
          code: 'SERVER_CONFIG_ERROR',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    )
  }
}
