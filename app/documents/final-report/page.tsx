'use client'

/* eslint-disable jsx-a11y/label-has-associated-control */

import { useRef, useEffect, useState } from 'react'
import { ArrowLeft, Save, FileText, Download, User, BookOpen, Star, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { getDraft, saveDraft } from '@/lib/form-drafts'
import { toast } from 'sonner'
import {
  maskCNPJ,
  maskPhone,
} from '@/lib/input-masks'

import type { FinalReportData } from '@/lib/pdf-templates/final-report.pdf'

export default function FinalReportPage() {
  const formRef = useRef<HTMLFormElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<FinalReportData>>({
    eval_auto: {},
    eval_supervisor: {},
  })

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await getDraft('final-report')
      if (draft) {
        setFormData(draft as Partial<FinalReportData>)
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

    if (name.startsWith('eval_auto.')) {
      const key = name.split('.')[1]
      setFormData((prev: Partial<FinalReportData>) => ({
        ...prev,
        eval_auto: { ...(prev.eval_auto || {}), [key]: value }
      }))
    } else if (name.startsWith('eval_supervisor.')) {
      const key = name.split('.')[1]
      setFormData((prev: Partial<FinalReportData>) => ({
        ...prev,
        eval_supervisor: { ...(prev.eval_supervisor || {}), [key]: value }
      }))
    } else {
      setFormData((prev: Partial<FinalReportData>) => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : maskedValue }))
    }
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    await saveDraft('final-report', formData)
    toast.success('Rascunho salvo com sucesso!')
    setIsSaving(false)
  }

  const handleGeneratePDF = async () => {
    try {
      toast.loading('Gerando PDF...', { id: 'pdf-generation' })
      const { buildFinalReportDoc } = await import('@/lib/pdf-templates/final-report.pdf')
      const { generatePDF } = await import('@/lib/pdfmake-base-service')
      
      const doc = await buildFinalReportDoc(formData as FinalReportData)
      await generatePDF(doc, { filename: 'relatorio-final-estagio.pdf' })
      toast.success('PDF gerado com sucesso!', { id: 'pdf-generation' })
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toast.error('Erro ao gerar PDF. Tente novamente.', { id: 'pdf-generation' })
    }
  }

  const autoEvalItems = [
    { key: 'assiduidade', label: 'Assiduidade' },
    { key: 'atendimento_orientacoes', label: 'Atendimento às Orientações' },
    { key: 'comunicacao', label: 'Comunicação' },
    { key: 'cooperacao', label: 'Cooperação' },
    { key: 'disciplina', label: 'Disciplina' },
    { key: 'conhecimento_adquirido', label: 'Conhecimento Adquirido' },
    { key: 'pontualidade', label: 'Pontualidade' },
    { key: 'proatividade', label: 'Proatividade' },
    { key: 'produtividade', label: 'Produtividade' },
    { key: 'qualidade_desempenho', label: 'Qualidade no Desempenho' },
    { key: 'relacionamento_interpessoal', label: 'Relacionamento Interpessoal' },
    { key: 'responsabilidade', label: 'Responsabilidade' },
  ]

  const supervisorEvalItems = [
    { key: 'acompanhamento', label: 'Acompanhamento e Supervisão' },
    { key: 'colaboracao_plano', label: 'Colaboração no Plano' },
    { key: 'comunicacao_discente', label: 'Comunicação com o Discente' },
    { key: 'comunicacao_orientador', label: 'Comunicação com o Orientador' },
    { key: 'instrucoes', label: 'Instruções e Ensinamentos' },
    { key: 'prazos', label: 'Entrega nos Prazos' },
    { key: 'relacionamento', label: 'Relacionamento Interpessoal' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link href="/employee" className="flex items-center text-primary hover:text-primary/80 transition-colors font-medium group">
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
              Gerar Relatório Final PDF
            </Button>
          </div>
        </div>

        {/* Title */}
        <Card variant="glass" className="border-t-4 border-primary">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-xl">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Relatório Final de Estágio Obrigatório</CardTitle>
                <p className="text-neutral-400 text-sm mt-1">Conformidade Institucional IFCE Maracanaú</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <form ref={formRef} className="space-y-6 pb-20">
          {/* Section 1: Capa e Identificação */}
          <Card variant="elevated">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Capa e Identificação
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">Nome Completo do Discente</label>
                <input name="student_name" className="input w-full" value={formData.student_name || ''} onChange={handleInputChange} placeholder="Nome do Discente" title="Nome Completo do Discente" />
              </div>
              <div>
                <label className="label">Campus</label>
                <input name="campus" className="input w-full" value={formData.campus || ''} onChange={handleInputChange} placeholder="Ex: Maracanaú" title="Campus" />
              </div>
              <div>
                <label className="label">Curso</label>
                <input name="course" className="input w-full" value={formData.course || ''} onChange={handleInputChange} placeholder="Nome do Curso" title="Curso" />
              </div>
              <div>
                <label className="label">Docente Orientador</label>
                <input name="advisor_name" className="input w-full" value={formData.advisor_name || ''} onChange={handleInputChange} placeholder="Nome do Docente Orientador" title="Docente Orientador" />
              </div>
              <div>
                <label className="label">Local (Cidade)</label>
                <input name="local" className="input w-full" value={formData.local || ''} onChange={handleInputChange} placeholder="Ex: Maracanaú" title="Local (Cidade)" />
              </div>
              <div>
                <label className="label">Ano</label>
                <input name="ano" className="input w-full" value={formData.ano || ''} onChange={handleInputChange} placeholder="2024" title="Ano" />
              </div>
              <div className="md:col-span-2 mt-4 pt-4 border-t border-white/5">
                <h4 className="text-sm font-bold text-neutral-400 mb-4">DADOS DA CONCEDENTE</h4>
              </div>
              <div className="md:col-span-2">
                <label className="label">Razão Social</label>
                <input name="company_name" className="input w-full" value={formData.company_name || ''} onChange={handleInputChange} placeholder="Razão Social da Concedente" title="Razão Social" />
              </div>
              <div>
                <label className="label">Supervisor do Estágio</label>
                <input name="supervisor_name" className="input w-full" value={formData.supervisor_name || ''} onChange={handleInputChange} placeholder="Nome do Supervisor" title="Supervisor do Estágio" />
              </div>
              <div>
                <label className="label">Setor de Realização</label>
                <input name="internship_sector" className="input w-full" value={formData.internship_sector || ''} onChange={handleInputChange} placeholder="Setor de Realização" title="Setor de Realização" />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Resumo */}
          <Card variant="elevated">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> Resumo e Palavras-chave
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="label">Resumo (Máx 250 palavras)</label>
                <textarea name="resumo" rows={6} className="input w-full" value={formData.resumo || ''} onChange={handleInputChange} placeholder="Expressar de forma concisa os pontos relevantes tratados no relatório..." title="Resumo" />
              </div>
              <div>
                <label className="label">Palavras-chave</label>
                <input name="palavras_chave" className="input w-full" value={formData.palavras_chave || ''} onChange={handleInputChange} placeholder="Palavra 1, Palavra 2, Palavra 3" title="Palavras-chave" />
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Desenvolvimento */}
          <Card variant="elevated">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" /> Desenvolvimento
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-xs text-neutral-500 italic">Descreva a estrutura da concedente, atividades realizadas, resultados alcançados, dificuldades e soluções encontradas.</p>
              <textarea name="desenvolvimento_text" rows={12} className="input w-full" value={formData.desenvolvimento_text || ''} onChange={handleInputChange} placeholder="Desenvolvimento do Relatório" title="Desenvolvimento" />
            </CardContent>
          </Card>

          {/* Section 4: Avaliações */}
          <Card variant="elevated">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" /> Auto Avaliação e Supervisão
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              {/* Auto Eval */}
              <div>
                <h4 className="text-sm font-bold text-primary mb-4 uppercase tracking-wider">Auto Avaliação do Discente</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                  {autoEvalItems.map(item => (
                    <div key={item.key} className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-sm text-neutral-300">{item.label}</span>
                      <select name={`eval_auto.${item.key}`} className="bg-neutral-800 border-none rounded px-2 py-1 text-sm text-primary font-bold" value={formData.eval_auto?.[item.key] || ''} onChange={handleInputChange} title={`Auto Avaliação: ${item.label}`}>
                        <option value="">-</option>
                        <option value="insuficiente">Insuf.</option>
                        <option value="regular">Reg.</option>
                        <option value="bom">Bom</option>
                        <option value="otimo">Ótimo</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Supervisor Eval */}
              <div>
                <h4 className="text-sm font-bold text-primary mb-4 uppercase tracking-wider">Avaliação da Supervisão</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                  {supervisorEvalItems.map(item => (
                    <div key={item.key} className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-sm text-neutral-300">{item.label}</span>
                      <select name={`eval_supervisor.${item.key}`} className="bg-neutral-800 border-none rounded px-2 py-1 text-sm text-primary font-bold" value={formData.eval_supervisor?.[item.key] || ''} onChange={handleInputChange} title={`Avaliação da Supervisão: ${item.label}`}>
                        <option value="">-</option>
                        <option value="insuficiente">Insuf.</option>
                        <option value="regular">Reg.</option>
                        <option value="bom">Bom</option>
                        <option value="otimo">Ótimo</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Considerações Finais */}
          <Card variant="elevated">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Considerações Finais
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="label">Opinião sobre a Importância e Desafios</label>
                <textarea name="consideracoes_finais" rows={6} className="input w-full" value={formData.consideracoes_finais || ''} onChange={handleInputChange} placeholder="Considerações Finais" title="Considerações Finais" />
              </div>
              <div>
                <label className="label">Indicação de Áreas de Conhecimento (Matriz)</label>
                <textarea name="consideracoes_matriz" rows={4} className="input w-full" value={formData.consideracoes_matriz || ''} onChange={handleInputChange} placeholder="Citar disciplinas e conhecimentos teóricos aplicados..." title="Matriz de Conhecimento" />
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
