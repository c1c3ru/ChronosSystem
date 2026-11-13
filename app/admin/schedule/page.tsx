'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import {
  Home,
  LogOut,
  Clock,
  Users,
  Search,
  ChevronRight,
  CalendarDays,
  RefreshCw,
  Timer,
  ChevronsDownUp,
  ChevronsUpDown,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { handleCompleteLogout } from '@/lib/logout'
import { getNowInFortaleza } from '@/lib/timezone'
import {
  computeTodaySummary,
  formatShiftRange,
  isPresumedWorkday,
  minutesToPercent,
  minutesToTime,
  plannedShiftMinutes,
  weekdayIndex,
  TIMELINE_END_MIN,
  TIMELINE_START_MIN,
  type DayRecord,
  type TodayStatus,
  type TodaySummary,
} from '@/lib/schedule-status'

interface ScheduleEmployee {
  id: string
  name: string | null
  email: string
  department: string | null
  shiftStartTime: string
  shiftEndTime: string
  workingDaysPerWeek: number
  weeklyHours?: number | null
  allowFlexibleHours?: boolean
  shift: string | null
  contractType: string | null
  isPresent: boolean
  lastRecord: DayRecord | null
  todayRecords?: DayRecord[]
}

type ViewMode = 'TODAY' | 'WEEK'
type StatusFilter = 'ALL' | TodayStatus | 'LATE'

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const HOUR_TICKS = Array.from(
  { length: (TIMELINE_END_MIN - TIMELINE_START_MIN) / 60 / 2 + 1 },
  (_, i) => TIMELINE_START_MIN / 60 + i * 2
) // 06, 08, …, 22
const VIEW_STORAGE_KEY = 'chronos.schedule.view'

/** Cores por turno: fundo/borda/texto da pílula de horário e da barra planejada. */
const SHIFT_STYLES: Record<string, { pill: string; bar: string; dot: string; label: string }> = {
  MORNING: {
    pill: 'bg-secondary-500/15 border-secondary-400/60 text-secondary-200',
    bar: 'bg-secondary-500/25 border-secondary-400/70',
    dot: 'bg-secondary-400',
    label: 'Manhã',
  },
  AFTERNOON: {
    pill: 'bg-warning-500/15 border-warning-500/60 text-warning-50',
    bar: 'bg-warning-500/25 border-warning-500/70',
    dot: 'bg-warning-500',
    label: 'Tarde',
  },
  NIGHT: {
    pill: 'bg-[#8b5cf6]/15 border-[#a78bfa]/60 text-[#ddd6fe]',
    bar: 'bg-[#8b5cf6]/25 border-[#a78bfa]/70',
    dot: 'bg-[#a78bfa]',
    label: 'Noite',
  },
  HYBRID: {
    pill: 'bg-[#14b8a6]/15 border-[#2dd4bf]/60 text-[#99f6e4]',
    bar: 'bg-[#14b8a6]/25 border-[#2dd4bf]/70',
    dot: 'bg-[#2dd4bf]',
    label: 'Híbrido',
  },
}

function shiftStyle(shift: string | null) {
  return SHIFT_STYLES[shift ?? ''] ?? SHIFT_STYLES.HYBRID
}

const STATUS_STYLES: Record<TodayStatus, { label: string; className: string }> = {
  PRESENT: {
    label: 'Presente',
    className: 'bg-primary-500/15 text-primary-300 border-primary-500/40',
  },
  LEFT: { label: 'Saiu', className: 'bg-neutral-700/40 text-neutral-200 border-neutral-600' },
  MISSING: { label: 'Não chegou', className: 'bg-error-500/15 text-[#fca5a5] border-error-500/40' },
  UPCOMING: {
    label: 'Aguardando',
    className: 'bg-neutral-800/60 text-neutral-300 border-neutral-700',
  },
  OFF: { label: 'Folga hoje', className: 'bg-neutral-800/40 text-neutral-400 border-neutral-700' },
}

