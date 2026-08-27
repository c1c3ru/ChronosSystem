'use client'

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { FlaskConical, CheckCircle2, XCircle, CalendarDays, PlusCircle, ClipboardCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  VISIT_SHIFTS,
  type VisitShift,
  type PublicLaboratory,
  type PublicLabVisit,
  type StaffLabVisit,
} from '@/lib/lab-visits'

const SHIFT_LABELS: Record<VisitShift, string> = {
  MORNING: 'Manhã',
  AFTERNOON: 'Tarde',
  NIGHT: 'Noite',
}

interface VisitFormState {
  labId: string
  responsibleName: string
  schoolName: string
  studentCount: string
  contactEmail: string
  contactPhone: string
}

const EMPTY_FORM: VisitFormState = {
  labId: '',
  responsibleName: '',
  schoolName: '',
  studentCount: '',
  contactEmail: '',
  contactPhone: '',
}

interface NewLabFormState {
  sigla: string
  nome: string
  descricao: string
}

const EMPTY_NEW_LAB: NewLabFormState = { sigla: '', nome: '', descricao: '' }

export default function LabVisitsPage() {
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated' && !!session

  const [visitDate, setVisitDate] = useState('')
  const [shift, setShift] = useState<VisitShift>('MORNING')
  const [laboratories, setLaboratories] = useState<PublicLaboratory[]>([])
  const [loadingLabs, setLoadingLabs] = useState(true)

  // Seleção de laboratórios (tela autenticada / interna)
  const [selectedLabIds, setSelectedLabIds] = useState<string[]>([])
  const [confirming, setConfirming] = useState(false)

  // Formulário público de solicitação (tela visitante)
  const [form, setForm] = useState<VisitFormState>(EMPTY_FORM)
  const [submittingForm, setSubmittingForm] = useState(false)

  // Lista pública de visitas já confirmadas (LGPD: só os 5 campos permitidos)
  const [confirmedVisits, setConfirmedVisits] = useState<PublicLabVisit[]>([])
  const [loadingVisits, setLoadingVisits] = useState(false)

  // Visitas pendentes de aprovação (tela autenticada / interna)
  const [pendingVisits, setPendingVisits] = useState<StaffLabVisit[]>([])
  const [loadingPending, setLoadingPending] = useState(false)
  const [approvingId, setApprovingId] = useState<string | null>(null)

  // Cadastro de novos laboratórios (tela autenticada / interna)
  const [showAddLabForm, setShowAddLabForm] = useState(false)
  const [newLab, setNewLab] = useState<NewLabFormState>(EMPTY_NEW_LAB)
  const [addingLab, setAddingLab] = useState(false)

  const loadLaboratories = useCallback(async () => {
    setLoadingLabs(true)
    try {
      const params = new URLSearchParams()
      if (visitDate) params.set('date', visitDate)
      if (shift) params.set('shift', shift)

      const response = await fetch(`/api/lab-visits/laboratories?${params.toString()}`)
      const data = await response.json()
      if (response.ok) {
        setLaboratories(data.laboratories || [])
      }
    } catch (error) {
      console.error('Erro ao carregar laboratórios:', error)
    } finally {
      setLoadingLabs(false)
    }
  }, [visitDate, shift])

  useEffect(() => {
    loadLaboratories()
  }, [loadLaboratories])

  const loadConfirmedVisits = useCallback(async () => {
    setLoadingVisits(true)
    try {
      const response = await fetch('/api/lab-visits/public')
      const data = await response.json()
      if (response.ok) {
        setConfirmedVisits(data.visits || [])
      }
    } catch (error) {
      console.error('Erro ao carregar visitas confirmadas:', error)
    } finally {
      setLoadingVisits(false)
    }
  }, [])

  // A lista pública de visitas só faz sentido para quem não está logado
  // (é o mesmo público que preencheria o formulário de solicitação).
  useEffect(() => {
    if (!isAuthenticated) {
      loadConfirmedVisits()
    }
  }, [isAuthenticated, loadConfirmedVisits])

  const loadPendingVisits = useCallback(async () => {
    setLoadingPending(true)
    try {
      const response = await fetch('/api/lab-visits/pending')
      const data = await response.json()
      if (response.ok) {
        setPendingVisits(data.visits || [])
      }
    } catch (error) {
      console.error('Erro ao carregar visitas pendentes:', error)
    } finally {
      setLoadingPending(false)
    }
  }, [])

  // O painel de aprovação só existe para quem está logado.
  useEffect(() => {
    if (isAuthenticated) {
      loadPendingVisits()
    }
  }, [isAuthenticated, loadPendingVisits])

  const toggleLabSelection = (labId: string) => {
    setSelectedLabIds((prev) =>
      prev.includes(labId) ? prev.filter((id) => id !== labId) : [...prev, labId]
    )
  }

  const handleConfirmVisits = async () => {
    if (!visitDate) {
      toast.error('Selecione a data da visita antes de confirmar.')
      return
    }
    if (selectedLabIds.length === 0) {
      toast.error('Selecione ao menos um laboratório disponível para confirmar.')
      return
    }

    setConfirming(true)
    try {
      const response = await fetch('/api/lab-visits/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labIds: selectedLabIds, visitDate, shift }),
      })
      const data = await response.json()

      if (response.ok) {
        toast.success(
          `${data.requestedCount} laboratório(s) solicitado(s)! Aguardando aprovação.`
        )
        setSelectedLabIds([])
        loadLaboratories()
        loadPendingVisits()
      } else {
        toast.error(data.error || 'Erro ao confirmar visitas')
      }
    } catch (error) {
      console.error('Erro ao confirmar visitas:', error)
      toast.error('Erro ao confirmar visitas')
    } finally {
      setConfirming(false)
    }
  }

  const handleApprove = async (visitId: string) => {
    setApprovingId(visitId)
    try {
      const response = await fetch(`/api/lab-visits/${visitId}/approve`, { method: 'POST' })
      const data = await response.json()

      if (response.ok) {
        toast.success('Visita aprovada! Evento enviado ao Google Calendar.')
        setPendingVisits((prev) => prev.filter((visit) => visit.id !== visitId))
        loadLaboratories()
      } else {
        toast.error(data.error || 'Erro ao aprovar visita')
      }
    } catch (error) {
      console.error('Erro ao aprovar visita:', error)
      toast.error('Erro ao aprovar visita')
    } finally {
      setApprovingId(null)
    }
  }

  const handleAddLaboratory = async (e: FormEvent) => {
    e.preventDefault()

    if (!newLab.sigla || !newLab.nome || !newLab.descricao) {
      toast.error('Preencha sigla, nome e descrição do laboratório.')
      return
    }

    setAddingLab(true)
    try {
      const response = await fetch('/api/lab-visits/laboratories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLab),
      })
      const data = await response.json()

      if (response.ok) {
        toast.success('Laboratório adicionado com sucesso!')
        setNewLab(EMPTY_NEW_LAB)
        setShowAddLabForm(false)
        loadLaboratories()
      } else {
        toast.error(data.error || 'Erro ao adicionar laboratório')
      }
    } catch (error) {
      console.error('Erro ao adicionar laboratório:', error)
      toast.error('Erro ao adicionar laboratório')
    } finally {
      setAddingLab(false)
    }
  }

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!form.labId) {
      toast.error('Selecione um laboratório disponível.')
      return
    }
    if (!visitDate) {
      toast.error('Selecione a data da visita.')
      return
    }

    setSubmittingForm(true)
    try {
      const response = await fetch('/api/lab-visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          labId: form.labId,
          responsibleName: form.responsibleName,
          schoolName: form.schoolName,
          studentCount: Number(form.studentCount),
          visitDate,
          shift,
          contactEmail: form.contactEmail,
          contactPhone: form.contactPhone,
        }),
      })
      const data = await response.json()

      if (response.ok) {
        toast.success('Visita agendada com sucesso! Aguardamos vocês.')
        setForm(EMPTY_FORM)
        loadLaboratories()
        loadConfirmedVisits()
      } else {
        toast.error(data.error || 'Erro ao agendar visita')
      }
    } catch (error) {
      console.error('Erro ao agendar visita:', error)
      toast.error('Erro ao agendar visita')
    } finally {
      setSubmittingForm(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 py-8 px-4">
      <div className="container mx-auto max-w-5xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Agendamento de Visitas aos Laboratórios
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base">
            {isAuthenticated
              ? 'Confira a disponibilidade e confirme visitas diretamente.'
              : 'Escolas podem solicitar uma visita guiada aos nossos laboratórios.'}
          </p>
        </div>

        {/* Seleção de data/turno — usada tanto para calcular disponibilidade
            quanto como horário alvo da confirmação/solicitação */}
        <Card variant="glass">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="visitDate" className="block text-sm text-neutral-300 mb-1">
                  Data da visita
                </label>
                <input
                  id="visitDate"
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="input w-full"
                />
              </div>
              <div>
                <label htmlFor="shift" className="block text-sm text-neutral-300 mb-1">
                  Turno
                </label>
                <select
                  id="shift"
                  value={shift}
                  onChange={(e) => setShift(e.target.value as VisitShift)}
                  className="input w-full"
                >
                  {VISIT_SHIFTS.map((s) => (
                    <option key={s} value={s}>
                      {SHIFT_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards dos laboratórios — sigla, nome, descrição e disponibilidade */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-primary" />
              Laboratórios
            </h2>

            {/* Adicionar laboratório: opção exclusiva de quem está logado */}
            {isAuthenticated && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddLabForm((prev) => !prev)}
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Adicionar Laboratório
              </Button>
            )}
          </div>

          {isAuthenticated && showAddLabForm && (
            <Card variant="glass" className="mb-4">
              <CardContent className="p-4 sm:p-6">
                <form
                  onSubmit={handleAddLaboratory}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                  aria-label="Adicionar Laboratório"
                >
                  <div>
                    <label htmlFor="newLabSigla" className="block text-sm text-neutral-300 mb-1">
                      Sigla
                    </label>
                    <input
                      id="newLabSigla"
                      type="text"
                      required
                      value={newLab.sigla}
                      onChange={(e) => setNewLab((prev) => ({ ...prev, sigla: e.target.value }))}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="newLabNome" className="block text-sm text-neutral-300 mb-1">
                      Nome do laboratório
                    </label>
                    <input
                      id="newLabNome"
                      type="text"
                      required
                      value={newLab.nome}
                      onChange={(e) => setNewLab((prev) => ({ ...prev, nome: e.target.value }))}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="newLabDescricao"
                      className="block text-sm text-neutral-300 mb-1"
                    >
                      Descrição
                    </label>
                    <input
                      id="newLabDescricao"
                      type="text"
                      required
                      value={newLab.descricao}
                      onChange={(e) =>
                        setNewLab((prev) => ({ ...prev, descricao: e.target.value }))
                      }
                      className="input w-full"
                    />
                  </div>
                  <div className="sm:col-span-3 flex justify-end">
                    <Button type="submit" disabled={addingLab} loading={addingLab}>
                      Salvar laboratório
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {loadingLabs ? (
            <p className="text-neutral-400 text-sm">Carregando laboratórios...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {laboratories.map((lab) => {
                const isSelected = selectedLabIds.includes(lab.id)
                return (
                  <Card
                    key={lab.id}
                    variant="glass"
                    className={`border ${
                      isSelected ? 'border-primary' : 'border-transparent'
                    } ${!lab.available ? 'opacity-60' : ''}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-white">{lab.sigla}</CardTitle>
                          <p className="text-sm text-neutral-300">{lab.nome}</p>
                        </div>
                        {lab.available ? (
                          <span
                            data-testid={`lab-status-${lab.id}`}
                            className="flex items-center gap-1 text-xs font-medium text-success bg-success/10 border border-success/30 rounded-full px-2 py-1"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Disponível
                          </span>
                        ) : (
                          <span
                            data-testid={`lab-status-${lab.id}`}
                            className="flex items-center gap-1 text-xs font-medium text-error bg-error/10 border border-error/30 rounded-full px-2 py-1"
                          >
                            <XCircle className="h-3 w-3" />
                            Não disponível
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-neutral-400 mb-3">{lab.descricao}</p>

                      {isAuthenticated && (
                        <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={!lab.available}
                            onChange={() => toggleLabSelection(lab.id)}
                          />
                          Selecionar para confirmar
                        </label>
                      )}

                      {!isAuthenticated && (
                        <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
                          <input
                            type="radio"
                            name="labId"
                            checked={form.labId === lab.id}
                            disabled={!lab.available}
                            onChange={() => setForm((prev) => ({ ...prev, labId: lab.id }))}
                          />
                          Escolher este laboratório
                        </label>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
              {laboratories.length === 0 && (
                <p className="text-neutral-400 text-sm">Nenhum laboratório cadastrado.</p>
              )}
            </div>
          )}
        </div>

        {/* Estado autenticado: sem formulário nenhum no DOM, só o botão de
            confirmação direta dos laboratórios selecionados. */}
        {isAuthenticated && (
          <div className="flex justify-end">
            <Button onClick={handleConfirmVisits} disabled={confirming} loading={confirming}>
              Confirmar as visitas
            </Button>
          </div>
        )}

        {/* Painel de aprovação — só existe para quem está logado. Aprovar
            move a visita de PENDING para CONFIRMED e dispara o evento no
            Google Calendar (ver POST /api/lab-visits/[id]/approve). */}
        {isAuthenticated && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Visitas pendentes de aprovação
            </h2>
            {loadingPending ? (
              <p className="text-neutral-400 text-sm">Carregando...</p>
            ) : pendingVisits.length === 0 ? (
              <p className="text-neutral-400 text-sm">Nenhuma visita aguardando aprovação.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pendingVisits.map((visit) => (
                  <Card key={visit.id} variant="glass">
                    <CardContent className="p-4 text-sm text-neutral-300 space-y-1">
                      <p className="text-white font-medium">
                        {visit.lab.sigla} — {visit.schoolName}
                      </p>
                      <p>Responsável: {visit.responsibleName}</p>
                      <p>Contato: {visit.contactEmail}</p>
                      <p>Alunos: {visit.studentCount}</p>
                      <p>
                        {new Date(visit.visitDate).toLocaleDateString('pt-BR')} —{' '}
                        {SHIFT_LABELS[visit.shift as VisitShift] || visit.shift}
                      </p>
                      <div className="pt-2">
                        <Button
                          size="sm"
                          data-testid={`approve-visit-${visit.id}`}
                          onClick={() => handleApprove(visit.id)}
                          disabled={approvingId === visit.id}
                          loading={approvingId === visit.id}
                        >
                          Aprovar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Estado visitante: formulário completo de solicitação */}
        {!isAuthenticated && (
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-white">Agendar Visita</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4" aria-label="Agendar Visita">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="responsibleName" className="block text-sm text-neutral-300 mb-1">
                      Nome do responsável
                    </label>
                    <input
                      id="responsibleName"
                      type="text"
                      required
                      value={form.responsibleName}
                      onChange={(e) => setForm((prev) => ({ ...prev, responsibleName: e.target.value }))}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="schoolName" className="block text-sm text-neutral-300 mb-1">
                      Nome da escola
                    </label>
                    <input
                      id="schoolName"
                      type="text"
                      required
                      value={form.schoolName}
                      onChange={(e) => setForm((prev) => ({ ...prev, schoolName: e.target.value }))}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="studentCount" className="block text-sm text-neutral-300 mb-1">
                      Quantidade de alunos
                    </label>
                    <input
                      id="studentCount"
                      type="number"
                      min={1}
                      required
                      value={form.studentCount}
                      onChange={(e) => setForm((prev) => ({ ...prev, studentCount: e.target.value }))}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="contactEmail" className="block text-sm text-neutral-300 mb-1">
                      Email para contato
                    </label>
                    <input
                      id="contactEmail"
                      type="email"
                      required
                      value={form.contactEmail}
                      onChange={(e) => setForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="contactPhone" className="block text-sm text-neutral-300 mb-1">
                      Telefone para contato
                    </label>
                    <input
                      id="contactPhone"
                      type="tel"
                      required
                      value={form.contactPhone}
                      onChange={(e) => setForm((prev) => ({ ...prev, contactPhone: e.target.value }))}
                      className="input w-full"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={submittingForm} loading={submittingForm}>
                  Agendar Visita
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Lista pública de visitas confirmadas — LGPD: só os 5 campos
            permitidos chegam do servidor, nada de email/telefone aqui. */}
        {!isAuthenticated && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Visitas já confirmadas
            </h2>
            {loadingVisits ? (
              <p className="text-neutral-400 text-sm">Carregando...</p>
            ) : confirmedVisits.length === 0 ? (
              <p className="text-neutral-400 text-sm">Nenhuma visita confirmada ainda.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {confirmedVisits.map((visit, index) => (
                  <Card key={index} variant="glass">
                    <CardContent className="p-4 text-sm text-neutral-300 space-y-1">
                      <p className="text-white font-medium">{visit.schoolName}</p>
                      <p>Responsável: {visit.responsibleName}</p>
                      <p>Alunos: {visit.studentCount}</p>
                      <p>
                        {new Date(visit.visitDate).toLocaleDateString('pt-BR')} —{' '}
                        {SHIFT_LABELS[visit.shift as VisitShift] || visit.shift}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
