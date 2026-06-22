'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Home,
  LogOut,
  Clock,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { handleCompleteLogout } from '@/lib/logout'

interface ScheduleEmployee {
  id: string
  name: string | null
  email: string
  department: string | null
  shiftStartTime: string
  shiftEndTime: string
  workingDaysPerWeek: number
  shift: string | null
  contractType: string | null
  isPresent: boolean
  lastRecord: { type: string; timestamp: string } | null
}

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6) // 06h–22h

function timeToPercent(time: string, start = 6, end = 22): number {
  const [h, m] = time.split(':').map(Number)
  const totalMins = (h - start) * 60 + m
  const range = (end - start) * 60
  return Math.max(0, Math.min(100, (totalMins / range) * 100))
}

function shiftColor(shift: string | null, isPresent: boolean) {
  if (isPresent) return 'bg-emerald-500/80 border-emerald-400'
  switch (shift) {
    case 'MORNING':
      return 'bg-sky-500/70 border-sky-400'
    case 'AFTERNOON':
      return 'bg-amber-500/70 border-amber-400'
    case 'NIGHT':
      return 'bg-violet-500/70 border-violet-400'
    default:
      return 'bg-teal-500/70 border-teal-400'
  }
}

function shiftLabel(shift: string | null) {
  switch (shift) {
    case 'MORNING':
      return 'Manhã'
    case 'AFTERNOON':
      return 'Tarde'
    case 'NIGHT':
      return 'Noite'
    default:
      return 'Híbrido'
  }
}

function getInitials(name: string | null, email: string) {
  if (name) {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }
  return email[0].toUpperCase()
}

function getDayIndex(date: Date) {
  const d = date.getDay()
  return d === 0 ? 6 : d - 1 // Mon=0 ... Sun=6
}

