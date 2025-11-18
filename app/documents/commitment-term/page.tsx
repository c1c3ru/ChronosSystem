'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CommitmentTermPage() {
  return (
    <div className="min-h-screen bg-white p-10 max-w-[210mm] mx-auto text-justify text-sm leading-relaxed font-serif">
      <Link href="/employee" className="flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Link>

      <div className="text-center font-bold font-sans mb-8">
        <p>PRÓ-REITORIA DE EXTENSÃO</p>
        <p>IFCE CAMPUS MARACANAÚ</p>
        <h1 className="text-xl mt-4 underline">TERMO DE COMPROMISSO DE ESTÁGIO</h1>
      </div>

      <p className="mb-4">
        Nos termos da Lei nº 11.788, de 25/09/2008, celebram entre si este Termo:
      </p>

      <div className="space-y-4 mb-6 border p-4">
        <div>
          <span className="font-bold">INSTITUIÇÃO DE ENSINO:</span> IFCE Campus Maracanaú<br />
          <span className="font-bold">CNPJ:</span> 10.744.098/0009-00
        </div>
        <div className="border-t pt-2">
          <span className="font-bold">CONCEDENTE (EMPRESA):</span> <input type="text" className="border-b border-black w-2/3 px-1" placeholder="Razão Social" /><br />
          <span className="font-bold">ENDEREÇO:</span> <input type="text" className="border-b border-black w-full px-1" /><br />
          <span className="font-bold">REPRESENTANTE LEGAL:</span> <input type="text" className="border-b border-black w-1/2 px-1" />
        </div>
        <div className="border-t pt-2">
          <span className="font-bold">ESTAGIÁRIO(A):</span> <input type="text" className="border-b border-black w-2/3 px-1" /><br />
          <span className="font-bold">CPF:</span> <input type="text" className="border-b border-black w-1/3 px-1" />
          <span className="font-bold">CURSO:</span> <input type="text" className="border-b border-black w-1/3 px-1" />
        </div>
      </div>

      <h2 className="font-bold uppercase mt-4">Cláusula Primeira – Do Objeto e Vigência</h2>
      <p>
        O estágio será <strong>OBRIGATÓRIO</strong>, realizado de forma <input type="text" className="border-b border-black w-32 text-center" placeholder="Presencial/Remoto" />.
        Vigência de <input type="date" className="border-b border-black" /> a <input type="date" className="border-b border-black" />.
      </p>

      <h2 className="font-bold uppercase mt-4">Cláusula Quinta – Do Seguro e Bolsa</h2>
      <p>
        Apólice de Seguro Nº <input type="text" className="border-b border-black w-32" /> da Seguradora <input type="text" className="border-b border-black w-40" />.
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
        <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold">
          Salvar Rascunho
        </button>
        <button onClick={() => window.print()} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold">
          Imprimir
        </button>
      </div>
    </div>
  )
}
