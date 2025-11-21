'use client'

import { useRef, useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { FormExportButtons } from '@/components/FormExportButtons'
import { getDraft } from '@/lib/form-drafts'
import {
  OfficialFormTemplate,
  FormTable,
  FormHeaderCell,
  FormDataCell,
  FormInput,
  FormTextarea,
  SignatureSection
} from '@/components/OfficialFormTemplate'

export default function AdditiveTermPage() {
  const formRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    company_name: '',
    student_name: '',
    original_term_date: '',
    new_end_date: '',
    new_scholarship_value: '',
    new_supervisor_name: '',
    new_supervisor_role: '',
    new_supervisor_cpf: '',
    new_supervisor_email: '',
    new_activities: ''
  })

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await getDraft('additive-term')
      if (draft) {
        setFormData(draft as typeof formData)
      }
    }
    loadDraft()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-[210mm] mx-auto space-y-6">
        <Link href="/employee" className="flex items-center text-secondary-400 hover:text-secondary-200 text-sm font-medium no-print">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Link>

        <div ref={formRef}>
          <OfficialFormTemplate
            formId="additive-term-form"
            title="TERMO ADITIVO A COMPROMISSO DE ESTÁGIO"
            campus="Maracanaú"
            sector="Coordenação de Estágios"
          >
            <div className="mb-4">
              <h2 className="text-sm font-bold mb-3">1. Partes</h2>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormHeaderCell colSpan={2}>Instituição Concedente (Empresa)</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell colSpan={2}>
                    <FormInput type="text" name="company_name" value={formData.company_name} onChange={handleChange} />
                  </FormDataCell>
                </tr>
                <tr>
                  <FormHeaderCell colSpan={2}>Nome do Estagiário</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell colSpan={2}>
                    <FormInput type="text" name="student_name" value={formData.student_name} onChange={handleChange} />
                  </FormDataCell>
                </tr>
                <tr>
                  <FormHeaderCell colSpan={2}>Termo de Compromisso Original (Data)</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell colSpan={2}>
                    <FormInput type="date" name="original_term_date" value={formData.original_term_date} onChange={handleChange} />
                  </FormDataCell>
                </tr>
              </tbody>
            </FormTable>

            <div className="mb-4 mt-6">
              <h2 className="text-sm font-bold mb-3">2. Das Alterações</h2>
              <p className="text-xs italic text-neutral-600 mb-4">Selecione e preencha apenas o que será alterado:</p>
            </div>

            <div className="space-y-4">
              <div className="border border-neutral-300 p-4 rounded-lg bg-white">
                <label className="flex items-start gap-3">
                  <input type="checkbox" name="change_extension" className="mt-1" />
                  <div className="flex-1">
                    <span className="font-bold text-neutral-800 block mb-2 text-xs">Prorrogação de Vigência</span>
                    <FormTable>
                      <tbody>
                        <tr>
                          <FormHeaderCell>Nova data de término</FormHeaderCell>
                        </tr>
                        <tr>
                          <FormDataCell>
                            <FormInput type="date" name="new_end_date" value={formData.new_end_date} onChange={handleChange} />
                          </FormDataCell>
                        </tr>
                      </tbody>
                    </FormTable>
                  </div>
                </label>
              </div>

              <div className="border border-neutral-300 p-4 rounded-lg bg-white">
                <label className="flex items-start gap-3">
                  <input type="checkbox" name="change_scholarship" className="mt-1" />
                  <div className="flex-1">
                    <span className="font-bold text-neutral-800 block mb-2 text-xs">Alteração de Bolsa</span>
                    <FormTable>
                      <tbody>
                        <tr>
                          <FormHeaderCell>Novo valor (R$)</FormHeaderCell>
                        </tr>
                        <tr>
                          <FormDataCell>
                            <FormInput type="text" name="new_scholarship_value" value={formData.new_scholarship_value} onChange={handleChange} placeholder="0,00" />
                          </FormDataCell>
                        </tr>
                      </tbody>
                    </FormTable>
                  </div>
                </label>
              </div>

              <div className="border border-neutral-300 p-4 rounded-lg bg-white">
                <label className="flex items-start gap-3">
                  <input type="checkbox" name="change_supervisor" className="mt-1" />
                  <div className="flex-1">
                    <span className="font-bold text-neutral-800 block mb-2 text-xs">Novo Supervisor</span>
                    <FormTable>
                      <tbody>
                        <tr>
                          <FormHeaderCell colSpan={2}>Nome</FormHeaderCell>
                        </tr>
                        <tr>
                          <FormDataCell colSpan={2}>
                            <FormInput type="text" name="new_supervisor_name" value={formData.new_supervisor_name} onChange={handleChange} />
                          </FormDataCell>
                        </tr>
                        <tr>
                          <FormHeaderCell>Cargo/Formação</FormHeaderCell>
                          <FormHeaderCell>CPF</FormHeaderCell>
                        </tr>
                        <tr>
                          <FormDataCell>
                            <FormInput type="text" name="new_supervisor_role" value={formData.new_supervisor_role} onChange={handleChange} />
                          </FormDataCell>
                          <FormDataCell>
                            <FormInput type="text" name="new_supervisor_cpf" value={formData.new_supervisor_cpf} onChange={handleChange} />
                          </FormDataCell>
                        </tr>
                        <tr>
                          <FormHeaderCell colSpan={2}>E-mail</FormHeaderCell>
                        </tr>
                        <tr>
                          <FormDataCell colSpan={2}>
                            <FormInput type="email" name="new_supervisor_email" value={formData.new_supervisor_email} onChange={handleChange} />
                          </FormDataCell>
                        </tr>
                      </tbody>
                    </FormTable>
                  </div>
                </label>
              </div>

              <div className="border border-neutral-300 p-4 rounded-lg bg-white">
                <label className="flex items-start gap-3">
                  <input type="checkbox" name="change_activities" className="mt-1" />
                  <div className="flex-1">
                    <span className="font-bold text-neutral-800 block mb-2 text-xs">Alteração no Plano de Atividades</span>
                    <FormTextarea name="new_activities" value={formData.new_activities} onChange={handleChange} rows={4} placeholder="Descreva as novas atividades..." />
                  </div>
                </label>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <SignatureSection label="Representante IFCE" />
              <SignatureSection label="Concedente" />
              <SignatureSection label="Estagiário" />
            </div>
          </OfficialFormTemplate>
        </div>

        <div className="no-print">
          <FormExportButtons formType="additive-term" formRef={formRef} />
        </div>
      </div>
    </div>
  )
}
