import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Configurações de contrato conforme Lei 11.788/2008
const CONTRACT_CONFIGS = {
  FUNDAMENTAL_20H: { dailyHours: 4, weeklyHours: 20 },
  SUPERIOR_30H: { dailyHours: 6, weeklyHours: 30 },
  ALTERNANCIA_40H: { dailyHours: 8, weeklyHours: 40 },
  CUSTOM: { dailyHours: 6, weeklyHours: 30 } // Padrão, será sobrescrito pelos campos do usuário
}

// GET /api/hour-balance - Buscar saldo de horas do usuário
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'current_month'
    const userId = searchParams.get('userId') || session.user.id

    // Verificar se o usuário pode ver outros saldos (apenas ADMIN/SUPERVISOR)
    if (userId !== session.user.id && !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    // Buscar dados do usuário
    const user = await (prisma.user as any).findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        contractType: true,
        weeklyHours: true,
        dailyHours: true,
        hourBalance: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Calcular período
    const now = new Date()
    let startDate: Date
    let endDate: Date

    switch (period) {
      case 'current_week':
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay())
        startOfWeek.setHours(0, 0, 0, 0)
        startDate = startOfWeek
        endDate = new Date(startOfWeek)
        endDate.setDate(startOfWeek.getDate() + 6)
        endDate.setHours(23, 59, 59, 999)
        break
      case 'current_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
        break
      case 'last_30_days':
        endDate = new Date(now)
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 30)
        break
      default:
        return NextResponse.json({ error: 'Período inválido' }, { status: 400 })
    }

    // Buscar registros de saldo no período
    const hourBalances = await (prisma as any).hourBalance.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'desc' }
    })

    // Calcular estatísticas
    const totalWorkedHours = hourBalances.reduce((sum: number, record: any) => sum + record.workedHours, 0)
    const totalExpectedHours = hourBalances.reduce((sum: number, record: any) => sum + record.expectedHours, 0)
    const currentBalance = user.hourBalance

    // Buscar registros de ponto para cálculo mais preciso
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: {
        userId,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { timestamp: 'asc' }
    })

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        contractType: user.contractType,
        weeklyHours: user.weeklyHours,
        dailyHours: user.dailyHours
      },
      period: {
        type: period,
        startDate,
        endDate
      },
      balance: {
        current: currentBalance,
        totalWorkedHours,
        totalExpectedHours,
        difference: totalWorkedHours - totalExpectedHours
      },
      records: hourBalances,
      attendanceRecords: attendanceRecords.length
    })
  } catch (error) {
    console.error('❌ [HOUR-BALANCE] Erro ao buscar saldo:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST /api/hour-balance/calculate - Recalcular saldo de horas
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { userId, date } = await request.json()
    const targetUserId = userId || session.user.id

    // Verificar permissões
    if (targetUserId !== session.user.id && !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    // Buscar usuário
    const user = await (prisma.user as any).findUnique({
      where: { id: targetUserId }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Definir data para cálculo (hoje se não especificada)
    const calculationDate = date ? new Date(date) : new Date()
    const startOfDay = new Date(calculationDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(calculationDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Buscar registros de ponto do dia
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: {
        userId: targetUserId,
        timestamp: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      orderBy: { timestamp: 'asc' }
    })

    // Calcular horas trabalhadas
    let workedHours = 0
    for (let i = 0; i < attendanceRecords.length - 1; i += 2) {
      const entry = attendanceRecords[i]
      const exit = attendanceRecords[i + 1]
      
      if (entry.type === 'ENTRY' && exit && exit.type === 'EXIT') {
        const diffMs = exit.timestamp.getTime() - entry.timestamp.getTime()
        workedHours += diffMs / (1000 * 60 * 60) // Converter para horas
      }
    }

    // Obter configuração do contrato
    const contractConfig = CONTRACT_CONFIGS[(user as any).contractType as keyof typeof CONTRACT_CONFIGS] || CONTRACT_CONFIGS.CUSTOM
    const expectedHours = (user as any).contractType === 'CUSTOM' ? (user as any).dailyHours : contractConfig.dailyHours

    // Calcular saldo do dia
    const dailyBalance = workedHours - expectedHours

    // Verificar se já existe registro para o dia
    const existingRecord = await (prisma as any).hourBalance.findFirst({
      where: {
        userId: targetUserId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    })

    if (existingRecord) {
      // Atualizar registro existente
      await (prisma as any).hourBalance.update({
        where: { id: existingRecord.id },
        data: {
          workedHours,
          expectedHours,
          balance: dailyBalance,
          description: `Recalculado em ${new Date().toLocaleString('pt-BR')}`
        }
      })
    } else {
      // Criar novo registro
      await (prisma as any).hourBalance.create({
        data: {
          userId: targetUserId,
          date: calculationDate,
          workedHours,
          expectedHours,
          balance: dailyBalance,
          weeklyBalance: 0, // Será calculado em processo separado
          monthlyBalance: 0, // Será calculado em processo separado
          description: 'Calculado automaticamente'
        }
      })
    }

    // Atualizar saldo total do usuário
    const totalBalance = await (prisma as any).hourBalance.aggregate({
      where: { userId: targetUserId },
      _sum: { balance: true }
    })

    await (prisma.user as any).update({
      where: { id: targetUserId },
      data: { hourBalance: totalBalance._sum.balance || 0 }
    })

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CALCULATE_HOUR_BALANCE',
        resource: 'HOUR_BALANCE',
        details: `Saldo calculado para ${user.name} em ${calculationDate.toLocaleDateString('pt-BR')}: ${dailyBalance.toFixed(2)}h`
      }
    })

    return NextResponse.json({
      success: true,
      calculation: {
        date: calculationDate,
        workedHours,
        expectedHours,
        dailyBalance,
        totalBalance: totalBalance._sum.balance || 0
      }
    })
  } catch (error) {
    console.error('❌ [HOUR-BALANCE] Erro ao calcular saldo:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
