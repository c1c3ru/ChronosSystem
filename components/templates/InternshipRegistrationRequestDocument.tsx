import React, { forwardRef } from 'react'
import { OfficialHeader, FormTable, FormHeaderCell, FormDataCell, FormField } from '@/components/OfficialFormTemplate'

/**
 * Interface de dados para Solicitação de Cadastro no Estágio
 * Baseado no modelo oficial do IFCE anexado
 */
interface InternshipRegistrationRequestData {
    // Dados Pessoais
    nome: string
    cpf: string
    nome_social: string
    curso: string
    matricula: string
    endereco: string
    bairro: string
    municipio_uf: string
    cep: string
    telefone: string
    email_institucional: string
    email_pessoal: string

    // Cor/Raça
    cor_raca: 'amarelo' | 'branco' | 'indigena' | 'pardo' | 'preto' | 'prefiro_nao_declarar'

    // Etnia
    etnia: 'indigena' | 'quilombola' | 'outra' | 'prefiro_nao_declarar'
    etnia_outra?: string
    comunidade_etnia?: string

    // Pessoa com Deficiência
    deficiencia: string[] // Array de deficiências selecionadas

    // Dados de Pessoa Física (se aplicável)
    nome_fantasia_pf?: string
    cnpj_registro_conselho?: string
    endereco_pf?: string
    bairro_pf?: string
    municipio_uf_pf?: string
    cep_pf?: string
    telefone_pf?: string
    email_pf?: string

    // Responsável Legal
    responsavel_legal?: string
    cargo_qualificacao?: string
    cpf_responsavel?: string
    telefone_responsavel?: string

    // Supervisor do Estágio
    supervisor_nome?: string
    supervisor_cargo?: string

    // Setor de Realização
    setor_realizacao?: string

    // Tipo de Estágio
    tipo_estagio: 'obrigatorio' | 'nao_obrigatorio'
    forma_estagio: 'presencial' | 'remoto'

    // Datas e Carga Horária
    data_inicial?: string
    carga_horaria_semanal?: string
    data_final_prevista?: string

    // Horários Semanais
    horarios: {
        segunda_feira: { inicio: string, final: string }
        terca_feira: { inicio: string, final: string }
        quarta_feira: { inicio: string, final: string }
        quinta_feira: { inicio: string, final: string }
        sexta_feira: { inicio: string, final: string }
        sabado: { inicio: string, final: string }
        domingo: { inicio: string, final: string }
    }

    // Turnos
    turnos: {
        primeira: { segunda: string, terca: string, quarta: string, quinta: string, sexta: string, sabado: string, domingo: string }
        segunda: { segunda: string, terca: string, quarta: string, quinta: string, sexta: string, sabado: string, domingo: string }
        terceira: { segunda: string, terca: string, quarta: string, quinta: string, sexta: string, sabado: string, domingo: string }
    }

    // Datas de Solicitação e Autorização
    data_solicitacao?: string
    data_autorizacao?: string
}

interface InternshipRegistrationRequestDocumentProps {
    data: InternshipRegistrationRequestData
}

/**
 * Template do documento "Solicitação de Cadastro no Estágio"
 * Baseado no modelo oficial do IFCE Campus Maracanaú
 */
