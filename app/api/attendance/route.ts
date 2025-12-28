import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateHourBalance, validateWorkingHours } from '@/lib/hour-calculator'
import { z } from 'zod'
import crypto from 'crypto'
import { rateLimiters, withRateLimit, addRateLimitHeaders } from '@/lib/rate-limit'
import { validateProximity, DEFAULT_RADIUS, type Coordinates } from '@/lib/geolocation'
import { logger } from '@/lib/logger'


// Force dynamic rendering
export const dynamic = 'force-dynamic'
const createAttendanceSchema = z.object({
  machineId: z.string().cuid(),
  type: z.enum(['ENTRY', 'EXIT']),
  qrData: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
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
    const where: any = {}

    if (userId && (canViewAll || userId === session.user.id)) {
      where.userId = userId
    } else if (!canViewAll) {
      where.userId = session.user.id
    }

    if (machineId) {
      where.machineId = machineId
    }

    if (startDate || endDate) {
      where.timestamp = {}
      if (startDate) where.timestamp.gte = new Date(startDate)
      if (endDate) where.timestamp.lte = new Date(endDate)
    }

    const [records, total] = await Promise.all([
      prisma.attendanceRecord.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          machine: {
            select: {
              name: true,
              location: true
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { timestamp: 'desc' }
      }),
      prisma.attendanceRecord.count({ where })
    ])

    return NextResponse.json({
      records,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    logger.error('Erro ao buscar registros de ponto', { error })
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST /api/attendance - Criar registro de ponto
export async function POST(request: NextRequest) {
  try {
    // Aplicar rate limiting (20 registros por minuto)
    const rateLimitResult = await rateLimiters.qrScan(request)
    if (!rateLimitResult.success) {
      const rateLimitResponse = await withRateLimit(() => Promise.resolve(rateLimitResult))(request)
      if (rateLimitResponse) return rateLimitResponse
    }

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createAttendanceSchema.parse(body)

    // Verificar se a máquina existe e está ativa
    const machine = await prisma.machine.findUnique({
      where: { id: validatedData.machineId }
    })

    if (!machine || !machine.isActive) {
      return NextResponse.json({ error: 'Máquina não encontrada ou inativa' }, { status: 400 })
    }

    // Validar geolocalização se fornecida
    if (validatedData.latitude && validatedData.longitude) {
      // Verificar se a máquina tem coordenadas configuradas
      if (machine.latitude && machine.longitude) {
        const userLocation: Coordinates = {
          latitude: validatedData.latitude,
          longitude: validatedData.longitude
        }

        const machineLocation: Coordinates = {
          latitude: machine.latitude,
          longitude: machine.longitude
        }

        const proximityValidation = validateProximity(
          userLocation,
          machineLocation,
          DEFAULT_RADIUS.NORMAL // 100 metros
        )

        if (!proximityValidation.isValid) {
          logger.warn('Registro de ponto rejeitado - fora do raio permitido', {
            userId: session.user.id,
            machineId: machine.id,
            distance: proximityValidation.distance,
            maxRadius: proximityValidation.maxRadius
          })

          return NextResponse.json({
            error: 'Localização inválida',
            message: proximityValidation.message,
            distance: proximityValidation.distance,
            maxRadius: proximityValidation.maxRadius
          }, { status: 400 })
        }

        logger.info('Validação de geolocalização bem-sucedida', {
          userId: session.user.id,
          machineId: machine.id,
          distance: proximityValidation.distance
        })
      } else {
        logger.warn('Máquina sem coordenadas configuradas', {
          machineId: machine.id
        })
      }
    }

    // Buscar último registro do usuário para determinar o tipo esperado
    const lastRecord = await prisma.attendanceRecord.findFirst({
      where: { userId: session.user.id },
      orderBy: { timestamp: 'desc' }
    })

    // Validar sequência de entrada/saída
    const expectedType = !lastRecord || lastRecord.type === 'EXIT' ? 'ENTRY' : 'EXIT'
    if (validatedData.type !== expectedType) {
      const message = expectedType === 'ENTRY'
        ? 'Você deve registrar uma entrada primeiro'
        : 'Você deve registrar uma saída primeiro'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    // Gerar hash para integridade
    const dataToHash = `${session.user.id}-${validatedData.machineId}-${validatedData.type}-${Date.now()}`
    const hash = crypto.createHash('sha256').update(dataToHash).digest('hex')

    // Criar registro
    const record = await prisma.attendanceRecord.create({
      data: {
        userId: session.user.id,
        machineId: validatedData.machineId,
        type: validatedData.type,
        qrData: validatedData.qrData,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        hash,
        prevHash: lastRecord?.hash
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        machine: {
          select: {
            name: true,
            location: true
          }
        }
      }
    })

    // Calcular saldo de horas após registro de ponto
    try {
      logger.info('Calculando saldo de horas', { userId: session.user.id })

      // Se for saída, validar horários de trabalho
      if (validatedData.type === 'EXIT' && lastRecord) {
        const validation = await validateWorkingHours(
          session.user.id,
          lastRecord.timestamp,
          record.timestamp
        )

        if (!validation.isValid) {
          logger.warn('Violações de horário detectadas', { violations: validation.violations })
        }

        if (validation.warnings.length > 0) {
          logger.warn('Avisos de horário', { warnings: validation.warnings })
        }
      }

      // Atualizar saldo de horas
      await updateHourBalance(session.user.id, record.timestamp)
      logger.info('Saldo de horas atualizado', { userId: session.user.id })
    } catch (hourError) {
      logger.error('Erro ao calcular saldo de horas', { error: hourError })
      // Não falhar o registro de ponto por erro no cálculo de horas
    }

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_ATTENDANCE',
        resource: 'ATTENDANCE_RECORD',
        details: `Registro de ${validatedData.type} na máquina ${machine.name}`
      }
    })

    // Adicionar headers de rate limit na resposta
    const response = NextResponse.json(record, { status: 201 })
    return addRateLimitHeaders(response, rateLimitResult)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Dados inválidos',
        details: error.errors
      }, { status: 400 })
    }

    logger.error('Erro ao criar registro de ponto', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
