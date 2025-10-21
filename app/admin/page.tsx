'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { 
  Users, 
  Monitor, 
  Clock, 
  BarChart3, 
  Settings, 
  LogOut, 
  User,
  TrendingUp,
  Calendar,
  MapPin
} from 'lucide-react'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMachines: 0,
    todayRecords: 0,
    activeUsers: 0
  })

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn()
    }
  }, [status])

  // Check if user is admin or supervisor
  useEffect(() => {
    if (session && !['ADMIN', 'SUPERVISOR'].includes(session.user?.role)) {
      window.location.href = '/employee'
    }
  }, [session])

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-slate-400">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user?.role)) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <BarChart3 className="h-6 w-6 text-primary mr-2" />
            <h1 className="text-xl font-bold text-white">Painel Administrativo</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-slate-300">
              <User className="h-4 w-4 mr-2" />
              <span className="text-sm">{session.user?.name || session.user?.email}</span>
              <span className="ml-2 px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                {session.user?.role}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center text-slate-400 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4 mr-1" />
              <span className="text-sm">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Bem-vindo ao Dashboard
          </h2>
          <p className="text-slate-300">
            Gerencie usuários, máquinas e monitore registros de ponto
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
            <div className="flex items-center">
              <div className="bg-blue-500/20 rounded-lg p-3 mr-4">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total de Usuários</p>
                <p className="text-2xl font-bold text-white">12</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
            <div className="flex items-center">
              <div className="bg-green-500/20 rounded-lg p-3 mr-4">
                <Monitor className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Máquinas Ativas</p>
                <p className="text-2xl font-bold text-white">3</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
            <div className="flex items-center">
              <div className="bg-primary/20 rounded-lg p-3 mr-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Registros Hoje</p>
                <p className="text-2xl font-bold text-white">24</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
            <div className="flex items-center">
              <div className="bg-orange-500/20 rounded-lg p-3 mr-4">
                <TrendingUp className="h-6 w-6 text-orange-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Usuários Online</p>
                <p className="text-2xl font-bold text-white">8</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
            <div className="text-center">
              <div className="bg-blue-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Gerenciar Usuários
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                Adicionar, editar ou remover estagiários e supervisores
              </p>
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Acessar
              </button>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
            <div className="text-center">
              <div className="bg-green-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Monitor className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Gerenciar Máquinas
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                Configurar e monitorar kiosks de registro de ponto
              </p>
              <button className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Acessar
              </button>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
            <div className="text-center">
              <div className="bg-primary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Relatórios
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                Visualizar e exportar relatórios de frequência
              </p>
              <button className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Acessar
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Records */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Registros Recentes
            </h3>
            <div className="space-y-3">
              {[
                { name: 'Maria Santos', type: 'ENTRADA', time: '08:00', location: 'Recepção' },
                { name: 'Pedro Oliveira', type: 'ENTRADA', time: '08:15', location: 'Lab TI' },
                { name: 'Ana Silva', type: 'SAÍDA', time: '17:30', location: 'Recepção' },
              ].map((record, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      record.type === 'ENTRADA' ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    <div>
                      <p className="text-white text-sm font-medium">{record.name}</p>
                      <p className="text-slate-400 text-xs">{record.type} - {record.location}</p>
                    </div>
                  </div>
                  <span className="text-slate-300 text-sm">{record.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Status do Sistema
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Banco de Dados</span>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Kiosk Recepção</span>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                  Ativo
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Kiosk Lab TI</span>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                  Ativo
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Backup Automático</span>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                  Funcionando
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
