'use client'

import { useRef } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { FormHeader } from '@/components/FormHeader'
import { FormPDFExport } from '@/components/FormPDFExport'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function CommitmentTermPage() {
  const formRef = useRef<HTMLDivElement>(null)
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/employee" className="flex items-center text-secondary-500 hover:text-secondary-600 mb-6 text-sm font-medium">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Link>

        <div id="commitment-term-form" ref={formRef} className="bg-card p-8 shadow-lg border-t-4 border-primary-500 rounded-lg text-sm text-foreground">

      <FormHeader 
        title="TERMO DE COMPROMISSO DE ESTÁGIO"
        showImages={true}
      />

          <p className="mb-4 text-sm text-foreground">
            Nos termos da Lei nº 11.788, de 25/09/2008, celebram entre si este Termo:
          </p>

          <div className="space-y-4 mb-6 border border-gray-300 p-4 rounded-lg bg-background">
            <div className="text-sm text-foreground">
              <span className="font-bold text-gray-900">INSTITUIÇÃO DE ENSINO:</span> IFCE Campus Maracanaú<br />
              <span className="font-bold text-gray-900">CNPJ:</span> 10.744.098/0009-00
            </div>
            <div className="border-t border-gray-300 pt-3">
              <span className="font-bold text-gray-900 text-sm">CONCEDENTE (EMPRESA):</span> <input type="text" className="text-sm border-b border-black w-2/3 px-1 bg-transparent focus:outline-none" placeholder="Razão Social" /><br />
              <span className="font-bold text-gray-900 text-sm">ENDEREÇO:</span> <input type="text" className="text-sm border-b border-black w-full px-1 bg-transparent focus:outline-none" /><br />
              <span className="font-bold text-gray-900 text-sm">REPRESENTANTE LEGAL:</span> <input type="text" className="text-sm border-b border-black w-1/2 px-1 bg-transparent focus:outline-none" />
            </div>
            <div className="border-t border-gray-300 pt-3">
              <span className="font-bold text-gray-900 text-sm">ESTAGIÁRIO(A):</span> <input type="text" className="text-sm border-b border-black w-2/3 px-1 bg-transparent focus:outline-none" /><br />
              <span className="font-bold text-gray-900 text-sm">CPF:</span> <input type="text" className="text-sm border-b border-black w-1/3 px-1 bg-transparent focus:outline-none" />
              <span className="font-bold text-gray-900 text-sm">CURSO:</span> <input type="text" className="text-sm border-b border-black w-1/3 px-1 bg-transparent focus:outline-none" />
            </div>
          </div>

          <h2 className="text-base font-bold text-gray-900 uppercase mt-6 mb-3">Cláusula Primeira – Do Objeto e Vigência</h2>
          <p className="text-sm text-foreground mb-4">
            O estágio será <strong>OBRIGATÓRIO</strong>, realizado de forma <input type="text" className="text-sm border-b border-black w-32 text-center bg-transparent focus:outline-none" placeholder="Presencial/Remoto" />.
            Vigência de <input type="date" className="text-sm border-b border-black bg-transparent focus:outline-none" /> a <input type="date" className="text-sm border-b border-black bg-transparent focus:outline-none" />.
          </p>

          <h2 className="text-base font-bold text-gray-900 uppercase mt-6 mb-3">Cláusula Quinta – Do Seguro e Bolsa</h2>
          <p className="text-sm text-foreground">
            Apólice de Seguro Nº <input type="text" className="text-sm border-b border-black w-32 bg-transparent focus:outline-none" /> da Seguradora <input type="text" className="text-sm border-b border-black w-40 bg-transparent focus:outline-none" />.
          </p>
      <p className="mt-2">
        A Concedente pagará mensalmente:
        <br />( ) Bolsa-Auxílio de R$ <input type="text" className="border-b border-black w-24" />
        <br />( ) Não remunerará (Estágio Obrigatório)
        <br />Auxílio-transporte: R$ <input type="text" className="border-b border-black w-24" />
      </p>

      <div className="break-before-page mt-8">
        <h2 className="font-bold text-center uppercase mb-4 border-t pt-4">Plano de Atividades</h2>
        <div className="border border-black p-2 min-h-[150px]">
          <p className="font-bold underline">Atividades a serem desenvolvidas:</p>
          <textarea className="w-full h-32 border-none resize-none focus:ring-0 p-1" placeholder="Descreva as atividades aqui..."></textarea>
        </div>
        <div className="border border-black border-t-0 p-2 min-h-[100px]">
          <p className="font-bold underline">Resultados Esperados:</p>
          <textarea className="w-full h-20 border-none resize-none focus:ring-0 p-1" placeholder="Descreva os resultados..."></textarea>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-10 text-center text-xs font-sans">
        <div className="border-t border-black pt-2">Representante do IFCE</div>
        <div className="border-t border-black pt-2">Representante da Concedente</div>
        <div className="border-t border-black pt-2">Discente Estagiário</div>
        <div className="border-t border-black pt-2">Supervisor do Estágio</div>
      </div>

      <div className="flex gap-4 pt-6 mt-6">
        <Button variant="primary" size="md">
          Salvar Rascunho
        </Button>
        <FormPDFExport
          formId="commitment-term-form"
          fileName="termo-compromisso-estagio"
        />
      </div>
        </div>
      </div>
    </div>
  )
}
