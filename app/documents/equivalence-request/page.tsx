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
            <div className="mt-4 mb-1">
              <div className="text-[9px] font-bold uppercase bg-gray-200 border border-black px-1 py-0.5">
                1. IDENTIFICAÇÃO DO DISCENTE
              </div>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormField label="NOME COMPLETO" colSpan={2}>
                    <FormInput type="text" name="student_name" value={formData.student_name} onChange={handleChange} />
                  </FormField>
                </tr>
                <tr>
                  <FormField label="MATRÍCULA">
                    <FormInput type="text" name="student_id" value={formData.student_id} onChange={handleChange} />
                  </FormField>
                  <FormField label="CURSO">
                    <FormInput type="text" name="student_course" value={formData.student_course} onChange={handleChange} />
                  </FormField>
                </tr>
              </tbody>
            </FormTable>

            <div className="mt-4 mb-1">
              <div className="text-[9px] font-bold uppercase bg-gray-200 border border-black px-1 py-0.5">
                2. TIPO DE EXPERIÊNCIA
              </div>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormField label="SELECIONE O TIPO">
                    <div className="space-y-1 pt-1">
                      {[
                        { value: 'extension', label: 'Atividade de Extensão, Iniciação Científica ou Monitoria' },
                        { value: 'clt', label: 'Empregado (CLT) em empresa privada/pública' },
                        { value: 'public_servant', label: 'Servidor Público Estatutário' },
                        { value: 'third_sector', label: 'Terceiro Setor' }
                      ].map(({ value, label }) => (
                        <label key={value} className="flex items-center gap-2 text-[8px] uppercase">
                          <input type="radio" name="experience_type" value={value} checked={formData.experience_type === value} onChange={handleChange} className="h-3 w-3" />
                          {label}
                        </label>
                      ))}
                    </div>
                  </FormField>
                </tr>
              </tbody>
            </FormTable>

            <div className="mt-4 mb-1">
              <div className="text-[9px] font-bold uppercase bg-gray-200 border border-black px-1 py-0.5">
                3. DOCUMENTOS ANEXOS (OBRIGATÓRIO)
              </div>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormField label="CHECKLIST">
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {[
                        'Declaração de atividades',
                        'Cópia da Carteira de Trabalho (CTPS)',
                        'Cartão CNPJ da empresa',
                        'Ato de nomeação (Servidor Público)',
                        'Contrato Social / Estatuto'
                      ].map((doc) => (
                        <label key={doc} className="flex items-center gap-2 text-[8px] uppercase">
                          <input type="checkbox" name={`doc_${doc.toLowerCase().replace(/\s+/g, '_')}`} className="h-3 w-3" />
                          {doc}
                        </label>
                      ))}
                    </div>
                  </FormField>
                </tr>
              </tbody>
            </FormTable>

            <div className="mt-4 mb-1">
              <div className="text-[9px] font-bold uppercase bg-gray-200 border border-black px-1 py-0.5">
                4. PERÍODO E CARGA HORÁRIA
              </div>
            </div>

            <FormTable>
              <tbody>
                <tr>
                  <FormField label="DATA INÍCIO">
                    <FormInput type="date" name="start_date" value={formData.start_date} onChange={handleChange} />
                  </FormField>
                  <FormField label="DATA FIM (PREVISTA)">
                    <FormInput type="date" name="end_date" value={formData.end_date} onChange={handleChange} />
                  </FormField>
                  <FormField label="HORAS SEMANAIS">
                    <FormInput type="number" name="weekly_hours" value={formData.weekly_hours} onChange={handleChange} />
                  </FormField>
                </tr>
              </tbody>
            </FormTable>

            <div className="mt-6 border border-black">
              <div className="grid grid-cols-2 divide-x divide-black">
                <div className="p-4 pb-2">
                  <SignatureSection label="ASSINATURA DO DISCENTE" className="mt-8" />
                </div>
                <div className="p-4 pb-2">
                  <SignatureSection label="ASSINATURA DO ORIENTADOR" className="mt-8" />
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
          <FormExportButtons formType="equivalence-request" formRef={formRef} />
        </div>
      </div>
    </div>
  )
}
