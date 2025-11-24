import React, { forwardRef } from 'react'
import { OfficialHeader, FormTable, FormHeaderCell, FormDataCell, FormField } from '@/components/OfficialFormTemplate'

interface InternshipRegistrationDocumentProps {
    data: {
        // Discente
        student_name: string
        student_social_name: string
        student_course: string
        student_enrollment: string
        student_address: string
        student_neighborhood: string
        student_city_uf: string
        student_zip: string
        student_phone: string
        student_email_institutional: string
        student_email_personal: string

        // Checkboxes (serão strings 'true'/'false' ou valores específicos)
        student_race: string // Amarelo, Branco, Indígena, Pardo, Preto, Prefiro não declarar
        student_ethnicity: string // Indígena, Quilombola, Outra, Prefiro não declarar, Informar comunidade
        student_ethnicity_community: string
        student_disability: string // Alta habilidade, Auditiva, Intelectual, Motora, Visual/Baixa visão, Visual, Surdocegueira

        // Concedente
        company_name: string
        company_fantasy_name: string
        company_cnpj: string
        company_address: string
        company_neighborhood: string
        company_city_uf: string
        company_zip: string
        company_phone: string
        company_email: string
        company_representative: string
        company_representative_role: string
        company_supervisor: string
        company_supervisor_role: string
        company_sector: string

        // Estágio
        internship_type: string // Obrigatório, Não Obrigatório
        internship_mode: string // Presencial, Remoto
        start_date: string
        weekly_hours: string
        end_date: string

        // Horário (JSON string)
        schedule: string
    }
}

