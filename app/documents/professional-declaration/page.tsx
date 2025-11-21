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

export default function ProfessionalDeclarationPage() {
  const formRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    company_name: '',
    company_cnpj: '',
    company_phone: '',
    company_address: '',
    company_representative: '',
    student_name: '',
    student_cpf: '',
    start_date: '',
    work_area: '',
    activities_description: ''
  })

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await getDraft('professional-declaration')
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
            formId="professional-declaration-form"
            title="DECLARAÇÃO DE ATIVIDADES PROFISSIONAIS"
            campus="Maracanaú"
            sector="Coordenação de Estágios"
          >
            <div className="mb-4 text-[9pt] text-justify px-1">
              <p>
                Para fins de <strong>aproveitamento</strong> de atividades profissionais como estágio supervisionado obrigatório,
                a instituição abaixo declara os seguintes fatos:
              </p>
            </div>

            <div className="mt-4 mb-1">
              <div className="text-[9px] font-bold uppercase bg-gray-200 border border-black px-1 py-0.5">
                1. DADOS DA INSTITUIÇÃO/EMPRESA
              </div>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormField label="RAZÃO SOCIAL" colSpan={2}>
                    <FormInput type="text" name="company_name" value={formData.company_name} onChange={handleChange} />
                  </FormField>
                </tr>
                <tr>
                  <FormField label="CNPJ">
                    <FormInput type="text" name="company_cnpj" value={formData.company_cnpj} onChange={handleChange} />
                  </FormField>
                  <FormField label="TELEFONE">
                    <FormInput type="text" name="company_phone" value={formData.company_phone} onChange={handleChange} />
                  </FormField>
                </tr>
                <tr>
                  <FormField label="ENDEREÇO COMPLETO" colSpan={2}>
                    <FormInput type="text" name="company_address" value={formData.company_address} onChange={handleChange} />
                  </FormField>
                </tr>
                <tr>
                  <FormField label="RESPONSÁVEL PELA ASSINATURA" colSpan={2}>
                    <FormInput type="text" name="company_representative" value={formData.company_representative} onChange={handleChange} />
                  </FormField>
                </tr>
              </tbody>
            </FormTable>

            <div className="mt-4 mb-1">
              <div className="text-[9px] font-bold uppercase bg-gray-200 border border-black px-1 py-0.5">
                2. DADOS DO EMPREGADO (ALUNO)
              </div>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormField label="NOME COMPLETO" colSpan={2}>
                    <FormInput type="text" name="student_name" value={formData.student_name} onChange={handleChange} />
                  </FormField>
                </tr>
                <tr>
                  <FormField label="CPF">
                    <FormInput type="text" name="student_cpf" value={formData.student_cpf} onChange={handleChange} />
                  </FormField>
                  <FormField label="INÍCIO DO VÍNCULO">
                    <FormInput type="date" name="start_date" value={formData.start_date} onChange={handleChange} />
                  </FormField>
                </tr>
                <tr>
                  <FormField label="ÁREA OU SETOR DE TRABALHO" colSpan={2}>
                    <FormInput type="text" name="work_area" value={formData.work_area} onChange={handleChange} />
                  </FormField>
                </tr>
                <tr>
                  <FormField label="DESCRIÇÃO DAS ATIVIDADES" colSpan={2}>
                    <FormTextarea name="activities_description" value={formData.activities_description} onChange={handleChange} rows={6} />
                  </FormField>
                </tr>
              </tbody>
            </FormTable>

            <div className="mt-8 border border-black p-4">
              <SignatureSection label="ASSINATURA E CARIMBO DO RESPONSÁVEL PELA EMPRESA" date={true} />
            </div>
          </OfficialFormTemplate>
        </div>

        <div className="no-print">
          <FormExportButtons formType="professional-declaration" formRef={formRef} />
        </div>
      </div>
    </div>
  )
}
