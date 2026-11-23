/**
 * Busca de registros de ponto dos alunos (tela "Registros de Ponto" do admin).
 *
 * Convenção de fuso do sistema: os timestamps de ponto são o relógio de parede
 * de Fortaleza codificado como UTC (ver `getNowInFortaleza` em
 * `lib/timezone.ts`). Por isso o dia de cada registro sai de
 * `toISOString().slice(0, 10)`, a hora sai dos getters UTC e os limites do
 * período usam os helpers de `lib/timezone.ts` — nunca `setHours`.
 */
import {
  addDaysInFortaleza,
  endOfDayInFortaleza,
  getNowInFortaleza,
  parseDateInFortaleza,
  startOfDayInFortaleza,
} from '@/lib/timezone'

/** Período padrão quando a busca não informa datas: os últimos 7 dias. */
export const DEFAULT_RANGE_DAYS = 7
/** Maior período aceito numa busca, para a consulta não trazer o banco inteiro. */
export const MAX_RANGE_DAYS = 93
/** Linhas (aluno + dia) por página. */
export const DEFAULT_PAGE_SIZE = 50
export const MAX_PAGE_SIZE = 200
/** Valor do filtro de setor para quem não preencheu o setor no cadastro. */
export const NO_DEPARTMENT = '__NONE__'

export type DayStatusFilter = 'ALL' | 'OPEN' | 'COMPLETE'

export interface AttendanceSearchParams {
  q: string
  from: Date
  to: Date
  /** `YYYY-MM-DD` das datas efetivamente usadas, para a tela exibir. */
  fromKey: string
  toKey: string
  department: string | null
  status: DayStatusFilter
  page: number
  limit: number
}

export type ParseResult =
  | { ok: true; params: AttendanceSearchParams }
  | { ok: false; error: string }

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function isValidDateKey(value: string): boolean {
  if (!DATE_RE.test(value)) return false
  const d = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value
}

/** Chave `YYYY-MM-DD` do dia de um timestamp gravado na convenção fake-UTC. */
export function dayKey(timestamp: Date): string {
  return timestamp.toISOString().slice(0, 10)
}

/** Minutos desde 00:00 de um timestamp fake-UTC. */
export function minuteOfDay(timestamp: Date): number {
  return timestamp.getUTCHours() * 60 + timestamp.getUTCMinutes()
}

function clampInt(raw: string | null, fallback: number, min: number, max: number): number {
  const n = Number.parseInt(raw ?? '', 10)
  if (Number.isNaN(n)) return fallback
  return Math.min(Math.max(n, min), max)
}

/**
 * Lê e valida a query string da busca. Datas ausentes viram os últimos
 * `DEFAULT_RANGE_DAYS` dias (contando hoje, em Fortaleza).
 */
export function parseAttendanceSearchParams(
  searchParams: URLSearchParams,
  now: Date = getNowInFortaleza()
): ParseResult {
  const rawFrom = searchParams.get('from')?.trim() || ''
  const rawTo = searchParams.get('to')?.trim() || ''

  if (rawFrom && !isValidDateKey(rawFrom)) {
    return { ok: false, error: 'Data inicial inválida. Use o formato AAAA-MM-DD.' }
  }
  if (rawTo && !isValidDateKey(rawTo)) {
    return { ok: false, error: 'Data final inválida. Use o formato AAAA-MM-DD.' }
  }

  const today = startOfDayInFortaleza(now)
  const toDay = rawTo ? parseDateInFortaleza(rawTo) : today
  const fromDay = rawFrom
    ? parseDateInFortaleza(rawFrom)
    : addDaysInFortaleza(toDay, -(DEFAULT_RANGE_DAYS - 1))

  if (fromDay.getTime() > toDay.getTime()) {
    return { ok: false, error: 'A data inicial deve ser anterior ou igual à data final.' }
  }

  const rangeDays = Math.round((toDay.getTime() - fromDay.getTime()) / 86_400_000) + 1
  if (rangeDays > MAX_RANGE_DAYS) {
    return {
      ok: false,
      error: `O período máximo de busca é de ${MAX_RANGE_DAYS} dias. Reduza o intervalo de datas.`,
    }
  }

  const rawStatus = searchParams.get('status')
  const status: DayStatusFilter =
    rawStatus === 'OPEN' || rawStatus === 'COMPLETE' ? rawStatus : 'ALL'

  const rawDepartment = searchParams.get('department')?.trim() || ''

  return {
    ok: true,
    params: {
      q: (searchParams.get('q') ?? '').trim().slice(0, 100),
      from: startOfDayInFortaleza(fromDay),
      to: endOfDayInFortaleza(toDay),
      fromKey: dayKey(fromDay),
      toKey: dayKey(toDay),
      department: rawDepartment && rawDepartment !== 'ALL' ? rawDepartment : null,
      status,
      page: clampInt(searchParams.get('page'), 1, 1, 10_000),
      limit: clampInt(searchParams.get('limit'), DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE),
    },
  }
}

export interface SearchRecord {
  id: string
  type: string
  timestamp: Date
  user: {
    id: string
    name: string | null
    email: string
    registrationNumber: string | null
    department: string | null
  }
  machine: { name: string; location: string | null } | null
}

export interface DayPunch {
  id: string
  type: 'ENTRY' | 'EXIT'
  /** ISO do timestamp gravado (fake-UTC). */
  timestamp: string
  /** "08:05", já na hora de Fortaleza. */
  time: string
  machineName: string | null
  machineLocation: string | null
}

