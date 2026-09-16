'use client'

import { useSession, signIn } from 'next-auth/react'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bell } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { CronLogRow, type CronLogEntry } from '@/components/CronLogRow'

const PAGE_SIZE = 20

interface CronLogsPagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

const EMPTY_PAGINATION: CronLogsPagination = {
  page: 1,
  limit: PAGE_SIZE,
  total: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
}

/**
 * Histórico completo (paginado) das execuções dos crons de notificação —
 * versão expandida do painel "Status dos Alertas" do dashboard, que só
 * mostra uma prévia das execuções mais recentes.
 */
export default function AlertsHistoryPage() {
  const { data: session, status } = useSession()
  const [logs, setLogs] = useState<CronLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<CronLogsPagination>(EMPTY_PAGINATION)

  const usuarioPodeAcessar =
    session && ['ADMIN', 'SUPERVISOR'].includes((session.user as { role?: string })?.role ?? '')

  const load = useCallback((currentPage: number) => {
    setLoading(true)
    setLoadError(false)
    fetch(`/api/admin/cron-logs?page=${currentPage}&limit=${PAGE_SIZE}`)
      .then((res) => {
        if (!res.ok) throw new Error('Falha ao buscar logs')
        return res.json()
      })
      .then((data) => {
        setLogs(data.logs)
        setPagination(data.pagination)
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (usuarioPodeAcessar) load(page)
  }, [usuarioPodeAcessar, page, load])

  if (status === 'loading') {
    return <Loading />
  }

  if (!usuarioPodeAcessar) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white p-4">
        <h1 className="text-2xl font-bold mb-4 font-outfit">Acesso Restrito</h1>
        <p className="text-neutral-400 mb-6 text-center max-w-md font-outfit">
          Você não tem permissão para acessar esta área ou sua sessão expirou.
        </p>
        <div className="flex gap-4">
          <Button onClick={() => (window.location.href = '/employee')} variant="secondary">
            Ir para Área do Funcionário
          </Button>
          <Button onClick={() => signIn()} variant="primary">
            Fazer Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Header */}
      <div className="bg-neutral-800/50 border-b border-neutral-700 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Painel
                </Link>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center border border-warning/30">
                  <Bell className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Status dos Alertas</h1>
                  <p className="text-neutral-400 text-sm">
                    Histórico completo das execuções dos lembretes automáticos (ponto e
                    justificativas)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <Card className="bg-neutral-800/50 border-neutral-700/50 backdrop-blur-sm shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-700/50 pb-4">
            <CardTitle className="text-lg font-bold text-white">
              Execuções ({pagination.total})
            </CardTitle>
            <div className="text-sm text-neutral-400">
              Página {pagination.page} de {pagination.totalPages || 1}
            </div>
          </CardHeader>
          <CardContent>
            {loadError && (
              <p className="text-sm text-neutral-400 py-12 text-center">
                Não foi possível carregar o histórico de execuções dos crons.
              </p>
            )}

            {!loadError && loading && (
              <p className="text-sm text-neutral-400 py-12 text-center">Carregando...</p>
            )}

            {!loadError && !loading && logs.length === 0 && (
              <p className="text-sm text-neutral-400 py-12 text-center">
                Nenhuma execução registrada ainda — os crons gravam um log a cada disparo.
              </p>
            )}

            {!loadError && !loading && logs.length > 0 && (
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

            {!loadError && !loading && logs.length > 0 && (
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-neutral-700/50">
                <Button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={!pagination.hasPrevPage}
                  variant="secondary"
                  size="sm"
                >
                  Anterior
                </Button>
                <span className="text-xs text-neutral-400">
                  Mostrando página {pagination.page} de {pagination.totalPages}
                </span>
                <Button
                  onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
                  disabled={!pagination.hasNextPage}
                  variant="secondary"
                  size="sm"
                >
                  Próxima
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
