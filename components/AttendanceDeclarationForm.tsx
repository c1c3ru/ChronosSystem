'use client'

import React, { useState } from 'react'
import { FormHeader } from '@/components/FormHeader'
import { FormPDFExport } from '@/components/FormPDFExport'

interface AttendanceDeclarationFormProps {
  userId?: string
  userName?: string
  userEmail?: string
}

export function AttendanceDeclarationForm({
  userId,
  userName = 'Nome do Declarante',
  userEmail = 'email@ifce.edu.br'
}: AttendanceDeclarationFormProps) {
  const [formData, setFormData] = useState({
    documentType: 'CPF',
    documentNumber: '',
    course: '',
    registration: '',
    institution: 'INSTITUTO FEDERAL DE EDUCAÇÃO, CIÊNCIA E TECNOLOGIA – IFCE',
    campus: 'MORADA NOVA',
    experienceType: 'EXTENSÃO',
    projectProgram: '',
    activities: '',
    startDate: '',
    weeklyHours: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-white">
      {/* Botão de Exportar PDF */}
      <div className="mb-6 flex justify-end no-print">
        <FormPDFExport
          formId="attendance-declaration-form"
          fileName="declaracao-participacao-extensao"
        />
      </div>

      {/* Formulário */}
      <div id="attendance-declaration-form" className="bg-white">
        {/* Cabeçalho */}
        <FormHeader
          title="DECLARAÇÃO DE PARTICIPAÇÃO EM EXPERIÊNCIA"
          subtitle="DE EXTENSÃO, INICIAÇÃO CIENTÍFICA OU MONITORIA"
          showImages={true}
        />

        {/* Conteúdo do Formulário */}
        <div className="space-y-6">
          {/* Seção 1: Informações do Declarante */}
          <div>
            <table className="w-full border-collapse border border-neutral-900">
              <tbody>
                <tr>
                  <td className="border border-neutral-900 p-3 font-bold text-sm bg-neutral-100">
                    NOME DO DECLARANTE (SERVIDOR/ORIENTADOR/SUPERVISOR) DA BOLSA OU COORDENADOR(A) DO PROJETO/PROGRAMA
                  </td>
                </tr>
                <tr>
                  <td className="border border-neutral-900 p-3">
                    <input
                      type="text"
                      name="declaranteName"
                      placeholder="Digite o nome completo"
                      className="w-full border-0 outline-none text-sm"
                      onChange={handleChange}
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            <table className="w-full border-collapse border border-neutral-900 mt-4">
              <tbody>
                <tr>
                  <td className="border border-neutral-900 p-3 font-bold text-sm bg-neutral-100 w-1/2">
                    DOCUMENTO TIPO
                  </td>
                  <td className="border border-neutral-900 p-3 font-bold text-sm bg-neutral-100 w-1/2">
                    NÚMERO
                  </td>
                </tr>
                <tr>
                  <td className="border border-neutral-900 p-3">
                    <select
                      name="documentType"
                      value={formData.documentType}
                      onChange={handleChange}
                      className="w-full border-0 outline-none text-sm"
                    >
                      <option value="CPF">CPF</option>
                      <option value="RG">RG</option>
                      <option value="CNPJ">CNPJ</option>
                    </select>
                  </td>
                  <td className="border border-neutral-900 p-3">
                    <input
                      type="text"
                      name="documentNumber"
                      placeholder="Número do documento"
                      value={formData.documentNumber}
                      onChange={handleChange}
                      className="w-full border-0 outline-none text-sm"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Seção 2: Informações Acadêmicas */}
          <div>
            <p className="text-sm mb-4">
              Para fins de <span className="font-bold">EQUIPARAÇÃO</span> a atividades de estágio supervisionado obrigatório,
              declaro os fatos a seguir descritos, para que surjam efeitos legais.
            </p>

            <table className="w-full border-collapse border border-neutral-900">
              <tbody>
                <tr>
                  <td className="border border-neutral-900 p-3 font-bold text-sm bg-neutral-100">DISCENTE</td>
                </tr>
                <tr>
                  <td className="border border-neutral-900 p-3">
                    <input
                      type="text"
                      placeholder="Nome do aluno"
                      defaultValue={userName}
                      className="w-full border-0 outline-none text-sm"
                      readOnly
                    />
                  </td>
                </tr>

                <tr>
                  <td className="border border-neutral-900 p-3 font-bold text-sm bg-neutral-100">CURSO</td>
                </tr>
                <tr>
                  <td className="border border-neutral-900 p-3">
                    <input
                      type="text"
                      name="course"
                      placeholder="Nome do curso"
                      value={formData.course}
                      onChange={handleChange}
                      className="w-full border-0 outline-none text-sm"
                    />
                  </td>
                </tr>

                <tr>
                  <td className="border border-neutral-900 p-3 font-bold text-sm bg-neutral-100">MATRÍCULA</td>
                </tr>
                <tr>
                  <td className="border border-neutral-900 p-3">
                    <input
                      type="text"
                      name="registration"
                      placeholder="Número de matrícula"
                      value={formData.registration}
                      onChange={handleChange}
                      className="w-full border-0 outline-none text-sm"
                    />
                  </td>
                </tr>

                <tr>
                  <td className="border border-neutral-900 p-3 font-bold text-sm bg-neutral-100">INSTITUIÇÃO DE ENSINO</td>
                </tr>
                <tr>
                  <td className="border border-neutral-900 p-3">
                    <input
                      type="text"
                      name="institution"
                      value={formData.institution}
                      onChange={handleChange}
                      className="w-full border-0 outline-none text-sm"
                      readOnly
                    />
                  </td>
                </tr>

                <tr>
                  <td className="border border-neutral-900 p-3 font-bold text-sm bg-neutral-100">CAMPUS</td>
                </tr>
                <tr>
                  <td className="border border-neutral-900 p-3">
                    <input
                      type="text"
                      name="campus"
                      value={formData.campus}
                      onChange={handleChange}
                      className="w-full border-0 outline-none text-sm"
                      readOnly
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Seção 3: Tipo de Experiência */}
          <div>
            <table className="w-full border-collapse border border-neutral-900">
              <tbody>
                <tr>
                  <td className="border border-neutral-900 p-3 font-bold text-sm bg-neutral-100">EXPERIÊNCIA</td>
                </tr>
                <tr>
                  <td className="border border-neutral-900 p-3">
                    <div className="flex gap-8">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="experienceType"
                          value="EXTENSÃO"
                          checked={formData.experienceType === 'EXTENSÃO'}
                          onChange={handleChange}
                        />
                        EXTENSÃO
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="experienceType"
                          value="INICIAÇÃO CIENTÍFICA"
                          checked={formData.experienceType === 'INICIAÇÃO CIENTÍFICA'}
                          onChange={handleChange}
                        />
                        INICIAÇÃO CIENTÍFICA
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="experienceType"
                          value="MONITORIA"
                          checked={formData.experienceType === 'MONITORIA'}
                          onChange={handleChange}
                        />
                        MONITORIA
                      </label>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Seção 4: Projeto/Programa */}
          <div>
            <table className="w-full border-collapse border border-neutral-900">
              <tbody>
                <tr>
                  <td className="border border-neutral-900 p-3 font-bold text-sm bg-neutral-100">PROJETO/PROGRAMA</td>
                </tr>
                <tr>
                  <td className="border border-neutral-900 p-3">
                    <input
                      type="text"
                      name="projectProgram"
                      placeholder="Nome do projeto ou programa"
                      value={formData.projectProgram}
                      onChange={handleChange}
                      className="w-full border-0 outline-none text-sm"
                    />
                  </td>
                </tr>

                <tr>
                  <td className="border border-neutral-900 p-3 font-bold text-sm bg-neutral-100">INSTITUIÇÃO</td>
                </tr>
                <tr>
                  <td className="border border-neutral-900 p-3">
                    <input
                      type="text"
                      placeholder="Instituição responsável"
                      className="w-full border-0 outline-none text-sm"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Seção 5: Atividades */}
          <div>
            <table className="w-full border-collapse border border-neutral-900">
              <tbody>
                <tr>
                  <td className="border border-neutral-900 p-3 font-bold text-sm bg-neutral-100">
                    ATIVIDADES DESENVOLVIDAS PELO(A) DISCENTE
                  </td>
                </tr>
                <tr>
                  <td className="border border-neutral-900 p-3 min-h-[100px]">
                    <textarea
                      name="activities"
                      placeholder="Descreva as atividades desenvolvidas"
                      value={formData.activities}
                      onChange={handleChange}
                      className="w-full border-0 outline-none text-sm resize-none"
                      rows={4}
                    />
                  </td>
                </tr>

                <tr>
                  <td className="border border-neutral-900 p-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="font-bold text-sm">INÍCIO:</label>
                        <input
                          type="date"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleChange}
                          className="w-full border-0 outline-none text-sm mt-1"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-sm">CARGA HORÁRIA SEMANAL: ___ horas</label>
                        <input
                          type="number"
                          name="weeklyHours"
                          placeholder="Horas"
                          value={formData.weeklyHours}
                          onChange={handleChange}
                          className="w-full border-0 outline-none text-sm mt-1"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Seção 6: Assinatura */}
          <div className="mt-8 space-y-4">
            <p className="text-sm">
              Fortaleza-CE, ____ de _____________ de 20___
            </p>

            <div className="border-t border-neutral-900 pt-4">
              <p className="text-sm font-bold text-center">
                ASSINATURA DO (A) DECLARANTE
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
