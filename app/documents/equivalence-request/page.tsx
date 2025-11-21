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
  SignatureSection
} from '@/components/OfficialFormTemplate'

export default function EquivalenceRequestPage() {
  const formRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    student_name: '',
    student_id: '',
    student_course: '',
    experience_type: '',
    start_date: '',
    end_date: '',
    weekly_hours: ''
  })

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await getDraft('equivalence-request')
      if (draft) {
        setFormData(draft as typeof formData)
      }
    }
    loadDraft()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            formId="equivalence-request-form"
            title="SOLICITAÇÃO DE APROVEITAMENTO DE EXPERIÊNCIA"
            campus="Maracanaú"
            sector="Coordenação de Estágios"
          >
            <div className="mb-4">
              <h2 className="text-sm font-bold mb-3">1. Identificação</h2>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormHeaderCell colSpan={2}>Nome</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell colSpan={2}>
                    <FormInput type="text" name="student_name" value={formData.student_name} onChange={handleChange} />
                  </FormDataCell>
                </tr>
                <tr>
                  <FormHeaderCell>Matrícula</FormHeaderCell>
                  <FormHeaderCell>Curso</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell>
                    <FormInput type="text" name="student_id" value={formData.student_id} onChange={handleChange} />
                  </FormDataCell>
                  <FormDataCell>
                    <FormInput type="text" name="student_course" value={formData.student_course} onChange={handleChange} />
                  </FormDataCell>
                </tr>
              </tbody>
            </FormTable>

            <div className="mb-4 mt-6">
              <h2 className="text-sm font-bold mb-3">2. Tipo de Experiência</h2>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormDataCell>
                    <div className="space-y-2">
                      {[
                        { value: 'extension', label: 'Atividade de Extensão, Iniciação Científica ou Monitoria' },
                        { value: 'clt', label: 'Empregado (CLT) em empresa privada/pública' },
                        { value: 'public_servant', label: 'Servidor Público Estatutário' },
                        { value: 'third_sector', label: 'Terceiro Setor' }
                      ].map(({ value, label }) => (
                        <label key={value} className="flex items-center gap-2 text-xs">
                          <input type="radio" name="experience_type" value={value} checked={formData.experience_type === value} onChange={handleChange} />
                          {label}
                        </label>
                      ))}
                    </div>
                  </FormDataCell>
                </tr>
              </tbody>
            </FormTable>

            <div className="mb-4 mt-6">
              <h2 className="text-sm font-bold mb-3">3. Documentos Anexos</h2>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormDataCell>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[
                        'Declaração de atividades',
                        'Cópia da Carteira de Trabalho (CTPS)',
                        'Cartão CNPJ da empresa',
                        'Ato de nomeação (Servidor Público)',
                        'Contrato Social / Estatuto'
                      ].map((doc) => (
                        <label key={doc} className="flex items-center gap-2 text-xs">
                          <input type="checkbox" name={`doc_${doc.toLowerCase().replace(/\s+/g, '_')}`} />
                          {doc}
                        </label>
                      ))}
                    </div>
                  </FormDataCell>
                </tr>
              </tbody>
            </FormTable>

            <div className="mb-4 mt-6">
              <h2 className="text-sm font-bold mb-3">4. Período e Carga Horária</h2>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormHeaderCell>Data Início</FormHeaderCell>
                  <FormHeaderCell>Data Fim (Prevista)</FormHeaderCell>
                  <FormHeaderCell>Horas Semanais</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell>
                    <FormInput type="date" name="start_date" value={formData.start_date} onChange={handleChange} />
                  </FormDataCell>
                  <FormDataCell>
                    <FormInput type="date" name="end_date" value={formData.end_date} onChange={handleChange} />
                  </FormDataCell>
                  <FormDataCell>
                    <FormInput type="number" name="weekly_hours" value={formData.weekly_hours} onChange={handleChange} />
                  </FormDataCell>
                </tr>
              </tbody>
            </FormTable>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <SignatureSection label="Assinatura do Discente" />
              <SignatureSection label="Assinatura do Orientador" />
            </div>
          </OfficialFormTemplate>
        </div>

        <div className="no-print">
          <FormExportButtons formType="equivalence-request" formRef={formRef} />
        </div>
      </div>
    </div>
  )
}
