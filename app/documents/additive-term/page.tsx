'use client'

/* eslint-disable jsx-a11y/label-has-associated-control */

import { useRef, useEffect, useState } from 'react'
import { ArrowLeft, Save, FileText, Download, FileEdit } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { getDraft, saveDraft, populateFormWithData } from '@/lib/form-drafts'
import { toast } from 'sonner'
import { AdditiveTermDocument } from '@/components/templates/AdditiveTermDocument'
import { maskCPF, maskRG, maskCTPS, maskCNPJ, maskCEP, maskPhone, maskCurrency } from '@/lib/input-masks'

export default function AdditiveTermPage() {
  const formRef = useRef<HTMLFormElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<any>({
    additive_type_prorogation: 'false',
    additive_type_allowance: 'false',
    additive_type_supervisor: 'false',
    additive_type_schedule: 'false',
    additive_type_other: 'false'
  })

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await getDraft('additive-term')
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

    // Garantir que checkboxes não marcados sejam salvos como false
    const checkboxes = ['additive_type_prorogation', 'additive_type_allowance', 'additive_type_supervisor', 'additive_type_schedule', 'additive_type_other']
    checkboxes.forEach(cb => {
      if (!data[cb]) data[cb] = 'false'
      else data[cb] = 'true'
    })

    await saveDraft('additive-term', data)
    toast.success('Rascunho salvo com sucesso!')
    setIsSaving(false)
  }

  const handleGeneratePDF = async () => {
    try {
      if (!formRef.current) return

      // Usar o estado formData em vez de FormData para capturar radio buttons e checkboxes
      const data: any = { ...formData }

      // Processar checkboxes
      const checkboxes = ['additive_type_prorogation', 'additive_type_allowance', 'additive_type_supervisor', 'additive_type_schedule', 'additive_type_other']
      checkboxes.forEach(cb => {
        if (!data[cb]) data[cb] = 'false'
        else data[cb] = 'true'
      })

      // Adicionar data atual se não estiver presente
      const now = new Date()
      if (!data.date_day) data.date_day = String(now.getDate()).padStart(2, '0')
      if (!data.date_month) data.date_month = now.toLocaleString('pt-BR', { month: 'long' })
      if (!data.date_year) data.date_year = String(now.getFullYear())

      toast.loading('Gerando PDF...', { id: 'pdf-generation' })

      const { generateAndDownloadPDF } = await import('@/lib/pdf-generator-react')

      // Criar o documento React-PDF
      const pdfDocument = <AdditiveTermDocument data={data as any} />

      // Gerar e baixar o PDF
      await generateAndDownloadPDF(pdfDocument, 'additive-term.pdf')

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
                <FileEdit className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Termo Aditivo</CardTitle>
                <p className="text-neutral-400 text-sm mt-1">
                  Solicitação de alteração do termo de compromisso de estágio
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <form ref={formRef} className="space-y-6" onChange={() => {
          if (formRef.current) {
            const data = new FormData(formRef.current)
            // Checkboxes precisam ser tratados manualmente no onChange do form se quisermos atualizar o estado em tempo real corretamente
            // Mas o handleInputChange já faz isso para cada input
          }
        }}>
          {/* Identificação das Partes */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg">Identificação das Partes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <h3 className="text-sm font-bold text-primary mb-2">Unidade Concedente</h3>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Razão Social</label>
                  <input type="text" name="company_name" className="input w-full" onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">CNPJ</label>
                  <input type="text" name="company_cnpj" className="input w-full" onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Endereço</label>
                  <input type="text" name="company_address" className="input w-full" onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Representante Legal</label>
                  <input type="text" name="company_representative" className="input w-full" onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Cargo do Representante</label>
                  <input type="text" name="company_representative_role" className="input w-full" onChange={handleInputChange} />
                </div>

                <div className="md:col-span-2 mt-4">
                  <h3 className="text-sm font-bold text-primary mb-2">Estagiário(a)</h3>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Nome Completo</label>
                  <input type="text" name="student_name" className="input w-full" onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">CPF</label>
                  <input type="text" name="student_cpf" className="input w-full" onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Matrícula</label>
                  <input type="text" name="student_enrollment" className="input w-full" onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Curso</label>
                  <input type="text" name="student_course" className="input w-full" onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Endereço</label>
                  <input type="text" name="student_address" className="input w-full" onChange={handleInputChange} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Objeto do Aditivo */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg">Objeto do Aditivo</CardTitle>
              <p className="text-sm text-neutral-400">Selecione as alterações desejadas e preencha os novos dados</p>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Prorrogação */}
              <div className="p-4 border border-neutral-700 rounded-lg bg-neutral-800/50">
                <label className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="additive_type_prorogation"
                    className="checkbox"
                    onChange={handleInputChange}
                    checked={formData.additive_type_prorogation === 'true'}
                  />
                  <span className="font-bold text-white">Prorrogação de Vigência</span>
                </label>
                {formData.additive_type_prorogation === 'true' && (
                  <div className="ml-6 mt-2">
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Nova Data Final</label>
                    <input type="date" name="new_end_date" className="input w-full md:w-1/2" onChange={handleInputChange} />
                  </div>
                )}
              </div>

              {/* Valor da Bolsa */}
              <div className="p-4 border border-neutral-700 rounded-lg bg-neutral-800/50">
                <label className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="additive_type_allowance"
                    className="checkbox"
                    onChange={handleInputChange}
                    checked={formData.additive_type_allowance === 'true'}
                  />
                  <span className="font-bold text-white">Alteração do Valor da Bolsa</span>
                </label>
                {formData.additive_type_allowance === 'true' && (
                  <div className="ml-6 mt-2">
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Novo Valor (R$)</label>
                    <input type="text" name="new_allowance_value" className="input w-full md:w-1/2" placeholder="0,00" onChange={handleInputChange} />
                  </div>
                )}
              </div>

              {/* Supervisor */}
              <div className="p-4 border border-neutral-700 rounded-lg bg-neutral-800/50">
                <label className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="additive_type_supervisor"
                    className="checkbox"
                    onChange={handleInputChange}
                    checked={formData.additive_type_supervisor === 'true'}
                  />
                  <span className="font-bold text-white">Alteração de Supervisor</span>
                </label>
                {formData.additive_type_supervisor === 'true' && (
                  <div className="ml-6 mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-1">Novo Supervisor</label>
                      <input type="text" name="new_supervisor_name" className="input w-full" onChange={handleInputChange} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-1">Cargo</label>
                      <input type="text" name="new_supervisor_role" className="input w-full" onChange={handleInputChange} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-1">Registro Profissional (Conselho)</label>
                      <input type="text" name="new_supervisor_council" className="input w-full" onChange={handleInputChange} />
                    </div>
                  </div>
                )}
              </div>

              {/* Horário */}
              <div className="p-4 border border-neutral-700 rounded-lg bg-neutral-800/50">
                <label className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="additive_type_schedule"
                    className="checkbox"
                    onChange={handleInputChange}
                    checked={formData.additive_type_schedule === 'true'}
                  />
                  <span className="font-bold text-white">Alteração de Horário</span>
                </label>
                {formData.additive_type_schedule === 'true' && (
                  <div className="ml-6 mt-2">
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Novo Horário (Descrição)</label>
                    <textarea name="new_schedule" rows={3} className="input w-full" placeholder="Ex: Segunda a Sexta, das 08:00 às 12:00" onChange={handleInputChange}></textarea>
                  </div>
                )}
              </div>

              {/* Outros */}
              <div className="p-4 border border-neutral-700 rounded-lg bg-neutral-800/50">
                <label className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="additive_type_other"
                    className="checkbox"
                    onChange={handleInputChange}
                    checked={formData.additive_type_other === 'true'}
                  />
                  <span className="font-bold text-white">Outras Alterações</span>
                </label>
                {formData.additive_type_other === 'true' && (
                  <div className="ml-6 mt-2">
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Descrição</label>
                    <textarea name="other_changes" rows={3} className="input w-full" onChange={handleInputChange}></textarea>
                  </div>
                )}
              </div>

            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg">Local e Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Cidade do Campus</label>
                  <input type="text" name="campus_city" className="input w-full" defaultValue="Fortaleza" onChange={handleInputChange} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Diretor Geral (Representante IFCE)</label>
                  <input type="text" name="campus_director" className="input w-full" placeholder="Nome do Diretor" onChange={handleInputChange} />
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
