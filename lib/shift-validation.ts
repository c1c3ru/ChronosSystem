/**
 * Validação de Turnos e Horários de Trabalho
 * 
 * Sistema inteligente para validar registros de ponto baseado em:
 * - Carga horária semanal (20h, 30h, 40h, etc)
 * - Turno do usuário (manhã, tarde, noite, híbrido)
 * - Horários de funcionamento do setor (8h-17h principal, até 22h extensível)
 * - Evitar múltiplas batidas de ponto desnecessárias
 */

interface UserShiftConfig {
  weeklyHours: number // Total de horas por semana (ex: 20)
  shift: 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'HYBRID' // Turno do usuário
  shiftStartTime: string // Horário de início (HH:MM)
  shiftEndTime: string // Horário de fim (HH:MM)
  workingDaysPerWeek: number // Dias de trabalho por semana (ex: 5)
  allowFlexibleHours: boolean // Permite horas flexíveis?
}

interface ShiftValidationResult {
  isValid: boolean
  reason: string
  expectedDailyHours: number
  currentShiftStart: string
  currentShiftEnd: string
  allowedEntryWindow: { start: string; end: string }
  allowedExitWindow: { start: string; end: string }
  warnings: string[]
  suggestions: string[]
}

// Horários padrão do setor de informática
const SECTOR_HOURS = {
  primary: { start: 8, end: 17 }, // 8h-17h (principal)
  extended: { start: 8, end: 22 } // 8h-22h (extensível)
}

const LUNCH_BREAK = {
  start: 12,
  end: 13
}

/**
 * Calcula as horas diárias esperadas baseado na carga semanal
 */
export function calculateExpectedDailyHours(
  weeklyHours: number,
  workingDaysPerWeek: number = 5
): number {
  return weeklyHours / workingDaysPerWeek
}

/**
 * Obtém o intervalo de entrada permitido para um turno
 */
export function getAllowedEntryWindow(
  shift: 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'HYBRID',
  shiftStartTime: string,
  shiftEndTime: string
): { start: string; end: string } {
  const [startHour, startMin] = shiftStartTime.split(':').map(Number)
  const [endHour, endMin] = shiftEndTime.split(':').map(Number)

  switch (shift) {
    case 'MORNING':
      // Manhã: 30min antes até 30min depois do início
      return {
        start: formatTime(startHour - 1, startMin),
        end: formatTime(startHour, startMin + 30)
      }

    case 'AFTERNOON':
      // Tarde: 30min antes até 30min depois do início
      return {
        start: formatTime(startHour - 1, startMin),
        end: formatTime(startHour, startMin + 30)
      }

    case 'NIGHT':
      // Noite: 1h antes até 1h depois do início
      return {
        start: formatTime(startHour - 1, startMin),
        end: formatTime(startHour + 1, startMin)
      }

    case 'HYBRID':
      // Híbrido: flexível, 1h antes até 1h depois do início
      return {
        start: formatTime(startHour - 1, startMin),
        end: formatTime(startHour + 1, startMin)
      }

    default:
      return { start: shiftStartTime, end: shiftEndTime }
  }
}

/**
 * Obtém o intervalo de saída permitido para um turno
 */
export function getAllowedExitWindow(
  shift: 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'HYBRID',
  shiftStartTime: string,
  shiftEndTime: string,
  expectedDailyHours: number
): { start: string; end: string } {
  const [endHour, endMin] = shiftEndTime.split(':').map(Number)

  switch (shift) {
    case 'MORNING':
      // Saída: 15min antes até 15min depois do horário esperado
      return {
        start: formatTime(endHour - 1, endMin - 15),
        end: formatTime(endHour, endMin + 15)
      }

    case 'AFTERNOON':
      // Saída: 15min antes até 15min depois do horário esperado
      return {
        start: formatTime(endHour - 1, endMin - 15),
        end: formatTime(endHour, endMin + 15)
      }

    case 'NIGHT':
      // Saída: 30min antes até 30min depois do horário esperado
      return {
        start: formatTime(endHour - 1, endMin - 30),
        end: formatTime(endHour, endMin + 30)
      }

    case 'HYBRID':
      // Saída: flexível, 1h antes até 1h depois do horário esperado
      return {
        start: formatTime(endHour - 1, endMin - 60),
        end: formatTime(endHour + 1, endMin + 60)
      }

    default:
      return { start: shiftEndTime, end: formatTime(endHour + 1, endMin) }
  }
}

/**
 * Valida se um horário de entrada está dentro da janela permitida
 */
