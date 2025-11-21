'use client'

import React, { useState } from 'react'
import { FormPDFExport } from '@/components/FormPDFExport'
import Image from 'next/image'

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
            {/* Botão de Exportar PDF - Não aparece no PDF */}
            <div className="mb-6 flex justify-end no-print">
                <FormPDFExport
                    formId="internship-registration-form"
                    fileName="solicitacao-cadastro-estagio"
                />
            </div>

            {/* Formulário - Formato A4 */}
            <div
                id="internship-registration-form"
                className="bg-white shadow-lg"
                style={{
                    width: '210mm',
                    minHeight: '297mm',
                    padding: '15mm',
                    margin: '0 auto',
                    fontSize: '10pt',
                    lineHeight: '1.3',
                    fontFamily: 'Arial, sans-serif'
                }}
            >
                {/* Cabeçalho Oficial */}
                <div className="border-2 border-black p-3 mb-4">
                    <div className="flex items-start justify-between gap-4">
                        {/* Logo IFCE */}
                        <div className="w-16 h-16 flex-shrink-0 bg-neutral-200 flex items-center justify-center text-xs text-center">
                            IFCE
                        </div>

                        {/* Título Central */}
                        <div className="flex-1 text-center">
                            <div className="text-xs font-bold mb-1">
                                PRÓ-REITORIA DE EXTENSÃO
                            </div>
                            <div className="text-xs mb-1">
                                COORDENAÇÃO DE ESTÁGIOS E ACOMPANHAMENTO DE EGRESSOS
                            </div>
                            <div className="text-xs font-bold mb-1">
                                IFCE Campus Maracanaú
                            </div>
                            <div className="text-xs">
                                Setor de Acompanhamento de Estágio
                            </div>
                            <div className="text-sm font-bold mt-2 border-t border-black pt-2">
                                SOLICITAÇÃO DE CADASTRO NO ESTÁGIO
                            </div>
                        </div>

                        {/* Brasão */}
                        <div className="w-16 h-16 flex-shrink-0 bg-neutral-200 flex items-center justify-center text-xs text-center">
                            BRASIL
                        </div>
                    </div>
                </div>

                {/* Dados do Aluno */}
                <table className="w-full border-collapse border border-black text-xs mb-3">
                    <tbody>
                        <tr>
                            <td className="border border-black p-1.5 font-bold bg-neutral-100" colSpan={2}>
                                NOME
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1.5" colSpan={2}>
                                <input
                                    type="text"
                                    name="studentName"
                                    value={formData.studentName}
                                    onChange={handleChange}
                                    className="w-full border-0 outline-none bg-transparent text-xs"
                                    placeholder="Nome completo do aluno"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1.5 font-bold bg-neutral-100 w-1/2">CURSO</td>
                            <td className="border border-black p-1.5 font-bold bg-neutral-100 w-1/2">MATRÍCULA</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1.5">
                                <input
                                    type="text"
                                    name="course"
                                    value={formData.course}
                                    onChange={handleChange}
                                    className="w-full border-0 outline-none bg-transparent text-xs"
                                />
                            </td>
                            <td className="border border-black p-1.5">
                                <input
                                    type="text"
                                    name="registration"
                                    value={formData.registration}
                                    onChange={handleChange}
                                    className="w-full border-0 outline-none bg-transparent text-xs"
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Endereço e Contato */}
                <table className="w-full border-collapse border border-black text-xs mb-3">
                    <tbody>
                        <tr>
                            <td className="border border-black p-1.5 font-bold bg-neutral-100" colSpan={2}>
                                ENDEREÇO (LOGRADOURO, NÚMERO E COMPLEMENTO)
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1.5" colSpan={2}>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full border-0 outline-none bg-transparent text-xs"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1.5 font-bold bg-neutral-100">TELEFONE</td>
                            <td className="border border-black p-1.5 font-bold bg-neutral-100">E-MAIL</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1.5">
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full border-0 outline-none bg-transparent text-xs"
                                />
                            </td>
                            <td className="border border-black p-1.5">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full border-0 outline-none bg-transparent text-xs"
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Documentos */}
                <table className="w-full border-collapse border border-black text-xs mb-3">
                    <tbody>
                        <tr>
                            <td className="border border-black p-1.5 font-bold bg-neutral-100 w-1/3">DATA NASCIMENTO</td>
                            <td className="border border-black p-1.5 font-bold bg-neutral-100 w-1/3">RG</td>
                            <td className="border border-black p-1.5 font-bold bg-neutral-100 w-1/3">CPF</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1.5">
                                <input
                                    type="date"
                                    name="birthDate"
                                    value={formData.birthDate}
                                    onChange={handleChange}
                                    className="w-full border-0 outline-none bg-transparent text-xs"
                                />
                            </td>
                            <td className="border border-black p-1.5">
                                <input
                                    type="text"
                                    name="rg"
                                    value={formData.rg}
                                    onChange={handleChange}
                                    className="w-full border-0 outline-none bg-transparent text-xs"
                                />
                            </td>
                            <td className="border border-black p-1.5">
                                <input
                                    type="text"
                                    name="cpf"
                                    value={formData.cpf}
                                    onChange={handleChange}
                                    className="w-full border-0 outline-none bg-transparent text-xs"
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Deficiência */}
                <table className="w-full border-collapse border border-black text-xs mb-3">
                    <tbody>
                        <tr>
                            <td className="border border-black p-1.5 font-bold bg-neutral-100">
                                POSSUI ALGUMA DEFICIÊNCIA?
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1.5">
                                <div className="flex gap-4 flex-wrap">
                                    <label className="flex items-center gap-1">
                                        <input
                                            type="radio"
                                            name="deficiency"
                                            value="none"
                                            checked={formData.deficiency === 'none'}
                                            onChange={handleChange}
                                        />
                                        <span className="text-xs">Não</span>
                                    </label>
                                    <label className="flex items-center gap-1">
                                        <input
                                            type="radio"
                                            name="deficiency"
                                            value="fisica"
                                            checked={formData.deficiency === 'fisica'}
                                            onChange={handleChange}
                                        />
                                        <span className="text-xs">Física</span>
                                    </label>
                                    <label className="flex items-center gap-1">
                                        <input
                                            type="radio"
                                            name="deficiency"
                                            value="auditiva"
                                            checked={formData.deficiency === 'auditiva'}
                                            onChange={handleChange}
                                        />
                                        <span className="text-xs">Auditiva</span>
                                    </label>
                                    <label className="flex items-center gap-1">
                                        <input
                                            type="radio"
                                            name="deficiency"
                                            value="visual"
                                            checked={formData.deficiency === 'visual'}
                                            onChange={handleChange}
                                        />
                                        <span className="text-xs">Visual</span>
                                    </label>
                                    <label className="flex items-center gap-1">
                                        <input
                                            type="radio"
                                            name="deficiency"
                                            value="intelectual"
                                            checked={formData.deficiency === 'intelectual'}
                                            onChange={handleChange}
                                        />
                                        <span className="text-xs">Intelectual</span>
                                    </label>
                                    <label className="flex items-center gap-1">
                                        <input
                                            type="radio"
                                            name="deficiency"
                                            value="multipla"
                                            checked={formData.deficiency === 'multipla'}
                                            onChange={handleChange}
                                        />
                                        <span className="text-xs">Múltipla</span>
                                    </label>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Tipo de Estágio */}
                <table className="w-full border-collapse border border-black text-xs mb-3">
                    <tbody>
                        <tr>
                            <td className="border border-black p-1.5 font-bold bg-neutral-100">
                                TIPO DE ESTÁGIO
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1.5">
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
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Dados da Empresa */}
                <table className="w-full border-collapse border border-black text-xs mb-3">
                    <tbody>
                        <tr>
                            <td className="border border-black p-1.5 font-bold bg-neutral-100" colSpan={2}>
                                CONCEDENTE (EMPRESA/INSTITUIÇÃO)
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1.5" colSpan={2}>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    className="w-full border-0 outline-none bg-transparent text-xs"
                                    placeholder="Nome da empresa"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1.5 font-bold bg-neutral-100">CNPJ</td>
                            <td className="border border-black p-1.5 font-bold bg-neutral-100">TELEFONE</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1.5">
                                <input
                                    type="text"
                                    name="companyCNPJ"
                                    value={formData.companyCNPJ}
                                    onChange={handleChange}
                                    className="w-full border-0 outline-none bg-transparent text-xs"
                                />
                            </td>
                            <td className="border border-black p-1.5">
                                <input
                                    type="tel"
                                    name="companyPhone"
                                    value={formData.companyPhone}
                                    onChange={handleChange}
                                    className="w-full border-0 outline-none bg-transparent text-xs"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1.5 font-bold bg-neutral-100" colSpan={2}>
                                ENDEREÇO
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1.5" colSpan={2}>
                                <input
                                    type="text"
                                    name="companyAddress"
                                    value={formData.companyAddress}
                                    onChange={handleChange}
                                    className="w-full border-0 outline-none bg-transparent text-xs"
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Supervisor */}
                <table className="w-full border-collapse border border-black text-xs mb-3">
                    <tbody>
                        <tr>
                            <td className="border border-black p-1.5 font-bold bg-neutral-100" colSpan={3}>
                                SUPERVISOR DE ESTÁGIO NA EMPRESA
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1.5" colSpan={3}>
                                <input
                                    type="text"
                                    name="supervisorName"
                                    value={formData.supervisorName}
                                    onChange={handleChange}
                                    className="w-full border-0 outline-none bg-transparent text-xs"
                                    placeholder="Nome do supervisor"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1.5 font-bold bg-neutral-100">TELEFONE</td>
                            <td className="border border-black p-1.5 font-bold bg-neutral-100" colSpan={2}>E-MAIL</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1.5">
                                <input
                                    type="tel"
                                    name="supervisorPhone"
                                    value={formData.supervisorPhone}
                                    onChange={handleChange}
                                    className="w-full border-0 outline-none bg-transparent text-xs"
                                />
                            </td>
                            <td className="border border-black p-1.5" colSpan={2}>
                                <input
                                    type="email"
                                    name="supervisorEmail"
                                    value={formData.supervisorEmail}
                                    onChange={handleChange}
                                    className="w-full border-0 outline-none bg-transparent text-xs"
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Período e Carga Horária */}
                <table className="w-full border-collapse border border-black text-xs mb-3">
                    <tbody>
                        <tr>
                            <td className="border border-black p-1.5 font-bold bg-neutral-100">DATA INÍCIO</td>
                            <td className="border border-black p-1.5 font-bold bg-neutral-100">CARGA HORÁRIA SEMANAL</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1.5">
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    className="w-full border-0 outline-none bg-transparent text-xs"
                                />
                            </td>
                            <td className="border border-black p-1.5">
                                <input
                                    type="number"
                                    name="weeklyHours"
                                    value={formData.weeklyHours}
                                    onChange={handleChange}
                                    className="w-full border-0 outline-none bg-transparent text-xs"
                                    placeholder="Horas"
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Atividades */}
                <table className="w-full border-collapse border border-black text-xs mb-4">
                    <tbody>
                        <tr>
                            <td className="border border-black p-1.5 font-bold bg-neutral-100">
                                ATIVIDADES A SEREM DESENVOLVIDAS
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1.5">
                                <textarea
                                    name="activities"
                                    value={formData.activities}
                                    onChange={handleChange}
                                    className="w-full border-0 outline-none bg-transparent text-xs resize-none"
                                    rows={4}
                                    placeholder="Descreva as atividades que serão desenvolvidas no estágio"
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Assinatura */}
                <div className="mt-6 space-y-4 text-xs">
                    <div className="flex justify-between items-end">
                        <div className="text-center">
                            <div className="mb-1">SOLICITAÇÃO EM ___/___/______</div>
                        </div>
                        <div className="text-center">
                            <div className="mb-1">AUTORIZAÇÃO EM ___/___/______</div>
                        </div>
                    </div>

                    <div className="border-t-2 border-black pt-8 mt-8">
                        <div className="text-center font-bold">
                            ASSINATURA DO DISCENTE
                        </div>
                    </div>

                    <div className="border-t-2 border-black pt-8 mt-8">
                        <div className="text-center font-bold">
                            ASSINATURA DO DOCENTE ORIENTADOR
                        </div>
                    </div>

                    <div className="mt-6 text-xs italic">
                        <p>
                            <strong>Observação:</strong> As atividades de estágio supervisionado só podem ser{' '}
                            <strong>iniciadas após o cadastro</strong> do Termo de Compromisso de Estágio no sistema competente.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
