import { isValidContractDate, toDateOnly } from '@/lib/contract-date'
import { formatContractDate, getContractExpiration } from '@/lib/contract-expiration'

describe('datas de contrato com ano completo', () => {
  it.each(['2026-11-09', '2027-04-09', '2100-12-31', '2000-02-29'])(
    'aceita a data válida %s',
    (value) => {
      expect(isValidContractDate(value)).toBe(true)
    }
  )

  it.each([
    '0027-04-09',
    '0026-11-09',
    '2026-02-30',
    '2027-13-01',
    '2027-4-9',
    '1900-01-01',
    '2101-01-01',
  ])(
    'rejeita a data incorreta %s',
    (value) => {
      expect(isValidContractDate(value)).toBe(false)
    }
  )

  it('preenche anos antigos com quatro dígitos e sinaliza inconsistência sem calcular dias absurdos', () => {
    const now = new Date('2026-11-16T09:00:00.000Z')
    expect(formatContractDate('0027-04-09T00:00:00.000Z')).toBe('09/04/0027')
    expect(
      getContractExpiration('0026-11-09T00:00:00.000Z', '0027-04-09T00:00:00.000Z', now)
    ).toEqual({
      urgency: 'INVALID',
      daysRemaining: null,
      message: 'Corrigir data do contrato',
    })
  })

  it('mantém um contrato real de 2026-2027 como vigente', () => {
    const now = new Date('2026-11-16T09:00:00.000Z')
    const expiry = getContractExpiration('2026-11-09', '2027-04-09', now)
    expect(expiry.urgency).toBe('NORMAL')
    expect(expiry.daysRemaining).toBeGreaterThan(0)
    expect(toDateOnly('2027-04-09T00:00:00.000Z')).toBe('2027-04-09')
  })
})
