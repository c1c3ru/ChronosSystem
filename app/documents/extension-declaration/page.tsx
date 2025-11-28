'use client'

import { useRef, useEffect, useState } from 'react'
import { ArrowLeft, Save, FileText, Download, CalendarClock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { getDraft, saveDraft, populateFormWithData } from '@/lib/form-drafts'
import { toast } from 'sonner'
import { ExtensionDeclarationDocument } from '@/components/templates/ExtensionDeclarationDocument'
import { maskCPF, maskCNPJ, maskCEP, maskPhone, maskCurrency } from '@/lib/input-masks'

export default function ExtensionDeclarationPage() {
  const formRef = useRef<HTMLFormElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await getDraft('extension-declaration')
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

    await saveDraft('extension-declaration', data)
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
      const pdfDocument = <ExtensionDeclarationDocument data={data as any} />

      // Gerar e baixar o PDF
      await generateAndDownloadPDF(pdfDocument, 'extension-declaration.pdf')

      toast.success('PDF gerado com sucesso!', { id: 'pdf-generation' })
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toast.error('Erro ao gerar PDF. Tente novamente.', { id: 'pdf-generation' })
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
                <CalendarClock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Declaração de Prorrogação de Estágio</CardTitle>
                <p className="text-neutral-400 text-sm mt-1">
                  Documento para formalizar a prorrogação do período de estágio
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
              <CardTitle className="text-lg">Dados da Prorrogação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Nome da Empresa</label>
                  <input type="text" name="company_name" className="input w-full" onChange={handleInputChange} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Nome do Estagiário</label>
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
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Data Inicial Atual</label>
                  <input type="date" name="current_start_date" className="input w-full" onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Data Final Atual</label>
                  <input type="date" name="current_end_date" className="input w-full" onChange={handleInputChange} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-primary font-bold mb-1">Nova Data Final (Prorrogação)</label>
                  <input type="date" name="new_end_date" className="input w-full border-primary" onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Cidade</label>
                  <input type="text" name="city" className="input w-full" defaultValue="Fortaleza" onChange={handleInputChange} />
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
