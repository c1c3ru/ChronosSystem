import {
  buildPrefillValues,
  defaultPeriod,
  formatHours,
  hoursEnd,
  isIsoDate,
  isPrefillFormType,
  mergePrefill,
  sumWorkedHours,
} from '@/lib/internship-prefill'

// Timestamps "fake-UTC": a hora de parede de Fortaleza codificada como UTC.
const at = (iso: string) => new Date(`${iso}Z`)
const rec = (type: 'ENTRY' | 'EXIT', iso: string) => ({ type, timestamp: at(iso) })

describe('sumWorkedHours', () => {
  it('pareia entrada e saída de cada dia, como o painel', () => {
    const hours = sumWorkedHours([
      rec('ENTRY', '2026-11-03T08:00:00'),
      rec('EXIT', '2026-11-03T12:00:00'),
      rec('ENTRY', '2026-11-03T13:00:00'),
      rec('EXIT', '2026-11-03T15:30:00'),
      rec('ENTRY', '2026-11-04T08:00:00'),
      rec('EXIT', '2026-11-04T14:00:00'),
    ])
    expect(hours).toBeCloseTo(12.5)
  })

  it('ignora entrada sem saída e não pareia entre dias diferentes', () => {
    const hours = sumWorkedHours([
      rec('ENTRY', '2026-11-03T22:00:00'),
      rec('EXIT', '2026-11-04T10:00:00'),
      rec('ENTRY', '2026-11-05T08:00:00'),
    ])
    expect(hours).toBe(0)
  })

  it('aceita registros fora de ordem e lista vazia', () => {
    expect(
      sumWorkedHours([rec('EXIT', '2026-11-03T12:00:00'), rec('ENTRY', '2026-11-03T08:00:00')])
    ).toBe(4)
    expect(sumWorkedHours([])).toBe(0)
  })
})

describe('formatHours', () => {
  it('arredonda para uma casa decimal', () => {
    expect(formatHours(80)).toBe('80')
    expect(formatHours(80.46)).toBe('80.5')
    expect(formatHours(0)).toBe('0')
  })
})

describe('defaultPeriod', () => {
  const today = at('2026-11-14T10:00:00')

  it('relatório mensal: do dia 1 do mês até hoje', () => {
    expect(defaultPeriod('monthly-report', today, at('2026-03-01T00:00:00'))).toEqual({
      from: '2026-11-01',
      to: '2026-11-14',
    })
  })

  it('relatório mensal: começa no início do contrato, se for no meio do mês', () => {
    expect(defaultPeriod('monthly-report', today, at('2026-11-10T00:00:00'))).toEqual({
      from: '2026-11-10',
      to: '2026-11-14',
    })
  })

  it('relatório semestral: últimos seis meses', () => {
    expect(defaultPeriod('semester-report', today, at('2026-01-01T00:00:00'))).toEqual({
      from: '2026-05-14',
      to: '2026-11-14',
    })
  })

  it('relatório final: contrato inteiro', () => {
    expect(
      defaultPeriod('final-report', today, at('2026-03-01T00:00:00'), at('2027-02-28T00:00:00'))
    ).toEqual({ from: '2026-03-01', to: '2027-02-28' })
  })

  it('sem contrato cadastrado, usa hoje', () => {
    expect(defaultPeriod('realization-term', today)).toEqual({
      from: '2026-11-14',
      to: '2026-11-14',
    })
  })
})

describe('hoursEnd', () => {
  it('não soma horas no futuro', () => {
    const today = at('2026-11-14T10:00:00')
    expect(hoursEnd({ from: '2026-03-01', to: '2027-02-28' }, today)).toBe('2026-11-14')
    expect(hoursEnd({ from: '2026-03-01', to: '2026-10-31' }, today)).toBe('2026-10-31')
  })
})

describe('buildPrefillValues', () => {
  const profile = { name: ' Maria Souza ', registrationNumber: '20231234' }
  const period = { from: '2026-11-01', to: '2026-11-14' }

  it('relatório mensal: identificação, período e horas', () => {
    expect(
      buildPrefillValues('monthly-report', profile, period, { period: 40.25, total: 300 })
    ).toEqual({
      student_name: 'Maria Souza',
      student_enrollment: '20231234',
      period_start: '2026-11-01',
      period_end: '2026-11-14',
      hours_month: '40.3',
      hours_total: '300',
    })
  })

  it('relatório final usa os nomes de campo da tela', () => {
    const values = buildPrefillValues('final-report', profile, period, { period: 10, total: 10 })
    expect(values).toMatchObject({ enrollment: '20231234', start_date: '2026-11-01' })
    expect(values.total_hours).toBe('10')
  })

  it('não cria campo para dado ausente no perfil', () => {
    const values = buildPrefillValues('realization-term', { name: null }, period, {
      period: 0,
      total: 0,
    })
    expect(values).not.toHaveProperty('student_name')
    expect(values).not.toHaveProperty('student_enrollment')
    expect(values.realized_hours).toBe('0')
  })
})

describe('mergePrefill', () => {
  it('só completa campos vazios', () => {
    const merged = mergePrefill(
      { student_name: 'Nome digitado', hours_month: '', period_start: '   ', extra: 'x' },
      { student_name: 'Nome do perfil', hours_month: '80', period_start: '2026-11-01' }
    )
    expect(merged).toEqual({
      student_name: 'Nome digitado',
      hours_month: '80',
      period_start: '2026-11-01',
      extra: 'x',
    })
  })
})

describe('validadores', () => {
  it('isPrefillFormType e isIsoDate', () => {
    expect(isPrefillFormType('monthly-report')).toBe(true)
    expect(isPrefillFormType('commitment-term')).toBe(false)
    expect(isIsoDate('2026-11-14')).toBe(true)
    expect(isIsoDate('14/11/2026')).toBe(false)
    expect(isIsoDate(null)).toBe(false)
  })
})
