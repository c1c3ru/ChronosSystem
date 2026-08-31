/**
 * Validação de Turnos e Horários de Trabalho
 */

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
 * Gera descrição legível do turno
 */
export function getShiftDescription(shift: 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'HYBRID'): string {
  const descriptions: Record<string, string> = {
    MORNING: 'Período da Manhã',
    AFTERNOON: 'Período da Tarde',
    NIGHT: 'Período Noturno',
    HYBRID: 'Período Híbrido',
  }
  return descriptions[shift] || shift
}

/**
 * Retorna os horários padrão de início e fim para cada turno
 */
export function getShiftStartTime(shift: 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'HYBRID'): {
  start: string
  end: string
} {
  const shiftTimes: Record<string, { start: string; end: string }> = {
    MORNING: { start: '08:00', end: '12:00' }, // 4h de manhã
    AFTERNOON: { start: '13:00', end: '17:00' }, // 4h de tarde
    NIGHT: { start: '18:00', end: '22:00' }, // 4h de noite
    HYBRID: { start: '08:00', end: '14:00' }, // 6h híbrido
  }
  return shiftTimes[shift] || { start: '08:00', end: '12:00' }
}
