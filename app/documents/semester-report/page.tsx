'use client'

import { useRef, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { FormHeader } from '@/components/FormHeader'
import { FormExportButtons } from '@/components/FormExportButtons'
import { getDraft, populateFormWithData } from '@/lib/form-drafts'

export default function SemesterReportPage() {
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await getDraft('semester-report')
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
              title="RELATÓRIO SEMESTRAL DE ATIVIDADES"
              showImages={true}
            />

            <div className="document-section">
              <h3 className="document-heading">1. Identificação</h3>
              <div className="document-grid">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Estagiário(a)</label>
                  <input type="text" name="student_name" className="document-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Supervisor</label>
                  <input type="text" name="supervisor_name" className="document-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Orientador</label>
                  <input type="text" name="advisor_name" className="document-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Período</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input type="date" name="period_start" className="document-input" />
                    <span className="self-center text-neutral-400">até</span>
                    <input type="date" name="period_end" className="document-input" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Carga Horária Total</label>
                  <input type="number" name="total_hours" className="document-input" />
                </div>
              </div>
            </div>

            <div className="document-section">
              <h3 className="document-heading">2. Atividades</h3>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">Principais Atividades no Período</label>
                <textarea name="activities" className="document-textarea" rows={5}></textarea>
              </div>
            </div>

            <div className="document-section">
              <h3 className="document-heading">3. Avaliação do Discente</h3>
              <p className="text-xs text-center mb-3 italic text-neutral-600">Conceitos: 1-Insatisfatório, 2-Pouco Satisfatório, 3-Satisfatório, 4-Muito Satisfatório</p>

              <table className="document-table text-center">
                <thead className="bg-neutral-100">
                  <tr>
                    <th className="text-left">Critério</th>
                    <th>1</th>
                    <th>2</th>
                    <th>3</th>
                    <th>4</th>
                  </tr>
                </thead>
                <tbody>
                  {['Assiduidade', 'Disciplina', 'Proatividade', 'Relacionamento Interpessoal', 'Qualidade no Trabalho'].map((criterion, index) => (
                    <tr key={criterion}>
                      <td className="text-left font-medium">{criterion}</td>
                      {[1, 2, 3, 4].map((value) => (
                        <td key={value}>
                          <input type="radio" name={`evaluation_${index + 1}`} value={value} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="document-section">
              <h3 className="document-heading">4. Observações</h3>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">Observações / Comentários</label>
                <textarea name="comments" className="document-textarea" rows={4}></textarea>
              </div>
            </div>

            <div className="document-section">
              <h3 className="document-heading">5. Assinaturas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center text-xs font-semibold text-neutral-600 pt-4">
                <div className="border-t border-neutral-400 pt-2">Supervisor do Estágio</div>
                <div className="border-t border-neutral-400 pt-2">Discente Estagiário</div>
              </div>
            </div>

            <FormExportButtons formType="semester-report" formRef={formRef} />
          </form>
        </div>
      </div>
    </div>
  )
}
