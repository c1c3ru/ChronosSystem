'use client'

import { useRef, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { FormHeader } from '@/components/FormHeader'
import { FormExportButtons } from '@/components/FormExportButtons'
import { getDraft, populateFormWithData } from '@/lib/form-drafts'

export default function InternshipRegistrationPage() {
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Carrega rascunho salvo
    const loadDraft = async () => {
      const draft = await getDraft('internship-registration')
      if (draft) {
        const form = formRef.current?.querySelector('form') as HTMLFormElement
        if (form) {
          populateFormWithData(form, draft)
        }
      }
    }

    loadDraft()
  }, [])

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link href="/employee" className="flex items-center text-secondary-400 hover:text-secondary-200 text-sm font-medium">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Link>

        <div
          ref={formRef}
          className="document-page text-sm border-t-4 border-primary-500 space-y-6"
        >
          <FormHeader
            title="SOLICITAÇÃO DE CADASTRO NO ESTÁGIO"
            showImages={true}
          />

          <form className="space-y-6 text-neutral-800">
            <fieldset className="document-section">
              <legend className="document-heading">1. Dados do Discente</legend>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Nome</label>
                  <input type="text" name="student_name" className="document-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">CPF</label>
                  <input type="text" name="student_cpf" className="document-input" />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Nome Social</label>
                  <input type="text" name="student_social_name" className="document-input" />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Curso</label>
                  <input type="text" name="student_course" className="document-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Matrícula</label>
                  <input type="text" name="student_id" className="document-input" />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Endereço</label>
                  <input type="text" name="student_address" className="document-input" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Bairro</label>
                  <input type="text" name="student_neighborhood" className="document-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Município/UF</label>
                  <input type="text" name="student_city_state" className="document-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">CEP</label>
                  <input type="text" name="student_zip" className="document-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Telefone</label>
                  <input type="text" name="student_phone" className="document-input" />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">E-mail Institucional</label>
                  <input type="email" name="student_email" className="document-input" />
                </div>
              </div>
            </fieldset>

            <fieldset className="document-section">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm font-bold text-neutral-700 mb-2">Cor/Raça</p>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm text-neutral-700"><input type="radio" name="race" value="amarelo" /> Amarelo(a)</label>
                    <label className="flex items-center gap-2 text-sm text-neutral-700"><input type="radio" name="race" value="branco" /> Branco(a)</label>
                    <label className="flex items-center gap-2 text-sm text-neutral-700"><input type="radio" name="race" value="indigena" /> Indígena</label>
                    <label className="flex items-center gap-2 text-sm text-neutral-700"><input type="radio" name="race" value="pardo" /> Pardo(a)</label>
                    <label className="flex items-center gap-2 text-sm text-neutral-700"><input type="radio" name="race" value="preto" /> Preto(a)</label>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-700 mb-2">Pessoa com Deficiência</p>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm text-neutral-700"><input type="checkbox" name="pcd_auditiva" /> Auditiva</label>
                    <label className="flex items-center gap-2 text-sm text-neutral-700"><input type="checkbox" name="pcd_visual" /> Visual</label>
                    <label className="flex items-center gap-2 text-sm text-neutral-700"><input type="checkbox" name="pcd_motora" /> Motora</label>
                    <label className="flex items-center gap-2 text-sm text-neutral-700"><input type="checkbox" name="pcd_intelectual" /> Intelectual</label>
                  </div>
                </div>
              </div>
            </fieldset>

            <fieldset className="document-section">
              <legend className="document-heading">2. Dados da Concedente</legend>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Razão Social</label>
                  <input type="text" name="company_name" className="document-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">CNPJ</label>
                  <input type="text" name="company_cnpj" className="document-input" />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Endereço Completo</label>
                  <input type="text" name="company_address" className="document-input" />
                </div>
                <div className="md:col-span-4 border-t border-neutral-200 pt-4 mt-4">
                  <p className="text-sm font-bold text-neutral-700 mb-3">Supervisor do Estágio</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-500 mb-1">Nome</label>
                      <input type="text" name="supervisor_name" className="document-input" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-500 mb-1">Cargo</label>
                      <input type="text" name="supervisor_role" className="document-input" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-500 mb-1">Telefone</label>
                      <input type="text" name="supervisor_phone" className="document-input" />
                    </div>
                  </div>
                </div>
              </div>
            </fieldset>

            <fieldset className="document-section">
              <legend className="document-heading">3. Detalhes do Estágio</legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Data inicial</label>
                  <input type="date" name="start_date" className="document-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Data final</label>
                  <input type="date" name="end_date" className="document-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Carga horária semanal</label>
                  <input type="number" name="weekly_hours" className="document-input" />
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
                    <td><input type="text" name="morning_mon" className="w-full text-center document-input" placeholder="00:00" /></td>
                    <td><input type="text" name="morning_tue" className="w-full text-center document-input" placeholder="00:00" /></td>
                    <td><input type="text" name="morning_wed" className="w-full text-center document-input" placeholder="00:00" /></td>
                    <td><input type="text" name="morning_thu" className="w-full text-center document-input" placeholder="00:00" /></td>
                    <td><input type="text" name="morning_fri" className="w-full text-center document-input" placeholder="00:00" /></td>
                    <td><input type="text" name="morning_sat" className="w-full text-center document-input" placeholder="00:00" /></td>
                  </tr>
                  <tr>
                    <td className="font-bold">Tarde</td>
                    <td><input type="text" name="afternoon_mon" className="w-full text-center document-input" placeholder="00:00" /></td>
                    <td><input type="text" name="afternoon_tue" className="w-full text-center document-input" placeholder="00:00" /></td>
                    <td><input type="text" name="afternoon_wed" className="w-full text-center document-input" placeholder="00:00" /></td>
                    <td><input type="text" name="afternoon_thu" className="w-full text-center document-input" placeholder="00:00" /></td>
                    <td><input type="text" name="afternoon_fri" className="w-full text-center document-input" placeholder="00:00" /></td>
                    <td><input type="text" name="afternoon_sat" className="w-full text-center document-input" placeholder="00:00" /></td>
                  </tr>
                </tbody>
              </table>
            </fieldset>

            <div className="document-section grid grid-cols-1 md:grid-cols-2 gap-8 text-center text-xs font-semibold text-neutral-600">
              <div className="border-t border-neutral-400 pt-2">Assinatura do Discente</div>
              <div className="border-t border-neutral-400 pt-2">Assinatura do Orientador</div>
            </div>

            <FormExportButtons formType="internship-registration" formRef={formRef} />
          </form>
        </div>
      </div>
    </div>
  )
}
