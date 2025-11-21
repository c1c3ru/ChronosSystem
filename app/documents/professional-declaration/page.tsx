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
            <div className="mb-4 text-xs text-neutral-700">
              <p>
                Para fins de <strong>aproveitamento</strong> de atividades profissionais como estágio supervisionado obrigatório,
                a instituição abaixo declara os seguintes fatos:
              </p>
            </div>

            <div className="mb-4">
              <h2 className="text-sm font-bold mb-3">1. Dados da Instituição/Empresa</h2>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormHeaderCell colSpan={2}>Razão Social</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell colSpan={2}>
                    <FormInput type="text" name="company_name" value={formData.company_name} onChange={handleChange} />
                  </FormDataCell>
                </tr>
                <tr>
                  <FormHeaderCell>CNPJ</FormHeaderCell>
                  <FormHeaderCell>Telefone</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell>
                    <FormInput type="text" name="company_cnpj" value={formData.company_cnpj} onChange={handleChange} />
                  </FormDataCell>
                  <FormDataCell>
                    <FormInput type="text" name="company_phone" value={formData.company_phone} onChange={handleChange} />
                  </FormDataCell>
                </tr>
                <tr>
                  <FormHeaderCell colSpan={2}>Endereço Completo</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell colSpan={2}>
                    <FormInput type="text" name="company_address" value={formData.company_address} onChange={handleChange} />
                  </FormDataCell>
                </tr>
                <tr>
                  <FormHeaderCell colSpan={2}>Responsável pela assinatura</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell colSpan={2}>
                    <FormInput type="text" name="company_representative" value={formData.company_representative} onChange={handleChange} />
                  </FormDataCell>
                </tr>
              </tbody>
            </FormTable>

            <div className="mb-4 mt-6">
              <h2 className="text-sm font-bold mb-3">2. Dados do Empregado (Aluno)</h2>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormHeaderCell colSpan={2}>Nome completo</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell colSpan={2}>
                    <FormInput type="text" name="student_name" value={formData.student_name} onChange={handleChange} />
                  </FormDataCell>
                </tr>
                <tr>
                  <FormHeaderCell>CPF</FormHeaderCell>
                  <FormHeaderCell>Início do vínculo</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell>
                    <FormInput type="text" name="student_cpf" value={formData.student_cpf} onChange={handleChange} />
                  </FormDataCell>
                  <FormDataCell>
                    <FormInput type="date" name="start_date" value={formData.start_date} onChange={handleChange} />
                  </FormDataCell>
                </tr>
                <tr>
                  <FormHeaderCell colSpan={2}>Área ou setor de trabalho</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell colSpan={2}>
                    <FormInput type="text" name="work_area" value={formData.work_area} onChange={handleChange} />
                  </FormDataCell>
                </tr>
                <tr>
                  <FormHeaderCell colSpan={2}>Descrição das atividades</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell colSpan={2}>
                    <FormTextarea name="activities_description" value={formData.activities_description} onChange={handleChange} rows={4} />
                  </FormDataCell>
                </tr>
              </tbody>
            </FormTable>

            <div className="mt-6 text-center text-xs">
              <p>Local e Data: ______________________, _____ de _______________ de _______.</p>
            </div>

            <SignatureSection label="Assinatura e carimbo do responsável pela empresa" />
          </OfficialFormTemplate>
        </div>

        <div className="no-print">
          <FormExportButtons formType="professional-declaration" formRef={formRef} />
        </div>
      </div>
    </div>
  )
}
