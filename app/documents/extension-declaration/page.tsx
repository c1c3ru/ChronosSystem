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

export default function ExtensionDeclarationPage() {
  const formRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    declarant_name: '',
    student_name: '',
    student_id: '',
    modality: '',
    project_title: '',
    activities: '',
    start_date: '',
    weekly_hours: ''
  })

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await getDraft('extension-declaration')
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
            formId="extension-declaration-form"
            title="DECLARAÇÃO DE PARTICIPAÇÃO EM PROJETO"
            campus="Maracanaú"
            sector="Coordenação de Extensão"
          >
            <FormTable>
              <tbody>
                <tr>
                  <FormHeaderCell colSpan={2}>Nome do Declarante (Orientador/Coordenador)</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell colSpan={2}>
                    <FormInput type="text" name="declarant_name" value={formData.declarant_name} onChange={handleChange} />
                  </FormDataCell>
                </tr>
              </tbody>
            </FormTable>

            <div className="py-4 text-xs text-justify text-neutral-700">
              <p>Declaro, para fins de equiparação a estágio supervisionado, que o(a) discente abaixo participou das atividades descritas:</p>
            </div>

            <div className="mb-4">
              <h2 className="text-sm font-bold mb-3">1. Dados do Discente</h2>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormHeaderCell colSpan={2}>Discente</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell colSpan={2}>
                    <FormInput type="text" name="student_name" value={formData.student_name} onChange={handleChange} />
                  </FormDataCell>
                </tr>
                <tr>
                  <FormHeaderCell>Matrícula</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell>
                    <FormInput type="text" name="student_id" value={formData.student_id} onChange={handleChange} />
                  </FormDataCell>
                </tr>
              </tbody>
            </FormTable>

            <div className="mb-4 mt-6">
              <h2 className="text-sm font-bold mb-3">2. Modalidade</h2>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormDataCell>
                    <div className="space-y-2">
                      {['Extensão', 'Iniciação Científica', 'Monitoria'].map((type) => (
                        <label key={type} className="flex items-center gap-2 text-xs">
                          <input type="radio" name="modality" value={type.toLowerCase()} checked={formData.modality === type.toLowerCase()} onChange={handleChange} />
                          {type}
                        </label>
                      ))}
                    </div>
                  </FormDataCell>
                </tr>
              </tbody>
            </FormTable>

            <div className="mb-4 mt-6">
              <h2 className="text-sm font-bold mb-3">3. Detalhes do Projeto</h2>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormHeaderCell colSpan={2}>Título do Projeto/Programa</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell colSpan={2}>
                    <FormInput type="text" name="project_title" value={formData.project_title} onChange={handleChange} />
                  </FormDataCell>
                </tr>
                <tr>
                  <FormHeaderCell colSpan={2}>Atividades Desenvolvidas</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell colSpan={2}>
                    <FormTextarea name="activities" value={formData.activities} onChange={handleChange} rows={4} />
                  </FormDataCell>
                </tr>
                <tr>
                  <FormHeaderCell>Data Início</FormHeaderCell>
                  <FormHeaderCell>Carga Horária Semanal</FormHeaderCell>
                </tr>
                <tr>
                  <FormDataCell>
                    <FormInput type="date" name="start_date" value={formData.start_date} onChange={handleChange} />
                  </FormDataCell>
                  <FormDataCell>
                    <FormInput type="number" name="weekly_hours" value={formData.weekly_hours} onChange={handleChange} />
                  </FormDataCell>
                </tr>
              </tbody>
            </FormTable>

            <SignatureSection label="Assinatura do Servidor Responsável" date={true} />
          </OfficialFormTemplate>
        </div>

        <div className="no-print">
          <FormExportButtons formType="extension-declaration" formRef={formRef} />
        </div>
      </div>
    </div>
  )
}
