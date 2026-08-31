/**
 * Métricas reais para relatórios administrativos (alinhado ao dashboard: entrada esperada 08:00, tolerância 15 min)
 */
const TZ = 'America/Fortaleza'
const LATE_GRACE_MIN = 15
const EXPECTED_START_MIN = 8 * 60

function dateKeyFortaleza(d: Date): string {
  return d.toLocaleDateString('en-CA', { timeZone: TZ })
}

function minutesSinceMidnightFortaleza(d: Date): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d)
  const h = Number(parts.find((p) => p.type === 'hour')?.value ?? 0)
  const m = Number(parts.find((p) => p.type === 'minute')?.value ?? 0)
  return h * 60 + m
}

/** Entrada com atraso além da tolerância (regra espelhada do dashboard-enhanced) */
export function isLateEntryRecord(timestamp: Date): boolean {
  return minutesSinceMidnightFortaleza(timestamp) > EXPECTED_START_MIN + LATE_GRACE_MIN
}

function isWeekendFortaleza(d: Date): boolean {
  const w = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short' }).format(d)
  return w === 'Sat' || w === 'Sun'
}

function* eachDayInRange(start: Date, end: Date): Generator<Date> {
  const cur = new Date(start)
  cur.setHours(12, 0, 0, 0)
  const endAt = new Date(end)
  endAt.setHours(12, 0, 0, 0)
  while (cur <= endAt) {
    yield new Date(cur)
    cur.setDate(cur.getDate() + 1)
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
