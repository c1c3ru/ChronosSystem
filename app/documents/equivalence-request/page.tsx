'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function EquivalenceRequestPage() {
  return (
    <div className="bg-gray-50 p-8 text-sm min-h-screen">
      <Link href="/employee" className="flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Link>

      <div className="max-w-3xl mx-auto bg-white p-8 shadow border-t-4 border-green-600">
        <header className="text-center mb-6">
          <h1 className="font-bold text-lg text-green-700 uppercase">Solicitação de Aproveitamento de Experiência</h1>
          <p className="text-gray-500">Coordenação de Estágios - IFCE</p>
        </header>

        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4 border p-4 rounded bg-gray-50">
            <div className="col-span-2"><label className="block font-bold">Nome</label><input type="text" className="w-full border p-1" /></div>
            <div><label className="block font-bold">Matrícula</label><input type="text" className="w-full border p-1" /></div>
            <div><label className="block font-bold">Curso</label><input type="text" className="w-full border p-1" /></div>
          </div>

          <div className="border p-4 rounded">
            <h3 className="font-bold mb-2 text-green-700">Tipo de Experiência a Aproveitar</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2"><input type="radio" name="tipo" /> Atividade de Extensão, Iniciação Científica ou Monitoria</label>
              <label className="flex items-center gap-2"><input type="radio" name="tipo" /> Empregado (CLT) em empresa privada/pública</label>
              <label className="flex items-center gap-2"><input type="radio" name="tipo" /> Servidor Público Estatutário</label>
              <label className="flex items-center gap-2"><input type="radio" name="tipo" /> Terceiro Setor</label>
            </div>
          </div>

          <div className="border p-4 rounded bg-gray-50">
            <h3 className="font-bold mb-2 text-green-700">Documentos Anexos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <label className="flex items-center gap-2"><input type="checkbox" /> Declaração de atividades</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Cópia da Carteira de Trabalho (CTPS)</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Cartão CNPJ da empresa</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Ato de nomeação (Servidor Público)</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Contrato Social / Estatuto</label>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block font-bold">Data Início</label><input type="date" className="w-full border p-1" /></div>
            <div><label className="block font-bold">Data Fim (Prevista)</label><input type="date" className="w-full border p-1" /></div>
            <div><label className="block font-bold">Horas Semanais</label><input type="number" className="w-full border p-1" /></div>
          </div>

          <div className="flex justify-between pt-8 text-center">
            <div className="border-t border-black pt-2 w-1/3">Assinatura do Discente</div>
            <div className="border-t border-black pt-2 w-1/3">Assinatura do Orientador</div>
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
  )
}