export const InternshipRegistrationRequestDocument = forwardRef<HTMLDivElement, InternshipRegistrationRequestDocumentProps>(
    ({ data }, ref) => {
        const formatDate = (dateString?: string) => {
            if (!dateString) return '___/___/_____'
            const [year, month, day] = dateString.split('-')
            return `${day}/${month}/${year}`
        }

        const deficienciaLabels: Record<string, string> = {
            'alta_habilidade': 'Alta habilidade/superdotação',
            'deficiencia_auditiva': 'Deficiência auditiva',
            'deficiencia_fisica': 'Deficiência física',
            'deficiencia_intelectual': 'Deficiência intelectual',
            'deficiencia_motora': 'Deficiência motora',
            'deficiencia_visual': 'Deficiência visual/baixa visão',
            'surdocegueira': 'Surdocegueira'
        }

        return (
            <div ref={ref} className="bg-white text-black w-full mx-auto" style={{
                fontSize: '12pt',
                fontFamily: 'Arial, "Times New Roman", sans-serif',
                lineHeight: '1.5',
                padding: '30mm 20mm 20mm 30mm',
                maxWidth: '210mm',
                minHeight: '297mm'
            }}>
                {/* Cabeçalho Oficial */}
                <OfficialHeader
                    title="SOLICITAÇÃO DE CADASTRO NO ESTÁGIO"
                    showLogos={true}
                    campus="Maracanaú"
                    sector="Setor de Acompanhamento de Estágio"
                />

                {/* Dados Pessoais */}
                <FormTable>
                    <tbody>
                        <tr>
                            <FormField label="NOME" colSpan={3}>
                                {data.nome}
                            </FormField>
                            <FormField label="CPF">
                                {data.cpf}
                            </FormField>
                        </tr>
                        <tr>
                            <FormField label="NOME SOCIAL" colSpan={4}>
                                {data.nome_social}
                            </FormField>
                        </tr>
                        <tr>
                            <FormField label="CURSO" colSpan={3}>
                                {data.curso}
                            </FormField>
                            <FormField label="MATRÍCULA">
                                {data.matricula}
                            </FormField>
                        </tr>
                        <tr>
                            <FormField label="ENDEREÇO (LOGRADOURO, NÚMERO E COMPLEMENTO)" colSpan={2}>
                                {data.endereco}
                            </FormField>
                            <FormField label="BAIRRO/DISTRITO">
                                {data.bairro}
                            </FormField>
                        </tr>
                        <tr>
                            <FormField label="MUNICÍPIO-UF">
                                {data.municipio_uf}
                            </FormField>
                            <FormField label="CEP">
                                {data.cep}
                            </FormField>
                            <FormField label="DDD + TELEFONE">
                                {data.telefone}
                            </FormField>
                        </tr>
                        <tr>
                            <FormField label="E-MAIL INSTITUCIONAL" colSpan={2}>
                                {data.email_institucional}
                            </FormField>
                            <FormField label="E-MAIL PESSOAL" colSpan={2}>
                                {data.email_pessoal}
                            </FormField>
                        </tr>
                    </tbody>
                </FormTable>

                {/* Cor/Raça e Etnia */}
                <FormTable>
                    <tbody>
                        <tr>
                            <FormHeaderCell colSpan={2}>COR/RAÇA</FormHeaderCell>
                            <FormHeaderCell colSpan={2}>ETNIA</FormHeaderCell>
                        </tr>
                        <tr>
                            <FormDataCell colSpan={2}>
                                <div className="space-y-1">
                                    {['amarelo', 'branco', 'indigena', 'pardo', 'preto', 'prefiro_nao_declarar'].map((cor) => (
                                        <label key={cor} className="flex items-center gap-2">
                                            <input type="checkbox" checked={data.cor_raca === cor} readOnly />
                                            <span className="text-[11pt]">
                                                {cor === 'amarelo' ? 'Amarelo(a)' :
                                                    cor === 'branco' ? 'Branco(a)' :
                                                        cor === 'indigena' ? 'Indígena' :
                                                            cor === 'pardo' ? 'Pardo(a)' :
                                                                cor === 'preto' ? 'Preto(a)' :
                                                                    'Prefiro não declarar'}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </FormDataCell>
                            <FormDataCell colSpan={2}>
                                <div className="space-y-1">
                                    {['indigena', 'quilombola', 'outra', 'prefiro_nao_declarar'].map((etnia) => (
                                        <label key={etnia} className="flex items-center gap-2">
                                            <input type="checkbox" checked={data.etnia === etnia} readOnly />
                                            <span className="text-[11pt]">
                                                {etnia === 'indigena' ? 'Indígena' :
                                                    etnia === 'quilombola' ? 'Quilombola' :
                                                        etnia === 'outra' ? `Outra: ${data.etnia_outra || '___________'}` :
                                                            'Prefiro não declarar'}
                                            </span>
                                        </label>
                                    ))}
                                    {data.comunidade_etnia && (
                                        <div className="mt-2 text-[10pt]">
                                            Informar comunidade se marcar etnia: {data.comunidade_etnia}
                                        </div>
                                    )}
                                </div>
                            </FormDataCell>
                        </tr>
                    </tbody>
                </FormTable>

                {/* Pessoa com Deficiência */}
                <FormTable>
                    <tbody>
                        <tr>
                            <FormHeaderCell colSpan={4}>APENAS PARA PESSOA COM DEFICIÊNCIA E/OU ALTAS HABILIDADES</FormHeaderCell>
                        </tr>
                        <tr>
                            <FormDataCell colSpan={4}>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(deficienciaLabels).map(([key, label]) => (
                                        <label key={key} className="flex items-center gap-2">
                                            <input type="checkbox" checked={data.deficiencia?.includes(key)} readOnly />
                                            <span className="text-[11pt]">{label}</span>
                                        </label>
                                    ))}
                                </div>
                            </FormDataCell>
                        </tr>
                    </tbody>
                </FormTable>

                {/* Dados da Pessoa Física (se aplicável) */}
                {data.nome_fantasia_pf && (
                    <FormTable>
                        <tbody>
                            <tr>
                                <FormField label="NOME DE FANTASIA OU DE PESSOA FÍSICA" colSpan={4}>
                                    {data.nome_fantasia_pf}
                                </FormField>
                            </tr>
                            <tr>
                                <FormField label="CNPJ OU REGISTRO NO CONSELHO" colSpan={2}>
                                    {data.cnpj_registro_conselho}
                                </FormField>
                                <FormField label="ENDEREÇO (LOGRADOURO, NÚMERO E COMPLEMENTO)" colSpan={2}>
                                    {data.endereco_pf}
                                </FormField>
                            </tr>
                            <tr>
                                <FormField label="BAIRRO">
                                    {data.bairro_pf}
                                </FormField>
                                <FormField label="MUNICÍPIO-UF">
                                    {data.municipio_uf_pf}
                                </FormField>
                                <FormField label="CEP">
                                    {data.cep_pf}
                                </FormField>
                            </tr>
                            <tr>
                                <FormField label="DDD + TELEFONE" colSpan={2}>
                                    {data.telefone_pf}
                                </FormField>
                                <FormField label="E-MAIL" colSpan={2}>
                                    {data.email_pf}
                                </FormField>
                            </tr>
                        </tbody>
                    </FormTable>
                )}

                {/* Responsável Legal e Supervisor */}
                <FormTable>
                    <tbody>
                        <tr>
                            <FormField label="RESPONSÁVEL LEGAL PELA INSTITUIÇÃO PARA ESTE FIM" colSpan={4}>
                                {data.responsavel_legal}
                            </FormField>
                        </tr>
                        <tr>
                            <FormField label="CARGO/QUALIFICAÇÃO" colSpan={2}>
                                {data.cargo_qualificacao}
                            </FormField>
                            <FormField label="CPF">
                                {data.cpf_responsavel}
                            </FormField>
                            <FormField label="DDD + TELEFONE">
                                {data.telefone_responsavel}
                            </FormField>
                        </tr>
                        <tr>
                            <FormField label="SUPERVISOR DO ESTÁGIO NA INSTITUIÇÃO CONCEDENTE DA VAGA DE ESTÁGIO" colSpan={3}>
                                {data.supervisor_nome}
                            </FormField>
                            <FormField label="CPF">
                                {data.supervisor_cargo}
                            </FormField>
                        </tr>
                        <tr>
                            <FormField label="CARGO/QUALIFICAÇÃO" colSpan={2}>
                                {data.cargo_qualificacao}
                            </FormField>
                            <FormField label="SETOR DE REALIZAÇÃO DO ESTÁGIO" colSpan={2}>
                                {data.setor_realizacao}
                            </FormField>
                        </tr>
                    </tbody>
                </FormTable>

                {/* Tipo de Estágio e Datas */}
                <FormTable>
                    <tbody>
                        <tr>
                            <FormHeaderCell colSpan={2}>TIPO DE ESTÁGIO</FormHeaderCell>
                            <FormHeaderCell colSpan={2}>FORMA DE ESTÁGIO</FormHeaderCell>
                        </tr>
                        <tr>
                            <FormDataCell colSpan={2}>
                                <div className="space-y-1">
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" checked={data.tipo_estagio === 'obrigatorio'} readOnly />
                                        <span>OBRIGATÓRIO</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" checked={data.tipo_estagio === 'nao_obrigatorio'} readOnly />
                                        <span>NÃO OBRIGATÓRIO</span>
                                    </label>
                                </div>
                            </FormDataCell>
                            <FormDataCell colSpan={2}>
                                <div className="space-y-1">
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" checked={data.forma_estagio === 'presencial'} readOnly />
                                        <span>PRESENCIAL</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" checked={data.forma_estagio === 'remoto'} readOnly />
                                        <span>REMOTO</span>
                                    </label>
                                </div>
                            </FormDataCell>
                        </tr>
                        <tr>
                            <FormField label="DATA INICIAL">
                                {formatDate(data.data_inicial)}
                            </FormField>
                            <FormField label="CARGA HORÁRIA SEMANAL" colSpan={2}>
                                {data.carga_horaria_semanal} HORAS
                            </FormField>
                            <FormField label="DATA FINAL PREVISTA">
                                {formatDate(data.data_final_prevista)}
                            </FormField>
                        </tr>
                    </tbody>
                </FormTable>

                {/* Tabela de Horários Complexa */}
                <div className="mb-4">
                    <div className="text-[10pt] font-bold mb-2 uppercase">DISTRIBUIÇÃO DA CARGA HORÁRIA SEMANAL</div>
                    <table className="w-full border-collapse border border-black text-[10pt]" style={{ borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th className="border border-black p-1 bg-gray-100" rowSpan={2}>TURNO</th>
                                <th className="border border-black p-1 bg-gray-100" colSpan={2}>SEGUNDA-FEIRA</th>
                                <th className="border border-black p-1 bg-gray-100" colSpan={2}>TERÇA-FEIRA</th>
                                <th className="border border-black p-1 bg-gray-100" colSpan={2}>QUARTA-FEIRA</th>
                                <th className="border border-black p-1 bg-gray-100" colSpan={2}>QUINTA-FEIRA</th>
                                <th className="border border-black p-1 bg-gray-100" colSpan={2}>SEXTA-FEIRA</th>
                                <th className="border border-black p-1 bg-gray-100" colSpan={2}>SÁBADO</th>
                                <th className="border border-black p-1 bg-gray-100" colSpan={2}>DOMINGO</th>
                            </tr>
                            <tr>
                                {['INÍCIO', 'FINAL'].map((label, i) => (
                                    <React.Fragment key={i}>
                                        {Array(7).fill(null).map((_, j) => (
                                            <th key={`${i}-${j}`} className="border border-black p-1 bg-gray-100 text-[9pt]">{label}</th>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {['primeira', 'segunda', 'terceira'].map((turno, idx) => (
                                <tr key={turno}>
                                    <td className="border border-black p-1 font-bold text-center">
                                        {turno === 'primeira' ? '1ª' : turno === 'segunda' ? '2ª' : '3ª'}
                                    </td>
                                    {['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'].map((dia) => {
                                        const horario = data.turnos[turno as keyof typeof data.turnos][dia as keyof typeof data.turnos.primeira]
                                        const [inicio, fim] = horario ? horario.split('-') : ['', '']
                                        return (
                                            <React.Fragment key={dia}>
                                                <td className="border border-black p-1 text-center text-[9pt]">{inicio}</td>
                                                <td className="border border-black p-1 text-center text-[9pt]">{fim}</td>
                                            </React.Fragment>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Datas de Solicitação e Autorização */}
                <FormTable>
                    <tbody>
                        <tr>
                            <FormField label="SOLICITAÇÃO EM" colSpan={2}>
                                {formatDate(data.data_solicitacao)}
                            </FormField>
                            <FormField label="AUTORIZAÇÃO EM" colSpan={2}>
                                {formatDate(data.data_autorizacao)}
                            </FormField>
                        </tr>
                    </tbody>
                </FormTable>

                {/* Assinaturas */}
                <div className="mt-8 space-y-6">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="text-center">
                            <div className="border-t-2 border-black pt-2 mt-16">
                                <div className="text-[10pt] font-bold uppercase">ASSINATURA DO DISCENTE</div>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="border-t-2 border-black pt-2 mt-16">
                                <div className="text-[10pt] font-bold uppercase">ASSINATURA DO DOCENTE ORIENTADOR</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Observação */}
                <div className="mt-6 pt-3 border-t border-gray-400 text-[10pt] italic">
                    <p>
                        <strong>Observação:</strong> As atividades de estágio supervisionado só podem ser <strong>iniciadas após o cadastro</strong> do Termo de Compromisso de Estágio no sistema competente.
                    </p>
                </div>
            </div>
        )
    }
)

InternshipRegistrationRequestDocument.displayName = 'InternshipRegistrationRequestDocument'
