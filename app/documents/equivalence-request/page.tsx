'use client'

import { useRef, useEffect, useState } from 'react'
import { ArrowLeft, Save, FileText, Download, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { getDraft, saveDraft, populateFormWithData } from '@/lib/form-drafts'
import { toast } from 'sonner'
import { EquivalenceRequestDocument } from '@/components/templates/EquivalenceRequestDocument'
import { maskCPF, maskRG, maskCTPS, maskCNPJ, maskCEP, maskPhone, maskCurrency } from '@/lib/input-masks'

export default function EquivalenceRequestPage() {
  const formRef = useRef<HTMLFormElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<any>({
    doc_work_card: 'false',
    doc_service_declaration: 'false',
    doc_activities_declaration: 'false',
    doc_other: 'false'
  })

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await getDraft('equivalence-request')
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
    const { name, value, type } = e.target
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

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev: any) => ({ ...prev, [name]: checked ? 'true' : 'false' }))
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

    // Checkboxes
    const checkboxes = ['doc_work_card', 'doc_service_declaration', 'doc_activities_declaration', 'doc_other']
    checkboxes.forEach(cb => {
      if (!data[cb]) data[cb] = 'false'
      else data[cb] = 'true'
    })

    await saveDraft('equivalence-request', data)
    toast.success('Rascunho salvo com sucesso!')
    setIsSaving(false)
  }

  const handleGeneratePDF = async () => {
    try {
      if (!formRef.current) return

      // Usar o estado formData em vez de FormData para capturar radio buttons e checkboxes
      const data: any = { ...formData }

      // Adicionar data atual se não estiver presente
      const now = new Date()
      if (!data.date_day) data.date_day = String(now.getDate()).padStart(2, '0')
      if (!data.date_month) data.date_month = now.toLocaleString('pt-BR', { month: 'long' })
      if (!data.date_year) data.date_year = String(now.getFullYear())

      toast.loading('Gerando PDF...', { id: 'pdf-generation' })

      const { generateAndDownloadPDF } = await import('@/lib/pdf-generator-react')

      // Criar o documento React-PDF
      const pdfDocument = <EquivalenceRequestDocument data={data as any} />

      // Gerar e baixar o PDF
      await generateAndDownloadPDF(pdfDocument, 'equivalence-request.pdf')

      toast.success('PDF gerado com sucesso!', { id: 'pdf-generation' })
    } catch (error) {
      console.error('❌ Erro detalhado ao gerar PDF:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      toast.error(`Erro: ${errorMessage}`, { id: 'pdf-generation', duration: 10000 })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
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
                <RefreshCw className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Solicitação de Equivalência de Estágio</CardTitle>
                <p className="text-neutral-400 text-sm mt-1">
                  Pedido de aproveitamento de atividade profissional como estágio
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <form ref={formRef} className="space-y-6" onChange={() => {
          if (formRef.current) {
            const data = new FormData(formRef.current)
            // Checkboxes precisam ser tratados manualmente
          }
        }}>
          {/* Dados do Discente */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg">Dados do Discente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Nome Completo</label>
                  <input type="text" name="student_name" className="input w-full" onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Matrícula</label>
                  <input type="text" name="student_enrollment" className="input w-full" onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Curso</label>
                  <input type="text" name="student_course" className="input w-full" onChange={handleInputChange} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Endereço</label>
                  <input type="text" name="student_address" className="input w-full" onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Telefone</label>
                  <input type="text" name="student_phone" className="input w-full" onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Email</label>
                  <input type="email" name="student_email" className="input w-full" onChange={handleInputChange} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados da Empresa */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg">Dados da Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Nome da Empresa</label>
                  <input type="text" name="company_name" className="input w-full" onChange={handleInputChange} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Endereço</label>
                  <input type="text" name="company_address" className="input w-full" onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Telefone</label>
                  <input type="text" name="company_phone" className="input w-full" onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Email</label>
                  <input type="email" name="company_email" className="input w-full" onChange={handleInputChange} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Chefe Imediato</label>
                  <input type="text" name="company_supervisor" className="input w-full" onChange={handleInputChange} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Atividades e Período */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg">Atividades e Período</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Descrição das Atividades</label>
                <textarea name="activities" rows={5} className="input w-full" onChange={handleInputChange}></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Data Inicial</label>
                  <input type="date" name="start_date" className="input w-full" onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Data Final</label>
                  <input type="date" name="end_date" className="input w-full" onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Carga Horária Total</label>
                  <input type="number" name="total_hours" className="input w-full" onChange={handleInputChange} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documentos Anexos */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg">Documentos Anexos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="doc_work_card"
                  className="checkbox"
                  onChange={handleInputChange}
                  checked={formData.doc_work_card === 'true'}
                />
                <span className="text-neutral-300">Carteira de Trabalho</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="doc_service_declaration"
                  className="checkbox"
                  onChange={handleInputChange}
                  checked={formData.doc_service_declaration === 'true'}
                />
                <span className="text-neutral-300">Declaração de Tempo de Serviço</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="doc_activities_declaration"
                  className="checkbox"
                  onChange={handleInputChange}
                  checked={formData.doc_activities_declaration === 'true'}
                />
                <span className="text-neutral-300">Declaração de Atividades Profissionais</span>
              </label>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="doc_other"
                    className="checkbox"
                    onChange={handleInputChange}
                    checked={formData.doc_other === 'true'}
                  />
                  <span className="text-neutral-300">Outros:</span>
                </label>
                <input
                  type="text"
                  name="doc_other_desc"
                  className="input flex-1 h-8"
                  disabled={formData.doc_other !== 'true'}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
