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

export default function MonthlyReportPage() {
  const formRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    student_name: '',
    supervisor_name: '',
    advisor_name: '',
    period_start: '',
    period_end: '',
    hours_month: '',
    hours_total: '',
    activities: '',
    difficulties: '',
    solutions: ''
  })

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await getDraft('monthly-report')
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
            formId="monthly-report-form"
            title="RELATÓRIO MENSAL DE ATIVIDADES"
            campus="Maracanaú"
            sector="Coordenação de Estágios"
          >
            <FormTable>
              <tbody>
                <tr>
                  <FormField label="NOME DO ESTAGIÁRIO(A)" colSpan={2}>
                    <FormInput type="text" name="student_name" value={formData.student_name} onChange={handleChange} />
                  </FormField>
                </tr>
                <tr>
                  <FormField label="SUPERVISOR (EMPRESA)">
                    <FormInput type="text" name="supervisor_name" value={formData.supervisor_name} onChange={handleChange} />
                  </FormField>
                  <FormField label="ORIENTADOR (IFCE)">
                    <FormInput type="text" name="advisor_name" value={formData.advisor_name} onChange={handleChange} />
                  </FormField>
                </tr>
              </tbody>
            </FormTable>

            <div className="mt-4 mb-1">
              <div className="text-[9px] font-bold uppercase bg-gray-200 border border-black px-1 py-0.5">
                2. PERÍODO E CARGA HORÁRIA
              </div>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormField label="PERÍODO DE REFERÊNCIA">
                    <div className="flex gap-2 items-center">
                      <FormInput type="date" name="period_start" value={formData.period_start} onChange={handleChange} className="w-32" />
                      <span className="text-[8px]">ATÉ</span>
                      <FormInput type="date" name="period_end" value={formData.period_end} onChange={handleChange} className="w-32" />
                    </div>
                  </FormField>
                  <FormField label="CARGA HORÁRIA (HORAS)">
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1">
                        <span className="text-[8px]">NO MÊS:</span>
                        <FormInput type="number" name="hours_month" value={formData.hours_month} onChange={handleChange} className="w-16 border-b border-black" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[8px]">ACUMULADA:</span>
                        <FormInput type="number" name="hours_total" value={formData.hours_total} onChange={handleChange} className="w-16 border-b border-black" />
                      </div>
                    </div>
                  </FormField>
                </tr>
              </tbody>
            </FormTable>

            <div className="mt-4 mb-1">
              <div className="text-[9px] font-bold uppercase bg-gray-200 border border-black px-1 py-0.5">
                3. ATIVIDADES DESENVOLVIDAS
              </div>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormField label="PRINCIPAIS ATIVIDADES DESENVOLVIDAS">
                    <FormTextarea name="activities" value={formData.activities} onChange={handleChange} rows={6} />
                  </FormField>
                </tr>
                <tr>
                  <FormField label="DIFICULDADES ENCONTRADAS">
                    <FormTextarea name="difficulties" value={formData.difficulties} onChange={handleChange} rows={4} />
                  </FormField>
                </tr>
                <tr>
                  <FormField label="SOLUÇÕES ADOTADAS">
                    <FormTextarea name="solutions" value={formData.solutions} onChange={handleChange} rows={4} />
                  </FormField>
                </tr>
              </tbody>
            </FormTable>

            <div className="mt-6 border border-black">
              <div className="grid grid-cols-3 divide-x divide-black">
                <div className="p-4 pb-2">
                  <SignatureSection label="ESTAGIÁRIO(A)" className="mt-8" />
                </div>
                <div className="p-4 pb-2">
                  <SignatureSection label="SUPERVISOR" className="mt-8" />
                </div>
                <div className="p-4 pb-2">
                  <SignatureSection label="ORIENTADOR" className="mt-8" />
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
          <FormExportButtons formType="monthly-report" formRef={formRef} />
        </div>
      </div>
    </div>
  )
}
