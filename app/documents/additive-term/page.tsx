'use client'

import { useRef, useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { FormExportButtons } from '@/components/FormExportButtons'
import { getDraft } from '@/lib/form-drafts'
import {
  OfficialFormTemplate,
  FormTable,
  FormField,
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
            <div className="mt-4 mb-1">
              <div className="text-[9px] font-bold uppercase bg-gray-200 border border-black px-1 py-0.5">
                1. PARTES
              </div>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormField label="INSTITUIÇÃO CONCEDENTE (EMPRESA)" colSpan={2}>
                    <FormInput type="text" name="company_name" value={formData.company_name} onChange={handleChange} />
                  </FormField>
                </tr>
                <tr>
                  <FormField label="NOME DO ESTAGIÁRIO" colSpan={2}>
                    <FormInput type="text" name="student_name" value={formData.student_name} onChange={handleChange} />
                  </FormField>
                </tr>
                <tr>
                  <FormField label="DATA DO TERMO DE COMPROMISSO ORIGINAL" colSpan={2}>
                    <FormInput type="date" name="original_term_date" value={formData.original_term_date} onChange={handleChange} />
                  </FormField>
                </tr>
              </tbody>
            </FormTable>

            <div className="mt-4 mb-1">
              <div className="text-[9px] font-bold uppercase bg-gray-200 border border-black px-1 py-0.5">
                2. ALTERAÇÕES (PREENCHER APENAS O QUE MUDA)
              </div>
            </div>

            <div className="space-y-2">
              {/* Prorrogação */}
              <div className="border border-black p-2">
                <label className="flex items-center gap-2 text-[9px] font-bold uppercase mb-2">
                  <input type="checkbox" name="change_extension" className="h-3 w-3" />
                  PRORROGAÇÃO DE VIGÊNCIA
                </label>
                <FormTable className="mb-0">
                  <tbody>
                    <tr>
                      <FormField label="NOVA DATA DE TÉRMINO">
                        <FormInput type="date" name="new_end_date" value={formData.new_end_date} onChange={handleChange} />
                      </FormField>
                    </tr>
                  </tbody>
                </FormTable>
              </div>

              {/* Bolsa */}
              <div className="border border-black p-2">
                <label className="flex items-center gap-2 text-[9px] font-bold uppercase mb-2">
                  <input type="checkbox" name="change_scholarship" className="h-3 w-3" />
                  ALTERAÇÃO DE BOLSA
                </label>
                <FormTable className="mb-0">
                  <tbody>
                    <tr>
                      <FormField label="NOVO VALOR (R$)">
                        <FormInput type="text" name="new_scholarship_value" value={formData.new_scholarship_value} onChange={handleChange} placeholder="0,00" />
                      </FormField>
                    </tr>
                  </tbody>
                </FormTable>
              </div>

              {/* Supervisor */}
              <div className="border border-black p-2">
                <label className="flex items-center gap-2 text-[9px] font-bold uppercase mb-2">
                  <input type="checkbox" name="change_supervisor" className="h-3 w-3" />
                  NOVO SUPERVISOR
                </label>
                <FormTable className="mb-0">
                  <tbody>
                    <tr>
                      <FormField label="NOME COMPLETO" colSpan={2}>
                        <FormInput type="text" name="new_supervisor_name" value={formData.new_supervisor_name} onChange={handleChange} />
                      </FormField>
                    </tr>
                    <tr>
                      <FormField label="CARGO/FORMAÇÃO">
                        <FormInput type="text" name="new_supervisor_role" value={formData.new_supervisor_role} onChange={handleChange} />
                      </FormField>
                      <FormField label="CPF">
                        <FormInput type="text" name="new_supervisor_cpf" value={formData.new_supervisor_cpf} onChange={handleChange} />
                      </FormField>
                    </tr>
                    <tr>
                      <FormField label="E-MAIL" colSpan={2}>
                        <FormInput type="email" name="new_supervisor_email" value={formData.new_supervisor_email} onChange={handleChange} />
                      </FormField>
                    </tr>
                  </tbody>
                </FormTable>
              </div>

              {/* Atividades */}
              <div className="border border-black p-2">
                <label className="flex items-center gap-2 text-[9px] font-bold uppercase mb-2">
                  <input type="checkbox" name="change_activities" className="h-3 w-3" />
                  ALTERAÇÃO NO PLANO DE ATIVIDADES
                </label>
                <FormTable className="mb-0">
                  <tbody>
                    <tr>
                      <FormField label="NOVAS ATIVIDADES">
                        <FormTextarea name="new_activities" value={formData.new_activities} onChange={handleChange} rows={4} />
                      </FormField>
                    </tr>
                  </tbody>
                </FormTable>
              </div>
            </div>

            <div className="mt-6 border border-black">
              <div className="grid grid-cols-3 divide-x divide-black">
                <div className="p-4 pb-2">
                  <SignatureSection label="REPRESENTANTE IFCE" className="mt-8" />
                </div>
                <div className="p-4 pb-2">
                  <SignatureSection label="CONCEDENTE" className="mt-8" />
                </div>
                <div className="p-4 pb-2">
                  <SignatureSection label="ESTAGIÁRIO" className="mt-8" />
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-2">
              <div className="text-[9px]">
                DATA: _____ / _____ / ________
              </div>
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
