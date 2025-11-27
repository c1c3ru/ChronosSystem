'use client'

import { useRef, useEffect, useState } from 'react'
import { ArrowLeft, Save, FileText, Download, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { getDraft, saveDraft, populateFormWithData } from '@/lib/form-drafts'
import { toast } from 'sonner'
import { ProfessionalDeclarationDocument } from '@/components/templates/ProfessionalDeclarationDocument'
import { maskCPF, maskCNPJ, maskCEP, maskPhone } from '@/lib/input-masks'

export default function ProfessionalDeclarationPage() {
  const formRef = useRef<HTMLFormElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await getDraft('professional-declaration')
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
    }

    // Atualizar o valor do input com a máscara
    if (maskedValue !== value && e.target instanceof HTMLInputElement) {
      e.target.value = maskedValue
    }

    setFormData((prev: any) => ({ ...prev, [name]: maskedValue }))
  }

  const handleSaveDraft = async () => {
    if (!formRef.current) return

    setIsSaving(true)
    const currentFormData = new FormData(formRef.current)
    const data = Object.fromEntries(currentFormData.entries())

    await saveDraft('professional-declaration', data)
    toast.success('Rascunho salvo com sucesso!')
    setIsSaving(false)
  }

  const handleGeneratePDF = async () => {
    try {
      if (!formRef.current) return

      const currentFormData = new FormData(formRef.current)
      const data = Object.fromEntries(currentFormData.entries())

      // Adicionar data atual se não estiver presente (se aplicável)
      const now = new Date()
      if (!data.date_day) data.date_day = String(now.getDate()).padStart(2, '0')
      if (!data.date_month) data.date_month = now.toLocaleString('pt-BR', { month: 'long' })
      if (!data.date_year) data.date_year = String(now.getFullYear())

      toast.loading('Gerando PDF...', { id: 'pdf-generation' })

      const { generateAndDownloadPDF } = await import('@/lib/pdf-generator-react')
      
      // Criar o documento React-PDF
      const pdfDocument = <ProfessionalDeclarationDocument data={data as any} />
      
      // Gerar e baixar o PDF
      await generateAndDownloadPDF(pdfDocument, 'professional-declaration.pdf')

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
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Declaração de Atividades Profissionais</CardTitle>
                <p className="text-neutral-400 text-sm mt-1">
                  Documento para comprovação de experiência profissional
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
          {/* Dados da Empresa */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg">Dados da Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Razão Social</label>
                  <input type="text" name="company_name" className="input w-full" onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">CNPJ</label>
                  <input type="text" name="company_cnpj" className="input w-full" onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Cidade</label>
                  <input type="text" name="city" className="input w-full" defaultValue="Fortaleza" onChange={handleInputChange} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Endereço Completo</label>
                  <input type="text" name="company_address" className="input w-full" onChange={handleInputChange} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados do Funcionário */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg">Dados do Funcionário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Nome Completo</label>
                  <input type="text" name="employee_name" className="input w-full" onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">CPF</label>
                  <input type="text" name="employee_cpf" className="input w-full" onChange={handleInputChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">CTPS Nº</label>
                    <input type="text" name="employee_ctps" className="input w-full" onChange={handleInputChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Série</label>
                    <input type="text" name="employee_ctps_series" className="input w-full" onChange={handleInputChange} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados do Vínculo */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg">Dados do Vínculo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Data de Início</label>
                  <input type="date" name="start_date" className="input w-full" onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Função</label>
                  <input type="text" name="role" className="input w-full" onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Carga Horária Semanal</label>
                  <input type="number" name="weekly_hours" className="input w-full" onChange={handleInputChange} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Descrição das Atividades</label>
                <textarea name="activities" rows={8} className="input w-full" onChange={handleInputChange}></textarea>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