export function validateEntryTime(
  entryTime: Date,
  config: UserShiftConfig
): ShiftValidationResult {
  const expectedDailyHours = calculateExpectedDailyHours(config.weeklyHours, config.workingDaysPerWeek)
  const allowedEntryWindow = getAllowedEntryWindow(config.shift, config.shiftStartTime, config.shiftEndTime)
  const allowedExitWindow = getAllowedExitWindow(config.shift, config.shiftStartTime, config.shiftEndTime, expectedDailyHours)

  const entryTimeStr = formatTime(entryTime.getHours(), entryTime.getMinutes())
  const isWithinWindow = isTimeWithinWindow(entryTimeStr, allowedEntryWindow.start, allowedEntryWindow.end)

  const warnings: string[] = []
  const suggestions: string[] = []

  // Verificar se está fora do horário de funcionamento do setor
  if (entryTime.getHours() < SECTOR_HOURS.primary.start) {
    warnings.push(`Entrada antes do horário de funcionamento do setor (${SECTOR_HOURS.primary.start}h)`)
    suggestions.push(`Verifique se realmente deseja entrar tão cedo`)
  }

  if (entryTime.getHours() > SECTOR_HOURS.extended.end) {
    warnings.push(`Entrada após o horário de funcionamento estendido (${SECTOR_HOURS.extended.end}h)`)
    suggestions.push(`Contate o administrador se for trabalho autorizado`)
  }

  // Verificar se está no intervalo de almoço
  if (entryTime.getHours() >= LUNCH_BREAK.start && entryTime.getHours() < LUNCH_BREAK.end) {
    warnings.push(`Entrada durante o intervalo de almoço (${LUNCH_BREAK.start}h-${LUNCH_BREAK.end}h)`)
    suggestions.push(`Verifique se não é um erro`)
  }

  return {
    isValid: isWithinWindow,
    reason: isWithinWindow
      ? `Entrada dentro da janela permitida (${allowedEntryWindow.start}-${allowedEntryWindow.end})`
      : `Entrada fora da janela permitida (${allowedEntryWindow.start}-${allowedEntryWindow.end})`,
    expectedDailyHours,
    currentShiftStart: config.shiftStartTime,
    currentShiftEnd: config.shiftEndTime,
    allowedEntryWindow,
    allowedExitWindow,
    warnings,
    suggestions
  }
}

/**
 * Valida se um horário de saída está dentro da janela permitida
 */
export function validateExitTime(
  entryTime: Date,
  exitTime: Date,
  config: UserShiftConfig
): ShiftValidationResult {
  const expectedDailyHours = calculateExpectedDailyHours(config.weeklyHours, config.workingDaysPerWeek)
  const allowedExitWindow = getAllowedExitWindow(config.shift, config.shiftStartTime, config.shiftEndTime, expectedDailyHours)
  const allowedEntryWindow = getAllowedEntryWindow(config.shift, config.shiftStartTime, config.shiftEndTime)

  const exitTimeStr = formatTime(exitTime.getHours(), exitTime.getMinutes())
  const isWithinWindow = isTimeWithinWindow(exitTimeStr, allowedExitWindow.start, allowedExitWindow.end)

  // Calcular horas trabalhadas
  const workedHours = (exitTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60)
  const tolerance = 0.5 // 30 minutos de tolerância

  const warnings: string[] = []
  const suggestions: string[] = []

  // Verificar se trabalhou menos do que o esperado
  if (workedHours < expectedDailyHours - tolerance) {
    warnings.push(`Horas trabalhadas (${workedHours.toFixed(2)}h) abaixo do esperado (${expectedDailyHours.toFixed(2)}h)`)
    suggestions.push(`Verifique se faltou registrar entrada ou saída`)
  }

  // Verificar se trabalhou muito mais do que o esperado
  if (workedHours > expectedDailyHours + 2) {
    warnings.push(`Horas trabalhadas (${workedHours.toFixed(2)}h) acima do esperado (${expectedDailyHours.toFixed(2)}h)`)
    suggestions.push(`Verifique se há horas extras autorizadas`)
  }

  // Verificar se está fora do horário de funcionamento do setor
  if (exitTime.getHours() > SECTOR_HOURS.extended.end) {
    warnings.push(`Saída após o horário de funcionamento estendido (${SECTOR_HOURS.extended.end}h)`)
    suggestions.push(`Contate o administrador se for trabalho autorizado`)
  }

  return {
    isValid: isWithinWindow,
    reason: isWithinWindow
      ? `Saída dentro da janela permitida (${allowedExitWindow.start}-${allowedExitWindow.end})`
      : `Saída fora da janela permitida (${allowedExitWindow.start}-${allowedExitWindow.end})`,
    expectedDailyHours,
    currentShiftStart: config.shiftStartTime,
    currentShiftEnd: config.shiftEndTime,
    allowedEntryWindow,
    allowedExitWindow,
    warnings,
    suggestions
  }
}

/**
 * Valida se múltiplas batidas de ponto são necessárias
 * Retorna true se a batida é válida e necessária
 */
