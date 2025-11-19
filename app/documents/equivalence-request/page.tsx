'use client'

import { useRef, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { FormHeader } from '@/components/FormHeader'
import { FormExportButtons } from '@/components/FormExportButtons'
import { getDraft, populateFormWithData } from '@/lib/form-drafts'

export default function EquivalenceRequestPage() {
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await getDraft('equivalence-request')
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
              title="SOLICITAÇÃO DE APROVEITAMENTO DE EXPERIÊNCIA"
              showImages={true}
            />

            <div className="document-section">
              <h3 className="document-heading">1. Identificação</h3>
              <div className="document-grid">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Nome</label>
                  <input type="text" name="student_name" className="document-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Matrícula</label>
                  <input type="text" name="student_id" className="document-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Curso</label>
                  <input type="text" name="student_course" className="document-input" />
                </div>
              </div>
            </div>

            <div className="document-section">
              <h3 className="document-heading">2. Tipo de Experiência</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-neutral-700">
                  <input type="radio" name="experience_type" value="extension" />
                  Atividade de Extensão, Iniciação Científica ou Monitoria
                </label>
                <label className="flex items-center gap-2 text-sm text-neutral-700">
                  <input type="radio" name="experience_type" value="clt" />
                  Empregado (CLT) em empresa privada/pública
                </label>
                <label className="flex items-center gap-2 text-sm text-neutral-700">
                  <input type="radio" name="experience_type" value="public_servant" />
                  Servidor Público Estatutário
                </label>
                <label className="flex items-center gap-2 text-sm text-neutral-700">
                  <input type="radio" name="experience_type" value="third_sector" />
                  Terceiro Setor
                </label>
              </div>
            </div>

            <div className="document-section">
              <h3 className="document-heading">3. Documentos Anexos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <label className="flex items-center gap-2 text-sm text-neutral-700">
                  <input type="checkbox" name="doc_declaration" />
                  Declaração de atividades
                </label>
                <label className="flex items-center gap-2 text-sm text-neutral-700">
                  <input type="checkbox" name="doc_ctps" />
                  Cópia da Carteira de Trabalho (CTPS)
                </label>
                <label className="flex items-center gap-2 text-sm text-neutral-700">
                  <input type="checkbox" name="doc_cnpj" />
                  Cartão CNPJ da empresa
                </label>
                <label className="flex items-center gap-2 text-sm text-neutral-700">
                  <input type="checkbox" name="doc_appointment" />
                  Ato de nomeação (Servidor Público)
                </label>
                <label className="flex items-center gap-2 text-sm text-neutral-700">
                  <input type="checkbox" name="doc_contract" />
                  Contrato Social / Estatuto
                </label>
              </div>
            </div>

            <div className="document-section">
              <h3 className="document-heading">4. Período e Carga Horária</h3>
              <div className="document-grid">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Data Início</label>
                  <input type="date" name="start_date" className="document-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Data Fim (Prevista)</label>
                  <input type="date" name="end_date" className="document-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Horas Semanais</label>
                  <input type="number" name="weekly_hours" className="document-input" />
                </div>
              </div>
            </div>

            <div className="document-section">
              <h3 className="document-heading">5. Assinaturas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center text-xs font-semibold text-neutral-600 pt-4">
                <div className="border-t border-neutral-400 pt-2">Assinatura do Discente</div>
                <div className="border-t border-neutral-400 pt-2">Assinatura do Orientador</div>
              </div>
            </div>

            <FormExportButtons formType="equivalence-request" formRef={formRef} />
          </form>
        </div>
      </div>
    </div>
  )
}
