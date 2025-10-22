'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { 
  FileText, 
  Download, 
  Calendar, 
  ArrowLeft,
  Users,
  Clock,
  AlertTriangle,
  TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'

interface ReportData {
  totalUsers: number
  totalRecords: number
  lateRecords: number
  absences: number
  monthlyData: Array<{
    month: string
    records: number
    lateRecords: number
  }>
}

export default function ReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30') // dias
  const [selectedUser, setSelectedUser] = useState('ALL')

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

  // Load report data
  useEffect(() => {
    if (session && ['ADMIN', 'SUPERVISOR'].includes(session.user?.role)) {
      loadReportData()
    }
  }, [session, selectedPeriod, selectedUser])

  const loadReportData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/reports?period=${selectedPeriod}&user=${selectedUser}`)
      
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = async (format: 'pdf' | 'csv') => {
    try {
      const response = await fetch(`/api/reports/download?format=${format}&period=${selectedPeriod}&user=${selectedUser}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `relatorio-ponto-${new Date().toISOString().split('T')[0]}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Erro ao baixar relatório:', error)
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
                <Link href="/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">Relatórios</h1>
                <p className="text-neutral-400">Análise de dados de ponto</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={() => downloadReport('csv')} variant="ghost">
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button onClick={() => downloadReport('pdf')}>
                <Download className="h-4 w-4 mr-2" />
                PDF
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
                  Usuário
                </label>
                <select
                  className="input"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  <option value="ALL">Todos os usuários</option>
                  <option value="EMPLOYEE">Apenas estagiários</option>
                  <option value="SUPERVISOR">Apenas supervisores</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        {reportData && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-400">Total de Usuários</p>
                    <p className="text-2xl font-bold text-white">{reportData.totalUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-400">Registros de Ponto</p>
                    <p className="text-2xl font-bold text-white">{reportData.totalRecords}</p>
                  </div>
                  <Clock className="h-8 w-8 text-success" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-400">Atrasos</p>
                    <p className="text-2xl font-bold text-warning">{reportData.lateRecords}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-warning" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-400">Faltas</p>
                    <p className="text-2xl font-bold text-error">{reportData.absences}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-error" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Monthly Chart */}
        {reportData && reportData.monthlyData && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Registros por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.monthlyData.map((month, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">{month.month}</span>
                        <span className="text-sm text-neutral-400">{month.records} registros</span>
                      </div>
                      <div className="w-full bg-neutral-700 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ 
                            width: `${Math.min((month.records / Math.max(...reportData.monthlyData.map(m => m.records))) * 100, 100)}%` 
                          }}
                        />
                      </div>
                      {month.lateRecords > 0 && (
                        <div className="text-xs text-warning mt-1">
                          {month.lateRecords} atrasos
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold text-white">Relatório Detalhado</h3>
                  <p className="text-sm text-neutral-400">Visualizar todos os registros</p>
                </div>
              </div>
              <Button asChild className="w-full mt-4" variant="ghost">
                <Link href="/admin/reports/detailed">
                  Ver Detalhes
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <AlertTriangle className="h-8 w-8 text-warning" />
                <div>
                  <h3 className="font-semibold text-white">Justificativas</h3>
                  <p className="text-sm text-neutral-400">Atrasos e faltas pendentes</p>
                </div>
              </div>
              <Button asChild className="w-full mt-4" variant="ghost">
                <Link href="/admin/reports/justifications">
                  Ver Justificativas
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Calendar className="h-8 w-8 text-success" />
                <div>
                  <h3 className="font-semibold text-white">Frequência</h3>
                  <p className="text-sm text-neutral-400">Análise de frequência mensal</p>
                </div>
              </div>
              <Button asChild className="w-full mt-4" variant="ghost">
                <Link href="/admin/reports/frequency">
                  Ver Frequência
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
