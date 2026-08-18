'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowLeft,
  Search,
  Filter,
  Check,
  X,
  Clock,
  Calendar,
  User,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  ListChecks,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'

interface Justification {
  id: string
  type: 'LATE' | 'ABSENCE'
  date: string
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  category?: string | null
  adminResponse?: string
  createdAt: string
  user: {
    name: string
    email: string
    role: string
  }
}

interface JustificationOverview {
  userId: string
  name: string | null
  email: string
  missingCount: number
  pendingCount: number
  missingDates: { date: string; reason: string }[]
  pendingDates: { date: string; justificationId: string; reason: string }[]
}

export default function JustificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [justifications, setJustifications] = useState<Justification[]>([])
  const [overview, setOverview] = useState<JustificationOverview[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [selectedJustification, setSelectedJustification] = useState<Justification | null>(null)
  const [adminResponse, setAdminResponse] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'LIST' | 'OVERVIEW'>('LIST')
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({})
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const itemsPerPage = 10

  // Limpar todos os filtros de uma vez
  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('ALL')
    setTypeFilter('ALL')
    setCurrentPage(1)
  }

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'ALL' || typeFilter !== 'ALL'

  // A proteção de rota agora é feita EXCLUSIVAMENTE pelo middleware.
  // Isso evita loops de redirecionamento quando a sessão do cliente demora a sincronizar.

  // Load justifications
  useEffect(() => {
    if (session && ['ADMIN', 'SUPERVISOR'].includes(session.user?.role)) {
      loadData()
    }
  }, [session])

  const loadData = async () => {
    try {
      setLoading(true)
      const [justResponse, overviewResponse] = await Promise.all([
        fetch('/api/admin/justifications'),
        fetch('/api/admin/justifications/overview'),
      ])

      if (justResponse.ok) {
        const data = await justResponse.json()
        setJustifications(data)
      }

      if (overviewResponse.ok) {
        const data = await overviewResponse.json()
        setOverview(data)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadJustifications = loadData // Alias for backward compatibility if used anywhere

  const handleJustificationAction = async (
    justificationId: string,
    action: 'APPROVED' | 'REJECTED'
  ) => {
    try {
      setActionLoading(true)

      const response = await fetch(`/api/admin/justifications/${justificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: action,
          adminResponse: adminResponse.trim() || undefined,
        }),
      })

      if (response.ok) {
        loadJustifications()
        setSelectedJustification(null)
        setAdminResponse('')
      }
    } catch (error) {
      console.error('Erro ao processar justificativa:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    const pendingIds = currentJustifications.filter((j) => j.status === 'PENDING').map((j) => j.id)
    if (pendingIds.length === 0) return

    const allSelected = pendingIds.every((id) => selectedIds.includes(id))
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pendingIds.includes(id)))
    } else {
      const newIds = new Set([...selectedIds, ...pendingIds])
      setSelectedIds(Array.from(newIds))
    }
  }

  const handleBulkAction = async (action: 'APPROVED' | 'REJECTED') => {
    if (selectedIds.length === 0) return
    if (
      !confirm(
        `Deseja realmente ${action === 'APPROVED' ? 'APROVAR' : 'REJEITAR'} ${selectedIds.length} justificativas?`
      )
    )
      return

    try {
      setActionLoading(true)
      const response = await fetch('/api/admin/justifications/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ justificationIds: selectedIds, action }),
      })

      if (response.ok) {
        setSelectedIds([])
        loadJustifications()
        alert(`Sucesso! ${selectedIds.length} justificativas foram analisadas.`)
      } else {
        const data = await response.json()
        alert(data.error || 'Erro ao processar lote.')
      }
    } catch (e) {
      console.error(e)
      alert('Erro interno.')
    } finally {
      setActionLoading(false)
    }
  }

  const filteredJustifications = justifications.filter((justification) => {
    const matchesSearch =
      justification.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      justification.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      justification.reason.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'ALL' || justification.status === statusFilter
    const matchesType = typeFilter === 'ALL' || justification.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  // Pagination Logic
  const totalPages = Math.ceil(filteredJustifications.length / itemsPerPage)
  const currentJustifications = filteredJustifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-warning bg-warning/20'
      case 'APPROVED':
        return 'text-success bg-success/20'
      case 'REJECTED':
        return 'text-error bg-error/20'
      default:
        return 'text-neutral-400 bg-neutral-400/20'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendente'
      case 'APPROVED':
        return 'Aprovada'
      case 'REJECTED':
        return 'Rejeitada'
      default:
        return status
    }
  }

  const getTypeText = (type: string) => {
    return type === 'LATE' ? 'Atraso' : 'Falta'
  }

  const getTypeColor = (type: string) => {
    return type === 'LATE' ? 'text-warning bg-warning/20' : 'text-error bg-error/20'
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Data inválida'
      }
      return date.toLocaleDateString('pt-BR')
    } catch {
      return 'Data inválida'
    }
  }

  if (status === 'loading' || loading) {
    return <Loading />
  }

  // Fallback visual caso o middleware falhe e o usuário não tenha permissão
  if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user?.role)) {
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
      <div className="bg-neutral-800/50 border-b border-neutral-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/reports">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar aos Relatórios
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">Justificativas</h1>
                <p className="text-neutral-400">Gerenciar justificativas de atrasos e faltas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Search */}
              <div>
                <label
                  htmlFor="justifications-search"
                  className="block text-sm font-medium text-neutral-300 mb-2"
                >
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    id="justifications-search"
                    type="text"
                    placeholder="Nome, email ou justificativa..."
                    className="input pl-10"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setCurrentPage(1)
                    }}
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label
                  htmlFor="justifications-status"
                  className="block text-sm font-medium text-neutral-300 mb-2"
                >
                  Status
                </label>
                <select
                  id="justifications-status"
                  className="input"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  title="Filtrar por status"
                >
                  <option value="ALL">Todos</option>
                  <option value="PENDING">Pendente</option>
                  <option value="APPROVED">Aprovada</option>
                  <option value="REJECTED">Rejeitada</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label
                  htmlFor="justifications-type"
                  className="block text-sm font-medium text-neutral-300 mb-2"
                >
                  Tipo
                </label>
                <select
                  id="justifications-type"
                  className="input"
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  title="Filtrar por tipo"
                >
                  <option value="ALL">Todos</option>
                  <option value="LATE">Atraso</option>
                  <option value="ABSENCE">Falta</option>
                </select>
              </div>

              {/* Clear Filters Button — sempre visível, desabilitado quando sem filtro */}
              <div className="flex items-end">
                <button
                  id="clear-filters-btn"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                    hasActiveFilters
                      ? 'bg-red-500/20 hover:bg-red-500/30 border-red-500/50 hover:border-red-500/70 text-red-400 hover:text-red-300 cursor-pointer'
                      : 'bg-neutral-800/30 border-neutral-700/50 text-neutral-600 cursor-not-allowed opacity-50'
                  }`}
                  title={hasActiveFilters ? 'Limpar todos os filtros' : 'Nenhum filtro ativo'}
                >
                  <X className="h-4 w-4" />
                  Limpar Filtros
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Total</p>
                  <p className="text-2xl font-bold text-white">{filteredJustifications.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Pendentes</p>
                  <p className="text-2xl font-bold text-warning">
                    {filteredJustifications.filter((j) => j.status === 'PENDING').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Aprovadas</p>
                  <p className="text-2xl font-bold text-success">
                    {filteredJustifications.filter((j) => j.status === 'APPROVED').length}
                  </p>
                </div>
                <Check className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Rejeitadas</p>
                  <p className="text-2xl font-bold text-error">
                    {filteredJustifications.filter((j) => j.status === 'REJECTED').length}
                  </p>
                </div>
                <X className="h-8 w-8 text-error" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-700 mb-6">
          <button
            className={`px-6 py-3 font-medium text-sm transition-colors relative ${
              activeTab === 'LIST' ? 'text-primary' : 'text-neutral-400 hover:text-neutral-300'
            }`}
            onClick={() => setActiveTab('LIST')}
          >
            Lista de Justificativas
            {activeTab === 'LIST' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm transition-colors relative ${
              activeTab === 'OVERVIEW' ? 'text-primary' : 'text-neutral-400 hover:text-neutral-300'
            }`}
            onClick={() => setActiveTab('OVERVIEW')}
          >
            Pendências por Usuário
            {overview.length > 0 && (
              <span className="ml-2 bg-error text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {overview.length}
              </span>
            )}
            {activeTab === 'OVERVIEW' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        {activeTab === 'OVERVIEW' ? (
          <div className="space-y-6">
            {overview.map((user) => {
              const isExpanded = expandedUsers[user.userId] || false
              return (
                <Card
                  key={user.userId}
                  className={`border-l-4 border-l-error bg-neutral-800/20 transition-all ${isExpanded ? 'ring-1 ring-primary/20' : ''}`}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      setExpandedUsers((prev) => ({ ...prev, [user.userId]: !isExpanded }))
                    }
                    onKeyDown={(e) =>
                      e.key === 'Enter' &&
                      setExpandedUsers((prev) => ({ ...prev, [user.userId]: !isExpanded }))
                    }
                    className="cursor-pointer hover:bg-neutral-700/20 rounded-t-xl transition-colors"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="text-white font-bold text-lg flex items-center">
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 mr-2 text-primary" />
                            ) : (
                              <ChevronDown className="h-5 w-5 mr-2 text-primary" />
                            )}
                            <User className="h-5 w-5 mr-2 text-primary" />
                            {user.name}
                          </div>
                          <p className="text-sm text-neutral-400 ml-14">{user.email}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {user.missingCount > 0 && (
                            <div className="bg-error/10 text-error px-3 py-1 rounded-full text-xs font-bold border border-error/20 flex items-center">
                              <X className="h-3 w-3 mr-1" />
                              {user.missingCount} Faltas sem Justificativa
                            </div>
                          )}
                          {user.pendingCount > 0 && (
                            <div className="bg-warning/10 text-warning px-3 py-1 rounded-full text-xs font-bold border border-warning/20 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {user.pendingCount} Justificativas Pendentes
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </div>
                  {isExpanded && (
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6 mt-4">
                        {/* Missing Justifications */}
                        <div>
                          <h4 className="text-xs font-bold text-neutral-500 mb-3 uppercase tracking-widest">
                            Faltas Pendentes (Últimos 30 dias)
                          </h4>
                          <div className="space-y-2">
                            {user.missingDates.length > 0 ? (
                              user.missingDates.map((m, idx) => (
                                <div
                                  key={idx}
                                  className="bg-neutral-900/40 p-3 rounded-lg border border-neutral-700/30 flex items-center justify-between"
                                >
                                  <div>
                                    <p className="text-white text-sm font-semibold">
                                      {formatDate(m.date)}
                                    </p>
                                    <p className="text-[11px] text-neutral-500">{m.reason}</p>
                                  </div>
                                  <div className="text-[9px] font-bold bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded border border-neutral-700">
                                    NÃO ENVIADA
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-[11px] text-neutral-600 italic">
                                Nenhuma falta sem justificativa
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Pending Review */}
                        <div>
                          <h4 className="text-xs font-bold text-neutral-500 mb-3 uppercase tracking-widest">
                            Justificativas para Analisar
                          </h4>
                          <div className="space-y-2">
                            {user.pendingDates.length > 0 ? (
                              user.pendingDates.map((p, idx) => (
                                <div
                                  key={idx}
                                  className="bg-neutral-900/40 p-3 rounded-lg border border-warning/20 flex items-center justify-between group"
                                >
                                  <div className="min-w-0 pr-4">
                                    <p className="text-white text-sm font-semibold">
                                      {formatDate(p.date)}
                                    </p>
                                    <p className="text-[11px] text-neutral-400 italic truncate italic">
                                      &quot;{p.reason}&quot;
                                    </p>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 px-3 text-xs text-primary hover:bg-primary/20 bg-primary/10 border border-primary/20 shrink-0"
                                    onClick={() => {
                                      const j = justifications.find(
                                        (just) => just.id === p.justificationId
                                      )
                                      if (j) setSelectedJustification(j)
                                      else {
                                        // Caso não esteja na lista filtrada, buscamos via API ou usamos o que temos
                                        setSelectedJustification({
                                          id: p.justificationId,
                                          date: p.date,
                                          reason: p.reason,
                                          status: 'PENDING',
                                          type: 'ABSENCE', // Fallback
                                          createdAt: new Date().toISOString(),
                                          user: {
                                            name: user.name || '',
                                            email: user.email,
                                            role: 'EMPLOYEE',
                                          },
                                        } as unknown as Justification)
                                      }
                                    }}
                                  >
                                    Analisar
                                  </Button>
                                </div>
                              ))
                            ) : (
                              <div className="text-[11px] text-neutral-600 italic">
                                Nenhuma justificativa pendente
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )
            })}
            {overview.length === 0 && (
              <div className="text-center py-20 bg-neutral-800/10 rounded-2xl border border-dashed border-neutral-700">
                <div className="bg-success/20 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Excelente!</h3>
                <p className="text-neutral-400 max-w-xs mx-auto text-sm">
                  Nenhum estagiário possui pendências de justificativa nos últimos 30 dias.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Justifications List */
          <div className="space-y-4 relative">
            {/* Bulk Action Bar */}
            {activeTab === 'LIST' && selectedIds.length > 0 && (
              <div className="sticky top-4 z-docked bg-primary/20 backdrop-blur-md border border-primary/50 p-4 rounded-xl shadow-2xl flex items-center justify-between mb-6 animate-in slide-in-from-bottom-4">
                <div className="flex items-center text-white">
                  <ListChecks className="h-5 w-5 mr-2 text-primary" />
                  <span className="font-bold">{selectedIds.length} selecionadas</span>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleBulkAction('REJECTED')}
                    disabled={actionLoading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Rejeitar Lote
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleBulkAction('APPROVED')}
                    disabled={actionLoading}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Aprovar Lote
                  </Button>
                </div>
              </div>
            )}

            {currentJustifications.filter((j) => j.status === 'PENDING').length > 0 && (
              <div className="flex items-center px-4 mb-2">
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center text-sm text-neutral-400 hover:text-white transition-colors"
                >
                  {currentJustifications
                    .filter((j) => j.status === 'PENDING')
                    .every((j) => selectedIds.includes(j.id)) ? (
                    <CheckSquare className="h-4 w-4 mr-2 text-primary" />
                  ) : (
                    <Square className="h-4 w-4 mr-2" />
                  )}
                  Selecionar todas pendentes da página
                </button>
              </div>
            )}

            {currentJustifications.map((justification) => (
              <Card
                key={justification.id}
                className={`transition-all ${selectedIds.includes(justification.id) ? 'border-primary ring-1 ring-primary/50' : 'hover:border-primary/20'}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        {justification.status === 'PENDING' && (
                          <button
                            onClick={() => toggleSelect(justification.id)}
                            className="mr-2 shrink-0 text-neutral-400 hover:text-white transition-colors"
                          >
                            {selectedIds.includes(justification.id) ? (
                              <CheckSquare className="h-5 w-5 text-primary" />
                            ) : (
                              <Square className="h-5 w-5" />
                            )}
                          </button>
                        )}
                        <div className="flex items-center space-x-2">
                          <div className="bg-neutral-800 p-1.5 rounded-lg">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-bold text-white truncate">
                            {justification.user.name}
                          </span>
                          <span className="text-neutral-500 text-xs hidden sm:inline">
                            ({justification.user.email})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getTypeColor(justification.type)}`}
                          >
                            {getTypeText(justification.type)}
                          </span>
                          {justification.category && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-800 text-neutral-300">
                              {justification.category}
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusColor(justification.status)}`}
                          >
                            {getStatusText(justification.status)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4 text-xs text-neutral-400">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-3.5 w-3.5 text-neutral-500" />
                          <span>
                            Data da ocorrência:{' '}
                            <span className="text-neutral-200 font-medium">
                              {formatDate(justification.date)}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-3.5 w-3.5 text-neutral-500" />
                          <span>
                            Enviado em:{' '}
                            <span className="text-neutral-200 font-medium">
                              {formatDate(justification.createdAt)}
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="mb-4 bg-neutral-900/40 p-3 rounded-lg border border-neutral-700/30">
                        <p className="text-[10px] font-bold text-neutral-500 uppercase mb-2 tracking-widest">
                          Justificativa do Estagiário
                        </p>
                        <p className="text-white text-sm leading-relaxed">{justification.reason}</p>
                      </div>

                      {justification.adminResponse && (
                        <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                          <p className="text-[10px] font-bold text-primary/70 uppercase mb-1 tracking-widest">
                            Resposta da Administração
                          </p>
                          <p className="text-neutral-200 text-sm italic">
                            &quot;{justification.adminResponse}&quot;
                          </p>
                        </div>
                      )}
                    </div>

                    {justification.status === 'PENDING' && (
                      <div className="flex shrink-0">
                        <Button
                          size="sm"
                          onClick={() => setSelectedJustification(justification)}
                          className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Analisar
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredJustifications.length === 0 && (
              <Card className="bg-neutral-800/20 border-dashed border-neutral-700">
                <CardContent className="p-12 text-center">
                  <AlertTriangle className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    Nenhuma justificativa encontrada
                  </h3>
                  <p className="text-neutral-400 text-sm max-w-sm mx-auto">
                    {searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL'
                      ? 'Tente ajustar os filtros de busca para encontrar o que procura.'
                      : 'Não há justificativas enviadas no momento.'}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-700/50">
                <p className="text-sm text-neutral-400">
                  Mostrando {(currentPage - 1) * itemsPerPage + 1} a{' '}
                  {Math.min(currentPage * itemsPerPage, filteredJustifications.length)} de{' '}
                  {filteredJustifications.length} resultados
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="border-neutral-700 text-neutral-300 hover:text-white"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                  </Button>
                  <div className="text-sm font-medium text-white px-4">
                    Página {currentPage} de {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="border-neutral-700 text-neutral-300 hover:text-white"
                  >
                    Próxima <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal for Justification Review */}
      {selectedJustification && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-modal flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Analisar Justificativa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-neutral-800/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-4 w-4 text-neutral-400" />
                  <span className="font-medium text-white">{selectedJustification.user.name}</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(selectedJustification.type)}`}
                  >
                    {getTypeText(selectedJustification.type)}
                  </span>
                </div>
                <p className="text-sm text-neutral-400 mb-2">
                  Data: {formatDate(selectedJustification.date)}
                </p>
                <p className="text-white">{selectedJustification.reason}</p>
              </div>

              <div>
                <label
                  htmlFor="admin-response"
                  className="block text-sm font-medium text-neutral-300 mb-2"
                >
                  Resposta (Opcional)
                </label>
                <textarea
                  id="admin-response"
                  className="input min-h-[100px] resize-none"
                  placeholder="Adicione uma resposta ou observação..."
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedJustification(null)
                    setAdminResponse('')
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleJustificationAction(selectedJustification.id, 'REJECTED')}
                  disabled={actionLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Rejeitar
                </Button>
                <Button
                  onClick={() => handleJustificationAction(selectedJustification.id, 'APPROVED')}
                  disabled={actionLoading}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Aprovar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
