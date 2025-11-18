'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function SemesterReportPage() {
  return (
    <div className="bg-gray-50 p-8 text-sm min-h-screen">
      <Link href="/employee" className="flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Link>

      <div className="max-w-3xl mx-auto bg-white p-8 shadow border-t-4 border-green-600">
        <header className="text-center mb-6 font-bold text-gray-800 uppercase">
          <h1>Pró-Reitoria de Extensão - IFCE</h1>
          <h2 className="text-xl mt-2 text-green-600">Relatório Semestral de Atividades</h2>
        </header>

        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4 border p-4 rounded">
            <div className="col-span-2"><label className="block font-bold">Estagiário(a)</label><input type="text" className="w-full border-b border-black" /></div>
            <div><label className="block font-bold">Supervisor</label><input type="text" className="w-full border-b border-black" /></div>
            <div><label className="block font-bold">Orientador</label><input type="text" className="w-full border-b border-black" /></div>
            <div><label className="block font-bold">Período</label><input type="text" className="w-full border-b border-black" placeholder="___/___ a ___/___" /></div>
            <div><label className="block font-bold">Carga Horária Total</label><input type="number" className="w-full border-b border-black" /></div>
          </div>

          <div className="mb-4">
            <label className="block font-bold mb-1">Principais Atividades no Período</label>
            <textarea className="w-full border p-2 rounded h-24"></textarea>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-bold text-center mb-4 uppercase">Avaliação do Discente</h3>
            <p className="text-xs text-center mb-2 italic">Conceitos: 1-Insatisfatório, 2-Pouco Satisfatório, 3-Satisfatório, 4-Muito Satisfatório</p>
            
            <table className="w-full text-left bg-white border">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 border">Critério</th>
                  <th className="p-2 border text-center">1</th>
                  <th className="p-2 border text-center">2</th>
                  <th className="p-2 border text-center">3</th>
                  <th className="p-2 border text-center">4</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="p-2 border">Assiduidade</td> <td className="text-center"><input type="radio" name="av1" /></td> <td className="text-center"><input type="radio" name="av1" /></td> <td className="text-center"><input type="radio" name="av1" /></td> <td className="text-center"><input type="radio" name="av1" /></td></tr>
                <tr><td className="p-2 border">Disciplina</td> <td className="text-center"><input type="radio" name="av2" /></td> <td className="text-center"><input type="radio" name="av2" /></td> <td className="text-center"><input type="radio" name="av2" /></td> <td className="text-center"><input type="radio" name="av2" /></td></tr>
                <tr><td className="p-2 border">Proatividade</td> <td className="text-center"><input type="radio" name="av3" /></td> <td className="text-center"><input type="radio" name="av3" /></td> <td className="text-center"><input type="radio" name="av3" /></td> <td className="text-center"><input type="radio" name="av3" /></td></tr>
                <tr><td className="p-2 border">Relacionamento Interpessoal</td> <td className="text-center"><input type="radio" name="av4" /></td> <td className="text-center"><input type="radio" name="av4" /></td> <td className="text-center"><input type="radio" name="av4" /></td> <td className="text-center"><input type="radio" name="av4" /></td></tr>
                <tr><td className="p-2 border">Qualidade no Trabalho</td> <td className="text-center"><input type="radio" name="av5" /></td> <td className="text-center"><input type="radio" name="av5" /></td> <td className="text-center"><input type="radio" name="av5" /></td> <td className="text-center"><input type="radio" name="av5" /></td></tr>
              </tbody>
            </table>
          </div>

          <div>
            <label className="block font-bold mb-1">Observações / Comentários</label>
            <textarea className="w-full border p-2 rounded h-20"></textarea>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-6 text-center">
            <div><div className="border-t border-black pt-1">Supervisor do Estágio</div></div>
            <div><div className="border-t border-black pt-1">Discente Estagiário</div></div>
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
