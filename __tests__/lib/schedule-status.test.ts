import {
  buildSegments,
  computeTodaySummary,
  formatShiftRange,
  isPresumedWorkday,
  minutesToPercent,
  plannedShiftMinutes,
  timeToMinutes,
  weekdayIndex,
} from '@/lib/schedule-status'

/**
 * Convenção do sistema: timestamps de ponto são o relógio de parede de
 * Fortaleza codificado como UTC. "Sexta 13/11/2026 às 08:05 em Fortaleza" está
 * no banco como 2026-11-13T08:05:00.000Z.
 */
const at = (iso: string) => new Date(`${iso}Z`)

const manha = { shiftStartTime: '08:00', shiftEndTime: '12:00', workingDaysPerWeek: 5 }

describe('helpers do quadro de horários', () => {
  it('converte horários e posições na linha do tempo (06h–22h)', () => {
    expect(timeToMinutes('08:30')).toBe(510)
    expect(timeToMinutes('')).toBe(0)
    expect(minutesToPercent(6 * 60)).toBe(0)
    expect(minutesToPercent(14 * 60)).toBe(50)
    expect(minutesToPercent(23 * 60)).toBe(100)
  })

  it('formata o horário cadastrado de forma curta', () => {
    expect(formatShiftRange('08:00', '12:00')).toBe('08–12')
    expect(formatShiftRange('13:30', '17:00')).toBe('13:30–17')
  })

  it('lê o dia da semana de Fortaleza com segunda = 0', () => {
    expect(weekdayIndex(at('2026-11-09T10:00:00'))).toBe(0) // segunda
    expect(weekdayIndex(at('2026-11-13T23:30:00'))).toBe(4) // sexta à noite, sem virar o dia
    expect(weekdayIndex(at('2026-11-15T10:00:00'))).toBe(6) // domingo
  })

  it('presume os dias trabalhados a partir de segunda', () => {
    expect(isPresumedWorkday(2, 3)).toBe(true)
    expect(isPresumedWorkday(3, 3)).toBe(false)
    expect(isPresumedWorkday(6, 9)).toBe(true)
  })

  it('corta em 24h um turno que vira a meia-noite', () => {
    expect(
      plannedShiftMinutes({ ...manha, shiftStartTime: '22:00', shiftEndTime: '02:00' })
    ).toEqual({ startMin: 22 * 60, endMin: 24 * 60 })
  })
})

describe('buildSegments', () => {
  it('agrupa entrada/saída e deixa aberta a entrada sem saída', () => {
    const segs = buildSegments(
      [
        { type: 'ENTRY', timestamp: at('2026-11-13T13:00:00') },
        { type: 'EXIT', timestamp: at('2026-11-13T10:00:00') },
        { type: 'ENTRY', timestamp: at('2026-11-13T08:00:00') },
      ],
      15 * 60
    )
    expect(segs).toEqual([
      { startMin: 480, endMin: 600, open: false },
      { startMin: 780, endMin: 900, open: true },
    ])
  })

  it('ignora saída sem entrada', () => {
    expect(buildSegments([{ type: 'EXIT', timestamp: at('2026-11-13T09:00:00') }], 600)).toEqual([])
  })
})

describe('computeTodaySummary', () => {
  const sexta = (hhmm: string) => at(`2026-11-13T${hhmm}:00`)

  it('aguardando antes do turno e dentro da tolerância', () => {
    expect(computeTodaySummary(manha, [], sexta('07:30')).status).toBe('UPCOMING')
    expect(computeTodaySummary(manha, [], sexta('08:15')).status).toBe('UPCOMING')
  })

  it('não chegou depois da tolerância de 15 min', () => {
    expect(computeTodaySummary(manha, [], sexta('08:16')).status).toBe('MISSING')
  })

  it('presente no horário e presente com atraso', () => {
    const noHorario = computeTodaySummary(
      manha,
      [{ type: 'ENTRY', timestamp: sexta('08:10').toISOString() }],
      sexta('09:00')
    )
    expect(noHorario).toMatchObject({ status: 'PRESENT', isLate: false, firstEntryMin: 490 })

    const atrasado = computeTodaySummary(
      manha,
      [{ type: 'ENTRY', timestamp: sexta('08:40').toISOString() }],
      sexta('09:00')
    )
    expect(atrasado).toMatchObject({ status: 'PRESENT', isLate: true })
  })

  it('saiu depois de registrar saída', () => {
    const s = computeTodaySummary(
      manha,
      [
        { type: 'ENTRY', timestamp: sexta('08:00').toISOString() },
        { type: 'EXIT', timestamp: sexta('12:02').toISOString() },
      ],
      sexta('13:00')
    )
    expect(s).toMatchObject({ status: 'LEFT', lastExitMin: 722 })
  })

  it('folga em dia fora da escala, mas mostra registro se houver', () => {
    const tresDias = { ...manha, workingDaysPerWeek: 3 } // Seg–Qua
    expect(computeTodaySummary(tresDias, [], sexta('09:00'))).toMatchObject({
      status: 'OFF',
      isWorkday: false,
    })
    const veio = computeTodaySummary(
      tresDias,
      [{ type: 'ENTRY', timestamp: sexta('09:00').toISOString() }],
      sexta('09:30')
    )
    expect(veio).toMatchObject({ status: 'PRESENT', isLate: false })
  })
})
