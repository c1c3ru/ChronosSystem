'use client'

import React, { useState } from 'react'
import { FormPDFExport } from '@/components/FormPDFExport'
import {
  OfficialFormTemplate,
  FormTable,
  FormField,
  FormHeaderCell,
  FormDataCell,
  FormInput,
  FormTextarea,
  SignatureSection,
} from '@/components/OfficialFormTemplate'

interface InternshipRegistrationFormProps {
  userId?: string
  userName?: string
  userEmail?: string
}

export function InternshipRegistrationForm({
  userId,
  userName = '',
  userEmail = '',
}: InternshipRegistrationFormProps) {
  const [formData, setFormData] = useState({
    studentName: userName,
    socialName: '',
    course: '',
    registration: '',
    address: '',
    neighborhood: '',
    cityState: '',
    zipCode: '',
    phone: '',
    email: userEmail,
    personalEmail: '',
    race: '',
    ethnicity: '',
    deficiency: '',
    deficiencyType: '',
    companyName: '',
    companyFantasyName: '',
    companyCNPJ: '',
    companyAddress: '',
    companyNeighborhood: '',
    companyCityState: '',
    companyZipCode: '',
    companyPhone: '',
    companyEmail: '',
    companyRepresentative: '',
    companyRepresentativeRole: '',
    companyRepresentativeCPF: '',
    companyRepresentativePhone: '',
    supervisorName: '',
    supervisorRole: '',
    supervisorCPF: '',
    supervisorPhone: '',
    sector: '',
    internshipType: 'obrigatorio',
    modality: 'presencial',
    startDate: '',
    weeklyHours: '',
    endDate: '',
    schedule: Array(3).fill(Array(7).fill({ start: '', end: '' })), // 3 turnos x 7 dias
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="w-full max-w-[210mm] mx-auto bg-white">
      <div className="mb-4 flex justify-end no-print">
        <FormPDFExport
          formId="internship-registration-form"
          fileName="solicitacao-cadastro-estagio"
        />
      </div>

      <OfficialFormTemplate
        formId="internship-registration-form"
        title="SOLICITAÇÃO DE CADASTRO NO ESTÁGIO"
        campus="Maracanaú"
        sector="Setor de Acompanhamento de Estágio"
      >
        <FormTable>
          <tbody>
            <tr>
              <FormField label="NOME" colSpan={3}>
                <FormInput
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                />
              </FormField>
              <FormField label="CPF">
                <FormInput type="text" name="cpf" placeholder="" />
              </FormField>
            </tr>
            <tr>
              <FormField label="NOME SOCIAL" colSpan={4}>
                <FormInput
                  type="text"
                  name="socialName"
                  value={formData.socialName}
                  onChange={handleChange}
                />
              </FormField>
            </tr>
            <tr>
              <FormField label="CURSO" colSpan={3}>
                <FormInput
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                />
              </FormField>
              <FormField label="MATRÍCULA">
                <FormInput
                  type="text"
                  name="registration"
                  value={formData.registration}
                  onChange={handleChange}
                />
              </FormField>
            </tr>
            <tr>
              <FormField label="ENDEREÇO (LOGRADOURO, NÚMERO E COMPLEMENTO)" colSpan={3}>
                <FormInput
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </FormField>
              <FormField label="BAIRRO/DISTRITO">
                <FormInput
                  type="text"
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleChange}
                />
              </FormField>
            </tr>
            <tr>
              <FormField label="MUNICÍPIO-UF" colSpan={2}>
                <FormInput
                  type="text"
                  name="cityState"
                  value={formData.cityState}
                  onChange={handleChange}
                />
              </FormField>
              <FormField label="CEP">
                <FormInput
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                />
              </FormField>
              <FormField label="DDD + TELEFONE">
                <FormInput
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </FormField>
            </tr>
            <tr>
              <FormField label="E-MAIL INSTITUCIONAL" colSpan={2}>
                <FormInput
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </FormField>
              <FormField label="E-MAIL PESSOAL" colSpan={2}>
                <FormInput
                  type="email"
                  name="personalEmail"
                  value={formData.personalEmail}
                  onChange={handleChange}
                />
              </FormField>
            </tr>
          </tbody>
        </FormTable>

        {/* Seção Cor/Raça e Deficiência */}
        <div className="mt-2 mb-1">
          <div className="grid grid-cols-3 gap-0 border border-black">
            <div className="bg-gray-200 px-1 py-1 text-center border-r border-black">
              <div className="text-[8pt] font-bold uppercase">COR/RAÇA</div>
            </div>
            <div className="bg-gray-200 px-1 py-1 text-center border-r border-black">
              <div className="text-[8pt] font-bold uppercase">ETNIA</div>
            </div>
            <div className="bg-gray-200 px-1 py-1 text-center">
              <div className="text-[8pt] font-bold uppercase">
                APENAS PARA PESSOA COM DEFICIÊNCIA E/OU AH/SD
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-0 border border-black border-t-0">
            <div className="px-1 py-1 border-r border-black">
              <div className="space-y-0 text-[7pt]">
                {[
                  'Amarelo(a)',
                  'Branco(a)',
                  'Indígena',
                  'Pardo(a)',
                  'Preto(a)',
                  'Prefiro não declarar',
                ].map((opt) => (
                  <label key={opt} className="flex items-center gap-1 leading-tight">
                    <input
                      type="radio"
                      name="race"
                      value={opt}
                      className="h-2.5 w-2.5 flex-shrink-0"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="px-1 py-1 border-r border-black">
              <div className="space-y-0 text-[7pt]">
                {['Indígena', 'Quilombola', 'Outra', 'Prefiro não declarar'].map((opt) => (
                  <label key={opt} className="flex items-center gap-1 leading-tight">
                    <input
                      type="radio"
                      name="ethnicity"
                      value={opt}
                      className="h-2.5 w-2.5 flex-shrink-0"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
                <div className="mt-1 pt-1 border-t border-black">
                  <div className="text-[7pt] mb-0.5">Informar comunidade se marcar etnia:</div>
                  <FormInput className="border-b border-black w-full rounded-none px-0.5 py-0 h-5 text-[8pt]" />
                </div>
              </div>
            </div>
            <div className="px-1 py-1">
              <div className="space-y-0 text-[7pt]">
                {[
                  'Alta habilidade/superdotação',
                  'Deficiência auditiva',
                  'Deficiência intelectual',
                  'Deficiência motora',
                  'Deficiência visual/baixa visão',
                  'Deficiência visual',
                  'Surdocegueira',
                ].map((opt) => (
                  <label key={opt} className="flex items-center gap-1 leading-tight">
                    <input
                      type="checkbox"
                      name="deficiencyType"
                      value={opt}
                      className="h-2.5 w-2.5 flex-shrink-0"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <FormTable className="mt-0 border-t-0">
          <tbody>
            <tr>
              <FormField label="RAZÃO SOCIAL" colSpan={4}>
                <FormInput
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                />
              </FormField>
            </tr>
            <tr>
              <FormField label="NOME DE FANTASIA OU DE PESSOA FÍSICA" colSpan={4}>
                <FormInput
                  type="text"
                  name="companyFantasyName"
                  value={formData.companyFantasyName}
                  onChange={handleChange}
                />
              </FormField>
            </tr>
            <tr>
              <FormField label="CNPJ OU REGISTRO NO CONSELHO">
                <FormInput
                  type="text"
                  name="companyCNPJ"
                  value={formData.companyCNPJ}
                  onChange={handleChange}
                />
              </FormField>
              <FormField label="ENDEREÇO (LOGRADOURO, NÚMERO E COMPLEMENTO)" colSpan={3}>
                <FormInput
                  type="text"
                  name="companyAddress"
                  value={formData.companyAddress}
                  onChange={handleChange}
                />
              </FormField>
            </tr>
            <tr>
              <FormField label="BAIRRO" colSpan={2}>
                <FormInput
                  type="text"
                  name="companyNeighborhood"
                  value={formData.companyNeighborhood}
                  onChange={handleChange}
                />
              </FormField>
              <FormField label="MUNICÍPIO-UF">
                <FormInput
                  type="text"
                  name="companyCityState"
                  value={formData.companyCityState}
                  onChange={handleChange}
                />
              </FormField>
              <FormField label="CEP">
                <FormInput
                  type="text"
                  name="companyZipCode"
                  value={formData.companyZipCode}
                  onChange={handleChange}
                />
              </FormField>
            </tr>
            <tr>
              <FormField label="DDD + TELEFONE" colSpan={2}>
                <FormInput
                  type="text"
                  name="companyPhone"
                  value={formData.companyPhone}
                  onChange={handleChange}
                />
              </FormField>
              <FormField label="E-MAIL" colSpan={2}>
                <FormInput
                  type="email"
                  name="companyEmail"
                  value={formData.companyEmail}
                  onChange={handleChange}
                />
              </FormField>
            </tr>
            <tr>
              <FormField label="RESPONSÁVEL LEGAL PELA INSTITUIÇÃO PARA ESTE FIM" colSpan={4}>
                <FormInput
                  type="text"
                  name="companyRepresentative"
                  value={formData.companyRepresentative}
                  onChange={handleChange}
                />
              </FormField>
            </tr>
            <tr>
              <FormField label="CARGO/QUALIFICAÇÃO" colSpan={2}>
                <FormInput
                  type="text"
                  name="companyRepresentativeRole"
                  value={formData.companyRepresentativeRole}
                  onChange={handleChange}
                />
              </FormField>
              <FormField label="CPF">
                <FormInput
                  type="text"
                  name="companyRepresentativeCPF"
                  value={formData.companyRepresentativeCPF}
                  onChange={handleChange}
                />
              </FormField>
              <FormField label="DDD + TELEFONE">
                <FormInput
                  type="text"
                  name="companyRepresentativePhone"
                  value={formData.companyRepresentativePhone}
                  onChange={handleChange}
                />
              </FormField>
            </tr>
            <tr>
              <FormField
                label="SUPERVISOR DO ESTÁGIO NA INSTITUIÇÃO CONCEDENTE DA VAGA DE ESTÁGIO"
                colSpan={4}
              >
                <FormInput
                  type="text"
                  name="supervisorName"
                  value={formData.supervisorName}
                  onChange={handleChange}
                />
              </FormField>
            </tr>
            <tr>
              <FormField label="CARGO/QUALIFICAÇÃO" colSpan={2}>
                <FormInput
                  type="text"
                  name="supervisorRole"
                  value={formData.supervisorRole}
                  onChange={handleChange}
                />
              </FormField>
              <FormField label="CPF">
                <FormInput
                  type="text"
                  name="supervisorCPF"
                  value={formData.supervisorCPF}
                  onChange={handleChange}
                />
              </FormField>
              <FormField label="DDD + TELEFONE">
                <FormInput
                  type="text"
                  name="supervisorPhone"
                  value={formData.supervisorPhone}
                  onChange={handleChange}
                />
              </FormField>
            </tr>
            <tr>
              <FormField label="SETOR DE REALIZAÇÃO DO ESTÁGIO" colSpan={4}>
                <FormInput
                  type="text"
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                />
              </FormField>
            </tr>
          </tbody>
        </FormTable>

        {/* Dados do Estágio */}
        <div className="mt-2 mb-1">
          <div className="grid grid-cols-5 gap-0 border border-black">
            <div className="bg-gray-200 px-1 py-1 text-center border-r border-black">
              <div className="text-[8pt] font-bold uppercase">TIPO DE ESTÁGIO</div>
            </div>
            <div className="bg-gray-200 px-1 py-1 text-center border-r border-black">
              <div className="text-[8pt] font-bold uppercase">FORMA DE ESTÁGIO</div>
            </div>
            <div className="bg-gray-200 px-1 py-1 text-center border-r border-black">
              <div className="text-[8pt] font-bold uppercase">DATA INICIAL</div>
            </div>
            <div className="bg-gray-200 px-1 py-1 text-center border-r border-black">
              <div className="text-[8pt] font-bold uppercase">CARGA HORÁRIA SEMANAL</div>
            </div>
            <div className="bg-gray-200 px-1 py-1 text-center">
              <div className="text-[8pt] font-bold uppercase">DATA FINAL PREVISTA</div>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-0 border border-black border-t-0">
            <div className="px-1 py-1.5 border-r border-black">
              <div className="flex flex-col text-[7pt] gap-0.5">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="internshipType"
                    value="obrigatorio"
                    checked={formData.internshipType === 'obrigatorio'}
                    onChange={handleChange}
                    className="h-2.5 w-2.5 flex-shrink-0"
                  />
                  <span>OBRIGATÓRIO</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="internshipType"
                    value="nao-obrigatorio"
                    checked={formData.internshipType === 'nao-obrigatorio'}
                    onChange={handleChange}
                    className="h-2.5 w-2.5 flex-shrink-0"
                  />
                  <span>NÃO OBRIGATÓRIO</span>
                </label>
              </div>
            </div>
            <div className="px-1 py-1.5 border-r border-black">
              <div className="flex flex-col text-[7pt] gap-0.5">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="modality"
                    value="presencial"
                    checked={formData.modality === 'presencial'}
                    onChange={handleChange}
                    className="h-2.5 w-2.5 flex-shrink-0"
                  />
                  <span>PRESENCIAL</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="modality"
                    value="remoto"
                    checked={formData.modality === 'remoto'}
                    onChange={handleChange}
                    className="h-2.5 w-2.5 flex-shrink-0"
                  />
                  <span>REMOTO</span>
                </label>
              </div>
            </div>
            <div className="px-1 py-1.5 border-r border-black text-center">
              <FormInput
                type="text"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="text-center rounded-none px-1 py-0 h-6 text-[8pt]"
                placeholder="__/__/____"
              />
            </div>
            <div className="px-1 py-1.5 border-r border-black">
              <div className="flex items-center justify-center gap-1">
                <FormInput
                  type="text"
                  name="weeklyHours"
                  value={formData.weeklyHours}
                  onChange={handleChange}
                  className="w-10 text-center rounded-none border-b border-black px-1 py-0 h-6 text-[8pt]"
                />
                <span className="text-[7pt]">HORAS</span>
              </div>
            </div>
            <div className="px-1 py-1.5 text-center">
              <FormInput
                type="text"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="text-center rounded-none px-1 py-0 h-6 text-[8pt]"
                placeholder="__/__/____"
              />
            </div>
          </div>
        </div>

        {/* Grade de Horários */}
        <div className="mt-2 mb-1">
          <div className="border border-black">
            {/* Cabeçalho principal */}
            <div className="grid grid-cols-[30px_1fr] border-b border-black">
              <div className="bg-gray-200 px-0.5 py-1 text-center border-r border-black">
                <span className="text-[7pt] font-bold vertical-text">TURNO</span>
              </div>
              <div className="bg-gray-300 px-1 py-1 text-center">
                <div className="text-[8pt] font-bold uppercase">
                  PREVISÃO DE DISTRIBUIÇÃO DA CARGA HORÁRIA
                </div>
              </div>
            </div>

            {/* Dias da semana - linha 1 */}
            <div className="grid grid-cols-[30px_repeat(7,1fr)] border-b border-black">
              <div className="bg-gray-200"></div>
              {[
                'SEGUNDA-FEIRA',
                'TERÇA-FEIRA',
                'QUARTA-FEIRA',
                'QUINTA-FEIRA',
                'SEXTA-FEIRA',
                'SÁBADO',
                'DOMINGO',
              ].map((dia, i) => (
                <div
                  key={i}
                  className={`bg-gray-200 px-0.5 py-0.5 text-center text-[6pt] font-bold uppercase ${i < 6 ? 'border-r border-black' : ''}`}
                >
                  {dia}
                </div>
              ))}
            </div>

            {/* Início/Final - linha 2 */}
            <div className="grid grid-cols-[30px_repeat(14,1fr)] border-b border-black">
              <div className="bg-gray-200"></div>
              {Array(7)
                .fill(null)
                .map((_, i) => (
                  <React.Fragment key={i}>
                    <div className="bg-gray-200 px-0.5 py-0.5 text-center text-[6pt] font-bold border-r border-black">
                      INÍCIO
                    </div>
                    <div
                      className={`bg-gray-200 px-0.5 py-0.5 text-center text-[6pt] font-bold ${i < 6 ? 'border-r border-black' : ''}`}
                    >
                      FINAL
                    </div>
                  </React.Fragment>
                ))}
            </div>

            {/* Linhas de turnos */}
            {[1, 2, 3].map((turno, idx) => (
              <div
                key={turno}
                className={`grid grid-cols-[30px_repeat(14,1fr)] ${idx < 2 ? 'border-b border-black' : ''}`}
              >
                <div className="px-0.5 py-1 text-center font-bold text-[7pt] border-r border-black flex items-center justify-center">
                  {turno}º
                </div>
                {Array(14)
                  .fill(null)
                  .map((_, i) => (
                    <div key={i} className={`h-5 ${i < 13 ? 'border-r border-black' : ''}`}>
                      <FormInput className="text-center h-full w-full rounded-none border-0 px-0.5 py-0 text-[7pt]" />
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>

        {/* Assinaturas e Rodapé */}
        <div className="mt-2 border border-black">
          <div className="grid grid-cols-2 divide-x divide-black">
            <div className="px-2 py-2">
              <div className="flex items-end gap-2 mb-6">
                <span className="text-[8pt] font-bold">SOLICITAÇÃO EM</span>
                <span className="border-b border-black flex-1 text-center text-[8pt]">
                  ___/___/______
                </span>
              </div>
              <div className="border-t border-black pt-1 mt-8 text-center text-[7pt] font-bold uppercase">
                ASSINATURA DO DISCENTE
              </div>
            </div>
            <div className="px-2 py-2">
              <div className="flex items-end gap-2 mb-6">
                <span className="text-[8pt] font-bold">AUTORIZAÇÃO EM</span>
                <span className="border-b border-black flex-1 text-center text-[8pt]">
                  ___/___/______
                </span>
              </div>
              <div className="border-t border-black pt-1 mt-8 text-center text-[7pt] font-bold uppercase">
                ASSINATURA DO DOCENTE ORIENTADOR
              </div>
            </div>
          </div>
        </div>
      </OfficialFormTemplate>
    </div>
  )
}
