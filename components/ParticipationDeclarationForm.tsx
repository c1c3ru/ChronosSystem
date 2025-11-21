'use client'

import React, { useState } from 'react'
import { FormPDFExport } from '@/components/FormPDFExport'
import {
    OfficialFormTemplate,
    FormTable,
    FormHeaderCell,
    FormDataCell,
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
            {/* Botão de Exportar PDF */}
            <div className="mb-6 flex justify-end no-print">
                <FormPDFExport
                    formId="participation-declaration-form"
                    fileName="declaracao-participacao-experiencia"
                />
            </div>

            {/* Formulário usando Template */}
            <OfficialFormTemplate
                formId="participation-declaration-form"
                title="DECLARAÇÃO DE PARTICIPAÇÃO EM EXPERIÊNCIA"
                subtitle="DE EXTENSÃO, INICIAÇÃO CIENTÍFICA OU MONITORIA"
                campus="Morada Nova"
                sector="Coordenação de Extensão"
            >
                {/* Texto Introdutório */}
                <div className="mb-4 text-xs">
                    <p>
                        Para fins de <strong>EQUIPARAÇÃO</strong> a atividades de estágio supervisionado obrigatório,
                        declaro os fatos a seguir descritos, para que surjam efeitos legais.
                    </p>
                </div>

                {/* Dados do Declarante */}
                <FormTable>
                    <tbody>
                        <tr>
                            <FormHeaderCell colSpan={2}>
                                NOME DO DECLARANTE (SERVIDOR/ORIENTADOR/SUPERVISOR) DA BOLSA OU COORDENADOR(A) DO PROJETO/PROGRAMA
                            </FormHeaderCell>
                        </tr>
                        <tr>
                            <FormDataCell colSpan={2}>
                                <FormInput
                                    type="text"
                                    name="declarantName"
                                    value={formData.declarantName}
                                    onChange={handleChange}
                                    placeholder="Digite o nome completo"
                                />
                            </FormDataCell>
                        </tr>
                    </tbody>
                </FormTable>

                {/* Documento do Declarante */}
                <FormTable>
                    <tbody>
                        <tr>
                            <FormHeaderCell>DOCUMENTO TIPO</FormHeaderCell>
                            <FormHeaderCell>NÚMERO</FormHeaderCell>
                        </tr>
                        <tr>
                            <FormDataCell>
                                <FormSelect
                                    name="documentType"
                                    value={formData.documentType}
                                    onChange={handleChange}
                                >
                                    <option value="CPF">CPF</option>
                                    <option value="RG">RG</option>
                                    <option value="CNPJ">CNPJ</option>
                                </FormSelect>
                            </FormDataCell>
                            <FormDataCell>
                                <FormInput
                                    type="text"
                                    name="documentNumber"
                                    value={formData.documentNumber}
                                    onChange={handleChange}
                                    placeholder="Número do documento"
                                />
                            </FormDataCell>
                        </tr>
                    </tbody>
                </FormTable>

                {/* Dados do Discente */}
                <FormTable>
                    <tbody>
                        <tr>
                            <FormHeaderCell>DISCENTE</FormHeaderCell>
                        </tr>
                        <tr>
                            <FormDataCell>
                                <FormInput
                                    type="text"
                                    name="studentName"
                                    value={formData.studentName}
                                    onChange={handleChange}
                                    placeholder="Nome do aluno"
                                />
                            </FormDataCell>
                        </tr>
                        <tr>
                            <FormHeaderCell>CURSO</FormHeaderCell>
                        </tr>
                        <tr>
                            <FormDataCell>
                                <FormInput
                                    type="text"
                                    name="course"
                                    value={formData.course}
                                    onChange={handleChange}
                                    placeholder="Nome do curso"
                                />
                            </FormDataCell>
                        </tr>
                        <tr>
                            <FormHeaderCell>MATRÍCULA</FormHeaderCell>
                        </tr>
                        <tr>
                            <FormDataCell>
                                <FormInput
                                    type="text"
                                    name="registration"
                                    value={formData.registration}
                                    onChange={handleChange}
                                    placeholder="Número de matrícula"
                                />
                            </FormDataCell>
                        </tr>
                        <tr>
                            <FormHeaderCell>INSTITUIÇÃO DE ENSINO</FormHeaderCell>
                        </tr>
                        <tr>
                            <FormDataCell>
                                <FormInput
                                    type="text"
                                    name="institution"
                                    value={formData.institution}
                                    onChange={handleChange}
                                    readOnly
                                />
                            </FormDataCell>
                        </tr>
                        <tr>
                            <FormHeaderCell>CAMPUS</FormHeaderCell>
                        </tr>
                        <tr>
                            <FormDataCell>
                                <FormInput
                                    type="text"
                                    name="campus"
                                    value={formData.campus}
                                    onChange={handleChange}
                                    readOnly
                                />
                            </FormDataCell>
                        </tr>
                    </tbody>
                </FormTable>

                {/* Tipo de Experiência */}
                <FormTable>
                    <tbody>
                        <tr>
                            <FormHeaderCell>EXPERIÊNCIA</FormHeaderCell>
                        </tr>
                        <tr>
                            <FormDataCell>
                                <div className="flex gap-8">
                                    {['EXTENSÃO', 'INICIAÇÃO CIENTÍFICA', 'MONITORIA'].map((type) => (
                                        <label key={type} className="flex items-center gap-2 text-xs">
                                            <input
                                                type="radio"
                                                name="experienceType"
                                                value={type}
                                                checked={formData.experienceType === type}
                                                onChange={handleChange}
                                            />
                                            {type}
                                        </label>
                                    ))}
                                </div>
                            </FormDataCell>
                        </tr>
                    </tbody>
                </FormTable>

                {/* Projeto/Programa */}
                <FormTable>
                    <tbody>
                        <tr>
                            <FormHeaderCell>PROJETO/PROGRAMA</FormHeaderCell>
                        </tr>
                        <tr>
                            <FormDataCell>
                                <FormInput
                                    type="text"
                                    name="projectProgram"
                                    value={formData.projectProgram}
                                    onChange={handleChange}
                                    placeholder="Nome do projeto ou programa"
                                />
                            </FormDataCell>
                        </tr>
                        <tr>
                            <FormHeaderCell>INSTITUIÇÃO</FormHeaderCell>
                        </tr>
                        <tr>
                            <FormDataCell>
                                <FormInput
                                    type="text"
                                    name="projectInstitution"
                                    value={formData.projectInstitution}
                                    onChange={handleChange}
                                    placeholder="Instituição responsável"
                                />
                            </FormDataCell>
                        </tr>
                    </tbody>
                </FormTable>

                {/* Atividades Desenvolvidas */}
                <FormTable>
                    <tbody>
                        <tr>
                            <FormHeaderCell>
                                ATIVIDADES DESENVOLVIDAS PELO(A) DISCENTE
                            </FormHeaderCell>
                        </tr>
                        <tr>
                            <FormDataCell>
                                <FormTextarea
                                    name="activities"
                                    value={formData.activities}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Descreva as atividades desenvolvidas"
                                />
                            </FormDataCell>
                        </tr>
                    </tbody>
                </FormTable>

                {/* Período e Carga Horária */}
                <FormTable>
                    <tbody>
                        <tr>
                            <FormHeaderCell>INÍCIO</FormHeaderCell>
                            <FormHeaderCell>CARGA HORÁRIA SEMANAL</FormHeaderCell>
                        </tr>
                        <tr>
                            <FormDataCell>
                                <FormInput
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                />
                            </FormDataCell>
                            <FormDataCell>
                                <FormInput
                                    type="number"
                                    name="weeklyHours"
                                    value={formData.weeklyHours}
                                    onChange={handleChange}
                                    placeholder="Horas"
                                />
                            </FormDataCell>
                        </tr>
                    </tbody>
                </FormTable>

                {/* Assinatura */}
                <SignatureSection
                    label="ASSINATURA DO (A) DECLARANTE"
                    date={true}
                />
            </OfficialFormTemplate>
        </div>
    )
}
