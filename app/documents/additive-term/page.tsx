'use client'

import { useRef } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { FormHeader } from '@/components/FormHeader'
import { FormPDFExport } from '@/components/FormPDFExport'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function AdditiveTermPage() {
  const formRef = useRef<HTMLDivElement>(null)
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/employee" className="flex items-center text-secondary-500 hover:text-secondary-600 mb-6 text-sm font-medium">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Link>

        <div id="additive-term-form" ref={formRef} className="bg-card p-8 shadow-lg border-t-4 border-blue-800 rounded-lg">
        <FormHeader 
          title="Termo Aditivo a Compromisso de Estágio"
          showImages={true}
        />
        
          <div className="mb-6 p-4 border border-gray-300 rounded-lg bg-background">
            <p className="text-sm font-bold text-gray-900 mb-3">Partes:</p>
          <div className="grid grid-cols-1 gap-2">
              <input type="text" className="text-sm border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Instituição Concedente (Empresa)" />
              <input type="text" className="text-sm border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Nome do Estagiário" />
              <input type="text" className="text-sm border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Termo de Compromisso Original (Data)" />
          </div>
        </div>

        <h2 className="font-bold text-lg mb-4 border-b pb-1">Cláusula Primeira - Das Alterações</h2>
        <p className="mb-4 italic text-gray-600">Selecione e preencha apenas o que será alterado:</p>

        <div className="space-y-6">
          <div className="flex items-start gap-2">
            <input type="checkbox" className="mt-1" />
            <div className="w-full">
              <label className="font-bold text-blue-900">Prorrogação de Vigência</label>
              <div className="flex gap-2 mt-1">
                <span>Nova data de término:</span>
                <input type="date" className="border p-1" />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <input type="checkbox" className="mt-1" />
            <div className="w-full">
              <label className="font-bold text-blue-900">Alteração de Bolsa</label>
              <div className="flex gap-2 mt-1">
                <span>Novo valor R$:</span>
                <input type="text" className="border p-1 w-32" />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <input type="checkbox" className="mt-1" />
            <div className="w-full">
              <label className="font-bold text-blue-900">Novo Supervisor</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <input type="text" className="border p-1" placeholder="Nome" />
                <input type="text" className="border p-1" placeholder="Cargo/Formação" />
                <input type="text" className="border p-1" placeholder="CPF" />
                <input type="email" className="border p-1" placeholder="E-mail" />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <input type="checkbox" className="mt-1" />
            <div className="w-full">
              <label className="font-bold text-blue-900">Alteração no Plano de Atividades</label>
              <textarea className="w-full border p-2 mt-1 h-20" placeholder="Descreva as novas atividades..."></textarea>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-300 text-center grid grid-cols-3 gap-4">
          <div className="border-t border-black pt-2">Representante IFCE</div>
          <div className="border-t border-black pt-2">Concedente</div>
          <div className="border-t border-black pt-2">Estagiário</div>
        </div>

        <div className="flex gap-4 pt-6 mt-6">
          <Button variant="primary" size="md">
            Salvar Rascunho
          </Button>
          <FormPDFExport
            formId="additive-term-form"
            fileName="termo-aditivo-estagio"
          />
        </div>
        </div>
      </div>
    </div>
  )
}