export function validateMultipleClocks(
  lastRecordTime: Date | null,
  currentTime: Date,
  recordType: 'ENTRY' | 'EXIT',
  config: UserShiftConfig
): {
  isValid: boolean
  reason: string
  minutesSinceLastRecord?: number
} {
  // Se não há registro anterior, sempre é válido
  if (!lastRecordTime) {
    return {
      isValid: true,
      reason: 'Primeiro registro do dia'
    }
  }

  const minutesSince = (currentTime.getTime() - lastRecordTime.getTime()) / (1000 * 60)

  // Validação de duplicatas (mínimo 1 minuto entre registros)
  if (minutesSince < 1) {
    return {
      isValid: false,
      reason: `Registro muito próximo do anterior (${Math.floor(minutesSince)} segundos)`,
      minutesSinceLastRecord: minutesSince
    }
  }

  // Se é novo dia, sempre é válido
  if (!isSameDay(lastRecordTime, currentTime)) {
    return {
      isValid: true,
      reason: 'Novo dia de trabalho',
      minutesSinceLastRecord: minutesSince
    }
  }

  // Se passou mais de 4 horas, é válido (pausa/almoço)
  if (minutesSince > 240) {
    return {
      isValid: true,
      reason: `Intervalo longo desde último registro (${Math.floor(minutesSince / 60)}h)`,
      minutesSinceLastRecord: minutesSince
    }
  }

  // Se é saída, validar se está dentro da janela esperada
  if (recordType === 'EXIT') {
    const expectedDailyHours = calculateExpectedDailyHours(config.weeklyHours, config.workingDaysPerWeek)
    const expectedMinutes = expectedDailyHours * 60
    const tolerance = 30 // 30 minutos de tolerância

    if (minutesSince >= expectedMinutes - tolerance) {
      return {
        isValid: true,
        reason: `Saída dentro do tempo esperado (${Math.floor(minutesSince / 60)}h ${Math.floor(minutesSince % 60)}min)`,
        minutesSinceLastRecord: minutesSince
      }
    }
  }

  // Se é entrada e passou menos de 4 horas, pode ser pausa
  if (recordType === 'ENTRY' && minutesSince < 240) {
    return {
      isValid: true,
      reason: `Retorno de pausa (${Math.floor(minutesSince / 60)}h ${Math.floor(minutesSince % 60)}min)`,
      minutesSinceLastRecord: minutesSince
    }
  }

  return {
    isValid: true,
    reason: `Registro válido (${Math.floor(minutesSince / 60)}h ${Math.floor(minutesSince % 60)}min desde último)`,
    minutesSinceLastRecord: minutesSince
  }
}

/**
 * Formata hora e minuto em string HH:MM
 */
function formatTime(hour: number, minute: number): string {
  const h = Math.max(0, Math.min(23, hour))
  const m = Math.max(0, Math.min(59, minute))
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * Verifica se um horário está dentro de uma janela
 */
function isTimeWithinWindow(time: string, windowStart: string, windowEnd: string): boolean {
  const [timeH, timeM] = time.split(':').map(Number)
  const [startH, startM] = windowStart.split(':').map(Number)
  const [endH, endM] = windowEnd.split(':').map(Number)

  const timeMinutes = timeH * 60 + timeM
  const startMinutes = startH * 60 + startM
  const endMinutes = endH * 60 + endM

  // Se a janela cruza meia-noite (ex: 22:00 a 06:00)
  if (startMinutes > endMinutes) {
    return timeMinutes >= startMinutes || timeMinutes <= endMinutes
  }

  return timeMinutes >= startMinutes && timeMinutes <= endMinutes
}

/**
 * Verifica se duas datas são do mesmo dia
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

/**
 * Gera descrição legível do turno
 */
export function getShiftDescription(shift: 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'HYBRID'): string {
  const descriptions: Record<string, string> = {
    MORNING: 'Período da Manhã',
    AFTERNOON: 'Período da Tarde',
    NIGHT: 'Período Noturno',
    HYBRID: 'Período Híbrido'
  }
  return descriptions[shift] || shift
}

/**
 * Retorna os horários padrão de início e fim para cada turno
 */
export function getShiftStartTime(shift: 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'HYBRID'): { start: string; end: string } {
  const shiftTimes: Record<string, { start: string; end: string }> = {
    MORNING: { start: '08:00', end: '12:00' },      // 4h de manhã
    AFTERNOON: { start: '13:00', end: '17:00' },    // 4h de tarde
    NIGHT: { start: '18:00', end: '22:00' },        // 4h de noite
    HYBRID: { start: '08:00', end: '14:00' }        // 6h híbrido
  }
  return shiftTimes[shift] || { start: '08:00', end: '12:00' }
}
