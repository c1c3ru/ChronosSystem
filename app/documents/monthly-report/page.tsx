'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { FormHeader }
import { Button }
import { Card } from '@/components/FormHeader'

export default function MonthlyReportPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/employee" className="flex items-center text-secondary-500 hover:text-secondary-600 mb-6 text-sm font-medium">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Link>

        <div className="bg-card p-8 shadow-lg border-t-4 border-primary-500 rounded-lg text-sm text-foreground">
        <FormHeader 
          title="Relatório Mensal de Atividades"
          showImages={true}
        />

        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="col-span-2">
              <label className="block text-gray-700 font-bold">Estagiário(a)</label>
              <input type="text" className="w-full border border-gray-300 p-2 rounded focus:border-red-600 outline-none" />
            </div>
            <div>
              <label className="block text-gray-700 font-bold">Supervisor</label>
              <input type="text" className="w-full border border-gray-300 p-2 rounded focus:border-red-600 outline-none" />
            </div>
            <div>
              <label className="block text-gray-700 font-bold">Orientador</label>
              <input type="text" className="w-full border border-gray-300 p-2 rounded focus:border-red-600 outline-none" />
            </div>
          </div>

          <div className="bg-background p-4 rounded border border-gray-200 grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="font-bold mb-2 text-gray-700">Período</p>
              <div className="flex gap-2">
                <input type="date" className="border p-1 w-full" />
                <span className="self-center">a</span>
                <input type="date" className="border p-1 w-full" />
              </div>
            </div>
            <div>
              <p className="font-bold mb-2 text-gray-700">Carga Horária (Horas)</p>
              <div className="flex gap-2">
                <input type="number" placeholder="No Mês" className="border p-1 w-full" />
                <input type="number" placeholder="Total" className="border p-1 w-full" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Principais Atividades Desenvolvidas</label>
              <textarea className="w-full border border-gray-300 p-2 rounded h-32 focus:ring-1 focus:ring-red-600 outline-none"></textarea>
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Dificuldades Encontradas</label>
              <textarea className="w-full border border-gray-300 p-2 rounded h-20 focus:ring-1 focus:ring-red-600 outline-none"></textarea>
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Soluções Adotadas</label>
              <textarea className="w-full border border-gray-300 p-2 rounded h-20 focus:ring-1 focus:ring-red-600 outline-none"></textarea>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-8 mt-8 text-center text-xs">
            <div>
              <div className="border-t border-black pt-2">Estagiário</div>
              <input type="date" className="mt-1 text-center" />
            </div>
            <div>
              <div className="border-t border-black pt-2">Supervisor</div>
              <input type="date" className="mt-1 text-center" />
            </div>
            <div>
              <div className="border-t border-black pt-2">Orientador</div>
              <input type="date" className="mt-1 text-center" />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <Button variant="primary" size="md">
              Salvar Rascunho
            </Button>
            <button onClick={() => window.print()} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold">
              Imprimir
            </Button>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}
