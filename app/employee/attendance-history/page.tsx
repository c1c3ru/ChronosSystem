'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  LogIn,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Download,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'

interface DayRecord {
  date: string
  status: 'Completo' | 'Incompleto' | 'Ausente' | 'Em andamento'
  totalHours: string
  entries: Array<{
    id: string
    timestamp: string // ISO string para formatar no frontend
    machine: string
    location: string
  }>
  exits: Array<{
    id: string
    timestamp: string // ISO string para formatar no frontend
    machine: string
    location: string
  }>
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export default function AttendanceHistoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [records, setRecords] = useState<DayRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // A proteção de rota agora é feita EXCLUSIVAMENTE pelo middleware.
  // Isso evita loops de redirecionamento quando a sessão do cliente demora a sincronizar.

  // Load records
  useEffect(() => {
    if (session) {
      loadRecords(1)
    }
  }, [session])

  const loadRecords = async (page: number) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', '20')
      if (typeFilter !== 'ALL') params.append('type', typeFilter)
      if (dateFrom) params.append('dateFrom', dateFrom)
      if (dateTo) params.append('dateTo', dateTo)

      const response = await fetch(`/api/attendance/history?${params}`)

      if (response.ok) {
        const data = await response.json()
        setRecords(data.data)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = () => {
    loadRecords(1)
  }

  const handlePageChange = (newPage: number) => {
    loadRecords(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleExport = () => {
    const params = new URLSearchParams()
    if (typeFilter !== 'ALL') params.append('type', typeFilter)
    if (dateFrom) params.append('dateFrom', dateFrom)
    if (dateTo) params.append('dateTo', dateTo)

    window.open(`/api/attendance/export?${params}`, '_blank')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completo':
        return 'bg-success/20 text-success border border-success/30'
      case 'Incompleto':
        return 'bg-warning/20 text-warning border border-warning/30'
      case 'Ausente':
        return 'bg-error/20 text-error border border-error/30'
      case 'Em andamento':
        return 'bg-info/20 text-info border border-info/30'
      default:
        return 'bg-neutral-700/20 text-neutral-400 border border-neutral-700/30'
    }
  }

  if (status === 'loading' || loading) {
    return <Loading />
  }

  // Fallback visual caso o middleware falhe e o usuário não tenha sessão
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-4">
        <h1 className="text-2xl font-bold mb-4 font-outfit">Sessão Expirada</h1>
        <p className="text-slate-400 mb-6 text-center max-w-md font-outfit">
          Sua sessão expirou ou você não está autenticado.
        </p>
        <Button onClick={() => signIn()}>Fazer Login</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Header */}
      <div className="bg-neutral-800/50 border-b border-neutral-700 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/employee">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">Histórico de Ponto</h1>
                <p className="text-neutral-400">
                  Visualize todos os seus registros de entrada e saída
                </p>
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
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Filter className="h-4 w-4 text-primary" />
                <h3 className="font-medium text-white">Filtros</h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Type Filter */}
                <div>
                  <label
                    htmlFor="attendance-type-filter"
                    className="block text-sm font-medium text-neutral-300 mb-2"
                  >
                    Tipo de Registro
                  </label>
                  <select
                    id="attendance-type-filter"
                    className="input"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="ALL">Todos</option>
                    <option value="ENTRY">Apenas Entradas</option>
                    <option value="EXIT">Apenas Saídas</option>
                  </select>
                </div>

                {/* Date From */}
                <div>
                  <label
                    htmlFor="attendance-date-from"
                    className="block text-sm font-medium text-neutral-300 mb-2"
                  >
                    Data Inicial
                  </label>
                  <input
                    id="attendance-date-from"
                    type="date"
                    className="input"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>

