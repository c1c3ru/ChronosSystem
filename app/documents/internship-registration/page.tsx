'use client'

/* eslint-disable jsx-a11y/label-has-associated-control */

import React, { useRef, useEffect, useState } from 'react'
import { ArrowLeft, Save, FileText, Download } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
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

export default function InternshipRegistrationPage() {
  const formRef = useRef<HTMLFormElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [schedule, setSchedule] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await getDraft('internship-registration')
      if (draft) {
        if (formRef.current) {
          populateFormWithData(formRef.current, draft)
        }
        // Carregar schedule se existir
        if (draft.schedule) {
          try {
            setSchedule(JSON.parse(draft.schedule))
          } catch (e) {
            console.error('Erro ao parsear schedule', e)
          }
        }
        setFormData(draft)
        toast.success('Rascunho carregado!')
      }
    }
    loadDraft()
  }, [])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
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

    // Tratamento especial para checkboxes e radio buttons
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

  const handleScheduleChange = (key: string, value: string) => {
    setSchedule((prev) => {
      const newSchedule = { ...prev, [key]: value }
      setFormData((prevData: any) => ({ ...prevData, schedule: JSON.stringify(newSchedule) }))
      return newSchedule
    })
  }

  const handleSaveDraft = async () => {
    if (!formRef.current) return

    setIsSaving(true)
    // Usar o estado formData em vez de FormData para capturar radio buttons e checkboxes
    const data: any = { ...formData }

    // Adicionar schedule
    data.schedule = JSON.stringify(schedule)

    await saveDraft('internship-registration', data)
    toast.success('Rascunho salvo com sucesso!')
    setIsSaving(false)
  }

  const handleGeneratePDF = async () => {
    try {
      toast.loading('Gerando PDF...', { id: 'pdf-generation' })
      const { buildInternshipRegistrationDoc } = await import('@/lib/pdf-templates/internship-registration.pdf')
      const { generatePDF } = await import('@/lib/pdfmake-base-service')
      const raw: any = { ...formData }
      const doc = await buildInternshipRegistrationDoc({
        student_name: raw.student_name,
        student_social_name: raw.student_social_name,
        student_course: raw.student_course,
        student_enrollment: raw.student_enrollment,
        student_cpf: raw.student_cpf,
        student_email_institutional: raw.student_email_institutional,
        student_email_personal: raw.student_email_personal,
        student_phone: raw.student_phone,
        student_address: raw.student_address,
        student_neighborhood: raw.student_neighborhood,
        student_city_uf: raw.student_city_uf,
        student_zip: raw.student_zip,
        student_race: raw.student_race,
        student_ethnicity: raw.student_ethnicity,
        student_ethnicity_community: raw.student_ethnicity_community,
        student_disability: raw.student_disability,
        company_name: raw.company_name,
        company_fantasy_name: raw.company_fantasy_name,
        company_cnpj: raw.company_cnpj,
        company_phone: raw.company_phone,
        company_address: raw.company_address,
        company_neighborhood: raw.company_neighborhood,
        company_city_uf: raw.company_city_uf,
        company_zip: raw.company_zip,
        company_email: raw.company_email,
        company_representative: raw.company_representative,
        company_representative_role: raw.company_representative_role,
        company_representative_cpf: raw.company_representative_cpf,
        company_representative_phone: raw.company_representative_phone,
        company_supervisor: raw.company_supervisor,
        company_supervisor_role: raw.company_supervisor_role,
        company_supervisor_cpf: raw.company_supervisor_cpf,
        company_supervisor_phone: raw.company_supervisor_phone,
        company_sector: raw.company_sector,
        internship_type: raw.internship_type,
        internship_mode: raw.internship_mode,
        start_date: raw.start_date,
        end_date: raw.end_date,
        weekly_hours: raw.weekly_hours,
      })
      await generatePDF(doc, { filename: 'cadastro-estagio.pdf' })
      toast.success('PDF gerado com sucesso!', { id: 'pdf-generation' })
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toast.error('Erro ao gerar PDF. Tente novamente.', { id: 'pdf-generation' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
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
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Solicitação de Cadastro no Estágio</CardTitle>
                <p className="text-neutral-400 text-sm mt-1">
                  Preencha os dados abaixo para solicitar o cadastro no programa de estágio
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <form
          ref={formRef}
          className="space-y-6"
        >
          {/* 1. Dados do Discente */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg">1. Dados do Discente</CardTitle>
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Nome Social
                  </label>
                  <input
                    type="text"
                    name="student_social_name"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Nome Social"
                    placeholder="Como gostaria de ser chamado(a)"
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Endereço
                  </label>
                  <input
                    type="text"
                    name="student_address"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Endereço"
                    placeholder="Rua, Número, Apto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Bairro</label>
                  <input
                    type="text"
                    name="student_neighborhood"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Bairro"
                    placeholder="Nome do Bairro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Município/UF
                  </label>
                  <input
                    type="text"
                    name="student_city_uf"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Município/UF"
                    placeholder="Cidade/Estado"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">CEP</label>
                  <input
                    type="text"
                    name="student_zip"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="CEP"
                    placeholder="00000-000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    name="student_phone"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Telefone"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Email Institucional
                  </label>
                  <input
                    type="email"
                    name="student_email_institutional"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Email Institucional"
                    placeholder="aluno@ifce.edu.br"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Email Pessoal
                  </label>
                  <input
                    type="email"
                    name="student_email_personal"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Email Pessoal"
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Informações Complementares */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg">2. Informações Complementares</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Cor/Raça</label>
                <div className="flex flex-wrap gap-4">
                  {['amarelo', 'branco', 'indigena', 'pardo', 'preto', 'nao_declarar'].map(
                    (opt) => (
                      <label key={opt} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="student_race"
                          value={opt}
                          onChange={handleInputChange}
                          className="checkbox"
                          title={`Cor/Raça: ${opt}`}
                        />
                        <span className="capitalize">{opt.replace('_', ' ')}</span>
                      </label>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Etnia</label>
                <div className="flex flex-wrap gap-4 mb-2">
                  {['indigena', 'quilombola', 'outra', 'nao_declarar'].map((opt) => (
                    <label key={opt} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="student_ethnicity"
                        value={opt}
                        onChange={handleInputChange}
                        className="checkbox"
                        title={`Etnia: ${opt}`}
                      />
                      <span className="capitalize">{opt.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
                <input
                  type="text"
                  name="student_ethnicity_community"
                  placeholder="Comunidade (se aplicável)"
                  title="Comunidade"
                  className="input w-full"
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Pessoa com Deficiência
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { val: 'alta_habilidade', label: 'Alta habilidade/superdotação' },
                    { val: 'auditiva', label: 'Deficiência auditiva' },
                    { val: 'intelectual', label: 'Deficiência intelectual' },
                    { val: 'motora', label: 'Deficiência motora' },
                    { val: 'visual_baixa', label: 'Deficiência visual/baixa visão' },
                    { val: 'visual', label: 'Deficiência visual' },
                    { val: 'surdocegueira', label: 'Surdocegueira' },
                  ].map((opt) => (
                    <label key={opt.val} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="student_disability"
                        value={opt.val}
                        onChange={handleInputChange}
                        className="checkbox"
                        title={`Deficiência: ${opt.label}`}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Instituição Concedente */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg">3. Instituição Concedente</CardTitle>
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Nome Fantasia
                  </label>
                  <input
                    type="text"
                    name="company_fantasy_name"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Nome Fantasia"
                    placeholder="Nome Fantasia"
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
                    Telefone
                  </label>
                  <input
                    type="text"
                    name="company_phone"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Telefone"
                    placeholder="(00) 0000-0000"
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
                    placeholder="Endereço da Empresa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Bairro</label>
                  <input
                    type="text"
                    name="company_neighborhood"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Bairro"
                    placeholder="Bairro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Município/UF
                  </label>
                  <input
                    type="text"
                    name="company_city_uf"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Município/UF"
                    placeholder="Cidade/Estado"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">CEP</label>
                  <input
                    type="text"
                    name="company_zip"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="CEP"
                    placeholder="00000-000"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Email</label>
                  <input
                    type="email"
                    name="company_email"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Email"
                    placeholder="empresa@exemplo.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Responsável Legal
                  </label>
                  <input
                    type="text"
                    name="company_representative"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Responsável Legal"
                    placeholder="Nome do Responsável Legal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Cargo do Responsável
                  </label>
                  <input
                    type="text"
                    name="company_representative_role"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Cargo do Responsável"
                    placeholder="Cargo/Função"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    CPF do Responsável
                  </label>
                  <input
                    type="text"
                    name="company_representative_cpf"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="CPF do Responsável"
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Telefone do Responsável
                  </label>
                  <input
                    type="text"
                    name="company_representative_phone"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Telefone do Responsável"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="md:col-span-2">
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
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Cargo do Supervisor
                  </label>
                  <input
                    type="text"
                    name="company_supervisor_role"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Cargo do Supervisor"
                    placeholder="Cargo/Função"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    CPF do Supervisor
                  </label>
                  <input
                    type="text"
                    name="company_supervisor_cpf"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="CPF do Supervisor"
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Telefone do Supervisor
                  </label>
                  <input
                    type="text"
                    name="company_supervisor_phone"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Telefone do Supervisor"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Setor de Realização
                  </label>
                  <input
                    type="text"
                    name="company_sector"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Setor de Realização"
                    placeholder="Nome do Setor/Departamento"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. Dados do Estágio */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg">4. Dados do Estágio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Tipo de Estágio
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="internship_type"
                        value="obrigatorio"
                        onChange={handleInputChange}
                        className="checkbox"
                        title="Estágio Obrigatório"
                      />
                      <span>Obrigatório</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="internship_type"
                        value="nao_obrigatorio"
                        onChange={handleInputChange}
                        className="checkbox"
                        title="Estágio Não Obrigatório"
                      />
                      <span>Não Obrigatório</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Forma de Estágio
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="internship_mode"
                        value="presencial"
                        onChange={handleInputChange}
                        className="checkbox"
                        title="Modalidade Presencial"
                      />
                      <span>Presencial</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="internship_mode"
                        value="remoto"
                        onChange={handleInputChange}
                        className="checkbox"
                        title="Modalidade Remota"
                      />
                      <span>Remoto</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Data Inicial
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Data Inicial"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Data Final Prevista
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Data Final Prevista"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Carga Horária Semanal
                  </label>
                  <input
                    type="number"
                    name="weekly_hours"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Carga Horária Semanal"
                    placeholder="00"
                  />
                </div>
              </div>

              {/* Tabela de Horários */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Horário do Estágio
                </label>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-neutral-300">
                    <thead className="text-xs text-neutral-400 uppercase bg-neutral-800">
                      <tr>
                        <th className="px-2 py-2">Turno</th>
                        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'].map((d) => (
                          <th key={d} className="px-2 py-2 text-center" colSpan={2}>
                            {d}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {['1º', '2º', '3º'].map((turno, idx) => (
                        <tr key={idx} className="border-b border-neutral-700">
                          <td className="px-2 py-2 font-medium">{turno}</td>
                          {['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'].map((day) => (
                            <React.Fragment key={day}>
                              <td className="px-1 py-1">
                                <input
                                  type="time"
                                  className="bg-neutral-800 border-none rounded px-1 py-0.5 w-16 text-xs"
                                  value={schedule[`${day}_start_${idx + 1}`] || ''}
                                  onChange={(e) =>
                                    handleScheduleChange(`${day}_start_${idx + 1}`, e.target.value)
                                  }
                                  title={`Entrada ${day} - Turno ${idx + 1}`}
                                />
                              </td>
                              <td className="px-1 py-1">
                                <input
                                  type="time"
                                  className="bg-neutral-800 border-none rounded px-1 py-0.5 w-16 text-xs"
                                  value={schedule[`${day}_end_${idx + 1}`] || ''}
                                  onChange={(e) =>
                                    handleScheduleChange(`${day}_end_${idx + 1}`, e.target.value)
                                  }
                                  title={`Saída ${day} - Turno ${idx + 1}`}
                                />
                              </td>
                            </React.Fragment>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
