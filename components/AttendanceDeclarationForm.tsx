'use client'

import React, { useState } from 'react'
import { FormPDFExport } from '@/components/FormPDFExport'
import {
  OfficialFormTemplate,
  FormTable,
  FormField,
  FormInput,
  FormTextarea,
  FormSelect,
  SignatureSection,
} from '@/components/OfficialFormTemplate'

interface AttendanceDeclarationFormProps {
  userId?: string
  userName?: string
  userEmail?: string
}

export function AttendanceDeclarationForm({
  userId,
  userName = '',
  userEmail = '',
}: AttendanceDeclarationFormProps) {
  const [formData, setFormData] = useState({
    declarantName: '',
    documentType: 'CPF',
    documentNumber: '',
    studentName: userName,
    course: '',
    registration: '',
    institution: 'INSTITUTO FEDERAL DE EDUCAÇÃO, CIÊNCIA E TECNOLOGIA – IFCE',
    campus: 'MORADA NOVA',
    experienceType: 'EXTENSÃO',
    projectProgram: '',
    projectInstitution: '',
    activities: '',
    startDate: '',
    weeklyHours: '',
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
          formId="attendance-declaration-form"
          fileName="declaracao-participacao-extensao"
        />
      </div>

      <OfficialFormTemplate
        formId="attendance-declaration-form"
        title="DECLARAÇÃO DE PARTICIPAÇÃO EM EXPERIÊNCIA"
        subtitle="DE EXTENSÃO, INICIAÇÃO CIENTÍFICA OU MONITORIA"
        campus="Morada Nova"
        sector="Coordenação de Extensão"
      >
        <div className="mb-3 text-[9pt] text-justify px-1">
          <p>
            Para fins de <strong>EQUIPARAÇÃO</strong> a atividades de estágio supervisionado
            obrigatório, declaro os fatos a seguir descritos, para que surjam efeitos legais.
          </p>
        </div>

        <FormTable>
          <tbody>
            <tr>
              <FormField label="NOME DO DECLARANTE (SERVIDOR/ORIENTADOR/SUPERVISOR)" colSpan={3}>
                <FormInput
                  type="text"
                  name="declarantName"
                  value={formData.declarantName}
                  onChange={handleChange}
                  placeholder="Digite o nome completo"
                />
              </FormField>
            </tr>
            <tr>
              <FormField label="TIPO DE DOCUMENTO">
                <FormSelect
                  name="documentType"
                  value={formData.documentType}
                  onChange={handleChange}
                >
                  <option value="CPF">CPF</option>
                  <option value="RG">RG</option>
                  <option value="CNPJ">CNPJ</option>
                </FormSelect>
              </FormField>
              <FormField label="NÚMERO DO DOCUMENTO" colSpan={2}>
                <FormInput
                  type="text"
                  name="documentNumber"
                  value={formData.documentNumber}
                  onChange={handleChange}
                  placeholder="Número do documento"
                />
              </FormField>
            </tr>
            <tr>
              <FormField label="NOME DO DISCENTE" colSpan={3}>
                <FormInput
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  placeholder="Nome do aluno"
                />
              </FormField>
            </tr>
            <tr>
              <FormField label="CURSO" colSpan={2}>
                <FormInput
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  placeholder="Nome do curso"
                />
              </FormField>
              <FormField label="MATRÍCULA">
                <FormInput
                  type="text"
                  name="registration"
                  value={formData.registration}
                  onChange={handleChange}
                  placeholder="Número de matrícula"
                />
              </FormField>
            </tr>
            <tr>
              <FormField label="INSTITUIÇÃO DE ENSINO" colSpan={2}>
                <FormInput
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  readOnly
                />
              </FormField>
              <FormField label="CAMPUS">
                <FormInput
                  type="text"
                  name="campus"
                  value={formData.campus}
                  onChange={handleChange}
                  readOnly
                />
              </FormField>
            </tr>
          </tbody>
        </FormTable>

        <div className="mt-3 mb-1">
          <div className="text-[8pt] font-bold uppercase bg-gray-200 border border-black px-1 py-1">
            DETALHES DA EXPERIÊNCIA
          </div>
        </div>

        <FormTable>
          <tbody>
            <tr>
              <FormField label="TIPO DE EXPERIÊNCIA" colSpan={3}>
                <div className="flex gap-6 pt-0.5">
                  {['EXTENSÃO', 'INICIAÇÃO CIENTÍFICA', 'MONITORIA'].map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-1 text-[7pt] uppercase cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="experienceType"
                        value={type}
                        checked={formData.experienceType === type}
                        onChange={handleChange}
                        className="h-2.5 w-2.5 flex-shrink-0"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </FormField>
            </tr>
            <tr>
              <FormField label="NOME DO PROJETO / PROGRAMA" colSpan={3}>
                <FormInput
                  type="text"
                  name="projectProgram"
                  value={formData.projectProgram}
                  onChange={handleChange}
                  placeholder="Nome do projeto ou programa"
                />
              </FormField>
            </tr>
            <tr>
              <FormField label="INSTITUIÇÃO RESPONSÁVEL" colSpan={3}>
                <FormInput
                  type="text"
                  name="projectInstitution"
                  value={formData.projectInstitution}
                  onChange={handleChange}
                  placeholder="Instituição responsável"
                />
              </FormField>
            </tr>
            <tr>
              <FormField label="ATIVIDADES DESENVOLVIDAS PELO(A) DISCENTE" colSpan={3}>
                <FormTextarea
                  name="activities"
                  value={formData.activities}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Descreva as atividades desenvolvidas"
                />
              </FormField>
            </tr>
            <tr>
              <FormField label="DATA DE INÍCIO">
                <FormInput
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </FormField>
              <FormField label="CARGA HORÁRIA SEMANAL" colSpan={2}>
                <div className="flex items-center gap-1">
                  <FormInput
                    type="number"
                    name="weeklyHours"
                    value={formData.weeklyHours}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-16 rounded-none"
                  />
                  <span className="text-[7pt]">HORAS</span>
                </div>
              </FormField>
            </tr>
          </tbody>
        </FormTable>

        <div className="mt-6 border border-black p-3">
          <SignatureSection label="ASSINATURA DO (A) DECLARANTE" date={true} />
        </div>
      </OfficialFormTemplate>
    </div>
  )
}
