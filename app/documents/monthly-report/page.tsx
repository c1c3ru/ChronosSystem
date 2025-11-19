'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { FormHeader } from '@/components/FormHeader'
import { FormPDFExport } from '@/components/FormPDFExport'
import { Button } from '@/components/ui/Button'

export default function MonthlyReportPage() {
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

        <div id="monthly-report-form" className="document-page text-sm">
          <FormHeader title="Relatório Mensal de Atividades" showImages />

          <form className="space-y-6">
            <div className="document-section">
              <h3 className="document-heading">Identificação</h3>
              <div className="document-grid">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Estagiário(a)</label>
                  <input type="text" className="document-input" placeholder="Nome completo" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Supervisor</label>
                  <input type="text" className="document-input" placeholder="Nome do supervisor" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Orientador</label>
                  <input type="text" className="document-input" placeholder="Nome do orientador" />
                </div>
              </div>
            </div>

            <div className="document-section">
              <h3 className="document-heading">Período e Carga Horária</h3>
              <div className="document-grid">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Período</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input type="date" className="document-input" />
                    <span className="self-center text-neutral-400">até</span>
                    <input type="date" className="document-input" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Carga Horária (horas)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input type="number" className="document-input" placeholder="No mês" />
                    <input type="number" className="document-input" placeholder="Acumulado" />
                  </div>
                </div>
              </div>
            </div>

            <div className="document-section space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">
                  Principais atividades desenvolvidas
                </label>
                <textarea className="document-textarea" rows={5} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">Dificuldades encontradas</label>
                <textarea className="document-textarea" rows={4} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">Soluções adotadas</label>
                <textarea className="document-textarea" rows={4} />
              </div>
            </div>

            <div className="document-section">
              <h3 className="document-heading">Assinaturas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-xs font-semibold text-neutral-600">
                <div>
                  <div className="border-t border-neutral-400 pt-2">Estagiário(a)</div>
                  <input type="date" className="document-input mt-2" />
                </div>
                <div>
                  <div className="border-t border-neutral-400 pt-2">Supervisor</div>
                  <input type="date" className="document-input mt-2" />
                </div>
                <div>
                  <div className="border-t border-neutral-400 pt-2">Orientador</div>
                  <input type="date" className="document-input mt-2" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button variant="primary" size="md" className="flex-1 min-w-[160px]">
                Salvar Rascunho
              </Button>
              <FormPDFExport formId="monthly-report-form" fileName="relatorio-mensal" />
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
