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
    student_registration: '',
    student_course: '',
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
            {/* Identificação - Layout Denso */}
            <FormTable>
              <tbody>
                <tr>
                  <FormField label="NOME DO ESTAGIÁRIO(A)" colSpan={2}>
                    <FormInput type="text" name="student_name" value={formData.student_name} onChange={handleChange} />
                  </FormField>
                  <FormField label="MATRÍCULA">
                    <FormInput type="text" name="student_registration" value={formData.student_registration} onChange={handleChange} />
                  </FormField>
                </tr>
                <tr>
                  <FormField label="CURSO" colSpan={3}>
                    <FormInput type="text" name="student_course" value={formData.student_course} onChange={handleChange} />
                  </FormField>
                </tr>
                <tr>
                  <FormField label="SUPERVISOR (EMPRESA)" colSpan={2}>
                    <FormInput type="text" name="supervisor_name" value={formData.supervisor_name} onChange={handleChange} />
                  </FormField>
                  <FormField label="ORIENTADOR (IFCE)">
                    <FormInput type="text" name="advisor_name" value={formData.advisor_name} onChange={handleChange} />
                  </FormField>
                </tr>
                <tr>
                  <FormField label="PERÍODO DE REALIZAÇÃO" colSpan={2}>
                    <div className="flex gap-2 items-center w-full">
                      <FormInput type="date" name="period_start" value={formData.period_start} onChange={handleChange} className="w-32" />
                      <span className="text-[8px]">ATÉ</span>
                      <FormInput type="date" name="period_end" value={formData.period_end} onChange={handleChange} className="w-32" />
                    </div>
                  </FormField>
                  <FormField label="CARGA HORÁRIA TOTAL">
                    <div className="flex items-center gap-1">
                      <FormInput type="number" name="total_hours" value={formData.total_hours} onChange={handleChange} className="text-right w-20" />
                      <span className="text-[8px]">HORAS</span>
                    </div>
                  </FormField>
                </tr>
              </tbody>
            </FormTable>

            {/* Atividades */}
            <div className="mt-4 mb-1">
              <div className="text-[9px] font-bold uppercase bg-gray-200 border border-black px-1 py-0.5">
                2. ATIVIDADES DESENVOLVIDAS
              </div>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormField label="DESCRIÇÃO DAS PRINCIPAIS ATIVIDADES NO PERÍODO">
                    <FormTextarea name="activities" value={formData.activities} onChange={handleChange} rows={8} />
                  </FormField>
                </tr>
              </tbody>
            </FormTable>

            {/* Avaliação */}
            <div className="mt-4 mb-1">
              <div className="text-[9px] font-bold uppercase bg-gray-200 border border-black px-1 py-0.5">
                3. AVALIAÇÃO DO DISCENTE (PREENCHIDO PELO SUPERVISOR)
              </div>
            </div>

            <p className="text-[8px] mb-1 italic">Conceitos: 1-Insatisfatório, 2-Pouco Satisfatório, 3-Satisfatório, 4-Muito Satisfatório</p>

            <FormTable>
              <thead>
                <tr className="bg-gray-100">
                  <FormHeaderCell className="text-left w-1/2">CRITÉRIO DE AVALIAÇÃO</FormHeaderCell>
                  <FormHeaderCell className="text-center w-12">1</FormHeaderCell>
                  <FormHeaderCell className="text-center w-12">2</FormHeaderCell>
                  <FormHeaderCell className="text-center w-12">3</FormHeaderCell>
                  <FormHeaderCell className="text-center w-12">4</FormHeaderCell>
                </tr>
              </thead>
              <tbody>
                {['Assiduidade e Pontualidade', 'Disciplina e Interesse', 'Proatividade e Iniciativa', 'Relacionamento Interpessoal', 'Qualidade no Trabalho'].map((criterion, index) => (
                  <tr key={criterion}>
                    <FormDataCell className="text-left font-medium text-[9px] uppercase align-middle">{criterion}</FormDataCell>
                    {[1, 2, 3, 4].map((value) => (
                      <FormDataCell key={value} className="text-center align-middle">
                        <input
                          type="radio"
                          name={`evaluation_${index + 1}`}
                          value={value}
                          checked={formData[`evaluation_${index + 1}` as keyof typeof formData] === String(value)}
                          onChange={handleChange}
                          className="h-3 w-3"
                        />
                      </FormDataCell>
                    ))}
                  </tr>
                ))}
              </tbody>
            </FormTable>

            {/* Observações */}
            <div className="mt-4 mb-1">
              <div className="text-[9px] font-bold uppercase bg-gray-200 border border-black px-1 py-0.5">
                4. OBSERVAÇÕES GERAIS
              </div>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormField label="OBSERVAÇÕES / COMENTÁRIOS DO SUPERVISOR">
                    <FormTextarea name="comments" value={formData.comments} onChange={handleChange} rows={4} />
                  </FormField>
                </tr>
              </tbody>
            </FormTable>

            {/* Assinaturas - Layout Lado a Lado com Borda */}
            <div className="mt-6 border border-black">
              <div className="grid grid-cols-2 divide-x divide-black">
                <div className="p-4 pb-2">
                  <SignatureSection label="SUPERVISOR DO ESTÁGIO" className="mt-8" />
                </div>
                <div className="p-4 pb-2">
                  <SignatureSection label="DISCENTE ESTAGIÁRIO" className="mt-8" />
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
          <FormExportButtons formType="semester-report" formRef={formRef} />
        </div>
      </div>
    </div>
  )
}
