'use client'

/* eslint-disable jsx-a11y/label-has-associated-control */

import React, { useRef, useEffect, useState } from 'react'
import { ArrowLeft, Save, FileText, Download, Building2, User, Briefcase, ClipboardList, MapPin } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { getDraft, saveDraft } from '@/lib/form-drafts'
import { toast } from 'sonner'
import {
  maskCNPJ,
  maskCPF,
  maskPhone,
} from '@/lib/input-masks'

import type { ProfessionalActivitiesData } from '@/lib/pdf-templates/professional-activities.pdf'

export default function ProfessionalActivitiesPage() {
  const formRef = useRef<HTMLFormElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<ProfessionalActivitiesData>>({
    city: 'Maracanaú',
    solicitation_date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await getDraft('professional-activities')
      if (draft) {
        setFormData(draft as Partial<ProfessionalActivitiesData>)
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
    if (name.includes('cpf')) maskedValue = maskCPF(value)
    if (name.includes('phone')) maskedValue = maskPhone(value)

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: maskedValue }))
    }
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    await saveDraft('professional-activities', formData)
    toast.success('Rascunho salvo com sucesso!')
    setIsSaving(false)
  }

  const handleGeneratePDF = async () => {
    try {
      toast.loading('Gerando PDF...', { id: 'pdf-generation' })
      const { buildProfessionalActivitiesDoc } = await import('@/lib/pdf-templates/professional-activities.pdf')
      const { generatePDF } = await import('@/lib/pdfmake-base-service')
      const doc = await buildProfessionalActivitiesDoc(formData as ProfessionalActivitiesData)
      await generatePDF(doc, { filename: 'declaracao-atividades-profissionais.pdf' })
      toast.success('PDF gerado com sucesso!', { id: 'pdf-generation' })
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toast.error('Erro ao gerar PDF. Tente novamente.', { id: 'pdf-generation' })
    }
  }

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
              Gerar Declaração PDF
            </Button>
          </div>
        </div>

        {/* Title */}
        <Card variant="glass" className="border-t-4 border-primary">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-xl">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl uppercase">Declaração de Atividades Profissionais</CardTitle>
                <p className="text-neutral-400 text-sm mt-1">Conformidade Institucional IFCE Maracanaú</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <form ref={formRef} className="space-y-6 pb-20">
          {/* Dados da Empresa */}
          <Card variant="elevated">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" /> Dados da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">Razão Social</label>
                <input name="company_name" className="input w-full" value={formData.company_name || ''} onChange={handleInputChange} placeholder="Razão Social da Empresa" title="Razão Social" />
              </div>
              <div>
                <label className="label">CNPJ</label>
                <input name="company_cnpj" className="input w-full" value={formData.company_cnpj || ''} onChange={handleInputChange} placeholder="00.000.000/0000-00" title="CNPJ" />
              </div>
              <div className="md:col-span-2">
                <label className="label">Endereço</label>
                <input name="company_address" className="input w-full" value={formData.company_address || ''} onChange={handleInputChange} placeholder="Rua, Número, Bairro, Cidade-UF" title="Endereço" />
              </div>
            </CardContent>
          </Card>

          {/* Dados do Funcionário */}
          <Card variant="elevated">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Dados do Funcionário
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">Nome Completo</label>
                <input name="employee_name" className="input w-full" value={formData.employee_name || ''} onChange={handleInputChange} placeholder="Nome Completo do Funcionário" title="Nome do Funcionário" />
              </div>
              <div>
                <label className="label">CPF</label>
                <input name="employee_cpf" className="input w-full" value={formData.employee_cpf || ''} onChange={handleInputChange} placeholder="000.000.000-00" title="CPF" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">CTPS Nº</label>
                  <input name="employee_ctps_number" className="input w-full" value={formData.employee_ctps_number || ''} onChange={handleInputChange} placeholder="Número CTPS" title="CTPS" />
                </div>
                <div>
                  <label className="label">SÉRIE</label>
                  <input name="employee_ctps_series" className="input w-full" value={formData.employee_ctps_series || ''} onChange={handleInputChange} placeholder="Série" title="Série" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados do Vínculo */}
          <Card variant="elevated">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" /> Dados do Vínculo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Data de Início</label>
                <input type="date" name="start_date" className="input w-full" value={formData.start_date || ''} onChange={handleInputChange} title="Data de Início" />
              </div>
              <div>
                <label className="label">Função</label>
                <input name="function_name" className="input w-full" value={formData.function_name || ''} onChange={handleInputChange} placeholder="Cargo ou Função" title="Função" />
              </div>
              <div>
                <label className="label">Carga Horária Semanal</label>
                <input name="weekly_hours" type="number" className="input w-full" value={formData.weekly_hours || ''} onChange={handleInputChange} placeholder="Ex: 44" title="Carga Horária" />
              </div>
            </CardContent>
          </Card>

          {/* Atividades */}
          <Card variant="elevated">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" /> Descrição das Atividades
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <textarea name="activities" rows={8} className="input w-full" value={formData.activities || ''} onChange={handleInputChange} placeholder="Descreva detalhadamente as atividades realizadas..." title="Atividades" />
            </CardContent>
          </Card>

          {/* Local e Data */}
          <Card variant="elevated">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> Localidade e Datas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Cidade</label>
                <input name="city" className="input w-full" value={formData.city || 'Maracanaú'} onChange={handleInputChange} placeholder="Cidade de emissão" title="Cidade" />
              </div>
              <div>
                <label className="label">Data da Solicitação</label>
                <input type="date" name="solicitation_date" className="input w-full" value={formData.solicitation_date || ''} onChange={handleInputChange} title="Data da Solicitação" />
              </div>
              <div>
                <label className="label">Data da Autorização</label>
                <input type="date" name="authorization_date" className="input w-full" value={formData.authorization_date || ''} onChange={handleInputChange} title="Data da Autorização" />
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
