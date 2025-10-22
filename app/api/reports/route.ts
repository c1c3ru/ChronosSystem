import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/reports - Dados para relatórios
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = parseInt(searchParams.get('period') || '30')
    const userFilter = searchParams.get('user') || 'ALL'

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - period)

    // Filtro de usuários
    let userWhere = {}
    if (userFilter !== 'ALL') {
      userWhere = { role: userFilter }
    }

    // Buscar dados em paralelo
    const [
      totalUsers,
      totalRecords,
      lateRecords,
      absences,
      monthlyData
    ] = await Promise.all([
      // Total de usuários
      prisma.user.count({
        where: userWhere
      }),
      
      // Total de registros no período
      prisma.attendanceRecord.count({
        where: {
          timestamp: {
            gte: startDate
          },
          ...(userFilter !== 'ALL' && {
            user: { role: userFilter }
          })
        }
      }),
      
      // Registros com atraso (simulado - mais de 8:30)
      prisma.attendanceRecord.count({
        where: {
          timestamp: {
            gte: startDate
          },
          type: 'ENTRY',
          ...(userFilter !== 'ALL' && {
            user: { role: userFilter }
          })
        }
      }),
      
      // Faltas (simulado)
      Promise.resolve(Math.floor(Math.random() * 10)),
      
      // Dados mensais (últimos 6 meses)
      Promise.all(
        Array.from({ length: 6 }, async (_, i) => {
          const monthStart = new Date()
          monthStart.setMonth(monthStart.getMonth() - i)
          monthStart.setDate(1)
          monthStart.setHours(0, 0, 0, 0)
          
          const monthEnd = new Date(monthStart)
          monthEnd.setMonth(monthEnd.getMonth() + 1)
          
          const records = await prisma.attendanceRecord.count({
            where: {
              timestamp: {
                gte: monthStart,
                lt: monthEnd
              },
              ...(userFilter !== 'ALL' && {
                user: { role: userFilter }
              })
            }
          })
          
          const lateRecords = Math.floor(records * 0.1) // 10% de atrasos simulado
          
          return {
            month: monthStart.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
            records,
            lateRecords
          }
        })
      )
    ])

    const reportData = {
      totalUsers,
      totalRecords,
      lateRecords: Math.floor(lateRecords * 0.15), // 15% dos registros de entrada são atrasos
      absences,
      monthlyData: monthlyData.reverse() // Ordem cronológica
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Erro ao buscar dados do relatório:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
