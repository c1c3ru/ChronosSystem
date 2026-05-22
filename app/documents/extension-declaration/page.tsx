'use client'

/* eslint-disable jsx-a11y/label-has-associated-control */

import React, { useRef, useEffect, useState } from 'react'
import { ArrowLeft, Save, FileText, Download, UserCheck, GraduationCap, ClipboardList, Calendar, MapPin } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { getDraft, saveDraft } from '@/lib/form-drafts'
import { toast } from 'sonner'
import {
  maskPhone,
} from '@/lib/input-masks'

import type { ExperienceDeclarationData } from '@/lib/pdf-templates/extension-declaration.pdf'

export default function ExperienceDeclarationPage() {
  const formRef = useRef<HTMLFormElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<ExperienceDeclarationData>>({
    city: 'Maracanaú',
    campus: 'MARACANAÚ',
    solicitation_date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await getDraft('extension-declaration')
      if (draft) {
        setFormData(draft as Partial<ExperienceDeclarationData>)
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
    await saveDraft('extension-declaration', formData)
    toast.success('Rascunho salvo com sucesso!')
    setIsSaving(false)
  }

  const handleGeneratePDF = async () => {
    try {
      toast.loading('Gerando PDF...', { id: 'pdf-generation' })
      const { buildExperienceDeclarationDoc } = await import('@/lib/pdf-templates/extension-declaration.pdf')
      const { generatePDF } = await import('@/lib/pdfmake-base-service')
      const doc = await buildExperienceDeclarationDoc(formData as ExperienceDeclarationData)
      await generatePDF(doc, { filename: 'declaracao-participacao-experiencia.pdf' })
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
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl uppercase">Declaração de Participação em Experiência</CardTitle>
                <p className="text-neutral-400 text-sm mt-1">Extensão, Iniciação Científica ou Monitoria</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <form ref={formRef} className="space-y-6 pb-20">
          {/* Dados do Declarante */}
          <Card variant="elevated">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" /> Identificação do Declarante
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label text-[10px]">NOME DO DECLARANTE (SERVIDOR/ORIENTADOR/COORDENADOR)</label>
                <input name="declarant_name" className="input w-full" value={formData.declarant_name || ''} onChange={handleInputChange} placeholder="Nome Completo do Servidor" title="Nome do Declarante" />
              </div>
              <div>
                <label className="label">DOCUMENTO TIPO</label>
                <input name="doc_type" className="input w-full" value={formData.doc_type || ''} onChange={handleInputChange} placeholder="Ex: SIAPE, RG" title="Tipo de Documento" />
              </div>
              <div>
                <label className="label">NÚMERO</label>
                <input name="doc_number" className="input w-full" value={formData.doc_number || ''} onChange={handleInputChange} placeholder="Número do documento" title="Número do Documento" />
              </div>
            </CardContent>
          </Card>

          {/* Dados do Discente */}
          <Card variant="elevated">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" /> Identificação do Discente
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-4">
                <label className="label">NOME DO DISCENTE</label>
                <input name="student_name" className="input w-full" value={formData.student_name || ''} onChange={handleInputChange} placeholder="Nome Completo do Aluno" title="Discente" />
              </div>
              <div className="md:col-span-3">
                <label className="label">CURSO</label>
                <input name="student_course" className="input w-full" value={formData.student_course || ''} onChange={handleInputChange} placeholder="Nome do Curso" title="Curso" />
              </div>
              <div className="md:col-span-1">
                <label className="label">MATRÍCULA</label>
                <input name="student_enrollment" className="input w-full" value={formData.student_enrollment || ''} onChange={handleInputChange} placeholder="Número da Matrícula" title="Matrícula" />
              </div>
              <div className="md:col-span-4">
                <label className="label">CAMPUS</label>
                <input name="campus" className="input w-full" value={formData.campus || 'MARACANAÚ'} onChange={handleInputChange} placeholder="Campus de Origem" title="Campus" />
              </div>
            </CardContent>
          </Card>

          {/* Experiência */}
          <Card variant="elevated">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" /> Detalhes da Experiência
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-wrap gap-6 p-4 rounded-xl bg-white/5 border border-white/5">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="exp_type" value="extensao" checked={formData.exp_type === 'extensao'} onChange={handleInputChange} className="radio" />
                  <span className="text-sm text-neutral-400 group-hover:text-primary transition-colors">EXTENSÃO</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="exp_type" value="iniciacao" checked={formData.exp_type === 'iniciacao'} onChange={handleInputChange} className="radio" />
                  <span className="text-sm text-neutral-400 group-hover:text-primary transition-colors">INICIAÇÃO CIENTÍFICA</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="exp_type" value="monitoria" checked={formData.exp_type === 'monitoria'} onChange={handleInputChange} className="radio" />
                  <span className="text-sm text-neutral-400 group-hover:text-primary transition-colors">MONITORIA</span>
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="label">TÍTULO</label>
                  <input name="title" className="input w-full" value={formData.title || ''} onChange={handleInputChange} placeholder="Título da atividade" title="Título" />
                </div>
                <div>
                  <label className="label">PROJETO/PROGRAMA</label>
                  <input name="project_program" className="input w-full" value={formData.project_program || ''} onChange={handleInputChange} placeholder="Nome do Projeto ou Programa" title="Projeto/Programa" />
                </div>
                <div>
                  <label className="label">INSTITUIÇÃO</label>
                  <input name="institution" className="input w-full" value={formData.institution || 'IFCE'} onChange={handleInputChange} placeholder="Nome da Instituição" title="Instituição" />
                </div>
              </div>

              <div>
                <label className="label">ATIVIDADES DESENVOLVIDAS</label>
                <textarea name="activities" rows={8} className="input w-full" value={formData.activities || ''} onChange={handleInputChange} placeholder="Descreva as atividades realizadas pelo discente..." title="Atividades" />
              </div>
            </CardContent>
          </Card>

          {/* Vínculo e Período */}
          <Card variant="elevated">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Vínculo e Período
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">DATA DE INÍCIO</label>
                <input type="date" name="start_date" className="input w-full" value={formData.start_date || ''} onChange={handleInputChange} title="Início" />
              </div>
              <div>
                <label className="label">CARGA HORÁRIA SEMANAL (HORAS)</label>
                <input type="number" name="weekly_hours" className="input w-full" value={formData.weekly_hours || ''} onChange={handleInputChange} placeholder="Ex: 20" title="Carga Horária" />
              </div>
            </CardContent>
          </Card>

          {/* Local */}
          <Card variant="elevated">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> Localidade
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">CIDADE</label>
                  <input name="city" className="input w-full" value={formData.city || 'Maracanaú'} onChange={handleInputChange} placeholder="Cidade de emissão" title="Cidade" />
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
