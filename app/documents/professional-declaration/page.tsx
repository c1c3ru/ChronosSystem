'use client'

import { useRef } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { FormHeader } from '@/components/FormHeader'
import { FormPDFExport } from '@/components/FormPDFExport'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function ProfessionalDeclarationPage() {
  const formRef = useRef<HTMLDivElement>(null)

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6" id="professional-declaration-form" ref={formRef}>
        <Link
          href="/employee"
          className="flex items-center text-secondary-400 hover:text-secondary-200 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Link>

        <div className="document-page text-sm space-y-6">
          <FormHeader title="Declaração de Atividades Profissionais" showImages />

          <p className="text-neutral-700">
            Para fins de <strong>aproveitamento</strong> de atividades profissionais como estágio supervisionado obrigatório,
            a instituição abaixo declara os seguintes fatos:
          </p>

          <div className="document-section">
            <h3 className="document-heading">Dados da Instituição/Empresa</h3>
            <div className="document-grid">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-neutral-500 mb-1">Razão Social</label>
                <input type="text" className="document-input" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">CNPJ</label>
                <input type="text" className="document-input" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">Telefone</label>
                <input type="text" className="document-input" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-neutral-500 mb-1">Endereço Completo</label>
                <input type="text" className="document-input" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-neutral-500 mb-1">
                  Responsável pela assinatura
                </label>
                <input type="text" className="document-input" />
              </div>
            </div>
          </div>

          <div className="document-section">
            <h3 className="document-heading">Dados do Empregado (Aluno)</h3>
            <div className="document-grid">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-neutral-500 mb-1">Nome completo</label>
                <input type="text" className="document-input" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">CPF</label>
                <input type="text" className="document-input" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">Início do vínculo</label>
                <input type="date" className="document-input" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-neutral-500 mb-1">Área ou setor de trabalho</label>
                <input type="text" className="document-input" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-neutral-500 mb-1">Descrição das atividades</label>
                <textarea className="document-textarea" />
              </div>
            </div>
          </div>

          <div className="document-section text-center space-y-4">
            <p>Local e Data: ______________________, _____ de _______________ de _______.</p>
            <div className="w-full sm:w-2/3 mx-auto border-t border-neutral-400 pt-3">
              <p className="font-semibold text-neutral-700">Assinatura e carimbo do responsável pela empresa</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button variant="primary" size="md" className="flex-1 min-w-[160px]">
              Salvar Rascunho
            </Button>
            <FormPDFExport formId="professional-declaration-form" fileName="declaracao-profissional" />
          </div>
        </div>
      </div>
    </div>
  )
}
