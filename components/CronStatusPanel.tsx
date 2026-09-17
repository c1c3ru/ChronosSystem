'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { RefreshCw, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { CronLogRow, type CronLogEntry } from '@/components/CronLogRow'

// Quantidade de execuções mostradas na prévia do dashboard — o histórico
// completo (paginado) fica em /admin/alerts para não poluir o painel
// principal quando há muitas falhas seguidas.
const PREVIEW_LIMIT = 5

/**
 * Painel "Status dos Alertas": prévia das execuções mais recentes dos crons
 * de notificação (justificativas pendentes, lembretes de ponto), lida de
 * GET /api/admin/cron-logs. Cores semânticas: verde = tudo enviado, amarelo
 * = parte dos e-mails falhou (o job rodou até o fim), vermelho = o job
 * quebrou antes de terminar. O histórico completo está em /admin/alerts.
 */
export function CronStatusPanel() {
  const [logs, setLogs] = useState<CronLogEntry[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoadError(false)
    fetch(`/api/admin/cron-logs?limit=${PREVIEW_LIMIT}`)
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
        <div className="flex items-center gap-4">
          <Link
            href="/admin/alerts"
            className="text-xs font-medium text-neutral-400 hover:text-white transition-colors flex items-center gap-1"
          >
            Ver histórico completo
            <ArrowRight className="h-3 w-3" />
          </Link>
          <button
            type="button"
            onClick={load}
            className="text-neutral-400 hover:text-white transition-colors"
            aria-label="Atualizar status dos alertas"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
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
            {logs.map((log) => (
              <CronLogRow
                key={log.id}
                log={log}
                isExpanded={expandedId === log.id}
                onToggle={() => setExpandedId(expandedId === log.id ? null : log.id)}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
