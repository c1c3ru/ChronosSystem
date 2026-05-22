'use client'

import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  FileText,
  ArrowLeft,
  Search,
  Clock,
  User,
  ShieldAlert,
  AlertCircle,
  CheckCircle,
  Filter,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'

interface AuditLog {
  id: string
  action: string
  resource: string
  details: string
  timestamp: string
  formattedDate: string
  user: {
    name: string
    email: string
    role: string
  }
}

export default function AuditLogsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('ALL')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  })

  const usuarioPodeAcessar =
    session && ['ADMIN', 'SUPERVISOR'].includes((session.user as { role?: string })?.role ?? '')

  const loadAuditLogs = useCallback(
    async (currentPage: number) => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        params.append('page', currentPage.toString())
        params.append('limit', '50')
        if (searchTerm) params.append('search', searchTerm)
        if (actionFilter !== 'ALL') params.append('action', actionFilter)

        const response = await fetch(`/api/admin/audit?${params}`)

        if (response.ok) {
          const data = await response.json()
          setLogs(data.data)
          setPagination(data.pagination)
        }
      } catch (error) {
        console.error('Erro ao carregar logs de auditoria:', error)
      } finally {
        setLoading(false)
      }
    },
    [searchTerm, actionFilter]
  )

  useEffect(() => {
    if (usuarioPodeAcessar) {
      loadAuditLogs(page)
    }
  }, [usuarioPodeAcessar, page, loadAuditLogs])

  const getActionBadge = (action: string) => {
    if (action.includes('REJECTED') || action.includes('FAILED')) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1 w-fit">
          <AlertCircle className="w-3.5 h-3.5" />
          {action}
        </span>
      )
    }
    if (action.includes('SECURITY') || action.includes('SCAN') || action.includes('ATTENDANCE')) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1 w-fit">
          <CheckCircle className="w-3.5 h-3.5" />
          {action}
        </span>
      )
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-500/20 text-neutral-300 border border-neutral-500/30 flex items-center gap-1 w-fit">
        <FileText className="w-3.5 h-3.5" />
        {action}
      </span>
    )
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'text-red-400 bg-red-400/20 border border-red-500/30'
      case 'SUPERVISOR':
        return 'text-yellow-400 bg-yellow-400/20 border border-yellow-500/30'
      case 'EMPLOYEE':
        return 'text-blue-400 bg-blue-400/20 border border-blue-500/30'
      default:
        return 'text-neutral-400 bg-neutral-400/20 border border-neutral-500/30'
    }
  }

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
                <Link href="/admin/security">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar à Segurança
                </Link>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                  <ShieldAlert className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Logs de Auditoria e Atividades</h1>
                  <p className="text-neutral-400 text-sm">
                    Histórico completo de eventos de sistema, acessos e tentativas bloqueadas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Filtros e Busca */}
        <Card className="mb-6 bg-neutral-800/50 border-neutral-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Busca */}
              <div className="md:col-span-2">
                <label
                  htmlFor="audit-search"
                  className="block text-sm font-medium text-neutral-300 mb-2"
                >
                  Buscar em Detalhes ou Usuário
                </label>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      id="audit-search"
                      type="text"
                      placeholder="Buscar por nome, email ou mensagem de erro..."
                      className="input pl-10 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && loadAuditLogs(1)}
                    />
                  </div>
                  <Button onClick={() => loadAuditLogs(1)} variant="primary">
                    Buscar
                  </Button>
                </div>
              </div>

              {/* Filtro de Ação */}
              <div>
                <label
                  htmlFor="audit-action"
                  className="block text-sm font-medium text-neutral-300 mb-2"
                >
                  Filtrar por Tipo de Ação
                </label>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <select
                    id="audit-action"
                    className="input pl-10 w-full"
                    value={actionFilter}
                    onChange={(e) => {
                      setActionFilter(e.target.value)
                      setPage(1)
                    }}
                  >
                    <option value="ALL">Todas as Ações</option>
                    <option value="REJECTED_ATTENDANCE">REJECTED_ATTENDANCE (Bloqueados)</option>
                    <option value="QR_UNIFIED_ATTENDANCE">QR_UNIFIED_ATTENDANCE (Sucesso)</option>
                    <option value="QR_SCAN_ATTENDANCE">QR_SCAN_ATTENDANCE</option>
                    <option value="LOGIN">LOGIN</option>
                    <option value="LOGOUT">LOGOUT</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Logs */}
        <Card className="bg-neutral-800/50 border-neutral-700/50 backdrop-blur-sm shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-700/50 pb-4">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Registros do Sistema ({pagination.total})
            </CardTitle>
            <div className="text-sm text-neutral-400">
              Página {pagination.page} de {pagination.totalPages || 1}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center text-neutral-400">Carregando logs...</div>
            ) : logs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-700/50 bg-neutral-800/80">
                      <th className="py-3.5 px-6 text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                        Data/Hora
                      </th>
                      <th className="py-3.5 px-6 text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                        Ação
                      </th>
                      <th className="py-3.5 px-6 text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                        Usuário
                      </th>
                      <th className="py-3.5 px-6 text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                        Nível/Role
                      </th>
                      <th className="py-3.5 px-6 text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                        Detalhes / Motivo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-700/50 text-sm">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-neutral-700/30 transition-colors">
                        <td className="py-4 px-6 text-neutral-300 whitespace-nowrap flex items-center gap-1.5 font-mono text-xs">
                          <Clock className="w-3.5 h-3.5 text-neutral-400" />
                          {log.formattedDate}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          {getActionBadge(log.action)}
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="text-white font-medium">{log.user.name}</p>
                            <p className="text-neutral-400 text-xs">{log.user.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded text-xs font-semibold ${getRoleColor(log.user.role)}`}
                          >
                            {log.user.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-neutral-300 max-w-md">
                          <div className="bg-neutral-900/50 p-2.5 rounded border border-neutral-700/50 text-xs font-mono leading-relaxed break-words">
                            {log.details || 'Nenhum detalhe fornecido'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <ShieldAlert className="h-12 w-12 text-neutral-500 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Nenhum log de auditoria encontrado
                </h3>
                <p className="text-neutral-400 text-sm max-w-sm mx-auto mb-6">
                  Não foram encontrados registros para os filtros selecionados ou o sistema ainda
                  não gerou eventos.
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm('')
                    setActionFilter('ALL')
                    setPage(1)
                  }}
                  variant="secondary"
                >
                  Limpar Filtros
                </Button>
              </div>
            )}

            {/* Paginação */}
            {logs.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-700/50 bg-neutral-800/30">
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
