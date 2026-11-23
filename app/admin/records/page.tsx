'use client'

import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  Download,
  Home,
  LogIn,
  LogOut,
  MapPin,
  RefreshCw,
  Search,
  Timer,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { handleCompleteLogout } from '@/lib/logout'
import { addDaysInFortaleza, getNowInFortaleza, startOfDayInFortaleza } from '@/lib/timezone'
import {
  DEFAULT_RANGE_DAYS,
  NO_DEPARTMENT,
  formatDateKey,
  formatWorked,
  type DayStatusFilter,
  type SearchSummary,
  type StudentDayRow,
} from '@/lib/attendance-search'

interface SearchResponse {
  range: { from: string; to: string }
  rows: StudentDayRow[]
  summary: SearchSummary
  departments: string[]
  truncated: boolean
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

type QuickRange = 'TODAY' | 'WEEK' | 'MONTH' | 'THIS_MONTH'

const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

function toKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/** Período de um atalho, calculado no relógio de Fortaleza (convenção fake-UTC). */
function quickRange(range: QuickRange): { from: string; to: string } {
  const today = startOfDayInFortaleza(getNowInFortaleza())
  switch (range) {
    case 'TODAY':
      return { from: toKey(today), to: toKey(today) }
    case 'WEEK':
      return { from: toKey(addDaysInFortaleza(today, -(DEFAULT_RANGE_DAYS - 1))), to: toKey(today) }
    case 'MONTH':
      return { from: toKey(addDaysInFortaleza(today, -29)), to: toKey(today) }
    case 'THIS_MONTH': {
      const first = new Date(today)
      first.setUTCDate(1)
      return { from: toKey(first), to: toKey(today) }
    }
  }
}

function weekdayOf(key: string): string {
  return WEEKDAYS[new Date(`${key}T00:00:00.000Z`).getUTCDay()]
}

function getInitials(name: string | null, email: string) {
  if (name) {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }
  return email[0].toUpperCase()
}

const inputClass =
  'w-full bg-neutral-800/60 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 outline-none focus:border-primary/60 transition-colors'

export default function AttendanceRecordsPage() {
  const { data: session, status } = useSession()

  const initial = quickRange('WEEK')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [from, setFrom] = useState(initial.from)
  const [to, setTo] = useState(initial.to)
  const [department, setDepartment] = useState('ALL')
  const [dayStatus, setDayStatus] = useState<DayStatusFilter>('ALL')
  const [page, setPage] = useState(1)

  const [data, setData] = useState<SearchResponse | null>(null)
  const [firstLoad, setFirstLoad] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  // Espera o usuário parar de digitar antes de buscar.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400)
    return () => clearTimeout(timer)
  }, [search])

  // Qualquer filtro novo volta para a primeira página (no mesmo render, para
  // não disparar uma busca na página antiga).
  const resetPage =
    <T,>(setter: (v: T) => void) =>
    (value: T) => {
      setter(value)
      setPage(1)
    }
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  // Só a resposta da busca mais recente atualiza a tela.
  const requestId = useRef(0)

  const buildParams = useCallback(() => {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('q', debouncedSearch)
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    if (department !== 'ALL') params.set('department', department)
    if (dayStatus !== 'ALL') params.set('status', dayStatus)
    return params
  }, [debouncedSearch, from, to, department, dayStatus])

  const load = useCallback(async () => {
    const params = buildParams()
    params.set('page', String(page))
    const id = ++requestId.current
    setFetching(true)
    try {
      const res = await fetch(`/api/admin/attendance-records?${params}`)
      const body = await res.json().catch(() => null)
      if (id !== requestId.current) return
      if (!res.ok) {
        setError(body?.error ?? 'Não foi possível carregar os registros.')
        return
      }
      setError(null)
      setData(body as SearchResponse)
      setExpanded({})
    } catch (e) {
      if (id !== requestId.current) return
      console.error('Erro ao buscar registros de ponto:', e)
      setError('Não foi possível carregar os registros. Verifique a conexão.')
    } finally {
      if (id === requestId.current) {
        setFetching(false)
        setFirstLoad(false)
      }
    }
  }, [buildParams, page])

  useEffect(() => {
    if (session) load()
  }, [session, load])

  const applyQuickRange = (range: QuickRange) => {
    const r = quickRange(range)
    setFrom(r.from)
    setTo(r.to)
    setPage(1)
  }

  const activeQuick = (['TODAY', 'WEEK', 'MONTH', 'THIS_MONTH'] as const).find((r) => {
    const q = quickRange(r)
    return q.from === from && q.to === to
  })

  const exportCsv = () => {
    const params = buildParams()
    params.set('format', 'csv')
    window.location.href = `/api/admin/attendance-records?${params}`
  }

  const clearFilters = () => {
    setSearch('')
    setDepartment('ALL')
    setDayStatus('ALL')
    applyQuickRange('WEEK')
  }

  if (status === 'loading' || (firstLoad && !error)) {
    return <Loading size="lg" text="Carregando registros..." />
  }

  const summary = data?.summary
  const rows = data?.rows ?? []
  const pagination = data?.pagination

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Header */}
      <div className="glass border-b border-neutral-700/50">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              aria-label="Voltar ao painel"
              className="hover:opacity-80 transition-opacity"
            >
              <Home className="h-5 w-5 text-primary" />
            </Link>
            <div className="h-5 w-[1px] bg-neutral-600" />
            <div className="flex items-center gap-2">
              <div className="bg-primary/20 rounded-xl p-[0.375rem]">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white leading-none">Registros de Ponto</h1>
                <p className="text-neutral-400 text-xs">Entradas e saídas dos alunos</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={exportCsv} disabled={!summary?.rows}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => load()}
              aria-label="Atualizar"
              title="Atualizar"
            >
              <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleCompleteLogout} aria-label="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filtros */}
        <div className="bg-neutral-900/60 border border-neutral-700/40 rounded-2xl p-4 mb-4 shadow-xl">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <label htmlFor="records-search" className="block text-xs text-neutral-400 mb-1">
                Aluno
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  id="records-search"
                  type="search"
                  placeholder="Nome, e-mail ou matrícula"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
            <div className="lg:col-span-2">
              <label htmlFor="records-from" className="block text-xs text-neutral-400 mb-1">
                De
              </label>
              <input
                id="records-from"
                type="date"
                value={from}
                max={to || undefined}
                onChange={(e) => resetPage(setFrom)(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="lg:col-span-2">
              <label htmlFor="records-to" className="block text-xs text-neutral-400 mb-1">
                Até
              </label>
              <input
                id="records-to"
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e) => resetPage(setTo)(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="lg:col-span-2">
              <label htmlFor="records-department" className="block text-xs text-neutral-400 mb-1">
                Setor
              </label>
              <select
                id="records-department"
                value={department}
                onChange={(e) => resetPage(setDepartment)(e.target.value)}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="ALL">Todos os setores</option>
                {(data?.departments ?? []).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
                <option value={NO_DEPARTMENT}>Sem setor</option>
              </select>
            </div>
            <div className="lg:col-span-2">
              <label htmlFor="records-status" className="block text-xs text-neutral-400 mb-1">
                Situação do dia
              </label>
              <select
                id="records-status"
                value={dayStatus}
                onChange={(e) => resetPage(setDayStatus)(e.target.value as DayStatusFilter)}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="ALL">Todas</option>
                <option value="COMPLETE">Com saída</option>
                <option value="OPEN">Sem saída</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  ['TODAY', 'Hoje'],
                  ['WEEK', 'Últimos 7 dias'],
                  ['MONTH', 'Últimos 30 dias'],
                  ['THIS_MONTH', 'Este mês'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => applyQuickRange(key)}
                  aria-pressed={activeQuick === key}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                    activeQuick === key
                      ? 'bg-primary/20 border-primary/40 text-primary'
                      : 'bg-neutral-800/60 border-neutral-700 text-neutral-300 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-neutral-400 hover:text-white transition-colors"
            >
              Limpar filtros
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl bg-error-500/10 border border-error-500/40 text-sm text-[#fca5a5]"
          >
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Resumo */}
        {summary && (
          <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
            <span className="flex items-center gap-[0.375rem] px-[0.625rem] py-1 rounded-full bg-neutral-800/60 border border-neutral-700 text-neutral-200">
              <Users className="h-[0.875rem] w-[0.875rem]" /> {summary.students} aluno(s)
            </span>
            <span className="flex items-center gap-[0.375rem] px-[0.625rem] py-1 rounded-full bg-neutral-800/60 border border-neutral-700 text-neutral-200">
              <CalendarDays className="h-[0.875rem] w-[0.875rem]" /> {summary.rows} dia(s) com
              registro
            </span>
            <span className="flex items-center gap-[0.375rem] px-[0.625rem] py-1 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-300">
              <LogIn className="h-[0.875rem] w-[0.875rem]" /> {summary.entries} entrada(s)
            </span>
            <span className="flex items-center gap-[0.375rem] px-[0.625rem] py-1 rounded-full bg-secondary-500/10 border border-secondary-500/30 text-secondary-300">
              <LogOut className="h-[0.875rem] w-[0.875rem]" /> {summary.exits} saída(s)
            </span>
            <span className="flex items-center gap-[0.375rem] px-[0.625rem] py-1 rounded-full bg-neutral-800/60 border border-neutral-700 text-neutral-200">
              <Timer className="h-[0.875rem] w-[0.875rem]" /> {formatWorked(summary.workedMinutes)}{' '}
              registradas
            </span>
            {summary.openDays > 0 && (
              <button
                type="button"
                onClick={() => resetPage(setDayStatus)('OPEN')}
                className="flex items-center gap-[0.375rem] px-[0.625rem] py-1 rounded-full bg-warning-500/10 border border-warning-500/40 text-[#fcd34d] hover:bg-warning-500/20 transition-colors"
              >
                <AlertTriangle className="h-[0.875rem] w-[0.875rem]" /> {summary.openDays} dia(s)
                sem saída
              </button>
            )}
            {data?.truncated && (
              <span className="px-[0.625rem] py-1 rounded-full bg-warning-500/10 border border-warning-500/40 text-[#fcd34d]">
                Muitos registros: reduza o período para ver tudo
              </span>
            )}
          </div>
        )}

        {/* Tabela */}
        <div
          className={`relative bg-neutral-900/60 border border-neutral-700/40 rounded-2xl overflow-x-auto shadow-xl transition-opacity ${
            fetching ? 'opacity-60' : ''
          }`}
          aria-busy={fetching}
        >
          {rows.length === 0 ? (
            <div className="text-center py-16 px-4">
              <ClipboardList className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Nenhum registro encontrado</h3>
              <p className="text-neutral-400 text-sm">
                Ajuste o período ou os filtros para encontrar entradas e saídas.
              </p>
            </div>
          ) : (
            <>
              {/* Celular: um cartão por aluno e dia */}
              <ul className="md:hidden divide-y divide-neutral-800/60">
                {rows.map((row) => (
                  <MobileRecordCard
                    key={row.key}
                    row={row}
                    isOpen={!!expanded[row.key]}
                    onToggle={() => setExpanded((prev) => ({ ...prev, [row.key]: !prev[row.key] }))}
                  />
                ))}
              </ul>
              <table className="hidden md:table w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-neutral-700/60 text-xs uppercase tracking-wider text-neutral-400">
                    <th className="text-left font-semibold px-4 py-3">Data</th>
                    <th className="text-left font-semibold px-4 py-3">Aluno</th>
                    <th className="text-left font-semibold px-4 py-3">Setor</th>
                    <th className="text-left font-semibold px-4 py-3">Entrada</th>
                    <th className="text-left font-semibold px-4 py-3">Saída</th>
                    <th className="text-left font-semibold px-4 py-3">Horas</th>
                    <th className="text-right font-semibold px-4 py-3">
                      <span className="sr-only">Detalhes</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const isOpen = !!expanded[row.key]
                    return (
                      <RecordRow
                        key={row.key}
                        row={row}
                        isOpen={isOpen}
                        onToggle={() => setExpanded((prev) => ({ ...prev, [row.key]: !isOpen }))}
                      />
                    )
                  })}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* Paginação */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 mt-4 text-sm text-neutral-400">
            <span>
              Página {pagination.page} de {pagination.totalPages} · {pagination.total} linha(s)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={pagination.page <= 1 || fetching}
                onClick={() => setPage(pagination.page - 1)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={pagination.page >= pagination.totalPages || fetching}
                onClick={() => setPage(pagination.page + 1)}
              >
                Próxima
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function RecordRow({
  row,
  isOpen,
  onToggle,
}: {
  row: StudentDayRow
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <>
      <tr
        className="border-b border-neutral-800/60 hover:bg-neutral-800/30 cursor-pointer"
        onClick={onToggle}
      >
        <td className="px-4 py-3 whitespace-nowrap">
          <p className="text-white font-medium">{formatDateKey(row.date)}</p>
          <p className="text-neutral-500 text-xs capitalize">{weekdayOf(row.date)}</p>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
              {getInitials(row.name, row.email)}
            </div>
            <div className="min-w-0">
              <p className="text-white font-medium truncate">{row.name || 'Sem nome'}</p>
              <p className="text-neutral-400 text-xs truncate">
                {row.registrationNumber ? `Mat. ${row.registrationNumber} · ` : ''}
                {row.email}
              </p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-neutral-300">{row.department || '—'}</td>
        <td className="px-4 py-3">
          {row.firstEntry ? (
            <span className="font-mono text-primary-300">{row.firstEntry}</span>
          ) : (
            <span className="text-neutral-500">—</span>
          )}
        </td>
        <td className="px-4 py-3">
          {row.open ? (
            <span className="inline-flex items-center gap-1 px-2 py-[0.125rem] rounded-full text-xs bg-warning-500/10 border border-warning-500/40 text-[#fcd34d]">
              Sem saída
            </span>
          ) : row.lastExit ? (
            <span className="font-mono text-secondary-300">{row.lastExit}</span>
          ) : (
            <span className="text-neutral-500">—</span>
          )}
        </td>
        <td className="px-4 py-3 font-mono text-white">{formatWorked(row.workedMinutes)}</td>
        <td className="px-4 py-3 text-right">
          <button
            type="button"
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Ocultar registros do dia' : 'Ver registros do dia'}
            onClick={(e) => {
              e.stopPropagation()
              onToggle()
            }}
            className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            {row.punches.length} registro(s)
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </td>
      </tr>
      {isOpen && (
        <tr className="border-b border-neutral-800/60 bg-neutral-950/40">
          <td colSpan={7} className="px-4 py-3">
            <PunchList punches={row.punches} />
          </td>
        </tr>
      )}
    </>
  )
}

function PunchList({ punches }: { punches: StudentDayRow['punches'] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {punches.map((p) => (
        <li
          key={p.id}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${
            p.type === 'ENTRY'
              ? 'bg-primary-500/10 border-primary-500/30'
              : 'bg-secondary-500/10 border-secondary-500/30'
          }`}
        >
          {p.type === 'ENTRY' ? (
            <LogIn className="h-[0.875rem] w-[0.875rem] text-primary-300" />
          ) : (
            <LogOut className="h-[0.875rem] w-[0.875rem] text-secondary-300" />
          )}
          <span className="text-white font-semibold">
            {p.type === 'ENTRY' ? 'Entrada' : 'Saída'} · {p.time}
          </span>
          {(p.machineName || p.machineLocation) && (
            <span className="flex items-center gap-1 text-neutral-400">
              <MapPin className="h-3 w-3" />
              {[p.machineName, p.machineLocation].filter(Boolean).join(' · ')}
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}

function MobileRecordCard({
  row,
  isOpen,
  onToggle,
}: {
  row: StudentDayRow
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <li className="px-4 py-3">
      <button type="button" onClick={onToggle} aria-expanded={isOpen} className="w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-white font-medium truncate">{row.name || 'Sem nome'}</p>
            <p className="text-neutral-400 text-xs truncate">
              {row.registrationNumber ? `Mat. ${row.registrationNumber} · ` : ''}
              {row.department || 'Sem setor'}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-white text-sm">{formatDateKey(row.date)}</p>
            <p className="text-neutral-500 text-xs capitalize">{weekdayOf(row.date)}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm">
          <span className="flex items-center gap-1">
            <LogIn className="h-[0.875rem] w-[0.875rem] text-primary-300" />
            <span className="font-mono text-primary-300">{row.firstEntry ?? '—'}</span>
          </span>
          {row.open ? (
            <span className="px-2 py-[0.125rem] rounded-full text-xs bg-warning-500/10 border border-warning-500/40 text-[#fcd34d]">
              Sem saída
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <LogOut className="h-[0.875rem] w-[0.875rem] text-secondary-300" />
              <span className="font-mono text-secondary-300">{row.lastExit ?? '—'}</span>
            </span>
          )}
          <span className="font-mono text-white">{formatWorked(row.workedMinutes)}</span>
          <span className="ml-auto flex items-center gap-1 text-xs text-neutral-400">
            {row.punches.length}
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </span>
        </div>
      </button>
      {isOpen && (
        <div className="mt-3">
          <PunchList punches={row.punches} />
        </div>
      )}
    </li>
  )
}
