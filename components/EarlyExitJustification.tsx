'use client'

import React, { useState } from 'react'
import { AlertCircle, Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface EarlyExitJustificationProps {
  minutesEarly: number
  expectedEndTime: string
  onSubmit: (justification: string) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function EarlyExitJustification({
  minutesEarly,
  expectedEndTime,
  onSubmit,
  onCancel,
  isLoading = false
}: EarlyExitJustificationProps) {
  const [justification, setJustification] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!justification.trim()) {
      setError('Justificativa é obrigatória')
      return
    }

    if (justification.trim().length < 10) {
      setError('Justificativa deve ter no mínimo 10 caracteres')
      return
    }

    try {
      await onSubmit(justification)
    } catch (err) {
      setError('Erro ao processar justificativa')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full border border-border">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-warning-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Saída Antecipada
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Você está saindo {minutesEarly} minutos antes do horário esperado ({expectedEndTime})
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="justification" className="block text-sm font-medium text-foreground mb-2">
              Justificativa Obrigatória *
            </label>
            <textarea
              id="justification"
              value={justification}
              onChange={(e) => {
                setJustification(e.target.value)
                setError('')
              }}
              placeholder="Explique o motivo da saída antecipada..."
              className="w-full px-4 py-3 bg-muted border border-input rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px] resize-none"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Mínimo 10 caracteres
            </p>
          </div>

          {error && (
            <div className="p-3 bg-error-900/30 border border-error-500/50 rounded-lg">
              <p className="text-sm text-error-400 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </p>
            </div>
          )}

          {/* Info Box */}
          <div className="p-3 bg-info-900/20 border border-info-500/30 rounded-lg">
            <p className="text-xs text-info-300">
              ℹ️ Esta justificativa será registrada e revisada pelo administrador.
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !justification.trim()}
              className="flex-1 flex items-center justify-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>{isLoading ? 'Processando...' : 'Confirmar Saída'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
