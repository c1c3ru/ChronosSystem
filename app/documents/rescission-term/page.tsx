'use client'

/* eslint-disable jsx-a11y/label-has-associated-control */

import { useRef, useEffect, useState } from 'react'
import { ArrowLeft, Save, FileText, Download, XCircle } from 'lucide-react'
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
  maskOnlyText,
} from '@/lib/input-masks'

export default function RescissionTermPage() {
  const formRef = useRef<HTMLFormElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await getDraft('rescission-term')
      if (draft) {
        if (formRef.current) {
          populateFormWithData(formRef.current, draft)
        }
        setFormData(draft as Record<string, string>)
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
    } else if (name.includes('cargo') || name.includes('role')) {
      maskedValue = maskOnlyText(value)
    }

    // Atualizar o valor do input com a máscara
    if (maskedValue !== value && e.target instanceof HTMLInputElement) {
      e.target.value = maskedValue
    }

    // Tratamento especial para checkboxes e radio buttons
    const { type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev: Record<string, string>) => ({ ...prev, [name]: checked ? value : '' }))
    } else if (type === 'radio') {
      // Radio buttons: sempre salvar o value quando selecionado
      setFormData((prev: Record<string, string>) => ({ ...prev, [name]: value }))
    } else {
      setFormData((prev: Record<string, string>) => ({ ...prev, [name]: maskedValue }))
    }
  }

  const handleSaveDraft = async () => {
    if (!formRef.current) return

    setIsSaving(true)
    // Usar o estado formData em vez de FormData para capturar radio buttons e checkboxes
    const data: Record<string, string> = { ...formData }

    await saveDraft('rescission-term', data)
    toast.success('Rascunho salvo com sucesso!')
    setIsSaving(false)
  }

  const handleGeneratePDF = async () => {
    try {
      toast.loading('Gerando PDF...', { id: 'pdf-generation' })
      const { buildRescissionTermDoc } = await import('@/lib/pdf-templates/rescission-term.pdf')
      const { generatePDF } = await import('@/lib/pdfmake-base-service')
      const doc = await buildRescissionTermDoc({
        // IFCE
        campus_name: formData.campus_name,
        campus_cnpj: formData.campus_cnpj,
        campus_address: formData.campus_address,
        campus_neighborhood: formData.campus_neighborhood,
        campus_city: formData.campus_city,
        campus_cep: formData.campus_cep,
        campus_phone: formData.campus_phone,
        campus_email: formData.campus_email,
        campus_representative: formData.campus_representative,
        campus_rep_role: formData.campus_rep_role,
        campus_rep_siape: formData.campus_rep_siape,
        // Concedente
        company_name: formData.company_name,
        company_fantasy_name: formData.company_fantasy_name,
        company_cnpj: formData.company_cnpj,
        company_address: formData.company_address,
        company_neighborhood: formData.company_neighborhood,
        company_city: formData.company_city,
        company_cep: formData.company_cep,
        company_phone: formData.company_phone,
        company_email: formData.company_email,
        company_representative: formData.company_representative,
        company_rep_role: formData.company_rep_role,
        company_rep_cpf: formData.company_representative_cpf,
        company_rep_phone: formData.company_rep_phone,
        // Discente
        student_name: formData.student_name,
        student_social_name: formData.student_social_name,
        student_cpf: formData.student_cpf,
        student_rg: formData.student_rg,
        student_course: formData.student_course,
        student_enrollment: formData.student_enrollment,
        student_address: formData.student_address,
        student_neighborhood: formData.student_neighborhood,
        student_city: formData.student_city,
        student_cep: formData.student_cep,
        student_phone: formData.student_phone,
        student_email: formData.student_email_inst,
        // Contrato
        internship_type: formData.internship_type as 'obrigatorio' | 'nao_obrigatorio' | undefined,
        internship_mode: formData.internship_mode as 'presencial' | 'virtual' | undefined,
        internship_start_date: formData.internship_start_date,
        internship_end_date: formData.internship_end_date,
        original_term_date: formData.original_term_date,
        total_hours_realized: formData.total_hours_realized,
        // Rescisão
        initiator: formData.initiator as 'ifce' | 'company' | 'student' | undefined,
        reason: formData.reason as 'breach' | 'completion' | 'abandonment_activities' | 'abandonment_course' | 'cancellation' | 'suspension' | 'other' | undefined,
        reason_other: formData.reason_other,
        rescission_date: formData.rescission_date,
        rescission_reason: formData.rescission_reason,
        city: formData.city,
      })
      await generatePDF(doc, { filename: 'termo-rescisao.pdf' })
      toast.success('PDF gerado com sucesso!', { id: 'pdf-generation' })
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toast.error('Erro ao gerar PDF. Tente novamente.', { id: 'pdf-generation' })
    }
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
                <XCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Termo de Rescisão de Contrato de Estágio</CardTitle>
                <p className="text-neutral-400 text-sm mt-1">
                  Documento para formalizar o encerramento antecipado do estágio
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <form ref={formRef} className="space-y-6">
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Nome Social (opcional)
                  </label>
                  <input
                    type="text"
                    name="student_social_name"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Nome Social"
                    placeholder="Nome Social"
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
                    placeholder="Endereço Completo"
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
                    placeholder="Bairro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Município-UF
                  </label>
                  <input
                    type="text"
                    name="student_city"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Município-UF"
                    placeholder="Cidade-UF"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">CEP</label>
                  <input
                    type="text"
                    name="student_cep"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="CEP"
                    placeholder="00000-000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    DDD + Telefone
                  </label>
                  <input
                    type="text"
                    name="student_phone"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="Telefone"
                    placeholder="Ex: (85) 99999-9999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    E-mail Institucional
                  </label>
                  <input
                    type="email"
                    name="student_email_inst"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="E-mail Institucional"
                    placeholder="aluno@ifce.edu.br"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    E-mail Pessoal
                  </label>
                  <input
                    type="email"
                    name="student_email_personal"
                    className="input w-full"
                    onChange={handleInputChange}
                    title="E-mail Pessoal"
                    placeholder="pessoal@email.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* IFCE Campus */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg">Instituição de Ensino — IFCE Campus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Campus</label>
                  <input type="text" name="campus_name" className="input w-full" onChange={handleInputChange} title="Campus" placeholder="Ex: Maracanaú" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">CNPJ</label>
                  <input type="text" name="campus_cnpj" className="input w-full" onChange={handleInputChange} title="CNPJ" placeholder="00.000.000/0000-00" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Endereço</label>
                  <input type="text" name="campus_address" className="input w-full" onChange={handleInputChange} title="Endereço" placeholder="Logradouro, Número e Complemento" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Bairro</label>
                  <input type="text" name="campus_neighborhood" className="input w-full" onChange={handleInputChange} title="Bairro" placeholder="Bairro" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Município</label>
                  <input type="text" name="campus_city" className="input w-full" onChange={handleInputChange} title="Município" placeholder="Município" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">CEP</label>
                  <input type="text" name="campus_cep" className="input w-full" onChange={handleInputChange} title="CEP" placeholder="00000-000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">DDD + Telefone</label>
                  <input type="text" name="campus_phone" className="input w-full" onChange={handleInputChange} title="Telefone" placeholder="(00) 0000-0000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">E-mail</label>
                  <input type="email" name="campus_email" className="input w-full" onChange={handleInputChange} title="E-mail" placeholder="campus@ifce.edu.br" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Representante (para este fim específico)</label>
                  <input type="text" name="campus_representative" className="input w-full" onChange={handleInputChange} title="Representante" placeholder="Nome Completo" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Cargo/Qualificação</label>
                  <input type="text" name="campus_rep_role" className="input w-full" onChange={handleInputChange} title="Cargo/Qualificação" placeholder="Cargo (somente texto)" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">SIAPE</label>
                  <input type="text" name="campus_rep_siape" className="input w-full" onChange={handleInputChange} title="SIAPE" placeholder="SIAPE" />
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
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Razão Social</label>
                  <input type="text" name="company_name" className="input w-full" onChange={handleInputChange} title="Razão Social" placeholder="Razão Social da Empresa" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Nome Fantasia / Pessoa Física</label>
                  <input type="text" name="company_fantasy_name" className="input w-full" onChange={handleInputChange} title="Nome Fantasia" placeholder="Nome Fantasia" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">CNPJ ou Registro</label>
                  <input type="text" name="company_cnpj" className="input w-full" onChange={handleInputChange} title="CNPJ" placeholder="00.000.000/0000-00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">DDD + Telefone</label>
                  <input type="text" name="company_phone" className="input w-full" onChange={handleInputChange} title="Telefone" placeholder="Ex: (85) 3333-3333" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Endereço</label>
                  <input type="text" name="company_address" className="input w-full" onChange={handleInputChange} title="Endereço" placeholder="Endereço Completo da Empresa" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Bairro</label>
                  <input type="text" name="company_neighborhood" className="input w-full" onChange={handleInputChange} title="Bairro" placeholder="Bairro" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Município</label>
                  <input type="text" name="company_city" className="input w-full" onChange={handleInputChange} title="Município" placeholder="Município" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">CEP</label>
                  <input type="text" name="company_cep" className="input w-full" onChange={handleInputChange} title="CEP" placeholder="00000-000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">E-mail</label>
                  <input type="email" name="company_email" className="input w-full" onChange={handleInputChange} title="E-mail" placeholder="empresa@email.com" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Representante Legal</label>
                  <input type="text" name="company_representative" className="input w-full" onChange={handleInputChange} title="Representante Legal" placeholder="Nome do Representante Legal" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Cargo/Qualificação</label>
                  <input type="text" name="company_rep_role" className="input w-full" onChange={handleInputChange} title="Cargo/Qualificação" placeholder="Cargo (somente texto)" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">CPF do Representante</label>
                  <input type="text" name="company_representative_cpf" className="input w-full" onChange={handleInputChange} title="CPF do Representante" placeholder="000.000.000-00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">DDD + Telefone do Representante</label>
                  <input type="text" name="company_rep_phone" className="input w-full" onChange={handleInputChange} title="Telefone do Representante" placeholder="(00) 00000-0000" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados do Estágio e Rescisão */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg">Dados do Estágio e Rescisão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Tipo de Estágio</label>
                  <select name="internship_type" className="input w-full" onChange={handleInputChange} title="Tipo de Estágio">
                    <option value="">Selecione</option>
                    <option value="obrigatorio">Obrigatório</option>
                    <option value="nao_obrigatorio">Não Obrigatório</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Modo de Estágio</label>
                  <select name="internship_mode" className="input w-full" onChange={handleInputChange} title="Modo de Estágio">
                    <option value="">Selecione</option>
                    <option value="presencial">Presencial</option>
                    <option value="virtual">Virtual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Data de Início do Estágio</label>
                  <input type="date" name="internship_start_date" className="input w-full" onChange={handleInputChange} title="Data de Início do Estágio" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Data Prevista de Término</label>
                  <input type="date" name="internship_end_date" className="input w-full" onChange={handleInputChange} title="Data Prevista de Término" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Data do Termo Original</label>
                  <input type="date" name="original_term_date" className="input w-full" onChange={handleInputChange} title="Data do Termo Original" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Horas Realizadas até a Rescisão</label>
                  <input type="number" name="total_hours_realized" className="input w-full" onChange={handleInputChange} title="Horas Realizadas" placeholder="Ex: 200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary font-bold mb-1">Data da Rescisão</label>
                  <input type="date" name="rescission_date" className="input w-full border-primary" onChange={handleInputChange} title="Data da Rescisão" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Cidade</label>
                  <input type="text" name="city" className="input w-full" defaultValue="Fortaleza" onChange={handleInputChange} title="Cidade" placeholder="Fortaleza" />
                </div>
              </div>

              <div className="space-y-3 border-t border-neutral-800 pt-4">
                <label className="block text-sm font-semibold text-neutral-300">Iniciativa da Rescisão</label>
                {([['ifce', 'Pelo IFCE'], ['company', 'Pela Concedente'], ['student', 'Pelo Discente Estagiário']] as const).map(([val, label]) => (
                  <label key={val} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="initiator" value={val} onChange={handleInputChange} className="radio" />
                    <span className="text-sm text-neutral-300">{label}</span>
                  </label>
                ))}
              </div>

              <div className="space-y-3 border-t border-neutral-800 pt-4">
                <label className="block text-sm font-semibold text-neutral-300">Tipo de Rescisão</label>
                {([
                  ['breach', 'a) Descumprimento de cláusula(s) do Termo de Compromisso'],
                  ['completion', 'b) Conclusão do curso'],
                  ['abandonment_activities', 'c) Abandono das atividades de estágio'],
                  ['abandonment_course', 'd) Abandono do semestre ou do curso'],
                  ['cancellation', 'e) Cancelamento de matrícula'],
                  ['suspension', 'f) Trancamento de matrícula'],
                  ['other', 'g) Outra'],
                ] as const).map(([val, label]) => (
                  <label key={val} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="reason" value={val} onChange={handleInputChange} className="radio" />
                    <span className="text-sm text-neutral-300">{label}</span>
                  </label>
                ))}
                {formData.reason === 'other' && (
                  <input type="text" name="reason_other" className="input w-full ml-6" onChange={handleInputChange} title="Especifique o motivo" placeholder="Especifique o motivo" />
                )}
              </div>

              <div className="border-t border-neutral-800 pt-4">
                <label className="block text-sm font-medium text-neutral-300 mb-1">Justificativa / Descrição do Motivo</label>
                <textarea name="rescission_reason" rows={4} className="input w-full" onChange={handleInputChange} title="Justificativa" placeholder="Descreva o motivo da rescisão do estágio" />
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
