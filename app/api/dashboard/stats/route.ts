import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
      
      // Alertas pendentes (simulado por enquanto)
      Promise.resolve(3) // TODO: Implementar lógica real de alertas
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
    console.error('Erro ao buscar estatísticas do dashboard:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
