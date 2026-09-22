import {
  buildEntryDayKeySet,
  countWeekdayAbsenceIncidents,
  isLateEntryRecord,
} from '@/lib/admin-report-metrics'

/**
 * Os timestamps gravados seguem a convenção do sistema: relógio de parede de
 * Fortaleza codificado como UTC (ver `getNowInFortaleza`). Logo, "08:10 em
 * Fortaleza" está no banco como 2026-09-15T08:10:00.000Z.
 */
const atFortaleza = (iso: string) => new Date(`${iso}Z`)

describe('admin-report-metrics', () => {
  describe('isLateEntryRecord', () => {
    it('não marca atraso numa entrada às 08:10 de Fortaleza', () => {
      // Se o módulo convertesse de UTC para America/Fortaleza, leria 05:10 e
      // também diria "não atrasado" — por isso o caso decisivo é o de baixo.
      expect(isLateEntryRecord(atFortaleza('2026-09-15T08:10:00'))).toBe(false)
    })

    it('marca atraso numa entrada às 08:30 de Fortaleza (além dos 15 min de tolerância)', () => {
      expect(isLateEntryRecord(atFortaleza('2026-09-15T08:30:00'))).toBe(true)
    })

    it('não marca atraso numa entrada às 11:00 de Fortaleza convertida por engano', () => {
      // Regressão do bug de fuso duplo: 11:00 em Fortaleza é atraso de verdade.
      // Uma conversão indevida leria 08:00 e devolveria false.
      expect(isLateEntryRecord(atFortaleza('2026-09-15T11:00:00'))).toBe(true)
    })

    it('trata 08:15 como dentro da tolerância e 08:16 como atraso', () => {
      expect(isLateEntryRecord(atFortaleza('2026-09-15T08:15:00'))).toBe(false)
      expect(isLateEntryRecord(atFortaleza('2026-09-15T08:16:00'))).toBe(true)
    })
  })

  describe('buildEntryDayKeySet', () => {
    it('usa o dia de Fortaleza do registro, inclusive perto da meia-noite', () => {
      const keys = buildEntryDayKeySet([
        { userId: 'u1', timestamp: atFortaleza('2026-09-15T23:50:00') },
        { userId: 'u1', timestamp: atFortaleza('2026-09-16T00:10:00') },
      ])

      expect(keys.has('u1:2026-09-15')).toBe(true)
      expect(keys.has('u1:2026-09-16')).toBe(true)
      expect(keys.size).toBe(2)
    })
  })

  describe('countWeekdayAbsenceIncidents', () => {
    // 2026-09-14 (seg) a 2026-09-18 (sex): 5 dias úteis.
    const start = atFortaleza('2026-09-14T00:00:00')
    const end = atFortaleza('2026-09-18T23:59:59')

    it('conta todos os dias úteis quando não há nenhuma entrada', () => {
      expect(countWeekdayAbsenceIncidents(['u1'], start, end, new Set())).toBe(5)
    })

    it('desconta os dias em que houve entrada', () => {
      const keys = buildEntryDayKeySet([
        { userId: 'u1', timestamp: atFortaleza('2026-09-14T08:00:00') },
        { userId: 'u1', timestamp: atFortaleza('2026-09-16T08:00:00') },
      ])

      expect(countWeekdayAbsenceIncidents(['u1'], start, end, keys)).toBe(3)
    })

    it('ignora sábado e domingo', () => {
      // 2026-09-19 (sáb) e 2026-09-20 (dom) não entram na conta.
      const weekend = countWeekdayAbsenceIncidents(
        ['u1'],
        atFortaleza('2026-09-19T00:00:00'),
        atFortaleza('2026-09-20T23:59:59'),
        new Set()
      )

      expect(weekend).toBe(0)
    })

    it('soma as faltas de cada usuário filtrado', () => {
      expect(countWeekdayAbsenceIncidents(['u1', 'u2'], start, end, new Set())).toBe(10)
    })
  })
})
