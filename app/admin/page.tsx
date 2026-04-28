'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import {
  Users,
  Clock,
  Monitor,
  BarChart3,
  Settings,
  UserPlus,
  Calendar,
  AlertTriangle,
  LogOut,
  Home,
  TrendingUp,
  Activity,
  Trash2,
  Filter,
  LogIn,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FilterSelect } from '@/components/ui/FilterSelect'
import { handleCompleteLogout } from '@/lib/logout'
import { Loading } from '@/components/ui/Loading'
import { toast } from 'sonner'

interface DashboardStats {
  totalUsers: number
  todayRecords: number
  activeMachines: number
  alerts: number
  trends?: {
    recordsChange: number
    machinesOperational: string | number
  }
}

interface RecentActivity {
  id: string
  user: string
  action: string
  timestamp: string
  type: 'ENTRY' | 'EXIT'
}

interface InternOverview {
  id: string
  name: string | null
  email: string
  department: string | null
  shift: string
  shiftStartTime: string
  shiftEndTime: string
  contractType: string
  weeklyHours: number
  dailyHours: number
  hourBalance: number
  _count: {
    attendanceRecords: number
  }
  lastStatus: {
    type: 'ENTRY' | 'EXIT'
    timestamp: string
  } | null
  isPresent: boolean
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<'ALL' | 'ENTRY' | 'EXIT'>('ALL')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  /* New state for intern overview */
  const [interns, setInterns] = useState<InternOverview[]>([])
  const [internPage, setInternPage] = useState(1)
  const internsPerPage = 6

