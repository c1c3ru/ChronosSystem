'use client'

import { useRef, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { FormHeader } from '@/components/FormHeader'
import { FormExportButtons } from '@/components/FormExportButtons'
import { getDraft, populateFormWithData } from '@/lib/form-drafts'

export default function ProfessionalDeclarationPage() {
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await getDraft('professional-declaration')
      if (draft) {
        const form = formRef.current?.querySelector('form') as HTMLFormElement
        if (form) {
          populateFormWithData(form, draft)
        }
      }
    }
    loadDraft()
  }, [])

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/employee"
          className="flex items-center text-secondary-400 hover:text-secondary-200 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Link>

        <div ref={formRef} className="document-page text-sm border-t-4 border-primary-500">
          <form className="space-y-6">
            <FormHeader title="DECLARAÇÃO DE ATIVIDADES PROFISSIONAIS" showImages={true} />

            <div className="document-section">
              <p className="text-neutral-700 mb-4">
                Para fins de <strong>aproveitamento</strong> de atividades profissionais como estágio supervisionado obrigatório,
                a instituição abaixo declara os seguintes fatos:
              </p>
            </div>

            <div className="document-section">
              <h3 className="document-heading">1. Dados da Instituição/Empresa</h3>
              <div className="document-grid">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Razão Social</label>
                  <input type="text" name="company_name" className="document-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">CNPJ</label>
                  <input type="text" name="company_cnpj" className="document-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Telefone</label>
                  <input type="text" name="company_phone" className="document-input" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Endereço Completo</label>
                  <input type="text" name="company_address" className="document-input" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">
                    Responsável pela assinatura
                  </label>
                  <input type="text" name="company_representative" className="document-input" />
                </div>
              </div>
            </div>

            <div className="document-section">
              <h3 className="document-heading">2. Dados do Empregado (Aluno)</h3>
              <div className="document-grid">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Nome completo</label>
                  <input type="text" name="student_name" className="document-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">CPF</label>
                  <input type="text" name="student_cpf" className="document-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Início do vínculo</label>
                  <input type="date" name="start_date" className="document-input" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Área ou setor de trabalho</label>
                  <input type="text" name="work_area" className="document-input" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Descrição das atividades</label>
                  <textarea name="activities_description" className="document-textarea" rows={4}></textarea>
                </div>
              </div>
            </div>

            <div className="document-section text-center space-y-4">
              <p>Local e Data: ______________________, _____ de _______________ de _______.</p>
              <div className="w-full sm:w-2/3 mx-auto border-t border-neutral-400 pt-3">
                <p className="font-semibold text-neutral-700">Assinatura e carimbo do responsável pela empresa</p>
              </div>
            </div>

            <FormExportButtons formType="professional-declaration" formRef={formRef} />
          </form>
        </div>
      </div>
    </div>
  )
}
