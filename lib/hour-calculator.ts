import { prisma } from '@/lib/prisma'

// Configurações de contrato conforme Lei 11.788/2008
const CONTRACT_CONFIGS = {
  FUNDAMENTAL_20H: { dailyHours: 4, weeklyHours: 20 },
  SUPERIOR_30H: { dailyHours: 6, weeklyHours: 30 },
  ALTERNANCIA_40H: { dailyHours: 8, weeklyHours: 40 },
  CUSTOM: { dailyHours: 6, weeklyHours: 30 } // Será sobrescrito pelos campos do usuário
}

export interface HourCalculationResult {
  workedHours: number
  expectedHours: number
  dailyBalance: number
  weeklyBalance: number
  monthlyBalance: number
  isComplete: boolean // Se o dia de trabalho está completo (entrada e saída)
}

/**
 * Calcula o saldo de horas para um usuário em uma data específica
 */
export async function calculateHourBalance(userId: string, date: Date = new Date()): Promise<HourCalculationResult> {
  try {
    // Buscar dados do usuário
    const user = await (prisma.user as any).findUnique({
      where: { id: userId },
      select: {
        contractType: true,
        weeklyHours: true,
        dailyHours: true
      } as any
    })

    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    // Definir início e fim do dia
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    // Buscar registros de ponto do dia
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: {
        userId,
        timestamp: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      orderBy: { timestamp: 'asc' }
    })

    // Calcular horas trabalhadas
    let workedHours = 0
    let isComplete = false

    // Processar pares de entrada/saída
    for (let i = 0; i < attendanceRecords.length - 1; i += 2) {
      const entry = attendanceRecords[i]
      const exit = attendanceRecords[i + 1]
      
      if (entry.type === 'ENTRY' && exit && exit.type === 'EXIT') {
        const diffMs = exit.timestamp.getTime() - entry.timestamp.getTime()
        workedHours += diffMs / (1000 * 60 * 60) // Converter para horas
        isComplete = true
      }
    }

    // Se há uma entrada sem saída, calcular até agora (se for hoje)
    if (attendanceRecords.length % 2 === 1 && attendanceRecords[attendanceRecords.length - 1].type === 'ENTRY') {
      const lastEntry = attendanceRecords[attendanceRecords.length - 1]
      const now = new Date()
      
      // Só calcular se for hoje
      if (date.toDateString() === now.toDateString()) {
        const diffMs = now.getTime() - lastEntry.timestamp.getTime()
        workedHours += diffMs / (1000 * 60 * 60)
        isComplete = false // Ainda trabalhando
      }
    }

    // Obter configuração do contrato
    const contractConfig = CONTRACT_CONFIGS[(user as any).contractType as keyof typeof CONTRACT_CONFIGS] || CONTRACT_CONFIGS.CUSTOM
    const expectedHours = (user as any).contractType === 'CUSTOM' ? (user as any).dailyHours : contractConfig.dailyHours

    // Calcular saldo do dia
    const dailyBalance = workedHours - expectedHours

    // Calcular saldo semanal
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    const weeklyRecords = await (prisma as any).hourBalance.findMany({
      where: {
        userId,
        date: {
          gte: startOfWeek,
          lte: endOfWeek
        }
      }
    })

    const weeklyBalance = weeklyRecords.reduce((sum: number, record: any) => sum + record.balance, 0) + dailyBalance

    // Calcular saldo mensal
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)

    const monthlyRecords = await (prisma as any).hourBalance.findMany({
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    })

    const monthlyBalance = monthlyRecords.reduce((sum: number, record: any) => sum + record.balance, 0) + dailyBalance

    return {
      workedHours,
      expectedHours,
      dailyBalance,
      weeklyBalance,
      monthlyBalance,
      isComplete
    }
  } catch (error) {
    console.error('❌ [HOUR-CALCULATOR] Erro ao calcular saldo:', error)
    throw error
  }
}

/**
 * Atualiza ou cria registro de saldo de horas
 */
