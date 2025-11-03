'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { 
  Calendar, 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  BarChart3,
  User,
  Award,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'

interface FrequencyData {
  user: {
    id: string
    name: string
    email: string
    role: string
  }
  totalDays: number
  presentDays: number
  absentDays: number
  lateCount: number
  frequencyPercentage: number
  averageHours: number
  lastRecord?: {
    date: string
    type: string
  }
}

interface MonthlyStats {
  month: string
  totalUsers: number
  averageFrequency: number
  totalRecords: number
  lateRecords: number
}

export default function FrequencyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [frequencyData, setFrequencyData] = useState<FrequencyData[]>([])
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const [sortBy, setSortBy] = useState('frequency')
  const [sortOrder, setSortOrder] = useState('desc')

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

  // Load frequency data
  useEffect(() => {
    if (session && ['ADMIN', 'SUPERVISOR'].includes(session.user?.role)) {
      loadFrequencyData()
    }
  }, [session, selectedPeriod])

  const loadFrequencyData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/reports/frequency?period=${selectedPeriod}`)
      
      if (response.ok) {
        const data = await response.json()
        setFrequencyData(data.frequencyData || [])
        setMonthlyStats(data.monthlyStats || [])
      }
    } catch (error) {
      console.error('Erro ao carregar dados de frequência:', error)
    } finally {
      setLoading(false)
    }
  }

  const sortedData = [...frequencyData].sort((a, b) => {
    let aValue, bValue
    
    switch (sortBy) {
      case 'frequency':
        aValue = a.frequencyPercentage
        bValue = b.frequencyPercentage
        break
      case 'name':
        aValue = a.user.name
        bValue = b.user.name
        break
      case 'hours':
        aValue = a.averageHours
        bValue = b.averageHours
        break
      case 'lates':
        aValue = a.lateCount
        bValue = b.lateCount
        break
      default:
        aValue = a.frequencyPercentage
        bValue = b.frequencyPercentage
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }
    
    // Garantir que são números para operação aritmética
    const numA = typeof aValue === 'number' ? aValue : 0
    const numB = typeof bValue === 'number' ? bValue : 0
    return sortOrder === 'asc' ? numA - numB : numB - numA
  })

  const getFrequencyColor = (percentage: number) => {
    if (percentage >= 95) return 'text-success'
    if (percentage >= 85) return 'text-warning'
    return 'text-error'
  }

  const getFrequencyBadge = (percentage: number) => {
    if (percentage >= 95) return { text: 'Excelente', color: 'bg-success/20 text-success' }
    if (percentage >= 85) return { text: 'Bom', color: 'bg-warning/20 text-warning' }
    if (percentage >= 70) return { text: 'Regular', color: 'bg-orange-500/20 text-orange-400' }
    return { text: 'Baixo', color: 'bg-error/20 text-error' }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'text-red-400'
      case 'SUPERVISOR': return 'text-yellow-400'
      case 'EMPLOYEE': return 'text-blue-400'
      default: return 'text-neutral-400'
    }
  }

  const overallStats = {
    totalUsers: frequencyData.length,
    averageFrequency: frequencyData.length > 0 
      ? frequencyData.reduce((sum, user) => sum + user.frequencyPercentage, 0) / frequencyData.length 
      : 0,
    excellentUsers: frequencyData.filter(user => user.frequencyPercentage >= 95).length,
    lowFrequencyUsers: frequencyData.filter(user => user.frequencyPercentage < 70).length
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
                <h1 className="text-2xl font-bold text-white">Análise de Frequência</h1>
                <p className="text-neutral-400">Relatório detalhado de presença e pontualidade</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Período
                  </label>
                  <select
                    className="input"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                  >
                    <option value="7">Últimos 7 dias</option>
                    <option value="30">Últimos 30 dias</option>
                    <option value="90">Últimos 90 dias</option>
                    <option value="365">Último ano</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Ordenar por
                  </label>
                  <select
                    className="input"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="frequency">Frequência</option>
                    <option value="name">Nome</option>
                    <option value="hours">Horas Médias</option>
                    <option value="lates">Atrasos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Ordem
                  </label>
                  <select
                    className="input"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="desc">Decrescente</option>
                    <option value="asc">Crescente</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Total de Usuários</p>
                  <p className="text-2xl font-bold text-white">{overallStats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Frequência Média</p>
                  <p className={`text-2xl font-bold ${getFrequencyColor(overallStats.averageFrequency)}`}>
                    {overallStats.averageFrequency.toFixed(1)}%
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Excelente (≥95%)</p>
                  <p className="text-2xl font-bold text-success">{overallStats.excellentUsers}</p>
                </div>
                <Award className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Baixa Frequência (&lt;70%)</p>
                  <p className="text-2xl font-bold text-error">{overallStats.lowFrequencyUsers}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-error" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trend */}
        {monthlyStats.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Tendência Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyStats.map((month, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">{month.month}</span>
                        <span className="text-sm text-neutral-400">
                          {month.averageFrequency.toFixed(1)}% • {month.totalRecords} registros
                        </span>
                      </div>
                      <div className="w-full bg-neutral-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            month.averageFrequency >= 95 ? 'bg-success' :
                            month.averageFrequency >= 85 ? 'bg-warning' : 'bg-error'
                          }`}
                          style={{ width: `${Math.min(month.averageFrequency, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Frequency Table */}
        <Card>
          <CardHeader>
            <CardTitle>Frequência por Usuário</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-700">
                      <th className="text-left py-3 px-4 text-neutral-300 font-medium">Usuário</th>
                      <th className="text-left py-3 px-4 text-neutral-300 font-medium">Role</th>
                      <th className="text-center py-3 px-4 text-neutral-300 font-medium">Frequência</th>
                      <th className="text-center py-3 px-4 text-neutral-300 font-medium">Dias Presentes</th>
                      <th className="text-center py-3 px-4 text-neutral-300 font-medium">Faltas</th>
                      <th className="text-center py-3 px-4 text-neutral-300 font-medium">Atrasos</th>
                      <th className="text-center py-3 px-4 text-neutral-300 font-medium">Horas Médias</th>
                      <th className="text-center py-3 px-4 text-neutral-300 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.map((userData) => {
                      const badge = getFrequencyBadge(userData.frequencyPercentage)
                      return (
                        <tr key={userData.user.id} className="border-b border-neutral-800 hover:bg-neutral-800/30">
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-white font-medium">{userData.user.name}</p>
                              <p className="text-neutral-400 text-sm">{userData.user.email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-sm font-medium ${getRoleColor(userData.user.role)}`}>
                              {userData.user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`text-lg font-bold ${getFrequencyColor(userData.frequencyPercentage)}`}>
                              {userData.frequencyPercentage.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-white">
                            {userData.presentDays}/{userData.totalDays}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={userData.absentDays > 0 ? 'text-error' : 'text-neutral-400'}>
                              {userData.absentDays}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={userData.lateCount > 0 ? 'text-warning' : 'text-neutral-400'}>
                              {userData.lateCount}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-white">
                            {userData.averageHours.toFixed(1)}h
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${badge.color}`}>
                              {badge.text}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-neutral-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Nenhum dado de frequência encontrado</h3>
                <p className="text-neutral-400">
                  Não há registros suficientes para o período selecionado
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
