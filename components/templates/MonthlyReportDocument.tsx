import React, { forwardRef } from 'react'
import { OfficialHeader, FormTable, FormHeaderCell, FormDataCell, FormField } from '@/components/OfficialFormTemplate'

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

    return (
        <div ref={ref} className="bg-white text-black w-full mx-auto" style={{
            fontSize: '12pt',
            fontFamily: 'Arial, "Times New Roman", sans-serif',
            lineHeight: '1.5',
            padding: '30mm 20mm 20mm 30mm',
            maxWidth: '210mm',
            minHeight: '297mm'
        }}>
            <OfficialHeader
                title="RELATÓRIO MENSAL DE ATIVIDADES"
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
                            <div className="text-center">{data.hours_month} HORAS</div>
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
                        <td className="border border-gray-400 p-2 align-top h-[200px] whitespace-pre-wrap">
                            {data.activities}
                        </td>
                    </tr>
                </tbody>
            </FormTable>

            {/* Dificuldades e Soluções */}
            <FormTable>
                <thead>
                    <tr>
                        <FormHeaderCell className="text-center w-1/2">DIFICULDADES ENCONTRADAS</FormHeaderCell>
                        <FormHeaderCell className="text-center w-1/2">SOLUÇÕES ADOTADAS</FormHeaderCell>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-gray-400 p-2 align-top h-[150px] whitespace-pre-wrap w-1/2">
                            {data.difficulties}
                        </td>
                        <td className="border border-gray-400 p-2 align-top h-[150px] whitespace-pre-wrap w-1/2">
                            {data.solutions}
                        </td>
                    </tr>
                </tbody>
            </FormTable>

            {/* Assinaturas */}
            <FormTable>
                <thead>
                    <tr>
                        <FormHeaderCell className="text-center w-3/4">ASSINATURA</FormHeaderCell>
                        <FormHeaderCell className="text-center w-1/4">DATA</FormHeaderCell>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-gray-400 p-2 align-bottom h-16 relative">
                            <div className="absolute bottom-1 left-2 text-[8pt] font-semibold">DISCENTE ESTAGIÁRIO</div>
                        </td>
                        <td className="border border-gray-400 p-2 align-bottom text-center">
                            ___/___/_____
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-400 p-2 align-bottom h-16 relative">
                            <div className="absolute bottom-1 left-2 text-[8pt] font-semibold">SUPERVISOR DO ESTÁGIO</div>
                        </td>
                        <td className="border border-gray-400 p-2 align-bottom text-center">
                            ___/___/_____
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-400 p-2 align-bottom h-16 relative">
                            <div className="absolute bottom-1 left-2 text-[8pt] font-semibold">DOCENTE ORIENTADOR</div>
                        </td>
                        <td className="border border-gray-400 p-2 align-bottom text-center">
                            ___/___/_____
                        </td>
                    </tr>
                </tbody>
            </FormTable>

        </div>
    )
})

MonthlyReportDocument.displayName = 'MonthlyReportDocument'
