import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/docs/lib/auth'
import { prisma } from '@/docs/lib/prisma'
import { apiLogger } from '@/docs/lib/logger'

// GET /api/dashboard/stats - Estatísticas do dashboard

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Buscar estatísticas em paralelo
    const [
      totalUsers,
      todayRecords,
      activeMachines,
      totalMachines,
      pendingAlerts
    ] = await Promise.all([
      // Total de usuários
      prisma.user.count(),

      // Registros de hoje
      prisma.attendanceRecord.count({
        where: {
          timestamp: {
            gte: today,
            lt: tomorrow
          }
        }
      }),

      // Máquinas ativas
      prisma.machine.count({
        where: { isActive: true }
      }),

      // Total de máquinas
      prisma.machine.count(),

      // Alertas pendentes - lógica real implementada
      (async () => {
        const [pendingJustifications, recentAbsences] = await Promise.all([
          // Justificativas pendentes
          prisma.justification.count({
            where: { status: 'PENDING' }
          }),
          // Usuários com ausências recentes sem justificativa (últimos 7 dias)
          prisma.attendanceRecord.groupBy({
            by: ['userId'],
            where: {
              timestamp: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              }
            },
            _count: true,
            having: {
              userId: {
                _count: {
                  lt: 5 // Menos de 5 registros em 7 dias pode indicar problema
                }
              }
            }
          })
        ])

        return pendingJustifications + recentAbsences.length
      })()
    ])

    // Calcular estatísticas adicionais
    const yesterdayStart = new Date(today)
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)

    const yesterdayRecords = await prisma.attendanceRecord.count({
      where: {
        timestamp: {
          gte: yesterdayStart,
          lt: today
        }
      }
    })

    // Calcular percentuais de mudança
    const recordsChange = yesterdayRecords > 0
      ? ((todayRecords - yesterdayRecords) / yesterdayRecords * 100).toFixed(1)
      : '0'

    const stats = {
      totalUsers,
      todayRecords,
      activeMachines,
      totalMachines,
      alerts: pendingAlerts,
      trends: {
        recordsChange: parseFloat(recordsChange),
        machinesOperational: activeMachines === totalMachines ? 100 : ((activeMachines / totalMachines) * 100).toFixed(1)
      },
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(stats)
  } catch (error) {
    apiLogger.error('Erro ao buscar estatísticas do dashboard', { error: String(error) })
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
