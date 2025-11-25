/**
 * Lógica inteligente para determinar tipo de registro de ponto
 * Considera horários de trabalho, contexto temporal e regras de negócio
 */

import { prisma } from '@/lib/prisma'
import { isNationalHoliday } from '@/lib/holidays'

interface WorkingHours {
  start: string // "08:00"
  end: string   // "17:00"
  lunchStart: string // "12:00"
  lunchEnd: string   // "13:00"
}

interface LastRecord {
  type: 'ENTRY' | 'EXIT'
  timestamp: Date
}

interface AttendanceContext {
  userId: string
  currentTime: Date
  lastRecord: LastRecord | null
  workingHours: WorkingHours
  isWeekend?: boolean
  isHoliday?: boolean
  hasAuthorization?: boolean // Autorização para trabalhar em feriados/fins de semana
}

// Horários padrão IFCE (configurável por usuário/departamento)
export const DEFAULT_WORKING_HOURS: WorkingHours = {
  start: "08:00",
  end: "17:00",
  lunchStart: "12:00",
  lunchEnd: "13:00"
}

/**
 * Determina inteligentemente se o registro deve ser ENTRY ou EXIT
 */
export function determineRecordType(context: AttendanceContext): {
  type: 'ENTRY' | 'EXIT'
  reason: string
  confidence: 'high' | 'medium' | 'low'
  suggestions?: string[]
} {
  const { currentTime, lastRecord, workingHours, isWeekend, isHoliday } = context

  // Converter horários para minutos para facilitar comparações
  const currentMinutes = timeToMinutes(currentTime)
  const workStart = parseTimeToMinutes(workingHours.start)
  const workEnd = parseTimeToMinutes(workingHours.end)
  const lunchStart = parseTimeToMinutes(workingHours.lunchStart)
  const lunchEnd = parseTimeToMinutes(workingHours.lunchEnd)

  // REGRA 1: Se não há registro anterior, sempre é ENTRADA
  if (!lastRecord) {
    return {
      type: 'ENTRY',
      reason: 'Primeiro registro do usuário',
      confidence: 'high'
    }
  }

  // REGRA 2: Verificar se é um novo dia de trabalho
  const isNewWorkDay = isNewDay(lastRecord.timestamp, currentTime)
  if (isNewWorkDay) {
    return {
      type: 'ENTRY',
      reason: 'Novo dia de trabalho',
      confidence: 'high'
    }
  }

  // REGRA 3: Verificar intervalo desde último registro
  const minutesSinceLastRecord = getMinutesDifference(lastRecord.timestamp, currentTime)

  // 🔒 REGRA CRÍTICA: Impedir múltiplas entradas consecutivas
  // Se o último registro foi ENTRADA, o próximo DEVE ser SAÍDA (exceto após 12h = novo dia)
  if (lastRecord.type === 'ENTRY' && minutesSinceLastRecord < 720) { // 720 min = 12 horas
    return {
      type: 'EXIT',
      reason: 'Última ação foi entrada - saída obrigatória',
      confidence: 'high',
      suggestions: ['Você deve registrar SAÍDA antes de fazer nova entrada']
    }
  }

  // Se passou muito tempo (>12 horas), é um novo dia/turno
  if (minutesSinceLastRecord > 720) {
    return {
      type: 'ENTRY',
      reason: `Novo turno/dia de trabalho (${Math.floor(minutesSinceLastRecord / 60)}h desde último registro)`,
      confidence: 'high'
    }
  }

  // REGRA 4: Análise por contexto de horário
  const timeContext = getTimeContext(currentMinutes, workStart, workEnd, lunchStart, lunchEnd)

  switch (timeContext) {
    case 'before_work':
      // Antes do horário de trabalho
      if (lastRecord.type === 'EXIT') {
        return {
          type: 'ENTRY',
          reason: 'Entrada antecipada (antes do horário normal)',
          confidence: 'high'
        }
      } else {
        return {
          type: 'EXIT',
          reason: 'Saída muito cedo (possível erro)',
          confidence: 'low',
          suggestions: ['Verifique se realmente deseja registrar saída antes do horário de trabalho']
        }
      }

    case 'work_morning':
      // Período da manhã (08:00-12:00)
      if (lastRecord.type === 'EXIT') {
        return {
          type: 'ENTRY',
          reason: 'Entrada no período da manhã',
          confidence: 'high'
        }
      } else {
        // Última foi entrada, agora pode ser saída para almoço ou emergência
        if (currentMinutes >= lunchStart - 30) { // 30min antes do almoço
          return {
            type: 'EXIT',
            reason: 'Saída para almoço',
            confidence: 'high'
          }
        } else {
          return {
            type: 'EXIT',
            reason: 'Saída durante período da manhã (pausa/emergência)',
            confidence: 'medium',
            suggestions: ['Confirme se é uma saída temporária ou fim do expediente']
          }
        }
      }

    case 'lunch_time':
      // Horário de almoço (12:00-13:00)
      if (lastRecord.type === 'ENTRY') {
        return {
          type: 'EXIT',
          reason: 'Saída para almoço',
          confidence: 'high'
        }
      } else {
        return {
          type: 'ENTRY',
          reason: 'Retorno do almoço',
          confidence: 'high'
        }
      }

    case 'work_afternoon':
      // Período da tarde (13:00-17:00)
      if (lastRecord.type === 'EXIT') {
        return {
          type: 'ENTRY',
          reason: 'Entrada no período da tarde',
          confidence: 'high'
        }
      } else {
        // Pode ser saída final ou pausa
        if (currentMinutes >= workEnd - 60) { // 1h antes do fim
          return {
            type: 'EXIT',
            reason: 'Saída do expediente',
            confidence: 'high'
          }
        } else {
          return {
            type: 'EXIT',
            reason: 'Saída durante período da tarde (pausa/emergência)',
            confidence: 'medium',
            suggestions: ['Confirme se é uma saída temporária ou fim do expediente']
          }
        }
      }

    case 'after_work':
      // Após horário de trabalho
      if (lastRecord.type === 'ENTRY') {
        return {
          type: 'EXIT',
          reason: 'Saída após horário normal (hora extra)',
          confidence: 'high'
        }
      } else {
        return {
          type: 'ENTRY',
          reason: 'Entrada fora do horário (hora extra/plantão)',
          confidence: 'medium',
          suggestions: ['Confirme se é trabalho extra autorizado']
        }
      }

    case 'night':
      // Período noturno
      return {
        type: lastRecord.type === 'ENTRY' ? 'EXIT' : 'ENTRY',
        reason: 'Registro noturno (plantão/emergência)',
        confidence: 'low',
        suggestions: ['Verifique se é trabalho noturno autorizado']
      }
  }

  // FALLBACK: Lógica simples de alternância
  return {
    type: lastRecord.type === 'ENTRY' ? 'EXIT' : 'ENTRY',
    reason: 'Alternância simples (fallback)',
    confidence: 'low'
  }
}

