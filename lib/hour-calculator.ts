import { prisma } from '@/lib/prisma'

// Configurações de contrato conforme Lei 11.788/2008
const CONTRACT_CONFIGS = {
  FUNDAMENTAL_20H: { dailyHours: 4, weeklyHours: 20 },
  SUPERIOR_30H: { dailyHours: 6, weeklyHours: 30 },
  ALTERNANCIA_40H: { dailyHours: 8, weeklyHours: 40 },
  CUSTOM: { dailyHours: 6, weeklyHours: 30 }, // Será sobrescrito pelos campos do usuário
}

interface HourCalculationResult {
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
async function calculateHourBalance(
  userId: string,
  date: Date = new Date()
): Promise<HourCalculationResult> {
  try {
    // Buscar dados do usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        contractType: true,
        weeklyHours: true,
        dailyHours: true,
      },
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
          lte: endOfDay,
        },
      },
      orderBy: { timestamp: 'asc' },
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
    if (
      attendanceRecords.length % 2 === 1 &&
      attendanceRecords[attendanceRecords.length - 1].type === 'ENTRY'
    ) {
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
    const contractConfig =
      CONTRACT_CONFIGS[user.contractType as keyof typeof CONTRACT_CONFIGS] ||
      CONTRACT_CONFIGS.CUSTOM
    const expectedHours =
      user.contractType === 'CUSTOM' ? user.dailyHours : contractConfig.dailyHours

    // Calcular saldo do dia
    const dailyBalance = workedHours - expectedHours

    // Calcular saldo semanal
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    const weeklyRecords = await prisma.hourBalance.findMany({
      where: {
        userId,
        date: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
    })

    const weeklyBalance =
      weeklyRecords.reduce((sum: number, record: { balance: number }) => sum + record.balance, 0) +
      dailyBalance

    // Calcular saldo mensal
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)

    const monthlyRecords = await prisma.hourBalance.findMany({
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    })

    const monthlyBalance =
      monthlyRecords.reduce((sum: number, record: { balance: number }) => sum + record.balance, 0) +
      dailyBalance

    return {
      workedHours,
      expectedHours,
      dailyBalance,
      weeklyBalance,
      monthlyBalance,
      isComplete,
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
    const existingRecord = await prisma.hourBalance.findFirst({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    })

    const data = {
      workedHours: calculation.workedHours,
      expectedHours: calculation.expectedHours,
      balance: calculation.dailyBalance,
      weeklyBalance: calculation.weeklyBalance,
      monthlyBalance: calculation.monthlyBalance,
      description: calculation.isComplete ? 'Dia completo' : 'Em andamento',
    }

    if (existingRecord) {
      // Atualizar registro existente
      await prisma.hourBalance.update({
        where: { id: existingRecord.id },
        data,
      })
    } else {
      // Criar novo registro
      await prisma.hourBalance.create({
        data: {
          userId,
          date,
          ...data,
        },
      })
    }

    // Atualizar saldo total do usuário
    const totalBalance = await prisma.hourBalance.aggregate({
      where: { userId },
      _sum: { balance: true },
    })

    await prisma.user.update({
      where: { id: userId },
      data: { hourBalance: totalBalance._sum.balance || 0 },
    })

    console.log(
      `✅ [HOUR-CALCULATOR] Saldo atualizado para usuário ${userId}: ${calculation.dailyBalance.toFixed(2)}h`
    )
  } catch (error) {
    console.error('❌ [HOUR-CALCULATOR] Erro ao atualizar saldo:', error)
    throw error
  }
}
