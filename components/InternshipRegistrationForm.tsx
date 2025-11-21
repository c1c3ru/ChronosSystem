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
    SignatureSection
} from '@/components/OfficialFormTemplate'

interface InternshipRegistrationFormProps {
    userId?: string
    userName?: string
    userEmail?: string
}

export function InternshipRegistrationForm({
    userId,
    userName = '',
    userEmail = ''
}: InternshipRegistrationFormProps) {
    const [formData, setFormData] = useState({
        studentName: userName,
        course: '',
        registration: '',
        address: '',
        phone: '',
        email: userEmail,
        birthDate: '',
        rg: '',
        cpf: '',
        deficiency: 'none',
        deficiencyDetails: '',
        internshipType: 'obrigatorio',
        startDate: '',
        weeklyHours: '',
        companyName: '',
        companyCNPJ: '',
        companyAddress: '',
        companyPhone: '',
        supervisorName: '',
        supervisorEmail: '',
        supervisorPhone: '',
        activities: ''
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
                    formId="internship-registration-form"
                    fileName="solicitacao-cadastro-estagio"
                />
            </div>

            {/* Formulário usando Template */}
            <OfficialFormTemplate
                formId="internship-registration-form"
                title="SOLICITAÇÃO DE CADASTRO NO ESTÁGIO"
                campus="Maracanaú"
                sector="Setor de Acompanhamento de Estágio"
            >
                {/* Dados do Aluno */}
                <FormTable>
                    <tbody>
                        <tr>
                            <FormHeaderCell colSpan={2}>NOME</FormHeaderCell>
                        </tr>
                        <tr>
                            <FormDataCell colSpan={2}>
                                <FormInput
                                    type="text"
                                    name="studentName"
                                    value={formData.studentName}
                                    onChange={handleChange}
                                    placeholder="Nome completo do aluno"
                                />
                            </FormDataCell>
                        </tr>
                        <tr>
                            <FormHeaderCell>CURSO</FormHeaderCell>
                            <FormHeaderCell>MATRÍCULA</FormHeaderCell>
                        </tr>
                        <tr>
                            <FormDataCell>
                                <FormInput
                                    type="text"
                                    name="course"
                                    value={formData.course}
                                    onChange={handleChange}
                                />
                            </FormDataCell>
                            <FormDataCell>
                                <FormInput
                                    type="text"
                                    name="registration"
                                    value={formData.registration}
                                    onChange={handleChange}
                                />
                            </FormDataCell>
                        </tr>
                    </tbody>
                </FormTable>

                {/* Endereço e Contato */}
                <FormTable>
                    <tbody>
                        <tr>
                            <FormHeaderCell colSpan={2}>
                                ENDEREÇO (LOGRADOURO, NÚMERO E COMPLEMENTO)
                            </FormHeaderCell>
                        </tr>
                        <tr>
                            <FormDataCell colSpan={2}>
                                <FormInput
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </FormDataCell>
                        </tr>
                        <tr>
                            <FormHeaderCell>TELEFONE</FormHeaderCell>
                            <FormHeaderCell>E-MAIL</FormHeaderCell>
                        </tr>
                        <tr>
                            <FormDataCell>
                                <FormInput
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </FormDataCell>
                            <FormDataCell>
                                <FormInput
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </FormDataCell>
                        </tr>
                    </tbody>
                </FormTable>

                {/* Documentos */}
                <FormTable>
                    <tbody>
                        <tr>
                            <FormHeaderCell>DATA NASCIMENTO</FormHeaderCell>
                            <FormHeaderCell>RG</FormHeaderCell>
                            <FormHeaderCell>CPF</FormHeaderCell>
                        </tr>
                        <tr>
                            <FormDataCell>
                                <FormInput
                                    type="date"
                                    name="birthDate"
                                    value={formData.birthDate}
                                    onChange={handleChange}
                                />
                            </FormDataCell>
                            <FormDataCell>
                                <FormInput
                                    type="text"
                                    name="rg"
                                    value={formData.rg}
                                    onChange={handleChange}
                                />
                            </FormDataCell>
                            <FormDataCell>
                                <FormInput
                                    type="text"
                                    name="cpf"
                                    value={formData.cpf}
                                    onChange={handleChange}
                                />
                            </FormDataCell>
                        </tr>
                    </tbody>
                </FormTable>

                {/* Deficiência */}
                <FormTable>
                    <tbody>
                        <tr>
                            <FormHeaderCell>POSSUI ALGUMA DEFICIÊNCIA?</FormHeaderCell>
                        </tr>
                        <tr>
                            <FormDataCell>
                                <div className="flex gap-4 flex-wrap">
                                    {['none', 'fisica', 'auditiva', 'visual', 'intelectual', 'multipla'].map((type) => (
                                        <label key={type} className="flex items-center gap-1">
                                            <input
                                                type="radio"
                                                name="deficiency"
                                                value={type}
                                                checked={formData.deficiency === type}
                                                onChange={handleChange}
                                            />
                                            <span className="text-xs capitalize">
                                                {type === 'none' ? 'Não' : type.charAt(0).toUpperCase() + type.slice(1)}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </FormDataCell>
                        </tr>
                    </tbody>
                </FormTable>

                {/* Tipo de Estágio */}
                <FormTable>
                    <tbody>
                        <tr>
                            <FormHeaderCell>TIPO DE ESTÁGIO</FormHeaderCell>
                        </tr>
                        <tr>
                            <FormDataCell>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-1">
                                        <input
                                            type="radio"
                                            name="internshipType"
                                            value="obrigatorio"
                                            checked={formData.internshipType === 'obrigatorio'}
                                            onChange={handleChange}
                                        />
                                        <span className="text-xs">OBRIGATÓRIO</span>
                                    </label>
                                    <label className="flex items-center gap-1">
                                        <input
                                            type="radio"
                                            name="internshipType"
                                            value="nao-obrigatorio"
                                            checked={formData.internshipType === 'nao-obrigatorio'}
                                            onChange={handleChange}
                                        />
                                        <span className="text-xs">NÃO OBRIGATÓRIO</span>
                                    </label>
                                </div>
                            </FormDataCell>
                        </tr>
                    </tbody>
                </FormTable>

                {/* Dados da Empresa */}
                <FormTable>
                    <tbody>
                        <tr>
                            <FormHeaderCell colSpan={2}>
                                CONCEDENTE (EMPRESA/INSTITUIÇÃO)
                            </FormHeaderCell>
                        </tr>
                        <tr>
                            <FormDataCell colSpan={2}>
                                <FormInput
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    placeholder="Nome da empresa"
                                />
                            </FormDataCell>
                        </tr>
                        <tr>
                            <FormHeaderCell>CNPJ</FormHeaderCell>
                            <FormHeaderCell>TELEFONE</FormHeaderCell>
                        </tr>
                        <tr>
                            <FormDataCell>
                                <FormInput
                                    type="text"
                                    name="companyCNPJ"
                                    value={formData.companyCNPJ}
                                    onChange={handleChange}
                                />
                            </FormDataCell>
                            <FormDataCell>
                                <FormInput
                                    type="tel"
                                    name="companyPhone"
                                    value={formData.companyPhone}
                                    onChange={handleChange}
                                />
                            </FormDataCell>
                        </tr>
                        <tr>
                            <FormHeaderCell colSpan={2}>ENDEREÇO</FormHeaderCell>
                        </tr>
                        <tr>
                            <FormDataCell colSpan={2}>
                                <FormInput
                                    type="text"
                                    name="companyAddress"
                                    value={formData.companyAddress}
                                    onChange={handleChange}
                                />
                            </FormDataCell>
                        </tr>
                    </tbody>
                </FormTable>

                {/* Supervisor */}
                <FormTable>
                    <tbody>
                        <tr>
                            <FormHeaderCell colSpan={3}>
                                SUPERVISOR DE ESTÁGIO NA EMPRESA
                            </FormHeaderCell>
                        </tr>
                        <tr>
                            <FormDataCell colSpan={3}>
                                <FormInput
                                    type="text"
                                    name="supervisorName"
                                    value={formData.supervisorName}
                                    onChange={handleChange}
                                    placeholder="Nome do supervisor"
                                />
                            </FormDataCell>
                        </tr>
                        <tr>
                            <FormHeaderCell>TELEFONE</FormHeaderCell>
                            <FormHeaderCell colSpan={2}>E-MAIL</FormHeaderCell>
                        </tr>
                        <tr>
                            <FormDataCell>
                                <FormInput
                                    type="tel"
                                    name="supervisorPhone"
                                    value={formData.supervisorPhone}
                                    onChange={handleChange}
                                />
                            </FormDataCell>
                            <FormDataCell colSpan={2}>
                                <FormInput
                                    type="email"
                                    name="supervisorEmail"
                                    value={formData.supervisorEmail}
                                    onChange={handleChange}
                                />
                            </FormDataCell>
                        </tr>
                    </tbody>
                </FormTable>

                {/* Período e Carga Horária */}
                <FormTable>
                    <tbody>
                        <tr>
                            <FormHeaderCell>DATA INÍCIO</FormHeaderCell>
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

                {/* Atividades */}
                <FormTable>
                    <tbody>
                        <tr>
                            <FormHeaderCell>
                                ATIVIDADES A SEREM DESENVOLVIDAS
                            </FormHeaderCell>
                        </tr>
                        <tr>
                            <FormDataCell>
                                <FormTextarea
                                    name="activities"
                                    value={formData.activities}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Descreva as atividades que serão desenvolvidas no estágio"
                                />
                            </FormDataCell>
                        </tr>
                    </tbody>
                </FormTable>

                {/* Assinaturas */}
                <div className="mt-6 space-y-4 text-xs">
                    <div className="flex justify-between items-end">
                        <div className="text-center">
                            <div className="mb-1">SOLICITAÇÃO EM ___/___/______</div>
                        </div>
                        <div className="text-center">
                            <div className="mb-1">AUTORIZAÇÃO EM ___/___/______</div>
                        </div>
                    </div>

                    <SignatureSection label="ASSINATURA DO DISCENTE" />
                    <SignatureSection label="ASSINATURA DO DOCENTE ORIENTADOR" />

                    <div className="mt-6 text-xs italic">
                        <p>
                            <strong>Observação:</strong> As atividades de estágio supervisionado só podem ser{' '}
                            <strong>iniciadas após o cadastro</strong> do Termo de Compromisso de Estágio no sistema competente.
                        </p>
                    </div>
                </div>
            </OfficialFormTemplate>
        </div>
    )
}
