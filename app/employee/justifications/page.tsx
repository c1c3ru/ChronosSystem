'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import {
  AlertTriangle,
  Clock,
  Calendar,
  ArrowLeft,
  Plus,
  FileText,
  Send,
  Trash2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'

interface Justification {
  id: string
  date: string
  type: 'LATE' | 'ABSENCE' | 'EARLY_DEPARTURE'
  category: string | null
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  adminResponse?: string
}

const CATEGORIES = [
  'Saúde / Atestado Médico',
  'Problema de Transporte',
  'Prova / Evento Acadêmico',
  'Clima / Força Maior',
  'Problemas Familiares',
  'Outros'
]

interface PendingIssue {
  id: string
  date: string
  type: 'LATE' | 'ABSENCE' | 'EARLY_DEPARTURE'
  description: string
  canJustify: boolean
}

export default function JustificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [justifications, setJustifications] = useState<Justification[]>([])
  const [pendingIssues, setPendingIssues] = useState<PendingIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<PendingIssue | null>(null)
  const [justificationText, setJustificationText] = useState('')
  const [justificationCategory, setJustificationCategory] = useState(CATEGORIES[0])
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
  const [submitting, setSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  // A proteção de rota agora é feita EXCLUSIVAMENTE pelo middleware.
  // Isso evita loops de redirecionamento quando a sessão do cliente demora a sincronizar.

  // Load data
  useEffect(() => {
    if (session) {
      loadJustifications()
      loadPendingIssues()
    }
  }, [session])

  const loadJustifications = async () => {
    try {
      const response = await fetch('/api/employee/justifications')

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setJustifications(data.justifications)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar justificativas:', error)
    }
  }

  const loadPendingIssues = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/justifications/pending')

      if (response.ok) {
        const data = await response.json()
        setPendingIssues(data)
      }
    } catch (error) {
      console.error('Erro ao carregar pendências:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitJustification = async () => {
    if (!selectedIssue || !justificationText.trim()) return

    try {
      setSubmitting(true)
      const response = await fetch('/api/employee/justifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: selectedIssue.type,
          date: selectedIssue.date,
          reason: justificationText,
          category: justificationCategory,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setShowNewForm(false)
        setSelectedIssue(null)
        setJustificationText('')
        loadJustifications()
        loadPendingIssues()

        // Mostrar mensagem de feedback
        alert(data.message)
      } else {
        alert(data.error || 'Erro ao enviar justificativa')
      }
    } catch (error) {
      console.error('Erro ao enviar justificativa:', error)
      alert('Erro ao enviar justificativa')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteJustification = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta justificativa?')) return

    try {
      setIsDeleting(true)
      const res = await fetch(`/api/employee/justifications/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (res.ok && data.success) {
        alert('Justificativa excluída.')
        loadJustifications()
        loadPendingIssues()
      } else {
        alert(data.error || 'Erro ao excluir.')
      }
    } catch (e) {
      console.error(e)
      alert('Erro interno ao excluir.')
    } finally {
      setIsDeleting(false)
    }
  }

  const deleteAllPending = async () => {
    if (
      !confirm('Tem certeza que deseja excluir TODAS as suas justificativas pendentes de uma vez?')
    )
      return

    try {
      setIsDeleting(true)
      const res = await fetch('/api/employee/justifications', {
        method: 'DELETE',
      })
      const data = await res.json()
      if (res.ok && data.success) {
        alert(`Foram excluídas ${data.count} justificativas.`)
        loadJustifications()
        loadPendingIssues()
      } else {
        alert(data.error || 'Erro ao excluir justificativas.')
      }
    } catch (e) {
      console.error(e)
      alert('Erro interno ao excluir em massa.')
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-warning bg-warning/20'
      case 'APPROVED':
        return 'text-success bg-success/20'
      case 'REJECTED':
        return 'text-error bg-error/20'
      default:
        return 'text-neutral-400 bg-neutral-700'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendente'
      case 'APPROVED':
        return 'Aprovada'
      case 'REJECTED':
        return 'Rejeitada'
      default:
        return status
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'LATE':
        return 'Atraso'
      case 'ABSENCE':
        return 'Falta'
      case 'EARLY_DEPARTURE':
        return 'Saída Antecipada'
      default:
        return type
    }
  }

  const formatDate = (dateString: string) => {
    try {
      // Parse a data corretamente para evitar problemas de timezone
      let date: Date

      if (dateString.includes('T')) {
        // Já tem horário, usar diretamente
        date = new Date(dateString)
      } else {
        // Apenas data (YYYY-MM-DD), criar data local sem conversão de timezone
        const [year, month, day] = dateString.split('-').map(Number)
        date = new Date(year, month - 1, day)
      }

      if (isNaN(date.getTime())) {
        return 'Data inválida'
      }
      return date.toLocaleDateString('pt-BR')
    } catch {
      return 'Data inválida'
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
      <div className="bg-neutral-800/50 border-b border-neutral-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/employee">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Portal
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">Justificativas</h1>
                <p className="text-neutral-400">Gerencie suas justificativas de atraso e falta</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Pending Issues */}
        {pendingIssues.length > 0 && (
          <Card className="mb-6 border-warning/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-warning">
                <AlertTriangle className="h-5 w-5" />
                <span>Pendências que Requerem Justificativa</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-center justify-between p-4 bg-warning/10 rounded-lg border border-warning/20"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-2 rounded-full ${
                          issue.type === 'LATE' ? 'bg-warning/20' : 'bg-error/20'
                        }`}
                      >
                        {issue.type === 'LATE' ? (
                          <Clock className="h-4 w-4 text-warning" />
                        ) : (
                          <Calendar className="h-4 w-4 text-error" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{getTypeText(issue.type)}</h3>
                        <p className="text-sm text-neutral-400">{issue.description}</p>
                        <p className="text-xs text-neutral-500">{formatDate(issue.date)}</p>
                      </div>
                    </div>
                    {issue.canJustify && (
                      <Button
                        size="sm"
                        onClick={() => {
                          // Feedback tátil em dispositivos móveis
                          if ('vibrate' in navigator) {
                            navigator.vibrate(50) // Vibração curta de 50ms
                          }

                          setSelectedIssue(issue)
                          setShowNewForm(true)

                          // Scroll suave para o formulário após um pequeno delay para garantir que o formulário foi renderizado
                          setTimeout(() => {
                            formRef.current?.scrollIntoView({
                              behavior: 'smooth',
                              block: 'start',
                            })
                          }, 100)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Justificar
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* New Justification Form */}
        {showNewForm && selectedIssue && (
          <Card
            className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500 border-2 border-primary/50 shadow-lg shadow-primary/20"
            ref={formRef}
            style={{
              animation: 'pulse-border 2s ease-in-out 3',
            }}
          >
            <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                Nova Justificativa - {getTypeText(selectedIssue.type)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="issue-date"
                    className="block text-sm font-medium text-neutral-300 mb-2"
                  >
                    Data da Ocorrência
                  </label>
                  <input
                    id="issue-date"
                    type="text"
                    value={formatDate(selectedIssue.date)}
                    disabled
                    className="input bg-neutral-700"
                  />
                </div>

                <div>
                  <label
                    htmlFor="issue-description"
                    className="block text-sm font-medium text-neutral-300 mb-2"
                  >
                    Descrição
                  </label>
                  <input
                    id="issue-description"
                    type="text"
                    value={selectedIssue.description}
                    disabled
                    className="input bg-neutral-700"
                  />
                </div>

                <div>
                  <label htmlFor="issue-category" className="block text-sm font-medium text-neutral-300 mb-2">
                    Categoria *
                  </label>
                  <select
                    id="issue-category"
                    className="input w-full bg-neutral-700"
                    value={justificationCategory}
                    onChange={(e) => setJustificationCategory(e.target.value)}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="issue-justification"
                    className="block text-sm font-medium text-neutral-300 mb-2"
                  >
                    Detalhes da Justificativa *
                  </label>
                  <textarea
                    id="issue-justification"
                    className="input min-h-[100px] resize-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="Descreva o motivo do atraso ou falta..."
                    value={justificationText}
                    onChange={(e) => setJustificationText(e.target.value)}
                    maxLength={500}
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    {justificationText.length}/500 caracteres
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <Button onClick={submitJustification} disabled={!justificationText.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Justificativa
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowNewForm(false)
                      setSelectedIssue(null)
                      setJustificationText('')
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Justifications History */}
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Histórico de Justificativas</CardTitle>
            
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex bg-neutral-800 p-1 rounded-lg">
                {(['PENDING', 'APPROVED', 'REJECTED'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab 
                        ? 'bg-primary text-white shadow-sm' 
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-700/50'
                    }`}
                  >
                    {getStatusText(tab)}
                  </button>
                ))}
              </div>

              {activeTab === 'PENDING' && justifications.some((j) => j.status === 'PENDING') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={deleteAllPending}
                  disabled={isDeleting}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Pendentes
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {justifications.filter(j => j.status === activeTab).length > 0 ? (
              <div className="space-y-4">
                {justifications.filter(j => j.status === activeTab).map((justification) => (
                  <div
                    key={justification.id}
                    className="p-4 border border-neutral-700 rounded-lg group relative"
                  >
                    {justification.status === 'PENDING' && (
                      <button
                        onClick={() => deleteJustification(justification.id)}
                        disabled={isDeleting}
                        className="absolute top-4 right-4 p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                        title="Excluir justificativa pendente"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}

                    <div className="flex items-start justify-between mb-3 pr-10">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-2 rounded-full ${
                            justification.type === 'LATE' ? 'bg-warning/20' : 'bg-error/20'
                          }`}
                        >
                          {justification.type === 'LATE' ? (
                            <Clock className="h-4 w-4 text-warning" />
                          ) : (
                            <Calendar className="h-4 w-4 text-error" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-white">
                            {getTypeText(justification.type)}
                            {justification.category && (
                              <span className="ml-2 text-xs font-normal text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-full">
                                {justification.category}
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-neutral-400">
                            {formatDate(justification.date)}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(justification.status)}`}
                      >
                        {getStatusText(justification.status)}
                      </span>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium text-neutral-300 mb-1">Justificativa:</p>
                      <p className="text-sm text-neutral-400">{justification.reason}</p>
                    </div>

                    {justification.adminResponse && (
                      <div className="border-t border-neutral-700 pt-3">
                        <p className="text-sm font-medium text-neutral-300 mb-1">
                          Resposta do Admin:
                        </p>
                        <p className="text-sm text-neutral-400">{justification.adminResponse}</p>
                      </div>
                    )}

                    <p className="text-xs text-neutral-500 mt-2">
                      Enviado em {formatDate(justification.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-neutral-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Nenhuma justificativa encontrada
                </h3>
                <p className="text-neutral-400">
                  Suas justificativas aparecerão aqui quando enviadas
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
