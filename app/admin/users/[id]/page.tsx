'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { 
  ArrowLeft,
  Edit,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle,
  Users,
  Target
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { formatDate } from '@/lib/internship-calculator'

interface UserDetails {
  id: string
  name: string
  email: string
  role: string
  phone?: string
  address?: string
  birthDate?: string
  emergencyContact?: string
  emergencyPhone?: string
  department?: string
  startDate?: string
  siapeNumber?: string
  contractType?: string
  weeklyHours?: number
  dailyHours?: number
  profileComplete: boolean
  createdAt: string
  updatedAt: string
  _count: {
    attendanceRecords: number
  }
}

export default function UserDetailsPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(true)

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

  // Load user data
  useEffect(() => {
    if (session && ['ADMIN', 'SUPERVISOR'].includes(session.user?.role)) {
      loadUser()
    }
  }, [session, params.id])

  const loadUser = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users/${params.id}`)
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else if (response.status === 404) {
        router.push('/admin/users')
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return <Loading />
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Usuário não encontrado</h2>
            <p className="text-neutral-400 mb-4">O usuário solicitado não existe ou foi removido.</p>
            <Button asChild>
              <Link href="/admin/users">Voltar à lista</Link>
            </Button>
          </CardContent>
        </Card>
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
                <Link href="/admin/users">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar à Lista
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">Detalhes do Usuário</h1>
                <p className="text-neutral-400">Informações completas de {user.name}</p>
              </div>
            </div>
            <Button asChild>
              <Link href={`/admin/users/${user.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Editar Usuário
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <User className="h-5 w-5 mr-2 text-primary" />
                  Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{user.name}</h3>
                  <p className="text-neutral-400">{user.email}</p>
                  
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' :
                      user.role === 'SUPERVISOR' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {user.role}
                    </span>
                    {user.profileComplete ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-neutral-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-400">Registros de ponto:</span>
                    <span className="text-white font-medium">{user._count.attendanceRecords}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-400">Criado em:</span>
                    <span className="text-white font-medium">{formatDate(new Date(user.createdAt))}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-400">Atualizado em:</span>
                    <span className="text-white font-medium">{formatDate(new Date(user.updatedAt))}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details Cards */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <User className="h-5 w-5 mr-2 text-primary" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {user.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-neutral-400" />
                      <div>
                        <p className="text-xs text-neutral-500">Telefone</p>
                        <p className="text-white">{user.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {user.birthDate && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-neutral-400" />
                      <div>
                        <p className="text-xs text-neutral-500">Data de Nascimento</p>
                        <p className="text-white">{formatDate(new Date(user.birthDate))}</p>
                      </div>
                    </div>
                  )}
                  
                  {user.address && (
                    <div className="flex items-start space-x-3 md:col-span-2">
                      <MapPin className="h-4 w-4 text-neutral-400 mt-1" />
                      <div>
                        <p className="text-xs text-neutral-500">Endereço</p>
                        <p className="text-white">{user.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            {(user.emergencyContact || user.emergencyPhone) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
                    Contato de Emergência
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {user.emergencyContact && (
                      <div className="flex items-center space-x-3">
                        <User className="h-4 w-4 text-neutral-400" />
                        <div>
                          <p className="text-xs text-neutral-500">Nome</p>
                          <p className="text-white">{user.emergencyContact}</p>
                        </div>
                      </div>
                    )}
                    
                    {user.emergencyPhone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-neutral-400" />
                        <div>
                          <p className="text-xs text-neutral-500">Telefone</p>
                          <p className="text-white">{user.emergencyPhone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Building className="h-5 w-5 mr-2 text-primary" />
                  Informações Profissionais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {user.siapeNumber && (
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-neutral-400" />
                      <div>
                        <p className="text-xs text-neutral-500">Matrícula SIAPE</p>
                        <p className="text-white font-mono">{user.siapeNumber}</p>
                      </div>
                    </div>
                  )}
                  
                  {user.department && (
                    <div className="flex items-center space-x-3">
                      <Building className="h-4 w-4 text-neutral-400" />
                      <div>
                        <p className="text-xs text-neutral-500">Departamento</p>
                        <p className="text-white">{user.department}</p>
                      </div>
                    </div>
                  )}
                  
                  {user.contractType && (
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-neutral-400" />
                      <div>
                        <p className="text-xs text-neutral-500">Tipo de Contrato</p>
                        <p className="text-white">{user.contractType}</p>
                      </div>
                    </div>
                  )}
                  
                  {user.weeklyHours && (
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-neutral-400" />
                      <div>
                        <p className="text-xs text-neutral-500">Carga Horária</p>
                        <p className="text-white">{user.weeklyHours}h/semana ({user.dailyHours}h/dia)</p>
                      </div>
                    </div>
                  )}
                  
                  {user.startDate && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-neutral-400" />
                      <div>
                        <p className="text-xs text-neutral-500">Data de Início</p>
                        <p className="text-white">{formatDate(new Date(user.startDate))}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  )
}
