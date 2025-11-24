'use client'

import { useRef, useEffect, useState } from 'react'
import { ArrowLeft, Save, FileText, Download, Award } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { getDraft, saveDraft } from '@/lib/form-drafts'
import { toast } from 'sonner'

export default function ProfessionalDeclarationPage() {
  const formRef = useRef<HTMLFormElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    student_name: '',
    student_id: '',
    student_course: '',
    company_name: '',
    company_cnpj: '',
    position: '',
    start_date: '',
    end_date: '',
    total_hours: '',
    activities_summary: ''
  })

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await getDraft('professional-declaration')
      if (draft) {
        setFormData(draft as typeof formData)
        toast.success('Rascunho carregado!')
      }
    }
    loadDraft()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    await saveDraft('professional-declaration', formData)
    toast.success('Rascunho salvo com sucesso!')
    setIsSaving(false)
  }

  const handleGeneratePDF = async () => {
    try {
      const hasData = Object.values(formData).some(value => value !== '')
      if (!hasData) {
        toast.error('Preencha pelo menos um campo antes de gerar o PDF')
        return
      }

      toast.loading('Gerando PDF...', { id: 'pdf-generation' })

      const { generateFormPDF } = await import('@/lib/pdf-generator')
      await generateFormPDF(formRef, 'declaracao-profissional', formData)

      toast.success('PDF gerado com sucesso!', { id: 'pdf-generation' })
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toast.error(
        error instanceof Error ? error.message : 'Erro ao gerar PDF. Tente novamente.',
        { id: 'pdf-generation' }
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/employee" className="flex items-center text-primary hover:text-primary/80 transition-colors font-medium group">
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Voltar
          </Link>
          <div className="flex gap-3">
            <Button onClick={handleSaveDraft} variant="secondary" size="sm" disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? 'Salvando...' : 'Salvar Rascunho'}
            </Button>
            <Button onClick={handleGeneratePDF} variant="primary" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Gerar PDF
            </Button>
          </div>
        </div>

        <Card variant="glass" className="border-t-4 border-primary">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 rounded-xl">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Declaração de Atividade Profissional</CardTitle>
                <p className="text-neutral-400 text-sm mt-1">Comprovação de experiência profissional relacionada ao curso</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <form ref={formRef} className="space-y-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold">1</span>
                Dados do Aluno
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Nome Completo</label>
                  <input type="text" name="student_name" value={formData.student_name} onChange={handleChange} className="input w-full" placeholder="Digite seu nome completo" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Matrícula</label>
                  <input type="text" name="student_id" value={formData.student_id} onChange={handleChange} className="input w-full" placeholder="000000" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Curso</label>
                <input type="text" name="student_course" value={formData.student_course} onChange={handleChange} className="input w-full" placeholder="Ex: Análise e Desenvolvimento de Sistemas" />
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold">2</span>
                Dados da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Razão Social</label>
                  <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} className="input w-full" placeholder="Nome da empresa" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">CNPJ</label>
                  <input type="text" name="company_cnpj" value={formData.company_cnpj} onChange={handleChange} className="input w-full" placeholder="00.000.000/0000-00" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Cargo/Função Exercida</label>
                <input type="text" name="position" value={formData.position} onChange={handleChange} className="input w-full" placeholder="Seu cargo na empresa" />
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold">3</span>
                Período e Atividades
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Data de Início</label>
                  <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="input w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Data de Término</label>
                  <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="input w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Carga Horária Total</label>
                  <input type="number" name="total_hours" value={formData.total_hours} onChange={handleChange} className="input w-full" placeholder="Ex: 480" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Resumo das Atividades Desenvolvidas</label>
                <textarea name="activities_summary" value={formData.activities_summary} onChange={handleChange} rows={8} className="input w-full resize-y" placeholder="Descreva as principais atividades profissionais desenvolvidas que se relacionam com o curso..." />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 pb-8">
            <Button type="button" variant="secondary" onClick={handleSaveDraft} disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? 'Salvando...' : 'Salvar Rascunho'}
            </Button>
            <Button type="button" variant="primary" onClick={handleGeneratePDF} className="gap-2">
              <Download className="h-4 w-4" />
              Gerar PDF Oficial
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
