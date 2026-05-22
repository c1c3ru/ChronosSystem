import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateHourBalance } from '@/lib/hour-calculator'
import { z } from 'zod'
import crypto from 'crypto'
import { rateLimiters, addRateLimitHeaders } from '@/lib/rate-limit'
import { DEFAULT_RADIUS } from '@/lib/geolocation'
import { logger } from '@/lib/logger'
import { AttendanceLogic, AttendanceRecordType } from '@/lib/attendance-logic'

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic'
const createAttendanceSchema = z.object({
  machineId: z.string().cuid(),
  type: z.enum(['ENTRY', 'EXIT']),
  qrData: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

// GET /api/attendance - Listar registros de ponto
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || session.user.id
    const machineId = searchParams.get('machineId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Verificar permissões
    const canViewAll = ['ADMIN', 'SUPERVISOR'].includes(session.user.role)
    if (!canViewAll && userId !== session.user.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    // Construir filtros
    const where: Record<string, unknown> = {}
    const timestampFilter: Record<string, unknown> = {}

    if (userId && (canViewAll || userId === session.user.id)) {
      where.userId = userId
    } else if (!canViewAll) {
      where.userId = session.user.id
    }

    if (machineId) {
      where.machineId = machineId
    }

    if (startDate || endDate) {
      if (startDate) timestampFilter.gte = new Date(startDate)
      if (endDate) timestampFilter.lte = new Date(endDate)
      where.timestamp = timestampFilter
    }

    const [records, total] = await Promise.all([
      prisma.attendanceRecord.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          machine: {
            select: {
              name: true,
              location: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { timestamp: 'desc' },
      }),
      prisma.attendanceRecord.count({ where }),
    ])

    return NextResponse.json({
      records,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: unknown) {
    logger.error('Erro ao buscar registros de ponto', {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST /api/attendance - Criar registro de ponto
export async function POST(request: NextRequest) {
  try {
    const sessao = await getServerSession(authOptions)

    if (!sessao) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const rateLimitResult = await rateLimiters.qrScanUser(request, sessao.user.id)
    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
      return NextResponse.json(
        {
          error: 'Muitas tentativas. Tente novamente em alguns segundos.',
          retryAfter,
          code: 'RATE_LIMIT_EXCEEDED',
        },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfter) },
        }
      )
    }

    const corpo = await request.json()
    const dadosValidados = createAttendanceSchema.parse(corpo)

    // Verificar se a máquina existe e está ativa
    const maquina = await prisma.machine.findUnique({
      where: { id: dadosValidados.machineId },
    })

    if (!maquina || !maquina.isActive) {
      return NextResponse.json({ error: 'Máquina não encontrada ou inativa' }, { status: 400 })
    }

    // Buscar último registro do usuário para validações de sequência
    const ultimoRegistro = await prisma.attendanceRecord.findFirst({
      where: { userId: sessao.user.id },
      orderBy: { timestamp: 'desc' },
    })

    const registrosDoDia = await prisma.attendanceRecord.findMany({
      where: {
        userId: sessao.user.id,
        timestamp: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
      orderBy: { timestamp: 'asc' },
    })

    // Instanciar lógica de atendimento
    const atendimentoLogica = new AttendanceLogic()

    // Validação de proximidade se fornecida
    if (
      dadosValidados.latitude &&
      dadosValidados.longitude &&
      maquina.latitude &&
      maquina.longitude
    ) {
      const validacaoProximidade = atendimentoLogica.validarProximidade(
        { latitude: dadosValidados.latitude, longitude: dadosValidados.longitude },
        { latitude: maquina.latitude, longitude: maquina.longitude },
        DEFAULT_RADIUS.NORMAL
      )

      if (!validacaoProximidade.isValid) {
        logger.warn('Registro de ponto rejeitado - fora do raio permitido', {
          userId: sessao.user.id,
          machineId: maquina.id,
          distancia: validacaoProximidade.distance,
          raioMaximo: validacaoProximidade.maxRadius,
        })

        return NextResponse.json(
          {
            error: 'Localização inválida',
            message: validacaoProximidade.message,
          },
          { status: 400 }
        )
      }
    }

    // Verificar autorização especial para hoje (trabalho em feriado/fim de semana)
    const hojeInicio = new Date()
    hojeInicio.setHours(0, 0, 0, 0)
    const hojeFim = new Date()
    hojeFim.setHours(23, 59, 59, 999)

    const autorizacaoEspecial = await prisma.justification.findFirst({
      where: {
        userId: sessao.user.id,
        date: {
          gte: hojeInicio,
          lte: hojeFim,
        },
        type: 'EXTRA_WORK',
        status: 'APPROVED',
      },
    })

    const temAutorizacao = !!autorizacaoEspecial

    // Validar anomalias de sequência e registros muito próximos
    const validadorRegistro = await atendimentoLogica.validateRecord(
      dadosValidados.type as AttendanceRecordType,
      ultimoRegistro
        ? { ...ultimoRegistro, type: ultimoRegistro.type as AttendanceRecordType }
        : null,
      new Date(),
      temAutorizacao
    )

    if (!validadorRegistro.isValid) {
      const errorMsg = validadorRegistro.errors[0]
      logger.warn('Registro de ponto rejeitado por regras de validação', {
        userId: sessao.user.id,
        machineId: maquina.id,
        machineName: maquina.name,
        error: errorMsg,
      })

      await prisma.auditLog.create({
        data: {
          userId: sessao.user.id,
          action: 'REJECTED_ATTENDANCE',
          resource: 'ATTENDANCE_RECORD',
          details: `Tentativa de ${dadosValidados.type} rejeitada na máquina ${maquina.name}. Motivo: ${errorMsg}`,
        },
      })

      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    // Gerar hash para integridade
    const dataAtual = new Date()
    const dadosParaHash = `${sessao.user.id}-${dadosValidados.machineId}-${dadosValidados.type}-${dataAtual.getTime()}`
    const hash = crypto.createHash('sha256').update(dadosParaHash).digest('hex')

    // Criar registro
    const registro = await prisma.attendanceRecord.create({
      data: {
        userId: sessao.user.id,
        machineId: dadosValidados.machineId,
        type: dadosValidados.type,
        qrData: dadosValidados.qrData,
        latitude: dadosValidados.latitude,
        longitude: dadosValidados.longitude,
        timestamp: dataAtual,
        hash,
        prevHash: ultimoRegistro?.hash,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        machine: {
          select: {
            name: true,
            location: true,
          },
        },
      },
    })

    // Validar anomalias e avisos após o registro (opcionalmente registrar em log)
    const anomalias = atendimentoLogica.detectSequenceAnomaly(
      [...registrosDoDia, registro].map((r) => ({ ...r, type: r.type as AttendanceRecordType }))
    )

    if (anomalias.length > 0) {
      logger.warn('Anomalias de ponto detectadas', { userId: sessao.user.id, anomalias })
    }

    // Calcular saldo de horas após registro de ponto
    try {
      await updateHourBalance(sessao.user.id, registro.timestamp)
      logger.info('Saldo de horas atualizado', { userId: sessao.user.id })
    } catch (hourError) {
      logger.error('Erro ao calcular saldo de horas', { error: hourError })
    }

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: sessao.user.id,
        action: 'CREATE_ATTENDANCE',
        resource: 'ATTENDANCE_RECORD',
        details: `Registro de ${dadosValidados.type} na máquina ${maquina.name}`,
      },
    })

    // Adicionar headers de rate limit na resposta
    const resposta = NextResponse.json(registro, { status: 201 })
    return addRateLimitHeaders(resposta, rateLimitResult)
  } catch (erro: unknown) {
    if (erro instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: erro.errors,
        },
        { status: 400 }
      )
    }

    logger.error('Erro ao criar registro de ponto', {
      error: erro instanceof Error ? erro.message : String(erro),
    })
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
