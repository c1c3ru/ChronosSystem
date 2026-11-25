import {
  describeDays,
  describeSchedule,
  isUniformSchedule,
  parseWeeklySchedule,
  resolveWeeklySchedule,
  scheduleForDay,
  summarizeSchedule,
  uniformSchedule,
  validateWeeklySchedule,
} from '@/lib/weekly-schedule'
import { computeTodaySummary, plannedShiftMinutes } from '@/lib/schedule-status'

const legacy = { shiftStartTime: '13:00', shiftEndTime: '17:00', workingDaysPerWeek: 3 }
const variado = [
  { day: 4, start: '13:00', end: '17:00' },
  { day: 0, start: '08:00', end: '12:00' },
  { day: 2, start: '14:00', end: '18:00' },
]
const at = (iso: string) => new Date(`${iso}Z`) // fake-UTC (relógio de Fortaleza)

describe('horário semanal', () => {
  it('cadastro antigo: mesmo horário nos primeiros N dias a partir de segunda', () => {
    expect(resolveWeeklySchedule(legacy)).toEqual(uniformSchedule('13:00', '17:00', [0, 1, 2]))
    expect(scheduleForDay(legacy, 2)).toEqual({ start: '13:00', end: '17:00' })
    expect(scheduleForDay(legacy, 3)).toBeNull()
  })

  it('horário por dia prevalece e fica ordenado de segunda a domingo', () => {
    const src = { ...legacy, weeklySchedule: variado }
    expect(resolveWeeklySchedule(src).map((d) => d.day)).toEqual([0, 2, 4])
    expect(scheduleForDay(src, 2)).toEqual({ start: '14:00', end: '18:00' })
    expect(scheduleForDay(src, 1)).toBeNull()
  })

  it('JSON inválido no banco cai no horário antigo', () => {
    expect(parseWeeklySchedule({ foo: 1 })).toBeNull()
    expect(parseWeeklySchedule([{ day: 9, start: '08:00', end: '12:00' }])).toBeNull()
    expect(resolveWeeklySchedule({ ...legacy, weeklySchedule: 'x' })).toHaveLength(3)
  })

  it('valida dias, formato e fim depois do início', () => {
    expect(validateWeeklySchedule(variado)).toEqual({})
    expect(validateWeeklySchedule([])).toEqual({ weeklySchedule: expect.any(String) })
    const errors = validateWeeklySchedule([
      { day: 0, start: '08:00', end: '07:00' },
      { day: 1, start: '8h', end: '12:00' },
    ])
    expect(errors['weeklySchedule.0']).toMatch(/^Segunda: .*depois do horário de início/)
    expect(errors['weeklySchedule.1']).toMatch(/^Terça: /)
    expect(
      validateWeeklySchedule([
        { day: 0, start: '08:00', end: '12:00' },
        { day: 0, start: '13:00', end: '17:00' },
      ])
    ).toEqual({ weeklySchedule: expect.any(String) })
  })

  it('deriva os campos antigos do primeiro dia', () => {
    expect(summarizeSchedule(variado)).toEqual({
      shiftStartTime: '08:00',
      shiftEndTime: '12:00',
      workingDaysPerWeek: 3,
    })
  })

  it('descreve dias e horários em português', () => {
    expect(describeDays([0, 1, 2, 3, 4])).toBe('Seg a Sex')
    expect(describeDays([0, 2, 4])).toBe('Seg, Qua e Sex')
    expect(describeDays([5])).toBe('Sáb')
    expect(describeSchedule(uniformSchedule('13:00', '17:00', [0, 1, 2, 3, 4]))).toBe(
      'Seg a Sex, 13:00–17:00'
    )
    expect(isUniformSchedule(parseWeeklySchedule(variado)!)).toBe(false)
    expect(describeSchedule(parseWeeklySchedule(variado)!)).toBe(
      'Seg 08:00–12:00 · Qua 14:00–18:00 · Sex 13:00–17:00'
    )
  })
})

describe('quadro de horários com horário por dia', () => {
  const src = { ...legacy, weeklySchedule: variado }

  it('quarta usa o horário de quarta para atraso e falta', () => {
    // Quarta 18/11/2026: turno 14:00–18:00
    const s = computeTodaySummary(src, [], at('2026-11-18T14:30:00'))
    expect(s.isWorkday).toBe(true)
    expect(s.status).toBe('MISSING')
    const cedo = computeTodaySummary(src, [], at('2026-11-18T13:00:00'))
    expect(cedo.status).toBe('UPCOMING')
  })

  it('terça não é dia de estágio', () => {
    const s = computeTodaySummary(src, [], at('2026-11-17T10:00:00'))
    expect(s.isWorkday).toBe(false)
    expect(s.status).toBe('OFF')
  })

  it('linha do tempo usa o horário do dia', () => {
    expect(plannedShiftMinutes(src, 2)).toEqual({ startMin: 14 * 60, endMin: 18 * 60 })
    expect(plannedShiftMinutes(src, 1)).toBeNull()
  })
})
