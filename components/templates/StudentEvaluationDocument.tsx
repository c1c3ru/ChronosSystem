import React, { forwardRef } from 'react'

interface StudentEvaluationDocumentProps {
    data: {
        // Dados do Estagiário
        student_name: string
        student_course: string
        student_enrollment: string

        // Dados da Empresa
        company_name: string
        company_supervisor: string

        // Período
        period_start: string
        period_end: string

        // Avaliações (1 a 5)
        eval_assiduity: string
        eval_punctuality: string
        eval_responsibility: string
        eval_discipline: string
        eval_cooperation: string
        eval_initiative: string
        eval_proactivity: string
        eval_communication: string
        eval_relationship: string
        eval_technical_knowledge: string
        eval_learning_capacity: string
        eval_productivity: string
        eval_quality: string
        eval_organization: string
        eval_creativity: string

        // Observações
        observations: string

        // Recomendação
        recommendation: 'sim' | 'nao' | ''

        // Data
        evaluation_date: string
    }
}

export const StudentEvaluationDocument = forwardRef<HTMLDivElement, StudentEvaluationDocumentProps>(({ data }, ref) => {
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
        <tr>
            <td className="border border-black px-2 py-1 text-[8pt] w-2/3">{label}</td>
            <td className="border border-black px-2 py-1 text-center text-[8pt] font-bold w-1/12">{value === '1' ? 'X' : ''}</td>
            <td className="border border-black px-2 py-1 text-center text-[8pt] font-bold w-1/12">{value === '2' ? 'X' : ''}</td>
            <td className="border border-black px-2 py-1 text-center text-[8pt] font-bold w-1/12">{value === '3' ? 'X' : ''}</td>
            <td className="border border-black px-2 py-1 text-center text-[8pt] font-bold w-1/12">{value === '4' ? 'X' : ''}</td>
            <td className="border border-black px-2 py-1 text-center text-[8pt] font-bold w-1/12">{value === '5' ? 'X' : ''}</td>
        </tr>
    )

    const Checkbox = ({ checked, label }: { checked: boolean, label: string }) => (
        <div className="flex items-center mr-4">
            <div className={`w-3 h-3 border border-black mr-1 flex items-center justify-center text-[8px] leading-none`}>
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

            <h1 className="text-center font-bold text-[12pt] mb-6 uppercase">FICHA DE AVALIAÇÃO DO DISCENTE ESTAGIÁRIO</h1>

            {/* Dados do Estagiário */}
            <table className="official-table">
                <tbody>
                    <TableRow>
                        <TableCell colSpan={3}>
                            <Label>NOME DO ESTAGIÁRIO</Label>
                            <Value>{data.student_name}</Value>
                        </TableCell>
                        <TableCell colSpan={1}>
                            <Label>MATRÍCULA</Label>
                            <Value>{data.student_enrollment}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Label>CURSO</Label>
                            <Value>{data.student_course}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Label>EMPRESA CONCEDENTE</Label>
                            <Value>{data.company_name}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Label>SUPERVISOR DO ESTÁGIO</Label>
                            <Value>{data.company_supervisor}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={2}>
                            <Label>PERÍODO INICIAL</Label>
                            <Value>{formatDate(data.period_start)}</Value>
                        </TableCell>
                        <TableCell colSpan={2}>
                            <Label>PERÍODO FINAL</Label>
                            <Value>{formatDate(data.period_end)}</Value>
                        </TableCell>
                    </TableRow>
                </tbody>
            </table>

            {/* Critérios de Avaliação */}
            <div className="mb-4">
                <div className="bg-gray-200 border border-black p-2 text-center font-bold text-[9pt] mb-2">
                    CRITÉRIOS DE AVALIAÇÃO
                </div>
                <div className="text-[8pt] mb-2 text-center">
                    Atribua uma nota de 1 a 5 para cada critério, sendo: <strong>1 - Insuficiente | 2 - Regular | 3 - Bom | 4 - Muito Bom | 5 - Excelente</strong>
                </div>
                <table className="w-full border-collapse border border-black text-[8pt]">
                    <thead>
                        <tr>
                            <th className="border border-black p-2 bg-gray-100 text-left">CRITÉRIO</th>
                            <th className="border border-black p-2 bg-gray-100 w-12">1</th>
                            <th className="border border-black p-2 bg-gray-100 w-12">2</th>
                            <th className="border border-black p-2 bg-gray-100 w-12">3</th>
                            <th className="border border-black p-2 bg-gray-100 w-12">4</th>
                            <th className="border border-black p-2 bg-gray-100 w-12">5</th>
                        </tr>
                    </thead>
                    <tbody>
                        <EvaluationRow label="Assiduidade" value={data.eval_assiduity} />
                        <EvaluationRow label="Pontualidade" value={data.eval_punctuality} />
                        <EvaluationRow label="Responsabilidade" value={data.eval_responsibility} />
                        <EvaluationRow label="Disciplina" value={data.eval_discipline} />
                        <EvaluationRow label="Cooperação" value={data.eval_cooperation} />
                        <EvaluationRow label="Iniciativa" value={data.eval_initiative} />
                        <EvaluationRow label="Proatividade" value={data.eval_proactivity} />
                        <EvaluationRow label="Comunicação" value={data.eval_communication} />
                        <EvaluationRow label="Relacionamento Interpessoal" value={data.eval_relationship} />
                        <EvaluationRow label="Conhecimento Técnico" value={data.eval_technical_knowledge} />
                        <EvaluationRow label="Capacidade de Aprendizagem" value={data.eval_learning_capacity} />
                        <EvaluationRow label="Produtividade" value={data.eval_productivity} />
                        <EvaluationRow label="Qualidade do Trabalho" value={data.eval_quality} />
                        <EvaluationRow label="Organização" value={data.eval_organization} />
                        <EvaluationRow label="Criatividade" value={data.eval_creativity} />
                    </tbody>
                </table>
            </div>

            {/* Observações */}
            <SectionHeader title="OBSERVAÇÕES E COMENTÁRIOS" />
            <div className="border border-black p-4 text-[9pt] whitespace-pre-wrap min-h-[100px] text-justify mb-4">
                {data.observations}
            </div>

            {/* Recomendação */}
            <div className="border border-black p-3 mb-8">
                <div className="font-bold text-[9pt] mb-2">RECOMENDARIA ESTE ESTAGIÁRIO PARA FUTURAS OPORTUNIDADES?</div>
                <div className="flex gap-8">
                    <Checkbox checked={data.recommendation === 'sim'} label="SIM" />
                    <Checkbox checked={data.recommendation === 'nao'} label="NÃO" />
                </div>
            </div>

            {/* Assinatura */}
            <div className="text-right mb-4 text-[10pt]">
                Data: {formatDate(data.evaluation_date)}
            </div>

            <div className="text-center mt-12">
                <div className="border-t border-black pt-1 w-2/3 mx-auto text-[8pt]">
                    <strong>{data.company_supervisor || 'SUPERVISOR DO ESTÁGIO'}</strong><br />
                    {data.company_name}<br />
                    Assinatura e Carimbo
                </div>
            </div>

        </div>
    )
})

StudentEvaluationDocument.displayName = 'StudentEvaluationDocument'
