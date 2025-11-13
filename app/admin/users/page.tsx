'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Search,
  Filter,
  Eye,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { toast } from 'sonner'

interface User {
  id: string
  name: string
  email: string
  role: string
  phone?: string
  department?: string
  siapeNumber?: string
  contractType?: string
  weeklyHours?: number
  profileComplete: boolean
  createdAt: string
  updatedAt: string
  _count: {
    attendanceRecords: number
  }
}

export default function UsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [deleting, setDeleting] = useState<string | null>(null)

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

  // Load users data
  useEffect(() => {
    if (session && ['ADMIN', 'SUPERVISOR'].includes(session.user?.role)) {
      loadUsers()
    }
  }, [session])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users')
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${userName}"?\n\nEsta ação não pode ser desfeita.`)) return
    
    try {
      setDeleting(userId)
      toast.loading('Excluindo usuário...', { id: 'delete-user' })
      
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast.success('Usuário excluído com sucesso!', { id: 'delete-user' })
        loadUsers() // Reload users list
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao excluir usuário', { id: 'delete-user' })
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      toast.error('Erro inesperado ao excluir usuário', { id: 'delete-user' })
    } finally {
      setDeleting(null)
    }
  }

  const handleRefresh = () => {
    loadUsers()
    toast.success('Lista de usuários atualizada!')
  }

  const filteredUsers = (users || []).filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

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
                <Link href="/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">Gerenciar Usuários</h1>
                <p className="text-neutral-400">Administre usuários do sistema</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" onClick={handleRefresh} title="Atualizar lista">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button asChild>
                <Link href="/admin/users/new">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Novo Usuário
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou email..."
                    className="input pl-10 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-neutral-400" />
                <select
                  className="input"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="ALL">Todos os Roles</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPERVISOR">Supervisor</option>
                  <option value="EMPLOYEE">Estagiário</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-white">{user.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          user.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' :
                          user.role === 'SUPERVISOR' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {user.role}
                        </span>
                        {user.profileComplete ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-400" />
                        )}
                      </div>
                      
                      <p className="text-neutral-400 text-sm mb-2">{user.email}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        {user.siapeNumber && (
                          <div>
                            <span className="text-neutral-500">SIAPE:</span>
                            <p className="text-white font-medium">{user.siapeNumber}</p>
                          </div>
                        )}
                        {user.department && (
                          <div>
                            <span className="text-neutral-500">Departamento:</span>
                            <p className="text-white font-medium">{user.department}</p>
                          </div>
                        )}
                        {user.contractType && (
                          <div>
                            <span className="text-neutral-500">Contrato:</span>
                            <p className="text-white font-medium">{user.contractType}</p>
                          </div>
                        )}
                        {user.weeklyHours && (
                          <div>
                            <span className="text-neutral-500">Carga Horária:</span>
                            <p className="text-white font-medium">{user.weeklyHours}h/semana</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3 text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {user._count.attendanceRecords} registros
                        </span>
                        <span>
                          Criado em {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button asChild variant="ghost" size="sm" title="Visualizar">
                      <Link href={`/admin/users/${user.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm" title="Editar">
                      <Link href={`/admin/users/${user.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    {session?.user?.role === 'ADMIN' && user.id !== session.user.id && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        title="Deletar"
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-neutral-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Nenhum usuário encontrado</h3>
              <p className="text-neutral-400 mb-4">
                {searchTerm || roleFilter !== 'ALL' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece criando o primeiro usuário'
                }
              </p>
              {(!searchTerm && roleFilter === 'ALL') && (
                <Button asChild>
                  <Link href="/admin/users/new">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Criar Primeiro Usuário
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