                {/* Date To */}
                <div>
                  <label
                    htmlFor="attendance-date-to"
                    className="block text-sm font-medium text-neutral-300 mb-2"
                  >
                    Data Final
                  </label>
                  <input
                    id="attendance-date-to"
                    type="date"
                    className="input"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-end gap-2 lg:col-span-1">
                  <Button
                    onClick={handleFilterChange}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Filtrar
                  </Button>
                  <Button
                    onClick={handleExport}
                    variant="outline"
                    className="flex-1 border-neutral-700 hover:bg-neutral-800"
                    title="Exportar para CSV"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Total de Registros</p>
                  <p className="text-2xl font-bold text-white">{pagination.total}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Dias Exibidos</p>
                  <p className="text-2xl font-bold text-white">{records.length}</p>
                </div>
                <Clock className="h-8 w-8 text-info" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Página</p>
                  <p className="text-2xl font-bold text-white">
                    {pagination.page} / {pagination.totalPages}
                  </p>
                </div>
                <ChevronRight className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Records */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              Registros Detalhados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {records.length > 0 ? (
              <div className="space-y-4">
                {records.map((day) => (
                  <div
                    key={day.date}
                    className="rounded-lg bg-neutral-800/30 hover:bg-neutral-800/50 transition-colors overflow-hidden border border-neutral-700/30"
                  >
                    {/* Header do dia */}
                    <div className="flex items-center justify-between p-4 bg-neutral-800/20 border-b border-neutral-700/30">
                      <div className="flex items-center space-x-4">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-white font-semibold">{day.date}</p>
                          <p className="text-neutral-400 text-sm">Total: {day.totalHours}</p>
                        </div>
                      </div>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(day.status)}`}
                      >
                        {day.status}
                      </span>
                    </div>

                    {/* Entradas e Saídas */}
                    <div className="p-4 space-y-3">
                      {/* Entradas */}
                      {day.entries.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wide">
                            Entradas
                          </p>
                          <div className="space-y-2">
                            {day.entries.map((entry) => (
                              <div
                                key={entry.id}
                                className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="flex items-center justify-center w-8 h-8 bg-success/20 rounded-full">
                                    <LogIn className="h-4 w-4 text-success" />
                                  </div>
                                  <div>
                                    <p className="text-white font-medium">
                                      {(() => {
                                        try {
                                          const date = new Date(entry.timestamp)
                                          if (Number.isNaN(date.getTime())) return '--:--'
                                          return date.toLocaleTimeString('pt-BR', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                          })
                                        } catch {
                                          return '--:--'
                                        }
                                      })()}
                                    </p>
                                    <p className="text-neutral-400 text-xs flex items-center">
                                      <MapPin className="h-3 w-3 mr-1" />
                                      {entry.location}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-xs text-neutral-400 bg-neutral-800/50 px-2 py-1 rounded">
                                  {entry.machine}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Saídas */}
                      {day.exits.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wide">
                            Saídas
                          </p>
                          <div className="space-y-2">
                            {day.exits.map((exit) => (
                              <div
                                key={exit.id}
                                className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="flex items-center justify-center w-8 h-8 bg-warning/20 rounded-full">
                                    <LogOut className="h-4 w-4 text-warning" />
                                  </div>
                                  <div>
                                    <p className="text-white font-medium">
                                      {(() => {
                                        try {
                                          const date = new Date(exit.timestamp)
                                          if (Number.isNaN(date.getTime())) return '--:--'
                                          return date.toLocaleTimeString('pt-BR', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                          })
                                        } catch {
                                          return '--:--'
                                        }
                                      })()}
                                    </p>
                                    <p className="text-neutral-400 text-xs flex items-center">
                                      <MapPin className="h-3 w-3 mr-1" />
                                      {exit.location}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-xs text-neutral-400 bg-neutral-800/50 px-2 py-1 rounded">
                                  {exit.machine}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Ausente */}
                      {day.entries.length === 0 && day.exits.length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-neutral-400 text-sm">Nenhum registro neste dia</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-neutral-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Nenhum registro encontrado</h3>
                <p className="text-neutral-400">
                  Tente ajustar os filtros para encontrar registros
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <Button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
              variant="ghost"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            <div className="flex items-center space-x-2">
              {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, i) => {
                const pageNum = pagination.page - 2 + i
                if (pageNum < 1 || pageNum > pagination.totalPages) return null

                return (
                  <Button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    variant={pageNum === pagination.page ? 'primary' : 'ghost'}
                    size="sm"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
              variant="ghost"
            >
              Próxima
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
