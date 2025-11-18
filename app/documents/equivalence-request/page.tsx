'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { FormHeader } from '@/components/FormHeader'

export default function EquivalenceRequestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/employee" className="flex items-center text-blue-600 hover:text-blue-800 mb-6 text-sm font-medium">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Link>

        <div className="bg-white p-8 shadow-lg border-t-4 border-green-600 rounded-lg">
          <FormHeader 
            title="Solicitação de Aproveitamento de Experiência"
            showImages={true}
          />

          <form className="space-y-4 text-sm text-gray-800">
            <div className="grid grid-cols-2 gap-4 border border-gray-300 p-4 rounded-lg bg-gray-50">
              <div className="col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-1">Nome</label><input type="text" className="w-full text-sm border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Matrícula</label><input type="text" className="w-full text-sm border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Curso</label><input type="text" className="w-full text-sm border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
            </div>

            <div className="border border-gray-300 p-4 rounded-lg">
              <h3 className="text-sm font-bold text-green-700 mb-3">Tipo de Experiência a Aproveitar</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-800"><input type="radio" name="tipo" /> Atividade de Extensão, Iniciação Científica ou Monitoria</label>
                <label className="flex items-center gap-2 text-sm text-gray-800"><input type="radio" name="tipo" /> Empregado (CLT) em empresa privada/pública</label>
                <label className="flex items-center gap-2 text-sm text-gray-800"><input type="radio" name="tipo" /> Servidor Público Estatutário</label>
                <label className="flex items-center gap-2 text-sm text-gray-800"><input type="radio" name="tipo" /> Terceiro Setor</label>
              </div>
            </div>

            <div className="border border-gray-300 p-4 rounded-lg bg-gray-50">
              <h3 className="text-sm font-bold text-green-700 mb-3">Documentos Anexos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <label className="flex items-center gap-2 text-sm text-gray-800"><input type="checkbox" /> Declaração de atividades</label>
                <label className="flex items-center gap-2 text-sm text-gray-800"><input type="checkbox" /> Cópia da Carteira de Trabalho (CTPS)</label>
                <label className="flex items-center gap-2 text-sm text-gray-800"><input type="checkbox" /> Cartão CNPJ da empresa</label>
                <label className="flex items-center gap-2 text-sm text-gray-800"><input type="checkbox" /> Ato de nomeação (Servidor Público)</label>
                <label className="flex items-center gap-2 text-sm text-gray-800"><input type="checkbox" /> Contrato Social / Estatuto</label>
              </div>
            </div>
          
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Data Início</label><input type="date" className="w-full text-sm border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Data Fim (Prevista)</label><input type="date" className="w-full text-sm border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Horas Semanais</label><input type="number" className="w-full text-sm border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
            </div>

            <div className="flex justify-between pt-12 px-8 text-center mt-8 border-t border-gray-300">
              <div className="border-t border-black pt-2 w-1/3 text-xs text-gray-700">Assinatura do Discente</div>
              <div className="border-t border-black pt-2 w-1/3 text-xs text-gray-700">Assinatura do Orientador</div>
            </div>

            <div className="flex gap-4 pt-6">
              <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-semibold text-sm transition-colors">
                Salvar Rascunho
              </button>
              <button onClick={() => window.print()} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-semibold text-sm transition-colors">
                Imprimir
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
