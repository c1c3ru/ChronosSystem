import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/reports/frequency - Dados de frequência

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Função auxiliar para calcular dias úteis (segunda a sexta)
function getBusinessDays(startDate: Date, endDate: Date): number {
  let count = 0
  const current = new Date(startDate)

  while (current <= endDate) {
    const dayOfWeek = current.getDay()
    // 0 = domingo, 6 = sábado
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++
    }
    current.setDate(current.getDate() + 1)
  }

  return count
}

// Função auxiliar para calcular horas trabalhadas em um dia
function calculateDailyHours(entries: Date[], exits: Date[]): number {
  let totalMinutes = 0

  for (let i = 0; i < Math.min(entries.length, exits.length); i++) {
    const diff = exits[i].getTime() - entries[i].getTime()
    totalMinutes += diff / (1000 * 60)
  }

  return totalMinutes / 60
}

// Função auxiliar para verificar se houve atraso
function isLate(entryTime: Date, expectedStartTime: string): boolean {
  const [hours, minutes] = expectedStartTime.split(':').map(Number)
  const expectedTime = new Date(entryTime)
  expectedTime.setHours(hours, minutes, 0, 0)

  // Tolerância de 15 minutos
  const toleranceMs = 15 * 60 * 1000
  return entryTime.getTime() > (expectedTime.getTime() + toleranceMs)
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = parseInt(searchParams.get('period') || '30')

    // Calcular data de início do período
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - period)

    // Buscar todos os usuários
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        shiftStartTime: true,
        contractStartDate: true,
        attendanceRecords: {
          where: {
            timestamp: {
              gte: startDate,
              lte: endDate
            }
          },
          orderBy: {
            timestamp: 'asc'
          }
        }
      }
    })

    // Calcular estatísticas para cada usuário
    const frequencyData = users.map(user => {
      const records = user.attendanceRecords

      // Agrupar registros por dia
      const recordsByDay = new Map<string, { entries: Date[], exits: Date[] }>()

      records.forEach(record => {
        const dateKey = record.timestamp.toISOString().split('T')[0]
        if (!recordsByDay.has(dateKey)) {
          recordsByDay.set(dateKey, { entries: [], exits: [] })
        }

        const dayRecords = recordsByDay.get(dateKey)!
        if (record.type === 'ENTRY') {
          dayRecords.entries.push(record.timestamp)
        } else if (record.type === 'EXIT') {
          dayRecords.exits.push(record.timestamp)
        }
      })

      // Calcular dias úteis no período (considerando data de início do contrato)
      const userStartDate = user.contractStartDate && user.contractStartDate > startDate
        ? user.contractStartDate
        : startDate
      const totalDays = getBusinessDays(userStartDate, endDate)

      // Calcular dias presentes, faltas e atrasos
      const presentDays = recordsByDay.size
      const absentDays = Math.max(0, totalDays - presentDays)

      let lateCount = 0
      let totalHours = 0
      let daysWithHours = 0

      recordsByDay.forEach((dayRecords) => {
        // Verificar atraso
        if (dayRecords.entries.length > 0) {
          const firstEntry = dayRecords.entries[0]
          if (isLate(firstEntry, user.shiftStartTime)) {
            lateCount++
          }
        }

        // Calcular horas trabalhadas
        if (dayRecords.entries.length > 0 && dayRecords.exits.length > 0) {
          const hours = calculateDailyHours(dayRecords.entries, dayRecords.exits)
          totalHours += hours
          daysWithHours++
        }
      })

      const averageHours = daysWithHours > 0 ? totalHours / daysWithHours : 0
      const frequencyPercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0

      // Buscar último registro
      const lastRecord = records.length > 0 ? records[records.length - 1] : null

      return {
        user: {
          id: user.id,
          name: user.name || 'Sem nome',
          email: user.email,
          role: user.role
        },
        totalDays,
        presentDays,
        absentDays,
        lateCount,
        frequencyPercentage,
        averageHours,
        lastRecord: lastRecord ? {
          date: lastRecord.timestamp.toISOString(),
          type: lastRecord.type
        } : undefined
      }
    })

    // Calcular estatísticas mensais (últimos 4 meses)
    const monthlyStats = []
    const now = new Date()

    for (let i = 0; i < 4; i++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

      const monthRecords = await prisma.attendanceRecord.findMany({
        where: {
          timestamp: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        include: {
          user: {
            select: {
              shiftStartTime: true
            }
          }
        }
      })

      // Agrupar por usuário
      const userRecords = new Map<string, typeof monthRecords>()
      monthRecords.forEach(record => {
        if (!userRecords.has(record.userId)) {
          userRecords.set(record.userId, [])
        }
        userRecords.get(record.userId)!.push(record)
      })

      // Calcular estatísticas do mês
      const totalUsers = userRecords.size
      let totalFrequency = 0
      let lateRecords = 0

      userRecords.forEach((records, userId) => {
        const recordsByDay = new Map<string, { entries: Date[], exits: Date[] }>()

        records.forEach(record => {
          const dateKey = record.timestamp.toISOString().split('T')[0]
          if (!recordsByDay.has(dateKey)) {
            recordsByDay.set(dateKey, { entries: [], exits: [] })
          }

          const dayRecords = recordsByDay.get(dateKey)!
          if (record.type === 'ENTRY') {
            dayRecords.entries.push(record.timestamp)
          } else if (record.type === 'EXIT') {
            dayRecords.exits.push(record.timestamp)
          }
        })

        const businessDays = getBusinessDays(monthStart, monthEnd)
        const presentDays = recordsByDay.size
        const frequency = businessDays > 0 ? (presentDays / businessDays) * 100 : 0
        totalFrequency += frequency

        // Contar atrasos
        recordsByDay.forEach((dayRecords) => {
          if (dayRecords.entries.length > 0) {
            const firstEntry = dayRecords.entries[0]
            const shiftStartTime = records[0].user.shiftStartTime
            if (isLate(firstEntry, shiftStartTime)) {
              lateRecords++
            }
          }
        })
      })

      const averageFrequency = totalUsers > 0 ? totalFrequency / totalUsers : 0

      monthlyStats.push({
        month: monthStart.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        totalUsers,
        averageFrequency,
        totalRecords: monthRecords.length,
        lateRecords
      })
    }

    return NextResponse.json({
      frequencyData,
      monthlyStats
    })
  } catch (error) {
    console.error('Erro ao buscar dados de frequência:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