function statusText(s: TodaySummary): string {
  switch (s.status) {
    case 'PRESENT':
      return `${s.isLate ? 'Atrasado' : 'Presente'} · ${minutesToTime(s.firstEntryMin ?? 0)}`
    case 'LEFT':
      return `Saiu · ${minutesToTime(s.lastExitMin ?? 0)}`
    default:
      return STATUS_STYLES[s.status].label
  }
}

function statusClass(s: TodaySummary): string {
  if (s.status === 'PRESENT' && s.isLate)
    return 'bg-warning-500/15 text-[#fcd34d] border-warning-500/40'
  return STATUS_STYLES[s.status].className
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

function workingDaysLabel(n: number) {
  const days = Math.min(Math.max(n, 0), 7)
  if (days === 5) return 'Seg–Sex'
  if (days === 0) return 'sem dias'
  if (days === 1) return 'Seg'
  return `Seg–${DAYS[days - 1]}`
}

export default function SchedulePage() {
  const { data: session, status } = useSession()
  const [employees, setEmployees] = useState<ScheduleEmployee[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [view, setView] = useState<ViewMode>('TODAY')
  const [collapsedDepts, setCollapsedDepts] = useState<Record<string, boolean>>({})

  const [departmentFilter, setDepartmentFilter] = useState('ALL')
  const [shiftFilter, setShiftFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')

  // Relógio de Fortaleza (convenção fake-UTC, ver lib/timezone.ts), atualizado a cada minuto.
  const [now, setNow] = useState(() => getNowInFortaleza())
  useEffect(() => {
    const timer = setInterval(() => setNow(getNowInFortaleza()), 60000)
    return () => clearInterval(timer)
  }, [])
  const todayIndex = weekdayIndex(now)
  const nowMin = now.getUTCHours() * 60 + now.getUTCMinutes()
  const nowPercent = minutesToPercent(nowMin)
  const nowInRange = nowMin >= TIMELINE_START_MIN && nowMin <= TIMELINE_END_MIN

  // Lembra a última visão escolhida (só conveniência; a página funciona sem isso).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_STORAGE_KEY)
      if (saved === 'TODAY' || saved === 'WEEK') setView(saved)
    } catch {
      /* armazenamento indisponível */
    }
  }, [])
  const changeView = (v: ViewMode) => {
    setView(v)
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, v)
    } catch {
      /* armazenamento indisponível */
    }
  }

  const loadSchedule = useCallback(async (silent = false) => {
    try {
      if (silent) setRefreshing(true)
      else setLoading(true)
      const res = await fetch('/api/admin/schedule')
      if (res.ok) {
        const data = await res.json()
        setEmployees(data.employees ?? [])
      }
    } catch (e) {
      console.error('Erro ao carregar quadro:', e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (!session) return
    loadSchedule()
    // Mantém a visão "Hoje" atual sem precisar recarregar a página.
    const timer = setInterval(() => loadSchedule(true), 2 * 60000)
    return () => clearInterval(timer)
  }, [session, loadSchedule])

  const summaries = useMemo(() => {
    const map: Record<string, TodaySummary> = {}
    for (const emp of employees) {
      const records = emp.todayRecords ?? (emp.lastRecord ? [emp.lastRecord] : [])
      map[emp.id] = computeTodaySummary(emp, records, now)
    }
    return map
  }, [employees, now])

  const departments = Array.from(
    new Set(employees.map((e) => e.department || 'Sem Departamento'))
  ).sort()

  const filtered = employees.filter((emp) => {
    const q = search.toLowerCase()
    const matchSearch =
      (emp.name ?? '').toLowerCase().includes(q) ||
      (emp.department ?? '').toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q)

    const empDept = emp.department || 'Sem Departamento'
    const matchDept = departmentFilter === 'ALL' || empDept === departmentFilter
    const matchShift = shiftFilter === 'ALL' || emp.shift === shiftFilter
    const s = summaries[emp.id]
    const matchStatus =
      statusFilter === 'ALL' || (statusFilter === 'LATE' ? s?.isLate : s?.status === statusFilter)

    return matchSearch && matchDept && matchShift && matchStatus
  })

  const groupedEmployees = filtered.reduce(
    (acc, emp) => {
      const dept = emp.department || 'Sem Departamento'
      if (!acc[dept]) acc[dept] = []
      acc[dept].push(emp)
      return acc
    },
    {} as Record<string, ScheduleEmployee[]>
  )
  const deptNames = Object.keys(groupedEmployees)
  const allCollapsed = deptNames.length > 0 && deptNames.every((d) => collapsedDepts[d])

  // Sáb/Dom só aparecem quando alguém da lista trabalha nesses dias.
  const maxDays = filtered.reduce((m, e) => Math.max(m, Math.min(e.workingDaysPerWeek, 7)), 5)
  const visibleDays = DAYS.slice(0, maxDays)

  const counts = filtered.reduce(
    (acc, emp) => {
      const s = summaries[emp.id]
      if (!s) return acc
      if (s.status === 'PRESENT') acc.present++
      if (s.status === 'MISSING') acc.missing++
      if (s.status === 'OFF') acc.off++
      if (s.isLate) acc.late++
      return acc
    },
    { present: 0, missing: 0, off: 0, late: 0 }
  )

  const todayLabel = now.toLocaleDateString('pt-BR', {
    timeZone: 'UTC',
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })

  if (status === 'loading' || loading) return <Loading size="lg" text="Carregando quadro..." />

  const selectClass =
    'bg-neutral-800/60 border border-neutral-700 rounded-lg px-3 py-[0.375rem] text-xs text-white outline-none cursor-pointer hover:bg-neutral-800/80 transition-colors'

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
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white leading-none">Quadro de Horários</h1>
                <p className="text-neutral-400 text-xs">Horários cadastrados e presença de hoje</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex flex-1 sm:flex-none items-center gap-1 bg-neutral-800/60 border border-neutral-700 rounded-xl px-3 py-[0.375rem]">
              <Search className="h-[0.875rem] w-[0.875rem] text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar estagiário..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-sm text-white placeholder-neutral-500 outline-none w-full sm:w-[11rem]"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => loadSchedule(true)}
              aria-label="Atualizar"
              title="Atualizar"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleCompleteLogout} aria-label="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Abas + data */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div
            role="tablist"
            aria-label="Visão do quadro"
            className="inline-flex bg-neutral-800/60 border border-neutral-700 rounded-xl p-1"
          >
            {(
              [
                ['TODAY', 'Hoje', Timer],
                ['WEEK', 'Escala semanal', CalendarDays],
              ] as const
            ).map(([key, label, Icon]) => (
              <button
                key={key}
                role="tab"
                aria-selected={view === key}
                onClick={() => changeView(key)}
                className={`flex items-center gap-[0.375rem] px-3 py-[0.375rem] rounded-lg text-sm font-medium transition-colors ${
                  view === key
                    ? 'bg-primary/20 text-primary'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-700/40'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
          <p className="text-sm text-neutral-300 capitalize">
            {todayLabel}
            <span className="text-neutral-500 normal-case"> · agora {minutesToTime(nowMin)}</span>
          </p>
        </div>

        {/* Resumo + filtros */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="flex items-center gap-[0.375rem] px-[0.625rem] py-1 rounded-full bg-neutral-800/60 border border-neutral-700 text-neutral-200">
              <Users className="h-[0.875rem] w-[0.875rem]" /> {filtered.length} estagiário(s)
            </span>
            <span className="flex items-center gap-[0.375rem] px-[0.625rem] py-1 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-300">
              <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
              {counts.present} presente(s)
            </span>
            {counts.late > 0 && (
              <span className="px-[0.625rem] py-1 rounded-full bg-warning-500/10 border border-warning-500/30 text-[#fcd34d]">
                {counts.late} atrasado(s)
              </span>
            )}
            {counts.missing > 0 && (
              <span className="px-[0.625rem] py-1 rounded-full bg-error-500/10 border border-error-500/30 text-[#fca5a5]">
                {counts.missing} não chegou/chegaram
              </span>
            )}
            {counts.off > 0 && (
              <span className="px-[0.625rem] py-1 rounded-full bg-neutral-800/60 border border-neutral-700 text-neutral-400">
                {counts.off} de folga hoje
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              aria-label="Filtrar por departamento"
              className={selectClass}
            >
              <option value="ALL">Todos Departamentos</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              aria-label="Filtrar por turno"
              className={selectClass}
            >
              <option value="ALL">Todos Turnos</option>
              <option value="MORNING">Manhã</option>
              <option value="AFTERNOON">Tarde</option>
              <option value="NIGHT">Noite</option>
              <option value="HYBRID">Híbrido</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              aria-label="Filtrar por situação de hoje"
              className={selectClass}
            >
              <option value="ALL">Qualquer Situação</option>
              <option value="PRESENT">Presente agora</option>
              <option value="LATE">Chegou atrasado</option>
              <option value="MISSING">Não chegou</option>
              <option value="UPCOMING">Aguardando turno</option>
              <option value="LEFT">Já saiu</option>
              <option value="OFF">Folga hoje</option>
            </select>

            {deptNames.length > 1 && (
              <button
                onClick={() =>
                  setCollapsedDepts(
                    allCollapsed ? {} : Object.fromEntries(deptNames.map((d) => [d, true]))
                  )
                }
                className="flex items-center gap-1 px-[0.625rem] py-[0.375rem] rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-neutral-700/40 transition-colors"
              >
                {allCollapsed ? (
                  <ChevronsUpDown className="h-[0.875rem] w-[0.875rem]" />
                ) : (
                  <ChevronsDownUp className="h-[0.875rem] w-[0.875rem]" />
                )}
                {allCollapsed ? 'Expandir setores' : 'Recolher setores'}
              </button>
            )}
          </div>
        </div>

        {/* Legenda */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3 text-xs text-neutral-400">
          {Object.entries(SHIFT_STYLES).map(([key, s]) => (
            <span key={key} className="flex items-center gap-[0.375rem]">
              <span className={`w-[0.625rem] h-[0.625rem] rounded-full ${s.dot}`} /> {s.label}
            </span>
          ))}
          {view === 'TODAY' && (
            <>
              <span className="flex items-center gap-[0.375rem]">
                <span className="w-4 h-[0.375rem] rounded-full bg-primary-400" /> Tempo registrado
              </span>
              <span className="flex items-center gap-[0.375rem]">
                <span className="w-[1px] h-3 bg-error-500" /> Agora
              </span>
            </>
          )}
        </div>

        {/* Quadro */}
        <div className="bg-neutral-900/60 border border-neutral-700/40 rounded-2xl overflow-x-auto shadow-xl">
          <div className={view === 'WEEK' ? 'min-w-[560px]' : ''}>
            {/* Cabeçalho */}
            <div className="flex border-b border-neutral-700/60 sticky top-0 z-20 bg-neutral-900/95 backdrop-blur">
              <div className="w-40 sm:w-64 flex-shrink-0 px-3 sm:px-4 py-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Estagiário
              </div>
              {view === 'WEEK' ? (
                <div className="flex-1 flex">
                  {visibleDays.map((day, i) => (
                    <div
                      key={day}
                      className={`flex-1 text-center text-xs py-3 font-semibold border-l border-neutral-800/60 ${
                        i === todayIndex ? 'text-primary bg-primary/5' : 'text-neutral-400'
                      }`}
                    >
                      {day}
                      {i === todayIndex && (
                        <span className="block text-[10px] font-normal">hoje</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex-1 relative h-10 mr-3">
                    {HOUR_TICKS.map((h, i) => (
                      <span
                        key={h}
                        className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-[11px] font-mono text-neutral-400 ${
                          i % 2 === 1 ? 'hidden sm:inline' : ''
                        }`}
                        style={{ left: `${minutesToPercent(h * 60)}%` }}
                      >
                        {String(h).padStart(2, '0')}h
                      </span>
                    ))}
                  </div>
                  <div className="hidden md:block w-[9rem] flex-shrink-0 px-3 py-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Situação
                  </div>
                </>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="py-16 text-center text-neutral-500">
                <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Nenhum estagiário encontrado</p>
              </div>
            ) : (
              Object.entries(groupedEmployees).map(([dept, emps]) => {
                const isExpanded = !collapsedDepts[dept]
                const presentInDept = emps.filter(
                  (e) => summaries[e.id]?.status === 'PRESENT'
                ).length
                return (
                  <div key={dept}>
                    <button
                      className="w-full flex items-center px-3 sm:px-4 py-2 bg-neutral-800/60 border-b border-neutral-700 cursor-pointer hover:bg-neutral-800/80 transition-colors text-left"
                      onClick={() => setCollapsedDepts((prev) => ({ ...prev, [dept]: isExpanded }))}
                    >
                      <ChevronRight
                        className={`h-4 w-4 mr-2 text-neutral-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      />
                      <span className="text-sm font-bold text-neutral-200">{dept}</span>
                      <span className="ml-2 px-2 py-[0.125rem] bg-neutral-700/60 rounded-full text-xs text-neutral-300 font-medium">
                        {emps.length}
                      </span>
                      <span className="ml-2 text-xs text-primary-300/90">
                        {presentInDept} presente(s)
                      </span>
                    </button>

                    {isExpanded &&
                      emps.map((emp, idx) => {
                        const summary = summaries[emp.id]
                        const style = shiftStyle(emp.shift)
                        const range = formatShiftRange(emp.shiftStartTime, emp.shiftEndTime)
                        return (
                          <div
                            key={emp.id}
                            className={`flex items-stretch border-b border-neutral-800/50 hover:bg-white/[0.03] transition-colors ${
                              idx % 2 === 0 ? '' : 'bg-neutral-800/15'
                            }`}
                          >
                            <EmployeeCell emp={emp} summary={summary} style={style} />

                            {view === 'WEEK' ? (
                              <div className="flex-1 flex">
                                {visibleDays.map((day, dayIdx) => {
                                  const works = isPresumedWorkday(dayIdx, emp.workingDaysPerWeek)
                                  return (
                                    <div
                                      key={day}
                                      className={`flex-1 flex items-center justify-center px-1 py-2 border-l border-neutral-800/50 ${
                                        dayIdx === todayIndex ? 'bg-primary/5' : ''
                                      }`}
                                    >
                                      {works ? (
                                        <span
                                          className={`px-2 py-1 rounded-md border text-xs font-mono font-semibold whitespace-nowrap ${style.pill}`}
                                          title={`${DAYS[dayIdx]}: ${emp.shiftStartTime}–${emp.shiftEndTime} (${style.label})`}
                                        >
                                          {range}
                                        </span>
                                      ) : (
                                        <span
                                          className="text-neutral-600 text-xs"
                                          aria-label="Sem expediente"
                                        >
                                          —
                                        </span>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            ) : (
                              <>
                                <TodayTrack
                                  emp={emp}
                                  summary={summary}
                                  style={style}
                                  nowPercent={nowPercent}
                                  nowInRange={nowInRange}
                                />
                                <div className="hidden md:flex w-[9rem] flex-shrink-0 px-3 items-center">
                                  {summary && <StatusBadge summary={summary} />}
                                </div>
                              </>
                            )}
                          </div>
                        )
                      })}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {view === 'WEEK' && (
          <p className="mt-3 text-xs text-neutral-500">
            Horário de entrada e saída como cadastrado pelo aluno. O cadastro informa quantos dias
            por semana, não quais: os dias são preenchidos a partir de segunda (ex.: 3 dias =
            Seg–Qua).
          </p>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ summary }: { summary: TodaySummary }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-[0.125rem] rounded-full border text-[11px] font-medium whitespace-nowrap ${statusClass(summary)}`}
    >
      {statusText(summary)}
    </span>
  )
}

function EmployeeCell({
  emp,
  summary,
  style,
}: {
  emp: ScheduleEmployee
  summary: TodaySummary | undefined
  style: (typeof SHIFT_STYLES)[string]
}) {
  const present = summary?.status === 'PRESENT'
  return (
    <div className="w-40 sm:w-64 flex-shrink-0 px-3 sm:px-4 py-[0.625rem] flex items-center gap-3 min-w-0">
      <div
        className={`hidden sm:flex w-8 h-8 rounded-full items-center justify-center text-xs font-bold flex-shrink-0 ${
          present
            ? 'bg-primary-500/20 text-primary-300 ring-1 ring-primary-500/40'
            : 'bg-neutral-700/60 text-neutral-200'
        }`}
      >
        {getInitials(emp.name, emp.email)}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-white truncate" title={emp.name ?? emp.email}>
          {emp.name ?? 'Sem nome'}
        </p>
        {/* Horário cadastrado pelo aluno, sempre visível */}
        <p className="flex items-center gap-1 text-xs text-neutral-300 font-mono truncate">
          <span className={`w-[0.375rem] h-[0.375rem] rounded-full flex-shrink-0 ${style.dot}`} />
          <Clock className="h-3 w-3 text-neutral-500 flex-shrink-0" />
          {emp.shiftStartTime}–{emp.shiftEndTime}
        </p>
        <p className="text-[11px] text-neutral-400 truncate">
          {workingDaysLabel(emp.workingDaysPerWeek)}
          {emp.weeklyHours ? ` · ${emp.weeklyHours}h/sem` : ''}
          {emp.allowFlexibleHours ? ' · flexível' : ''}
        </p>
        {summary && (
          <div className="md:hidden mt-1">
            <StatusBadge summary={summary} />
          </div>
        )}
      </div>
    </div>
  )
}

function TodayTrack({
  emp,
  summary,
  style,
  nowPercent,
  nowInRange,
}: {
  emp: ScheduleEmployee
  summary: TodaySummary | undefined
  style: (typeof SHIFT_STYLES)[string]
  nowPercent: number
  nowInRange: boolean
}) {
  const planned = plannedShiftMinutes(emp)
  const left = minutesToPercent(planned.startMin)
  const width = Math.max(0, minutesToPercent(planned.endMin) - left)
  const range = formatShiftRange(emp.shiftStartTime, emp.shiftEndTime)
  const showPlanned = summary?.isWorkday ?? true

  return (
    <div className="flex-1 relative mr-3 min-h-[3.5rem]">
      {/* Linhas de hora */}
      {HOUR_TICKS.map((h) => (
        <div
          key={h}
          className="absolute top-0 bottom-0 w-[1px] bg-neutral-800/70"
          style={{ left: `${minutesToPercent(h * 60)}%` }}
        />
      ))}

      {/* Turno cadastrado */}
      {showPlanned && width > 0 && (
        <div
          className={`absolute top-2 h-6 rounded-md border border-dashed flex items-center justify-center overflow-hidden ${style.bar}`}
          style={{ left: `${left}%`, width: `${width}%` }}
          title={`Horário cadastrado: ${emp.shiftStartTime}–${emp.shiftEndTime} (${style.label})`}
        >
          <span className="text-[11px] font-mono font-semibold text-neutral-100 px-1 truncate">
            {range}
          </span>
        </div>
      )}
      {!showPlanned && (
        <span className="absolute top-3 left-1 text-[11px] text-neutral-500">
          Sem expediente hoje ({range})
        </span>
      )}

      {/* Tempo registrado hoje */}
      {summary?.segments.map((seg, i) => {
        const sl = minutesToPercent(seg.startMin)
        const sw = Math.max(0.6, minutesToPercent(seg.endMin) - sl)
        return (
          <div
            key={i}
            className={`absolute bottom-2 h-2 rounded-full bg-primary-400 ${seg.open ? 'animate-pulse' : ''}`}
            style={{ left: `${sl}%`, width: `${sw}%` }}
            title={`Registrado: ${minutesToTime(seg.startMin)}–${seg.open ? 'agora' : minutesToTime(seg.endMin)}`}
          />
        )
      })}

      {/* Agora */}
      {nowInRange && (
        <div
          className="absolute top-0 bottom-0 w-[1px] bg-error-500/80 z-10"
          style={{ left: `${nowPercent}%` }}
        />
      )}
    </div>
  )
}