/**
 * Determina o contexto temporal atual
 */
function getTimeContext(
  currentMinutes: number,
  workStart: number,
  workEnd: number,
  lunchStart: number,
  lunchEnd: number
): 'before_work' | 'work_morning' | 'lunch_time' | 'work_afternoon' | 'after_work' | 'night' {

  if (currentMinutes < workStart - 60) { // Mais de 1h antes do trabalho
    return 'night'
  }

  if (currentMinutes < workStart) {
    return 'before_work'
  }

  if (currentMinutes < lunchStart) {
    return 'work_morning'
  }

  if (currentMinutes < lunchEnd) {
    return 'lunch_time'
  }

  if (currentMinutes < workEnd) {
    return 'work_afternoon'
  }

  if (currentMinutes < workEnd + 120) { // Até 2h após o trabalho
    return 'after_work'
  }

  return 'night'
}

/**
 * Converte horário "HH:MM" para minutos
 */
function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Converte Date para minutos do dia
 */
function timeToMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes()
}

/**
 * Verifica se é um novo dia
 */
function isNewDay(lastDate: Date, currentDate: Date): boolean {
  return lastDate.toDateString() !== currentDate.toDateString()
}

/**
 * Calcula diferença em minutos entre duas datas
 */
function getMinutesDifference(date1: Date, date2: Date): number {
  return Math.abs(date2.getTime() - date1.getTime()) / (1000 * 60)
}

