import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  buildEntryDayKeySet,
  countWeekdayAbsenceIncidents,
  isLateEntryRecord,
} from '@/lib/admin-report-metrics'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/reports - Dados para relatórios (métricas reais a partir de registros de ponto)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = parseInt(searchParams.get('period') || '30', 10)
    const userFilter = searchParams.get('user') || 'ALL'

    const endDate = new Date()
    endDate.setHours(23, 59, 59, 999)

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - period)
    startDate.setHours(0, 0, 0, 0)

    const userWhere = userFilter !== 'ALL' ? { role: userFilter } : {}

    const userFilterClause = userFilter !== 'ALL' ? { user: { role: userFilter } } : {}

    const [
      totalUsers,
      totalRecords,
      entryRowsForLate,
      entryRowsForAbsence,
      userIds,
      monthlyData,
    ] = await Promise.all([
      prisma.user.count({ where: userWhere }),

      prisma.attendanceRecord.count({
        where: {
          timestamp: { gte: startDate, lte: endDate },
          ...userFilterClause,
        },
      }),

      prisma.attendanceRecord.findMany({
        where: {
          type: 'ENTRY',
          timestamp: { gte: startDate, lte: endDate },
          ...userFilterClause,
        },
        select: { timestamp: true },
      }),

      prisma.attendanceRecord.findMany({
        where: {
          type: 'ENTRY',
          timestamp: { gte: startDate, lte: endDate },
          ...userFilterClause,
        },
        select: { userId: true, timestamp: true },
      }),

      prisma.user.findMany({
        where: userWhere,
        select: { id: true },
      }),

      Promise.all(
        Array.from({ length: 6 }, async (_, i) => {
          const monthStart = new Date()
          monthStart.setMonth(monthStart.getMonth() - i)
          monthStart.setDate(1)
          monthStart.setHours(0, 0, 0, 0)

          const monthEnd = new Date(monthStart)
          monthEnd.setMonth(monthEnd.getMonth() + 1)

          const [records, monthEntries] = await Promise.all([
            prisma.attendanceRecord.count({
              where: {
                timestamp: { gte: monthStart, lt: monthEnd },
                ...userFilterClause,
              },
            }),
            prisma.attendanceRecord.findMany({
              where: {
                type: 'ENTRY',
                timestamp: { gte: monthStart, lt: monthEnd },
                ...userFilterClause,
              },
              select: { timestamp: true },
            }),
          ])

          const lateRecords = monthEntries.filter((e) => isLateEntryRecord(e.timestamp)).length

          return {
            month: monthStart.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
            records,
            lateRecords,
          }
        })
      ),
    ])

    const lateRecords = entryRowsForLate.filter((e) => isLateEntryRecord(e.timestamp)).length

    const entryDayKeys = buildEntryDayKeySet(entryRowsForAbsence)
    const absences = countWeekdayAbsenceIncidents(
      userIds.map((u) => u.id),
      startDate,
      endDate,
      entryDayKeys
    )

    const reportData = {
      totalUsers,
      totalRecords,
      lateRecords,
      absences,
      monthlyData: monthlyData.reverse(),
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Erro ao buscar dados do relatório:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
