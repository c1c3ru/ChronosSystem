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
  FormSelect,
  SignatureSection
} from '@/components/OfficialFormTemplate'

export default function CommitmentTermPage() {
  const formRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    company_name: '',
    company_address: '',
    company_representative: '',
    student_name: '',
    student_cpf: '',
    student_course: '',
    modality: '',
    start_date: '',
    end_date: '',
    insurance_number: '',
    insurance_company: '',
    remuneration_type: '',
    bolsa_value: '',
    transport_allowance: '',
    activities: '',
    expected_results: ''
  })

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await getDraft('commitment-term')
      if (draft) {
        setFormData(draft as typeof formData)
      }
    }
    loadDraft()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
            formId="commitment-term-form"
            title="TERMO DE COMPROMISSO DE ESTÁGIO"
            campus="Maracanaú"
            sector="Coordenação de Estágios"
          >
            <div className="mb-2 text-[8px]">
              <p>Nos termos da Lei nº 11.788, de 25/09/2008, celebram entre si este Termo:</p>
            </div>

            <div className="mb-2 bg-gray-50 p-2 border border-black text-[8px]">
              <p><strong>INSTITUIÇÃO DE ENSINO:</strong> IFCE Campus Maracanaú &nbsp;&nbsp;|&nbsp;&nbsp; <strong>CNPJ:</strong> 10.744.098/0009-00</p>
            </div>

            <div className="mt-4 mb-1">
              <div className="text-[9px] font-bold uppercase bg-gray-200 border border-black px-1 py-0.5">
                1. CONCEDENTE (EMPRESA)
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
                  <FormField label="ENDEREÇO COMPLETO" colSpan={2}>
                    <FormInput type="text" name="company_address" value={formData.company_address} onChange={handleChange} />
                  </FormField>
                </tr>
                <tr>
                  <FormField label="REPRESENTANTE LEGAL" colSpan={2}>
                    <FormInput type="text" name="company_representative" value={formData.company_representative} onChange={handleChange} />
                  </FormField>
                </tr>
              </tbody>
            </FormTable>

            <div className="mt-4 mb-1">
              <div className="text-[9px] font-bold uppercase bg-gray-200 border border-black px-1 py-0.5">
                2. ESTAGIÁRIO(A)
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
                  <FormField label="CURSO">
                    <FormInput type="text" name="student_course" value={formData.student_course} onChange={handleChange} />
                  </FormField>
                </tr>
              </tbody>
            </FormTable>

            <div className="mt-4 mb-1">
              <div className="text-[9px] font-bold uppercase bg-gray-200 border border-black px-1 py-0.5">
                3. CONDIÇÕES DO ESTÁGIO
              </div>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormField label="MODALIDADE">
                    <FormSelect name="modality" value={formData.modality} onChange={handleChange}>
                      <option value="">Selecione...</option>
                      <option value="presencial">Presencial</option>
                      <option value="remoto">Remoto</option>
                      <option value="hibrido">Híbrido</option>
                    </FormSelect>
                  </FormField>
                  <FormField label="DATA INÍCIO">
                    <FormInput type="date" name="start_date" value={formData.start_date} onChange={handleChange} />
                  </FormField>
                  <FormField label="DATA TÉRMINO">
                    <FormInput type="date" name="end_date" value={formData.end_date} onChange={handleChange} />
                  </FormField>
                </tr>
                <tr>
                  <FormField label="Nº DA APÓLICE DE SEGURO">
                    <FormInput type="text" name="insurance_number" value={formData.insurance_number} onChange={handleChange} />
                  </FormField>
                  <FormField label="SEGURADORA" colSpan={2}>
                    <FormInput type="text" name="insurance_company" value={formData.insurance_company} onChange={handleChange} />
                  </FormField>
                </tr>
                <tr>
                  <FormField label="REMUNERAÇÃO (BOLSA)" colSpan={2}>
                    <div className="flex gap-4 pt-1">
                      <label className="flex items-center gap-1 text-[8px]">
                        <input type="radio" name="remuneration_type" value="bolsa" checked={formData.remuneration_type === 'bolsa'} onChange={handleChange} />
                        Bolsa-Auxílio: R$
                        <FormInput type="text" name="bolsa_value" value={formData.bolsa_value} onChange={handleChange} placeholder="0,00" className="w-20 border-b border-black ml-1" />
                      </label>
                      <label className="flex items-center gap-1 text-[8px]">
                        <input type="radio" name="remuneration_type" value="nao_remunerado" checked={formData.remuneration_type === 'nao_remunerado'} onChange={handleChange} />
                        Não remunerado
                      </label>
                    </div>
                  </FormField>
                  <FormField label="AUXÍLIO-TRANSPORTE (R$)">
                    <FormInput type="text" name="transport_allowance" value={formData.transport_allowance} onChange={handleChange} placeholder="0,00" />
                  </FormField>
                </tr>
              </tbody>
            </FormTable>

            <div className="mt-4 mb-1">
              <div className="text-[9px] font-bold uppercase bg-gray-200 border border-black px-1 py-0.5">
                4. PLANO DE ATIVIDADES
              </div>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormField label="ATIVIDADES A SEREM DESENVOLVIDAS">
                    <FormTextarea name="activities" value={formData.activities} onChange={handleChange} rows={6} />
                  </FormField>
                </tr>
                <tr>
                  <FormField label="RESULTADOS ESPERADOS">
                    <FormTextarea name="expected_results" value={formData.expected_results} onChange={handleChange} rows={4} />
                  </FormField>
                </tr>
              </tbody>
            </FormTable>

            <div className="mt-6 border border-black">
              <div className="grid grid-cols-2 divide-x divide-black border-b border-black">
                <div className="p-4 pb-2">
                  <SignatureSection label="REPRESENTANTE DO IFCE" className="mt-8" />
                </div>
                <div className="p-4 pb-2">
                  <SignatureSection label="REPRESENTANTE DA CONCEDENTE" className="mt-8" />
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-black">
                <div className="p-4 pb-2">
                  <SignatureSection label="DISCENTE ESTAGIÁRIO" className="mt-8" />
                </div>
                <div className="p-4 pb-2">
                  <SignatureSection label="SUPERVISOR DO ESTÁGIO" className="mt-8" />
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
          <FormExportButtons formType="commitment-term" formRef={formRef} />
        </div>
      </div>
    </div>
  )
}