/**
 * Verifica se é fim de semana
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6 // Domingo ou Sábado
}

/**
 * Obtém horários de trabalho do usuário do banco de dados
 */
export async function getUserWorkingHours(userId: string): Promise<WorkingHours> {
  try {
    const user = await (prisma as any).user.findUnique({
      where: { id: userId },
      select: {
        shiftStartTime: true,
        shiftEndTime: true
      }
    })

    if (user && user.shiftStartTime && user.shiftEndTime) {
      return {
        start: user.shiftStartTime,
        end: user.shiftEndTime,
        lunchStart: DEFAULT_WORKING_HOURS.lunchStart,
        lunchEnd: DEFAULT_WORKING_HOURS.lunchEnd
      }
    }
  } catch (error) {
    console.warn('Erro ao buscar horários do usuário, usando padrão:', error)
  }

  // Fallback para padrão IFCE
  return DEFAULT_WORKING_HOURS
}

/**
 * 🎯 Detecta se há atraso na entrada (> 30 minutos)
 */
export function detectLateArrival(entryTime: Date, workingHours: WorkingHours): {
  isLate: boolean
  minutesLate: number
  requiresJustification: boolean
} {
  const entryMinutes = timeToMinutes(entryTime)
  const expectedStartMinutes = parseTimeToMinutes(workingHours.start)
  const minutesLate = entryMinutes - expectedStartMinutes

  return {
    isLate: minutesLate > 0,
    minutesLate: Math.max(0, minutesLate),
    requiresJustification: minutesLate > 30 // Atraso > 30 min requer justificativa
  }
}

/**
 * 🎯 Detecta se há saída antecipada (faltando > 10 min para completar carga horária)
 */
export function detectEarlyDeparture(
  entryTime: Date,
  exitTime: Date,
  workingHours: WorkingHours,
  expectedDailyHours: number = 8 // Padrão: 8 horas/dia
): {
  isEarly: boolean
  minutesShort: number
  hoursWorked: number
  requiresJustification: boolean
} {
  // Calcular horas trabalhadas (descontando almoço)
  const totalMinutes = getMinutesDifference(entryTime, exitTime)
  const lunchStart = parseTimeToMinutes(workingHours.lunchStart)
  const lunchEnd = parseTimeToMinutes(workingHours.lunchEnd)
  const lunchDuration = lunchEnd - lunchStart

  // Verificar se o período de trabalho inclui o almoço
  const entryMinutes = timeToMinutes(entryTime)
  const exitMinutes = timeToMinutes(exitTime)
  const includesLunch = entryMinutes < lunchStart && exitMinutes > lunchEnd

  const workedMinutes = includesLunch ? totalMinutes - lunchDuration : totalMinutes
  const hoursWorked = workedMinutes / 60
  const expectedMinutes = expectedDailyHours * 60
  const minutesShort = expectedMinutes - workedMinutes

  return {
    isEarly: minutesShort > 0,
    minutesShort: Math.max(0, minutesShort),
    hoursWorked,
    requiresJustification: minutesShort > 10 // Faltando > 10 min requer justificativa
  }
}

/**
 * 🎯 Analisa um dia completo e retorna alertas de justificativa necessária
 */
export interface DayAnalysis {
  date: string
  hasEntry: boolean
  hasExit: boolean
  isComplete: boolean
  lateArrival?: {
    minutesLate: number
    requiresJustification: boolean
  }
  earlyDeparture?: {
    minutesShort: number
    hoursWorked: number
    requiresJustification: boolean
  }
  absence?: {
    requiresJustification: boolean
  }
  requiresJustification: boolean
  justificationReason?: string
}

