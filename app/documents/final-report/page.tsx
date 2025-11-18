'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { FormHeader } from '@/components/FormHeader'

export default function FinalReportPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/employee" className="flex items-center text-blue-600 hover:text-blue-800 mb-6 text-sm font-medium">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Link>

        <div className="bg-white p-8 shadow-lg border-t-4 border-green-600 rounded-lg text-sm text-gray-800">
          <FormHeader 
            title="RELATÓRIO FINAL DE ESTÁGIO OBRIGATÓRIO"
            showImages={true}
          />

          <section className="mb-6">
            <h2 className="text-lg font-bold border-b-2 border-gray-800 mb-4">1. Identificação</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><label className="block font-bold">Estagiário(a)</label><input type="text" className="w-full border p-2 bg-gray-50" /></div>
              <div><label className="block font-bold">Matrícula</label><input type="text" className="w-full border p-2 bg-gray-50" /></div>
              <div className="col-span-2"><label className="block font-bold">Empresa Concedente</label><input type="text" className="w-full border p-2 bg-gray-50" /></div>
              <div><label className="block font-bold">Supervisor</label><input type="text" className="w-full border p-2 bg-gray-50" /></div>
              <div><label className="block font-bold">Período</label><div className="flex gap-2"><input type="date" className="border p-1 w-1/2" /><input type="date" className="border p-1 w-1/2" /></div></div>
            </div>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-bold border-b-2 border-gray-800 mb-4">2. Desenvolvimento das Atividades</h2>
            <label className="block text-sm font-semibold mb-1">Descrição das atividades realizadas:</label>
            <textarea className="w-full border p-2 h-32 rounded mb-4"></textarea>
            
            <label className="block text-sm font-semibold mb-1">Comparação teoria x prática:</label>
            <textarea className="w-full border p-2 h-24 rounded"></textarea>
          </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold border-b-2 border-gray-800 mb-4">3. Avaliações</h2>
          
          <div className="bg-blue-50 p-4 rounded mb-4">
            <h3 className="font-bold text-blue-800 mb-2">Autoavaliação do Discente</h3>
            <table className="w-full text-sm text-left">
              <thead>
                <tr>
                  <th>Critério</th>
                  <th>Ótimo</th>
                  <th>Bom</th>
                  <th>Regular</th>
                  <th>Insuf.</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr><td>Assiduidade</td> <td><input type="radio" name="aa1" /></td> <td><input type="radio" name="aa1" /></td> <td><input type="radio" name="aa1" /></td> <td><input type="radio" name="aa1" /></td></tr>
                <tr><td>Comunicação</td> <td><input type="radio" name="aa2" /></td> <td><input type="radio" name="aa2" /></td> <td><input type="radio" name="aa2" /></td> <td><input type="radio" name="aa2" /></td></tr>
                <tr><td>Proatividade</td> <td><input type="radio" name="aa3" /></td> <td><input type="radio" name="aa3" /></td> <td><input type="radio" name="aa3" /></td> <td><input type="radio" name="aa3" /></td></tr>
                <tr><td>Responsabilidade</td> <td><input type="radio" name="aa4" /></td> <td><input type="radio" name="aa4" /></td> <td><input type="radio" name="aa4" /></td> <td><input type="radio" name="aa4" /></td></tr>
              </tbody>
            </table>
          </div>

          <div className="bg-green-50 p-4 rounded">
            <h3 className="font-bold text-green-800 mb-2">Avaliação da Supervisão (Pelo Aluno)</h3>
            <table className="w-full text-sm text-left">
              <thead>
                <tr>
                  <th>Critério</th>
                  <th>Ótimo</th>
                  <th>Bom</th>
                  <th>Regular</th>
                  <th>Insuf.</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr><td>Acompanhamento/Supervisão</td> <td><input type="radio" name="as1" /></td> <td><input type="radio" name="as1" /></td> <td><input type="radio" name="as1" /></td> <td><input type="radio" name="as1" /></td></tr>
                <tr><td>Comunicação com estagiário</td> <td><input type="radio" name="as2" /></td> <td><input type="radio" name="as2" /></td> <td><input type="radio" name="as2" /></td> <td><input type="radio" name="as2" /></td></tr>
                <tr><td>Infraestrutura</td> <td><input type="radio" name="as3" /></td> <td><input type="radio" name="as3" /></td> <td><input type="radio" name="as3" /></td> <td><input type="radio" name="as3" /></td></tr>
              </tbody>
            </table>
          </div>
          </section>

          <div className="mt-8 border-t pt-4 text-center">
            <p className="mb-8 text-sm">Local e Data: __________________, ____ de ___________ de 20___.</p>
            <div className="w-1/2 mx-auto border-t border-black pt-2 font-bold">Assinatura do Discente</div>
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
    </div>
  )
}
