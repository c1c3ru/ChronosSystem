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
                  <FormField label="NOME DO DECLARANTE (ORIENTADOR/COORDENADOR)" colSpan={2}>
                    <FormInput type="text" name="declarant_name" value={formData.declarant_name} onChange={handleChange} />
                  </FormField>
                </tr>
              </tbody>
            </FormTable>

            <div className="py-2 text-[9pt] text-justify px-1">
              <p>Declaro, para fins de equiparação a estágio supervisionado, que o(a) discente abaixo participou das atividades descritas:</p>
            </div>

            <div className="mt-2 mb-1">
              <div className="text-[9px] font-bold uppercase bg-gray-200 border border-black px-1 py-0.5">
                1. DADOS DO DISCENTE
              </div>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormField label="NOME DO DISCENTE" colSpan={2}>
                    <FormInput type="text" name="student_name" value={formData.student_name} onChange={handleChange} />
                  </FormField>
                </tr>
                <tr>
                  <FormField label="MATRÍCULA">
                    <FormInput type="text" name="student_id" value={formData.student_id} onChange={handleChange} />
                  </FormField>
                  <FormField label="MODALIDADE">
                    <div className="flex gap-4 pt-1">
                      {['Extensão', 'Iniciação Científica', 'Monitoria'].map((type) => (
                        <label key={type} className="flex items-center gap-1 text-[8px] uppercase">
                          <input type="radio" name="modality" value={type.toLowerCase()} checked={formData.modality === type.toLowerCase()} onChange={handleChange} className="h-3 w-3" />
                          {type}
                        </label>
                      ))}
                    </div>
                  </FormField>
                </tr>
              </tbody>
            </FormTable>

            <div className="mt-4 mb-1">
              <div className="text-[9px] font-bold uppercase bg-gray-200 border border-black px-1 py-0.5">
                2. DETALHES DO PROJETO
              </div>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormField label="TÍTULO DO PROJETO/PROGRAMA" colSpan={2}>
                    <FormInput type="text" name="project_title" value={formData.project_title} onChange={handleChange} />
                  </FormField>
                </tr>
                <tr>
                  <FormField label="ATIVIDADES DESENVOLVIDAS" colSpan={2}>
                    <FormTextarea name="activities" value={formData.activities} onChange={handleChange} rows={6} />
                  </FormField>
                </tr>
                <tr>
                  <FormField label="DATA INÍCIO">
                    <FormInput type="date" name="start_date" value={formData.start_date} onChange={handleChange} />
                  </FormField>
                  <FormField label="CARGA HORÁRIA SEMANAL">
                    <FormInput type="number" name="weekly_hours" value={formData.weekly_hours} onChange={handleChange} />
                  </FormField>
                </tr>
              </tbody>
            </FormTable>

            <div className="mt-8 border border-black p-4">
              <SignatureSection label="ASSINATURA DO SERVIDOR RESPONSÁVEL" date={true} />
            </div>
          </OfficialFormTemplate>
        </div>

        <div className="no-print">
          <FormExportButtons formType="extension-declaration" formRef={formRef} />
        </div>
      </div>
    </div>
  )
}
