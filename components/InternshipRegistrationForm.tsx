'use client'

import React, { useState } from 'react'
import { FormPDFExport } from '@/components/FormPDFExport'
import {
  OfficialFormTemplate,
  FormTable,
  FormField,
  FormInput,
} from '@/components/OfficialFormTemplate'

interface InternshipRegistrationFormProps {
  userId?: string
  userName?: string
  userEmail?: string
}

type ScheduleSlot = { start: string; end: string }

const raceOptions = [
  'Amarelo(a)',
  'Branco(a)',
  'Indígena',
  'Pardo(a)',
  'Preto(a)',
  'Prefiro não declarar',
]

const ethnicityOptions = ['Indígena', 'Quilombola', 'Outra', 'Prefiro não declarar']

const deficiencyOptions = [
  'Alta habilidade/superdotação',
  'Deficiência auditiva',
  'Deficiência intelectual',
  'Deficiência motora',
  'Deficiência visual/baixa visão',
  'Deficiência visual',
  'Surdocegueira',
]

const weekdays = [
  'SEGUNDA-FEIRA',
  'TERÇA-FEIRA',
  'QUARTA-FEIRA',
  'QUINTA-FEIRA',
  'SEXTA-FEIRA',
  'SÁBADO',
  'DOMINGO',
]

const createSchedule = (): ScheduleSlot[][] =>
  Array.from({ length: 3 }, () =>
    Array.from({ length: 7 }, () => ({
      start: '',
      end: '',
    }))
  )

