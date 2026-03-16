'use client'

import { useRef, useEffect, useState } from 'react'
import { ArrowLeft, Save, FileSignature, Download } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { getDraft, saveDraft } from '@/lib/form-drafts'
import { toast } from 'sonner'
import { CommitmentTermDocument } from '@/components/templates/CommitmentTermDocument'
import { maskCPF, maskRG, maskCTPS, maskCNPJ, maskCEP, maskPhone, maskCurrency } from '@/lib/input-masks'

export default function CommitmentTermPage() {
  const formRef = useRef<HTMLFormElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    // Instituição Concedente
    company_name: '',
    company_fantasy_name: '',
    company_cnpj: '',
    company_address: '',
    company_neighborhood: '',
    company_city_state: '',
    company_zip: '',
    company_phone: '',
    company_email: '',
    company_representative: '',
    company_representative_role: '',
    company_representative_cpf: '',
    company_representative_phone: '',

    // Discente
    student_name: '',
    student_cpf: '',
    student_social_name: '',
    student_course: '',
    student_id: '',
    student_address: '',
    student_neighborhood: '',
    student_city_state: '',
    student_zip: '',
    student_phone: '',
    student_email_institutional: '',
    student_email_personal: '',

    // Estágio
    modality: 'presencial', // presencial, remota, hibrida
    start_date: '',
    end_date: '',

    // Seguro e Bolsa
    insurance_policy: '',
    insurance_company: '',
    grant_value: '',
    transport_value: '',
    has_grant: 'true',
    has_transport: 'true',

    // Docente Orientador
    advisor_name: '',
    advisor_siape: '',
    advisor_phone: '',
    advisor_email: '',

    // Supervisor
    supervisor_name: '',
    supervisor_education: '',
    supervisor_cpf: '',
    supervisor_phone: '',
    supervisor_email: '',

    // Plano de Atividades
    activities_description: '',
    expected_results: '',
    weekly_hours: '',

    // Horários (JSON string para simplificar)
    schedule: JSON.stringify({
      morning: { mon: '', tue: '', wed: '', thu: '', fri: '', sat: '' },
      afternoon: { mon: '', tue: '', wed: '', thu: '', fri: '', sat: '' },
      night: { mon: '', tue: '', wed: '', thu: '', fri: '', sat: '' }
    })
  })

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await getDraft('commitment-term')
      if (draft) {
        setFormData(prev => ({ ...prev, ...draft }))
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

    const { type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked ? 'true' : 'false' }))
    } else if (type === 'radio') {
      setFormData(prev => ({ ...prev, [name]: value }))
    } else {
      setFormData(prev => ({ ...prev, [name]: maskedValue }))
    }
  }

  const handleScheduleChange = (shift: string, day: string, value: string) => {
    const currentSchedule = JSON.parse(formData.schedule)
    currentSchedule[shift][day] = value
    setFormData(prev => ({ ...prev, schedule: JSON.stringify(currentSchedule) }))
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    await saveDraft('commitment-term', formData)
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
      const pdfDocument = <CommitmentTermDocument data={data as any} />

      // Gerar e baixar o PDF
      await generateAndDownloadPDF(pdfDocument, 'commitment-term.pdf')

      toast.success('PDF gerado com sucesso!', { id: 'pdf-generation' })
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toast.error('Erro ao gerar PDF. Tente novamente.', { id: 'pdf-generation' })
    }
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
                <FileSignature className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Termo de Compromisso de Estágio</CardTitle>
                <p className="text-neutral-400 text-sm mt-1">IFCE Campus Maracanaú - Modelo Oficial</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <form ref={formRef} className="space-y-6">
          {/* 1. Instituição Concedente */}
          <Card variant="elevated">
            <CardHeader><CardTitle className="text-lg">1. Instituição Concedente</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="company_name" value={formData.company_name} onChange={handleInputChange} placeholder="Razão Social" className="input w-full" />
                <input name="company_fantasy_name" value={formData.company_fantasy_name} onChange={handleInputChange} placeholder="Nome Fantasia" className="input w-full" />
                <input name="company_cnpj" value={formData.company_cnpj} onChange={handleInputChange} placeholder="CNPJ" className="input w-full" />
                <input name="company_phone" value={formData.company_phone} onChange={handleInputChange} placeholder="Telefone" className="input w-full" />
                <input name="company_email" value={formData.company_email} onChange={handleInputChange} placeholder="E-mail" className="input w-full" />
              </div>
              <input name="company_address" value={formData.company_address} onChange={handleInputChange} placeholder="Endereço Completo" className="input w-full" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input name="company_neighborhood" value={formData.company_neighborhood} onChange={handleInputChange} placeholder="Bairro" className="input w-full" />
                <input name="company_city_state" value={formData.company_city_state} onChange={handleInputChange} placeholder="Município-UF" className="input w-full" />
                <input name="company_zip" value={formData.company_zip} onChange={handleInputChange} placeholder="CEP" className="input w-full" />
              </div>
              <h4 className="text-sm font-semibold text-neutral-300 mt-4">Representante Legal</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="company_representative" value={formData.company_representative} onChange={handleInputChange} placeholder="Nome do Representante" className="input w-full" />
                <input name="company_representative_role" value={formData.company_representative_role} onChange={handleInputChange} placeholder="Cargo" className="input w-full" />
                <input name="company_representative_cpf" value={formData.company_representative_cpf} onChange={handleInputChange} placeholder="CPF" className="input w-full" />
                <input name="company_representative_phone" value={formData.company_representative_phone} onChange={handleInputChange} placeholder="Telefone" className="input w-full" />
              </div>
            </CardContent>
          </Card>

          {/* 2. Discente */}
          <Card variant="elevated">
            <CardHeader><CardTitle className="text-lg">2. Discente Estagiário(a)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="student_name" value={formData.student_name} onChange={handleInputChange} placeholder="Nome Completo" className="input w-full" />
                <input name="student_cpf" value={formData.student_cpf} onChange={handleInputChange} placeholder="CPF" className="input w-full" />
                <input name="student_social_name" value={formData.student_social_name} onChange={handleInputChange} placeholder="Nome Social (Opcional)" className="input w-full" />
                <input name="student_id" value={formData.student_id} onChange={handleInputChange} placeholder="Matrícula" className="input w-full" />
                <input name="student_course" value={formData.student_course} onChange={handleInputChange} placeholder="Curso" className="input w-full" />
              </div>
              <input name="student_address" value={formData.student_address} onChange={handleInputChange} placeholder="Endereço Completo" className="input w-full" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input name="student_neighborhood" value={formData.student_neighborhood} onChange={handleInputChange} placeholder="Bairro" className="input w-full" />
                <input name="student_city_state" value={formData.student_city_state} onChange={handleInputChange} placeholder="Município-UF" className="input w-full" />
                <input name="student_zip" value={formData.student_zip} onChange={handleInputChange} placeholder="CEP" className="input w-full" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input name="student_phone" value={formData.student_phone} onChange={handleInputChange} placeholder="Telefone" className="input w-full" />
                <input name="student_email_institutional" value={formData.student_email_institutional} onChange={handleInputChange} placeholder="E-mail Institucional" className="input w-full" />
                <input name="student_email_personal" value={formData.student_email_personal} onChange={handleInputChange} placeholder="E-mail Pessoal" className="input w-full" />
              </div>
            </CardContent>
          </Card>

          {/* 3. Detalhes do Estágio */}
          <Card variant="elevated">
            <CardHeader><CardTitle className="text-lg">3. Detalhes do Estágio</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Modalidade</label>
                  <select name="modality" value={formData.modality} onChange={handleInputChange} className="input w-full">
                    <option value="presencial">Presencial</option>
                    <option value="remota">Remota</option>
                    <option value="hibrida">Híbrida</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Data Início</label>
                  <input type="date" name="start_date" value={formData.start_date} onChange={handleInputChange} className="input w-full" />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Data Fim</label>
                  <input type="date" name="end_date" value={formData.end_date} onChange={handleInputChange} className="input w-full" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="insurance_policy" value={formData.insurance_policy} onChange={handleInputChange} placeholder="Nº Apólice de Seguro" className="input w-full" />
                <input name="insurance_company" value={formData.insurance_company} onChange={handleInputChange} placeholder="Nome da Seguradora" className="input w-full" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 mb-2 text-sm text-neutral-300">
                    <input type="checkbox" name="has_grant" checked={formData.has_grant === 'true'} onChange={handleInputChange} />
                    Possui Bolsa Auxílio?
                  </label>
                  {formData.has_grant === 'true' && (
                    <input name="grant_value" value={formData.grant_value} onChange={handleInputChange} placeholder="Valor da Bolsa (R$)" className="input w-full" />
                  )}
                </div>
                <div>
                  <label className="flex items-center gap-2 mb-2 text-sm text-neutral-300">
                    <input type="checkbox" name="has_transport" checked={formData.has_transport === 'true'} onChange={handleInputChange} />
                    Possui Auxílio Transporte?
                  </label>
                  {formData.has_transport === 'true' && (
                    <input name="transport_value" value={formData.transport_value} onChange={handleInputChange} placeholder="Valor do Transporte (R$)" className="input w-full" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. Orientador e Supervisor */}
          <Card variant="elevated">
            <CardHeader><CardTitle className="text-lg">4. Orientação e Supervisão</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-neutral-300 mb-2">Docente Orientador (IFCE)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="advisor_name" value={formData.advisor_name} onChange={handleInputChange} placeholder="Nome Completo" className="input w-full" />
                  <input name="advisor_siape" value={formData.advisor_siape} onChange={handleInputChange} placeholder="SIAPE" className="input w-full" />
                  <input name="advisor_phone" value={formData.advisor_phone} onChange={handleInputChange} placeholder="Telefone" className="input w-full" />
                  <input name="advisor_email" value={formData.advisor_email} onChange={handleInputChange} placeholder="E-mail" className="input w-full" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-neutral-300 mb-2">Supervisor do Estágio (Empresa)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="supervisor_name" value={formData.supervisor_name} onChange={handleInputChange} placeholder="Nome Completo" className="input w-full" />
                  <input name="supervisor_education" value={formData.supervisor_education} onChange={handleInputChange} placeholder="Formação/Experiência" className="input w-full" />
                  <input name="supervisor_cpf" value={formData.supervisor_cpf} onChange={handleInputChange} placeholder="CPF" className="input w-full" />
                  <input name="supervisor_phone" value={formData.supervisor_phone} onChange={handleInputChange} placeholder="Telefone" className="input w-full" />
                  <input name="supervisor_email" value={formData.supervisor_email} onChange={handleInputChange} placeholder="E-mail" className="input w-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 5. Plano de Atividades */}
          <Card variant="elevated">
            <CardHeader><CardTitle className="text-lg">5. Plano de Atividades</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <textarea name="activities_description" value={formData.activities_description} onChange={handleInputChange} rows={5} placeholder="Atividades a serem desenvolvidas (liste uma por linha)" className="input w-full" />
              <textarea name="expected_results" value={formData.expected_results} onChange={handleInputChange} rows={5} placeholder="Resultados esperados (liste um por linha)" className="input w-full" />

              <div>
                <label className="block text-sm text-neutral-400 mb-2">Carga Horária Semanal (Horas)</label>
                <input type="number" name="weekly_hours" value={formData.weekly_hours} onChange={handleInputChange} className="input w-full md:w-1/3" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-neutral-300">
                  <thead className="text-xs text-neutral-400 uppercase bg-neutral-800">
                    <tr>
                      <th className="px-4 py-2">Turno</th>
                      {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => <th key={d} className="px-4 py-2">{d}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {['morning', 'afternoon', 'night'].map((shift) => (
                      <tr key={shift} className="border-b border-neutral-800">
                        <td className="px-4 py-2 font-medium capitalize">{shift === 'morning' ? 'Manhã' : shift === 'afternoon' ? 'Tarde' : 'Noite'}</td>
                        {['mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((day) => (
                          <td key={day} className="px-2 py-1">
                            <input
                              className="bg-transparent border border-neutral-700 rounded px-1 py-0.5 w-20 text-center text-xs"
                              placeholder="00:00-00:00"
                              value={JSON.parse(formData.schedule)[shift][day]}
                              onChange={(e) => handleScheduleChange(shift, day, e.target.value)}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
