import React, { forwardRef } from 'react'
import { OfficialHeader, FormTable, FormHeaderCell, FormDataCell, FormField } from '@/components/OfficialFormTemplate'

interface SemesterReportDocumentProps {
    data: {
        student_name: string
        student_course: string
        student_enrollment: string
        supervisor_name: string
        advisor_name: string
        period_start: string
        period_end: string
        hours_semester: string
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

export const SemesterReportDocument = forwardRef<HTMLDivElement, SemesterReportDocumentProps>(({ data }, ref) => {
    const formatDate = (dateString: string) => {
        if (!dateString) return '___/___/_____'
        const [year, month, day] = dateString.split('-')
        return `${day}/${month}/${year}`
    }

    const EvaluationRow = ({ label, value }: { label: string, value: string }) => (
        <tr style={{ pageBreakInside: 'avoid' }}>
            <td className="border border-gray-400 px-1.5 py-0.5 text-[8pt]">{label}</td>
            <td className="border border-gray-400 px-1.5 py-0.5 text-center text-[8pt]">{value === '1' ? 'X' : ''}</td>
            <td className="border border-gray-400 px-1.5 py-0.5 text-center text-[8pt]">{value === '2' ? 'X' : ''}</td>
            <td className="border border-gray-400 px-1.5 py-0.5 text-center text-[8pt]">{value === '3' ? 'X' : ''}</td>
            <td className="border border-gray-400 px-1.5 py-0.5 text-center text-[8pt]">{value === '4' ? 'X' : ''}</td>
        </tr>
    )

    return (
        <div ref={ref} className="bg-white text-black p-8 max-w-[210mm] mx-auto text-[10pt] font-sans leading-tight">
            <OfficialHeader
                title="RELATÓRIO SEMESTRAL DE ATIVIDADES"
                showLogos={true}
            />

            {/* Identificação */}
            <FormTable>
                <tbody>
                    <tr>
                        <FormField label="DISCENTE ESTAGIÁRIO(A)" colSpan={4}>
                            {data.student_name}
                        </FormField>
                    </tr>
                    <tr>
                        <FormField label="CURSO" colSpan={3}>
                            {data.student_course}
                        </FormField>
                        <FormField label="MATRÍCULA" colSpan={1}>
                            {data.student_enrollment}
                        </FormField>
                    </tr>
                    <tr>
                        <FormField label="SUPERVISOR DO ESTÁGIO" colSpan={4}>
                            {data.supervisor_name}
                        </FormField>
                    </tr>
                    <tr>
                        <FormField label="DOCENTE ORIENTADOR" colSpan={4}>
                            {data.advisor_name}
                        </FormField>
                    </tr>
                </tbody>
            </FormTable>

            {/* Período e Carga Horária */}
            <FormTable>
                <thead>
                    <tr>
                        <FormHeaderCell colSpan={2} className="text-center">PERÍODO</FormHeaderCell>
                        <FormHeaderCell colSpan={2} className="text-center">CARGA HORÁRIA</FormHeaderCell>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-gray-400 p-2 align-top w-1/4">
                            <div className="text-[8pt] font-semibold mb-1">DATA INICIAL PARCIAL</div>
                            <div className="text-center">{formatDate(data.period_start)}</div>
                        </td>
                        <td className="border border-gray-400 p-2 align-top w-1/4">
                            <div className="text-[8pt] font-semibold mb-1">DATA FINAL PARCIAL</div>
                            <div className="text-center">{formatDate(data.period_end)}</div>
                        </td>
                        <td className="border border-gray-400 p-2 align-top w-1/4">
                            <div className="text-[8pt] font-semibold mb-1">ESTAGIADA NO PERÍODO</div>
                            <div className="text-center">{data.hours_semester} HORAS</div>
                        </td>
                        <td className="border border-gray-400 p-2 align-top w-1/4">
                            <div className="text-[8pt] font-semibold mb-1">ACUMULADA NO PERÍODO</div>
                            <div className="text-center">{data.hours_total} HORAS</div>
                        </td>
                    </tr>
                </tbody>
            </FormTable>

            {/* Atividades */}
            <FormTable>
                <thead>
                    <tr>
                        <FormHeaderCell className="text-center">PRINCIPAIS ATIVIDADES DESENVOLVIDAS NO ESTÁGIO DURANTE O PERÍODO</FormHeaderCell>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-gray-400 p-2 align-top h-[80px] whitespace-pre-wrap">
                            {data.activities}
                        </td>
                    </tr>
                </tbody>
            </FormTable>

            {/* Avaliação */}
            <div className="mt-4 border border-gray-400" style={{ pageBreakInside: 'avoid' }}>
                <div className="bg-gray-100 p-1.5 font-bold text-center border-b border-gray-400 text-[9pt]">
                    AVALIAÇÃO AO DISCENTE ESTAGIÁRIO
                </div>
                <div className="flex">
                    <div className="w-1/3 p-1.5 border-r border-gray-400 text-[7pt]">
                        <div className="font-bold mb-1 text-center">ATRIBUIR VALORES ÀS CARACTERÍSTICAS DO ESTAGIÁRIO, DE ACORDO COM OS CONCEITOS</div>
                        <div className="mt-2 space-y-0.5">
                            <div>( 1 ) INSATISFATÓRIO</div>
                            <div>( 2 ) POUCO SATISFATÓRIO</div>
                            <div>( 3 ) SATISFATÓRIO</div>
                            <div>( 4 ) MUITO SATISFATÓRIO</div>
                        </div>
                    </div>
                    <div className="w-2/3">
                        <table className="w-full text-[8pt]" style={{ pageBreakInside: 'avoid' }}>
                            <thead>
                                <tr>
                                    <th className="border-b border-r border-gray-400 px-1.5 py-0.5 text-left w-full">CONCEITOS</th>
                                    <th className="border-b border-r border-gray-400 px-1.5 py-0.5 w-8 text-center">(1)</th>
                                    <th className="border-b border-r border-gray-400 px-1.5 py-0.5 w-8 text-center">(2)</th>
                                    <th className="border-b border-r border-gray-400 px-1.5 py-0.5 w-8 text-center">(3)</th>
                                    <th className="border-b border-gray-400 px-1.5 py-0.5 w-8 text-center">(4)</th>
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

            {/* Observações */}
            <FormTable>
                <thead>
                    <tr>
                        <FormHeaderCell className="text-center">OBSERVAÇÕES – COMENTÁRIOS – SUGESTÕES</FormHeaderCell>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-gray-400 p-2 align-top h-[100px] whitespace-pre-wrap">
                            {data.comments}
                        </td>
                    </tr>
                </tbody>
            </FormTable>

            {/* Assinaturas */}
            <FormTable>
                <thead>
                    <tr>
                        <FormHeaderCell className="text-center w-3/4">ASSINATURAS</FormHeaderCell>
                        <FormHeaderCell className="text-center w-1/4">DATA</FormHeaderCell>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-gray-400 p-2 align-bottom h-16 relative">
                            <div className="absolute bottom-1 left-2 text-[8pt] font-semibold">SUPERVISOR DO ESTÁGIO</div>
                        </td>
                        <td className="border border-gray-400 p-2 align-bottom text-center">
                            <div className="text-[7pt] text-left mb-4">EMITIDO EM</div>
                            ___/___/_____
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-400 p-2 align-bottom h-16 relative">
                            <div className="absolute bottom-1 left-2 text-[8pt] font-semibold">DISCENTE ESTAGIÁRIO</div>
                        </td>
                        <td className="border border-gray-400 p-2 align-bottom text-center">
                            <div className="text-[7pt] text-left mb-4">CIENTE EM</div>
                            ___/___/_____
                        </td>
                    </tr>
                </tbody>
            </FormTable>

        </div>
    )
})

SemesterReportDocument.displayName = 'SemesterReportDocument'
