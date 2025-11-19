'use client'

import { useRef, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { FormHeader } from '@/components/FormHeader'
import { FormExportButtons } from '@/components/FormExportButtons'
import { getDraft, populateFormWithData } from '@/lib/form-drafts'

export default function FinalReportPage() {
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Carrega rascunho salvo
    const loadDraft = async () => {
      const draft = await getDraft('final-report')
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
              title="RELATÓRIO FINAL DE ESTÁGIO OBRIGATÓRIO"
              showImages={true}
            />

            <section className="document-section">
              <h2 className="document-heading">1. Identificação</h2>
              <div className="document-grid">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Estagiário(a)</label>
                  <input type="text" name="student_name" className="document-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Matrícula</label>
                  <input type="text" name="student_id" className="document-input" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Empresa concedente</label>
                  <input type="text" name="company" className="document-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Supervisor(a)</label>
                  <input type="text" name="supervisor" className="document-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Período</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input type="date" name="period_start" className="document-input" />
                    <span className="self-center text-neutral-400">até</span>
                    <input type="date" name="period_end" className="document-input" />
                  </div>
                </div>
              </div>
            </section>

            <section className="document-section space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">
                  Descrição das atividades realizadas
                </label>
                <textarea name="activities_description" className="document-textarea" rows={6}></textarea>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">
                  Comparação teoria x prática
                </label>
                <textarea name="theory_practice_comparison" className="document-textarea" rows={5}></textarea>
              </div>
            </section>

            <section className="document-section space-y-6">
              <h2 className="document-heading">3. Avaliações</h2>
              
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-neutral-600">Autoavaliação do discente</h3>
                <table className="document-table text-center">
                  <thead>
                    <tr className="bg-neutral-100 text-xs">
                      <th className="text-left">Critério</th>
                      <th>Ótimo</th>
                      <th>Bom</th>
                      <th>Regular</th>
                      <th>Insuf.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['Assiduidade', 'Comunicação', 'Proatividade', 'Responsabilidade'].map((label, index) => (
                      <tr key={label}>
                        <td className="text-left font-medium">{label}</td>
                        {[0, 1, 2, 3].map((option) => (
                          <td key={`${label}-${option}`}>
                            <input type="radio" name={`aa${index + 1}`} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-neutral-600">Avaliação da supervisão (percepção do aluno)</h3>
                <table className="document-table text-center">
                  <thead>
                    <tr className="bg-neutral-100 text-xs">
                      <th className="text-left">Critério</th>
                      <th>Ótimo</th>
                      <th>Bom</th>
                      <th>Regular</th>
                      <th>Insuf.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['Acompanhamento/Supervisão', 'Comunicação com estagiário', 'Infraestrutura'].map((label, index) => (
                      <tr key={label}>
                        <td className="text-left font-medium">{label}</td>
                        {[0, 1, 2, 3].map((option) => (
                          <td key={`${label}-${option}`}>
                            <input type="radio" name={`as${index + 1}`} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="document-section text-center space-y-4">
              <p>Local e Data: __________________, ____ de ___________ de 20___.</p>
              <div className="w-full sm:w-1/2 mx-auto border-t border-neutral-400 pt-2 font-semibold text-neutral-700">
                Assinatura do Discente
              </div>
            </div>

            <FormExportButtons formType="final-report" formRef={formRef} />
          </form>
        </div>
      </div>
    </div>
  )
}
