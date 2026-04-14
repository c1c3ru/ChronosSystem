'use client'

/* eslint-disable jsx-a11y/label-has-associated-control */

import { useRef, useEffect, useState } from 'react'
import { ArrowLeft, Save, FileText, Download } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { getDraft, saveDraft, populateFormWithData } from '@/lib/form-drafts'
import { toast } from 'sonner'
import {
  maskCPF,
  maskRG,
  maskCTPS,
  maskCNPJ,
  maskCEP,
  maskPhone,
  maskCurrency,
} from '@/lib/input-masks'

export default function FinalReportPage() {
  const formRef = useRef<HTMLFormElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await getDraft('final-report')
      if (draft) {
        if (formRef.current) {
          populateFormWithData(formRef.current, draft)
        }
        setFormData(draft)
        toast.success('Rascunho carregado!')
      }
    }
    loadDraft()
  }, [])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    let maskedValue = value

    // Aplicar máscaras baseado no nome do campo
    if (name.includes('cpf')) {
      maskedValue = maskCPF(value)
    } else if (name.includes('rg')) {
      maskedValue = maskRG(value)
    } else if (name.includes('ctps') || name.includes('carteira')) {
      maskedValue = maskCTPS(value)
    } else if (name.includes('cnpj')) {
      maskedValue = maskCNPJ(value)
    } else if (name.includes('zip') || name.includes('cep')) {
      maskedValue = maskCEP(value)
    } else if (name.includes('phone') || name.includes('telefone')) {
      maskedValue = maskPhone(value)
    } else if (name.includes('value') || name.includes('valor')) {
      maskedValue = maskCurrency(value)
    }

    // Atualizar o valor do input com a máscara
    if (maskedValue !== value && e.target instanceof HTMLInputElement) {
      e.target.value = maskedValue
    }

    // Tratamento especial para checkboxes e radio buttons
    const { type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev: any) => ({ ...prev, [name]: checked ? value : '' }))
    } else if (type === 'radio') {
      // Radio buttons: sempre salvar o value quando selecionado
      setFormData((prev: any) => ({ ...prev, [name]: value }))
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: maskedValue }))
    }
  }

  const handleSaveDraft = async () => {
    if (!formRef.current) return

    setIsSaving(true)
    // Usar o estado formData em vez de FormData para capturar radio buttons e checkboxes
    const data: any = { ...formData }

    await saveDraft('final-report', data)
    toast.success('Rascunho salvo com sucesso!')
    setIsSaving(false)
  }

  const handleGeneratePDF = async () => {
    try {
      toast.loading('Gerando PDF...', { id: 'pdf-generation' })

      const raw: any = { ...formData }
      const { generateHTMLPDF, buildFinalReportHTML } = await import('@/lib/pdf-generator-html')

      const htmlData = {
        nome_estudante: raw.student_name || '',
        matricula_estudante: raw.student_enrollment || '',
        curso_estudante: raw.student_course || '',
        empresa_nome: raw.company_name || '',
        empresa_cnpj: raw.company_cnpj || '',
        setor_supervisor: raw.supervisor_department || '',
        nome_supervisor: raw.supervisor_name || '',
        cargo_supervisor: raw.supervisor_role || '',
        horas_total: raw.total_hours || '',
        inicio_estagio: raw.start_date || '',
        fim_estagio: raw.end_date || '',
        nome_orientador: raw.advisor_name || '',
        atividades: raw.activities || raw.atividades_desenvolvidas || '',
        competencias: raw.competencies || raw.aprendizados || '',
        avaliacao: raw.evaluation || raw.avaliacao_geral || '',
        conclusao: raw.conclusion || raw.contribuicoes || '',
      }

      const html = buildFinalReportHTML(htmlData)
      await generateHTMLPDF(html, 'relatorio-final.pdf')

      toast.success('PDF gerado com sucesso!', { id: 'pdf-generation' })
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toast.error('Erro ao gerar PDF. Tente novamente.', { id: 'pdf-generation' })
    }
  }

  const evaluationCriteria = [
    { key: 'eval_assiduity', label: 'Assiduidade' },
    { key: 'eval_punctuality', label: 'Pontualidade' },
    { key: 'eval_responsibility', label: 'Responsabilidade' },
    { key: 'eval_discipline', label: 'Disciplina' },
    { key: 'eval_cooperation', label: 'Cooperação' },
    { key: 'eval_initiative', label: 'Iniciativa' },
    { key: 'eval_proactivity', label: 'Proatividade' },
    { key: 'eval_communication', label: 'Comunicação' },
    { key: 'eval_relationship', label: 'Relacionamento Interpessoal' },
    { key: 'eval_technical_knowledge', label: 'Conhecimento Técnico' },
    { key: 'eval_learning_capacity', label: 'Capacidade de Aprendizagem' },
    { key: 'eval_productivity', label: 'Produtividade' },
    { key: 'eval_quality', label: 'Qualidade do Trabalho' },
    { key: 'eval_organization', label: 'Organização' },
    { key: 'eval_creativity', label: 'Criatividade' },
  ]

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
            <Button onClick={handleSaveDraft} variant="secondary" size="sm" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar Rascunho'}
            </Button>
            <Button onClick={handleGeneratePDF} variant="primary" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Gerar PDF
            </Button>
          </div>
        </div>

        <Card variant="glass" className="border-t-4 border-primary">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 rounded-xl">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Relatório Final de Atividades</CardTitle>
                <p className="text-neutral-400 text-sm mt-1">
                  Avaliação final do desempenho do estagiário
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <form
          ref={formRef}
          className="space-y-6"
          onChange={() => {
            if (formRef.current) {
              const data = new FormData(formRef.current)
              setFormData(Object.fromEntries(data.entries()))
            }
          }}
        >
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg">Identificação e Período</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Nome do Discente
                  </label>
                  <input
                    type="text"
                    name="student_name"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Nome do Discente"
                    placeholder="Nome Completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Curso</label>
                  <input
                    type="text"
                    name="student_course"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Curso"
                    placeholder="Nome do Curso"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Matrícula
                  </label>
                  <input
                    type="text"
                    name="student_enrollment"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Matrícula"
                    placeholder="Número da Matrícula"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Supervisor do Estágio
                  </label>
                  <input
                    type="text"
                    name="supervisor_name"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Supervisor do Estágio"
                    placeholder="Nome do Supervisor"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Docente Orientador
                  </label>
                  <input
                    type="text"
                    name="advisor_name"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Docente Orientador"
                    placeholder="Nome do Orientador"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Data Inicial
                  </label>
                  <input
                    type="date"
                    name="period_start"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Data Inicial"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Data Final
                  </label>
                  <input
                    type="date"
                    name="period_end"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Data Final"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Carga Horária Total (Horas)
                  </label>
                  <input
                    type="number"
                    name="hours_total"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Carga Horária Total"
                    placeholder="000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg">Atividades Desenvolvidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">
                  Principais Atividades
                </label>
                <textarea
                  name="activities"
                  rows={8}
                  className="input w-full"
                  onChange={handleInputChange}
                  title="Principais Atividades"
                  placeholder="Descreva as principais atividades realizadas"
                ></textarea>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg">Avaliação do Discente</CardTitle>
              <p className="text-sm text-neutral-400">
                Atribua valores de 1 (Insuficiente) a 4 (Muito Satisfatório)
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-neutral-300">
                  <thead className="text-xs text-neutral-400 uppercase bg-neutral-800">
                    <tr>
                      <th className="px-4 py-3">Critério</th>
                      <th className="px-4 py-3 text-center">Conceito (1-4)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluationCriteria.map((criteria) => (
                      <tr key={criteria.key} className="border-b border-neutral-700">
                        <td className="px-4 py-3 font-medium">{criteria.label}</td>
                        <td className="px-4 py-3 text-center">
                          <select
                            name={criteria.key}
                            className="bg-neutral-800 border-none rounded px-2 py-1 text-sm w-20 text-center"
                            onChange={handleInputChange}
                            title={`Avaliação: ${criteria.label}`}
                          >
                            <option value="">-</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg">Observações Finais</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">
                  Comentários e Sugestões
                </label>
                <textarea
                  name="comments"
                  rows={5}
                  className="input w-full"
                  onChange={handleInputChange}
                  title="Comentários e Sugestões"
                  placeholder="Observações adicionais, comentários e sugestões"
                ></textarea>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
