import React, { forwardRef } from 'react'

interface RescissionTermDocumentProps {
    data: {
        // Dados do Estagiário
        student_name: string
        student_cpf: string
        student_rg: string
        student_course: string
        student_enrollment: string
        student_address: string
        student_phone: string
        student_email: string

        // Dados da Empresa
        company_name: string
        company_cnpj: string
        company_address: string
        company_phone: string
        company_representative: string
        company_representative_cpf: string

        // Dados do Estágio
        internship_start_date: string
        internship_end_date: string
        rescission_date: string
        rescission_reason: string

        // Dados do Termo de Compromisso Original
        original_term_date: string

        // Cidade e Data
        city: string
        date_day: string
        date_month: string
        date_year: string
    }
}

export const RescissionTermDocument = forwardRef<HTMLDivElement, RescissionTermDocumentProps>(({ data }, ref) => {
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

            <h1 className="text-center font-bold text-[12pt] mb-8 uppercase">TERMO DE RESCISÃO DE CONTRATO DE ESTÁGIO</h1>

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
                        <TableCell colSpan={2}>
                            <Label>TELEFONE</Label>
                            <Value>{data.company_phone}</Value>
                        </TableCell>
                        <TableCell colSpan={2}>
                            <Label>REPRESENTANTE LEGAL</Label>
                            <Value>{data.company_representative}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Label>CPF DO REPRESENTANTE</Label>
                            <Value>{data.company_representative_cpf}</Value>
                        </TableCell>
                    </TableRow>
                </tbody>
            </table>

            {/* Dados do Estágio */}
            <SectionHeader title="DADOS DO ESTÁGIO" />
            <table className="official-table">
                <tbody>
                    <TableRow>
                        <TableCell colSpan={2}>
                            <Label>DATA DE INÍCIO DO ESTÁGIO</Label>
                            <Value>{formatDate(data.internship_start_date)}</Value>
                        </TableCell>
                        <TableCell colSpan={2}>
                            <Label>DATA PREVISTA DE TÉRMINO</Label>
                            <Value>{formatDate(data.internship_end_date)}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={2}>
                            <Label>DATA DO TERMO DE COMPROMISSO ORIGINAL</Label>
                            <Value>{formatDate(data.original_term_date)}</Value>
                        </TableCell>
                        <TableCell colSpan={2}>
                            <Label>DATA DA RESCISÃO</Label>
                            <Value>{formatDate(data.rescission_date)}</Value>
                        </TableCell>
                    </TableRow>
                </tbody>
            </table>

            {/* Motivo da Rescisão */}
            <SectionHeader title="MOTIVO DA RESCISÃO" />
            <div className="border border-black p-4 text-[9pt] whitespace-pre-wrap min-h-[150px] text-justify mb-8">
                {data.rescission_reason}
            </div>

            {/* Declaração */}
            <div className="mb-8 text-justify text-[10pt] leading-relaxed">
                Por meio deste instrumento, as partes acima qualificadas declaram rescindido, de comum acordo, o Termo de Compromisso de Estágio firmado em <strong>{formatDate(data.original_term_date)}</strong>, a partir da data de <strong>{formatDate(data.rescission_date)}</strong>, ficando as partes desobrigadas de quaisquer responsabilidades decorrentes do referido termo a partir desta data.
            </div>

            <div className="text-right mb-16 text-[10pt]">
                {data.city || 'Fortaleza'} - CE, {data.date_day || '___'} de {data.date_month || '_______________'} de {data.date_year || '20___'}.
            </div>

            {/* Assinaturas */}
            <div className="space-y-12">
                <div className="text-center">
                    <div className="border-t border-black pt-1 w-2/3 mx-auto text-[8pt]">
                        <strong>{data.student_name || 'ESTAGIÁRIO(A)'}</strong><br />
                        CPF: {data.student_cpf}
                    </div>
                </div>

                <div className="text-center">
                    <div className="border-t border-black pt-1 w-2/3 mx-auto text-[8pt]">
                        <strong>{data.company_name || 'EMPRESA CONCEDENTE'}</strong><br />
                        {data.company_representative}<br />
                        CPF: {data.company_representative_cpf}
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

RescissionTermDocument.displayName = 'RescissionTermDocument'
