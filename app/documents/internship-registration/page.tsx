'use client'

import { useRef, useEffect, useState } from 'react'
import { ArrowLeft, Save, FileText, Download } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { getDraft, saveDraft, populateFormWithData } from '@/lib/form-drafts'
import { toast } from 'sonner'

export default function InternshipRegistrationPage() {
  const formRef = useRef<HTMLFormElement>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Carrega rascunho salvo
    const loadDraft = async () => {
      const draft = await getDraft('internship-registration')
      if (draft && formRef.current) {
        populateFormWithData(formRef.current, draft)
        toast.success('Rascunho carregado!')
      }
    }

    loadDraft()
  }, [])

  const handleSaveDraft = async () => {
    if (!formRef.current) return

    setIsSaving(true)
    const formData = new FormData(formRef.current)
    const data = Object.fromEntries(formData.entries())

    await saveDraft('internship-registration', data)
    toast.success('Rascunho salvo com sucesso!')
    setIsSaving(false)
  }

  const handleGeneratePDF = async () => {
    try {
      if (!formRef.current) return

      const formData = new FormData(formRef.current)
      const data = Object.fromEntries(formData.entries())

      const hasData = Object.values(data).some(value => value !== '')
      if (!hasData) {
        toast.error('Preencha pelo menos um campo antes de gerar o PDF')
        return
      }

      toast.loading('Gerando PDF...', { id: 'pdf-generation' })

      const { generateFormPDF } = await import('@/lib/pdf-generator')
      await generateFormPDF(formRef, 'cadastro-estagio', data)

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
            <Button
              onClick={handleSaveDraft}
              variant="secondary"
              size="sm"
              disabled={isSaving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Salvando...' : 'Salvar Rascunho'}
            </Button>
            <Button
              onClick={handleGeneratePDF}
              variant="primary"
              size="sm"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Gerar PDF
            </Button>
          </div>
        </div>

        {/* Title Card */}
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

        <form ref={formRef} className="space-y-6">
          {/* Seção 1: Dados do Discente */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold">
                  1
                </span>
                Dados do Discente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    name="student_name"
                    className="input w-full"
                    placeholder="Digite seu nome completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    CPF
                  </label>
                  <input
                    type="text"
                    name="student_cpf"
                    className="input w-full"
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Nome Social <span className="text-neutral-500 text-xs">(opcional)</span>
                </label>
                <input
                  type="text"
                  name="student_social_name"
                  className="input w-full"
                  placeholder="Digite seu nome social, se houver"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Curso
                  </label>
                  <input
                    type="text"
                    name="student_course"
                    className="input w-full"
                    placeholder="Ex: Análise e Desenvolvimento de Sistemas"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Matrícula
                  </label>
                  <input
                    type="text"
                    name="student_id"
                    className="input w-full"
                    placeholder="000000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Endereço Completo
                </label>
                <input
                  type="text"
                  name="student_address"
                  className="input w-full"
                  placeholder="Rua, número, complemento"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Bairro
                  </label>
                  <input
                    type="text"
                    name="student_neighborhood"
                    className="input w-full"
                    placeholder="Digite o bairro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Município/UF
                  </label>
                  <input
                    type="text"
                    name="student_city_state"
                    className="input w-full"
                    placeholder="Ex: Fortaleza/CE"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    CEP
                  </label>
                  <input
                    type="text"
                    name="student_zip"
                    className="input w-full"
                    placeholder="00000-000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Telefone
                  </label>
                  <input
                    type="text"
                    name="student_phone"
                    className="input w-full"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    E-mail Institucional
                  </label>
                  <input
                    type="email"
                    name="student_email"
                    className="input w-full"
                    placeholder="seu.email@aluno.ifce.edu.br"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seção 2: Informações Adicionais */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold">
                  2
                </span>
                Informações Adicionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-3">
                    Cor/Raça
                  </label>
                  <div className="space-y-2">
                    {['Amarelo(a)', 'Branco(a)', 'Indígena', 'Pardo(a)', 'Preto(a)'].map(option => (
                      <label key={option} className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-700/30 transition-colors cursor-pointer">
                        <input
                          type="radio"
                          name="race"
                          value={option}
                          className="w-4 h-4 text-primary focus:ring-primary focus:ring-offset-neutral-800"
                        />
                        <span className="text-neutral-300">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-3">
                    Pessoa com Deficiência
                  </label>
                  <div className="space-y-2">
                    {['Auditiva', 'Visual', 'Motora', 'Intelectual'].map(option => (
                      <label key={option} className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-700/30 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          name={`pcd_${option.toLowerCase()}`}
                          className="w-4 h-4 text-primary rounded focus:ring-primary focus:ring-offset-neutral-800"
                        />
                        <span className="text-neutral-300">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seção 3: Dados da Concedente */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold">
                  3
                </span>
                Dados da Empresa Concedente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Razão Social
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    className="input w-full"
                    placeholder="Nome da empresa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    name="company_cnpj"
                    className="input w-full"
                    placeholder="00.000.000/0000-00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Endereço Completo
                </label>
                <input
                  type="text"
                  name="company_address"
                  className="input w-full"
                  placeholder="Endereço da empresa"
                />
              </div>

              <div className="border-t border-neutral-700 pt-4 mt-6">
                <h4 className="text-sm font-semibold text-neutral-300 mb-4">
                  Supervisor do Estágio
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Nome
                    </label>
                    <input
                      type="text"
                      name="supervisor_name"
                      className="input w-full"
                      placeholder="Nome do supervisor"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Cargo
                    </label>
                    <input
                      type="text"
                      name="supervisor_role"
                      className="input w-full"
                      placeholder="Cargo do supervisor"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Telefone
                    </label>
                    <input
                      type="text"
                      name="supervisor_phone"
                      className="input w-full"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seção 4: Detalhes do Estágio */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold">
                  4
                </span>
                Detalhes do Estágio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Data Inicial
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Data Final
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Carga Horária Semanal
                  </label>
                  <input
                    type="number"
                    name="weekly_hours"
                    className="input w-full"
                    placeholder="Ex: 20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-3">
                  Quadro de Horários
                </label>
                <div className="overflow-x-auto">
                  <table className="w-full border border-neutral-700 rounded-lg overflow-hidden">
                    <thead className="bg-neutral-800">
                      <tr>
                        <th className="p-3 text-left text-sm font-medium text-neutral-300 border-r border-neutral-700">
                          Turno
                        </th>
                        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                          <th key={day} className="p-3 text-center text-sm font-medium text-neutral-300 border-r border-neutral-700 last:border-r-0">
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {['Manhã', 'Tarde'].map(shift => (
                        <tr key={shift} className="border-t border-neutral-700">
                          <td className="p-3 font-medium text-neutral-300 bg-neutral-800/50 border-r border-neutral-700">
                            {shift}
                          </td>
                          {['mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map(day => (
                            <td key={day} className="p-2 border-r border-neutral-700 last:border-r-0">
                              <input
                                type="text"
                                name={`${shift.toLowerCase()}_${day}`}
                                className="input w-full text-center text-sm"
                                placeholder="00:00"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-4 pb-8">
            <Button
              type="button"
              variant="secondary"
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Salvando...' : 'Salvar Rascunho'}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleGeneratePDF}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Gerar PDF Oficial
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
