'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { FormHeader } from '@/components/FormHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function InternshipRegistrationPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/employee" className="flex items-center text-blue-600 hover:text-blue-800 mb-6 text-sm font-medium">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Link>

        <div className="bg-white p-8 shadow-lg border-t-4 border-green-600 rounded-lg">
          <FormHeader 
            title="Solicitação de Cadastro no Estágio"
            showImages={true}
          />

          <form className="space-y-4 text-sm text-gray-800">
            <fieldset className="border border-gray-300 p-4 rounded-lg bg-gray-50">
              <legend className="font-bold px-2 text-sm text-gray-700">Dados do Discente</legend>
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3"><label className="block text-sm font-semibold text-gray-700 mb-1">Nome</label><input type="text" className="w-full text-sm border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                <div className="col-span-1"><label className="block text-sm font-semibold text-gray-700 mb-1">CPF</label><input type="text" className="w-full text-sm border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                <div className="col-span-4"><label className="block text-sm font-semibold text-gray-700 mb-1">Nome Social</label><input type="text" className="w-full text-sm border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                <div className="col-span-3"><label className="block text-sm font-semibold text-gray-700 mb-1">Curso</label><input type="text" className="w-full text-sm border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                <div className="col-span-1"><label className="block text-sm font-semibold text-gray-700 mb-1">Matrícula</label><input type="text" className="w-full text-sm border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                <div className="col-span-4"><label className="block text-sm font-semibold text-gray-700 mb-1">Endereço</label><input type="text" className="w-full text-sm border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                <div className="col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-1">Bairro</label><input type="text" className="w-full text-sm border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                <div className="col-span-1"><label className="block text-sm font-semibold text-gray-700 mb-1">Município-UF</label><input type="text" className="w-full text-sm border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                <div className="col-span-1"><label className="block text-sm font-semibold text-gray-700 mb-1">CEP</label><input type="text" className="w-full text-sm border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                <div className="col-span-1"><label className="block text-sm font-semibold text-gray-700 mb-1">Telefone</label><input type="text" className="w-full text-sm border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                <div className="col-span-3"><label className="block text-sm font-semibold text-gray-700 mb-1">E-mail Institucional</label><input type="email" className="w-full text-sm border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
              </div>
            </fieldset>

            <fieldset className="border border-gray-300 p-4 rounded-lg bg-gray-50">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-2">Cor/Raça</p>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm text-gray-800"><input type="radio" name="raca" /> Amarelo(a)</label>
                    <label className="flex items-center gap-2 text-sm text-gray-800"><input type="radio" name="raca" /> Branco(a)</label>
                    <label className="flex items-center gap-2 text-sm text-gray-800"><input type="radio" name="raca" /> Indígena</label>
                    <label className="flex items-center gap-2 text-sm text-gray-800"><input type="radio" name="raca" /> Pardo(a)</label>
                    <label className="flex items-center gap-2 text-sm text-gray-800"><input type="radio" name="raca" /> Preto(a)</label>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-2">Pessoa com Deficiência</p>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm text-gray-800"><input type="checkbox" /> Auditiva</label>
                    <label className="flex items-center gap-2 text-sm text-gray-800"><input type="checkbox" /> Visual</label>
                    <label className="flex items-center gap-2 text-sm text-gray-800"><input type="checkbox" /> Motora</label>
                    <label className="flex items-center gap-2 text-sm text-gray-800"><input type="checkbox" /> Intelectual</label>
                  </div>
                </div>
              </div>
            </fieldset>

            <fieldset className="border border-gray-300 p-4 rounded-lg bg-gray-50">
              <legend className="font-bold px-2 text-sm text-gray-700">Dados da Concedente</legend>
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="col-span-3"><label className="block text-sm font-semibold text-gray-700 mb-1">Razão Social</label><input type="text" className="w-full text-sm border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                <div className="col-span-1"><label className="block text-sm font-semibold text-gray-700 mb-1">CNPJ</label><input type="text" className="w-full text-sm border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                <div className="col-span-4"><label className="block text-sm font-semibold text-gray-700 mb-1">Endereço Completo</label><input type="text" className="w-full text-sm border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                <div className="col-span-4 border-t border-gray-300 pt-4 mt-4">
                  <p className="text-sm font-bold text-green-700 mb-3">Supervisor do Estágio</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1"><label className="block text-sm font-semibold text-gray-700 mb-1">Nome</label><input type="text" className="w-full text-sm border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                    <div className="col-span-1"><label className="block text-sm font-semibold text-gray-700 mb-1">Cargo</label><input type="text" className="w-full text-sm border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                    <div className="col-span-1"><label className="block text-sm font-semibold text-gray-700 mb-1">Telefone</label><input type="text" className="w-full text-sm border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
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

            <div className="flex justify-between pt-12 px-8 text-center mt-8 border-t border-gray-300">
              <div className="border-t border-black w-1/3 pt-2 text-xs text-gray-700">Assinatura do Discente</div>
              <div className="border-t border-black w-1/3 pt-2 text-xs text-gray-700">Assinatura do Orientador</div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button type="submit" variant="primary" size="md" className="flex-1">
                Salvar Rascunho
              </Button>
              <Button type="button" variant="secondary" size="md" onClick={() => window.print()} className="flex-1">
                Imprimir
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
