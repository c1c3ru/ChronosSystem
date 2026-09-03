'use client'

import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

type CronLogStatus = 'SUCCESS' | 'PARTIAL_FAILURE' | 'ERROR'

interface CronLogFailure {
  email: string
  message: string
}

interface CronLogEntry {
  id: string
  jobName: string
  status: CronLogStatus
  startedAt: string
  finishedAt: string | null
  totalCount: number
  successCount: number
  failureCount: number
  failures: CronLogFailure[]
  errorMessage: string | null
}

const JOB_LABELS: Record<string, string> = {
  'daily-justification-check': 'Lembrete de Justificativas',
  'attendance-reminder': 'Lembrete de Ponto',
}

const STATUS_META: Record<
  CronLogStatus,
  { label: string; icon: typeof CheckCircle2; badgeClass: string; iconClass: string }
> = {
  SUCCESS: {
    label: 'Sucesso',
    icon: CheckCircle2,
    badgeClass: 'bg-success/20 text-success border-success/30',
    iconClass: 'text-success',
  },
  PARTIAL_FAILURE: {
    label: 'Falha parcial no envio',
    icon: AlertTriangle,
    badgeClass: 'bg-warning/20 text-warning border-warning/30',
    iconClass: 'text-warning',
  },
  ERROR: {
    label: 'Falha na API',
    icon: XCircle,
    badgeClass: 'bg-error/20 text-error border-error/30',
    iconClass: 'text-error',
  },
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Painel "Status dos Alertas": histórico recente de execuções dos crons de
 * notificação (justificativas pendentes, lembretes de ponto), lido de
 * GET /api/admin/cron-logs. Cores semânticas: verde = tudo enviado, amarelo
 * = parte dos e-mails falhou (o job rodou até o fim), vermelho = o job
 * quebrou antes de terminar.
 */
export function CronStatusPanel() {
  const [logs, setLogs] = useState<CronLogEntry[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoadError(false)
    fetch('/api/admin/cron-logs?limit=10')
      .then((res) => {
        if (!res.ok) throw new Error('Falha ao buscar logs')
        return res.json()
      })
      .then((data) => setLogs(data.logs))
      .catch(() => setLoadError(true))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <Card variant="glass">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-white">Status dos Alertas</CardTitle>
        <button
          type="button"
          onClick={load}
          className="text-neutral-400 hover:text-white transition-colors"
          aria-label="Atualizar status dos alertas"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent>
        {loadError && (
          <p className="text-sm text-neutral-400">
            Não foi possível carregar o histórico de execuções dos crons.
          </p>
        )}

        {!loadError && logs === null && (
          <p className="text-sm text-neutral-400">Carregando...</p>
        )}

        {!loadError && logs !== null && logs.length === 0 && (
          <p className="text-sm text-neutral-400">
            Nenhuma execução registrada ainda — os crons gravam um log a cada disparo.
          </p>
        )}

        {!loadError && logs !== null && logs.length > 0 && (
          <ul className="space-y-2">
            {logs.map((log) => {
              const meta = STATUS_META[log.status]
              const Icon = meta.icon
              const hasDetails = log.failures.length > 0 || Boolean(log.errorMessage)
              const isExpanded = expandedId === log.id

              return (
                <li
                  key={log.id}
                  className="rounded-lg border border-neutral-700/50 bg-neutral-800/40 overflow-hidden"
                >
                  <button
                    type="button"
                    disabled={!hasDetails}
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    className={`w-full flex flex-wrap items-center justify-between gap-2 p-3 text-left ${
                      hasDetails ? 'cursor-pointer hover:bg-neutral-800/60' : 'cursor-default'
                    } transition-colors`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`h-5 w-5 flex-shrink-0 ${meta.iconClass}`} aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {JOB_LABELS[log.jobName] || log.jobName}
                        </p>
                        <p className="text-xs text-neutral-400">{formatDateTime(log.startedAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {log.totalCount > 0 && (
                        <span className="text-xs text-neutral-400">
                          {log.successCount}/{log.totalCount} enviados
                        </span>
                      )}
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full border ${meta.badgeClass}`}
                      >
                        {meta.label}
                      </span>
                    </div>
                  </button>

                  {isExpanded && hasDetails && (
                    <div className="px-3 pb-3 border-t border-neutral-700/50 pt-2">
                      {log.errorMessage && <p className="text-xs text-error">{log.errorMessage}</p>}
                      {log.failures.length > 0 && (
                        <ul className="mt-1 space-y-1">
                          {log.failures.map((failure, index) => (
                            <li key={index} className="text-xs text-neutral-400">
                              <span className="text-neutral-300">{failure.email}</span>:{' '}
                              {failure.message}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
