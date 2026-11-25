/**
 * Horário semanal do estagiário: quais dias da semana ele trabalha e o
 * horário de cada dia (as aulas mudam e nem todo dia é igual).
 *
 * Gravado em `User.weeklySchedule` (JSON) como uma lista de dias trabalhados.
 * Cadastros antigos não têm essa lista (null): para eles vale o modelo
 * anterior, mesmo horário (`shiftStartTime`–`shiftEndTime`) nos primeiros
 * `workingDaysPerWeek` dias a partir de segunda.
 *
 * `shiftStartTime`, `shiftEndTime` e `workingDaysPerWeek` continuam gravados
 * (derivados por `summarizeSchedule`) para telas e relatórios que ainda leem
 * só esses campos.
 *
 * Dias: segunda = 0 … domingo = 6 (mesma convenção de `weekdayIndex` em
 * `lib/schedule-status.ts`).
 */

import { PROFILE_MESSAGES, TIME_PATTERN } from '@/lib/profile-validation'

export interface DaySchedule {
  day: number
  start: string
  end: string
}

export type WeeklySchedule = DaySchedule[]

export interface ScheduleSource {
  shiftStartTime: string
  shiftEndTime: string
  workingDaysPerWeek: number
  weeklySchedule?: unknown
}

export const WEEKDAY_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] as const
export const WEEKDAY_NAMES = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
  'Domingo',
] as const

export const SCHEDULE_MESSAGES = {
  noDays: 'Marque pelo menos um dia da semana em que você faz o estágio.',
  invalid: 'Horário semanal inválido. Recarregue a página e tente de novo.',
} as const

/** Chave de erro de um dia, usada no formulário e na API. */
export const dayErrorKey = (day: number) => `weeklySchedule.${day}`

/** Lê o JSON gravado; devolve null se não houver lista válida (cadastro antigo). */
export function parseWeeklySchedule(raw: unknown): WeeklySchedule | null {
  if (!Array.isArray(raw)) return null
  const days: WeeklySchedule = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') return null
    const { day, start, end } = item as Record<string, unknown>
    if (typeof day !== 'number' || !Number.isInteger(day) || day < 0 || day > 6) return null
    if (typeof start !== 'string' || typeof end !== 'string') return null
    days.push({ day, start, end })
  }
  return sortSchedule(days)
}

export function sortSchedule(schedule: WeeklySchedule): WeeklySchedule {
  return [...schedule].sort((a, b) => a.day - b.day)
}

/** Mesmo horário nos primeiros N dias a partir de segunda (modelo antigo). */
export function uniformSchedule(start: string, end: string, days: number[]): WeeklySchedule {
  return sortSchedule(days.map((day) => ({ day, start, end })))
}

/** Horário semanal efetivo: o gravado ou, se não houver, o do modelo antigo. */
export function resolveWeeklySchedule(src: ScheduleSource): WeeklySchedule {
  const parsed = parseWeeklySchedule(src.weeklySchedule)
  if (parsed) return parsed
  const count = Math.min(Math.max(src.workingDaysPerWeek ?? 5, 0), 7)
  return uniformSchedule(
    src.shiftStartTime,
    src.shiftEndTime,
    Array.from({ length: count }, (_, i) => i)
  )
}

/** Horário de um dia da semana (0 = segunda), ou null se não trabalha nesse dia. */
export function scheduleForDay(
  src: ScheduleSource,
  day: number
): { start: string; end: string } | null {
  const found = resolveWeeklySchedule(src).find((d) => d.day === day)
  return found ? { start: found.start, end: found.end } : null
}

/** Todos os dias com o mesmo início e fim? */
export function isUniformSchedule(schedule: WeeklySchedule): boolean {
  return schedule.every((d) => d.start === schedule[0]?.start && d.end === schedule[0]?.end)
}

/**
 * Valida a lista: pelo menos um dia, dias sem repetição, HH:MM e fim depois
 * do início. Erros por dia usam `dayErrorKey(day)`.
 */
export function validateWeeklySchedule(schedule: unknown): Record<string, string> {
  const parsed = parseWeeklySchedule(schedule)
  if (!parsed) return { weeklySchedule: SCHEDULE_MESSAGES.invalid }
  if (parsed.length === 0) return { weeklySchedule: SCHEDULE_MESSAGES.noDays }
  if (new Set(parsed.map((d) => d.day)).size !== parsed.length) {
    return { weeklySchedule: SCHEDULE_MESSAGES.invalid }
  }
  const errors: Record<string, string> = {}
  for (const d of parsed) {
    if (!TIME_PATTERN.test(d.start)) {
      errors[dayErrorKey(d.day)] = `${WEEKDAY_NAMES[d.day]}: ${PROFILE_MESSAGES.shiftStartRequired}`
    } else if (!TIME_PATTERN.test(d.end)) {
      errors[dayErrorKey(d.day)] = `${WEEKDAY_NAMES[d.day]}: ${PROFILE_MESSAGES.shiftEndRequired}`
    } else if (d.end <= d.start) {
      errors[dayErrorKey(d.day)] =
        `${WEEKDAY_NAMES[d.day]}: ${PROFILE_MESSAGES.shiftEndBeforeStart}`
    }
  }
  return errors
}

/**
 * Campos legados derivados do horário semanal: início/fim do primeiro dia
 * trabalhado e a quantidade de dias.
 */
export function summarizeSchedule(schedule: WeeklySchedule): {
  shiftStartTime: string
  shiftEndTime: string
  workingDaysPerWeek: number
} {
  const sorted = sortSchedule(schedule)
  return {
    shiftStartTime: sorted[0]?.start ?? '08:00',
    shiftEndTime: sorted[0]?.end ?? '12:00',
    workingDaysPerWeek: sorted.length,
  }
}

/** "Seg a Sex", "Seg, Qua e Sex". */
export function describeDays(days: number[]): string {
  const sorted = [...days].sort((a, b) => a - b)
  if (sorted.length === 0) return 'nenhum dia'
  const contiguous = sorted.every((d, i) => i === 0 || d === sorted[i - 1] + 1)
  if (contiguous && sorted.length >= 3) {
    return `${WEEKDAY_SHORT[sorted[0]]} a ${WEEKDAY_SHORT[sorted[sorted.length - 1]]}`
  }
  const names = sorted.map((d) => WEEKDAY_SHORT[d])
  return names.length === 1
    ? names[0]
    : `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`
}

/** "Seg a Sex, 13:00–17:00" ou "Seg 08:00–12:00 · Qua 14:00–18:00". */
export function describeSchedule(schedule: WeeklySchedule): string {
  const sorted = sortSchedule(schedule)
  if (sorted.length === 0) return 'Sem dias definidos'
  if (isUniformSchedule(sorted)) {
    return `${describeDays(sorted.map((d) => d.day))}, ${sorted[0].start}–${sorted[0].end}`
  }
  return sorted.map((d) => `${WEEKDAY_SHORT[d.day]} ${d.start}–${d.end}`).join(' · ')
}
