import {
  getNowInFortaleza,
  startOfDayInFortaleza,
  endOfDayInFortaleza,
  addDaysInFortaleza,
  parseDateInFortaleza,
} from '@/lib/timezone'

/**
 * Convenção do sistema: os timestamps de ponto são o relógio de parede de
 * Fortaleza codificado como UTC. "15/09/2026 às 22:30 em Fortaleza" está no
 * banco como 2026-09-15T22:30:00.000Z.
 */
const atFortaleza = (iso: string) => new Date(`${iso}Z`)

describe('helpers de fuso de Fortaleza', () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  describe('getNowInFortaleza', () => {
    it('devolve o relógio de Fortaleza, 3h atrás do instante UTC real', () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-09-16T01:30:00.000Z'))

      // 01:30 UTC é 22:30 do dia 15 em Fortaleza.
      expect(getNowInFortaleza().toISOString()).toBe('2026-09-15T22:30:00.000Z')
    })
  })

  describe('startOfDayInFortaleza', () => {
    it('usa o dia de Fortaleza, não o dia UTC, no fim da noite', () => {
      // Este é o bug que o helper existe para evitar: às 22:30 de Fortaleza já
      // é dia 16 em UTC, e o padrão antigo devolvia a meia-noite do dia 16.
      jest.useFakeTimers().setSystemTime(new Date('2026-09-16T01:30:00.000Z'))

      expect(startOfDayInFortaleza().toISOString()).toBe('2026-09-15T00:00:00.000Z')
    })

    it('zera o horário de uma data já na codificação de Fortaleza', () => {
      expect(startOfDayInFortaleza(atFortaleza('2026-09-15T13:45:12.345')).toISOString()).toBe(
        '2026-09-15T00:00:00.000Z'
      )
    })

    it('não altera o Date recebido', () => {
      const original = atFortaleza('2026-09-15T13:45:00')
      startOfDayInFortaleza(original)

      expect(original.toISOString()).toBe('2026-09-15T13:45:00.000Z')
    })
  })

  describe('endOfDayInFortaleza', () => {
    it('devolve o último milissegundo do dia de Fortaleza', () => {
      expect(endOfDayInFortaleza(atFortaleza('2026-09-15T08:00:00')).toISOString()).toBe(
        '2026-09-15T23:59:59.999Z'
      )
    })

    it('usa o dia de Fortaleza no fim da noite', () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-09-16T01:30:00.000Z'))

      expect(endOfDayInFortaleza().toISOString()).toBe('2026-09-15T23:59:59.999Z')
    })
  })

  describe('addDaysInFortaleza', () => {
    it('soma e subtrai dias', () => {
      const base = atFortaleza('2026-09-15T00:00:00')

      expect(addDaysInFortaleza(base, 1).toISOString()).toBe('2026-09-16T00:00:00.000Z')
      expect(addDaysInFortaleza(base, -30).toISOString()).toBe('2026-08-16T00:00:00.000Z')
    })

    it('atravessa a virada de mês e de ano', () => {
      expect(addDaysInFortaleza(atFortaleza('2026-12-31T10:00:00'), 1).toISOString()).toBe(
        '2027-01-01T10:00:00.000Z'
      )
    })

    it('não altera o Date recebido', () => {
      const original = atFortaleza('2026-09-15T00:00:00')
      addDaysInFortaleza(original, 5)

      expect(original.toISOString()).toBe('2026-09-15T00:00:00.000Z')
    })
  })

  describe('parseDateInFortaleza', () => {
    it('lê um YYYY-MM-DD de query string como meia-noite em Fortaleza', () => {
      expect(parseDateInFortaleza('2026-09-15').toISOString()).toBe('2026-09-15T00:00:00.000Z')
    })

    it('normaliza o horário quando vem um timestamp completo', () => {
      expect(parseDateInFortaleza('2026-09-15T17:20:00.000Z').toISOString()).toBe(
        '2026-09-15T00:00:00.000Z'
      )
    })
  })

  describe('faixa de um dia inteiro', () => {
    it('cobre um registro das 22:30 e exclui o mesmo horário do dia seguinte', () => {
      const inicio = startOfDayInFortaleza(atFortaleza('2026-09-15T22:30:00'))
      const fim = endOfDayInFortaleza(atFortaleza('2026-09-15T22:30:00'))
      const registroDaNoite = atFortaleza('2026-09-15T22:30:00')
      const registroDoDiaSeguinte = atFortaleza('2026-09-16T22:30:00')

      expect(registroDaNoite >= inicio && registroDaNoite <= fim).toBe(true)
      expect(registroDoDiaSeguinte >= inicio && registroDoDiaSeguinte <= fim).toBe(false)
    })
  })
})
