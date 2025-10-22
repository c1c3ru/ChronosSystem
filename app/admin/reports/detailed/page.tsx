'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { 
  FileText, 
  ArrowLeft,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  MapPin,
  Download
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'

interface AttendanceRecord {
  id: string
  timestamp: string
  type: 'ENTRY' | 'EXIT'
  user: {
    name: string
    email: string
    role: string
  }
  machine: {
    name: string
    location: string
  }
}

export default function DetailedReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [userFilter, setUserFilter] = useState('ALL')

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

  // Load detailed records
  useEffect(() => {
    if (session && ['ADMIN', 'SUPERVISOR'].includes(session.user?.role)) {
      loadDetailedRecords()
    }
  }, [session])

  const loadDetailedRecords = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/attendance/detailed')
      
      if (response.ok) {
        const data = await response.json()
        setRecords(data)
      }
    } catch (error) {
      console.error('Erro ao carregar registros detalhados:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.machine.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDate = !dateFilter || 
                       new Date(record.timestamp).toDateString() === new Date(dateFilter).toDateString()
    
    const matchesType = typeFilter === 'ALL' || record.type === typeFilter
    const matchesUser = userFilter === 'ALL' || record.user.role === userFilter

    return matchesSearch && matchesDate && matchesType && matchesUser
  })

  const getTypeColor = (type: string) => {
    return type === 'ENTRY' ? 'text-success bg-success/20' : 'text-error bg-error/20'
  }

  const getTypeText = (type: string) => {
    return type === 'ENTRY' ? 'Entrada' : 'Saída'
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'text-red-400 bg-red-400/20'
      case 'SUPERVISOR': return 'text-yellow-400 bg-yellow-400/20'
      case 'EMPLOYEE': return 'text-blue-400 bg-blue-400/20'
      default: return 'text-neutral-400 bg-neutral-400/20'
    }
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
                <h1 className="text-2xl font-bold text-white">Relatório Detalhado</h1>
                <p className="text-neutral-400">Visualização completa dos registros de ponto</p>
              </div>
            </div>
            <Button onClick={() => window.print()} variant="ghost">
              <Download className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Nome, email ou máquina..."
                    className="input pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Data
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="date"
                    className="input pl-10"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div>
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
                  <option value="ENTRY">Entrada</option>
                  <option value="EXIT">Saída</option>
                </select>
              </div>

              {/* User Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Role
                </label>
                <select
                  className="input"
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                >
                  <option value="ALL">Todos</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPERVISOR">Supervisor</option>
                  <option value="EMPLOYEE">Estagiário</option>
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
                  <p className="text-2xl font-bold text-white">{filteredRecords.length}</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Entradas</p>
                  <p className="text-2xl font-bold text-success">
                    {filteredRecords.filter(r => r.type === 'ENTRY').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Saídas</p>
                  <p className="text-2xl font-bold text-error">
                    {filteredRecords.filter(r => r.type === 'EXIT').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-error" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Usuários</p>
                  <p className="text-2xl font-bold text-white">
                    {new Set(filteredRecords.map(r => r.user.email)).size}
                  </p>
                </div>
                <User className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Records Table */}
        <Card>
          <CardHeader>
            <CardTitle>Registros Detalhados</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-700">
                      <th className="text-left py-3 px-4 text-neutral-300 font-medium">Data/Hora</th>
                      <th className="text-left py-3 px-4 text-neutral-300 font-medium">Usuário</th>
                      <th className="text-left py-3 px-4 text-neutral-300 font-medium">Role</th>
                      <th className="text-left py-3 px-4 text-neutral-300 font-medium">Tipo</th>
                      <th className="text-left py-3 px-4 text-neutral-300 font-medium">Máquina</th>
                      <th className="text-left py-3 px-4 text-neutral-300 font-medium">Localização</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="border-b border-neutral-800 hover:bg-neutral-800/30">
                        <td className="py-3 px-4 text-white">
                          {new Date(record.timestamp).toLocaleString('pt-BR')}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-white font-medium">{record.user.name}</p>
                            <p className="text-neutral-400 text-sm">{record.user.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleColor(record.user.role)}`}>
                            {record.user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(record.type)}`}>
                            {getTypeText(record.type)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-white">{record.machine.name}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center text-neutral-400">
                            <MapPin className="h-4 w-4 mr-1" />
                            {record.machine.location}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-neutral-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Nenhum registro encontrado</h3>
                <p className="text-neutral-400">
                  Tente ajustar os filtros para encontrar registros
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
