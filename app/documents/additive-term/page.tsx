'use client'

import { useRef, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { FormHeader } from '@/components/FormHeader'
import { FormExportButtons } from '@/components/FormExportButtons'
import { getDraft, populateFormWithData } from '@/lib/form-drafts'

export default function AdditiveTermPage() {
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await getDraft('additive-term')
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
        <Link href="/employee" className="flex items-center text-secondary-400 hover:text-secondary-200 text-sm font-medium">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Link>

        <div ref={formRef} className="document-page text-sm border-t-4 border-primary-500">
          <form className="space-y-6">
            <FormHeader
              title="TERMO ADITIVO A COMPROMISSO DE ESTÁGIO"
              showImages={true}
            />

            <div className="document-section">
              <h3 className="document-heading">1. Partes</h3>
              <div className="document-grid">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Instituição Concedente (Empresa)</label>
                  <input type="text" name="company_name" className="document-input" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Nome do Estagiário</label>
                  <input type="text" name="student_name" className="document-input" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Termo de Compromisso Original (Data)</label>
                  <input type="date" name="original_term_date" className="document-input" />
                </div>
              </div>
            </div>

            <div className="document-section">
              <h2 className="document-heading">2. Das Alterações</h2>
              <p className="text-sm italic text-neutral-600 mb-4">Selecione e preencha apenas o que será alterado:</p>

              <div className="space-y-6">
                <div className="border border-neutral-300 p-4 rounded-lg">
                  <label className="flex items-start gap-3">
                    <input type="checkbox" name="change_extension" className="mt-1" />
                    <div className="flex-1">
                      <span className="font-bold text-neutral-800 block mb-2">Prorrogação de Vigência</span>
                      <div className="document-grid">
                        <div>
                          <label className="block text-xs font-semibold text-neutral-500 mb-1">Nova data de término</label>
                          <input type="date" name="new_end_date" className="document-input" />
                        </div>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="border border-neutral-300 p-4 rounded-lg">
                  <label className="flex items-start gap-3">
                    <input type="checkbox" name="change_scholarship" className="mt-1" />
                    <div className="flex-1">
                      <span className="font-bold text-neutral-800 block mb-2">Alteração de Bolsa</span>
                      <div className="document-grid">
                        <div>
                          <label className="block text-xs font-semibold text-neutral-500 mb-1">Novo valor (R$)</label>
                          <input type="text" name="new_scholarship_value" className="document-input" placeholder="0,00" />
                        </div>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="border border-neutral-300 p-4 rounded-lg">
                  <label className="flex items-start gap-3">
                    <input type="checkbox" name="change_supervisor" className="mt-1" />
                    <div className="flex-1">
                      <span className="font-bold text-neutral-800 block mb-2">Novo Supervisor</span>
                      <div className="document-grid">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-neutral-500 mb-1">Nome</label>
                          <input type="text" name="new_supervisor_name" className="document-input" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-neutral-500 mb-1">Cargo/Formação</label>
                          <input type="text" name="new_supervisor_role" className="document-input" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-neutral-500 mb-1">CPF</label>
                          <input type="text" name="new_supervisor_cpf" className="document-input" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-neutral-500 mb-1">E-mail</label>
                          <input type="email" name="new_supervisor_email" className="document-input" />
                        </div>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="border border-neutral-300 p-4 rounded-lg">
                  <label className="flex items-start gap-3">
                    <input type="checkbox" name="change_activities" className="mt-1" />
                    <div className="flex-1">
                      <span className="font-bold text-neutral-800 block mb-2">Alteração no Plano de Atividades</span>
                      <textarea name="new_activities" className="document-textarea" rows={4} placeholder="Descreva as novas atividades..."></textarea>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="document-section">
              <h3 className="document-heading">3. Assinaturas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-xs font-semibold text-neutral-600 pt-4">
                <div className="border-t border-neutral-400 pt-2">Representante IFCE</div>
                <div className="border-t border-neutral-400 pt-2">Concedente</div>
                <div className="border-t border-neutral-400 pt-2">Estagiário</div>
              </div>
            </div>

            <FormExportButtons formType="additive-term" formRef={formRef} />
          </form>
        </div>
      </div>
    </div>
  )
}
