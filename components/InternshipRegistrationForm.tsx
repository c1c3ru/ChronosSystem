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
        schedule: Array(3).fill(Array(7).fill({ start: '', end: '' })) // 3 turnos x 7 dias
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    return (
        <div className="w-full max-w-[210mm] mx-auto p-4 bg-neutral-50">
            <div className="mb-6 flex justify-end no-print">
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
                                <FormInput type="text" name="studentName" value={formData.studentName} onChange={handleChange} />
                            </FormField>
                            <FormField label="CPF">
                                <FormInput type="text" name="cpf" placeholder="" />
                            </FormField>
                        </tr>
                        <tr>
                            <FormField label="NOME SOCIAL" colSpan={4}>
                                <FormInput type="text" name="socialName" value={formData.socialName} onChange={handleChange} />
                            </FormField>
                        </tr>
                        <tr>
                            <FormField label="CURSO" colSpan={3}>
                                <FormInput type="text" name="course" value={formData.course} onChange={handleChange} />
                            </FormField>
                            <FormField label="MATRÍCULA">
                                <FormInput type="text" name="registration" value={formData.registration} onChange={handleChange} />
                            </FormField>
                        </tr>
                        <tr>
                            <FormField label="ENDEREÇO (LOGRADOURO, NÚMERO E COMPLEMENTO)" colSpan={3}>
                                <FormInput type="text" name="address" value={formData.address} onChange={handleChange} />
                            </FormField>
                            <FormField label="BAIRRO/DISTRITO">
                                <FormInput type="text" name="neighborhood" value={formData.neighborhood} onChange={handleChange} />
                            </FormField>
                        </tr>
                        <tr>
                            <FormField label="MUNICÍPIO-UF" colSpan={2}>
                                <FormInput type="text" name="cityState" value={formData.cityState} onChange={handleChange} />
                            </FormField>
                            <FormField label="CEP">
                                <FormInput type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} />
                            </FormField>
                            <FormField label="DDD + TELEFONE">
                                <FormInput type="text" name="phone" value={formData.phone} onChange={handleChange} />
                            </FormField>
                        </tr>
                        <tr>
                            <FormField label="E-MAIL INSTITUCIONAL" colSpan={2}>
                                <FormInput type="email" name="email" value={formData.email} onChange={handleChange} />
                            </FormField>
                            <FormField label="E-MAIL PESSOAL" colSpan={2}>
                                <FormInput type="email" name="personalEmail" value={formData.personalEmail} onChange={handleChange} />
                            </FormField>
                        </tr>
                    </tbody>
                </FormTable>

                {/* Seção Cor/Raça e Deficiência */}
                <FormTable className="mt-0 border-t-0">
                    <thead>
                        <tr>
                            <FormHeaderCell className="w-1/3 text-center bg-gray-300">COR/RAÇA</FormHeaderCell>
                            <FormHeaderCell className="w-1/3 text-center bg-gray-300">ETNIA</FormHeaderCell>
                            <FormHeaderCell className="w-1/3 text-center bg-gray-300">APENAS PARA PESSOA COM DEFICIÊNCIA E/OU AH/SD</FormHeaderCell>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <FormDataCell>
                                <div className="space-y-0.5 text-[8px]">
                                    {['Amarelo(a)', 'Branco(a)', 'Indígena', 'Pardo(a)', 'Preto(a)', 'Prefiro não declarar'].map(opt => (
                                        <label key={opt} className="flex items-center gap-1">
                                            <input type="radio" name="race" value={opt} className="h-2 w-2" /> {opt}
                                        </label>
                                    ))}
                                </div>
                            </FormDataCell>
                            <FormDataCell>
                                <div className="space-y-0.5 text-[8px]">
                                    {['Indígena', 'Quilombola', 'Outra', 'Prefiro não declarar'].map(opt => (
                                        <label key={opt} className="flex items-center gap-1">
                                            <input type="radio" name="ethnicity" value={opt} className="h-2 w-2" /> {opt}
                                        </label>
                                    ))}
                                    <div className="mt-1">
                                        Informar comunidade se marcar etnia:
                                        <FormInput className="border-b border-black w-full" />
                                    </div>
                                </div>
                            </FormDataCell>
                            <FormDataCell>
                                <div className="space-y-0.5 text-[8px]">
                                    {['Alta habilidade/superdotação', 'Deficiência auditiva', 'Deficiência intelectual', 'Deficiência motora', 'Deficiência visual/baixa visão', 'Deficiência visual', 'Surdocegueira'].map(opt => (
                                        <label key={opt} className="flex items-center gap-1">
                                            <input type="checkbox" name="deficiencyType" value={opt} className="h-2 w-2" /> {opt}
                                        </label>
                                    ))}
                                </div>
                            </FormDataCell>
                        </tr>
                    </tbody>
                </FormTable>

                <FormTable className="mt-0 border-t-0">
                    <tbody>
                        <tr>
                            <FormField label="RAZÃO SOCIAL" colSpan={4}>
                                <FormInput type="text" name="companyName" value={formData.companyName} onChange={handleChange} />
                            </FormField>
                        </tr>
                        <tr>
                            <FormField label="NOME DE FANTASIA OU DE PESSOA FÍSICA" colSpan={4}>
                                <FormInput type="text" name="companyFantasyName" value={formData.companyFantasyName} onChange={handleChange} />
                            </FormField>
                        </tr>
                        <tr>
                            <FormField label="CNPJ OU REGISTRO NO CONSELHO">
                                <FormInput type="text" name="companyCNPJ" value={formData.companyCNPJ} onChange={handleChange} />
                            </FormField>
                            <FormField label="ENDEREÇO (LOGRADOURO, NÚMERO E COMPLEMENTO)" colSpan={3}>
                                <FormInput type="text" name="companyAddress" value={formData.companyAddress} onChange={handleChange} />
                            </FormField>
                        </tr>
                        <tr>
                            <FormField label="BAIRRO" colSpan={2}>
                                <FormInput type="text" name="companyNeighborhood" value={formData.companyNeighborhood} onChange={handleChange} />
                            </FormField>
                            <FormField label="MUNICÍPIO-UF">
                                <FormInput type="text" name="companyCityState" value={formData.companyCityState} onChange={handleChange} />
                            </FormField>
                            <FormField label="CEP">
                                <FormInput type="text" name="companyZipCode" value={formData.companyZipCode} onChange={handleChange} />
                            </FormField>
                        </tr>
                        <tr>
                            <FormField label="DDD + TELEFONE" colSpan={2}>
                                <FormInput type="text" name="companyPhone" value={formData.companyPhone} onChange={handleChange} />
                            </FormField>
                            <FormField label="E-MAIL" colSpan={2}>
                                <FormInput type="email" name="companyEmail" value={formData.companyEmail} onChange={handleChange} />
                            </FormField>
                        </tr>
                        <tr>
                            <FormField label="RESPONSÁVEL LEGAL PELA INSTITUIÇÃO PARA ESTE FIM" colSpan={4}>
                                <FormInput type="text" name="companyRepresentative" value={formData.companyRepresentative} onChange={handleChange} />
                            </FormField>
                        </tr>
                        <tr>
                            <FormField label="CARGO/QUALIFICAÇÃO" colSpan={2}>
                                <FormInput type="text" name="companyRepresentativeRole" value={formData.companyRepresentativeRole} onChange={handleChange} />
                            </FormField>
                            <FormField label="CPF">
                                <FormInput type="text" name="companyRepresentativeCPF" value={formData.companyRepresentativeCPF} onChange={handleChange} />
                            </FormField>
                            <FormField label="DDD + TELEFONE">
                                <FormInput type="text" name="companyRepresentativePhone" value={formData.companyRepresentativePhone} onChange={handleChange} />
                            </FormField>
                        </tr>
                        <tr>
                            <FormField label="SUPERVISOR DO ESTÁGIO NA INSTITUIÇÃO CONCEDENTE DA VAGA DE ESTÁGIO" colSpan={4}>
                                <FormInput type="text" name="supervisorName" value={formData.supervisorName} onChange={handleChange} />
                            </FormField>
                        </tr>
                        <tr>
                            <FormField label="CARGO/QUALIFICAÇÃO" colSpan={2}>
                                <FormInput type="text" name="supervisorRole" value={formData.supervisorRole} onChange={handleChange} />
                            </FormField>
                            <FormField label="CPF">
                                <FormInput type="text" name="supervisorCPF" value={formData.supervisorCPF} onChange={handleChange} />
                            </FormField>
                            <FormField label="DDD + TELEFONE">
                                <FormInput type="text" name="supervisorPhone" value={formData.supervisorPhone} onChange={handleChange} />
                            </FormField>
                        </tr>
                        <tr>
                            <FormField label="SETOR DE REALIZAÇÃO DO ESTÁGIO" colSpan={4}>
                                <FormInput type="text" name="sector" value={formData.sector} onChange={handleChange} />
                            </FormField>
                        </tr>
                    </tbody>
                </FormTable>

                {/* Dados do Estágio */}
                <FormTable className="mt-0 border-t-0">
                    <thead>
                        <tr>
                            <FormHeaderCell className="text-center">TIPO DE ESTÁGIO</FormHeaderCell>
                            <FormHeaderCell className="text-center">FORMA DE ESTÁGIO</FormHeaderCell>
                            <FormHeaderCell className="text-center">DATA INICIAL</FormHeaderCell>
                            <FormHeaderCell className="text-center">CARGA HORÁRIA SEMANAL</FormHeaderCell>
                            <FormHeaderCell className="text-center">DATA FINAL PREVISTA</FormHeaderCell>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <FormDataCell>
                                <div className="flex flex-col text-[8px]">
                                    <label><input type="radio" name="internshipType" value="obrigatorio" checked={formData.internshipType === 'obrigatorio'} onChange={handleChange} /> OBRIGATÓRIO</label>
                                    <label><input type="radio" name="internshipType" value="nao-obrigatorio" checked={formData.internshipType === 'nao-obrigatorio'} onChange={handleChange} /> NÃO OBRIGATÓRIO</label>
                                </div>
                            </FormDataCell>
                            <FormDataCell>
                                <div className="flex flex-col text-[8px]">
                                    <label><input type="radio" name="modality" value="presencial" checked={formData.modality === 'presencial'} onChange={handleChange} /> PRESENCIAL</label>
                                    <label><input type="radio" name="modality" value="remoto" checked={formData.modality === 'remoto'} onChange={handleChange} /> REMOTO</label>
                                </div>
                            </FormDataCell>
                            <FormDataCell className="text-center align-middle">
                                <FormInput type="text" name="startDate" value={formData.startDate} onChange={handleChange} className="text-center" placeholder="__/__/____" />
                            </FormDataCell>
                            <FormDataCell className="text-center align-middle">
                                <div className="flex items-center justify-center gap-1">
                                    <FormInput type="text" name="weeklyHours" value={formData.weeklyHours} onChange={handleChange} className="w-8 text-center border-b border-black" />
                                    <span className="text-[8px]">HORAS</span>
                                </div>
                            </FormDataCell>
                            <FormDataCell className="text-center align-middle">
                                <FormInput type="text" name="endDate" value={formData.endDate} onChange={handleChange} className="text-center" placeholder="__/__/____" />
                            </FormDataCell>
                        </tr>
                    </tbody>
                </FormTable>

                {/* Grade de Horários */}
                <FormTable className="mt-0 border-t-0">
                    <thead>
                        <tr>
                            <FormHeaderCell className="w-8 text-center rotate-180" rowSpan={2}><span className="writing-mode-vertical">TURNO</span></FormHeaderCell>
                            <FormHeaderCell colSpan={14} className="text-center bg-gray-300">PREVISÃO DE DISTRIBUIÇÃO DA CARGA HORÁRIA</FormHeaderCell>
                        </tr>
                        <tr>
                            <FormHeaderCell colSpan={2} className="text-center text-[7px]">SEGUNDA-FEIRA</FormHeaderCell>
                            <FormHeaderCell colSpan={2} className="text-center text-[7px]">TERÇA-FEIRA</FormHeaderCell>
                            <FormHeaderCell colSpan={2} className="text-center text-[7px]">QUARTA-FEIRA</FormHeaderCell>
                            <FormHeaderCell colSpan={2} className="text-center text-[7px]">QUINTA-FEIRA</FormHeaderCell>
                            <FormHeaderCell colSpan={2} className="text-center text-[7px]">SEXTA-FEIRA</FormHeaderCell>
                            <FormHeaderCell colSpan={2} className="text-center text-[7px]">SÁBADO</FormHeaderCell>
                            <FormHeaderCell colSpan={2} className="text-center text-[7px]">DOMINGO</FormHeaderCell>
                        </tr>
                        <tr>
                            <FormHeaderCell className="text-center"></FormHeaderCell>
                            {Array(7).fill(null).map((_, i) => (
                                <React.Fragment key={i}>
                                    <FormHeaderCell className="text-center text-[6px] w-8">INÍCIO</FormHeaderCell>
                                    <FormHeaderCell className="text-center text-[6px] w-8">FINAL</FormHeaderCell>
                                </React.Fragment>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[1, 2, 3].map((turno) => (
                            <tr key={turno}>
                                <FormDataCell className="text-center font-bold text-[8px] align-middle">{turno}º</FormDataCell>
                                {Array(14).fill(null).map((_, i) => (
                                    <FormDataCell key={i} className="h-6">
                                        <FormInput className="text-center h-full" />
                                    </FormDataCell>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </FormTable>

                {/* Assinaturas e Rodapé */}
                <div className="border border-black border-t-0 p-0">
                    <div className="grid grid-cols-2 divide-x divide-black">
                        <div className="p-2">
                            <div className="flex items-end gap-2 mb-4">
                                <span className="text-[9px] font-bold">SOLICITAÇÃO EM</span>
                                <span className="border-b border-black flex-1 text-center text-[9px]">___/___/______</span>
                            </div>
                            <div className="mt-8 border-t border-black pt-1 text-center text-[8px] font-bold">
                                ASSINATURA DO DISCENTE
                            </div>
                        </div>
                        <div className="p-2">
                            <div className="flex items-end gap-2 mb-4">
                                <span className="text-[9px] font-bold">AUTORIZAÇÃO EM</span>
                                <span className="border-b border-black flex-1 text-center text-[9px]">___/___/______</span>
                            </div>
                            <div className="mt-8 border-t border-black pt-1 text-center text-[8px] font-bold">
                                ASSINATURA DO DOCENTE ORIENTADOR
                            </div>
                        </div>
                    </div>
                </div>

            </OfficialFormTemplate>
        </div>
    )
}
