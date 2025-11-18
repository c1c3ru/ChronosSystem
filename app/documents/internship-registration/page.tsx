'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function InternshipRegistrationPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/employee" className="flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Link>

        <div className="bg-white p-8 shadow-lg border-t-4 border-green-600">
          <header className="text-center mb-6">
            <h1 className="font-bold text-sm uppercase">Pró-Reitoria de Extensão</h1>
            <h2 className="font-bold text-sm uppercase">Coordenação de Estágios e Acompanhamento de Egressos</h2>
            <h3 className="text-sm">IFCE Campus Maracanaú</h3>
            <h3 className="text-xl font-bold mt-4 text-green-600 uppercase">Solicitação de Cadastro no Estágio</h3>
          </header>

          <form className="space-y-4 text-sm">
            <fieldset className="border p-4 rounded">
              <legend className="font-bold px-2 text-gray-700">Dados do Discente</legend>
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3"><label className="block font-semibold">Nome</label><input type="text" className="w-full border p-1 rounded" /></div>
                <div className="col-span-1"><label className="block font-semibold">CPF</label><input type="text" className="w-full border p-1 rounded" /></div>
                <div className="col-span-4"><label className="block font-semibold">Nome Social</label><input type="text" className="w-full border p-1 rounded" /></div>
                <div className="col-span-3"><label className="block font-semibold">Curso</label><input type="text" className="w-full border p-1 rounded" /></div>
                <div className="col-span-1"><label className="block font-semibold">Matrícula</label><input type="text" className="w-full border p-1 rounded" /></div>
                <div className="col-span-4"><label className="block font-semibold">Endereço</label><input type="text" className="w-full border p-1 rounded" /></div>
                <div className="col-span-2"><label className="block font-semibold">Bairro</label><input type="text" className="w-full border p-1 rounded" /></div>
                <div className="col-span-1"><label className="block font-semibold">Município-UF</label><input type="text" className="w-full border p-1 rounded" /></div>
                <div className="col-span-1"><label className="block font-semibold">CEP</label><input type="text" className="w-full border p-1 rounded" /></div>
                <div className="col-span-1"><label className="block font-semibold">Telefone</label><input type="text" className="w-full border p-1 rounded" /></div>
                <div className="col-span-3"><label className="block font-semibold">E-mail Institucional</label><input type="email" className="w-full border p-1 rounded" /></div>
              </div>
            </fieldset>

            <fieldset className="border p-4 rounded bg-gray-50">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="font-bold mb-2">Cor/Raça</p>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2"><input type="radio" name="raca" /> Amarelo(a)</label>
                    <label className="flex items-center gap-2"><input type="radio" name="raca" /> Branco(a)</label>
                    <label className="flex items-center gap-2"><input type="radio" name="raca" /> Indígena</label>
                    <label className="flex items-center gap-2"><input type="radio" name="raca" /> Pardo(a)</label>
                    <label className="flex items-center gap-2"><input type="radio" name="raca" /> Preto(a)</label>
                  </div>
                </div>
                <div>
                  <p className="font-bold mb-2">Pessoa com Deficiência</p>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2"><input type="checkbox" /> Auditiva</label>
                    <label className="flex items-center gap-2"><input type="checkbox" /> Visual</label>
                    <label className="flex items-center gap-2"><input type="checkbox" /> Motora</label>
                    <label className="flex items-center gap-2"><input type="checkbox" /> Intelectual</label>
                  </div>
                </div>
              </div>
            </fieldset>

            <fieldset className="border p-4 rounded">
              <legend className="font-bold px-2 text-gray-700">Dados da Concedente</legend>
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3"><label className="block font-semibold">Razão Social</label><input type="text" className="w-full border p-1 rounded" /></div>
                <div className="col-span-1"><label className="block font-semibold">CNPJ</label><input type="text" className="w-full border p-1 rounded" /></div>
                <div className="col-span-4"><label className="block font-semibold">Endereço Completo</label><input type="text" className="w-full border p-1 rounded" /></div>
                <div className="col-span-4 border-t pt-2 mt-2">
                  <p className="font-bold text-green-600 mb-2">Supervisor do Estágio</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1"><label className="block font-semibold">Nome</label><input type="text" className="w-full border p-1 rounded" /></div>
                    <div className="col-span-1"><label className="block font-semibold">Cargo</label><input type="text" className="w-full border p-1 rounded" /></div>
                    <div className="col-span-1"><label className="block font-semibold">Telefone</label><input type="text" className="w-full border p-1 rounded" /></div>
                  </div>
                </div>
              </div>
            </fieldset>

            <fieldset className="border p-4 rounded">
              <legend className="font-bold px-2 text-gray-700">Detalhes do Estágio</legend>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div><label className="block font-semibold">Data Inicial</label><input type="date" className="w-full border p-1 rounded" /></div>
                <div><label className="block font-semibold">Data Final</label><input type="date" className="w-full border p-1 rounded" /></div>
                <div><label className="block font-semibold">Carga Horária Semanal</label><input type="number" className="w-full border p-1 rounded" /></div>
              </div>
              
              <label className="block font-bold mb-2 text-center bg-gray-200 p-1">Quadro de Horários</label>
              <table className="w-full border text-center text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-1">Turno</th>
                    <th className="border p-1">Seg</th>
                    <th className="border p-1">Ter</th>
                    <th className="border p-1">Qua</th>
                    <th className="border p-1">Qui</th>
                    <th className="border p-1">Sex</th>
                    <th className="border p-1">Sáb</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-bold border">Manhã</td>
                    <td className="border"><input type="text" className="w-full text-center" placeholder="00:00" /></td>
                    <td className="border"><input type="text" className="w-full text-center" placeholder="00:00" /></td>
                    <td className="border"><input type="text" className="w-full text-center" placeholder="00:00" /></td>
                    <td className="border"><input type="text" className="w-full text-center" placeholder="00:00" /></td>
                    <td className="border"><input type="text" className="w-full text-center" placeholder="00:00" /></td>
                    <td className="border"><input type="text" className="w-full text-center" placeholder="00:00" /></td>
                  </tr>
                  <tr>
                    <td className="font-bold border">Tarde</td>
                    <td className="border"><input type="text" className="w-full text-center" placeholder="00:00" /></td>
                    <td className="border"><input type="text" className="w-full text-center" placeholder="00:00" /></td>
                    <td className="border"><input type="text" className="w-full text-center" placeholder="00:00" /></td>
                    <td className="border"><input type="text" className="w-full text-center" placeholder="00:00" /></td>
                    <td className="border"><input type="text" className="w-full text-center" placeholder="00:00" /></td>
                    <td className="border"><input type="text" className="w-full text-center" placeholder="00:00" /></td>
                  </tr>
                </tbody>
              </table>
            </fieldset>

            <div className="flex justify-between pt-12 px-8 text-center">
              <div className="border-t border-black w-1/3 pt-2">Assinatura do Discente</div>
              <div className="border-t border-black w-1/3 pt-2">Assinatura do Orientador</div>
            </div>

            <div className="flex gap-4 pt-6">
              <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold">
                Salvar Rascunho
              </button>
              <button type="button" onClick={() => window.print()} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold">
                Imprimir
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
