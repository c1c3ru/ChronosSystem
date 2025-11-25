import React, { forwardRef } from 'react'

interface EquivalenceRequestDocumentProps {
    data: {
        // Discente
        student_name: string
        student_enrollment: string
        student_course: string
        student_address: string
        student_phone: string
        student_email: string

        // Empresa
        company_name: string
        company_address: string
        company_phone: string
        company_email: string
        company_supervisor: string // Chefe Imediato

        // Atividades
        activities: string

        // Período
        start_date: string
        end_date: string
        total_hours: string

        // Documentos Anexos
        doc_work_card: string
        doc_service_declaration: string
        doc_activities_declaration: string
        doc_other: string
        doc_other_desc: string
    }
}

export const EquivalenceRequestDocument = forwardRef<HTMLDivElement, EquivalenceRequestDocumentProps>(({ data }, ref) => {
    const formatDate = (dateString: string) => {
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
        <div className="flex items-center mb-1">
            <div className={`w-3 h-3 border border-black mr-2 flex items-center justify-center text-[8px] leading-none`}>
                {checked ? 'X' : ''}
            </div>
            <span className="text-[8pt]">{label}</span>
        </div>
    )

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

            <h1 className="text-center font-bold text-[12pt] mb-4 uppercase">SOLICITAÇÃO DE EQUIVALÊNCIA DE ESTÁGIO</h1>

            <div className="mb-4 text-justify indent-8 text-[9pt]">
                Ilmo. Sr. Coordenador de Estágios do IFCE, venho requerer a V.Sa. a equivalência da atividade profissional que exerço/exerci, como Estágio Curricular Supervisionado, conforme documentação anexa.
            </div>

            {/* Dados do Discente */}
            <SectionHeader title="DADOS DO DISCENTE" />
            <table className="official-table">
                <tbody>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Label>NOME</Label>
                            <Value>{data.student_name}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={1}>
                            <Label>MATRÍCULA</Label>
                            <Value>{data.student_enrollment}</Value>
                        </TableCell>
                        <TableCell colSpan={3}>
                            <Label>CURSO</Label>
                            <Value>{data.student_course}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Label>ENDEREÇO</Label>
                            <Value>{data.student_address}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={2}>
                            <Label>TELEFONE</Label>
                            <Value>{data.student_phone}</Value>
                        </TableCell>
                        <TableCell colSpan={2}>
                            <Label>E-MAIL</Label>
                            <Value>{data.student_email}</Value>
                        </TableCell>
                    </TableRow>
                </tbody>
            </table>

            {/* Dados da Empresa */}
            <SectionHeader title="DADOS DA EMPRESA / INSTITUIÇÃO" />
            <table className="official-table">
                <tbody>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Label>NOME DA EMPRESA</Label>
                            <Value>{data.company_name}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Label>ENDEREÇO</Label>
                            <Value>{data.company_address}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={2}>
                            <Label>TELEFONE</Label>
                            <Value>{data.company_phone}</Value>
                        </TableCell>
                        <TableCell colSpan={2}>
                            <Label>E-MAIL</Label>
                            <Value>{data.company_email}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Label>CHEFE IMEDIATO</Label>
                            <Value>{data.company_supervisor}</Value>
                        </TableCell>
                    </TableRow>
                </tbody>
            </table>

            {/* Atividades */}
            <SectionHeader title="DESCRIÇÃO DAS ATIVIDADES DESENVOLVIDAS" />
            <div className="border border-black p-2 text-[9pt] whitespace-pre-wrap min-h-[80px] text-justify mb-4">
                {data.activities}
            </div>

            {/* Período */}
            <table className="official-table text-center">
                <thead>
                    <tr>
                        <th className="border border-black bg-gray-200 p-1 text-[8pt]" colSpan={3}>PERÍODO DE REALIZAÇÃO</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-black p-2 align-top w-1/3">
                            <Label>DATA INICIAL</Label>
                            <div className="text-[9pt] mt-1">{formatDate(data.start_date)}</div>
                        </td>
                        <td className="border border-black p-2 align-top w-1/3">
                            <Label>DATA FINAL</Label>
                            <div className="text-[9pt] mt-1">{formatDate(data.end_date)}</div>
                        </td>
                        <td className="border border-black p-2 align-top w-1/3">
                            <Label>CARGA HORÁRIA TOTAL</Label>
                            <div className="text-[9pt] mt-1">{data.total_hours} HORAS</div>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Documentos Anexos */}
            <div className="border border-black p-2 mb-4 text-[9pt]">
                <div className="font-bold mb-2">DOCUMENTOS ANEXOS (CÓPIAS AUTENTICADAS OU COM O ORIGINAL):</div>
                <Checkbox checked={data.doc_work_card === 'true'} label="Carteira de Trabalho (páginas da foto, qualificação civil e contrato de trabalho)" />
                <Checkbox checked={data.doc_service_declaration === 'true'} label="Declaração de Tempo de Serviço (em papel timbrado da empresa)" />
                <Checkbox checked={data.doc_activities_declaration === 'true'} label="Declaração de Atividades Profissionais (com descrição detalhada)" />
                <div className="flex items-center">
                    <Checkbox checked={data.doc_other === 'true'} label="Outros:" />
                    <span className="ml-2 border-b border-black flex-1 text-[9pt] italic">{data.doc_other_desc}</span>
                </div>
            </div>

            {/* Assinatura do Aluno */}
            <div className="text-center mt-8 mb-8">
                <div className="border-t border-black pt-1 w-1/2 mx-auto text-[8pt]">
                    ASSINATURA DO DISCENTE
                </div>
            </div>

            {/* Parecer da Coordenação */}
            <div className="border-2 border-black p-4 mt-4">
                <div className="font-bold text-center mb-4 bg-gray-200 p-1 border border-black text-[9pt]">PARECER DA COORDENAÇÃO DE ESTÁGIOS</div>

                <div className="flex justify-center gap-8 mb-4 text-[9pt]">
                    <div className="flex items-center">
                        <div className="w-4 h-4 border border-black mr-2"></div>
                        <span>DEFERIDO</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 border border-black mr-2"></div>
                        <span>INDEFERIDO</span>
                    </div>
                </div>

                <div className="mb-2 font-bold text-[9pt]">JUSTIFICATIVA:</div>
                <div className="border-b border-black h-5 mb-2"></div>
                <div className="border-b border-black h-5 mb-2"></div>
                <div className="border-b border-black h-5 mb-8"></div>

                <div className="text-center">
                    <div className="border-t border-black pt-1 w-1/2 mx-auto text-[8pt]">
                        COORDENADOR DE ESTÁGIOS
                    </div>
                    <div className="text-[8pt] mt-1">DATA: ___/___/_____</div>
                </div>
            </div>

        </div>
    )
})

EquivalenceRequestDocument.displayName = 'EquivalenceRequestDocument'
