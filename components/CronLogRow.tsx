import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

export type CronLogStatus = 'SUCCESS' | 'PARTIAL_FAILURE' | 'ERROR'

export interface CronLogFailure {
  email: string
  message: string
}

export interface CronLogEntry {
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

export const JOB_LABELS: Record<string, string> = {
  'daily-justification-check': 'Lembrete de Justificativas',
  'attendance-reminder': 'Lembrete de Ponto',
}

export const STATUS_META: Record<
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

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface CronLogRowProps {
  log: CronLogEntry
  isExpanded: boolean
  onToggle: () => void
}

/**
 * Uma linha do histórico de execuções dos crons de notificação — usada tanto
 * na prévia compacta do dashboard (CronStatusPanel) quanto na página completa
 * (/admin/alerts), para manter os dois em sincronia visual.
 */
export function CronLogRow({ log, isExpanded, onToggle }: CronLogRowProps) {
  const meta = STATUS_META[log.status]
  const Icon = meta.icon
  const hasDetails = log.failures.length > 0 || Boolean(log.errorMessage)

  return (
    <li className="rounded-lg border border-neutral-700/50 bg-neutral-800/40 overflow-hidden">
      <button
        type="button"
        disabled={!hasDetails}
        onClick={onToggle}
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
          <span className={`text-xs font-medium px-2 py-1 rounded-full border ${meta.badgeClass}`}>
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
                  <span className="text-neutral-300">{failure.email}</span>: {failure.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  )
}