export function InternshipRegistrationForm({
  userId,
  userName = '',
  userEmail = '',
}: InternshipRegistrationFormProps) {
  const [formData, setFormData] = useState({
    userId,
    studentName: userName,
    cpf: '',
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
    ethnicityCommunity: '',
    deficiencyType: [] as string[],
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
    schedule: createSchedule(),
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxGroup = (field: 'deficiencyType', value: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked ? [...prev[field], value] : prev[field].filter((item) => item !== value),
    }))
  }

  const handleScheduleChange = (
    rowIndex: number,
    dayIndex: number,
    field: keyof ScheduleSlot,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      schedule: prev.schedule.map((row, rIdx) =>
        rIdx === rowIndex
          ? row.map((slot, dIdx) => (dIdx === dayIndex ? { ...slot, [field]: value } : slot))
          : row
      ),
    }))
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
                <FormInput type="text" name="cpf" value={formData.cpf} onChange={handleChange} />
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

        <div className="mb-1 border border-black">
          <div className="grid grid-cols-3 border-b border-black text-[6.5pt] uppercase text-center leading-tight">
            <div className="py-0.5 border-r border-black font-bold">COR/RAÇA</div>
            <div className="py-0.5 border-r border-black font-bold">ETNIA</div>
            <div className="py-0.5 font-bold">APENAS PARA PESSOA COM DEFICIÊNCIA E/OU AH/SD</div>
          </div>

          <div className="grid grid-cols-3 text-[6.5pt] leading-tight">
            <div className="p-1 border-r border-black space-y-0.5">
              {raceOptions.map((option) => (
                <label key={option} className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="race"
                    value={option}
                    checked={formData.race === option}
                    onChange={handleChange}
                    className="h-2.5 w-2.5 flex-shrink-0"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>

            <div className="p-1 border-r border-black space-y-0.5">
              {ethnicityOptions.map((option) => (
                <label key={option} className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="ethnicity"
                    value={option}
                    checked={formData.ethnicity === option}
                    onChange={handleChange}
                    className="h-2.5 w-2.5 flex-shrink-0"
                  />
                  <span>{option}</span>
                </label>
              ))}
              <div className="pt-0.5">
                <div>Informar comunidade se marcar etnia:</div>
                <FormInput
                  type="text"
                  name="ethnicityCommunity"
                  value={formData.ethnicityCommunity}
                  onChange={handleChange}
                  className="border-b border-black h-4"
                />
              </div>
            </div>

            <div className="p-1 space-y-0.5">
              {deficiencyOptions.map((option) => (
                <label key={option} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    name="deficiencyType"
                    value={option}
                    checked={formData.deficiencyType.includes(option)}
                    onChange={(e) =>
                      handleCheckboxGroup('deficiencyType', option, e.target.checked)
                    }
                    className="h-2.5 w-2.5 flex-shrink-0"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <FormTable className="border-t-0">
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

        <div className="mb-1 border border-black">
          <div className="grid grid-cols-5 border-b border-black text-[6.5pt] uppercase text-center leading-tight font-bold">
            <div className="py-0.5 border-r border-black">TIPO DE ESTÁGIO</div>
            <div className="py-0.5 border-r border-black">FORMA DE ESTÁGIO</div>
            <div className="py-0.5 border-r border-black">DATA INICIAL</div>
            <div className="py-0.5 border-r border-black">CARGA HORÁRIA SEMANAL</div>
            <div className="py-0.5">DATA FINAL PREVISTA</div>
          </div>

          <div className="grid grid-cols-5 text-[6.5pt] leading-tight min-h-[34px]">
            <div className="p-1 border-r border-black space-y-0.5">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="internshipType"
                  value="obrigatorio"
                  checked={formData.internshipType === 'obrigatorio'}
                  onChange={handleChange}
                  className="h-2.5 w-2.5"
                />
                <span>OBRIGATÓRIO</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="internshipType"
                  value="nao-obrigatorio"
                  checked={formData.internshipType === 'nao-obrigatorio'}
                  onChange={handleChange}
                  className="h-2.5 w-2.5"
                />
                <span>NÃO OBRIGATÓRIO</span>
              </label>
            </div>

            <div className="p-1 border-r border-black space-y-0.5 text-[6.5pt]">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="modality"
                  value="presencial"
                  checked={formData.modality === 'presencial'}
                  onChange={handleChange}
                  className="h-2.5 w-2.5"
                />
                <span>PRESENCIAL</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="modality"
                  value="remoto"
                  checked={formData.modality === 'remoto'}
                  onChange={handleChange}
                  className="h-2.5 w-2.5"
                />
                <span>REMOTO</span>
              </label>
            </div>

            <div className="px-1 py-1 border-r border-black flex items-center justify-center">
              <FormInput
                type="text"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="text-center tracking-wide"
                placeholder="__/__/____"
              />
            </div>

            <div className="px-1 py-1 border-r border-black flex items-center justify-center gap-1">
              <FormInput
                type="text"
                name="weeklyHours"
                value={formData.weeklyHours}
                onChange={handleChange}
                className="w-10 text-center border-b border-black"
              />
              <span className="font-bold">HORAS</span>
            </div>

            <div className="px-1 py-1 flex items-center justify-center">
              <FormInput
                type="text"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="text-center tracking-wide"
                placeholder="__/__/____"
              />
            </div>
          </div>
        </div>

        <div className="mb-1 border border-black">
          <div className="grid grid-cols-[28px_repeat(14,1fr)] border-b border-black text-[6pt] uppercase text-center leading-tight font-bold">
            <div className="py-0.5 border-r border-black"></div>
            <div className="py-0.5" col-span={14}></div>
          </div>

          <div className="grid grid-cols-[28px_repeat(7,1fr)] border-b border-black text-[6pt] uppercase text-center leading-tight font-bold">
            <div className="border-r border-black"></div>
            {weekdays.map((day, index) => (
              <div
                key={day}
                className={`py-0.5 ${index < weekdays.length - 1 ? 'border-r border-black' : ''}`}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[28px_repeat(14,1fr)] border-b border-black text-[6pt] uppercase text-center leading-tight font-bold">
            <div className="border-r border-black py-0.5">TURNO</div>
            {weekdays.map((day, index) => (
              <React.Fragment key={`${day}-sub`}>
                <div className="py-0.5 border-r border-black">INÍCIO</div>
                <div
                  className={`py-0.5 ${index < weekdays.length - 1 ? 'border-r border-black' : ''}`}
                >
                  FINAL
                </div>
              </React.Fragment>
            ))}
          </div>

          {['1º', '2º', '3º'].map((shift, rowIndex) => (
            <div
              key={shift}
              className={`grid grid-cols-[28px_repeat(14,1fr)] ${rowIndex < 2 ? 'border-b border-black' : ''}`}
            >
              <div className="border-r border-black flex items-center justify-center text-[6pt] font-bold py-1">
                {shift}
              </div>
              {weekdays.map((day, dayIndex) => (
                <React.Fragment key={`${shift}-${day}`}>
                  <div className="border-r border-black h-5 px-0.5 flex items-center">
                    <FormInput
                      type="text"
                      value={formData.schedule[rowIndex][dayIndex].start}
                      onChange={(e) =>
                        handleScheduleChange(rowIndex, dayIndex, 'start', e.target.value)
                      }
                      className="text-center text-[6.5pt]"
                    />
                  </div>
                  <div
                    className={`${dayIndex < weekdays.length - 1 ? 'border-r border-black' : ''} h-5 px-0.5 flex items-center`}
                  >
                    <FormInput
                      type="text"
                      value={formData.schedule[rowIndex][dayIndex].end}
                      onChange={(e) =>
                        handleScheduleChange(rowIndex, dayIndex, 'end', e.target.value)
                      }
                      className="text-center text-[6.5pt]"
                    />
                  </div>
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>

        <div className="mb-1 border border-black">
          {['1ª', '2ª', '3ª'].map((rowLabel, rowIndex) => (
            <div
              key={rowLabel}
              className={`grid grid-cols-[18px_repeat(14,1fr)] ${rowIndex < 2 ? 'border-b border-black' : ''}`}
            >
              <div className="border-r border-black text-[6pt] font-bold flex items-center justify-center py-1">
                {rowLabel}
              </div>
              {Array.from({ length: 14 }).map((_, cellIndex) => (
                <div
                  key={`${rowLabel}-${cellIndex}`}
                  className={`h-4 ${cellIndex < 13 ? 'border-r border-black' : ''}`}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="border border-black">
          <div className="grid grid-cols-2 border-b border-black text-[7pt] font-bold uppercase">
            <div className="border-r border-black px-2 py-1 flex items-center gap-2">
              <span>SOLICITAÇÃO EM</span>
              <span className="flex-1 text-center tracking-wide">____/____/______</span>
            </div>
            <div className="px-2 py-1 flex items-center gap-2">
              <span>AUTORIZAÇÃO EM</span>
              <span className="flex-1 text-center tracking-wide">____/____/______</span>
            </div>
          </div>

          <div className="grid grid-cols-2 min-h-[60px]">
            <div className="border-r border-black flex flex-col justify-end px-2 py-1">
              <div className="border-t border-black pt-1 text-center text-[6.5pt] font-bold uppercase">
                ASSINATURA DO DISCENTE
              </div>
            </div>
            <div className="flex flex-col justify-end px-2 py-1">
              <div className="border-t border-black pt-1 text-center text-[6.5pt] font-bold uppercase">
                ASSINATURA DO DOCENTE ORIENTADOR
              </div>
            </div>
          </div>
        </div>
      </OfficialFormTemplate>
    </div>
  )
}
