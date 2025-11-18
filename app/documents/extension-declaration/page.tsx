'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { FormHeader } from '@/components/FormHeader'

export default function ExtensionDeclarationPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/employee" className="flex items-center text-blue-600 hover:text-blue-800 mb-6 text-sm font-medium">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Link>

        <div className="bg-white p-8 shadow-lg border-t-4 border-green-600 rounded-lg">

          <FormHeader 
            title="Declaração de Participação em Projeto"
            showImages={true}
          />

          <form className="space-y-6 text-sm text-gray-800">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nome do Declarante (Orientador/Coordenador):</label>
              <input type="text" className="w-full text-sm border-b border-black p-2 bg-gray-50 focus:outline-none" />
            </div>

            <p className="text-justify py-4 text-sm text-gray-800">
              Declaro, para fins de equiparação a estágio supervisionado, que o(a) discente abaixo participou das atividades descritas:
            </p>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2"><label className="font-bold text-sm block">Discente</label><input type="text" className="w-full border-b border-black bg-gray-50" /></div>
          <div><label className="font-bold text-sm block">Matrícula</label><input type="text" className="w-full border-b border-black bg-gray-50" /></div>
        </div>

        <div className="border p-4 rounded">
          <span className="font-bold mr-4">Modalidade:</span>
          <label className="mr-4"><input type="radio" name="mod" /> Extensão</label>
          <label className="mr-4"><input type="radio" name="mod" /> Iniciação Científica</label>
          <label><input type="radio" name="mod" /> Monitoria</label>
        </div>

        <div>
          <label className="block font-bold text-sm">Título do Projeto/Programa:</label>
          <input type="text" className="w-full border-b border-black p-1" />
        </div>

        <div>
          <label className="block font-bold text-sm">Atividades Desenvolvidas:</label>
          <textarea className="w-full border border-gray-300 p-2 h-24 rounded"></textarea>
        </div>

        <div className="flex gap-8">
          <div className="w-1/2">
            <label className="block font-bold text-sm">Data Início:</label>
            <input type="date" className="w-full border-b border-black" />
          </div>
          <div className="w-1/2">
            <label className="block font-bold text-sm">Carga Horária Semanal:</label>
            <input type="number" className="w-full border-b border-black" />
          </div>
        </div>

        <div className="text-center pt-12">
          <div className="w-1/2 mx-auto border-t border-black pt-2">
            Assinatura do Servidor Responsável
          </div>
        </div>

        <div className="flex gap-4 pt-6">
          <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold">
            Salvar Rascunho
          </button>
          <button onClick={() => window.print()} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold">
            Imprimir
          </button>
        </div>
      </form>
        </div>
      </div>
    </div>
  )
}
