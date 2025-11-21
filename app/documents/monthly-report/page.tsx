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
            {/* Identificação */}
            <div className="mb-4">
              <h2 className="text-sm font-bold mb-3">1. Identificação</h2>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormHeaderCell colSpan={2}>Estagiário(a)</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell colSpan={2}>
                    <FormInput
                      type="text"
                      name="student_name"
                      value={formData.student_name}
                      onChange={handleChange}
                      placeholder="Nome completo"
                    />
                  </FormDataCell>
                </tr>
                <tr>
                  <FormHeaderCell>Supervisor</FormHeaderCell>
                  <FormHeaderCell>Orientador</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell>
                    <FormInput
                      type="text"
                      name="supervisor_name"
                      value={formData.supervisor_name}
                      onChange={handleChange}
                      placeholder="Nome do supervisor"
                    />
                  </FormDataCell>
                  <FormDataCell>
                    <FormInput
                      type="text"
                      name="advisor_name"
                      value={formData.advisor_name}
                      onChange={handleChange}
                      placeholder="Nome do orientador"
                    />
                  </FormDataCell>
                </tr>
              </tbody>
            </FormTable>

            {/* Período e Carga Horária */}
            <div className="mb-4 mt-6">
              <h2 className="text-sm font-bold mb-3">2. Período e Carga Horária</h2>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormHeaderCell>Período</FormHeaderCell>
                  <FormHeaderCell>Carga Horária</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell>
                    <div className="flex gap-2 items-center">
                      <FormInput
                        type="date"
                        name="period_start"
                        value={formData.period_start}
                        onChange={handleChange}
                      />
                      <span className="text-xs">até</span>
                      <FormInput
                        type="date"
                        name="period_end"
                        value={formData.period_end}
                        onChange={handleChange}
                      />
                    </div>
                  </FormDataCell>
                  <FormDataCell>
                    <div className="grid grid-cols-2 gap-2">
                      <FormInput
                        type="number"
                        name="hours_month"
                        value={formData.hours_month}
                        onChange={handleChange}
                        placeholder="No mês"
                      />
                      <FormInput
                        type="number"
                        name="hours_total"
                        value={formData.hours_total}
                        onChange={handleChange}
                        placeholder="Acumulado"
                      />
                    </div>
                  </FormDataCell>
                </tr>
              </tbody>
            </FormTable>

            {/* Atividades */}
            <div className="mb-4 mt-6">
              <h2 className="text-sm font-bold mb-3">3. Atividades</h2>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormHeaderCell>Principais atividades desenvolvidas</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell>
                    <FormTextarea
                      name="activities"
                      value={formData.activities}
                      onChange={handleChange}
                      rows={5}
                    />
                  </FormDataCell>
                </tr>
              </tbody>
            </FormTable>

            <FormTable>
              <tbody>
                <tr>
                  <FormHeaderCell>Dificuldades encontradas</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell>
                    <FormTextarea
                      name="difficulties"
                      value={formData.difficulties}
                      onChange={handleChange}
                      rows={4}
                    />
                  </FormDataCell>
                </tr>
              </tbody>
            </FormTable>

            <FormTable>
              <tbody>
                <tr>
                  <FormHeaderCell>Soluções adotadas</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell>
                    <FormTextarea
                      name="solutions"
                      value={formData.solutions}
                      onChange={handleChange}
                      rows={4}
                    />
                  </FormDataCell>
                </tr>
              </tbody>
            </FormTable>

            {/* Assinaturas */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <SignatureSection label="Estagiário(a)" />
              <SignatureSection label="Supervisor" />
              <SignatureSection label="Orientador" />
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
