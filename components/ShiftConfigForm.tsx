'use client'

import React from 'react'
import { Clock, AlertCircle } from 'lucide-react'
import { calculateExpectedDailyHours, getShiftDescription, getShiftStartTime } from '@/lib/shift-validation'
import { getContractTypeConfig } from '@/lib/contract-types'

interface ShiftConfigFormProps {
  shift: 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'HYBRID'
  shiftStartTime: string
  shiftEndTime: string
  workingDaysPerWeek: number
  allowFlexibleHours: boolean
  contractType?: string
  onChange: (field: string, value: any) => void
  errors?: Record<string, string>
}

export function ShiftConfigForm({
  shift,
  shiftStartTime,
  shiftEndTime,
  workingDaysPerWeek,
  allowFlexibleHours,
  contractType,
  onChange,
  errors = {}
}: ShiftConfigFormProps) {
  // Obter carga horária do tipo de contrato
  const contractConfig = contractType ? getContractTypeConfig(contractType) : null
  const weeklyHours = contractConfig?.weeklyHours || 20
  const expectedDailyHours = calculateExpectedDailyHours(weeklyHours, workingDaysPerWeek)
  
  // Atualizar horários de turno automaticamente quando o turno muda
  const handleShiftChange = (newShift: string) => {
    onChange('shift', newShift)
    
    // Definir horários padrão baseado no turno
    const defaultTimes = getShiftStartTime(newShift as any)
    onChange('shiftStartTime', defaultTimes.start)
    onChange('shiftEndTime', defaultTimes.end)
  }

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
          className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="MORNING">🌅 Período da Manhã (08:00-12:00)</option>
          <option value="AFTERNOON">🌤️ Período da Tarde (13:00-17:00)</option>
          <option value="NIGHT">🌙 Período Noturno (18:00-22:00)</option>
          <option value="HYBRID">🔄 Período Híbrido (08:00-14:00)</option>
        </select>
        <p className="mt-1 text-xs text-neutral-400">
          {getShiftDescription(shift as any)}
        </p>
      </div>

      {/* Horário de Início */}
      <div>
        <label htmlFor="shift-start-time" className="block text-sm font-medium text-white mb-2">
          Horário de Início
        </label>
        <input
          id="shift-start-time"
          type="time"
          value={shiftStartTime}
          onChange={(e) => onChange('shiftStartTime', e.target.value)}
          className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.shiftStartTime && (
          <p className="mt-1 text-xs text-error-400 flex items-center space-x-1">
            <AlertCircle className="h-3 w-3" />
            <span>{errors.shiftStartTime}</span>
          </p>
        )}
      </div>

      {/* Horário de Fim */}
      <div>
        <label htmlFor="shift-end-time" className="block text-sm font-medium text-white mb-2">
          Horário de Fim
        </label>
        <input
          id="shift-end-time"
          type="time"
          value={shiftEndTime}
          onChange={(e) => onChange('shiftEndTime', e.target.value)}
          className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.shiftEndTime && (
          <p className="mt-1 text-xs text-error-400 flex items-center space-x-1">
            <AlertCircle className="h-3 w-3" />
            <span>{errors.shiftEndTime}</span>
          </p>
        )}
      </div>

      {/* Dias de Trabalho por Semana */}
      <div>
        <label htmlFor="working-days" className="block text-sm font-medium text-white mb-2">
          Dias de Trabalho por Semana
        </label>
        <input
          id="working-days"
          type="number"
          min="1"
          max="7"
          value={workingDaysPerWeek}
          onChange={(e) => onChange('workingDaysPerWeek', Number(e.target.value))}
          className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="mt-1 text-xs text-neutral-400">
          Padrão: 5 dias (segunda a sexta)
        </p>
      </div>

      {/* Informações de Carga Horária */}
      <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
        <p className="text-sm text-white mb-2">
          <span className="font-medium">Carga Horária:</span> {weeklyHours}h/semana
        </p>
        <p className="text-sm text-white">
          <span className="font-medium">Horas Diárias Esperadas:</span> {expectedDailyHours.toFixed(2)}h/dia
        </p>
        <p className="text-xs text-neutral-300 mt-2">
          Calculado como: {weeklyHours}h/semana ÷ {workingDaysPerWeek} dias = {expectedDailyHours.toFixed(2)}h/dia
        </p>
        {!contractType && (
          <p className="text-xs text-warning-400 mt-2">
            ⚠️ Selecione um tipo de contrato para calcular as horas diárias
          </p>
        )}
      </div>

      {/* Permitir Horas Flexíveis */}
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
