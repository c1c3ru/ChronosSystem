import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/reports/frequency - Dados de frequência
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = parseInt(searchParams.get('period') || '30')

    // Simular dados de frequência
    const simulatedFrequencyData = [
      {
        user: {
          id: 'user-1',
          name: 'João Silva',
          email: 'joao@empresa.com',
          role: 'EMPLOYEE'
        },
        totalDays: Math.min(period, 22), // Dias úteis no período
        presentDays: Math.min(period, 20),
        absentDays: 2,
        lateCount: 3,
        frequencyPercentage: 90.9,
        averageHours: 8.2,
        lastRecord: {
          date: new Date().toISOString(),
          type: 'ENTRY'
        }
      },
      {
        user: {
          id: 'user-2',
          name: 'Maria Santos',
          email: 'maria@empresa.com',
          role: 'SUPERVISOR'
        },
        totalDays: Math.min(period, 22),
        presentDays: Math.min(period, 22),
        absentDays: 0,
        lateCount: 1,
        frequencyPercentage: 100.0,
        averageHours: 8.5,
        lastRecord: {
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          type: 'EXIT'
        }
      },
      {
        user: {
          id: 'user-3',
          name: 'Pedro Costa',
          email: 'pedro@empresa.com',
          role: 'EMPLOYEE'
        },
        totalDays: Math.min(period, 22),
        presentDays: Math.min(period, 15),
        absentDays: 7,
        lateCount: 8,
        frequencyPercentage: 68.2,
        averageHours: 7.1,
        lastRecord: {
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'ENTRY'
        }
      },
      {
        user: {
          id: 'user-4',
          name: 'Ana Oliveira',
          email: 'ana@empresa.com',
          role: 'EMPLOYEE'
        },
        totalDays: Math.min(period, 22),
        presentDays: Math.min(period, 21),
        absentDays: 1,
        lateCount: 2,
        frequencyPercentage: 95.5,
        averageHours: 8.0,
        lastRecord: {
          date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          type: 'EXIT'
        }
      },
      {
        user: {
          id: 'user-5',
          name: 'Carlos Ferreira',
          email: 'carlos@empresa.com',
          role: 'ADMIN'
        },
        totalDays: Math.min(period, 22),
        presentDays: Math.min(period, 19),
        absentDays: 3,
        lateCount: 0,
        frequencyPercentage: 86.4,
        averageHours: 9.2,
        lastRecord: {
          date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          type: 'ENTRY'
        }
      }
    ]

    // Simular estatísticas mensais
    const simulatedMonthlyStats = [
      {
        month: 'Outubro 2025',
        totalUsers: 5,
        averageFrequency: 88.2,
        totalRecords: 180,
        lateRecords: 14
      },
      {
        month: 'Setembro 2025',
        totalUsers: 5,
        averageFrequency: 92.1,
        totalRecords: 220,
        lateRecords: 8
      },
      {
        month: 'Agosto 2025',
        totalUsers: 4,
        averageFrequency: 89.5,
        totalRecords: 176,
        lateRecords: 12
      },
      {
        month: 'Julho 2025',
        totalUsers: 4,
        averageFrequency: 91.3,
        totalRecords: 184,
        lateRecords: 9
      }
    ]

    return NextResponse.json({
      frequencyData: simulatedFrequencyData,
      monthlyStats: simulatedMonthlyStats
    })
  } catch (error) {
    console.error('Erro ao buscar dados de frequência:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
