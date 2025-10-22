'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { 
  AlertTriangle, 
  Clock, 
  Calendar, 
  ArrowLeft,
  Plus,
  FileText,
  Send
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'

interface Justification {
  id: string
  date: string
  type: 'LATE' | 'ABSENCE'
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  adminResponse?: string
}

interface PendingIssue {
  id: string
  date: string
  type: 'LATE' | 'ABSENCE'
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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      signIn()
    }
  }, [status])

  // Load data
  useEffect(() => {
    if (session) {
      loadJustifications()
      loadPendingIssues()
    }
  }, [session])

  const loadJustifications = async () => {
    try {
      const response = await fetch('/api/justifications')
      
      if (response.ok) {
        const data = await response.json()
        setJustifications(data)
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
      const response = await fetch('/api/justifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          issueId: selectedIssue.id,
          type: selectedIssue.type,
          date: selectedIssue.date,
          reason: justificationText
        })
      })

      if (response.ok) {
        setShowNewForm(false)
        setSelectedIssue(null)
        setJustificationText('')
        loadJustifications()
        loadPendingIssues()
      }
    } catch (error) {
      console.error('Erro ao enviar justificativa:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-warning bg-warning/20'
      case 'APPROVED': return 'text-success bg-success/20'
      case 'REJECTED': return 'text-error bg-error/20'
      default: return 'text-neutral-400 bg-neutral-700'
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
    switch (type) {
      case 'LATE': return 'Atraso'
      case 'ABSENCE': return 'Falta'
      default: return type
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
                  <div key={issue.id} className="flex items-center justify-between p-4 bg-warning/10 rounded-lg border border-warning/20">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${
                        issue.type === 'LATE' ? 'bg-warning/20' : 'bg-error/20'
                      }`}>
                        {issue.type === 'LATE' ? (
                          <Clock className="h-4 w-4 text-warning" />
                        ) : (
                          <Calendar className="h-4 w-4 text-error" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{getTypeText(issue.type)}</h3>
                        <p className="text-sm text-neutral-400">{issue.description}</p>
                        <p className="text-xs text-neutral-500">
                          {new Date(issue.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    {issue.canJustify && (
                      <Button 
                        size="sm"
                        onClick={() => {
                          setSelectedIssue(issue)
                          setShowNewForm(true)
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
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Nova Justificativa - {getTypeText(selectedIssue.type)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Data da Ocorrência
                  </label>
                  <input
                    type="text"
                    value={new Date(selectedIssue.date).toLocaleDateString('pt-BR')}
                    disabled
                    className="input bg-neutral-700"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Descrição
                  </label>
                  <input
                    type="text"
                    value={selectedIssue.description}
                    disabled
                    className="input bg-neutral-700"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Justificativa *
                  </label>
                  <textarea
                    className="input min-h-[100px] resize-none"
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
          <CardHeader>
            <CardTitle>Histórico de Justificativas</CardTitle>
          </CardHeader>
          <CardContent>
            {justifications.length > 0 ? (
              <div className="space-y-4">
                {justifications.map((justification) => (
                  <div key={justification.id} className="p-4 border border-neutral-700 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          justification.type === 'LATE' ? 'bg-warning/20' : 'bg-error/20'
                        }`}>
                          {justification.type === 'LATE' ? (
                            <Clock className="h-4 w-4 text-warning" />
                          ) : (
                            <Calendar className="h-4 w-4 text-error" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{getTypeText(justification.type)}</h3>
                          <p className="text-sm text-neutral-400">
                            {new Date(justification.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(justification.status)}`}>
                        {getStatusText(justification.status)}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm font-medium text-neutral-300 mb-1">Justificativa:</p>
                      <p className="text-sm text-neutral-400">{justification.reason}</p>
                    </div>
                    
                    {justification.adminResponse && (
                      <div className="border-t border-neutral-700 pt-3">
                        <p className="text-sm font-medium text-neutral-300 mb-1">Resposta do Admin:</p>
                        <p className="text-sm text-neutral-400">{justification.adminResponse}</p>
                      </div>
                    )}
                    
                    <p className="text-xs text-neutral-500 mt-2">
                      Enviado em {new Date(justification.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-neutral-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Nenhuma justificativa encontrada</h3>
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
