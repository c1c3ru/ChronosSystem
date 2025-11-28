'use client'

import { useRef, useEffect, useState } from 'react'
import { ArrowLeft, Save, FileText, Download } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { getDraft, saveDraft, populateFormWithData } from '@/lib/form-drafts'
import { toast } from 'sonner'
import { SemesterReportDocument } from '@/components/templates/SemesterReportDocument'
import { maskCPF, maskRG, maskCTPS, maskCNPJ, maskCEP, maskPhone, maskCurrency } from '@/lib/input-masks'

export default function SemesterReportPage() {
  const formRef = useRef<HTMLFormElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await getDraft('semester-report')
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    await saveDraft('semester-report', data)
    toast.success('Rascunho salvo com sucesso!')
    setIsSaving(false)
  }

  const handleGeneratePDF = async () => {
    try {
      if (!formRef.current) return

      // Usar o estado formData em vez de FormData para capturar radio buttons e checkboxes
      const data: any = { ...formData }

      // Adicionar data atual se não estiver presente (se aplicável)
      const now = new Date()
      if (!data.date_day) data.date_day = String(now.getDate()).padStart(2, '0')
      if (!data.date_month) data.date_month = now.toLocaleString('pt-BR', { month: 'long' })
      if (!data.date_year) data.date_year = String(now.getFullYear())

      toast.loading('Gerando PDF...', { id: 'pdf-generation' })

      const { generateAndDownloadPDF } = await import('@/lib/pdf-generator-react')

      // Criar o documento React-PDF
      const pdfDocument = <SemesterReportDocument data={data as any} />

      // Gerar e baixar o PDF
      await generateAndDownloadPDF(pdfDocument, 'semester-report.pdf')

      toast.success('PDF gerado com sucesso!', { id: 'pdf-generation' })
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toast.error('Erro ao gerar PDF. Tente novamente.', { id: 'pdf-generation' })
    }
  }

  const evaluationCriteria = [
    { key: 'criteria_1', label: 'Assiduidade e Pontualidade' },
    { key: 'criteria_2', label: 'Iniciativa e Pró-atividade' },
    { key: 'criteria_3', label: 'Relacionamento Interpessoal' },
    { key: 'criteria_4', label: 'Capacidade de Aprendizagem' },
    { key: 'criteria_5', label: 'Qualidade do Trabalho' },
    { key: 'criteria_6', label: 'Organização e Planejamento' },
    { key: 'criteria_7', label: 'Comunicação' },
    { key: 'criteria_8', label: 'Responsabilidade' },
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
                <CardTitle className="text-2xl">Relatório Semestral de Atividades</CardTitle>
                <p className="text-neutral-400 text-sm mt-1">
                  Avaliação semestral do desempenho do estagiário
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <form ref={formRef} className="space-y-6" onChange={() => {
          if (formRef.current) {
            const data = new FormData(formRef.current)
            setFormData(Object.fromEntries(data.entries()))
          }
        }}>
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg">Identificação e Período</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Nome do Discente</label>
                  <input type="text" name="student_name" className="input w-full" onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Curso</label>
                  <input type="text" name="student_course" className="input w-full" onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Matrícula</label>
                  <input type="text" name="student_enrollment" className="input w-full" onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Supervisor do Estágio</label>
                  <input type="text" name="supervisor_name" className="input w-full" onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Docente Orientador</label>
                  <input type="text" name="advisor_name" className="input w-full" onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Data Inicial Parcial</label>
                  <input type="date" name="period_start" className="input w-full" onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Data Final Parcial</label>
                  <input type="date" name="period_end" className="input w-full" onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Estagiada no Período (Horas)</label>
                  <input type="number" name="hours_semester" className="input w-full" onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Acumulada no Período (Horas)</label>
                  <input type="number" name="hours_total" className="input w-full" onChange={handleInputChange} />
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
                <label className="block text-sm font-medium text-neutral-300 mb-1">Principais Atividades</label>
                <textarea name="activities" rows={8} className="input w-full" onChange={handleInputChange}></textarea>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg">Avaliação do Discente</CardTitle>
              <p className="text-sm text-neutral-400">Atribua valores de 1 (Insuficiente) a 4 (Muito Satisfatório)</p>
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
                <label className="block text-sm font-medium text-neutral-300 mb-1">Comentários e Sugestões</label>
                <textarea name="comments" rows={5} className="input w-full" onChange={handleInputChange}></textarea>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