export async function updateHourBalance(userId: string, date: Date = new Date()): Promise<void> {
  try {
    const calculation = await calculateHourBalance(userId, date)

    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    // Verificar se já existe registro para o dia
    const existingRecord = await (prisma as any).hourBalance.findFirst({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    })

    const data = {
      workedHours: calculation.workedHours,
      expectedHours: calculation.expectedHours,
      balance: calculation.dailyBalance,
      weeklyBalance: calculation.weeklyBalance,
      monthlyBalance: calculation.monthlyBalance,
      description: calculation.isComplete ? 'Dia completo' : 'Em andamento'
    }

    if (existingRecord) {
      // Atualizar registro existente
      await (prisma as any).hourBalance.update({
        where: { id: existingRecord.id },
        data
      })
    } else {
      // Criar novo registro
      await (prisma as any).hourBalance.create({
        data: {
          userId,
          date,
          ...data
        }
      })
    }

    // Atualizar saldo total do usuário
    const totalBalance = await (prisma as any).hourBalance.aggregate({
      where: { userId },
      _sum: { balance: true }
    })

    await (prisma.user as any).update({
      where: { id: userId },
      data: { hourBalance: totalBalance._sum.balance || 0 } as any
    })

    console.log(`✅ [HOUR-CALCULATOR] Saldo atualizado para usuário ${userId}: ${calculation.dailyBalance.toFixed(2)}h`)
  } catch (error) {
    console.error('❌ [HOUR-CALCULATOR] Erro ao atualizar saldo:', error)
    throw error
  }
}

/**
 * Calcula estatísticas de horas para relatórios
 */
export async function calculateHourStatistics(userId: string, startDate: Date, endDate: Date) {
  try {
    const records = await (prisma as any).hourBalance.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'asc' }
    })

    const totalWorked = records.reduce((sum: number, record: any) => sum + record.workedHours, 0)
    const totalExpected = records.reduce((sum: number, record: any) => sum + record.expectedHours, 0)
    const totalBalance = records.reduce((sum: number, record: any) => sum + record.balance, 0)
    
    const daysWorked = records.filter((record: any) => record.workedHours > 0).length
    const averageDaily = daysWorked > 0 ? totalWorked / daysWorked : 0
    
    const positiveBalanceDays = records.filter((record: any) => record.balance > 0).length
    const negativeBalanceDays = records.filter((record: any) => record.balance < 0).length
    
    return {
      period: {
        startDate,
        endDate,
        totalDays: records.length,
        daysWorked
      },
      hours: {
        totalWorked,
        totalExpected,
        totalBalance,
        averageDaily,
        efficiency: totalExpected > 0 ? (totalWorked / totalExpected) * 100 : 0
      },
      balance: {
        positive: positiveBalanceDays,
        negative: negativeBalanceDays,
        neutral: records.length - positiveBalanceDays - negativeBalanceDays
      },
      records
    }
  } catch (error) {
    console.error('❌ [HOUR-CALCULATOR] Erro ao calcular estatísticas:', error)
    throw error
  }
}

/**
 * Valida se um registro de ponto está dentro dos limites legais
 */
export async function validateWorkingHours(userId: string, entryTime: Date, exitTime?: Date): Promise<{
  isValid: boolean
  violations: string[]
  warnings: string[]
}> {
  try {
    const user = await (prisma.user as any).findUnique({
      where: { id: userId },
      select: {
        contractType: true,
        dailyHours: true,
        weeklyHours: true
      } as any
    })

    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    const violations: string[] = []
    const warnings: string[] = []

    // Se há horário de saída, validar duração
    if (exitTime) {
      const diffMs = exitTime.getTime() - entryTime.getTime()
      const workedHours = diffMs / (1000 * 60 * 60)

      const contractConfig = CONTRACT_CONFIGS[(user as any).contractType as keyof typeof CONTRACT_CONFIGS]
      const maxDailyHours = (user as any).contractType === 'CUSTOM' ? (user as any).dailyHours : contractConfig.dailyHours

      if (workedHours > maxDailyHours) {
        violations.push(`Excede limite diário: ${workedHours.toFixed(2)}h > ${maxDailyHours}h`)
      }

      if (workedHours > maxDailyHours * 0.9) {
        warnings.push(`Próximo do limite diário: ${workedHours.toFixed(2)}h`)
      }
    }

    // Validar horários noturnos (Lei do Estágio não permite trabalho noturno para menores)
    const entryHour = entryTime.getHours()
    const exitHour = exitTime?.getHours()

    if (entryHour < 6 || entryHour > 22) {
      warnings.push('Horário de entrada fora do período recomendado (6h-22h)')
    }

    if (exitHour && (exitHour < 6 || exitHour > 22)) {
      warnings.push('Horário de saída fora do período recomendado (6h-22h)')
    }

    return {
      isValid: violations.length === 0,
      violations,
      warnings
    }
  } catch (error) {
    console.error('❌ [HOUR-CALCULATOR] Erro ao validar horários:', error)
    throw error
  }
}
