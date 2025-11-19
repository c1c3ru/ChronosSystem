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
    <div className="bg-card p-12 max-w-[210mm] mx-auto min-h-screen">
      <Link href="/employee" className="flex items-center text-secondary-500 hover:text-secondary-600 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Link>

      <FormHeader 
        title="Declaração de Atividades Profissionais"
        showImages={true}
      />
      
      <p className="text-justify mb-6">
        Para fins de <strong>APROVEITAMENTO</strong> de atividades profissionais como estágio supervisionado obrigatório, a instituição abaixo declara os seguintes fatos:
      </p>

      <div className="border border-black p-4 mb-6 space-y-2">
        <h3 className="font-bold bg-gray-200 p-1">Dados da Instituição/Empresa</h3>
        <div className="grid grid-cols-1 gap-2">
          <input type="text" className="border-b border-gray-400 w-full" placeholder="Razão Social" />
          <div className="flex gap-4">
            <input type="text" className="border-b border-gray-400 w-1/2" placeholder="CNPJ" />
            <input type="text" className="border-b border-gray-400 w-1/2" placeholder="Telefone" />
          </div>
          <input type="text" className="border-b border-gray-400 w-full" placeholder="Endereço Completo" />
          <input type="text" className="border-b border-gray-400 w-full" placeholder="Responsável pela Assinatura" />
        </div>
      </div>

      <div className="border border-black p-4 mb-6 space-y-2">
        <h3 className="font-bold bg-gray-200 p-1">Dados do Empregado (Aluno)</h3>
        <input type="text" className="border-b border-gray-400 w-full" placeholder="Nome Completo" />
        <div className="flex gap-4">
          <input type="text" className="border-b border-gray-400 w-1/2" placeholder="CPF" />
          <input type="date" className="border-b border-gray-400 w-1/2" title="Data de Início do Vínculo" />
        </div>
        <input type="text" className="border-b border-gray-400 w-full" placeholder="Área ou Setor de Trabalho" />
        <div className="mt-2">
          <label className="font-bold block">Descrição das Atividades Exercidas:</label>
          <textarea className="w-full border border-gray-300 p-2 h-32 resize-none"></textarea>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="mb-8">Local e Data: ______________________, _____ de _______________ de _______.</p>
        <div className="w-2/3 mx-auto border-t border-black pt-2">
          <p className="font-bold">Assinatura e Carimbo do Responsável pela Empresa</p>
        </div>
      </div>

      <div className="flex gap-4 pt-6 mt-6">
        <Button variant="primary" size="md">
          Salvar Rascunho
        </Button>
        <FormPDFExport
          formId="professional-declaration-form"
          fileName="declaracao-profissional"
        />
      </div>
    </div>
  )
}
