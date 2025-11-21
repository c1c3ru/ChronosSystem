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
            <div className="mb-4 text-xs">
              <p>Nos termos da Lei nº 11.788, de 25/09/2008, celebram entre si este Termo:</p>
            </div>

            <div className="mb-4 bg-neutral-50 p-3 border border-neutral-300 rounded text-xs">
              <p><strong>INSTITUIÇÃO DE ENSINO:</strong> IFCE Campus Maracanaú</p>
              <p><strong>CNPJ:</strong> 10.744.098/0009-00</p>
            </div>

            <div className="mb-4">
              <h2 className="text-sm font-bold mb-3">CONCEDENTE (EMPRESA)</h2>
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
                  <FormHeaderCell colSpan={2}>Endereço</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell colSpan={2}>
                    <FormInput type="text" name="company_address" value={formData.company_address} onChange={handleChange} />
                  </FormDataCell>
                </tr>
                <tr>
                  <FormHeaderCell colSpan={2}>Representante Legal</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell colSpan={2}>
                    <FormInput type="text" name="company_representative" value={formData.company_representative} onChange={handleChange} />
                  </FormDataCell>
                </tr>
              </tbody>
            </FormTable>

            <div className="mb-4 mt-6">
              <h2 className="text-sm font-bold mb-3">ESTAGIÁRIO(A)</h2>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormHeaderCell colSpan={2}>Nome Completo</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell colSpan={2}>
                    <FormInput type="text" name="student_name" value={formData.student_name} onChange={handleChange} />
                  </FormDataCell>
                </tr>
                <tr>
                  <FormHeaderCell>CPF</FormHeaderCell>
                  <FormHeaderCell>Curso</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell>
                    <FormInput type="text" name="student_cpf" value={formData.student_cpf} onChange={handleChange} />
                  </FormDataCell>
                  <FormDataCell>
                    <FormInput type="text" name="student_course" value={formData.student_course} onChange={handleChange} />
                  </FormDataCell>
                </tr>
              </tbody>
            </FormTable>

            <div className="mb-4 mt-6">
              <h2 className="text-sm font-bold mb-3">1. Do Objeto e Vigência</h2>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormHeaderCell>Modalidade</FormHeaderCell>
                  <FormHeaderCell>Data Início</FormHeaderCell>
                  <FormHeaderCell>Data Término</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell>
                    <FormSelect name="modality" value={formData.modality} onChange={handleChange}>
                      <option value="">Selecione...</option>
                      <option value="presencial">Presencial</option>
                      <option value="remoto">Remoto</option>
                      <option value="hibrido">Híbrido</option>
                    </FormSelect>
                  </FormDataCell>
                  <FormDataCell>
                    <FormInput type="date" name="start_date" value={formData.start_date} onChange={handleChange} />
                  </FormDataCell>
                  <FormDataCell>
                    <FormInput type="date" name="end_date" value={formData.end_date} onChange={handleChange} />
                  </FormDataCell>
                </tr>
              </tbody>
            </FormTable>

            <div className="mb-4 mt-6">
              <h2 className="text-sm font-bold mb-3">2. Do Seguro e Remuneração</h2>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormHeaderCell>Nº da Apólice</FormHeaderCell>
                  <FormHeaderCell>Seguradora</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell>
                    <FormInput type="text" name="insurance_number" value={formData.insurance_number} onChange={handleChange} />
                  </FormDataCell>
                  <FormDataCell>
                    <FormInput type="text" name="insurance_company" value={formData.insurance_company} onChange={handleChange} />
                  </FormDataCell>
                </tr>
                <tr>
                  <FormHeaderCell colSpan={2}>Remuneração</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell colSpan={2}>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs">
                        <input type="radio" name="remuneration_type" value="bolsa" checked={formData.remuneration_type === 'bolsa'} onChange={handleChange} />
                        Bolsa-Auxílio de R$ <FormInput type="text" name="bolsa_value" value={formData.bolsa_value} onChange={handleChange} placeholder="0,00" className="w-32 inline-block ml-2" />
                      </label>
                      <label className="flex items-center gap-2 text-xs">
                        <input type="radio" name="remuneration_type" value="nao_remunerado" checked={formData.remuneration_type === 'nao_remunerado'} onChange={handleChange} />
                        Não remunerado (Estágio Obrigatório)
                      </label>
                    </div>
                  </FormDataCell>
                </tr>
                <tr>
                  <FormHeaderCell colSpan={2}>Auxílio-transporte (R$)</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell colSpan={2}>
                    <FormInput type="text" name="transport_allowance" value={formData.transport_allowance} onChange={handleChange} placeholder="0,00" />
                  </FormDataCell>
                </tr>
              </tbody>
            </FormTable>

            <div className="mb-4 mt-6">
              <h2 className="text-sm font-bold mb-3">3. Plano de Atividades</h2>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormHeaderCell>Atividades a serem desenvolvidas</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell>
                    <FormTextarea name="activities" value={formData.activities} onChange={handleChange} rows={6} placeholder="Descreva as atividades..." />
                  </FormDataCell>
                </tr>
                <tr>
                  <FormHeaderCell>Resultados Esperados</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell>
                    <FormTextarea name="expected_results" value={formData.expected_results} onChange={handleChange} rows={4} placeholder="Descreva os resultados esperados..." />
                  </FormDataCell>
                </tr>
              </tbody>
            </FormTable>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <SignatureSection label="Representante do IFCE" />
              <SignatureSection label="Representante da Concedente" />
              <SignatureSection label="Discente Estagiário" />
              <SignatureSection label="Supervisor do Estágio" />
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
