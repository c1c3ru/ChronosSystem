'use client'

import { useRef, useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { FormHeader } from '@/components/FormHeader'
import { FormExportButtons } from '@/components/FormExportButtons'
import { getDraft, populateFormWithData } from '@/lib/form-drafts'
import { PageTransition } from '@/components/PageTransition'
import { FormSkeleton } from '@/components/skeletons'
import { haptic } from '@/lib/haptic'

export default function ExtensionDeclarationPage() {
  const formRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDraft = async () => {
      try {
        const draft = await getDraft('extension-declaration')
        if (draft) {
          const form = formRef.current?.querySelector('form') as HTMLFormElement
          if (form) {
            populateFormWithData(form, draft)
          }
        }
      } finally {
        // Pequeno delay para transição suave
        setTimeout(() => setIsLoading(false), 300)
      }
    }
    loadDraft()
  }, [])

  return (
    <PageTransition variant="fade" duration={0.2}>
      <div className="min-h-screen bg-background p-4 sm:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Link
            href="/employee"
            className="flex items-center text-secondary-400 hover:text-secondary-200 text-sm font-medium"
            onClick={() => haptic.tap()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>

          {isLoading ? (
            <div className="document-page text-sm border-t-4 border-primary-500 p-6">
              <FormSkeleton fields={8} showSubmitButton={true} />
            </div>
          ) : (
            <div ref={formRef} className="document-page text-sm border-t-4 border-primary-500">
              <form className="space-y-6">
                <FormHeader
                  title="DECLARAÇÃO DE PARTICIPAÇÃO EM PROJETO"
                  showImages={true}
                />

                <div className="document-section">
                  <div className="document-grid">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-neutral-500 mb-1">Nome do Declarante (Orientador/Coordenador)</label>
                      <input type="text" name="declarant_name" className="document-input" />
                    </div>
                  </div>

                  <p className="text-justify py-4 text-sm text-neutral-700">
                    Declaro, para fins de equiparação a estágio supervisionado, que o(a) discente abaixo participou das atividades descritas:
                  </p>
                </div>

                <div className="document-section">
                  <h3 className="document-heading">1. Dados do Discente</h3>
                  <div className="document-grid">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-neutral-500 mb-1">Discente</label>
                      <input type="text" name="student_name" className="document-input" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-500 mb-1">Matrícula</label>
                      <input type="text" name="student_id" className="document-input" />
                    </div>
                  </div>
                </div>

                <div className="document-section">
                  <h3 className="document-heading">2. Modalidade</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-neutral-700">
                      <input type="radio" name="modality" value="extension" />
                      Extensão
                    </label>
                    <label className="flex items-center gap-2 text-sm text-neutral-700">
                      <input type="radio" name="modality" value="research" />
                      Iniciação Científica
                    </label>
                    <label className="flex items-center gap-2 text-sm text-neutral-700">
                      <input type="radio" name="modality" value="monitoring" />
                      Monitoria
                    </label>
                  </div>
                </div>

                <div className="document-section">
                  <h3 className="document-heading">3. Detalhes do Projeto</h3>
                  <div className="document-grid">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-neutral-500 mb-1">Título do Projeto/Programa</label>
                      <input type="text" name="project_title" className="document-input" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-neutral-500 mb-1">Atividades Desenvolvidas</label>
                      <textarea name="activities" className="document-textarea" rows={4}></textarea>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-500 mb-1">Data Início</label>
                      <input type="date" name="start_date" className="document-input" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-500 mb-1">Carga Horária Semanal</label>
                      <input type="number" name="weekly_hours" className="document-input" />
                    </div>
                  </div>
                </div>

                <div className="document-section text-center space-y-4">
                  <div className="w-full sm:w-2/3 mx-auto border-t border-neutral-400 pt-3">
                    <p className="font-semibold text-neutral-700">Assinatura do Servidor Responsável</p>
                  </div>
                </div>

                <FormExportButtons formType="extension-declaration" formRef={formRef} />
              </form>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
