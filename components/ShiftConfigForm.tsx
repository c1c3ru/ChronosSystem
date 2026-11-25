'use client'

import React, { useState } from 'react'
import { Clock, AlertCircle, CalendarDays } from 'lucide-react'
import {
  calculateExpectedDailyHours,
  getShiftDescription,
  getShiftStartTime,
} from '@/lib/shift-validation'
import { getContractTypeConfig } from '@/lib/contract-types'
import {
  WEEKDAY_NAMES,
  WEEKDAY_SHORT,
  dayErrorKey,
  describeSchedule,
  isUniformSchedule,
  sortSchedule,
  type WeeklySchedule,
} from '@/lib/weekly-schedule'
import { timeToMinutes } from '@/lib/schedule-status'

type Shift = 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'HYBRID'

export type ShiftFieldValue = string | number | boolean | WeeklySchedule

interface ShiftConfigFormProps {
  shift: Shift
  /** Dias trabalhados e horário de cada dia (segunda = 0 … domingo = 6). */
  weeklySchedule: WeeklySchedule
  allowFlexibleHours: boolean
  contractType?: string
  onChange: (field: string, value: ShiftFieldValue) => void
  errors?: Record<string, string>
  /** Esconde a opção de horas flexíveis (o aluno não pode alterá-la em "Meu perfil"). */
  showFlexibleHours?: boolean
}

const inputBase =
  'w-full py-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2'
const inputClass = (hasError: boolean, compact = false) =>
  `${inputBase} ${compact ? 'px-2' : 'px-4'} ${hasError ? 'border-error focus:ring-error' : 'border-neutral-600 focus:ring-primary'}`

function ErrorText({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p role="alert" className="mt-1 text-xs text-error flex items-center space-x-1">
      <AlertCircle className="h-3 w-3 flex-shrink-0" />
      <span>{message}</span>
    </p>
  )
}

/** Soma das horas do horário informado na semana. */
function scheduledWeeklyHours(schedule: WeeklySchedule): number {
  return schedule.reduce((total, d) => {
    const diff = timeToMinutes(d.end) - timeToMinutes(d.start)
    return total + (diff > 0 ? diff / 60 : 0)
  }, 0)
}

const formatHours = (h: number) => (Number.isInteger(h) ? `${h}h` : `${h.toFixed(1)}h`)

