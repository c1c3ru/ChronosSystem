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

export default function FinalReportPage() {
  const formRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    student_name: '',
    student_id: '',
    company: '',
    supervisor: '',
    period_start: '',
    period_end: '',
    activities_description: '',
    theory_practice_comparison: '',
    aa1: '', aa2: '', aa3: '', aa4: '',
    as1: '', as2: '', as3: ''
  })

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await getDraft('final-report')
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
            formId="final-report-form"
            title="RELATÓRIO FINAL DE ESTÁGIO OBRIGATÓRIO"
            campus="Maracanaú"
            sector="Coordenação de Estágios"
          >
            <FormTable>
              <tbody>
                <tr>
                  <FormField label="NOME DO ESTAGIÁRIO(A)" colSpan={2}>
                    <FormInput type="text" name="student_name" value={formData.student_name} onChange={handleChange} />
                  </FormField>
                  <FormField label="MATRÍCULA">
                    <FormInput type="text" name="student_id" value={formData.student_id} onChange={handleChange} />
                  </FormField>
                </tr>
                <tr>
                  <FormField label="EMPRESA CONCEDENTE" colSpan={2}>
                    <FormInput type="text" name="company" value={formData.company} onChange={handleChange} />
                  </FormField>
                  <FormField label="SUPERVISOR(A)">
                    <FormInput type="text" name="supervisor" value={formData.supervisor} onChange={handleChange} />
                  </FormField>
                </tr>
                <tr>
                  <FormField label="PERÍODO DE REALIZAÇÃO" colSpan={3}>
                    <div className="flex gap-2 items-center">
                      <FormInput type="date" name="period_start" value={formData.period_start} onChange={handleChange} className="w-32" />
                      <span className="text-[8px]">ATÉ</span>
                      <FormInput type="date" name="period_end" value={formData.period_end} onChange={handleChange} className="w-32" />
                    </div>
                  </FormField>
                </tr>
              </tbody>
            </FormTable>

            <div className="mt-4 mb-1">
              <div className="text-[9px] font-bold uppercase bg-gray-200 border border-black px-1 py-0.5">
                2. ATIVIDADES REALIZADAS
              </div>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormField label="DESCRIÇÃO DAS ATIVIDADES REALIZADAS">
                    <FormTextarea name="activities_description" value={formData.activities_description} onChange={handleChange} rows={8} />
                  </FormField>
                </tr>
                <tr>
                  <FormField label="COMPARAÇÃO TEORIA X PRÁTICA">
                    <FormTextarea name="theory_practice_comparison" value={formData.theory_practice_comparison} onChange={handleChange} rows={6} />
                  </FormField>
                </tr>
              </tbody>
            </FormTable>

            <div className="mt-4 mb-1">
              <div className="text-[9px] font-bold uppercase bg-gray-200 border border-black px-1 py-0.5">
                3. AVALIAÇÕES
              </div>
            </div>

            <div className="text-[8px] font-bold uppercase mb-1 mt-2">AUTOAVALIAÇÃO DO DISCENTE</div>
            <FormTable>
              <thead>
                <tr className="bg-gray-100">
                  <td className="border border-black px-1 py-0.5 font-bold text-[8px] w-1/2">CRITÉRIO</td>
                  <td className="border border-black px-1 py-0.5 font-bold text-[8px] text-center">ÓTIMO</td>
                  <td className="border border-black px-1 py-0.5 font-bold text-[8px] text-center">BOM</td>
                  <td className="border border-black px-1 py-0.5 font-bold text-[8px] text-center">REGULAR</td>
                  <td className="border border-black px-1 py-0.5 font-bold text-[8px] text-center">INSUF.</td>
                </tr>
              </thead>
              <tbody>
                {['Assiduidade', 'Comunicação', 'Proatividade', 'Responsabilidade'].map((label, index) => (
                  <tr key={label}>
                    <td className="border border-black px-1 py-0.5 text-[9px] font-medium">{label}</td>
                    {['otimo', 'bom', 'regular', 'insuficiente'].map((option) => (
                      <td key={`${label}-${option}`} className="border border-black px-1 py-0.5 text-center align-middle">
                        <input
                          type="radio"
                          name={`aa${index + 1}`}
                          value={option}
                          checked={formData[`aa${index + 1}` as keyof typeof formData] === option}
                          onChange={handleChange}
                          className="h-3 w-3"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </FormTable>

            <div className="text-[8px] font-bold uppercase mb-1 mt-2">AVALIAÇÃO DA SUPERVISÃO (PERCEPÇÃO DO ALUNO)</div>
            <FormTable>
              <thead>
                <tr className="bg-gray-100">
                  <td className="border border-black px-1 py-0.5 font-bold text-[8px] w-1/2">CRITÉRIO</td>
                  <td className="border border-black px-1 py-0.5 font-bold text-[8px] text-center">ÓTIMO</td>
                  <td className="border border-black px-1 py-0.5 font-bold text-[8px] text-center">BOM</td>
                  <td className="border border-black px-1 py-0.5 font-bold text-[8px] text-center">REGULAR</td>
                  <td className="border border-black px-1 py-0.5 font-bold text-[8px] text-center">INSUF.</td>
                </tr>
              </thead>
              <tbody>
                {['Acompanhamento/Supervisão', 'Comunicação com estagiário', 'Infraestrutura'].map((label, index) => (
                  <tr key={label}>
                    <td className="border border-black px-1 py-0.5 text-[9px] font-medium">{label}</td>
                    {['otimo', 'bom', 'regular', 'insuficiente'].map((option) => (
                      <td key={`${label}-${option}`} className="border border-black px-1 py-0.5 text-center align-middle">
                        <input
                          type="radio"
                          name={`as${index + 1}`}
                          value={option}
                          checked={formData[`as${index + 1}` as keyof typeof formData] === option}
                          onChange={handleChange}
                          className="h-3 w-3"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </FormTable>

            <div className="mt-8 border border-black p-4">
              <SignatureSection
                label="ASSINATURA DO DISCENTE"
                date={true}
              />
            </div>
          </OfficialFormTemplate>
        </div>

        <div className="no-print">
          <FormExportButtons formType="final-report" formRef={formRef} />
        </div>
      </div>
    </div>
  )
}
