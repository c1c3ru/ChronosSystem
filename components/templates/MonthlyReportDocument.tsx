import React, { forwardRef } from 'react'

interface MonthlyReportDocumentProps {
    data: {
        student_name: string
        student_course: string
        student_enrollment: string
        supervisor_name: string
        advisor_name: string
        period_start: string
        period_end: string
        hours_month: string
        hours_total: string
        activities: string
        difficulties: string
        solutions: string
    }
}

export const MonthlyReportDocument = forwardRef<HTMLDivElement, MonthlyReportDocumentProps>(({ data }, ref) => {
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

            <h1 className="text-center font-bold text-[12pt] mb-8 uppercase">RELATÓRIO MENSAL DE ATIVIDADES</h1>

            {/* Identificação */}
            <table className="official-table">
                <tbody>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Label>DISCENTE ESTAGIÁRIO(A)</Label>
                            <Value>{data.student_name}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={3}>
                            <Label>CURSO</Label>
                            <Value>{data.student_course}</Value>
                        </TableCell>
                        <TableCell>
                            <Label>MATRÍCULA</Label>
                            <Value>{data.student_enrollment}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Label>SUPERVISOR DO ESTÁGIO</Label>
                            <Value>{data.supervisor_name}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Label>DOCENTE ORIENTADOR</Label>
                            <Value>{data.advisor_name}</Value>
                        </TableCell>
                    </TableRow>
                </tbody>
            </table>

            {/* Período e Carga Horária */}
            <table className="official-table text-center">
                <thead>
                    <tr>
                        <th className="border border-black bg-gray-200 p-1 text-[8pt]" colSpan={2}>PERÍODO</th>
                        <th className="border border-black bg-gray-200 p-1 text-[8pt]" colSpan={2}>CARGA HORÁRIA</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-black p-2 align-top w-1/4">
                            <Label>DATA INICIAL PARCIAL</Label>
                            <div className="text-[9pt] mt-1">{formatDate(data.period_start)}</div>
                        </td>
                        <td className="border border-black p-2 align-top w-1/4">
                            <Label>DATA FINAL PARCIAL</Label>
                            <div className="text-[9pt] mt-1">{formatDate(data.period_end)}</div>
                        </td>
                        <td className="border border-black p-2 align-top w-1/4">
                            <Label>ESTAGIADA NO PERÍODO</Label>
                            <div className="text-[9pt] mt-1">{data.hours_month} HORAS</div>
                        </td>
                        <td className="border border-black p-2 align-top w-1/4">
                            <Label>ACUMULADA NO PERÍODO</Label>
                            <div className="text-[9pt] mt-1">{data.hours_total} HORAS</div>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Atividades */}
            <SectionHeader title="PRINCIPAIS ATIVIDADES DESENVOLVIDAS NO ESTÁGIO DURANTE O PERÍODO" />
            <div className="border border-black p-4 text-[9pt] whitespace-pre-wrap min-h-[200px] text-justify mb-4">
                {data.activities}
            </div>

            {/* Dificuldades e Soluções */}
            <table className="official-table">
                <thead>
                    <tr>
                        <th className="border border-black bg-gray-200 p-1 text-[8pt] w-1/2">DIFICULDADES ENCONTRADAS</th>
                        <th className="border border-black bg-gray-200 p-1 text-[8pt] w-1/2">SOLUÇÕES ADOTADAS</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-black p-2 align-top h-[150px] whitespace-pre-wrap w-1/2">
                            {data.difficulties}
                        </td>
                        <td className="border border-black p-2 align-top h-[150px] whitespace-pre-wrap w-1/2">
                            {data.solutions}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Assinaturas */}
            <table className="official-table">
                <thead>
                    <tr>
                        <th className="border border-black bg-gray-200 p-1 text-[8pt] w-3/4">ASSINATURA</th>
                        <th className="border border-black bg-gray-200 p-1 text-[8pt] w-1/4">DATA</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-black p-2 align-bottom h-16 relative">
                            <div className="absolute bottom-1 left-2 text-[8pt] font-bold">DISCENTE ESTAGIÁRIO</div>
                        </td>
                        <td className="border border-black p-2 align-bottom text-center">
                            ___/___/_____
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-black p-2 align-bottom h-16 relative">
                            <div className="absolute bottom-1 left-2 text-[8pt] font-bold">SUPERVISOR DO ESTÁGIO</div>
                        </td>
                        <td className="border border-black p-2 align-bottom text-center">
                            ___/___/_____
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-black p-2 align-bottom h-16 relative">
                            <div className="absolute bottom-1 left-2 text-[8pt] font-bold">DOCENTE ORIENTADOR</div>
                        </td>
                        <td className="border border-black p-2 align-bottom text-center">
                            ___/___/_____
                        </td>
                    </tr>
                </tbody>
            </table>

        </div>
    )
})

MonthlyReportDocument.displayName = 'MonthlyReportDocument'