export interface StudentDayRow {
  key: string
  date: string
  userId: string
  name: string | null
  email: string
  registrationNumber: string | null
  department: string | null
  firstEntry: string | null
  lastExit: string | null
  workedMinutes: number
  /** Ficou uma entrada sem saída correspondente no dia. */
  open: boolean
  entries: number
  exits: number
  punches: DayPunch[]
}

function hhmm(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
}

/**
 * Soma o tempo trabalhado pareando cada entrada com a saída seguinte. Uma
 * segunda entrada antes de uma saída é ignorada (registro duplicado), e uma
 * saída sem entrada aberta não conta tempo.
 */
export function computeWorkedMinutes(punches: { type: string; timestamp: Date }[]): {
  workedMinutes: number
  open: boolean
} {
  let openAt: number | null = null
  let worked = 0
  for (const p of punches) {
    const t = p.timestamp.getTime()
    if (p.type === 'ENTRY') {
      if (openAt === null) openAt = t
    } else if (p.type === 'EXIT' && openAt !== null) {
      worked += Math.max(0, Math.round((t - openAt) / 60_000))
      openAt = null
    }
  }
  return { workedMinutes: worked, open: openAt !== null }
}

/**
 * Agrupa registros em linhas "aluno + dia", com entradas e saídas em ordem
 * cronológica. As linhas saem do dia mais recente para o mais antigo e, dentro
 * do dia, em ordem alfabética de nome.
 */
export function groupRecordsByStudentDay(records: SearchRecord[]): StudentDayRow[] {
  const sorted = [...records].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  const groups = new Map<string, SearchRecord[]>()
  for (const r of sorted) {
    const key = `${r.user.id}|${dayKey(r.timestamp)}`
    const list = groups.get(key)
    if (list) list.push(r)
    else groups.set(key, [r])
  }

  const rows: StudentDayRow[] = []
  for (const [key, list] of groups) {
    const { user } = list[0]
    const entries = list.filter((r) => r.type === 'ENTRY')
    const exits = list.filter((r) => r.type === 'EXIT')
    const { workedMinutes, open } = computeWorkedMinutes(list)
    rows.push({
      key,
      date: dayKey(list[0].timestamp),
      userId: user.id,
      name: user.name,
      email: user.email,
      registrationNumber: user.registrationNumber,
      department: user.department,
      firstEntry: entries.length ? hhmm(minuteOfDay(entries[0].timestamp)) : null,
      lastExit: exits.length ? hhmm(minuteOfDay(exits[exits.length - 1].timestamp)) : null,
      workedMinutes,
      open,
      entries: entries.length,
      exits: exits.length,
      punches: list.map((r) => ({
        id: r.id,
        type: r.type === 'EXIT' ? 'EXIT' : 'ENTRY',
        timestamp: r.timestamp.toISOString(),
        time: hhmm(minuteOfDay(r.timestamp)),
        machineName: r.machine?.name ?? null,
        machineLocation: r.machine?.location ?? null,
      })),
    })
  }

  return rows.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1
    return (a.name ?? a.email).localeCompare(b.name ?? b.email, 'pt-BR')
  })
}

export function filterRowsByStatus(
  rows: StudentDayRow[],
  status: DayStatusFilter
): StudentDayRow[] {
  if (status === 'OPEN') return rows.filter((r) => r.open)
  if (status === 'COMPLETE') return rows.filter((r) => !r.open)
  return rows
}

export interface SearchSummary {
  rows: number
  students: number
  entries: number
  exits: number
  openDays: number
  workedMinutes: number
}

export function summarizeRows(rows: StudentDayRow[]): SearchSummary {
  return {
    rows: rows.length,
    students: new Set(rows.map((r) => r.userId)).size,
    entries: rows.reduce((s, r) => s + r.entries, 0),
    exits: rows.reduce((s, r) => s + r.exits, 0),
    openDays: rows.filter((r) => r.open).length,
    workedMinutes: rows.reduce((s, r) => s + r.workedMinutes, 0),
  }
}

/** 125 → "2h05". */
export function formatWorked(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h${String(m).padStart(2, '0')}`
}

/** "2026-11-23" → "23/11/2026". */
export function formatDateKey(key: string): string {
  const [y, m, d] = key.split('-')
  return `${d}/${m}/${y}`
}

function csvCell(value: string | number | null | undefined): string {
  const s = value === null || value === undefined ? '' : String(value)
  // Evita que uma planilha interprete o texto como fórmula.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s
  return /[";\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

/** CSV separado por ";" (padrão do Excel em pt-BR), com BOM para acentos. */
export function rowsToCsv(rows: StudentDayRow[]): string {
  const header = [
    'Data',
    'Aluno',
    'Matrícula',
    'E-mail',
    'Setor',
    'Primeira entrada',
    'Última saída',
    'Horas no dia',
    'Situação',
    'Registros',
  ]
  const lines = rows.map((r) =>
    [
      formatDateKey(r.date),
      r.name ?? '',
      r.registrationNumber ?? '',
      r.email,
      r.department ?? '',
      r.firstEntry ?? '',
      r.lastExit ?? '',
      formatWorked(r.workedMinutes),
      r.open ? 'Sem saída' : 'Completo',
      r.punches.map((p) => `${p.type === 'ENTRY' ? 'E' : 'S'} ${p.time}`).join(', '),
    ]
      .map(csvCell)
      .join(';')
  )
  return '﻿' + [header.join(';'), ...lines].join('\r\n')
}
