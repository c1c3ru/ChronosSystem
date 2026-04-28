'use client'

/* eslint-disable jsx-a11y/label-has-associated-control */

import { useRef, useEffect, useState } from 'react'
import { ArrowLeft, Save, FileText, Download, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { PDFMakeExport } from '@/components/PDFMakeExport'
import { buildRealizationTermDoc } from '@/lib/pdf-templates/realization-term.pdf'
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

export default function RealizationTermPage() {
  const formRef = useRef<HTMLFormElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await getDraft('realization-term')
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

    await saveDraft('realization-term', data)
    toast.success('Rascunho salvo com sucesso!')
    setIsSaving(false)
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
            <PDFMakeExport 
              fileName="termo-de-realizacao.pdf"
              buttonText="Gerar PDF"
              documentDefinitionGenerator={() => buildRealizationTermDoc(formData)}
            />
          </div>
        </div>

        <Card variant="glass" className="border-t-4 border-primary">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 rounded-xl">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Termo de Realização de Estágio</CardTitle>
                <p className="text-neutral-400 text-sm mt-1">
                  Documento que atesta a conclusão do estágio
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <form
          ref={formRef}
          className="space-y-6"
        >
          {/* Dados do Estagiário */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg">Dados do Estagiário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    name="student_name"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Nome Completo"
                    placeholder="Nome Completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">CPF</label>
                  <input
                    type="text"
                    name="student_cpf"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="CPF"
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">RG</label>
                  <input
                    type="text"
                    name="student_rg"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="RG"
                    placeholder="Órgão Emissor/UF"
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
              </div>
            </CardContent>
          </Card>

          {/* Dados da Empresa */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg">Dados da Empresa Concedente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Razão Social
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Razão Social"
                    placeholder="Razão Social da Empresa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">CNPJ</label>
                  <input
                    type="text"
                    name="company_cnpj"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="CNPJ"
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Supervisor do Estágio
                  </label>
                  <input
                    type="text"
                    name="company_supervisor"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Supervisor do Estágio"
                    placeholder="Nome do Supervisor"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Endereço
                  </label>
                  <input
                    type="text"
                    name="company_address"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Endereço"
                    placeholder="Endereço Completo da Empresa"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados do Estágio */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg">Dados do Estágio Realizado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    name="internship_start_date"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Data de Início"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Data de Término
                  </label>
                  <input
                    type="date"
                    name="internship_end_date"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Data de Término"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Carga Horária Total (horas)
                  </label>
                  <input
                    type="number"
                    name="total_hours"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Carga Horária Total (horas)"
                    placeholder="000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Carga Horária Semanal (horas)
                  </label>
                  <input
                    type="number"
                    name="weekly_hours"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Carga Horária Semanal (horas)"
                    placeholder="00"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Atividades Desenvolvidas
                  </label>
                  <textarea
                    name="activities"
                    rows={8}
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Atividades Desenvolvidas"
                    placeholder="Descreva as atividades realizadas"
                  ></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Avaliação do Desempenho
                  </label>
                  <textarea
                    name="performance_evaluation"
                    rows={5}
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Avaliação do Desempenho"
                    placeholder="Descreva o desempenho do estagiário"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Cidade</label>
                  <input
                    type="text"
                    name="city"
                    className="input w-full"
                    defaultValue="Fortaleza"
                    onChange={handleInputChange}
                    title="Cidade"
                    placeholder="Fortaleza"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
