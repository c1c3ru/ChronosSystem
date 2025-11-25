import React, { forwardRef } from 'react'

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

export const InternshipRegistrationRequestDocument = forwardRef<HTMLDivElement, InternshipRegistrationRequestDocumentProps>(({ data }, ref) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return '___/___/_____'
        const [year, month, day] = dateString.split('-')
        return `${day}/${month}/${year}`
    }

    // Componentes auxiliares
    const Label = ({ children }: { children: React.ReactNode }) => (
        <span className="block text-[6pt] font-bold uppercase leading-tight">{children}</span>
    )

    const Value = ({ children }: { children: React.ReactNode }) => (
        <span className="block text-[8pt] leading-tight min-h-[14px]">{children}</span>
    )

    const TableRow = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
        <tr className={className}>{children}</tr>
    )

    const TableCell = ({ children, colSpan = 1, className = '', style = {} }: { children: React.ReactNode, colSpan?: number, className?: string, style?: React.CSSProperties }) => (
        <td colSpan={colSpan} className={`border border-black px-1 py-0.5 align-top ${className}`} style={style}>
            {children}
        </td>
    )

    const SectionHeader = ({ title }: { title: string }) => (
        <div className="w-full bg-gray-200 border border-black border-b-0 text-center font-bold text-[8pt] py-0.5 uppercase">
            {title}
        </div>
    )

    const Checkbox = ({ checked, label }: { checked: boolean, label: string }) => (
        <div className="flex items-center mr-4 mb-1">
            <div className={`w-3 h-3 border border-black mr-1 flex items-center justify-center text-[8px] leading-none`}>
                {checked ? 'X' : ''}
            </div>
            <span className="text-[8pt]">{label}</span>
        </div>
    )

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
        <div ref={ref} className="bg-white text-black font-sans box-border mx-auto" style={{ width: '210mm', padding: '10mm' }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                    @media print {
                        @page { margin: 10mm; size: A4; }
                        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    }
                    .official-table { width: 100%; border-collapse: collapse; border: 1px solid black; font-size: 8pt; margin-bottom: 10px; }
                    .official-table td { border: 1px solid black; padding: 2px 4px; vertical-align: top; }
                `
            }} />

            {/* Cabeçalho */}
            <div className="flex items-center justify-between mb-4">
                <img src="/assets/logoifce.png" alt="Logo IFCE" className="h-16 object-contain" />
                <div className="text-center flex-1 px-4">
                    <h1 className="font-bold text-[10pt]">PRÓ-REITORIA DE EXTENSÃO</h1>
                    <h2 className="text-[9pt]">COORDENAÇÃO DE ESTÁGIOS E ACOMPANHAMENTO DE EGRESSOS</h2>
                    <h3 className="text-[9pt] mt-2">IFCE Campus Maracanaú</h3>
                    <h4 className="text-[9pt]">Setor de Acompanhamento de Estágio</h4>
                </div>
                <img src="/assets/brasao.png" alt="Brasão Brasil" className="h-16 object-contain" />
            </div>

            <h1 className="text-center font-bold text-[12pt] mb-4 uppercase">SOLICITAÇÃO DE CADASTRO NO ESTÁGIO</h1>

            {/* Dados Pessoais */}
            <table className="official-table">
                <tbody>
                    <TableRow>
                        <TableCell colSpan={3}>
                            <Label>NOME</Label>
                            <Value>{data.nome}</Value>
                        </TableCell>
                        <TableCell colSpan={1}>
                            <Label>CPF</Label>
                            <Value>{data.cpf}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Label>NOME SOCIAL</Label>
                            <Value>{data.nome_social}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={3}>
                            <Label>CURSO</Label>
                            <Value>{data.curso}</Value>
                        </TableCell>
                        <TableCell colSpan={1}>
                            <Label>MATRÍCULA</Label>
                            <Value>{data.matricula}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={2}>
                            <Label>ENDEREÇO (LOGRADOURO, NÚMERO E COMPLEMENTO)</Label>
                            <Value>{data.endereco}</Value>
                        </TableCell>
                        <TableCell colSpan={2}>
                            <Label>BAIRRO/DISTRITO</Label>
                            <Value>{data.bairro}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={1}>
                            <Label>MUNICÍPIO-UF</Label>
                            <Value>{data.municipio_uf}</Value>
                        </TableCell>
                        <TableCell colSpan={1}>
                            <Label>CEP</Label>
                            <Value>{data.cep}</Value>
                        </TableCell>
                        <TableCell colSpan={2}>
                            <Label>DDD + TELEFONE</Label>
                            <Value>{data.telefone}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={2}>
                            <Label>E-MAIL INSTITUCIONAL</Label>
                            <Value>{data.email_institucional}</Value>
                        </TableCell>
                        <TableCell colSpan={2}>
                            <Label>E-MAIL PESSOAL</Label>
                            <Value>{data.email_pessoal}</Value>
                        </TableCell>
                    </TableRow>
                </tbody>
            </table>

            {/* Cor/Raça e Etnia */}
            <table className="official-table">
                <thead>
                    <tr>
                        <th className="border border-black bg-gray-200 p-1 text-[8pt]" colSpan={2}>COR/RAÇA</th>
                        <th className="border border-black bg-gray-200 p-1 text-[8pt]" colSpan={2}>ETNIA</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-black p-2 align-top w-1/2" colSpan={2}>
                            <div className="flex flex-wrap">
                                {['amarelo', 'branco', 'indigena', 'pardo', 'preto', 'prefiro_nao_declarar'].map((cor) => (
                                    <Checkbox
                                        key={cor}
                                        checked={data.cor_raca === cor}
                                        label={cor === 'amarelo' ? 'Amarelo(a)' :
                                            cor === 'branco' ? 'Branco(a)' :
                                                cor === 'indigena' ? 'Indígena' :
                                                    cor === 'pardo' ? 'Pardo(a)' :
                                                        cor === 'preto' ? 'Preto(a)' :
                                                            'Prefiro não declarar'}
                                    />
                                ))}
                            </div>
                        </td>
                        <td className="border border-black p-2 align-top w-1/2" colSpan={2}>
                            <div className="flex flex-wrap">
                                {['indigena', 'quilombola', 'outra', 'prefiro_nao_declarar'].map((etnia) => (
                                    <Checkbox
                                        key={etnia}
                                        checked={data.etnia === etnia}
                                        label={etnia === 'indigena' ? 'Indígena' :
                                            etnia === 'quilombola' ? 'Quilombola' :
                                                etnia === 'outra' ? `Outra: ${data.etnia_outra || '___________'}` :
                                                    'Prefiro não declarar'}
                                    />
                                ))}
                            </div>
                            {data.comunidade_etnia && (
                                <div className="mt-1 text-[8pt]">
                                    Informar comunidade se marcar etnia: {data.comunidade_etnia}
                                </div>
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Pessoa com Deficiência */}
            <SectionHeader title="APENAS PARA PESSOA COM DEFICIÊNCIA E/OU ALTAS HABILIDADES" />
            <div className="border border-black p-2 mb-4">
                <div className="grid grid-cols-2 gap-1">
                    {Object.entries(deficienciaLabels).map(([key, label]) => (
                        <Checkbox
                            key={key}
                            checked={data.deficiencia?.includes(key)}
                            label={label}
                        />
                    ))}
                </div>
            </div>

            {/* Dados da Pessoa Física (se aplicável) */}
            {data.nome_fantasia_pf && (
                <>
                    <SectionHeader title="DADOS DA CONCEDENTE (PESSOA FÍSICA)" />
                    <table className="official-table">
                        <tbody>
                            <TableRow>
                                <TableCell colSpan={4}>
                                    <Label>NOME DE FANTASIA OU DE PESSOA FÍSICA</Label>
                                    <Value>{data.nome_fantasia_pf}</Value>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={2}>
                                    <Label>CNPJ OU REGISTRO NO CONSELHO</Label>
                                    <Value>{data.cnpj_registro_conselho}</Value>
                                </TableCell>
                                <TableCell colSpan={2}>
                                    <Label>ENDEREÇO (LOGRADOURO, NÚMERO E COMPLEMENTO)</Label>
                                    <Value>{data.endereco_pf}</Value>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={1}>
                                    <Label>BAIRRO</Label>
                                    <Value>{data.bairro_pf}</Value>
                                </TableCell>
                                <TableCell colSpan={1}>
                                    <Label>MUNICÍPIO-UF</Label>
                                    <Value>{data.municipio_uf_pf}</Value>
                                </TableCell>
                                <TableCell colSpan={2}>
                                    <Label>CEP</Label>
                                    <Value>{data.cep_pf}</Value>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={2}>
                                    <Label>DDD + TELEFONE</Label>
                                    <Value>{data.telefone_pf}</Value>
                                </TableCell>
                                <TableCell colSpan={2}>
                                    <Label>E-MAIL</Label>
                                    <Value>{data.email_pf}</Value>
                                </TableCell>
                            </TableRow>
                        </tbody>
                    </table>
                </>
            )}

            {/* Responsável Legal e Supervisor */}
            <table className="official-table">
                <tbody>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Label>RESPONSÁVEL LEGAL PELA INSTITUIÇÃO PARA ESTE FIM</Label>
                            <Value>{data.responsavel_legal}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={2}>
                            <Label>CARGO/QUALIFICAÇÃO</Label>
                            <Value>{data.cargo_qualificacao}</Value>
                        </TableCell>
                        <TableCell colSpan={1}>
                            <Label>CPF</Label>
                            <Value>{data.cpf_responsavel}</Value>
                        </TableCell>
                        <TableCell colSpan={1}>
                            <Label>DDD + TELEFONE</Label>
                            <Value>{data.telefone_responsavel}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={3}>
                            <Label>SUPERVISOR DO ESTÁGIO NA INSTITUIÇÃO CONCEDENTE DA VAGA DE ESTÁGIO</Label>
                            <Value>{data.supervisor_nome}</Value>
                        </TableCell>
                        <TableCell colSpan={1}>
                            <Label>CARGO/QUALIFICAÇÃO</Label>
                            <Value>{data.supervisor_cargo}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Label>SETOR DE REALIZAÇÃO DO ESTÁGIO</Label>
                            <Value>{data.setor_realizacao}</Value>
                        </TableCell>
                    </TableRow>
                </tbody>
            </table>

            {/* Tipo de Estágio e Datas */}
            <table className="official-table text-center">
                <thead>
                    <tr>
                        <th className="border border-black bg-gray-200 p-1 text-[8pt]" colSpan={2}>TIPO DE ESTÁGIO</th>
                        <th className="border border-black bg-gray-200 p-1 text-[8pt]" colSpan={2}>FORMA DE ESTÁGIO</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-black p-2 align-top w-1/2" colSpan={2}>
                            <div className="flex justify-center gap-4">
                                <Checkbox checked={data.tipo_estagio === 'obrigatorio'} label="OBRIGATÓRIO" />
                                <Checkbox checked={data.tipo_estagio === 'nao_obrigatorio'} label="NÃO OBRIGATÓRIO" />
                            </div>
                        </td>
                        <td className="border border-black p-2 align-top w-1/2" colSpan={2}>
                            <div className="flex justify-center gap-4">
                                <Checkbox checked={data.forma_estagio === 'presencial'} label="PRESENCIAL" />
                                <Checkbox checked={data.forma_estagio === 'remoto'} label="REMOTO" />
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-black p-2 align-top w-1/3">
                            <Label>DATA INICIAL</Label>
                            <div className="text-[9pt] mt-1">{formatDate(data.data_inicial)}</div>
                        </td>
                        <td className="border border-black p-2 align-top w-1/3" colSpan={2}>
                            <Label>CARGA HORÁRIA SEMANAL</Label>
                            <div className="text-[9pt] mt-1">{data.carga_horaria_semanal} HORAS</div>
                        </td>
                        <td className="border border-black p-2 align-top w-1/3">
                            <Label>DATA FINAL PREVISTA</Label>
                            <div className="text-[9pt] mt-1">{formatDate(data.data_final_prevista)}</div>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Tabela de Horários Complexa */}
            <div className="mb-4">
                <div className="text-[8pt] font-bold mb-1 uppercase text-center bg-gray-200 border border-black border-b-0 p-1">DISTRIBUIÇÃO DA CARGA HORÁRIA SEMANAL</div>
                <table className="w-full border-collapse border border-black text-[8pt]">
                    <thead>
                        <tr>
                            <th className="border border-black p-1 bg-gray-100 w-16" rowSpan={2}>TURNO</th>
                            <th className="border border-black p-1 bg-gray-100" colSpan={2}>SEGUNDA-FEIRA</th>
                            <th className="border border-black p-1 bg-gray-100" colSpan={2}>TERÇA-FEIRA</th>
                            <th className="border border-black p-1 bg-gray-100" colSpan={2}>QUARTA-FEIRA</th>
                            <th className="border border-black p-1 bg-gray-100" colSpan={2}>QUINTA-FEIRA</th>
                            <th className="border border-black p-1 bg-gray-100" colSpan={2}>SEXTA-FEIRA</th>
                            <th className="border border-black p-1 bg-gray-100" colSpan={2}>SÁBADO</th>
                            <th className="border border-black p-1 bg-gray-100" colSpan={2}>DOMINGO</th>
                        </tr>
                        <tr>
                            {Array(7).fill(null).map((_, i) => (
                                <React.Fragment key={i}>
                                    <th className="border border-black p-0.5 bg-gray-100 text-[6pt]">INÍCIO</th>
                                    <th className="border border-black p-0.5 bg-gray-100 text-[6pt]">FINAL</th>
                                </React.Fragment>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {['primeira', 'segunda', 'terceira'].map((turno, idx) => (
                            <tr key={turno}>
                                <td className="border border-black p-1 font-bold text-center bg-gray-50">
                                    {turno === 'primeira' ? '1ª' : turno === 'segunda' ? '2ª' : '3ª'}
                                </td>
                                {['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'].map((dia) => {
                                    const horario = data.turnos[turno as keyof typeof data.turnos][dia as keyof typeof data.turnos.primeira]
                                    const [inicio, fim] = horario ? horario.split('-') : ['', '']
                                    return (
                                        <React.Fragment key={dia}>
                                            <td className="border border-black p-1 text-center text-[8pt] h-6">{inicio}</td>
                                            <td className="border border-black p-1 text-center text-[8pt] h-6">{fim}</td>
                                        </React.Fragment>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Datas de Solicitação e Autorização */}
            <table className="official-table">
                <tbody>
                    <TableRow>
                        <TableCell colSpan={2}>
                            <Label>SOLICITAÇÃO EM</Label>
                            <Value>{formatDate(data.data_solicitacao)}</Value>
                        </TableCell>
                        <TableCell colSpan={2}>
                            <Label>AUTORIZAÇÃO EM</Label>
                            <Value>{formatDate(data.data_autorizacao)}</Value>
                        </TableCell>
                    </TableRow>
                </tbody>
            </table>

            {/* Assinaturas */}
            <div className="grid grid-cols-2 gap-8 mt-8">
                <div className="text-center">
                    <div className="border-t border-black pt-1 w-3/4 mx-auto text-[8pt]">
                        <strong>ASSINATURA DO DISCENTE</strong>
                    </div>
                </div>
                <div className="text-center">
                    <div className="border-t border-black pt-1 w-3/4 mx-auto text-[8pt]">
                        <strong>ASSINATURA DO DOCENTE ORIENTADOR</strong>
                    </div>
                </div>
            </div>

            {/* Observação */}
            <div className="mt-8 pt-2 border-t border-black text-[9pt] italic">
                <p>
                    <strong>Observação:</strong> As atividades de estágio supervisionado só podem ser <strong>iniciadas após o cadastro</strong> do Termo de Compromisso de Estágio no sistema competente.
                </p>
            </div>

        </div>
    )
})

InternshipRegistrationRequestDocument.displayName = 'InternshipRegistrationRequestDocument'
