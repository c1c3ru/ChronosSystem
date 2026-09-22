import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface CronLogFailure {
  email: string
  message: string
}

function parseFailures(errors: string | null): CronLogFailure[] {
  if (!errors) return []
  try {
    const parsed: unknown = JSON.parse(errors)
    return Array.isArray(parsed) ? (parsed as CronLogFailure[]) : []
  } catch {
    return []
  }
}

// GET /api/admin/cron-logs - Histórico de execuções dos crons de notificação
// (justificativas pendentes, lembretes de ponto), consumido pelo painel
// "Status dos Alertas" no dashboard admin.
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user?.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const limitParam = parseInt(searchParams.get('limit') || '20', 10)
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 20
    const pageParam = parseInt(searchParams.get('page') || '1', 10)
    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1

    const [logs, total] = await Promise.all([
      prisma.cronLog.findMany({
        orderBy: { startedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.cronLog.count(),
    ])

    const totalPages = Math.max(Math.ceil(total / limit), 1)

    return NextResponse.json({
      logs: logs.map((log) => ({
        id: log.id,
        jobName: log.jobName,
        status: log.status,
        startedAt: log.startedAt,
        finishedAt: log.finishedAt,
        totalCount: log.totalCount,
        successCount: log.successCount,
        failureCount: log.failureCount,
        failures: parseFailures(log.errors),
        errorMessage: log.errorMessage,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    })
  } catch (error) {
    console.error('Erro ao buscar logs de cron:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