export function ShiftConfigForm({
  shift,
  weeklySchedule,
  allowFlexibleHours,
  contractType,
  onChange,
  errors = {},
  showFlexibleHours = true,
}: ShiftConfigFormProps) {
  const schedule = sortSchedule(weeklySchedule)
  const [perDay, setPerDay] = useState(() => !isUniformSchedule(schedule))

  const contractConfig = contractType ? getContractTypeConfig(contractType) : null
  const weeklyHours = contractConfig?.weeklyHours || 20
  const daysCount = schedule.length
  const expectedDailyHours = calculateExpectedDailyHours(weeklyHours, Math.max(daysCount, 1))
  const plannedHours = scheduledWeeklyHours(schedule)

  const first = schedule[0]
  const defaults = getShiftStartTime(shift)
  const sharedStart = first?.start ?? defaults.start
  const sharedEnd = first?.end ?? defaults.end

  const emit = (next: WeeklySchedule) => onChange('weeklySchedule', sortSchedule(next))

  const handleShiftChange = (newShift: string) => {
    onChange('shift', newShift)
    const times = getShiftStartTime(newShift as Shift)
    emit(schedule.map((d) => ({ ...d, start: times.start, end: times.end })))
  }

  const toggleDay = (day: number) => {
    if (schedule.some((d) => d.day === day)) {
      emit(schedule.filter((d) => d.day !== day))
    } else {
      emit([...schedule, { day, start: sharedStart, end: sharedEnd }])
    }
  }

  const setShared = (field: 'start' | 'end', value: string) =>
    emit(schedule.map((d) => ({ ...d, [field]: value })))

  const setDay = (day: number, field: 'start' | 'end', value: string) =>
    emit(schedule.map((d) => (d.day === day ? { ...d, [field]: value } : d)))

  const togglePerDay = (checked: boolean) => {
    setPerDay(checked)
    // Voltando para "mesmo horário": todos os dias assumem o horário do primeiro.
    if (!checked && first) emit(schedule.map((d) => ({ ...d, start: first.start, end: first.end })))
  }

  // No modo "mesmo horário", qualquer erro de dia aparece sob os campos únicos.
  const firstDayError = schedule.map((d) => errors[dayErrorKey(d.day)]).find(Boolean)
  const sharedStartError = errors.shiftStartTime
  const sharedEndError = errors.shiftEndTime || firstDayError

  return (
    <div className="space-y-6 p-6 bg-neutral-800/30 rounded-lg border border-neutral-700">
      <div className="flex items-center space-x-2 mb-4">
        <Clock className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-white">Configuração de Turno</h3>
      </div>

      {/* Tipo de Turno */}
      <div>
        <label htmlFor="shift-type" className="block text-sm font-medium text-white mb-2">
          Tipo de Turno
        </label>
        <select
          id="shift-type"
          value={shift}
          onChange={(e) => handleShiftChange(e.target.value)}
          className={inputClass(false)}
        >
          <option value="MORNING">🌅 Período da Manhã (08:00-12:00)</option>
          <option value="AFTERNOON">🌤️ Período da Tarde (13:00-17:00)</option>
          <option value="NIGHT">🌙 Período Noturno (18:00-22:00)</option>
          <option value="HYBRID">🔄 Período Híbrido (08:00-14:00)</option>
        </select>
        <p className="mt-1 text-xs text-neutral-400">{getShiftDescription(shift)}</p>
      </div>

      {/* Dias da semana */}
      <fieldset>
        <legend className="block text-sm font-medium text-white mb-2">
          <CalendarDays className="inline h-4 w-4 mr-1" />
          Dias de estágio
        </legend>
        <div id="shift-days" className="grid grid-cols-7 gap-2" tabIndex={-1}>
          {WEEKDAY_SHORT.map((label, day) => {
            const active = schedule.some((d) => d.day === day)
            return (
              <button
                key={label}
                type="button"
                onClick={() => toggleDay(day)}
                aria-pressed={active}
                aria-label={WEEKDAY_NAMES[day]}
                className={`h-12 rounded-lg border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  active
                    ? 'bg-primary border-primary text-white'
                    : 'bg-neutral-700 border-neutral-600 text-neutral-400'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
        <ErrorText message={errors.weeklySchedule || errors.workingDaysPerWeek} />
        <p className="mt-2 text-xs text-neutral-400">
          Toque nos dias para marcar ou desmarcar. {daysCount} dia(s) por semana
          {daysCount > 0 ? ` · ${describeSchedule(schedule)}` : ''}.
        </p>
      </fieldset>

      {/* Horário igual ou diferente por dia */}
      {daysCount > 0 && (
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="shift-per-day"
            checked={perDay}
            onChange={(e) => togglePerDay(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-neutral-600 bg-neutral-700 text-primary focus:ring-2 focus:ring-primary"
          />
          <label htmlFor="shift-per-day" className="text-sm text-white">
            Horário diferente em cada dia
            <span className="block text-xs text-neutral-400">
              Use quando as aulas mudam o horário de um dia para outro.
            </span>
          </label>
        </div>
      )}

      {daysCount > 0 && !perDay && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="shift-start-time" className="block text-sm font-medium text-white mb-2">
              Horário de Início
            </label>
            <input
              id="shift-start-time"
              type="time"
              value={sharedStart}
              onChange={(e) => setShared('start', e.target.value)}
              aria-invalid={!!sharedStartError}
              className={inputClass(!!sharedStartError)}
            />
            <ErrorText message={sharedStartError} />
          </div>
          <div>
            <label htmlFor="shift-end-time" className="block text-sm font-medium text-white mb-2">
              Horário de Fim
            </label>
            <input
              id="shift-end-time"
              type="time"
              value={sharedEnd}
              onChange={(e) => setShared('end', e.target.value)}
              aria-invalid={!!sharedEndError}
              className={inputClass(!!sharedEndError)}
            />
            <ErrorText message={sharedEndError} />
          </div>
        </div>
      )}

      {daysCount > 0 && perDay && (
        <div className="space-y-3">
          {schedule.map((d) => {
            const error = errors[dayErrorKey(d.day)]
            return (
              <div
                key={d.day}
                className={`rounded-lg border p-3 ${error ? 'border-error' : 'border-neutral-700'}`}
              >
                <p className="text-sm font-semibold text-white mb-2">{WEEKDAY_NAMES[d.day]}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor={`shift-start-${d.day}`}
                      className="block text-xs text-neutral-300 mb-1"
                    >
                      Início
                    </label>
                    <input
                      id={`shift-start-${d.day}`}
                      type="time"
                      value={d.start}
                      onChange={(e) => setDay(d.day, 'start', e.target.value)}
                      aria-invalid={!!error}
                      className={inputClass(!!error, true)}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`shift-end-${d.day}`}
                      className="block text-xs text-neutral-300 mb-1"
                    >
                      Fim
                    </label>
                    <input
                      id={`shift-end-${d.day}`}
                      type="time"
                      value={d.end}
                      onChange={(e) => setDay(d.day, 'end', e.target.value)}
                      aria-invalid={!!error}
                      className={inputClass(!!error, true)}
                    />
                  </div>
                </div>
                <ErrorText message={error} />
              </div>
            )
          })}
        </div>
      )}

      {/* Informações de Carga Horária */}
      <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
        <p className="text-sm text-white mb-2">
          <span className="font-medium">Carga Horária do contrato:</span> {weeklyHours}h/semana
        </p>
        <p className="text-sm text-white">
          <span className="font-medium">Horas no horário informado:</span>{' '}
          {formatHours(plannedHours)}/semana
        </p>
        {daysCount > 0 && (
          <p className="text-xs text-neutral-300 mt-2">
            Média esperada: {weeklyHours}h ÷ {daysCount} dia(s) = {expectedDailyHours.toFixed(2)}
            h/dia
          </p>
        )}
        {daysCount > 0 && Math.abs(plannedHours - weeklyHours) >= 0.5 && (
          <p className="text-xs text-warning mt-2">
            ⚠️ O horário informado soma {formatHours(plannedHours)} por semana, diferente das{' '}
            {weeklyHours}h do contrato. Confira se está certo.
          </p>
        )}
        {!contractType && (
          <p className="text-xs text-warning mt-2">
            ⚠️ Selecione um tipo de contrato para calcular as horas diárias
          </p>
        )}
      </div>

      {showFlexibleHours && (
        <>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="allowFlexibleHours"
              checked={allowFlexibleHours}
              onChange={(e) => onChange('allowFlexibleHours', e.target.checked)}
              className="w-4 h-4 rounded border-neutral-600 bg-neutral-700 text-primary focus:ring-2 focus:ring-primary"
            />
            <label htmlFor="allowFlexibleHours" className="text-sm text-white">
              Permitir horas flexíveis?
            </label>
          </div>
          <p className="text-xs text-neutral-400">
            Se ativado, o sistema será mais flexível com validações de horário de entrada/saída.
          </p>
        </>
      )}

      {/* Informações de Validação */}
      <div className="p-4 bg-info-500/10 border border-info-500/30 rounded-lg">
        <p className="text-xs text-info-300 font-medium mb-2">ℹ️ Validações Aplicadas:</p>
        <ul className="text-xs text-info-300 space-y-1">
          <li>✓ Entrada dentro de ±30min a ±1h do horário (conforme turno)</li>
          <li>✓ Saída dentro de ±15min a ±1h do horário (conforme turno)</li>
          <li>✓ Horário de funcionamento: 08:00 - 22:00</li>
          <li>✓ Intervalo de almoço: 12:00 - 13:00</li>
          <li>✓ Mínimo 1 minuto entre registros</li>
        </ul>
      </div>
    </div>
  )
}
