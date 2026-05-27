'use client'

/* eslint-disable jsx-a11y/label-has-associated-control */

import React, { useRef, useEffect, useState } from 'react'
import {
  ArrowLeft,
  Save,
  FileText,
  Download,
  RefreshCw,
  User,
  ClipboardList,
  Calendar,
  Clock,
  CheckSquare,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { getDraft, saveDraft } from '@/lib/form-drafts'
import { toast } from 'sonner'
import { maskCPF, maskCEP, maskPhone } from '@/lib/input-masks'

import type { EquivalenceRequestData } from '@/lib/pdf-templates/equivalence-request.pdf'

export default function EquivalenceRequestPage() {
  const formRef = useRef<HTMLFormElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<EquivalenceRequestData>>({
    schedule: {},
    solicitation_date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await getDraft('equivalence-request')
      if (draft) {
        setFormData(draft as Partial<EquivalenceRequestData>)
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

    if (name.includes('cpf')) maskedValue = maskCPF(value)
    if (name.includes('cep')) maskedValue = maskCEP(value)
    if (name.includes('phone')) maskedValue = maskPhone(value)

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      if (name.startsWith('disability_')) {
        const disabilityKey = name.replace('disability_', '')
        const currentDisabilities = formData.disability?.split(',') || []
        let newDisabilities = []
        if (checked) {
          newDisabilities = [...currentDisabilities, disabilityKey]
        } else {
          newDisabilities = currentDisabilities.filter((d) => d !== disabilityKey)
        }
        setFormData((prev) => ({ ...prev, disability: newDisabilities.join(',') }))
      } else {
        setFormData((prev) => ({ ...prev, [name]: checked }))
      }
    } else if (name.startsWith('schedule.')) {
      const parts = name.split('.')
      const key = parts[1]
      const field = parts[2] as 'start' | 'end'
      setFormData((prev) => ({
        ...prev,
        schedule: {
          ...(prev.schedule || {}),
          [key]: {
            ...(prev.schedule?.[key] || { start: '', end: '' }),
            [field]: value,
          },
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: maskedValue }))
    }
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    await saveDraft('equivalence-request', formData)
    toast.success('Rascunho salvo com sucesso!')
    setIsSaving(false)
  }

  const handleGeneratePDF = async () => {
    try {
      toast.loading('Gerando PDF...', { id: 'pdf-generation' })
      const { buildEquivalenceRequestDoc } =
        await import('@/lib/pdf-templates/equivalence-request.pdf')
      const { generatePDF } = await import('@/lib/pdfmake-base-service')
      const doc = await buildEquivalenceRequestDoc(formData as EquivalenceRequestData)
      await generatePDF(doc, { filename: 'solicitacao-aproveitamento-experiencia.pdf' })
      toast.success('PDF gerado com sucesso!', { id: 'pdf-generation' })
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toast.error('Erro ao gerar PDF. Tente novamente.', { id: 'pdf-generation' })
    }
  }

  const days = [
    { id: 'segunda', label: 'Segunda' },
    { id: 'terca', label: 'Terça' },
    { id: 'quarta', label: 'Quarta' },
    { id: 'quinta', label: 'Quinta' },
    { id: 'sexta', label: 'Sexta' },
    { id: 'sabado', label: 'Sábado' },
    { id: 'domingo', label: 'Domingo' },
  ]

  const turns = [1, 2, 3]

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/employee"
            className="flex items-center text-primary hover:text-primary/80 transition-colors font-medium group"
          >
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
              Gerar PDF Institucional
            </Button>
          </div>
        </div>

        {/* Title */}
        <Card variant="glass" className="border-t-4 border-primary">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-xl">
                <RefreshCw className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl uppercase">
                  Solicitação de Aproveitamento de Experiência
                </CardTitle>
                <p className="text-neutral-400 text-sm mt-1">
                  Conformidade Institucional IFCE Maracanaú
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <form ref={formRef} className="space-y-6 pb-20">
          {/* Dados do Discente */}
          <Card variant="elevated">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Identificação do Discente
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <label className="label">Nome Completo</label>
                <input
                  name="student_name"
                  className="input w-full"
                  value={formData.student_name || ''}
                  onChange={handleInputChange}
                  placeholder="Nome Completo"
                  title="Nome Completo"
                />
              </div>
              <div className="md:col-span-1">
                <label className="label">CPF</label>
                <input
                  name="student_cpf"
                  className="input w-full"
                  value={formData.student_cpf || ''}
                  onChange={handleInputChange}
                  placeholder="000.000.000-00"
                  title="CPF"
                />
              </div>
              <div className="md:col-span-4">
                <label className="label">Nome Social (opcional)</label>
                <input
                  name="student_social_name"
                  className="input w-full"
                  value={formData.student_social_name || ''}
                  onChange={handleInputChange}
                  placeholder="Nome Social"
                  title="Nome Social"
                />
              </div>
              <div className="md:col-span-3">
                <label className="label">Curso</label>
                <input
                  name="student_course"
                  className="input w-full"
                  value={formData.student_course || ''}
                  onChange={handleInputChange}
                  placeholder="Nome do Curso"
                  title="Curso"
                />
              </div>
              <div className="md:col-span-1">
                <label className="label">Matrícula</label>
                <input
                  name="student_enrollment"
                  className="input w-full"
                  value={formData.student_enrollment || ''}
                  onChange={handleInputChange}
                  placeholder="Matrícula"
                  title="Matrícula"
                />
              </div>
              <div className="md:col-span-3">
                <label className="label">Endereço</label>
                <input
                  name="student_address"
                  className="input w-full"
                  value={formData.student_address || ''}
                  onChange={handleInputChange}
                  placeholder="Rua, Número, Complemento"
                  title="Endereço"
                />
              </div>
              <div className="md:col-span-1">
                <label className="label">Bairro</label>
                <input
                  name="student_neighborhood"
                  className="input w-full"
                  value={formData.student_neighborhood || ''}
                  onChange={handleInputChange}
                  placeholder="Bairro"
                  title="Bairro"
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">Município-UF</label>
                <input
                  name="student_city_uf"
                  className="input w-full"
                  value={formData.student_city_uf || ''}
                  onChange={handleInputChange}
                  placeholder="Cidade-UF"
                  title="Município-UF"
                />
              </div>
              <div className="md:col-span-1">
                <label className="label">CEP</label>
                <input
                  name="student_cep"
                  className="input w-full"
                  value={formData.student_cep || ''}
                  onChange={handleInputChange}
                  placeholder="00000-000"
                  title="CEP"
                />
              </div>
              <div className="md:col-span-1">
                <label className="label">Telefone</label>
                <input
                  name="student_phone"
                  className="input w-full"
                  value={formData.student_phone || ''}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
                  title="Telefone"
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">E-mail Institucional</label>
                <input
                  name="student_email_inst"
                  type="email"
                  className="input w-full"
                  value={formData.student_email_inst || ''}
                  onChange={handleInputChange}
                  placeholder="aluno@ifce.edu.br"
                  title="E-mail Institucional"
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">E-mail Pessoal</label>
                <input
                  name="student_email_personal"
                  type="email"
                  className="input w-full"
                  value={formData.student_email_personal || ''}
                  onChange={handleInputChange}
                  placeholder="pessoal@email.com"
                  title="E-mail Pessoal"
                />
              </div>
            </CardContent>
          </Card>

          {/* Informações Pessoais */}
          <Card variant="elevated">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" /> Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Cor/Raça */}
              <div className="space-y-3">
                <label className="label font-bold border-b border-white/10 pb-2 block">
                  COR/RAÇA
                </label>
                {['amarelo', 'branco', 'indigena', 'pardo', 'preto', 'nao_declarar'].map(
                  (option) => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="color_race"
                        value={option}
                        checked={formData.color_race === option}
                        onChange={handleInputChange}
                        className="radio"
                      />
                      <span className="text-sm text-neutral-400 group-hover:text-primary transition-colors capitalize">
                        {option.replace('_', ' ')}
                      </span>
                    </label>
                  )
                )}
              </div>

              {/* Etnia */}
              <div className="space-y-3">
                <label className="label font-bold border-b border-white/10 pb-2 block">ETNIA</label>
                {['indigena', 'quilombola', 'outra', 'nao_declarar'].map((option) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="ethnicity"
                      value={option}
                      checked={formData.ethnicity === option}
                      onChange={handleInputChange}
                      className="radio"
                    />
                    <span className="text-sm text-neutral-400 group-hover:text-primary transition-colors capitalize">
                      {option.replace('_', ' ')}
                    </span>
                  </label>
                ))}
                {formData.ethnicity === 'outra' && (
                  <input
                    name="ethnicity_other"
                    className="input w-full mt-2"
                    value={formData.ethnicity_other || ''}
                    onChange={handleInputChange}
                    placeholder="Especifique a etnia"
                    title="Outra etnia"
                  />
                )}
                <div className="pt-2">
                  <label className="label text-xs">Comunidade (se aplicável):</label>
                  <input
                    name="ethnicity_community"
                    className="input w-full"
                    value={formData.ethnicity_community || ''}
                    onChange={handleInputChange}
                    placeholder="Nome da comunidade"
                    title="Comunidade"
                  />
                </div>
              </div>

              {/* Deficiência */}
              <div className="space-y-3">
                <label className="label font-bold border-b border-white/10 pb-2 block">
                  PCD (Se houver)
                </label>
                {[
                  { id: 'alta_habilidade', label: 'Alta habilidade' },
                  { id: 'auditiva', label: 'Auditiva' },
                  { id: 'intelectual', label: 'Intelectual' },
                  { id: 'motora', label: 'Motora' },
                  { id: 'visual_baixa', label: 'Baixa visão' },
                  { id: 'visual', label: 'Visual' },
                  { id: 'surdocegueira', label: 'Surdocegueira' },
                ].map((option) => (
                  <label key={option.id} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      name={`disability_${option.id}`}
                      checked={formData.disability?.includes(option.id) || false}
                      onChange={handleInputChange}
                      className="checkbox"
                    />
                    <span className="text-sm text-neutral-400 group-hover:text-primary transition-colors">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Experiência */}
          <Card variant="elevated">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" /> Experiência a ser Aproveitada
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-white/5 hover:bg-white/5 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  name="exp_extension"
                  checked={formData.exp_extension || false}
                  onChange={handleInputChange}
                  className="checkbox"
                />
                <div>
                  <p className="text-sm font-medium">
                    Atividade de extensão, Iniciação científica ou monitoria
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border border-white/5 hover:bg-white/5 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  name="exp_employee"
                  checked={formData.exp_employee || false}
                  onChange={handleInputChange}
                  className="checkbox"
                />
                <div>
                  <p className="text-sm font-medium">Empregado de empresa privada ou pública</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border border-white/5 hover:bg-white/5 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  name="exp_third_sector"
                  checked={formData.exp_third_sector || false}
                  onChange={handleInputChange}
                  className="checkbox"
                />
                <div>
                  <p className="text-sm font-medium">
                    Membro ou empregado de instituição do terceiro setor
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border border-white/5 hover:bg-white/5 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  name="exp_public_servant"
                  checked={formData.exp_public_servant || false}
                  onChange={handleInputChange}
                  className="checkbox"
                />
                <div>
                  <p className="text-sm font-medium">Servidor público estatutário</p>
                </div>
              </label>
            </CardContent>
          </Card>

          {/* Documentos */}
          <Card variant="elevated">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Documentos Anexos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'doc_ata_third_sector', label: 'Ata de nomeação (3º setor)' },
                { id: 'doc_nomination_public', label: 'Ato de nomeação (Servidor)' },
                { id: 'doc_cnpj', label: 'Cartão CNPJ' },
                { id: 'doc_ctps', label: 'Carteira de Trabalho (CPTS)' },
                { id: 'doc_statute', label: 'Contrato Social / Estatuto' },
                { id: 'doc_activities_declaration', label: 'Declaração de atividades' },
                { id: 'doc_public_functions', label: 'Regulamento de funções públicas' },
                { id: 'doc_others', label: 'Outros documentos' },
              ].map((doc) => (
                <div key={doc.id} className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      name={doc.id}
                      checked={
                        (formData[doc.id as keyof EquivalenceRequestData] as boolean) || false
                      }
                      onChange={handleInputChange}
                      className="checkbox"
                    />
                    <span className="text-sm text-neutral-400 group-hover:text-primary transition-colors">
                      {doc.label}
                    </span>
                  </label>
                  {doc.id === 'doc_others' && formData.doc_others && (
                    <input
                      name="doc_others_desc"
                      className="input w-full"
                      value={formData.doc_others_desc || ''}
                      onChange={handleInputChange}
                      placeholder="Especifique os documentos"
                      title="Outros documentos"
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Detalhes do Estágio */}
          <Card variant="elevated">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Detalhes do Estágio
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <label className="label">Tipo de Estágio</label>
                <input
                  className="input w-full opacity-50 cursor-not-allowed"
                  value="OBRIGATÓRIO"
                  readOnly
                  title="Tipo de Estágio"
                />
              </div>
              <div className="md:col-span-1">
                <label className="label">Forma de Estágio</label>
                <select
                  name="internship_mode"
                  className="input w-full"
                  value={formData.internship_mode || ''}
                  onChange={handleInputChange}
                  title="Forma de Estágio"
                >
                  <option value="">Selecione</option>
                  <option value="presencial">Presencial</option>
                  <option value="remoto">Remoto</option>
                </select>
              </div>
              <div>
                <label className="label">Data Inicial</label>
                <input
                  type="date"
                  name="start_date"
                  className="input w-full"
                  value={formData.start_date || ''}
                  onChange={handleInputChange}
                  title="Data Inicial"
                />
              </div>
              <div>
                <label className="label">Data Final Prevista</label>
                <input
                  type="date"
                  name="end_date_expected"
                  className="input w-full"
                  value={formData.end_date_expected || ''}
                  onChange={handleInputChange}
                  title="Data Final Prevista"
                />
              </div>
              <div className="md:col-span-1">
                <label className="label">Carga Horária Semanal</label>
                <input
                  name="weekly_hours"
                  type="number"
                  className="input w-full"
                  value={formData.weekly_hours || ''}
                  onChange={handleInputChange}
                  placeholder="Ex: 30"
                  title="Carga Horária Semanal"
                />
              </div>
            </CardContent>
          </Card>

          {/* Horário */}
          <Card variant="elevated">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> Distribuição da Carga Horária
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <div className="p-6">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr>
                      <th className="p-2 border border-white/10 text-xs font-bold text-primary bg-white/5">
                        TURNO
                      </th>
                      {days.map((day) => (
                        <th
                          key={day.id}
                          colSpan={2}
                          className="p-2 border border-white/10 text-xs font-bold text-center bg-white/5"
                        >
                          {day.label.toUpperCase()}
                        </th>
                      ))}
                    </tr>
                    <tr>
                      <th className="border border-white/10"></th>
                      {days.map((day) => (
                        <React.Fragment key={`${day.id}-sub`}>
                          <th className="p-1 border border-white/10 text-[10px] text-center text-neutral-500">
                            INÍCIO
                          </th>
                          <th className="p-1 border border-white/10 text-[10px] text-center text-neutral-500">
                            FIM
                          </th>
                        </React.Fragment>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {turns.map((turn) => (
                      <tr key={turn}>
                        <td className="p-2 border border-white/10 text-xs font-bold text-center">
                          {turn}º
                        </td>
                        {days.map((day) => {
                          const key = `${day.id}_${turn}`
                          return (
                            <React.Fragment key={`${key}-inputs`}>
                              <td className="p-1 border border-white/10">
                                <input
                                  name={`schedule.${key}.start`}
                                  className="w-full bg-transparent border-none text-[11px] text-center focus:ring-1 focus:ring-primary p-1"
                                  value={formData.schedule?.[key]?.start || ''}
                                  onChange={handleInputChange}
                                  placeholder="00:00"
                                />
                              </td>
                              <td className="p-1 border border-white/10">
                                <input
                                  name={`schedule.${key}.end`}
                                  className="w-full bg-transparent border-none text-[11px] text-center focus:ring-1 focus:ring-primary p-1"
                                  value={formData.schedule?.[key]?.end || ''}
                                  onChange={handleInputChange}
                                  placeholder="00:00"
                                />
                              </td>
                            </React.Fragment>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Local e Data */}
          <Card variant="elevated">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg">Local e Data</CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Cidade-UF</label>
                <input
                  name="city_uf"
                  className="input w-full"
                  value={formData.city_uf || 'Maracanaú-CE'}
                  onChange={handleInputChange}
                  placeholder="Maracanaú-CE"
                  title="Cidade-UF"
                />
              </div>
              <div>
                <label className="label">Data da Solicitação</label>
                <input
                  type="date"
                  name="solicitation_date"
                  className="input w-full"
                  value={formData.solicitation_date || ''}
                  onChange={handleInputChange}
                  title="Data da Solicitação"
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
