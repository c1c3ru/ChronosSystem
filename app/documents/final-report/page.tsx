'use client'

import { useRef, useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { FormExportButtons } from '@/components/FormExportButtons'
import { getDraft, populateFormWithData } from '@/lib/form-drafts'
import {
  OfficialFormTemplate,
  FormTable,
  FormHeaderCell,
  FormDataCell,
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
    // Autoavaliação
    aa1: '',
    aa2: '',
    aa3: '',
    aa4: '',
    // Avaliação supervisão
    as1: '',
    as2: '',
    as3: ''
  })

  useEffect(() => {
    // Carrega rascunho salvo
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
            {/* Seção 1: Identificação */}
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
                    />
                  </FormDataCell>
                </tr>
                <tr>
                  <FormHeaderCell>Matrícula</FormHeaderCell>
                  <FormHeaderCell>Empresa concedente</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell>
                    <FormInput
                      type="text"
                      name="student_id"
                      value={formData.student_id}
                      onChange={handleChange}
                    />
                  </FormDataCell>
                  <FormDataCell>
                    <FormInput
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                    />
                  </FormDataCell>
                </tr>
                <tr>
                  <FormHeaderCell>Supervisor(a)</FormHeaderCell>
                  <FormHeaderCell>Período</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell>
                    <FormInput
                      type="text"
                      name="supervisor"
                      value={formData.supervisor}
                      onChange={handleChange}
                    />
                  </FormDataCell>
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
                </tr>
              </tbody>
            </FormTable>

            {/* Seção 2: Atividades */}
            <div className="mb-4 mt-6">
              <h2 className="text-sm font-bold mb-3">2. Atividades Realizadas</h2>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormHeaderCell>
                    Descrição das atividades realizadas
                  </FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell>
                    <FormTextarea
                      name="activities_description"
                      value={formData.activities_description}
                      onChange={handleChange}
                      rows={6}
                    />
                  </FormDataCell>
                </tr>
              </tbody>
            </FormTable>

            <FormTable>
              <tbody>
                <tr>
                  <FormHeaderCell>
                    Comparação teoria x prática
                  </FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell>
                    <FormTextarea
                      name="theory_practice_comparison"
                      value={formData.theory_practice_comparison}
                      onChange={handleChange}
                      rows={5}
                    />
                  </FormDataCell>
                </tr>
              </tbody>
            </FormTable>

            {/* Seção 3: Avaliações */}
            <div className="mb-4 mt-6">
              <h2 className="text-sm font-bold mb-3">3. Avaliações</h2>
            </div>

            {/* Autoavaliação */}
            <div className="mb-4">
              <h3 className="text-xs font-bold mb-2">Autoavaliação do discente</h3>
            </div>

            <FormTable>
              <thead>
                <tr className="bg-neutral-100 text-xs">
                  <FormHeaderCell className="text-left">Critério</FormHeaderCell>
                  <FormHeaderCell className="text-center">Ótimo</FormHeaderCell>
                  <FormHeaderCell className="text-center">Bom</FormHeaderCell>
                  <FormHeaderCell className="text-center">Regular</FormHeaderCell>
                  <FormHeaderCell className="text-center">Insuf.</FormHeaderCell>
                </tr>
              </thead>
              <tbody>
                {['Assiduidade', 'Comunicação', 'Proatividade', 'Responsabilidade'].map((label, index) => (
                  <tr key={label}>
                    <FormDataCell className="text-left font-medium">{label}</FormDataCell>
                    {['otimo', 'bom', 'regular', 'insuficiente'].map((option) => (
                      <FormDataCell key={`${label}-${option}`} className="text-center">
                        <input
                          type="radio"
                          name={`aa${index + 1}`}
                          value={option}
                          checked={formData[`aa${index + 1}` as keyof typeof formData] === option}
                          onChange={handleChange}
                        />
                      </FormDataCell>
                    ))}
                  </tr>
                ))}
              </tbody>
            </FormTable>

            {/* Avaliação da Supervisão */}
            <div className="mb-4 mt-4">
              <h3 className="text-xs font-bold mb-2">Avaliação da supervisão (percepção do aluno)</h3>
            </div>

            <FormTable>
              <thead>
                <tr className="bg-neutral-100 text-xs">
                  <FormHeaderCell className="text-left">Critério</FormHeaderCell>
                  <FormHeaderCell className="text-center">Ótimo</FormHeaderCell>
                  <FormHeaderCell className="text-center">Bom</FormHeaderCell>
                  <FormHeaderCell className="text-center">Regular</FormHeaderCell>
                  <FormHeaderCell className="text-center">Insuf.</FormHeaderCell>
                </tr>
              </thead>
              <tbody>
                {['Acompanhamento/Supervisão', 'Comunicação com estagiário', 'Infraestrutura'].map((label, index) => (
                  <tr key={label}>
                    <FormDataCell className="text-left font-medium">{label}</FormDataCell>
                    {['otimo', 'bom', 'regular', 'insuficiente'].map((option) => (
                      <FormDataCell key={`${label}-${option}`} className="text-center">
                        <input
                          type="radio"
                          name={`as${index + 1}`}
                          value={option}
                          checked={formData[`as${index + 1}` as keyof typeof formData] === option}
                          onChange={handleChange}
                        />
                      </FormDataCell>
                    ))}
                  </tr>
                ))}
              </tbody>
            </FormTable>

            {/* Assinatura */}
            <SignatureSection
              label="Assinatura do Discente"
              date={true}
            />
          </OfficialFormTemplate>
        </div>

        {/* Botões de Exportação */}
        <div className="no-print">
          <FormExportButtons formType="final-report" formRef={formRef} />
        </div>
      </div>
    </div>
  )
}