export const InternshipRegistrationDocument = forwardRef<HTMLDivElement, InternshipRegistrationDocumentProps>(({ data }, ref) => {
    const schedule = JSON.parse(data.schedule || '{}')

    const Checkbox = ({ checked, label }: { checked: boolean, label: string }) => (
        <div className="flex items-center mr-4 mb-1">
            <div className={`w-4 h-4 border border-black mr-1 flex items-center justify-center text-[10px]`}>
                {checked ? 'X' : ''}
            </div>
            <span className="text-[9pt]">{label}</span>
        </div>
    )

    return (
        <div ref={ref} className="bg-white text-black p-8 max-w-[210mm] mx-auto text-[10pt] font-sans leading-tight">
            <OfficialHeader
                title="SOLICITAÇÃO DE CADASTRO NO ESTÁGIO"
                showLogos={true}
            />

            {/* Dados do Discente */}
            <FormTable>
                <tbody>
                    <tr>
                        <FormField label="NOME" colSpan={4}>
                            {data.student_name}
                        </FormField>
                        <FormField label="CPF" colSpan={2}>
                            {/* CPF não estava no form original mas aparece no modelo, vou deixar em branco ou adicionar depois */}
                        </FormField>
                    </tr>
                    <tr>
                        <FormField label="NOME SOCIAL" colSpan={6}>
                            {data.student_social_name}
                        </FormField>
                    </tr>
                    <tr>
                        <FormField label="CURSO" colSpan={4}>
                            {data.student_course}
                        </FormField>
                        <FormField label="MATRÍCULA" colSpan={2}>
                            {data.student_enrollment}
                        </FormField>
                    </tr>
                    <tr>
                        <FormField label="ENDEREÇO (LOGRADOURO, NÚMERO E COMPLEMENTO)" colSpan={4}>
                            {data.student_address}
                        </FormField>
                        <FormField label="BAIRRO/DISTRITO" colSpan={2}>
                            {data.student_neighborhood}
                        </FormField>
                    </tr>
                    <tr>
                        <FormField label="MUNICÍPIO-UF" colSpan={3}>
                            {data.student_city_uf}
                        </FormField>
                        <FormField label="CEP" colSpan={1}>
                            {data.student_zip}
                        </FormField>
                        <FormField label="DDD + TELEFONE" colSpan={2}>
                            {data.student_phone}
                        </FormField>
                    </tr>
                    <tr>
                        <FormField label="E-MAIL INSTITUCIONAL" colSpan={3}>
                            {data.student_email_institutional}
                        </FormField>
                        <FormField label="E-MAIL PESSOAL" colSpan={3}>
                            {data.student_email_personal}
                        </FormField>
                    </tr>
                </tbody>
            </FormTable>

            {/* Cor/Raça, Etnia, Deficiência */}
            <FormTable>
                <tbody>
                    <tr>
                        <FormHeaderCell className="text-center w-1/4">COR/RAÇA</FormHeaderCell>
                        <FormHeaderCell className="text-center w-1/4">ETNIA</FormHeaderCell>
                        <FormHeaderCell className="text-center w-1/2">APENAS PARA PESSOA COM DEFICIÊNCIA E/OU AH/SD</FormHeaderCell>
                    </tr>
                    <tr>
                        <td className="border border-gray-400 p-2 align-top">
                            <Checkbox checked={data.student_race === 'amarelo'} label="Amarelo(a)" />
                            <Checkbox checked={data.student_race === 'branco'} label="Branco(a)" />
                            <Checkbox checked={data.student_race === 'indigena'} label="Indígena" />
                            <Checkbox checked={data.student_race === 'pardo'} label="Pardo(a)" />
                            <Checkbox checked={data.student_race === 'preto'} label="Preto(a)" />
                            <Checkbox checked={data.student_race === 'nao_declarar'} label="Prefiro não declarar" />
                        </td>
                        <td className="border border-gray-400 p-2 align-top">
                            <Checkbox checked={data.student_ethnicity === 'indigena'} label="Indígena" />
                            <Checkbox checked={data.student_ethnicity === 'quilombola'} label="Quilombola" />
                            <Checkbox checked={data.student_ethnicity === 'outra'} label="Outra" />
                            <Checkbox checked={data.student_ethnicity === 'nao_declarar'} label="Prefiro não declarar" />
                            <div className="mt-2 text-[9pt]">
                                Informar comunidade se marcar etnia:
                                <div className="border-b border-black h-4 mt-1">{data.student_ethnicity_community}</div>
                            </div>
                        </td>
                        <td className="border border-gray-400 p-2 align-top">
                            <div className="grid grid-cols-1">
                                <Checkbox checked={data.student_disability === 'alta_habilidade'} label="Alta habilidade/superdotação" />
                                <Checkbox checked={data.student_disability === 'auditiva'} label="Deficiência auditiva" />
                                <Checkbox checked={data.student_disability === 'intelectual'} label="Deficiência intelectual" />
                                <Checkbox checked={data.student_disability === 'motora'} label="Deficiência motora" />
                                <Checkbox checked={data.student_disability === 'visual_baixa'} label="Deficiência visual/baixa visão" />
                                <Checkbox checked={data.student_disability === 'visual'} label="Deficiência visual" />
                                <Checkbox checked={data.student_disability === 'surdocegueira'} label="Surdocegueira" />
                            </div>
                        </td>
                    </tr>
                </tbody>
            </FormTable>

            {/* Instituição Concedente */}
            <FormTable>
                <tbody>
                    <tr>
                        <FormField label="RAZÃO SOCIAL" colSpan={6}>
                            {data.company_name}
                        </FormField>
                    </tr>
                    <tr>
                        <FormField label="NOME DE FANTASIA OU DE PESSOA FÍSICA" colSpan={6}>
                            {data.company_fantasy_name}
                        </FormField>
                    </tr>
                    <tr>
                        <FormField label="CNPJ OU REGISTRO NO CONSELHO" colSpan={2}>
                            {data.company_cnpj}
                        </FormField>
                        <FormField label="ENDEREÇO (LOGRADOURO, NÚMERO E COMPLEMENTO)" colSpan={4}>
                            {data.company_address}
                        </FormField>
                    </tr>
                    <tr>
                        <FormField label="BAIRRO" colSpan={2}>
                            {data.company_neighborhood}
                        </FormField>
                        <FormField label="MUNICÍPIO-UF" colSpan={3}>
                            {data.company_city_uf}
                        </FormField>
                        <FormField label="CEP" colSpan={1}>
                            {data.company_zip}
                        </FormField>
                    </tr>
                    <tr>
                        <FormField label="DDD + TELEFONE" colSpan={2}>
                            {data.company_phone}
                        </FormField>
                        <FormField label="E-MAIL" colSpan={4}>
                            {data.company_email}
                        </FormField>
                    </tr>
                    <tr>
                        <FormField label="RESPONSÁVEL LEGAL PELA INSTITUIÇÃO PARA ESTE FIM" colSpan={6}>
                            {data.company_representative}
                        </FormField>
                    </tr>
                    <tr>
                        <FormField label="CARGO/QUALIFICAÇÃO" colSpan={4}>
                            {data.company_representative_role}
                        </FormField>
                        <FormField label="CPF" colSpan={1}>
                            {/* Campo CPF do responsável não estava no form original */}
                        </FormField>
                        <FormField label="DDD + TELEFONE" colSpan={1}>
                            {/* Campo Telefone do responsável não estava no form original */}
                        </FormField>
                    </tr>
                    <tr>
                        <FormField label="SUPERVISOR DO ESTÁGIO NA INSTITUIÇÃO CONCEDENTE DA VAGA DE ESTÁGIO" colSpan={6}>
                            {data.company_supervisor}
                        </FormField>
                    </tr>
                    <tr>
                        <FormField label="CARGO/QUALIFICAÇÃO" colSpan={4}>
                            {data.company_supervisor_role}
                        </FormField>
                        <FormField label="CPF" colSpan={1}>
                            {/* Campo CPF do supervisor não estava no form original */}
                        </FormField>
                        <FormField label="DDD + TELEFONE" colSpan={1}>
                            {/* Campo Telefone do supervisor não estava no form original */}
                        </FormField>
                    </tr>
                    <tr>
                        <FormField label="SETOR DE REALIZAÇÃO DO ESTÁGIO" colSpan={6}>
                            {data.company_sector}
                        </FormField>
                    </tr>
                </tbody>
            </FormTable>

            {/* Dados do Estágio */}
            <FormTable>
                <tbody>
                    <tr>
                        <td className="border border-gray-400 p-2 align-top w-1/4">
                            <div className="text-[8pt] font-semibold mb-1">TIPO DE ESTÁGIO</div>
                            <Checkbox checked={data.internship_type === 'obrigatorio'} label="OBRIGATÓRIO" />
                            <Checkbox checked={data.internship_type === 'nao_obrigatorio'} label="NÃO OBRIGATÓRIO" />
                        </td>
                        <td className="border border-gray-400 p-2 align-top w-1/4">
                            <div className="text-[8pt] font-semibold mb-1">FORMA DE ESTÁGIO</div>
                            <Checkbox checked={data.internship_mode === 'presencial'} label="PRESENCIAL" />
                            <Checkbox checked={data.internship_mode === 'remoto'} label="REMOTO" />
                        </td>
                        <FormField label="DATA INICIAL" colSpan={1} className="w-1/6 text-center">
                            {data.start_date}
                        </FormField>
                        <FormField label="CARGA HORÁRIA SEMANAL" colSpan={1} className="w-1/6 text-center">
                            {data.weekly_hours} HORAS
                        </FormField>
                        <FormField label="DATA FINAL PREVISTA" colSpan={1} className="w-1/6 text-center">
                            {data.end_date}
                        </FormField>
                    </tr>
                </tbody>
            </FormTable>

            {/* Horário */}
            <FormTable>
                <thead>
                    <tr>
                        <FormHeaderCell rowSpan={2} className="w-8 rotate-180 text-center" style={{ writingMode: 'vertical-rl' }}>TURNO</FormHeaderCell>
                        <FormHeaderCell colSpan={2} className="text-center">SEGUNDA-FEIRA</FormHeaderCell>
                        <FormHeaderCell colSpan={2} className="text-center">TERÇA-FEIRA</FormHeaderCell>
                        <FormHeaderCell colSpan={2} className="text-center">QUARTA-FEIRA</FormHeaderCell>
                        <FormHeaderCell colSpan={2} className="text-center">QUINTA-FEIRA</FormHeaderCell>
                        <FormHeaderCell colSpan={2} className="text-center">SEXTA-FEIRA</FormHeaderCell>
                        <FormHeaderCell colSpan={2} className="text-center">SÁBADO</FormHeaderCell>
                        <FormHeaderCell colSpan={2} className="text-center">DOMINGO</FormHeaderCell>
                    </tr>
                    <tr>
                        <FormHeaderCell className="text-[8pt] text-center">INÍCIO</FormHeaderCell>
                        <FormHeaderCell className="text-[8pt] text-center">FINAL</FormHeaderCell>
                        <FormHeaderCell className="text-[8pt] text-center">INÍCIO</FormHeaderCell>
                        <FormHeaderCell className="text-[8pt] text-center">FINAL</FormHeaderCell>
                        <FormHeaderCell className="text-[8pt] text-center">INÍCIO</FormHeaderCell>
                        <FormHeaderCell className="text-[8pt] text-center">FINAL</FormHeaderCell>
                        <FormHeaderCell className="text-[8pt] text-center">INÍCIO</FormHeaderCell>
                        <FormHeaderCell className="text-[8pt] text-center">FINAL</FormHeaderCell>
                        <FormHeaderCell className="text-[8pt] text-center">INÍCIO</FormHeaderCell>
                        <FormHeaderCell className="text-[8pt] text-center">FINAL</FormHeaderCell>
                        <FormHeaderCell className="text-[8pt] text-center">INÍCIO</FormHeaderCell>
                        <FormHeaderCell className="text-[8pt] text-center">FINAL</FormHeaderCell>
                        <FormHeaderCell className="text-[8pt] text-center">INÍCIO</FormHeaderCell>
                        <FormHeaderCell className="text-[8pt] text-center">FINAL</FormHeaderCell>
                    </tr>
                </thead>
                <tbody>
                    {['1º', '2º', '3º'].map((turno, index) => (
                        <tr key={index}>
                            <td className="border border-gray-400 text-center font-bold text-[9pt]">{turno}</td>
                            {['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'].map(day => (
                                <React.Fragment key={day}>
                                    <td className="border border-gray-400 text-center text-[9pt] h-6">
                                        {schedule[`${day}_start_${index + 1}`] || ''}
                                    </td>
                                    <td className="border border-gray-400 text-center text-[9pt] h-6">
                                        {schedule[`${day}_end_${index + 1}`] || ''}
                                    </td>
                                </React.Fragment>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </FormTable>

            {/* Assinaturas */}
            <div className="border border-gray-400 mt-4">
                <div className="flex">
                    <div className="flex-1 border-r border-gray-400 p-2">
                        <div className="mb-8">
                            SOLICITAÇÃO EM _____/_____/_______
                        </div>
                        <div className="border-t border-black pt-1 text-center text-[8pt] uppercase mt-8">
                            ASSINATURA DO DISCENTE
                        </div>
                    </div>
                    <div className="flex-1 p-2">
                        <div className="mb-8">
                            AUTORIZAÇÃO EM _____/_____/_______
                        </div>
                        <div className="border-t border-black pt-1 text-center text-[8pt] uppercase mt-8">
                            ASSINATURA DO DOCENTE ORIENTADOR
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
})

InternshipRegistrationDocument.displayName = 'InternshipRegistrationDocument'