export default function SchedulePage() {
  const { data: session, status } = useSession()
  const [employees, setEmployees] = useState<ScheduleEmployee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [weekOffset, setWeekOffset] = useState(0) // 0 = current week
  const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>({})

  const todayIndex = getDayIndex(new Date())

  // Current time logic for "Now" indicator
  const [currentTime, setCurrentTime] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])
  
  const nowPercent = timeToPercent(`${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`)

  const loadSchedule = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/schedule')
      if (res.ok) {
        const data = await res.json()
        setEmployees(data.employees ?? [])
      }
    } catch (e) {
      console.error('Erro ao carregar quadro:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session) loadSchedule()
  }, [session, loadSchedule])

  const filtered = employees.filter((emp) => {
    const q = search.toLowerCase()
    return (
      (emp.name ?? '').toLowerCase().includes(q) ||
      (emp.department ?? '').toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q)
    )
  })

  // Group by department
  const groupedEmployees = filtered.reduce((acc, emp) => {
    const dept = emp.department || 'Sem Departamento'
    if (!acc[dept]) acc[dept] = []
    acc[dept].push(emp)
    return acc
  }, {} as Record<string, ScheduleEmployee[]>)

  // Build week label
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - getDayIndex(today) + weekOffset * 7)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  const weekLabel = `${weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – ${weekEnd.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`

  if (status === 'loading' || loading) return <Loading size="lg" text="Carregando quadro..." />

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Header */}
      <div className="glass border-b border-neutral-700/50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              aria-label="Voltar ao painel"
              className="hover:opacity-80 transition-opacity"
            >
              <Home className="h-5 w-5 text-primary" />
            </Link>
            <div className="h-5 w-px bg-neutral-600" />
            <div className="flex items-center gap-2">
              <div className="bg-primary/20 rounded-xl p-1.5">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white leading-none">Quadro de Horários</h1>
                <p className="text-neutral-400 text-xs">Turnos e presença dos estagiários</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-neutral-800/60 border border-neutral-700 rounded-xl px-3 py-1.5">
              <Search className="h-3.5 w-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar estagiário..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-sm text-white placeholder-neutral-500 outline-none w-40"
              />
            </div>
            <Button variant="ghost" size="icon" onClick={handleCompleteLogout} aria-label="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Legend + Week nav */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500/80 inline-block" /> Presente agora
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-sky-500/70 inline-block" /> Manhã
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500/70 inline-block" /> Tarde
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-violet-500/70 inline-block" /> Noite
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-teal-500/70 inline-block" /> Híbrido
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              aria-label="Semana anterior"
              className="p-1 rounded-lg hover:bg-neutral-700/50 text-neutral-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-neutral-300 font-medium min-w-[180px] text-center">
              {weekLabel}
            </span>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              aria-label="Próxima semana"
              className="p-1 rounded-lg hover:bg-neutral-700/50 text-neutral-400 hover:text-white transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Summary bar */}
        <div className="flex items-center gap-4 mb-4 text-sm text-neutral-400">
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" /> {filtered.length} estagiário(s)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {filtered.filter((e) => e.isPresent).length} presente(s) agora
          </span>
        </div>

        {/* Grid */}
        <div className="bg-neutral-900/60 border border-neutral-700/40 rounded-2xl overflow-auto shadow-xl">
          {/* Hour header */}
          <div className="flex border-b border-neutral-700/60 sticky top-0 z-10 bg-neutral-900/95 backdrop-blur">
            {/* Employee col */}
            <div className="w-52 flex-shrink-0 px-4 py-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Estagiário
            </div>
            {/* Days header */}
            <div className="flex-1 relative min-w-[420px]">
              <div className="flex h-full">
                {DAYS.map((day, i) => (
                  <div
                    key={day}
                    className={`flex-1 relative text-center text-xs py-3 font-semibold border-l border-neutral-800/60 transition-colors ${
                      i === todayIndex && weekOffset === 0
                        ? 'text-primary bg-primary/5'
                        : 'text-neutral-400'
                    }`}
                  >
                    {day}
                    {i === todayIndex && weekOffset === 0 && (
                      <span className="block w-1.5 h-1.5 rounded-full bg-primary mx-auto mt-0.5" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Hours axis */}
            <div className="w-8 flex-shrink-0" />
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-neutral-500">
              <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>Nenhum estagiário encontrado</p>
            </div>
          ) : (
            Object.entries(groupedEmployees).map(([dept, emps]) => {
              const isExpanded = expandedDepts[dept] !== false
              return (
                <div key={dept}>
                  <button 
                    className="w-full flex items-center px-4 py-2 bg-neutral-800/50 border-b border-neutral-700 cursor-pointer hover:bg-neutral-800/70 transition-colors text-left"
                    onClick={() => setExpandedDepts(prev => ({...prev, [dept]: !isExpanded}))}
                    aria-expanded={isExpanded}
                  >
                    <div className="w-4 flex justify-center mr-2">
                      <ChevronRight className={`h-4 w-4 text-neutral-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                    <span className="text-sm font-bold text-neutral-300">{dept}</span>
                    <span className="ml-2 px-2 py-0.5 bg-neutral-700/50 rounded-full text-xs text-neutral-400 font-medium">
                      {emps.length}
                    </span>
                  </button>
                  
                  {isExpanded && emps.map((emp, idx) => {
                    const initials = getInitials(emp.name, emp.email)
                    const activeDays = Math.min(emp.workingDaysPerWeek, 7)
                    const startPct = timeToPercent(emp.shiftStartTime)
                    const endPct = timeToPercent(emp.shiftEndTime)
                    const barWidth = Math.max(0, endPct - startPct)
                    const color = shiftColor(emp.shift, emp.isPresent)

                    return (
                      <div
                        key={emp.id}
                        className={`flex border-b border-neutral-800/40 hover:bg-white/[0.02] transition-colors group ${
                          idx % 2 === 0 ? '' : 'bg-neutral-800/10'
                        }`}
                      >
                        {/* Employee info */}
                        <div className="w-52 flex-shrink-0 px-4 py-3 flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              emp.isPresent
                                ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                                : 'bg-neutral-700/60 text-neutral-300'
                            }`}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate leading-none mb-0.5">
                              {emp.name ?? 'Sem nome'}
                            </p>
                            <p className="text-[10px] text-neutral-500 truncate">
                              {emp.lastRecord ? `Último registro: ${new Date(emp.lastRecord.timestamp).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}` : emp.email}
                            </p>
                          </div>
                        </div>

                        {/* Day bars */}
                        <div className="flex-1 min-w-[420px] flex items-center">
                          {DAYS.map((day, dayIdx) => {
                            const isWorkday = dayIdx < activeDays
                            const isToday = dayIdx === todayIndex && weekOffset === 0
                            return (
                              <div
                                key={day}
                                className={`flex-1 relative h-10 border-l border-neutral-800/40 ${
                                  isToday ? 'bg-primary/5' : ''
                                }`}
                              >
                                {isToday && (
                                  <div 
                                    className="absolute top-0 bottom-0 w-px bg-red-500/50 z-0" 
                                    style={{ left: `${nowPercent}%` }}
                                    title={`Agora: ${currentTime.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`}
                                  />
                                )}
                                {isWorkday && (
                                  <div
                                    className={`absolute top-1/2 -translate-y-1/2 h-6 rounded border ${color} transition-all duration-200 group-hover:h-7 z-10 hover:brightness-125 hover:shadow-lg`}
                                    style={{
                                      left: `${startPct}%`,
                                      width: `${barWidth}%`,
                                    }}
                                    title={`${emp.shiftStartTime}–${emp.shiftEndTime} (${shiftLabel(emp.shift)})`}
                                  />
                                )}
                              </div>
                            )
                          })}
                        </div>

                        {/* Time label */}
                        <div className="w-20 flex-shrink-0 px-2 flex items-center justify-end">
                          <span className="text-[10px] text-neutral-500 font-mono whitespace-nowrap">
                            <Clock className="h-2.5 w-2.5 inline mr-0.5 opacity-60" />
                            {emp.shiftStartTime}–{emp.shiftEndTime}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
