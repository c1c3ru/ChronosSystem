import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceType } from '@prisma/client';

interface WorkPeriod {
  entry: Date;
  exit: Date | null;
}

export interface DailySummary {
  date: Date;
  firstEntry: Date | null;
  lastExit: Date | null;
  totalMinutes: number;
  breakMinutes: number;
  workedMinutes: number;
  hasIncomplete: boolean;
  hasExtraHours: boolean;
  hasViolation: boolean;
  violationReason: string | null;
  entriesCount: number;
  exitsCount: number;
}

export interface ContractSummary {
  totalWorkedHours: number;
  totalContractHours: number;
  remainingHours: number;
  percentageComplete: number;
  daysRemaining: number;
  averageHoursPerDay: number;
  projectedEndDate: Date | null;
  isOnTrack: boolean;
}

@Injectable()
export class WorkHoursService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calcula o resumo de trabalho para um dia específico
   */
  async calculateDailySummary(userId: string, date: Date): Promise<DailySummary> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Buscar todos os registros do dia
    const records = await this.prisma.attendanceRecord.findMany({
      where: {
        userId,
        tsServer: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { tsServer: 'asc' },
    });

    // Separar entradas e saídas
    const entries = records.filter(r => r.type === AttendanceType.ENTRADA);
    const exits = records.filter(r => r.type === AttendanceType.SAIDA);

    // Criar períodos de trabalho
    const periods: WorkPeriod[] = [];
    let hasIncomplete = false;

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const exit = exits[i] || null;
      
      if (!exit) {
        hasIncomplete = true;
      }
      
      periods.push({
        entry: entry.tsServer,
        exit: exit ? exit.tsServer : null,
      });
    }

    // Calcular minutos trabalhados
    let totalMinutes = 0;
    let breakMinutes = 0;

    for (let i = 0; i < periods.length; i++) {
      const period = periods[i];
      
      if (period.exit) {
        const minutes = Math.floor((period.exit.getTime() - period.entry.getTime()) / 60000);
        totalMinutes += minutes;

        // Calcular intervalo entre períodos
        if (i > 0 && periods[i - 1].exit) {
          const breakTime = Math.floor((period.entry.getTime() - periods[i - 1].exit!.getTime()) / 60000);
          breakMinutes += breakTime;
        }
      }
    }

    const workedMinutes = totalMinutes;

    // Buscar dados do usuário para validações
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { dailyHours: true },
    });

    const maxDailyMinutes = (user?.dailyHours || 6) * 60;
    const hasExtraHours = workedMinutes > maxDailyMinutes;

    // Validações
    let hasViolation = false;
    let violationReason: string | null = null;

    // Validar jornada máxima (6h para estagiários)
    if (workedMinutes > maxDailyMinutes + 30) { // Tolerância de 30min
      hasViolation = true;
      violationReason = `Jornada excede o limite de ${user?.dailyHours || 6}h diárias`;
    }

    // Validar intervalo obrigatório (15min após 4h)
    if (workedMinutes > 240 && periods.length === 1) {
      hasViolation = true;
      violationReason = 'Falta intervalo obrigatório de 15min após 4h de trabalho';
    }

    // Validar entrada sem saída
    if (hasIncomplete) {
      hasViolation = true;
      violationReason = 'Registro incompleto: entrada sem saída correspondente';
    }

    return {
      date,
      firstEntry: entries[0]?.tsServer || null,
      lastExit: exits[exits.length - 1]?.tsServer || null,
      totalMinutes,
      breakMinutes,
      workedMinutes,
      hasIncomplete,
      hasExtraHours,
      hasViolation,
      violationReason,
      entriesCount: entries.length,
      exitsCount: exits.length,
    };
  }

  /**
   * Salva ou atualiza o resumo diário no banco
   */
  async saveDailySummary(userId: string, date: Date): Promise<void> {
    const summary = await this.calculateDailySummary(userId, date);

    await this.prisma.workSummary.upsert({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
      create: {
        userId,
        date,
        firstEntry: summary.firstEntry,
        lastExit: summary.lastExit,
        totalMinutes: summary.totalMinutes,
        breakMinutes: summary.breakMinutes,
        workedMinutes: summary.workedMinutes,
        hasIncomplete: summary.hasIncomplete,
        hasExtraHours: summary.hasExtraHours,
        hasViolation: summary.hasViolation,
        violationReason: summary.violationReason,
        entriesCount: summary.entriesCount,
        exitsCount: summary.exitsCount,
      },
      update: {
        firstEntry: summary.firstEntry,
        lastExit: summary.lastExit,
        totalMinutes: summary.totalMinutes,
        breakMinutes: summary.breakMinutes,
        workedMinutes: summary.workedMinutes,
        hasIncomplete: summary.hasIncomplete,
        hasExtraHours: summary.hasExtraHours,
        hasViolation: summary.hasViolation,
        violationReason: summary.violationReason,
        entriesCount: summary.entriesCount,
        exitsCount: summary.exitsCount,
      },
    });
  }

  /**
   * Calcula o resumo do contrato (horas cumpridas vs. restantes)
   */
  async calculateContractSummary(userId: string): Promise<ContractSummary> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        contractStartDate: true,
        contractEndDate: true,
        totalContractHours: true,
        weeklyHours: true,
        dailyHours: true,
      },
    });

    if (!user?.contractStartDate || !user?.totalContractHours) {
      throw new Error('Usuário não possui dados de contrato configurados');
    }

    // Buscar todos os resumos de trabalho
    const summaries = await this.prisma.workSummary.findMany({
      where: {
        userId,
        date: {
          gte: user.contractStartDate,
        },
      },
      select: {
        workedMinutes: true,
      },
    });

    // Calcular total de horas trabalhadas
    const totalWorkedMinutes = summaries.reduce((sum, s) => sum + s.workedMinutes, 0);
    const totalWorkedHours = Math.floor(totalWorkedMinutes / 60);

    const totalContractHours = user.totalContractHours;
    const remainingHours = Math.max(0, totalContractHours - totalWorkedHours);
    const percentageComplete = Math.min(100, (totalWorkedHours / totalContractHours) * 100);

    // Calcular dias restantes
    let daysRemaining = 0;
    let projectedEndDate: Date | null = null;
    let isOnTrack = true;

    if (user.contractEndDate) {
      const now = new Date();
      const endDate = new Date(user.contractEndDate);
      daysRemaining = Math.max(0, Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    }

    // Calcular média de horas por dia
    const workDays = summaries.length || 1;
    const averageHoursPerDay = totalWorkedHours / workDays;

    // Projetar data de término
    if (remainingHours > 0 && averageHoursPerDay > 0) {
      const daysNeeded = Math.ceil(remainingHours / averageHoursPerDay);
      projectedEndDate = new Date();
      projectedEndDate.setDate(projectedEndDate.getDate() + daysNeeded);

      // Verificar se está no prazo
      if (user.contractEndDate) {
        isOnTrack = projectedEndDate <= new Date(user.contractEndDate);
      }
    }

    return {
      totalWorkedHours,
      totalContractHours,
      remainingHours,
      percentageComplete: Math.round(percentageComplete * 100) / 100,
      daysRemaining,
      averageHoursPerDay: Math.round(averageHoursPerDay * 100) / 100,
      projectedEndDate,
      isOnTrack,
    };
  }

  /**
   * Valida se um novo registro é permitido
   */
  async validateNewAttendance(
    userId: string,
    type: AttendanceType,
    timestamp: Date,
  ): Promise<{ valid: boolean; reason?: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { dailyHours: true },
    });

    const startOfDay = new Date(timestamp);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(timestamp);
    endOfDay.setHours(23, 59, 59, 999);

    // Buscar último registro do dia
    const lastRecord = await this.prisma.attendanceRecord.findFirst({
      where: {
        userId,
        tsServer: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { tsServer: 'desc' },
    });

    // Validar sequência ENTRADA -> SAÍDA
    if (lastRecord) {
      if (lastRecord.type === type) {
        return {
          valid: false,
          reason: `Não é possível registrar ${type} consecutivamente. Último registro: ${lastRecord.type}`,
        };
      }
    } else {
      // Primeiro registro do dia deve ser ENTRADA
      if (type === AttendanceType.SAIDA) {
        return {
          valid: false,
          reason: 'O primeiro registro do dia deve ser uma ENTRADA',
        };
      }
    }

    // Validar horário permitido (06:00 - 22:00)
    const hour = timestamp.getHours();
    if (hour < 6 || hour >= 22) {
      return {
        valid: false,
        reason: 'Horário não permitido. Registros devem ser entre 06:00 e 22:00',
      };
    }

    // Validar jornada máxima
    const summary = await this.calculateDailySummary(userId, timestamp);
    const maxDailyMinutes = (user?.dailyHours || 6) * 60;

    if (type === AttendanceType.SAIDA && summary.workedMinutes >= maxDailyMinutes) {
      return {
        valid: false,
        reason: `Jornada máxima de ${user?.dailyHours || 6}h já foi atingida`,
      };
    }

    return { valid: true };
  }

  /**
   * Busca resumo semanal
   */
  async getWeeklySummary(userId: string, startDate: Date) {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    const summaries = await this.prisma.workSummary.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    const totalWorkedMinutes = summaries.reduce((sum, s) => sum + s.workedMinutes, 0);
    const totalWorkedHours = Math.floor(totalWorkedMinutes / 60);
    const daysWorked = summaries.filter(s => s.workedMinutes > 0).length;

    return {
      startDate,
      endDate,
      summaries,
      totalWorkedHours,
      daysWorked,
      averageHoursPerDay: daysWorked > 0 ? totalWorkedHours / daysWorked : 0,
    };
  }

  /**
   * Busca resumo mensal
   */
  async getMonthlySummary(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const summaries = await this.prisma.workSummary.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    const totalWorkedMinutes = summaries.reduce((sum, s) => sum + s.workedMinutes, 0);
    const totalWorkedHours = Math.floor(totalWorkedMinutes / 60);
    const daysWorked = summaries.filter(s => s.workedMinutes > 0).length;
    const daysWithViolation = summaries.filter(s => s.hasViolation).length;

    return {
      year,
      month,
      startDate,
      endDate,
      summaries,
      totalWorkedHours,
      daysWorked,
      daysWithViolation,
      averageHoursPerDay: daysWorked > 0 ? totalWorkedHours / daysWorked : 0,
    };
  }
}
