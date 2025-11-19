'use client'

import { useRef } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { FormHeader } from '@/components/FormHeader'
import { FormPDFExport } from '@/components/FormPDFExport'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function InternshipRegistrationPage() {
  const formRef = useRef<HTMLDivElement>(null)
  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link href="/employee" className="flex items-center text-secondary-400 hover:text-secondary-200 text-sm font-medium">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Link>

        <div
          id="internship-registration-form"
          ref={formRef}
          className="document-page text-sm border-t-4 border-primary-500 space-y-6"
        >
          <FormHeader 
            title="Solicitação de Cadastro no Estágio"
            showImages={true}
          />

          <form className="space-y-6 text-neutral-800">
            <fieldset className="document-section">
              <legend className="document-heading">Dados do Discente</legend>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Nome</label>
                  <input type="text" className="document-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">CPF</label>
                  <input type="text" className="document-input" />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Nome Social</label>
                  <input type="text" className="document-input" />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Curso</label>
                  <input type="text" className="document-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Matrícula</label>
                  <input type="text" className="document-input" />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Endereço</label>
                  <input type="text" className="document-input" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Bairro</label>
                  <input type="text" className="document-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Município/UF</label>
                  <input type="text" className="document-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">CEP</label>
                  <input type="text" className="document-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Telefone</label>
                  <input type="text" className="document-input" />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">E-mail Institucional</label>
                  <input type="email" className="document-input" />
                </div>
              </div>
            </fieldset>

            <fieldset className="document-section">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm font-bold text-neutral-700 mb-2">Cor/Raça</p>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm text-neutral-700"><input type="radio" name="raca" /> Amarelo(a)</label>
                    <label className="flex items-center gap-2 text-sm text-neutral-700"><input type="radio" name="raca" /> Branco(a)</label>
                    <label className="flex items-center gap-2 text-sm text-neutral-700"><input type="radio" name="raca" /> Indígena</label>
                    <label className="flex items-center gap-2 text-sm text-neutral-700"><input type="radio" name="raca" /> Pardo(a)</label>
                    <label className="flex items-center gap-2 text-sm text-neutral-700"><input type="radio" name="raca" /> Preto(a)</label>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-700 mb-2">Pessoa com Deficiência</p>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm text-neutral-700"><input type="checkbox" /> Auditiva</label>
                    <label className="flex items-center gap-2 text-sm text-neutral-700"><input type="checkbox" /> Visual</label>
                    <label className="flex items-center gap-2 text-sm text-neutral-700"><input type="checkbox" /> Motora</label>
                    <label className="flex items-center gap-2 text-sm text-neutral-700"><input type="checkbox" /> Intelectual</label>
                  </div>
                </div>
              </div>
            </fieldset>

            <fieldset className="document-section">
              <legend className="document-heading">Dados da Concedente</legend>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Razão Social</label>
                  <input type="text" className="document-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">CNPJ</label>
                  <input type="text" className="document-input" />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Endereço Completo</label>
                  <input type="text" className="document-input" />
                </div>
                <div className="md:col-span-4 border-t border-neutral-200 pt-4 mt-4">
                  <p className="text-sm font-bold text-neutral-700 mb-3">Supervisor do Estágio</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-500 mb-1">Nome</label>
                      <input type="text" className="document-input" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-500 mb-1">Cargo</label>
                      <input type="text" className="document-input" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-500 mb-1">Telefone</label>
                      <input type="text" className="document-input" />
                    </div>
                  </div>
                </div>
              </div>
            </fieldset>

            <fieldset className="document-section">
              <legend className="document-heading">Detalhes do Estágio</legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Data inicial</label>
                  <input type="date" className="document-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Data final</label>
                  <input type="date" className="document-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Carga horária semanal</label>
                  <input type="number" className="document-input" />
                </div>
              </div>
              
              <label className="block font-bold mb-2 text-center bg-neutral-100 p-1 rounded">Quadro de horários</label>
              <table className="document-table text-center text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-1">Turno</th>
                    <th className="p-1">Seg</th>
                    <th className="p-1">Ter</th>
                    <th className="p-1">Qua</th>
                    <th className="p-1">Qui</th>
                    <th className="p-1">Sex</th>
                    <th className="p-1">Sáb</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-bold">Manhã</td>
                    <td><input type="text" className="w-full text-center document-input" placeholder="00:00" /></td>
                    <td><input type="text" className="w-full text-center document-input" placeholder="00:00" /></td>
                    <td><input type="text" className="w-full text-center document-input" placeholder="00:00" /></td>
                    <td><input type="text" className="w-full text-center document-input" placeholder="00:00" /></td>
                    <td><input type="text" className="w-full text-center document-input" placeholder="00:00" /></td>
                    <td><input type="text" className="w-full text-center document-input" placeholder="00:00" /></td>
                  </tr>
                  <tr>
                    <td className="font-bold">Tarde</td>
                    <td><input type="text" className="w-full text-center document-input" placeholder="00:00" /></td>
                    <td><input type="text" className="w-full text-center document-input" placeholder="00:00" /></td>
                    <td><input type="text" className="w-full text-center document-input" placeholder="00:00" /></td>
                    <td><input type="text" className="w-full text-center document-input" placeholder="00:00" /></td>
                    <td><input type="text" className="w-full text-center document-input" placeholder="00:00" /></td>
                    <td><input type="text" className="w-full text-center document-input" placeholder="00:00" /></td>
                  </tr>
                </tbody>
              </table>
            </fieldset>

            <div className="document-section grid grid-cols-1 md:grid-cols-2 gap-8 text-center text-xs font-semibold text-neutral-600">
              <div className="border-t border-neutral-400 pt-2">Assinatura do Discente</div>
              <div className="border-t border-neutral-400 pt-2">Assinatura do Orientador</div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button type="submit" variant="primary" size="md" className="flex-1 min-w-[160px]">
                Salvar Rascunho
              </Button>
              <FormPDFExport
                formId="internship-registration-form"
                fileName="solicitacao-cadastro-estagio"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
