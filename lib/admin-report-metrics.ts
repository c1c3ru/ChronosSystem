/**
 * Métricas reais para relatórios administrativos (alinhado ao dashboard: entrada esperada 08:00, tolerância 15 min)
 *
 * Convenção de fuso do sistema: os timestamps de ponto são gravados com o
 * relógio de parede de Fortaleza codificado como UTC (ver `getNowInFortaleza`
 * em `lib/timezone.ts`). Por isso a hora/data local de Fortaleza de um registro
 * é lida com os getters UTC (`getUTCHours`, `getUTCDay`, ...), do mesmo jeito
 * que o dashboard do estagiário e as telas de admin fazem. Converter de UTC
 * para America/Fortaleza aqui aplicaria o deslocamento de -3h uma segunda vez,
 * e uma entrada às 08:10 apareceria como 05:10 no relatório.
 */
const LATE_GRACE_MIN = 15
const EXPECTED_START_MIN = 8 * 60

function dateKeyFortaleza(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function minutesSinceMidnightFortaleza(d: Date): number {
  return d.getUTCHours() * 60 + d.getUTCMinutes()
}

/** Entrada com atraso além da tolerância (regra espelhada do dashboard-enhanced) */
export function isLateEntryRecord(timestamp: Date): boolean {
  return minutesSinceMidnightFortaleza(timestamp) > EXPECTED_START_MIN + LATE_GRACE_MIN
}

function isWeekendFortaleza(d: Date): boolean {
  const weekday = d.getUTCDay()
  return weekday === 0 || weekday === 6
}

function* eachDayInRange(start: Date, end: Date): Generator<Date> {
  // Meio-dia evita que qualquer arredondamento de borda mude o dia; os setters
  // UTC mantêm a iteração independente do fuso de quem roda o processo.
  const cur = new Date(start)
  cur.setUTCHours(12, 0, 0, 0)
  const endAt = new Date(end)
  endAt.setUTCHours(12, 0, 0, 0)
  while (cur <= endAt) {
    yield new Date(cur)
    cur.setUTCDate(cur.getUTCDate() + 1)
  }
}

export function buildEntryDayKeySet(rows: { userId: string; timestamp: Date }[]): Set<string> {
  const s = new Set<string>()
  for (const r of rows) {
    s.add(`${r.userId}:${dateKeyFortaleza(r.timestamp)}`)
  }
  return s
}

/**
 * Dias úteis (Fortaleza) sem nenhuma ENTRADA registrada, por usuário filtrado.
 */
export function countWeekdayAbsenceIncidents(
  userIds: string[],
  startDate: Date,
  endDate: Date,
  entryDayKeys: Set<string>
): number {
  let count = 0
  for (const userId of userIds) {
    for (const day of eachDayInRange(startDate, endDate)) {
      if (isWeekendFortaleza(day)) continue
      const key = `${userId}:${dateKeyFortaleza(day)}`
      if (!entryDayKeys.has(key)) count++
    }
  }
  return count
}
