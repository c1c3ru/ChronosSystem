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

export default function MonthlyReportPage() {
  const formRef = useRef<HTMLFormElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await getDraft('monthly-report')
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    await saveDraft('monthly-report', data)
    toast.success('Rascunho salvo com sucesso!')
    setIsSaving(false)
  }

  const handleGeneratePDF = async () => {
    try {
      toast.loading('Gerando PDF...', { id: 'pdf-generation' })

      const raw: any = { ...formData }
      const { generateHTMLPDF, buildMonthlyReportHTML } = await import('@/lib/pdf-generator-html')

      // Mapear campos para o gerador HTML seguindo as chaves do estado formData
      const htmlData = {
        nome_estudante: raw.student_name || '',
        matricula_estudante: raw.student_enrollment || '',
        curso_estudante: raw.student_course || '',
        empresa_nome: raw.company_name || '',
        empresa_cnpj: raw.company_cnpj || '',
        nome_supervisor: raw.supervisor_name || '',
        cargo_supervisor: raw.supervisor_role || '',
        horas_mes: raw.hours_month || raw.monthly_hours || '',
        horas_total: raw.hours_total || '',
        inicio_periodo: raw.period_start || raw.start_date || '',
        fim_periodo: raw.period_end || raw.end_date || '',
        periodo_referencia: raw.period_reference || '',
        nome_orientador: raw.advisor_name || '',
        atividades: raw.activities || '',
        dificuldades: raw.difficulties || '',
        solucoes: raw.solutions || '',
      }

      const html = buildMonthlyReportHTML(htmlData)
      await generateHTMLPDF(html, 'relatorio-mensal.pdf')

      toast.success('PDF gerado com sucesso!', { id: 'pdf-generation' })
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toast.error('Erro ao gerar PDF. Tente novamente.', { id: 'pdf-generation' })
    }
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
                <CardTitle className="text-2xl">Relatório Mensal de Atividades</CardTitle>
                <p className="text-neutral-400 text-sm mt-1">
                  Relate as atividades desenvolvidas no mês
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <form
          ref={formRef}
          className="space-y-6"
        >
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg">Identificação e Período</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label
                    htmlFor="mr-student-name"
                    className="block text-sm font-medium text-neutral-300 mb-1"
                  >
                    Nome do Discente
                  </label>
                  <input
                    id="mr-student-name"
                    type="text"
                    name="student_name"
                    placeholder="Nome completo do discente"
                    className="input w-full"
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label
                    htmlFor="mr-student-course"
                    className="block text-sm font-medium text-neutral-300 mb-1"
                  >
                    Curso
                  </label>
                  <input
                    id="mr-student-course"
                    type="text"
                    name="student_course"
                    placeholder="Ex: Técnico em Informática"
                    className="input w-full"
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label
                    htmlFor="mr-student-enrollment"
                    className="block text-sm font-medium text-neutral-300 mb-1"
                  >
                    Matrícula
                  </label>
                  <input
                    id="mr-student-enrollment"
                    type="text"
                    name="student_enrollment"
                    placeholder="Número de matrícula"
                    className="input w-full"
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label
                    htmlFor="mr-supervisor-name"
                    className="block text-sm font-medium text-neutral-300 mb-1"
                  >
                    Supervisor do Estágio
                  </label>
                  <input
                    id="mr-supervisor-name"
                    type="text"
                    name="supervisor_name"
                    placeholder="Nome do supervisor"
                    className="input w-full"
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label
                    htmlFor="mr-advisor-name"
                    className="block text-sm font-medium text-neutral-300 mb-1"
                  >
                    Docente Orientador
                  </label>
                  <input
                    id="mr-advisor-name"
                    type="text"
                    name="advisor_name"
                    placeholder="Nome do orientador"
                    className="input w-full"
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label
                    htmlFor="mr-period-start"
                    className="block text-sm font-medium text-neutral-300 mb-1"
                  >
                    Data Inicial Parcial
                  </label>
                  <input
                    id="mr-period-start"
                    type="date"
                    name="period_start"
                    title="Data inicial do período"
                    className="input w-full"
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label
                    htmlFor="mr-period-end"
                    className="block text-sm font-medium text-neutral-300 mb-1"
                  >
                    Data Final Parcial
                  </label>
                  <input
                    id="mr-period-end"
                    type="date"
                    name="period_end"
                    title="Data final do período"
                    className="input w-full"
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label
                    htmlFor="mr-hours-month"
                    className="block text-sm font-medium text-neutral-300 mb-1"
                  >
                    Carga Horária no Período
                  </label>
                  <input
                    id="mr-hours-month"
                    type="number"
                    name="hours_month"
                    placeholder="Ex: 80"
                    className="input w-full"
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label
                    htmlFor="mr-hours-total"
                    className="block text-sm font-medium text-neutral-300 mb-1"
                  >
                    Carga Horária Acumulada
                  </label>
                  <input
                    id="mr-hours-total"
                    type="number"
                    name="hours_total"
                    placeholder="Ex: 240"
                    className="input w-full"
                    onChange={handleInputChange}
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
                <label
                  htmlFor="mr-activities"
                  className="block text-sm font-medium text-neutral-300 mb-1"
                >
                  Principais Atividades
                </label>
                <textarea
                  id="mr-activities"
                  name="activities"
                  rows={8}
                  className="input w-full"
                  placeholder="Descreva as principais atividades desenvolvidas no período..."
                  onChange={handleInputChange}
                ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="mr-difficulties"
                    className="block text-sm font-medium text-neutral-300 mb-1"
                  >
                    Dificuldades Encontradas
                  </label>
                  <textarea
                    id="mr-difficulties"
                    name="difficulties"
                    rows={5}
                    className="input w-full"
                    placeholder="Descreva as dificuldades encontradas..."
                    onChange={handleInputChange}
                  ></textarea>
                </div>
                <div>
                  <label
                    htmlFor="mr-solutions"
                    className="block text-sm font-medium text-neutral-300 mb-1"
                  >
                    Soluções Adotadas
                  </label>
                  <textarea
                    id="mr-solutions"
                    name="solutions"
                    rows={5}
                    className="input w-full"
                    placeholder="Descreva as soluções adotadas..."
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
