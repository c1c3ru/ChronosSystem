import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiLogger } from '@/lib/logger'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface WorkingHours {
  start: string // "08:00"
  end: string // "17:00"
  lunchStart: string // "12:00"
  lunchEnd: string // "13:00"
}

// Horários padrão IFCE (pode ser configurável por usuário no futuro)
const DEFAULT_WORKING_HOURS: WorkingHours = {
  start: '08:00',
  end: '17:00',
  lunchStart: '12:00',
  lunchEnd: '13:00',
}

interface RecordWithMachine {
  id: string
  timestamp: Date
  type: string
  machine: {
    name: string
    location: string
  }
}

interface AnalyzedDay {
  date: string
  fullDate: string
  entry?: string
  exit?: string
  totalHours: string
  status: 'working' | 'completed' | 'incomplete' | 'absent'
  alerts: { type: string; message: string; severity: string }[]
  location: string
  hasJustification: boolean
  justificationStatus?: string
}

// GET /api/employee/dashboard-enhanced - Dashboard com análise de atrasos e alertas
export async function GET(request: NextRequest) {
  try {
    apiLogger.debug('Enhanced dashboard - Verificando sessão')
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const userId = session.user.id
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Buscar último registro do usuário
    const lastRecord = await prisma.attendanceRecord.findFirst({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      include: {
        machine: {
          select: {
            name: true,
            location: true,
          },
        },
      },
    })

    // Verificar se está trabalhando
    const isWorking = lastRecord?.type === 'ENTRY'

    // Buscar registros de hoje
    const todayRecords = await prisma.attendanceRecord.findMany({
      where: {
        userId,
        timestamp: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        machine: {
          select: {
            name: true,
            location: true,
          },
        },
      },
      orderBy: { timestamp: 'asc' },
    })

    // Analisar situação de hoje
    const todayAnalysis = analyzeTodayRecords(
      todayRecords as unknown as RecordWithMachine[],
      DEFAULT_WORKING_HOURS,
      isWorking,
      lastRecord as unknown as RecordWithMachine
    )

    // Buscar registros recentes (últimos 7 dias) com análise
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentRecords = await prisma.attendanceRecord.findMany({
      where: {
        userId,
        timestamp: {
          gte: sevenDaysAgo,
        },
      },
      include: {
        machine: {
          select: {
            name: true,
            location: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 20,
    })

    // Agrupar registros por dia e analisar
    const recordsByDay = groupRecordsByDay(recentRecords as unknown as RecordWithMachine[])
    const analyzedDays = recordsByDay
      .map((dayRecords) => analyzeDayRecords(dayRecords, DEFAULT_WORKING_HOURS))
      .filter((day): day is AnalyzedDay => day !== null) // Remover dias inválidos

    // Verificar justificativas para cada dia analisado
    const daysWithJustifications = await Promise.all(
      analyzedDays.map(async (day) => {
        if (!day || !day.fullDate) return day

        try {
          const dayStart = new Date(day.fullDate)
          dayStart.setHours(0, 0, 0, 0)
          const dayEnd = new Date(dayStart)
          dayEnd.setDate(dayEnd.getDate() + 1)

          // Verificar se há justificativa aprovada para este dia
          const justification = await prisma.justification.findFirst({
            where: {
              userId,
              date: {
                gte: dayStart,
                lt: dayEnd,
              },
              status: {
                in: ['APPROVED', 'PENDING'],
              },
            },
          })

          return {
            ...day,
            hasJustification: !!justification,
            justificationStatus: justification?.status,
          }
        } catch (error) {
          apiLogger.warn('Erro ao verificar justificativa', { error })
          return day
        }
      })
    )

    // Contar justificativas pendentes
    const pendingJustifications = await prisma.justification.count({
      where: {
        userId,
        status: 'PENDING',
      },
    })

    // Verificar quantas faltas/atrasos sem justificativa
    const unjustifiedIssues = daysWithJustifications.filter(
      (day) => day && day.alerts && day.alerts.length > 0 && !day.hasJustification
    ).length

    return NextResponse.json({
      success: true,
      workStatus: {
        isWorking,
        lastRecord: lastRecord
          ? {
              type: lastRecord.type,
              timestamp: lastRecord.timestamp.toISOString(), // ISO cru para formatar no frontend
              location: lastRecord.machine?.location || 'Não informado',
              label: lastRecord.type === 'ENTRY' ? 'Entrada' : 'Saída',
            }
          : null,
        todayHours: todayAnalysis.totalHours,
        todayStatus: todayAnalysis.status,
        todayAlerts: todayAnalysis.alerts,
      },
      analyzedDays: daysWithJustifications.slice(0, 5), // Últimos 5 dias
      alerts: {
        pendingJustifications,
        unjustifiedIssues,
        needsAttention: unjustifiedIssues > 0 || pendingJustifications > 0,
      },
    })
  } catch (error: unknown) {
    apiLogger.error('Enhanced dashboard - Erro ao buscar dados', {
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : undefined,
      stack: error instanceof Error ? error.stack : undefined,
    })

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        message:
          process.env.NODE_ENV === 'development' && error instanceof Error
            ? error.message
            : undefined,
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    )
  }
}

function analyzeTodayRecords(
  registros: RecordWithMachine[],
  horariosTrabalho: WorkingHours,
  estaTrabalhando: boolean = false,
  ultimoRegistro: RecordWithMachine | null = null
) {
  const agora = new Date()
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  let minutosTotais = 0
  const alertas: { type: string; message: string; severity: string }[] = []

  const entradas = registros.filter((r) => r && r.type === 'ENTRY' && r.timestamp)
  const saidas = registros.filter((r) => r && r.type === 'EXIT' && r.timestamp)

  // 1. Calcular horas de pares completos hoje
  for (let i = 0; i < Math.min(entradas.length, saidas.length); i++) {
    const tempoEntrada = new Date(entradas[i].timestamp)
    const tempoSaida = new Date(saidas[i].timestamp)
    if (!isNaN(tempoEntrada.getTime()) && !isNaN(tempoSaida.getTime())) {
      minutosTotais += Math.max(0, (tempoSaida.getTime() - tempoEntrada.getTime()) / (1000 * 60))
    }
  }

  // 2. Adicionar tempo do turno atual (se houver)
  if (entradas.length > saidas.length) {
    // Caso normal: a entrada está nos registros de hoje
    const ultimaEntrada = entradas[entradas.length - 1]
    const tempoUltimaEntrada = new Date(ultimaEntrada.timestamp)
    if (!isNaN(tempoUltimaEntrada.getTime())) {
      minutosTotais += Math.max(0, (agora.getTime() - tempoUltimaEntrada.getTime()) / (1000 * 60))
    }
  } else if (estaTrabalhando && ultimoRegistro && ultimoRegistro.type === 'ENTRY') {
    // Caso especial: turno atravessado ou fuso horário
    try {
      const tempoUltimoRegistro =
        ultimoRegistro.timestamp instanceof Date
          ? ultimoRegistro.timestamp
          : new Date(ultimoRegistro.timestamp)

      if (!isNaN(tempoUltimoRegistro.getTime())) {
        const tempoInicio =
          tempoUltimoRegistro.getTime() < hoje.getTime() ? hoje : tempoUltimoRegistro
        minutosTotais += Math.max(0, (agora.getTime() - tempoInicio.getTime()) / (1000 * 60))
      }
    } catch (erro) {
      console.error('Erro ao calcular turno aberto:', erro)
    }
  }

  // 3. Analisar alertas de atraso (apenas se houver entrada hoje)
  if (entradas.length > 0) {
    const tempoPrimeiraEntrada = new Date(entradas[0].timestamp)
    if (!isNaN(tempoPrimeiraEntrada.getTime())) {
      const [horasEsp, minsEsp] = horariosTrabalho.start.split(':').map(Number)
      const inicioEsperado = new Date(tempoPrimeiraEntrada)
      inicioEsperado.setHours(horasEsp, minsEsp, 0, 0)

      const atraso = (tempoPrimeiraEntrada.getTime() - inicioEsperado.getTime()) / (1000 * 60)
      if (atraso > 15) {
        alertas.push({
          type: 'late',
          message: `Entrada com ${Math.round(atraso)} min de atraso`,
          severity: atraso > 60 ? 'high' : 'medium',
        })
      }
    }
  } else if (!estaTrabalhando && registros.length === 0) {
    // Sem registros e não está trabalhando -> ausente
    return {
      totalHours: '0h 00min',
      status: 'absent' as const,
      alerts: [
        {
          type: 'absence',
          message: 'Nenhum registro hoje',
          severity: 'high',
        },
      ],
    }
  }

  const horas = Math.floor(minutosTotais / 60)
  const minutos = Math.floor(minutosTotais % 60)
  const totalHorasString = `${horas}h ${minutos.toString().padStart(2, '0')}min`

  // Determinar status final
  let situacao: 'working' | 'completed' | 'incomplete' | 'absent' = 'incomplete'
  if (estaTrabalhando) {
    situacao = 'working'
  } else if (entradas.length > 0 && entradas.length === saidas.length) {
    // Se completou o dia, verificar se atingiu a meta (ex: 4h para estágio de 20h/sema)
    situacao = minutosTotais >= 240 ? 'completed' : 'incomplete'
  } else if (entradas.length === 0) {
    situacao = 'absent'
  }

  return {
    totalHours: totalHorasString,
    status: situacao,
    alerts: alertas,
  }
}

function groupRecordsByDay(records: RecordWithMachine[]) {
  const groups = new Map<string, RecordWithMachine[]>()

  records.forEach((record) => {
    if (!record || !record.timestamp) {
      apiLogger.warn('Registro inválido encontrado', { record })
      return
    }

    try {
      // Garantir que timestamp é um Date object
      const timestamp =
        record.timestamp instanceof Date ? record.timestamp : new Date(record.timestamp)

      if (isNaN(timestamp.getTime())) {
        apiLogger.warn('Timestamp inválido', { timestampRecord: record.timestamp.toISOString() })
        return
      }

      const date = timestamp.toDateString()
      if (!groups.has(date)) {
        groups.set(date, [])
      }
      // Garantir que o record tenha timestamp como Date
      groups.get(date)!.push({
        ...record,
        timestamp,
      })
    } catch (error) {
      apiLogger.error('Erro ao processar registro', { error, record })
    }
  })

  return Array.from(groups.values())
}

function analyzeDayRecords(
  dayRecords: RecordWithMachine[],
  workingHours: WorkingHours
): AnalyzedDay | null {
  if (!dayRecords || dayRecords.length === 0) return null

  try {
    // Garantir que o primeiro registro tem timestamp válido
    const firstRecord = dayRecords[0]
    if (!firstRecord || !firstRecord.timestamp) {
      apiLogger.warn('Primeiro registro inválido', { firstRecord })
      return null
    }

    // Garantir que timestamp é um Date object
    const date =
      firstRecord.timestamp instanceof Date
        ? firstRecord.timestamp
        : new Date(firstRecord.timestamp)

    if (isNaN(date.getTime())) {
      apiLogger.warn('Data inválida no primeiro registro', {
        timestampRecord: firstRecord.timestamp.toISOString(),
      })
      return null
    }

    const entries = dayRecords.filter((r) => r && r.type === 'ENTRY' && r.timestamp)
    const exits = dayRecords.filter((r) => r && r.type === 'EXIT' && r.timestamp)
    const alerts: { type: string; message: string; severity: string }[] = []

    // Análise similar ao dia atual
    if (entries.length > 0) {
      const firstEntry = entries[0]
      const entryTime =
        firstEntry.timestamp instanceof Date ? firstEntry.timestamp : new Date(firstEntry.timestamp)

      if (!isNaN(entryTime.getTime())) {
        const expectedStart = parseTime(workingHours.start)

        if (entryTime.getHours() * 60 + entryTime.getMinutes() > expectedStart + 30) {
          const delayMinutes = entryTime.getHours() * 60 + entryTime.getMinutes() - expectedStart
          alerts.push({
            type: 'late_arrival',
            message: `Atraso de ${delayMinutes} minutos`,
            severity: delayMinutes > 60 ? 'high' : 'medium',
          })
        }
      }
    }

    // Calcular horas
    let totalMinutes = 0
    for (let i = 0; i < Math.min(entries.length, exits.length); i++) {
      try {
        const entryTime =
          entries[i].timestamp instanceof Date
            ? entries[i].timestamp
            : new Date(entries[i].timestamp)
        const exitTime =
          exits[i].timestamp instanceof Date ? exits[i].timestamp : new Date(exits[i].timestamp)

        if (!isNaN(entryTime.getTime()) && !isNaN(exitTime.getTime())) {
          totalMinutes += (exitTime.getTime() - entryTime.getTime()) / (1000 * 60)
        }
      } catch (error) {
        apiLogger.warn('Erro ao calcular horas para par entrada/saída', { error })
      }
    }

    const hours = Math.floor(totalMinutes / 60)
    const minutes = Math.floor(totalMinutes % 60)

    // Garantir que máquina existe
    const location = firstRecord.machine?.location || 'Não informado'

    return {
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      fullDate: date.toISOString(),
      entry: entries[0]
        ? (() => {
            const entryTimestamp =
              entries[0].timestamp instanceof Date
                ? entries[0].timestamp
                : new Date(entries[0].timestamp)
            return !isNaN(entryTimestamp.getTime())
              ? entryTimestamp.toISOString() // ISO cru para formatar no frontend
              : undefined
          })()
        : undefined,
      exit: exits[0]
        ? (() => {
            const exitTimestamp =
              exits[0].timestamp instanceof Date ? exits[0].timestamp : new Date(exits[0].timestamp)
            return !isNaN(exitTimestamp.getTime())
              ? exitTimestamp.toISOString() // ISO cru para formatar no frontend
              : undefined
          })()
        : undefined,
      totalHours: `${hours}h ${minutes.toString().padStart(2, '0')}min`,
      status:
        entries.length === 0
          ? 'absent'
          : entries.length === exits.length
            ? 'completed'
            : 'incomplete',
      alerts,
      location,
      hasJustification: false, // Será verificado após retornar do banco
    }
  } catch (error) {
    apiLogger.error('Erro ao analisar registros do dia', { error, dayRecords })
    return null
  }
}

function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}
