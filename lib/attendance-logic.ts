/**
 * Lógica inteligente para determinar tipo de registro de ponto
 * Considera horários de trabalho, contexto temporal e regras de negócio
 */

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
  
  // Se passou muito tempo (>4 horas), provavelmente é nova entrada
  if (minutesSinceLastRecord > 240) {
    return {
      type: 'ENTRY',
      reason: `Intervalo longo desde último registro (${Math.floor(minutesSinceLastRecord / 60)}h)`,
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
 * Obtém horários de trabalho do usuário (futura implementação)
 */
export async function getUserWorkingHours(userId: string): Promise<WorkingHours> {
  // TODO: Buscar do banco de dados baseado no usuário/departamento
  // Por enquanto, retorna padrão IFCE
  return DEFAULT_WORKING_HOURS
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
  
  const { currentTime, lastRecord, workingHours } = context
  
  // Verificar registros muito próximos
  if (lastRecord) {
    const minutesSince = getMinutesDifference(lastRecord.timestamp, currentTime)
    if (minutesSince < 5) {
      errors.push(`Registro muito próximo do anterior (${Math.floor(minutesSince)} minutos)`)
    }
  }
  
  // Verificar horários suspeitos
  const currentHour = currentTime.getHours()
  if (currentHour < 6 || currentHour > 22) {
    warnings.push('Registro em horário não convencional')
  }
  
  // Verificar fim de semana
  if (isWeekend(currentTime)) {
    warnings.push('Registro em fim de semana')
  }
  
  return {
    isValid: errors.length === 0,
    warnings,
    errors
  }
}
