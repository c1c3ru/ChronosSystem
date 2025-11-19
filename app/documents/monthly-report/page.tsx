'use client'

import { useRef, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { FormHeader } from '@/components/FormHeader'
import { FormExportButtons } from '@/components/FormExportButtons'
import { getDraft, populateFormWithData } from '@/lib/form-drafts'

export default function MonthlyReportPage() {
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Carrega rascunho salvo
    const loadDraft = async () => {
      const draft = await getDraft('monthly-report')
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
            <FormHeader title="RELATÓRIO MENSAL DE ATIVIDADES" showImages={true} />

            <div className="document-section">
              <h3 className="document-heading">1. Identificação</h3>
              <div className="document-grid">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Estagiário(a)</label>
                  <input type="text" name="student_name" className="document-input" placeholder="Nome completo" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Supervisor</label>
                  <input type="text" name="supervisor_name" className="document-input" placeholder="Nome do supervisor" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Orientador</label>
                  <input type="text" name="advisor_name" className="document-input" placeholder="Nome do orientador" />
                </div>
              </div>
            </div>

            <div className="document-section">
              <h3 className="document-heading">2. Período e Carga Horária</h3>
              <div className="document-grid">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Período</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input type="date" name="period_start" className="document-input" />
                    <span className="self-center text-neutral-400">até</span>
                    <input type="date" name="period_end" className="document-input" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Carga Horária (horas)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input type="number" name="hours_month" className="document-input" placeholder="No mês" />
                    <input type="number" name="hours_total" className="document-input" placeholder="Acumulado" />
                  </div>
                </div>
              </div>
            </div>

            <div className="document-section space-y-4">
              <h3 className="document-heading">3. Atividades</h3>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">
                  Principais atividades desenvolvidas
                </label>
                <textarea name="activities" className="document-textarea" rows={5} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">Dificuldades encontradas</label>
                <textarea name="difficulties" className="document-textarea" rows={4} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">Soluções adotadas</label>
                <textarea name="solutions" className="document-textarea" rows={4} />
              </div>
            </div>

            <div className="document-section">
              <h3 className="document-heading">4. Assinaturas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-xs font-semibold text-neutral-600 pt-4">
                <div>
                  <div className="border-t border-neutral-400 pt-2">Estagiário(a)</div>
                  <input type="date" name="date_student" className="document-input mt-2 text-center" />
                </div>
                <div>
                  <div className="border-t border-neutral-400 pt-2">Supervisor</div>
                  <input type="date" name="date_supervisor" className="document-input mt-2 text-center" />
                </div>
                <div>
                  <div className="border-t border-neutral-400 pt-2">Orientador</div>
                  <input type="date" name="date_advisor" className="document-input mt-2 text-center" />
                </div>
              </div>
            </div>

            <FormExportButtons formType="monthly-report" formRef={formRef} />
          </form>
        </div>
      </div>
    </div>
  )
}
