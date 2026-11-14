/**
 * Pré-preenchimento dos formulários de estágio com dados do perfil e horas do ponto.
 *
 * Funções puras: a rota `app/api/employee/internship-prefill` busca perfil e registros e usa
 * estas funções para montar os valores. Os timestamps de ponto seguem a convenção "fake-UTC"
 * (ver `lib/timezone.ts`): o dia local é o dia UTC do timestamp.
 */

export const PREFILL_FORM_TYPES = [
  'monthly-report',
  'semester-report',
  'final-report',
  'realization-term',
] as const

export type PrefillFormType = (typeof PREFILL_FORM_TYPES)[number]

export function isPrefillFormType(value: unknown): value is PrefillFormType {
  return typeof value === 'string' && (PREFILL_FORM_TYPES as readonly string[]).includes(value)
}

/** Campos de carga horária de cada formulário (o botão "Recalcular pelo ponto" só mexe neles). */
export const HOURS_FIELDS: Record<PrefillFormType, string[]> = {
  'monthly-report': ['hours_month', 'hours_total'],
  'semester-report': ['hours_semester', 'hours_total'],
  'final-report': ['total_hours'],
  'realization-term': ['realized_hours'],
}

export interface AttendanceLike {
  type: string
  timestamp: Date
}

export interface PrefillProfile {
  name?: string | null
  registrationNumber?: string | null
  contractStartDate?: Date | null
  contractEndDate?: Date | null
}

export interface Period {
  from: string // YYYY-MM-DD
  to: string // YYYY-MM-DD
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && ISO_DATE.test(value) && !isNaN(Date.parse(value))
}

/** Data (fake-UTC) → `YYYY-MM-DD`. */
export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/**
 * Soma as horas trabalhadas. Igual ao painel do aluno: em cada dia, a n-ésima entrada pareia com
 * a n-ésima saída; entrada sem saída não conta.
 */
export function sumWorkedHours(records: AttendanceLike[]): number {
  const byDay = new Map<string, { entries: number[]; exits: number[] }>()
  for (const record of records) {
    const time = record.timestamp.getTime()
    if (isNaN(time)) continue
    const day = toIsoDate(record.timestamp)
    const bucket = byDay.get(day) ?? { entries: [], exits: [] }
    if (record.type === 'ENTRY') bucket.entries.push(time)
    else if (record.type === 'EXIT') bucket.exits.push(time)
    byDay.set(day, bucket)
  }

  let totalMs = 0
  byDay.forEach(({ entries, exits }) => {
    entries.sort((a, b) => a - b)
    exits.sort((a, b) => a - b)
    for (let i = 0; i < Math.min(entries.length, exits.length); i++) {
      const diff = exits[i] - entries[i]
      if (diff > 0) totalMs += diff
    }
  })
  return totalMs / (1000 * 60 * 60)
}

/** Arredonda para 1 casa decimal, sem zeros sobrando: 80 → "80", 80.46 → "80.5". */
export function formatHours(hours: number): string {
  return String(Math.round(hours * 10) / 10)
}

function maxIso(a: string, b: string): string {
  return a > b ? a : b
}

function minIso(a: string, b: string): string {
  return a < b ? a : b
}

/** Período sugerido para o formulário quando o usuário ainda não escolheu um. */
export function defaultPeriod(
  formType: PrefillFormType,
  today: Date,
  contractStart?: Date | null,
  contractEnd?: Date | null
): Period {
  const todayIso = toIsoDate(today)
  const startIso = contractStart ? toIsoDate(contractStart) : undefined

  if (formType === 'monthly-report' || formType === 'semester-report') {
    const base =
      formType === 'monthly-report'
        ? new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))
        : new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 6, today.getUTCDate()))
    let from = toIsoDate(base)
    if (startIso) from = maxIso(from, minIso(startIso, todayIso))
    return { from, to: todayIso }
  }

  // Relatório final e termo de realização cobrem o contrato inteiro.
  const from = startIso ?? todayIso
  const to = contractEnd ? toIsoDate(contractEnd) : todayIso
  return { from, to }
}

/** Fim do período usado na soma de horas: o futuro ainda não tem ponto. */
export function hoursEnd(period: Period, today: Date): string {
  return minIso(period.to, toIsoDate(today))
}

/** Monta os valores do formulário. `hours.total` é o acumulado desde o início do contrato. */
export function buildPrefillValues(
  formType: PrefillFormType,
  profile: PrefillProfile,
  period: Period,
  hours: { period: number; total: number }
): Record<string, string> {
  const name = profile.name?.trim() ?? ''
  const enrollment = profile.registrationNumber?.trim() ?? ''
  const values: Record<string, string> = {}
  const set = (key: string, value: string) => {
    if (value) values[key] = value
  }

  switch (formType) {
    case 'monthly-report':
      set('student_name', name)
      set('student_enrollment', enrollment)
      set('period_start', period.from)
      set('period_end', period.to)
      set('hours_month', formatHours(hours.period))
      set('hours_total', formatHours(hours.total))
      break
    case 'semester-report':
      set('student_name', name)
      set('student_enrollment', enrollment)
      set('period_start', period.from)
      set('period_end', period.to)
      set('hours_semester', formatHours(hours.period))
      set('hours_total', formatHours(hours.total))
      break
    case 'final-report':
      set('student_name', name)
      set('enrollment', enrollment)
      set('start_date', period.from)
      set('end_date', period.to)
      set('total_hours', formatHours(hours.period))
      break
    case 'realization-term':
      set('student_name', name)
      set('student_enrollment', enrollment)
      set('start_date', period.from)
      set('end_date', period.to)
      set('realized_hours', formatHours(hours.period))
      break
  }
  return values
}

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || (typeof value === 'string' && !value.trim())
}

/** Completa só os campos vazios: o que o usuário digitou ou salvou no rascunho vence. */
export function mergePrefill<T extends Record<string, unknown>>(
  current: T,
  prefill: Record<string, string>
): T {
  const merged: Record<string, unknown> = { ...current }
  for (const [key, value] of Object.entries(prefill)) {
    if (isEmpty(merged[key])) merged[key] = value
  }
  return merged as T
}
