'use client'

import { useRef, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { FormHeader } from '@/components/FormHeader'
import { FormExportButtons } from '@/components/FormExportButtons'
import { getDraft, populateFormWithData } from '@/lib/form-drafts'

export default function CommitmentTermPage() {
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadDraft = async () => {
      const draft = await getDraft('commitment-term')
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
              title="TERMO DE COMPROMISSO DE ESTÁGIO"
              showImages={true}
            />

            <div className="document-section">
              <p className="text-sm text-neutral-700 mb-4">
                Nos termos da Lei nº 11.788, de 25/09/2008, celebram entre si este Termo:
              </p>

              <div className="space-y-4">
                <div className="border border-neutral-300 p-4 rounded-lg bg-neutral-50">
                  <p className="text-sm text-neutral-800 mb-2">
                    <span className="font-bold">INSTITUIÇÃO DE ENSINO:</span> IFCE Campus Maracanaú<br />
                    <span className="font-bold">CNPJ:</span> 10.744.098/0009-00
                  </p>
                </div>

                <div className="border border-neutral-300 p-4 rounded-lg bg-white">
                  <h3 className="font-bold text-neutral-800 text-sm mb-3">CONCEDENTE (EMPRESA):</h3>
                  <div className="document-grid">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-neutral-500 mb-1">Razão Social</label>
                      <input type="text" name="company_name" className="document-input" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-neutral-500 mb-1">Endereço</label>
                      <input type="text" name="company_address" className="document-input" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-neutral-500 mb-1">Representante Legal</label>
                      <input type="text" name="company_representative" className="document-input" />
                    </div>
                  </div>
                </div>

                <div className="border border-neutral-300 p-4 rounded-lg bg-white">
                  <h3 className="font-bold text-neutral-800 text-sm mb-3">ESTAGIÁRIO(A):</h3>
                  <div className="document-grid">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-neutral-500 mb-1">Nome Completo</label>
                      <input type="text" name="student_name" className="document-input" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-500 mb-1">CPF</label>
                      <input type="text" name="student_cpf" className="document-input" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-500 mb-1">Curso</label>
                      <input type="text" name="student_course" className="document-input" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="document-section">
              <h2 className="document-heading">1. Do Objeto e Vigência</h2>
              <div className="document-grid">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Modalidade</label>
                  <select name="modality" className="document-input">
                    <option value="">Selecione...</option>
                    <option value="presencial">Presencial</option>
                    <option value="remoto">Remoto</option>
                    <option value="hibrido">Híbrido</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Data Início</label>
                  <input type="date" name="start_date" className="document-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Data Término</label>
                  <input type="date" name="end_date" className="document-input" />
                </div>
              </div>
            </div>

            <div className="document-section">
              <h2 className="document-heading">2. Do Seguro e Remuneração</h2>
              <div className="document-grid">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Nº da Apólice</label>
                  <input type="text" name="insurance_number" className="document-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Seguradora</label>
                  <input type="text" name="insurance_company" className="document-input" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-500 mb-2">Remuneração</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-neutral-700">
                      <input type="radio" name="remuneration_type" value="bolsa" />
                      Bolsa-Auxílio de R$ <input type="text" name="bolsa_value" className="document-input w-32 inline-block ml-2" placeholder="0,00" />
                    </label>
                    <label className="flex items-center gap-2 text-sm text-neutral-700">
                      <input type="radio" name="remuneration_type" value="nao_remunerado" />
                      Não remunerado (Estágio Obrigatório)
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Auxílio-transporte (R$)</label>
                  <input type="text" name="transport_allowance" className="document-input" placeholder="0,00" />
                </div>
              </div>
            </div>

            <div className="document-section page-break-before">
              <h2 className="document-heading text-center">3. Plano de Atividades</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Atividades a serem desenvolvidas</label>
                  <textarea name="activities" className="document-textarea" rows={6} placeholder="Descreva as atividades..."></textarea>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Resultados Esperados</label>
                  <textarea name="expected_results" className="document-textarea" rows={4} placeholder="Descreva os resultados esperados..."></textarea>
                </div>
              </div>
            </div>

            <div className="document-section">
              <h2 className="document-heading">4. Assinaturas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center text-xs font-semibold text-neutral-600 pt-4">
                <div className="border-t border-neutral-400 pt-2">Representante do IFCE</div>
                <div className="border-t border-neutral-400 pt-2">Representante da Concedente</div>
                <div className="border-t border-neutral-400 pt-2">Discente Estagiário</div>
                <div className="border-t border-neutral-400 pt-2">Supervisor do Estágio</div>
              </div>
            </div>

            <FormExportButtons formType="commitment-term" formRef={formRef} />
          </form>
        </div>
      </div>
    </div>
  )
}