export function analyzeDayForJustification(
  date: Date,
  entryRecord: { timestamp: Date } | null,
  exitRecord: { timestamp: Date } | null,
  workingHours: WorkingHours,
  isWorkDay: boolean = true
): DayAnalysis {
  const dateStr = date.toISOString().split('T')[0]

  const analysis: DayAnalysis = {
    date: dateStr,
    hasEntry: !!entryRecord,
    hasExit: !!exitRecord,
    isComplete: !!entryRecord && !!exitRecord,
    requiresJustification: false
  }

  // Se não é dia de trabalho, não requer justificativa
  if (!isWorkDay) {
    return analysis
  }

  // CASO 1: Falta completa (sem entrada e sem saída)
  if (!entryRecord && !exitRecord) {
    analysis.absence = {
      requiresJustification: true
    }
    analysis.requiresJustification = true
    analysis.justificationReason = 'Falta não justificada'
    return analysis
  }

  // CASO 2: Atraso na entrada
  if (entryRecord) {
    const lateCheck = detectLateArrival(entryRecord.timestamp, workingHours)
    if (lateCheck.isLate) {
      analysis.lateArrival = {
        minutesLate: lateCheck.minutesLate,
        requiresJustification: lateCheck.requiresJustification
      }
      if (lateCheck.requiresJustification) {
        analysis.requiresJustification = true
        analysis.justificationReason = `Atraso de ${lateCheck.minutesLate} minutos (> 30 min)`
      }
    }
  }

  // CASO 3: Saída antecipada
  if (entryRecord && exitRecord) {
    const earlyCheck = detectEarlyDeparture(entryRecord.timestamp, exitRecord.timestamp, workingHours)
    if (earlyCheck.isEarly) {
      analysis.earlyDeparture = {
        minutesShort: earlyCheck.minutesShort,
        hoursWorked: earlyCheck.hoursWorked,
        requiresJustification: earlyCheck.requiresJustification
      }
      if (earlyCheck.requiresJustification) {
        analysis.requiresJustification = true
        analysis.justificationReason = `Saída antecipada: faltam ${earlyCheck.minutesShort} minutos (> 10 min)`
      }
    }
  }

  // CASO 4: Apenas entrada sem saída (dia incompleto)
  if (entryRecord && !exitRecord) {
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    // Se não é hoje e não tem saída, requer justificativa
    if (!isToday) {
      analysis.requiresJustification = true
      analysis.justificationReason = 'Registro de saída não encontrado'
    }
  }

  return analysis
}

/**
 * Valida se o registro faz sentido
 */
export function validateRecord(context: AttendanceContext, suggestedType: 'ENTRY' | 'EXIT'): {
  isValid: boolean
  warnings: string[]
  errors: string[]
} {
  const warnings: string[] = []
  const errors: string[] = []

  const { currentTime, lastRecord, workingHours, hasAuthorization } = context

  // VALIDAÇÃO CRÍTICA: Verificar se é feriado nacional
  const holidayCheck = isNationalHoliday(currentTime)
  if (holidayCheck.isHoliday && !hasAuthorization) {
    errors.push(`Registro bloqueado: Hoje é feriado nacional (${holidayCheck.holidayName}). Não é permitido registrar ponto em feriados sem autorização prévia.`)
  }

  // VALIDAÇÃO CRÍTICA: Verificar se é fim de semana
  if (isWeekend(currentTime) && !hasAuthorization) {
    const dayName = currentTime.getDay() === 0 ? 'domingo' : 'sábado'
    errors.push(`Registro bloqueado: Hoje é ${dayName}. Não é permitido registrar ponto em finais de semana sem autorização prévia.`)
  }

  // Verificar registros muito próximos
  if (lastRecord) {
    const minutesSince = getMinutesDifference(lastRecord.timestamp, currentTime)
    if (minutesSince < 5) {
      errors.push(`Registro muito próximo do anterior (${Math.floor(minutesSince)} minutos)`)
    }
  }

  // Verificar horários suspeitos (apenas warning, não bloqueia)
  const currentHour = currentTime.getHours()
  if (currentHour < 6 || currentHour > 22) {
    warnings.push('Registro em horário não convencional (antes das 6h ou depois das 22h)')
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors
  }
}
