import React, { forwardRef } from 'react'

interface FinalReportDocumentProps {
    data: {
        student_name: string
        student_course: string
        student_enrollment: string
        supervisor_name: string
        advisor_name: string
        period_start: string
        period_end: string
        hours_total: string
        activities: string
        comments: string

        // Avaliações (1 a 4)
        eval_assiduity: string
        eval_guidance: string
        eval_communication: string
        eval_cooperation: string
        eval_discipline: string
        eval_knowledge: string
        eval_punctuality: string
        eval_delivery: string
        eval_proactivity: string
        eval_productivity: string
        eval_quality: string
        eval_relationship: string
        eval_responsibility: string
    }
}

export const FinalReportDocument = forwardRef<HTMLDivElement, FinalReportDocumentProps>(({ data }, ref) => {
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

    const EvaluationRow = ({ label, value }: { label: string, value: string }) => (
        <tr style={{ pageBreakInside: 'avoid' }}>
            <td className="border border-black px-1.5 py-1 text-[8pt]">{label}</td>
            <td className="border border-black px-1.5 py-1 text-center text-[8pt] font-bold">{value === '1' ? 'X' : ''}</td>
            <td className="border border-black px-1.5 py-1 text-center text-[8pt] font-bold">{value === '2' ? 'X' : ''}</td>
            <td className="border border-black px-1.5 py-1 text-center text-[8pt] font-bold">{value === '3' ? 'X' : ''}</td>
            <td className="border border-black px-1.5 py-1 text-center text-[8pt] font-bold">{value === '4' ? 'X' : ''}</td>
        </tr>
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

            {/* --- PÁGINA 1 --- */}

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

            <h1 className="text-center font-bold text-[12pt] mb-8 uppercase">RELATÓRIO FINAL DE ATIVIDADES</h1>

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
                        <th className="border border-black bg-gray-200 p-1 text-[8pt]">CARGA HORÁRIA</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-black p-2 align-top w-1/3">
                            <Label>DATA INICIAL</Label>
                            <div className="text-[9pt] mt-1">{formatDate(data.period_start)}</div>
                        </td>
                        <td className="border border-black p-2 align-top w-1/3">
                            <Label>DATA FINAL</Label>
                            <div className="text-[9pt] mt-1">{formatDate(data.period_end)}</div>
                        </td>
                        <td className="border border-black p-2 align-top w-1/3">
                            <Label>CARGA HORÁRIA TOTAL</Label>
                            <div className="text-[9pt] mt-1">{data.hours_total} HORAS</div>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* --- PÁGINA 2 --- */}
            <div style={{ pageBreakBefore: 'always' }}></div>

            {/* Atividades */}
            <SectionHeader title="PRINCIPAIS ATIVIDADES DESENVOLVIDAS NO ESTÁGIO DURANTE O PERÍODO" />
            <div className="border border-black p-4 text-[9pt] whitespace-pre-wrap min-h-[800px] text-justify">
                {data.activities}
            </div>

            {/* --- PÁGINA 3 --- */}
            <div style={{ pageBreakBefore: 'always' }}></div>

            {/* Avaliação */}
            <div className="border border-black mb-4">
                <div className="bg-gray-200 p-2 font-bold text-center border-b border-black text-[9pt]">
                    AVALIAÇÃO AO DISCENTE ESTAGIÁRIO
                </div>
                <div className="flex">
                    <div className="w-1/3 p-2 border-r border-black text-[8pt]">
                        <div className="font-bold mb-4 text-center">ATRIBUIR VALORES ÀS CARACTERÍSTICAS DO ESTAGIÁRIO, DE ACORDO COM OS CONCEITOS</div>
                        <div className="space-y-2 pl-2">
                            <div>( 1 ) INSATISFATÓRIO</div>
                            <div>( 2 ) POUCO SATISFATÓRIO</div>
                            <div>( 3 ) SATISFATÓRIO</div>
                            <div>( 4 ) MUITO SATISFATÓRIO</div>
                        </div>
                    </div>
                    <div className="w-2/3">
                        <table className="w-full text-[8pt] border-collapse">
                            <thead>
                                <tr>
                                    <th className="border-b border-r border-black px-1.5 py-1 text-left w-full">CONCEITOS</th>
                                    <th className="border-b border-r border-black px-1.5 py-1 w-8 text-center">(1)</th>
                                    <th className="border-b border-r border-black px-1.5 py-1 w-8 text-center">(2)</th>
                                    <th className="border-b border-r border-black px-1.5 py-1 w-8 text-center">(3)</th>
                                    <th className="border-b border-black px-1.5 py-1 w-8 text-center">(4)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <EvaluationRow label="ASSIDUIDADE" value={data.eval_assiduity} />
                                <EvaluationRow label="ATENDIMENTO ÀS ORIENTAÇÕES" value={data.eval_guidance} />
                                <EvaluationRow label="COMUNICAÇÃO" value={data.eval_communication} />
                                <EvaluationRow label="COOPERAÇÃO" value={data.eval_cooperation} />
                                <EvaluationRow label="DISCIPLINA" value={data.eval_discipline} />
                                <EvaluationRow label="CONHECIMENTO ADQUIRIDO NO ESTÁGIO" value={data.eval_knowledge} />
                                <EvaluationRow label="PONTUALIDADE" value={data.eval_punctuality} />
                                <EvaluationRow label="PONTUALIDADE NA ENTREGA DE DOCUMENTOS" value={data.eval_delivery} />
                                <EvaluationRow label="PROATIVIDADE" value={data.eval_proactivity} />
                                <EvaluationRow label="PRODUTIVIDADE" value={data.eval_productivity} />
                                <EvaluationRow label="QUALIDADE NO DESEMPENHO DAS ATIVIDADES" value={data.eval_quality} />
                                <EvaluationRow label="RELACIONAMENTO INTERPESSOAL" value={data.eval_relationship} />
                                <EvaluationRow label="RESPONSABILIDADE" value={data.eval_responsibility} />
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- PÁGINA 4 --- */}
            <div style={{ pageBreakBefore: 'always' }}></div>

            {/* Observações */}
            <SectionHeader title="OBSERVAÇÕES – COMENTÁRIOS – SUGESTÕES" />
            <div className="border border-black p-4 text-[9pt] whitespace-pre-wrap min-h-[300px] mb-8 text-justify">
                {data.comments}
            </div>

            {/* Assinaturas */}
            <table className="official-table">
                <thead>
                    <tr>
                        <th className="border border-black bg-gray-200 p-1 text-[8pt] w-3/4">ASSINATURAS</th>
                        <th className="border border-black bg-gray-200 p-1 text-[8pt] w-1/4">DATA</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-black p-2 align-bottom h-24 relative">
                            <div className="absolute bottom-2 left-2 text-[8pt] font-bold">SUPERVISOR DO ESTÁGIO</div>
                        </td>
                        <td className="border border-black p-2 align-bottom text-center">
                            <div className="text-[7pt] text-left mb-8">EMITIDO EM</div>
                            ___/___/_____
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-black p-2 align-bottom h-24 relative">
                            <div className="absolute bottom-2 left-2 text-[8pt] font-bold">DISCENTE ESTAGIÁRIO</div>
                        </td>
                        <td className="border border-black p-2 align-bottom text-center">
                            <div className="text-[7pt] text-left mb-8">CIENTE EM</div>
                            ___/___/_____
                        </td>
                    </tr>
                </tbody>
            </table>

        </div>
    )
})

FinalReportDocument.displayName = 'FinalReportDocument'
