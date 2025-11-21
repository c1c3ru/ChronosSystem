'use client'

import { useRef, useEffect, useState } from 'react'
import { ArrowLeft, Save, FileText, Download, Star, Building2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { getDraft, saveDraft } from '@/lib/form-drafts'
import { toast } from 'sonner'

export default function FinalReportPage() {
  const formRef = useRef<HTMLFormElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    student_name: '',
    student_id: '',
    company: '',
    supervisor: '',
    period_start: '',
    period_end: '',
    activities_description: '',
    theory_practice_comparison: '',
    aa1: '', aa2: '', aa3: '', aa4: '',
    as1: '', as2: '', as3: ''
  })

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await getDraft('final-report')
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
    await saveDraft('final-report', formData)
    toast.success('Rascunho salvo com sucesso!')
    setIsSaving(false)
  }

  const handleGeneratePDF = () => {
    toast.info('Funcionalidade em desenvolvimento')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
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
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Relatório Final de Estágio Obrigatório</CardTitle>
                <p className="text-neutral-400 text-sm mt-1">Avaliação final das atividades e aprendizados do estágio</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <form ref={formRef} className="space-y-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold">1</span>
                Identificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Nome do Estagiário(a)</label>
                  <input type="text" name="student_name" value={formData.student_name} onChange={handleChange} className="input w-full" placeholder="Digite seu nome completo" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Matrícula</label>
                  <input type="text" name="student_id" value={formData.student_id} onChange={handleChange} className="input w-full" placeholder="000000" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Empresa Concedente
                  </label>
                  <input type="text" name="company" value={formData.company} onChange={handleChange} className="input w-full" placeholder="Nome da empresa" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Supervisor(a)</label>
                  <input type="text" name="supervisor" value={formData.supervisor} onChange={handleChange} className="input w-full" placeholder="Nome do supervisor" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Data Inicial</label>
                  <input type="date" name="period_start" value={formData.period_start} onChange={handleChange} className="input w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Data Final</label>
                  <input type="date" name="period_end" value={formData.period_end} onChange={handleChange} className="input w-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold">2</span>
                Atividades Realizadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Descrição das Atividades Realizadas</label>
                <textarea name="activities_description" value={formData.activities_description} onChange={handleChange} rows={8} className="input w-full resize-y" placeholder="Descreva detalhadamente as atividades que você realizou durante o estágio..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Comparação Teoria × Prática</label>
                <textarea name="theory_practice_comparison" value={formData.theory_practice_comparison} onChange={handleChange} rows={6} className="input w-full resize-y" placeholder="Compare o conhecimento teórico adquirido no curso com a prática vivenciada no estágio..." />
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold">3</span>
                Autoavaliação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {['Assiduidade', 'Comunicação', 'Proatividade', 'Responsabilidade'].map((label, index) => (
                <div key={label} className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-300">{label}</label>
                  <div className="flex gap-4">
                    {[
                      { value: 'otimo', label: 'Ótimo', color: 'text-green-400' },
                      { value: 'bom', label: 'Bom', color: 'text-blue-400' },
                      { value: 'regular', label: 'Regular', color: 'text-yellow-400' },
                      { value: 'insuficiente', label: 'Insuficiente', color: 'text-red-400' }
                    ].map(option => (
                      <label key={option.value} className="flex items-center gap-2 p-3 rounded-lg hover:bg-neutral-700/30 transition-colors cursor-pointer flex-1">
                        <input type="radio" name={`aa${index + 1}`} value={option.value} checked={formData[`aa${index + 1}` as keyof typeof formData] === option.value} onChange={handleChange} className="w-4 h-4 text-primary focus:ring-primary focus:ring-offset-neutral-800" />
                        <span className={`text-sm ${option.color}`}>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold">4</span>
                Avaliação da Supervisão
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {['Acompanhamento/Supervisão', 'Comunicação com estagiário', 'Infraestrutura'].map((label, index) => (
                <div key={label} className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-300">{label}</label>
                  <div className="flex gap-4">
                    {[
                      { value: 'otimo', label: 'Ótimo', color: 'text-green-400' },
                      { value: 'bom', label: 'Bom', color: 'text-blue-400' },
                      { value: 'regular', label: 'Regular', color: 'text-yellow-400' },
                      { value: 'insuficiente', label: 'Insuficiente', color: 'text-red-400' }
                    ].map(option => (
                      <label key={option.value} className="flex items-center gap-2 p-3 rounded-lg hover:bg-neutral-700/30 transition-colors cursor-pointer flex-1">
                        <input type="radio" name={`as${index + 1}`} value={option.value} checked={formData[`as${index + 1}` as keyof typeof formData] === option.value} onChange={handleChange} className="w-4 h-4 text-primary focus:ring-primary focus:ring-offset-neutral-800" />
                        <span className={`text-sm ${option.color}`}>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
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
