import { formatContractDate, getContractExpiration } from '@/lib/contract-expiration'

const now = new Date('2026-11-16T09:00:00.000Z')
const status = (endDate: string | null, startDate: string | null = '2026-01-01T00:00:00.000Z') =>
  getContractExpiration(startDate, endDate, now)

describe('vigência de contratos no quadro de horários', () => {
  it('exibe datas completas sem recuar um dia em fusos brasileiros', () => {
    expect(formatContractDate('2026-11-16T00:00:00.000Z')).toBe('16/11/2026')
    expect(formatContractDate('2026-12-31')).toBe('31/12/2026')
    expect(formatContractDate(null)).toBe('—')
    expect(formatContractDate('2026-02-30')).toBe('—')
  })

  it('considera dias inteiros, inclusive o próprio dia do término', () => {
    expect(status('2026-11-15T00:00:00.000Z')).toMatchObject({
      urgency: 'EXPIRED',
      daysRemaining: -1,
      message: 'Vencido há 1 dia',
    })
    expect(status('2026-11-16T00:00:00.000Z')).toMatchObject({
      urgency: 'CRITICAL',
      daysRemaining: 0,
      message: 'Vence hoje',
    })
    expect(status('2026-11-17T00:00:00.000Z')).toMatchObject({
      urgency: 'CRITICAL',
      daysRemaining: 1,
      message: 'Vence em 1 dia',
    })
  })

  it.each([
    [15, 'CRITICAL'],
    [16, 'URGENT'],
    [30, 'URGENT'],
    [31, 'WARNING'],
    [60, 'WARNING'],
    [61, 'NORMAL'],
  ])('classifica %i dias restantes como %s', (days, urgency) => {
    const end = new Date(now)
    end.setUTCDate(end.getUTCDate() + days)
    expect(status(end.toISOString()).urgency).toBe(urgency)
  })

  it('distingue início futuro e término ausente', () => {
    expect(status(null)).toEqual({
      urgency: 'MISSING',
      daysRemaining: null,
      message: 'Fim não informado',
    })
    expect(status('2027-11-16', '2027-01-01')).toMatchObject({
      urgency: 'FUTURE',
      message: 'Ainda não iniciou',
    })
  })
})
