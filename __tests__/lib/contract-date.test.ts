import { isValidContractDate, toDateOnly } from '@/lib/contract-date'
import { formatContractDate, getContractExpiration } from '@/lib/contract-expiration'

describe('datas de contrato com ano completo', () => {
  it('aceita datas com anos reais e calendário válido', () => {
    expect(isValidContractDate('2026-11-09')).toBe(true)
    expect(isValidContractDate('2027-04-09')).toBe(true)
    expect(isValidContractDate('2100-12-31')).toBe(true)
    expect(isValidContractDate('2000-02-29')).toBe(true)
  })

  it('rejeita anos abreviados e datas inexistentes', () => {
    expect(isValidContractDate('0027-04-09')).toBe(false)
    expect(isValidContractDate('0026-11-09')).toBe(false)
    expect(isValidContractDate('2026-02-30')).toBe(false)
    expect(isValidContractDate('2027-13-01')).toBe(false)
    expect(isValidContractDate('2027-4-9')).toBe(false)
    expect(isValidContractDate('1900-01-01')).toBe(false)
    expect(isValidContractDate('2101-01-01')).toBe(false)
  })

  it('sinaliza anos inválidos sem calcular vencimentos absurdos', () => {
    const now = new Date('2026-11-16T09:00:00.000Z')
    const start = '0026-11-09T00:00:00.000Z'
    const end = '0027-04-09T00:00:00.000Z'
    const expiry = getContractExpiration(start, end, now)

    expect(formatContractDate('0027-04-09T00:00:00.000Z')).toBe('09/04/0027')
    expect(expiry).toEqual({
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
