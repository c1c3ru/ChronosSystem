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

export default function SemesterReportPage() {
  const formRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    student_name: '',
    supervisor_name: '',
    advisor_name: '',
    period_start: '',
    period_end: '',
    total_hours: '',
    activities: '',
    comments: '',
    evaluation_1: '',
    evaluation_2: '',
    evaluation_3: '',
    evaluation_4: '',
    evaluation_5: ''
  })

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await getDraft('semester-report')
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
            formId="semester-report-form"
            title="RELATÓRIO SEMESTRAL DE ATIVIDADES"
            campus="Maracanaú"
            sector="Coordenação de Estágios"
          >
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
                    <FormInput type="text" name="student_name" value={formData.student_name} onChange={handleChange} />
                  </FormDataCell>
                </tr>
                <tr>
                  <FormHeaderCell>Supervisor</FormHeaderCell>
                  <FormHeaderCell>Orientador</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell>
                    <FormInput type="text" name="supervisor_name" value={formData.supervisor_name} onChange={handleChange} />
                  </FormDataCell>
                  <FormDataCell>
                    <FormInput type="text" name="advisor_name" value={formData.advisor_name} onChange={handleChange} />
                  </FormDataCell>
                </tr>
                <tr>
                  <FormHeaderCell>Período</FormHeaderCell>
                  <FormHeaderCell>Carga Horária Total</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell>
                    <div className="flex gap-2 items-center">
                      <FormInput type="date" name="period_start" value={formData.period_start} onChange={handleChange} />
                      <span className="text-xs">até</span>
                      <FormInput type="date" name="period_end" value={formData.period_end} onChange={handleChange} />
                    </div>
                  </FormDataCell>
                  <FormDataCell>
                    <FormInput type="number" name="total_hours" value={formData.total_hours} onChange={handleChange} />
                  </FormDataCell>
                </tr>
              </tbody>
            </FormTable>

            <div className="mb-4 mt-6">
              <h2 className="text-sm font-bold mb-3">2. Atividades</h2>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormHeaderCell>Principais Atividades no Período</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell>
                    <FormTextarea name="activities" value={formData.activities} onChange={handleChange} rows={5} />
                  </FormDataCell>
                </tr>
              </tbody>
            </FormTable>

            <div className="mb-4 mt-6">
              <h2 className="text-sm font-bold mb-3">3. Avaliação do Discente</h2>
              <p className="text-xs text-center mb-3 italic text-neutral-600">Conceitos: 1-Insatisfatório, 2-Pouco Satisfatório, 3-Satisfatório, 4-Muito Satisfatório</p>
            </div>

            <FormTable>
              <thead>
                <tr className="bg-neutral-100 text-xs">
                  <FormHeaderCell className="text-left">Critério</FormHeaderCell>
                  <FormHeaderCell className="text-center">1</FormHeaderCell>
                  <FormHeaderCell className="text-center">2</FormHeaderCell>
                  <FormHeaderCell className="text-center">3</FormHeaderCell>
                  <FormHeaderCell className="text-center">4</FormHeaderCell>
                </tr>
              </thead>
              <tbody>
                {['Assiduidade', 'Disciplina', 'Proatividade', 'Relacionamento Interpessoal', 'Qualidade no Trabalho'].map((criterion, index) => (
                  <tr key={criterion}>
                    <FormDataCell className="text-left font-medium">{criterion}</FormDataCell>
                    {[1, 2, 3, 4].map((value) => (
                      <FormDataCell key={value} className="text-center">
                        <input
                          type="radio"
                          name={`evaluation_${index + 1}`}
                          value={value}
                          checked={formData[`evaluation_${index + 1}` as keyof typeof formData] === String(value)}
                          onChange={handleChange}
                        />
                      </FormDataCell>
                    ))}
                  </tr>
                ))}
              </tbody>
            </FormTable>

            <div className="mb-4 mt-6">
              <h2 className="text-sm font-bold mb-3">4. Observações</h2>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormHeaderCell>Observações / Comentários</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell>
                    <FormTextarea name="comments" value={formData.comments} onChange={handleChange} rows={4} />
                  </FormDataCell>
                </tr>
              </tbody>
            </FormTable>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <SignatureSection label="Supervisor do Estágio" />
              <SignatureSection label="Discente Estagiário" />
            </div>
          </OfficialFormTemplate>
        </div>

        <div className="no-print">
          <FormExportButtons formType="semester-report" formRef={formRef} />
        </div>
      </div>
    </div>
  )
}
