import React, { forwardRef } from 'react'

interface RealizationTermDocumentProps {
    data: {
        // Dados do Estagiário
        student_name: string
        student_cpf: string
        student_rg: string
        student_course: string
        student_enrollment: string

        // Dados da Empresa
        company_name: string
        company_cnpj: string
        company_address: string
        company_supervisor: string

        // Dados do Estágio
        internship_start_date: string
        internship_end_date: string
        total_hours: string
        weekly_hours: string

        // Atividades Desenvolvidas
        activities: string

        // Avaliação do Desempenho
        performance_evaluation: string

        // Cidade e Data
        city: string
        date_day: string
        date_month: string
        date_year: string
    }
}

export const RealizationTermDocument = forwardRef<HTMLDivElement, RealizationTermDocumentProps>(({ data }, ref) => {
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

            <h1 className="text-center font-bold text-[12pt] mb-8 uppercase">TERMO DE REALIZAÇÃO DE ESTÁGIO</h1>

            {/* Dados do Estagiário */}
            <SectionHeader title="DADOS DO ESTAGIÁRIO" />
            <table className="official-table">
                <tbody>
                    <TableRow>
                        <TableCell colSpan={3}>
                            <Label>NOME COMPLETO</Label>
                            <Value>{data.student_name}</Value>
                        </TableCell>
                        <TableCell colSpan={1}>
                            <Label>CPF</Label>
                            <Value>{data.student_cpf}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={1}>
                            <Label>RG</Label>
                            <Value>{data.student_rg}</Value>
                        </TableCell>
                        <TableCell colSpan={2}>
                            <Label>CURSO</Label>
                            <Value>{data.student_course}</Value>
                        </TableCell>
                        <TableCell colSpan={1}>
                            <Label>MATRÍCULA</Label>
                            <Value>{data.student_enrollment}</Value>
                        </TableCell>
                    </TableRow>
                </tbody>
            </table>

            {/* Dados da Empresa */}
            <SectionHeader title="DADOS DA EMPRESA CONCEDENTE" />
            <table className="official-table">
                <tbody>
                    <TableRow>
                        <TableCell colSpan={3}>
                            <Label>RAZÃO SOCIAL</Label>
                            <Value>{data.company_name}</Value>
                        </TableCell>
                        <TableCell colSpan={1}>
                            <Label>CNPJ</Label>
                            <Value>{data.company_cnpj}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Label>ENDEREÇO</Label>
                            <Value>{data.company_address}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Label>SUPERVISOR DO ESTÁGIO</Label>
                            <Value>{data.company_supervisor}</Value>
                        </TableCell>
                    </TableRow>
                </tbody>
            </table>

            {/* Dados do Estágio */}
            <SectionHeader title="DADOS DO ESTÁGIO REALIZADO" />
            <table className="official-table text-center">
                <tbody>
                    <TableRow>
                        <TableCell colSpan={1}>
                            <Label>DATA DE INÍCIO</Label>
                            <Value>{formatDate(data.internship_start_date)}</Value>
                        </TableCell>
                        <TableCell colSpan={1}>
                            <Label>DATA DE TÉRMINO</Label>
                            <Value>{formatDate(data.internship_end_date)}</Value>
                        </TableCell>
                        <TableCell colSpan={1}>
                            <Label>CARGA HORÁRIA TOTAL</Label>
                            <Value>{data.total_hours} HORAS</Value>
                        </TableCell>
                        <TableCell colSpan={1}>
                            <Label>CARGA HORÁRIA SEMANAL</Label>
                            <Value>{data.weekly_hours} HORAS</Value>
                        </TableCell>
                    </TableRow>
                </tbody>
            </table>

            {/* Atividades Desenvolvidas */}
            <SectionHeader title="ATIVIDADES DESENVOLVIDAS DURANTE O ESTÁGIO" />
            <div className="border border-black p-4 text-[9pt] whitespace-pre-wrap min-h-[150px] text-justify mb-4">
                {data.activities}
            </div>

            {/* Avaliação do Desempenho */}
            <SectionHeader title="AVALIAÇÃO DO DESEMPENHO DO ESTAGIÁRIO" />
            <div className="border border-black p-4 text-[9pt] whitespace-pre-wrap min-h-[100px] text-justify mb-8">
                {data.performance_evaluation}
            </div>

            {/* Declaração */}
            <div className="mb-8 text-justify text-[10pt] leading-relaxed">
                Declaramos, para os devidos fins, que o(a) estagiário(a) acima identificado(a) concluiu com êxito as atividades de estágio no período de <strong>{formatDate(data.internship_start_date)}</strong> a <strong>{formatDate(data.internship_end_date)}</strong>, cumprindo a carga horária total de <strong>{data.total_hours} horas</strong>, conforme estabelecido no Termo de Compromisso de Estágio.
            </div>

            <div className="text-right mb-16 text-[10pt]">
                {data.city || 'Fortaleza'} - CE, {data.date_day || '___'} de {data.date_month || '_______________'} de {data.date_year || '20___'}.
            </div>

            {/* Assinaturas */}
            <div className="space-y-12">
                <div className="text-center">
                    <div className="border-t border-black pt-1 w-2/3 mx-auto text-[8pt]">
                        <strong>{data.company_name || 'EMPRESA CONCEDENTE'}</strong><br />
                        {data.company_supervisor}<br />
                        Supervisor do Estágio
                    </div>
                </div>

                <div className="text-center">
                    <div className="border-t border-black pt-1 w-2/3 mx-auto text-[8pt]">
                        <strong>{data.student_name || 'ESTAGIÁRIO(A)'}</strong><br />
                        CPF: {data.student_cpf}
                    </div>
                </div>

                <div className="text-center">
                    <div className="border-t border-black pt-1 w-2/3 mx-auto text-[8pt]">
                        <strong>INSTITUIÇÃO DE ENSINO - IFCE CAMPUS MARACANAÚ</strong><br />
                        Coordenador de Estágios
                    </div>
                </div>
            </div>

        </div>
    )
})

RealizationTermDocument.displayName = 'RealizationTermDocument'
