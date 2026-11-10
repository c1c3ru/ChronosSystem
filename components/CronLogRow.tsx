import { CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react'
import { explainSendFailure, type SendFailureExplanation } from '@/lib/send-failure'

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

/**
 * Execução em que nada falhou de verdade — só sobraram envios adiados para a
 * próxima execução (orçamento de tempo). Não é erro, então não usa o amarelo.
 */
const DEFERRED_ONLY_META = {
  label: 'Envio adiado',
  icon: Clock,
  badgeClass: 'bg-info/20 text-info border-info/30',
  iconClass: 'text-info',
}

interface FailureGroup {
  explanation: SendFailureExplanation
  emails: string[]
  /** Mensagem técnica original (a primeira do grupo), para diagnóstico. */
  detail: string
}

/** Agrupa as falhas pelo motivo, para não repetir a mesma explicação por aluno. */
export function groupFailures(failures: CronLogFailure[]): FailureGroup[] {
  const groups = new Map<string, FailureGroup>()
  for (const failure of failures) {
    const explanation = explainSendFailure(failure.message)
    const key = `${explanation.kind}:${explanation.title}`
    const group = groups.get(key)
    if (group) {
      group.emails.push(failure.email)
    } else {
      groups.set(key, { explanation, emails: [failure.email], detail: failure.message })
    }
  }
  // Falhas reais primeiro; adiamentos (que não são erro) por último.
  return [...groups.values()].sort(
    (a, b) => Number(a.explanation.deferred) - Number(b.explanation.deferred)
  )
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
  const groups = groupFailures(log.failures)
  const deferredCount = groups
    .filter((g) => g.explanation.deferred)
    .reduce((sum, g) => sum + g.emails.length, 0)
  const failedCount = log.failures.length - deferredCount
  const deferredOnly = log.status === 'PARTIAL_FAILURE' && failedCount === 0 && deferredCount > 0

  const meta = deferredOnly ? DEFERRED_ONLY_META : STATUS_META[log.status]
  const Icon = meta.icon
  const hasDetails = log.failures.length > 0 || Boolean(log.errorMessage)

  return (
    <li className="rounded-lg border border-neutral-700/50 bg-neutral-800/40 overflow-hidden">
      <button
        type="button"
        disabled={!hasDetails}
        onClick={onToggle}
        aria-expanded={hasDetails ? isExpanded : undefined}
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
        <div className="flex flex-wrap items-center gap-3">
          {log.totalCount > 0 && (
            <span className="text-xs text-neutral-400">
              {log.successCount}/{log.totalCount} enviados
              {deferredCount > 0 && ` · ${deferredCount} adiado${deferredCount > 1 ? 's' : ''}`}
              {failedCount > 0 && ` · ${failedCount} com erro`}
            </span>
          )}
          <span className={`text-xs font-medium px-2 py-1 rounded-full border ${meta.badgeClass}`}>
            {meta.label}
          </span>
        </div>
      </button>

      {isExpanded && hasDetails && (
        <div className="px-3 pb-3 border-t border-neutral-700/50 pt-2 space-y-3">
          {log.errorMessage && <p className="text-xs text-error">{log.errorMessage}</p>}
          {groups.map((group) => (
            <div key={`${group.explanation.kind}:${group.explanation.title}`}>
              <p
                className={`text-sm font-medium ${
                  group.explanation.deferred ? 'text-info' : 'text-warning'
                }`}
              >
                {group.explanation.title} ({group.emails.length})
              </p>
              <p className="text-xs text-neutral-300 mt-0.5">{group.explanation.hint}</p>
              <p className="text-xs text-neutral-400 mt-1 break-words">{group.emails.join(', ')}</p>
              {!group.explanation.deferred && (
                <p className="text-[11px] text-neutral-500 mt-1 break-words">
                  Detalhe técnico: {group.detail}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </li>
  )
}
