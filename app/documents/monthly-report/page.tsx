'use client'

import { useRef, useEffect, useState } from 'react'
import { ArrowLeft, Save, FileText, Download, Calendar, Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { getDraft, saveDraft } from '@/lib/form-drafts'
import { toast } from 'sonner'

export default function MonthlyReportPage() {
  const formRef = useRef<HTMLFormElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    student_name: '',
    supervisor_name: '',
    advisor_name: '',
    period_start: '',
    period_end: '',
    hours_month: '',
    hours_total: '',
    activities: '',
    difficulties: '',
    solutions: ''
  })

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await getDraft('monthly-report')
      if (draft) {
        setFormData(draft as typeof formData)
        toast.success('Rascunho carregado!')
      }
    }
    loadDraft()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    await saveDraft('monthly-report', formData)
    toast.success('Rascunho salvo com sucesso!')
    setIsSaving(false)
  }

  const handleGeneratePDF = () => {
    toast.info('Funcionalidade em desenvolvimento')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/employee"
            className="flex items-center text-primary hover:text-primary/80 transition-colors font-medium group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Voltar
          </Link>

          <div className="flex gap-3">
            <Button
              onClick={handleSaveDraft}
              variant="secondary"
              size="sm"
              disabled={isSaving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Salvando...' : 'Salvar Rascunho'}
            </Button>
            <Button
              onClick={handleGeneratePDF}
              variant="primary"
              size="sm"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Gerar PDF
            </Button>
          </div>
        </div>

        {/* Title Card */}
        <Card variant="glass" className="border-t-4 border-primary">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 rounded-xl">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Relatório Mensal de Atividades</CardTitle>
                <p className="text-neutral-400 text-sm mt-1">
                  Descreva as atividades desenvolvidas durante o mês de estágio
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <form ref={formRef} className="space-y-6">
          {/* Seção 1: Identificação */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold">
                  1
                </span>
                Identificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Nome do Estagiário(a)
                </label>
                <input
                  type="text"
                  name="student_name"
                  value={formData.student_name}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="Digite seu nome completo"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Supervisor (Empresa)
                  </label>
                  <input
                    type="text"
                    name="supervisor_name"
                    value={formData.supervisor_name}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="Nome do supervisor na empresa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Orientador (IFCE)
                  </label>
                  <input
                    type="text"
                    name="advisor_name"
                    value={formData.advisor_name}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="Nome do orientador no IFCE"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seção 2: Período e Carga Horária */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold">
                  2
                </span>
                Período e Carga Horária
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Período de Referência
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Data Inicial</label>
                    <input
                      type="date"
                      name="period_start"
                      value={formData.period_start}
                      onChange={handleChange}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Data Final</label>
                    <input
                      type="date"
                      name="period_end"
                      value={formData.period_end}
                      onChange={handleChange}
                      className="input w-full"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Carga Horária
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Horas no Mês</label>
                    <input
                      type="number"
                      name="hours_month"
                      value={formData.hours_month}
                      onChange={handleChange}
                      className="input w-full"
                      placeholder="Ex: 80"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Horas Acumuladas</label>
                    <input
                      type="number"
                      name="hours_total"
                      value={formData.hours_total}
                      onChange={handleChange}
                      className="input w-full"
                      placeholder="Ex: 240"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seção 3: Atividades Desenvolvidas */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold">
                  3
                </span>
                Atividades Desenvolvidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Principais Atividades Desenvolvidas
                </label>
                <textarea
                  name="activities"
                  value={formData.activities}
                  onChange={handleChange}
                  rows={6}
                  className="input w-full resize-y"
                  placeholder="Descreva as principais atividades que você realizou durante este mês..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Dificuldades Encontradas
                </label>
                <textarea
                  name="difficulties"
                  value={formData.difficulties}
                  onChange={handleChange}
                  rows={4}
                  className="input w-full resize-y"
                  placeholder="Descreva as dificuldades que você enfrentou..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Soluções Adotadas
                </label>
                <textarea
                  name="solutions"
                  value={formData.solutions}
                  onChange={handleChange}
                  rows={4}
                  className="input w-full resize-y"
                  placeholder="Descreva as soluções que foram adotadas para superar as dificuldades..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-4 pb-8">
            <Button
              type="button"
              variant="secondary"
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Salvando...' : 'Salvar Rascunho'}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleGeneratePDF}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Gerar PDF Oficial
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
