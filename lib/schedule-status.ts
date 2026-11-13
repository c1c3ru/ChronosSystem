/**
 * Regras do Quadro de Horários (admin): situação de cada estagiário no dia de
 * hoje e trechos de trabalho para a linha do tempo.
 *
 * Convenção de fuso do sistema: os timestamps de ponto são o relógio de parede
 * de Fortaleza codificado como UTC (ver `getNowInFortaleza` em
 * `lib/timezone.ts`). Por isso tudo aqui lê hora e dia com os getters UTC, e o
 * "agora" deve vir de `getNowInFortaleza()`.
 */

/** Tolerância de atraso, a mesma de `lib/admin-report-metrics.ts`. */
export const LATE_GRACE_MIN = 15

/** Faixa exibida na linha do tempo (06h–22h). */
export const TIMELINE_START_MIN = 6 * 60
export const TIMELINE_END_MIN = 22 * 60

export type TodayStatus =
  | 'PRESENT' // entrou e ainda não saiu
  | 'LEFT' // já registrou saída
  | 'MISSING' // deveria ter chegado (passou da tolerância) e não registrou nada
  | 'UPCOMING' // turno ainda não começou (ou está dentro da tolerância)
  | 'OFF' // hoje não é dia de trabalho e não há registro

export interface ShiftInfo {
  shiftStartTime: string
  shiftEndTime: string
  workingDaysPerWeek: number
}

export interface DayRecord {
  type: string
  timestamp: string | Date
}

export interface WorkSegment {
  startMin: number
  endMin: number
  /** Entrada sem saída correspondente: o trecho vai até agora. */
  open: boolean
}

export interface TodaySummary {
  status: TodayStatus
  isWorkday: boolean
  isLate: boolean
  firstEntryMin: number | null
  lastExitMin: number | null
  segments: WorkSegment[]
}

/** "08:30" → 510. Valor inválido vira 0. */
export function timeToMinutes(time: string | null | undefined): number {
  if (!time) return 0
  const [h, m] = time.split(':').map(Number)
  if (Number.isNaN(h)) return 0
  return h * 60 + (Number.isNaN(m) ? 0 : m)
}

/** 510 → "08:30". */
export function minutesToTime(min: number): string {
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Hora do dia (em minutos) de um timestamp gravado na convenção fake-UTC. */
export function minutesOfDay(timestamp: string | Date): number {
  const d = new Date(timestamp)
  return d.getUTCHours() * 60 + d.getUTCMinutes()
}

/** Dia da semana de Fortaleza com segunda = 0 … domingo = 6. */
export function weekdayIndex(nowFortaleza: Date): number {
  const d = nowFortaleza.getUTCDay()
  return d === 0 ? 6 : d - 1
}

/**
 * Dias trabalhados presumidos a partir de `workingDaysPerWeek`: o cadastro não
 * guarda quais dias, só quantos, então 3 dias = segunda a quarta.
 */
export function isPresumedWorkday(dayIdx: number, workingDaysPerWeek: number): boolean {
  return dayIdx < Math.min(Math.max(workingDaysPerWeek, 0), 7)
}

/** Posição (0–100%) de um horário na linha do tempo. */
export function minutesToPercent(
  min: number,
  start = TIMELINE_START_MIN,
  end = TIMELINE_END_MIN
): number {
  return Math.max(0, Math.min(100, ((min - start) / (end - start)) * 100))
}

/** "08:00","12:00" → "08–12"; "08:30","12:00" → "08:30–12". */
export function formatShiftRange(start: string, end: string): string {
  const short = (t: string) => (t.endsWith(':00') ? t.slice(0, 2) : t)
  return `${short(start)}–${short(end)}`
}

/** Fim do turno em minutos; turno que vira a meia-noite é cortado em 24h. */
function shiftEndMinutes(shift: ShiftInfo): number {
  const start = timeToMinutes(shift.shiftStartTime)
  const end = timeToMinutes(shift.shiftEndTime)
  return end > start ? end : 24 * 60
}

/** Agrupa os registros do dia em trechos ENTRADA→SAÍDA. */
export function buildSegments(records: DayRecord[], nowMin: number): WorkSegment[] {
  const sorted = [...records].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )
  const segments: WorkSegment[] = []
  let openStart: number | null = null

  for (const r of sorted) {
    const min = minutesOfDay(r.timestamp)
    if (r.type === 'ENTRY') {
      // Duas entradas seguidas: fecha a anterior na nova entrada.
      if (openStart !== null) segments.push({ startMin: openStart, endMin: min, open: false })
      openStart = min
    } else if (r.type === 'EXIT' && openStart !== null) {
      segments.push({ startMin: openStart, endMin: Math.max(min, openStart), open: false })
      openStart = null
    }
  }

  if (openStart !== null) {
    segments.push({ startMin: openStart, endMin: Math.max(nowMin, openStart), open: true })
  }
  return segments
}

/**
 * Situação de hoje de um estagiário.
 *
 * @param records registros de ponto de hoje (fake-UTC), em qualquer ordem
 * @param nowFortaleza resultado de `getNowInFortaleza()`
 */
export function computeTodaySummary(
  shift: ShiftInfo,
  records: DayRecord[],
  nowFortaleza: Date
): TodaySummary {
  const nowMin = nowFortaleza.getUTCHours() * 60 + nowFortaleza.getUTCMinutes()
  const isWorkday = isPresumedWorkday(weekdayIndex(nowFortaleza), shift.workingDaysPerWeek)
  const sorted = [...records].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )
  const segments = buildSegments(sorted, nowMin)

  const firstEntry = sorted.find((r) => r.type === 'ENTRY')
  const lastExit = [...sorted].reverse().find((r) => r.type === 'EXIT')
  const firstEntryMin = firstEntry ? minutesOfDay(firstEntry.timestamp) : null
  const lastExitMin = lastExit ? minutesOfDay(lastExit.timestamp) : null

  const startMin = timeToMinutes(shift.shiftStartTime)
  const isLate = isWorkday && firstEntryMin !== null && firstEntryMin > startMin + LATE_GRACE_MIN

  const last = sorted[sorted.length - 1]
  let status: TodayStatus
  if (last?.type === 'ENTRY') status = 'PRESENT'
  else if (last?.type === 'EXIT') status = 'LEFT'
  else if (!isWorkday) status = 'OFF'
  else if (nowMin > startMin + LATE_GRACE_MIN) status = 'MISSING'
  else status = 'UPCOMING'

  return { status, isWorkday, isLate, firstEntryMin, lastExitMin, segments }
}

/** Fim do turno planejado, exposto para a linha do tempo. */
export function plannedShiftMinutes(shift: ShiftInfo): { startMin: number; endMin: number } {
  return { startMin: timeToMinutes(shift.shiftStartTime), endMin: shiftEndMinutes(shift) }
}
