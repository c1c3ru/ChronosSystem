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
  MessageSquare
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
  adminResponse?: string
  createdAt: string
  user: {
    name: string
    email: string
    role: string
  }
}

export default function JustificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [justifications, setJustifications] = useState<Justification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [selectedJustification, setSelectedJustification] = useState<Justification | null>(null)
  const [adminResponse, setAdminResponse] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      signIn()
    }
  }, [status])

  // Check if user is admin or supervisor
  useEffect(() => {
    if (session && !['ADMIN', 'SUPERVISOR'].includes(session.user?.role)) {
      router.push('/employee')
    }
  }, [session])

  // Load justifications
  useEffect(() => {
    if (session && ['ADMIN', 'SUPERVISOR'].includes(session.user?.role)) {
      loadJustifications()
    }
  }, [session])

  const loadJustifications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/justifications')
      
      if (response.ok) {
        const data = await response.json()
        setJustifications(data)
      }
    } catch (error) {
      console.error('Erro ao carregar justificativas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJustificationAction = async (justificationId: string, action: 'APPROVED' | 'REJECTED') => {
    try {
      setActionLoading(true)
      
      const response = await fetch(`/api/admin/justifications/${justificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: action,
          adminResponse: adminResponse.trim() || undefined
        })
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

  const filteredJustifications = justifications.filter(justification => {
    const matchesSearch = justification.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         justification.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         justification.reason.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || justification.status === statusFilter
    const matchesType = typeFilter === 'ALL' || justification.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-warning bg-warning/20'
      case 'APPROVED': return 'text-success bg-success/20'
      case 'REJECTED': return 'text-error bg-error/20'
      default: return 'text-neutral-400 bg-neutral-400/20'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendente'
      case 'APPROVED': return 'Aprovada'
      case 'REJECTED': return 'Rejeitada'
      default: return status
    }
  }

  const getTypeText = (type: string) => {
    return type === 'LATE' ? 'Atraso' : 'Falta'
  }

  const getTypeColor = (type: string) => {
    return type === 'LATE' ? 'text-warning bg-warning/20' : 'text-error bg-error/20'
  }

  if (status === 'loading' || loading) {
    return <Loading />
  }

  if (!session) {
    return null
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
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Nome, email ou justificativa..."
                    className="input pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Status
                </label>
                <select
                  className="input"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">Todos</option>
                  <option value="PENDING">Pendente</option>
                  <option value="APPROVED">Aprovada</option>
                  <option value="REJECTED">Rejeitada</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Tipo
                </label>
                <select
                  className="input"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="ALL">Todos</option>
                  <option value="LATE">Atraso</option>
                  <option value="ABSENCE">Falta</option>
                </select>
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
                    {filteredJustifications.filter(j => j.status === 'PENDING').length}
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
                    {filteredJustifications.filter(j => j.status === 'APPROVED').length}
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
                    {filteredJustifications.filter(j => j.status === 'REJECTED').length}
                  </p>
                </div>
                <X className="h-8 w-8 text-error" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Justifications List */}
        <div className="space-y-4">
          {filteredJustifications.map((justification) => (
            <Card key={justification.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-neutral-400" />
                        <span className="font-medium text-white">{justification.user.name}</span>
                        <span className="text-neutral-400 text-sm">({justification.user.email})</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(justification.type)}`}>
                        {getTypeText(justification.type)}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(justification.status)}`}>
                        {getStatusText(justification.status)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 mb-3 text-sm text-neutral-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Data: {new Date(justification.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Enviado: {new Date(justification.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-neutral-300 mb-1">Justificativa:</p>
                      <p className="text-white">{justification.reason}</p>
                    </div>

                    {justification.adminResponse && (
                      <div className="bg-neutral-800/50 rounded-lg p-3">
                        <p className="text-sm font-medium text-neutral-300 mb-1">Resposta do Admin:</p>
                        <p className="text-white text-sm">{justification.adminResponse}</p>
                      </div>
                    )}
                  </div>

                  {justification.status === 'PENDING' && (
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => setSelectedJustification(justification)}
                        variant="ghost"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Analisar
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredJustifications.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertTriangle className="h-12 w-12 text-neutral-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Nenhuma justificativa encontrada</h3>
              <p className="text-neutral-400">
                {searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Não há justificativas no sistema'
                }
              </p>
            </CardContent>
          </Card>
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
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(selectedJustification.type)}`}>
                    {getTypeText(selectedJustification.type)}
                  </span>
                </div>
                <p className="text-sm text-neutral-400 mb-2">
                  Data: {new Date(selectedJustification.date).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-white">{selectedJustification.reason}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Resposta (Opcional)
                </label>
                <textarea
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
