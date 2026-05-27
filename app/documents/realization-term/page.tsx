'use client'

/* eslint-disable jsx-a11y/label-has-associated-control */

import { useRef, useEffect, useState } from 'react'
import {
  ArrowLeft,
  Save,
  FileText,
  Download,
  CheckCircle,
  User,
  Building2,
  Calendar,
  Star,
  ClipboardList,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { getDraft, saveDraft } from '@/lib/form-drafts'
import { toast } from 'sonner'
import { maskCNPJ, maskPhone } from '@/lib/input-masks'

import type { RealizationTermData } from '@/lib/pdf-templates/realization-term.pdf'

export default function RealizationTermPage() {
  const formRef = useRef<HTMLFormElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<RealizationTermData>>({
    traits: {},
    tracking_student: {},
    tracking_supervisor_advisor: {},
  })

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await getDraft('realization-term')
      if (draft) {
        setFormData(draft as Partial<RealizationTermData>)
        toast.success('Rascunho carregado!')
      }
    }
    loadDraft()
  }, [])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    let maskedValue = value

    if (name.includes('cnpj')) maskedValue = maskCNPJ(value)
    if (name.includes('phone')) maskedValue = maskPhone(value)

    if (name.startsWith('traits.')) {
      const key = name.split('.')[1]
      setFormData((prev) => ({
        ...prev,
        traits: { ...(prev.traits || {}), [key]: parseInt(value, 10) },
      }))
    } else if (name.startsWith('tracking_student.')) {
      const key = name.split('.')[1]
      setFormData((prev) => ({
        ...prev,
        tracking_student: {
          ...(prev.tracking_student || {}),
          [key]: (e.target as HTMLInputElement).checked,
        },
      }))
    } else if (name.startsWith('tracking_supervisor_advisor.')) {
      const key = name.split('.')[1]
      setFormData((prev) => ({
        ...prev,
        tracking_supervisor_advisor: {
          ...(prev.tracking_supervisor_advisor || {}),
          [key]: (e.target as HTMLInputElement).checked,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : maskedValue,
      }))
    }
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    await saveDraft('realization-term', formData)
    toast.success('Rascunho salvo com sucesso!')
    setIsSaving(false)
  }

  const handleGeneratePDF = async () => {
    try {
      toast.loading('Gerando PDF...', { id: 'pdf-generation' })
      const { buildRealizationTermDoc } = await import('@/lib/pdf-templates/realization-term.pdf')
      const { generatePDF } = await import('@/lib/pdfmake-base-service')

      const doc = await buildRealizationTermDoc(formData as RealizationTermData)
      await generatePDF(doc, { filename: 'termo-realizacao-estagio.pdf' })
      toast.success('PDF gerado com sucesso!', { id: 'pdf-generation' })
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toast.error('Erro ao gerar PDF. Tente novamente.', { id: 'pdf-generation' })
    }
  }

  const evaluationTraits = [
    { key: 'assiduidade', label: 'Assiduidade' },
    { key: 'atendimento_orientacoes', label: 'Atendimento às Orientações' },
    { key: 'comunicacao', label: 'Comunicação' },
    { key: 'cooperacao', label: 'Cooperação' },
    { key: 'disciplina', label: 'Disciplina' },
    { key: 'conhecimento_adquirido', label: 'Conhecimento Adquirido' },
    { key: 'pontualidade', label: 'Pontualidade' },
    { key: 'pontualidade_documentos', label: 'Pontualidade na Entrega de Documentos' },
    { key: 'proatividade', label: 'Proatividade' },
    { key: 'produtividade', label: 'Produtividade' },
    { key: 'qualidade_desempenho', label: 'Qualidade no Desempenho' },
    { key: 'relacionamento_interpessoal', label: 'Relacionamento Interpessoal' },
    { key: 'responsabilidade', label: 'Responsabilidade' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/employee"
            className="flex items-center text-primary hover:text-primary/80 transition-colors font-medium group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Voltar ao Dashboard
          </Link>
          <div className="flex gap-3">
            <Button onClick={handleSaveDraft} variant="secondary" size="sm" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar Rascunho'}
            </Button>
            <Button onClick={handleGeneratePDF} variant="primary" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Gerar Termo de Realização PDF
            </Button>
          </div>
        </div>

        {/* Title */}
        <Card variant="glass" className="border-t-4 border-primary">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-xl">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Termo de Realização de Estágio</CardTitle>
                <p className="text-neutral-400 text-sm mt-1">
                  Conformidade Institucional IFCE Maracanaú
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <form ref={formRef} className="space-y-6 pb-20">
          {/* Identificação */}
          <Card variant="elevated">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Identificação
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">Nome do Discente</label>
                <input
                  name="student_name"
                  className="input w-full"
                  value={formData.student_name || ''}
                  onChange={handleInputChange}
                  placeholder="Nome Completo"
                  title="Nome do Discente"
                />
              </div>
              <div>
                <label className="label">Curso</label>
                <input
                  name="student_course"
                  className="input w-full"
                  value={formData.student_course || ''}
                  onChange={handleInputChange}
                  placeholder="Nome do Curso"
                  title="Curso"
                />
              </div>
              <div>
                <label className="label">Matrícula</label>
                <input
                  name="student_enrollment"
                  className="input w-full"
                  value={formData.student_enrollment || ''}
                  onChange={handleInputChange}
                  placeholder="Número da Matrícula"
                  title="Matrícula"
                />
              </div>
              <div>
                <label className="label">Docente Orientador</label>
                <input
                  name="advisor_name"
                  className="input w-full"
                  value={formData.advisor_name || ''}
                  onChange={handleInputChange}
                  placeholder="Nome do Orientador"
                  title="Docente Orientador"
                />
              </div>
            </CardContent>
          </Card>

          {/* Dados da Concedente */}
          <Card variant="elevated">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" /> Concedente
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">Razão Social</label>
                <input
                  name="company_name"
                  className="input w-full"
                  value={formData.company_name || ''}
                  onChange={handleInputChange}
                  placeholder="Razão Social da Empresa"
                  title="Razão Social"
                />
              </div>
              <div>
                <label className="label">CNPJ</label>
                <input
                  name="company_cnpj"
                  className="input w-full"
                  value={formData.company_cnpj || ''}
                  onChange={handleInputChange}
                  placeholder="00.000.000/0000-00"
                  title="CNPJ"
                />
              </div>
              <div>
                <label className="label">Supervisor do Estágio</label>
                <input
                  name="company_supervisor"
                  className="input w-full"
                  value={formData.company_supervisor || ''}
                  onChange={handleInputChange}
                  placeholder="Nome do Supervisor"
                  title="Supervisor do Estágio"
                />
              </div>
              <div>
                <label className="label">DDD + Telefone do Supervisor</label>
                <input
                  name="company_supervisor_phone"
                  className="input w-full"
                  value={formData.company_supervisor_phone || ''}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
                  title="Telefone do Supervisor"
                />
              </div>
            </CardContent>
          </Card>

          {/* Período e Carga Horária */}
          <Card variant="elevated">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Período e Carga Horária
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Data de Início</label>
                <input
                  type="date"
                  name="start_date"
                  className="input w-full"
                  value={formData.start_date || ''}
                  onChange={handleInputChange}
                  title="Data de Início"
                />
              </div>
              <div>
                <label className="label">Data de Término</label>
                <input
                  type="date"
                  name="end_date"
                  className="input w-full"
                  value={formData.end_date || ''}
                  onChange={handleInputChange}
                  title="Data de Término"
                />
              </div>
              <div>
                <label className="label">Horas Realizadas</label>
                <input
                  type="number"
                  name="realized_hours"
                  className="input w-full"
                  value={formData.realized_hours || ''}
                  onChange={handleInputChange}
                  placeholder="Ex: 400"
                  title="Horas Realizadas"
                />
              </div>
            </CardContent>
          </Card>

          {/* Acompanhamento */}
          <Card variant="elevated">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" /> Acompanhamento do Estágio
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Avaliação de desempenho do discente */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-neutral-300 mb-3">
                    Avaliação de Desempenho do Discente realizada através de:
                  </p>
                  {([
                    ['meetings', 'Reunião(ões)'],
                    ['reports', 'Relatório(s)'],
                    ['observation', 'Observação(ões)'],
                    ['other', 'Outro(s) meio(s)'],
                  ] as const).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name={`tracking_student.${key}`}
                        checked={formData.tracking_student?.[key] || false}
                        onChange={handleInputChange}
                        className="checkbox"
                      />
                      <span className="text-sm text-neutral-300">{label}</span>
                    </label>
                  ))}
                  {formData.tracking_student?.other && (
                    <input
                      type="text"
                      name="tracking_student.other_text"
                      className="input w-full mt-1"
                      value={formData.tracking_student?.other_text || ''}
                      onChange={handleInputChange}
                      placeholder="Especifique o meio"
                      title="Outro meio de acompanhamento"
                    />
                  )}
                </div>

                {/* Comunicação supervisor–orientador */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-neutral-300 mb-3">
                    Comunicação entre Supervisor e Docente Orientador realizada através de:
                  </p>
                  {([
                    ['meetings', 'Reunião(ões)'],
                    ['phone', 'Telefone'],
                    ['visit', 'Visita(s)'],
                    ['other', 'Outro(s) meio(s)'],
                  ] as const).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name={`tracking_supervisor_advisor.${key}`}
                        checked={formData.tracking_supervisor_advisor?.[key] || false}
                        onChange={handleInputChange}
                        className="checkbox"
                      />
                      <span className="text-sm text-neutral-300">{label}</span>
                    </label>
                  ))}
                  {formData.tracking_supervisor_advisor?.other && (
                    <input
                      type="text"
                      name="tracking_supervisor_advisor.other_text"
                      className="input w-full mt-1"
                      value={formData.tracking_supervisor_advisor?.other_text || ''}
                      onChange={handleInputChange}
                      placeholder="Especifique o meio"
                      title="Outro meio de comunicação"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Atividades */}
          <Card variant="elevated">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" /> Atividades Desenvolvidas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <textarea
                name="activities_text"
                rows={8}
                className="input w-full"
                value={formData.activities_text || ''}
                onChange={handleInputChange}
                placeholder="Descreva as principais atividades realizadas durante o período de estágio..."
                title="Atividades Desenvolvidas"
              />
            </CardContent>
          </Card>

          {/* Avaliação das Características */}
          <Card variant="elevated">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" /> Avaliação do Desempenho
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <label className="label block mb-4 font-bold text-primary italic">
                  Conceitos: 1-Insuficiente, 2-Regular, 3-Bom, 4-Ótimo
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                  {evaluationTraits.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between py-2 border-b border-white/5"
                    >
                      <span className="text-sm text-neutral-300">{item.label}</span>
                      <select
                        name={`traits.${item.key}`}
                        className="bg-neutral-800 border-none rounded px-2 py-1 text-sm text-primary font-bold"
                        value={formData.traits?.[item.key as keyof typeof formData.traits] || ''}
                        onChange={handleInputChange}
                        title={`Avaliação: ${item.label}`}
                      >
                        <option value="">-</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <label className="label">Avaliação Geral</label>
                <select
                  name="overall_evaluation"
                  className="input w-full"
                  value={formData.overall_evaluation || ''}
                  onChange={handleInputChange}
                  title="Avaliação Geral"
                >
                  <option value="">Selecione uma opção</option>
                  <option value="insuficiente">Insuficiente</option>
                  <option value="regular">Regular</option>
                  <option value="bom">Bom</option>
                  <option value="otimo">Ótimo</option>
                </select>
              </div>

              <div>
                <label className="label">Sugestões para o IFCE</label>
                <textarea
                  name="suggestions"
                  rows={4}
                  className="input w-full"
                  value={formData.suggestions || ''}
                  onChange={handleInputChange}
                  placeholder="Sugestões para melhorar a qualificação profissional..."
                  title="Sugestões para o IFCE"
                />
              </div>
            </CardContent>
          </Card>

          {/* Rodapé e Datas */}
          <Card variant="elevated">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg">Local e Datas</CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Cidade</label>
                <input
                  name="city"
                  className="input w-full"
                  value={formData.city || ''}
                  onChange={handleInputChange}
                  placeholder="Maracanaú"
                  title="Cidade"
                />
              </div>
              <div>
                <label className="label">Data da Supervisão</label>
                <input
                  type="date"
                  name="supervisor_date"
                  className="input w-full"
                  value={formData.supervisor_date || ''}
                  onChange={handleInputChange}
                  title="Data da Supervisão"
                />
              </div>
              <div>
                <label className="label">Data de Ciência do Discente</label>
                <input
                  type="date"
                  name="student_aware_date"
                  className="input w-full"
                  value={formData.student_aware_date || ''}
                  onChange={handleInputChange}
                  title="Data de Ciência do Discente"
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