  // A proteção de rota agora é feita EXCLUSIVAMENTE pelo middleware.
  // Isso evita loops de redirecionamento quando a sessão do cliente demora a sincronizar.

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)

      // Carregar dados reais das APIs
      const [statsResponse, activityResponse, internsResponse] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/activity?limit=5'),
        fetch('/api/admin/interns/overview'),
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats({
          totalUsers: statsData.totalUsers,
          todayRecords: statsData.todayRecords,
          activeMachines: statsData.activeMachines,
          alerts: statsData.alerts,
          trends: statsData.trends,
        })
      }

      if (activityResponse.ok) {
        const activityData = await activityResponse.json()
        setRecentActivity(activityData)
      }

      if (internsResponse.ok) {
        const internsData = await internsResponse.json()
        setInterns(internsData)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
      // Fallback para dados mockados em caso de erro
      setStats({
        totalUsers: 0,
        todayRecords: 0,
        activeMachines: 0,
        alerts: 0,
      })

      setRecentActivity([])
      setInterns([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Load dashboard data
  useEffect(() => {
    if (session && ['ADMIN', 'SUPERVISOR'].includes(session.user?.role)) {
      loadDashboardData()
    }
  }, [session, loadDashboardData])

  const deleteRecord = async (recordId: string, recordType: 'ENTRY' | 'EXIT') => {
    if (
      !confirm(
        `Tem certeza que deseja deletar este registro de ${recordType === 'ENTRY' ? 'entrada' : 'saída'}?`
      )
    ) {
      return
    }

    try {
      setDeletingId(recordId)
      const response = await fetch(`/api/attendance/${recordId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Registro deletado com sucesso!')
        setRecentActivity(recentActivity.filter((a) => a.id !== recordId))
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erro ao deletar registro')
      }
    } catch (error) {
      console.error('Erro ao deletar registro:', error)
      toast.error('Erro ao deletar registro')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredActivity = recentActivity.filter(
    (activity) => filterType === 'ALL' || activity.type === filterType
  )

  const totalInternPages = Math.ceil(interns.length / internsPerPage)
  const paginatedInterns = interns.slice(
    (internPage - 1) * internsPerPage,
    internPage * internsPerPage
  )

  if (status === 'loading') {
    return <Loading size="lg" text="Aguarde um momento..." />
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
      <div className="glass border-b border-neutral-700/50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                <Home className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </Link>
              <div className="h-4 sm:h-6 w-px bg-neutral-600" />
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="bg-primary/20 rounded-xl p-1.5 sm:p-2">
                  <Monitor className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-white">Painel Administrativo</h1>
                  <p className="text-neutral-400 text-xs sm:text-sm hidden sm:block">
                    Sistema Chronos - Gestão de Ponto
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white font-medium">{session.user.name}</p>
                <p className="text-neutral-400 text-sm">{session.user.role}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <Button variant="ghost" size="sm" onClick={handleCompleteLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        {loading ? (
          <Loading size="lg" text="Carregando dashboard..." />
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <Card variant="glass" className="hover:scale-105 transition-transform duration-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-neutral-400 text-xs sm:text-sm font-medium">
                        Total de Usuários
                      </p>
                      <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
                        {stats?.totalUsers}
                      </p>
                    </div>
                    <div className="bg-secondary-500/20 rounded-2xl p-2 sm:p-3">
                      <Users className="h-6 w-6 sm:h-8 sm:w-8 text-secondary-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass" className="hover:scale-105 transition-transform duration-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-neutral-400 text-xs sm:text-sm font-medium">
                        Registros Hoje
                      </p>
                      <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
                        {stats?.todayRecords}
                      </p>
                    </div>
                    <div className="bg-primary/20 rounded-2xl p-2 sm:p-3">
                      <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass" className="hover:scale-105 transition-transform duration-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-neutral-400 text-xs sm:text-sm font-medium">
                        Máquinas Ativas
                      </p>
                      <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
                        {stats?.activeMachines}
                      </p>
                    </div>
                    <div className="bg-warning/20 rounded-2xl p-2 sm:p-3">
                      <Monitor className="h-6 w-6 sm:h-8 sm:w-8 text-warning" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Link href="/admin/reports/justifications">
                <Card
                  variant="glass"
                  className="hover:scale-105 transition-transform duration-200 cursor-pointer h-full"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-neutral-400 text-xs sm:text-sm font-medium">Alertas</p>
                        <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
                          {stats?.alerts}
                        </p>
                        <p className="text-xs text-error mt-1 flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Justificativas pendentes
                        </p>
                      </div>
                      <div className="bg-error/20 rounded-2xl p-2 sm:p-3">
                        <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-error" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <Link href="/admin/users/new">
                <Card
                  variant="glass"
                  className="group hover:scale-105 transition-all duration-200 cursor-pointer border-2 border-success/30 hover:border-success/50"
                >
                  <CardContent className="p-6 text-center">
                    <div className="bg-success/20 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-success/30 transition-colors">
                      <UserPlus className="h-8 w-8 text-success group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Cadastrar Usuário</h3>
                    <p className="text-neutral-400 text-sm">
                      Adicionar novo estagiário ou supervisor
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/users">
                <Card
                  variant="glass"
                  className="group hover:scale-105 transition-all duration-200 cursor-pointer"
                >
                  <CardContent className="p-6 text-center">
                    <div className="bg-primary/20 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/30 transition-colors">
                      <Users className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Gerenciar Usuários</h3>
                    <p className="text-neutral-400 text-sm">Visualizar e editar usuários</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/machines">
                <Card
                  variant="glass"
                  className="group hover:scale-105 transition-all duration-200 cursor-pointer"
                >
                  <CardContent className="p-6 text-center">
                    <div className="bg-secondary-500/20 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary-500/30 transition-colors">
                      <Monitor className="h-8 w-8 text-secondary-500 group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Gerenciar Máquinas</h3>
                    <p className="text-neutral-400 text-sm">Adicionar e configurar pontos</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/reports">
                <Card
                  variant="glass"
                  className="group hover:scale-105 transition-all duration-200 cursor-pointer"
                >
                  <CardContent className="p-6 text-center">
                    <div className="bg-warning/20 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-warning/30 transition-colors">
                      <BarChart3 className="h-8 w-8 text-warning group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Relatórios</h3>
                    <p className="text-neutral-400 text-sm">Visualizar relatórios e estatísticas</p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Interns Overview */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  Visão Geral de Estagiários
                </h2>
                <Link href="/admin/users">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                    Ver todos
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedInterns.map((intern) => (
                  <Card
                    key={intern.id}
                    variant="glass"
                    className="overflow-hidden border-neutral-700/30 hover:border-primary/30 transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold truncate">
                            {intern.name || 'Sem nome'}
                          </h3>
                          <p className="text-neutral-400 text-xs truncate">{intern.email}</p>
                        </div>
                        <div
                          className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase flex-shrink-0 ${
                            intern.isPresent
                              ? 'bg-success/20 text-success border border-success/30'
                              : 'bg-neutral-800 text-neutral-500 border border-neutral-700'
                          }`}
                        >
                          {intern.isPresent ? 'Presente' : 'Ausente'}
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-neutral-900/40 p-2 rounded-lg border border-neutral-800/50">
                          <p className="text-neutral-500 text-[10px] uppercase font-bold mb-0.5">
                            Horário
                          </p>
                          <p className="text-white text-xs font-medium">
                            {intern.shiftStartTime} - {intern.shiftEndTime}
                          </p>
                        </div>
                        <div className="bg-neutral-900/40 p-2 rounded-lg border border-neutral-800/50">
                          <p className="text-neutral-500 text-[10px] uppercase font-bold mb-0.5">
                            Saldo Atual
                          </p>
                          <p
                            className={`text-xs font-bold ${intern.hourBalance >= 0 ? 'text-success' : 'text-error'}`}
                          >
                            {intern.hourBalance > 0 ? '+' : ''}
                            {intern.hourBalance.toFixed(1)}h
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-neutral-800/50 flex items-center justify-between text-[11px] text-neutral-400">
                        <div className="flex items-center">
                          <div
                            className={`h-1.5 w-1.5 rounded-full mr-2 ${intern.lastStatus?.type === 'ENTRY' ? 'bg-success animate-pulse' : 'bg-neutral-600'}`}
                          />
                          {intern.lastStatus
                            ? `${intern.lastStatus.type === 'ENTRY' ? 'Entrou às' : 'Saiu às'} ${new Date(intern.lastStatus.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                            : 'Sem registros hoje'}
                        </div>
                        <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                          {intern.contractType.split('_')[1] || intern.contractType}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {interns.length === 0 && (
                  <div className="col-span-full py-8 text-center bg-neutral-800/20 rounded-xl border border-dashed border-neutral-700">
                    <p className="text-neutral-500">Nenhum estagiário encontrado</p>
                  </div>
                )}
              </div>

              {totalInternPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-6">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setInternPage(Math.max(1, internPage - 1))}
                    disabled={internPage === 1}
                    className="bg-neutral-800/50 border-neutral-700 hover:bg-neutral-700/50 hover:border-neutral-600"
                  >
                    Anterior
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalInternPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setInternPage(page)}
                        className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium transition-colors ${
                          internPage === page
                            ? 'bg-primary text-black'
                            : 'text-neutral-400 hover:bg-neutral-700/50 hover:text-white'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setInternPage(Math.min(totalInternPages, internPage + 1))}
                    disabled={internPage === totalInternPages}
                    className="bg-neutral-800/50 border-neutral-700 hover:bg-neutral-700/50 hover:border-neutral-600"
                  >
                    Próximo
                  </Button>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <Card variant="glass">
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <CardTitle className="flex items-center text-white">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    Atividade Recente
                  </CardTitle>
                  <FilterSelect
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as 'ALL' | 'ENTRY' | 'EXIT')}
                    options={[
                      { value: 'ALL', label: 'Todas as atividades' },
                      { value: 'ENTRY', label: '→ Apenas Entradas' },
                      { value: 'EXIT', label: '← Apenas Saídas' },
                    ]}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredActivity.length > 0 ? (
                    filteredActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-neutral-800/30 hover:bg-neutral-800/50 transition-colors group"
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <div
                            className={`p-2 rounded-lg flex-shrink-0 ${
                              activity.type === 'ENTRY'
                                ? 'bg-primary/20 text-primary'
                                : 'bg-warning/20 text-warning'
                            }`}
                          >
                            {activity.type === 'ENTRY' ? (
                              <LogIn className="h-4 w-4" />
                            ) : (
                              <LogOut className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm truncate">
                              <span className="font-medium">{activity.user}</span> {activity.action}
                            </p>
                            <p className="text-neutral-400 text-xs">{activity.timestamp}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
                          <Clock className="h-4 w-4 text-neutral-500" />
                          <button
                            onClick={() => deleteRecord(activity.id, activity.type)}
                            disabled={deletingId === activity.id}
                            className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Deletar registro"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-neutral-400">Nenhum registro encontrado</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 text-center">
                  <Button variant="ghost" className="text-primary hover:text-primary/80">
                    Ver todas as atividades
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
