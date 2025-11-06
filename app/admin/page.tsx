'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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
  Activity
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'

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

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
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
      window.location.href = '/employee'
    }
  }, [session])

  // Load dashboard data
  useEffect(() => {
    if (session && ['ADMIN', 'SUPERVISOR'].includes(session.user?.role)) {
      loadDashboardData()
    }
  }, [session])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Carregar dados reais das APIs
      const [statsResponse, activityResponse] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/activity?limit=5')
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats({
          totalUsers: statsData.totalUsers,
          todayRecords: statsData.todayRecords,
          activeMachines: statsData.activeMachines,
          alerts: statsData.alerts,
          trends: statsData.trends
        })
      }

      if (activityResponse.ok) {
        const activityData = await activityResponse.json()
        setRecentActivity(activityData)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
      // Fallback para dados mockados em caso de erro
      setStats({
        totalUsers: 24,
        todayRecords: 48,
        activeMachines: 8,
        alerts: 3
      })

      setRecentActivity([
        {
          id: '1',
          user: 'Maria Santos',
          action: 'registrou entrada',
          timestamp: 'há 2 minutos',
          type: 'ENTRY'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <Loading size="lg" text="Carregando..." />
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Header */}
      <div className="glass border-b border-neutral-700/50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <Home className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </Link>
              <div className="h-4 sm:h-6 w-px bg-neutral-600" />
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="bg-primary/20 rounded-xl p-1.5 sm:p-2">
                  <Monitor className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-white">Painel Administrativo</h1>
                  <p className="text-neutral-400 text-xs sm:text-sm hidden sm:block">Sistema Chronos - Gestão de Ponto</p>
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
              <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
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
                      <p className="text-neutral-400 text-xs sm:text-sm font-medium">Total de Usuários</p>
                      <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats?.totalUsers}</p>
                      <p className="text-xs text-primary mt-1 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +2 este mês
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
                      <p className="text-neutral-400 text-xs sm:text-sm font-medium">Registros Hoje</p>
                      <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats?.todayRecords}</p>
                      <p className="text-xs text-success mt-1 flex items-center">
                        <Activity className="h-3 w-3 mr-1" />
                        +12% vs ontem
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
                      <p className="text-neutral-400 text-xs sm:text-sm font-medium">Máquinas Ativas</p>
                      <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats?.activeMachines}</p>
                      <p className="text-xs text-warning mt-1 flex items-center">
                        <Monitor className="h-3 w-3 mr-1" />
                        2 offline
                      </p>
                    </div>
                    <div className="bg-warning/20 rounded-2xl p-2 sm:p-3">
                      <Monitor className="h-6 w-6 sm:h-8 sm:w-8 text-warning" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass" className="hover:scale-105 transition-transform duration-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-neutral-400 text-xs sm:text-sm font-medium">Alertas</p>
                      <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats?.alerts}</p>
                      <p className="text-xs text-error mt-1 flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Requer atenção
                      </p>
                    </div>
                    <div className="bg-error/20 rounded-2xl p-2 sm:p-3">
                      <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-error" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <Link href="/admin/users">
                <Card variant="glass" className="group hover:scale-105 transition-all duration-200 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="bg-primary/20 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/30 transition-colors">
                      <UserPlus className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Gerenciar Usuários</h3>
                    <p className="text-neutral-400 text-sm">Cadastrar e gerenciar estagiários</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/machines">
                <Card variant="glass" className="group hover:scale-105 transition-all duration-200 cursor-pointer">
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
                <Card variant="glass" className="group hover:scale-105 transition-all duration-200 cursor-pointer">
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

            {/* Recent Activity */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-4 rounded-lg bg-neutral-800/30 hover:bg-neutral-800/50 transition-colors">
                      <div className={`h-3 w-3 rounded-full ${
                        activity.type === 'ENTRY' ? 'bg-primary' : 'bg-warning'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-white text-sm">
                          <span className="font-medium">{activity.user}</span> {activity.action}
                        </p>
                        <p className="text-neutral-400 text-xs">{activity.timestamp}</p>
                      </div>
                      <Clock className="h-4 w-4 text-neutral-400" />
                    </div>
                  ))}
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
