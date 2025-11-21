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
    SignatureSection
} from '@/components/OfficialFormTemplate'

interface ParticipationDeclarationFormProps {
    userId?: string
    userName?: string
    userEmail?: string
}

/**
 * Formulário de Declaração de Participação em Experiência
 * Usa o template oficial do IFCE para manter consistência
 */
export function ParticipationDeclarationForm({
    userId,
    userName = '',
    userEmail = ''
}: ParticipationDeclarationFormProps) {
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
        weeklyHours: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    return (
        <div className="w-full max-w-[210mm] mx-auto p-4 bg-neutral-50">
            <div className="mb-6 flex justify-end no-print">
                <FormPDFExport
                    formId="participation-declaration-form"
                    fileName="declaracao-participacao-experiencia"
                />
            </div>

            <OfficialFormTemplate
                formId="participation-declaration-form"
                title="DECLARAÇÃO DE PARTICIPAÇÃO EM EXPERIÊNCIA"
                subtitle="DE EXTENSÃO, INICIAÇÃO CIENTÍFICA OU MONITORIA"
                campus="Morada Nova"
                sector="Coordenação de Extensão"
            >
                <div className="mb-4 text-[9pt] text-justify px-1">
                    <p>
                        Para fins de <strong>EQUIPARAÇÃO</strong> a atividades de estágio supervisionado obrigatório,
                        declaro os fatos a seguir descritos, para que surjam efeitos legais.
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

                <div className="mt-4 mb-1 px-1">
                    <div className="text-[9px] font-bold uppercase">
                        DETALHES DA EXPERIÊNCIA
                    </div>
                </div>

                <FormTable>
                    <tbody>
                        <tr>
                            <FormField label="TIPO DE EXPERIÊNCIA" colSpan={3}>
                                <div className="flex gap-8 pt-1">
                                    {['EXTENSÃO', 'INICIAÇÃO CIENTÍFICA', 'MONITORIA'].map((type) => (
                                        <label key={type} className="flex items-center gap-1 text-[8px] uppercase cursor-pointer">
                                            <input
                                                type="radio"
                                                name="experienceType"
                                                value={type}
                                                checked={formData.experienceType === type}
                                                onChange={handleChange}
                                                className="h-3 w-3"
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
                                    rows={6}
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
                                        className="w-20"
                                    />
                                    <span className="text-[8px]">HORAS</span>
                                </div>
                            </FormField>
                        </tr>
                    </tbody>
                </FormTable>

                <div className="mt-8 border border-black p-4">
                    <SignatureSection
                        label="ASSINATURA DO (A) DECLARANTE"
                        date={true}
                    />
                </div>
            </OfficialFormTemplate>
        </div>
    )
}
