'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AdditiveTermPage() {
  return (
    <div className="bg-gray-50 p-8 text-sm min-h-screen">
      <Link href="/employee" className="flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Link>

      <div className="max-w-4xl mx-auto bg-white p-8 shadow border-t-4 border-blue-800">
        <h1 className="text-xl font-bold text-center mb-6 uppercase">Termo Aditivo a Compromisso de Estágio</h1>
        
        <div className="mb-6 p-4 border bg-gray-50">
          <p className="font-bold mb-2">Partes:</p>
          <div className="grid grid-cols-1 gap-2">
            <input type="text" className="border p-1 rounded" placeholder="Instituição Concedente (Empresa)" />
            <input type="text" className="border p-1 rounded" placeholder="Nome do Estagiário" />
            <input type="text" className="border p-1 rounded" placeholder="Termo de Compromisso Original (Data)" />
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
          <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold">
            Salvar Rascunho
          </button>
          <button onClick={() => window.print()} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold">
            Imprimir
          </button>
        </div>
      </div>
    </div>
  )
}
