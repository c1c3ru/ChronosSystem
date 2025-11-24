import React, { forwardRef } from 'react'
import { OfficialHeader, FormTable, FormHeaderCell, FormDataCell, FormField } from '@/components/OfficialFormTemplate'

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

    const Checkbox = ({ checked, label }: { checked: boolean, label: string }) => (
        <div className="flex items-center mb-1">
            <div className={`w-4 h-4 border border-black mr-2 flex items-center justify-center text-[10px]`}>
                {checked ? 'X' : ''}
            </div>
            <span className="text-[9pt]">{label}</span>
        </div>
    )

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
                title="SOLICITAÇÃO DE EQUIVALÊNCIA DE ESTÁGIO"
                showLogos={true}
            />

            <div className="mb-4 text-justify indent-8">
                Ilmo. Sr. Coordenador de Estágios do IFCE, venho requerer a V.Sa. a equivalência da atividade profissional que exerço/exerci, como Estágio Curricular Supervisionado, conforme documentação anexa.
            </div>

            {/* Dados do Discente */}
            <FormTable>
                <tbody>
                    <tr>
                        <FormHeaderCell colSpan={4} className="bg-gray-200 text-center font-bold">DADOS DO DISCENTE</FormHeaderCell>
                    </tr>
                    <tr>
                        <FormField label="NOME" colSpan={4}>
                            {data.student_name}
                        </FormField>
                    </tr>
                    <tr>
                        <FormField label="MATRÍCULA" colSpan={1}>
                            {data.student_enrollment}
                        </FormField>
                        <FormField label="CURSO" colSpan={3}>
                            {data.student_course}
                        </FormField>
                    </tr>
                    <tr>
                        <FormField label="ENDEREÇO" colSpan={4}>
                            {data.student_address}
                        </FormField>
                    </tr>
                    <tr>
                        <FormField label="TELEFONE" colSpan={2}>
                            {data.student_phone}
                        </FormField>
                        <FormField label="E-MAIL" colSpan={2}>
                            {data.student_email}
                        </FormField>
                    </tr>
                </tbody>
            </FormTable>

            {/* Dados da Empresa */}
            <FormTable>
                <tbody>
                    <tr>
                        <FormHeaderCell colSpan={4} className="bg-gray-200 text-center font-bold">DADOS DA EMPRESA / INSTITUIÇÃO</FormHeaderCell>
                    </tr>
                    <tr>
                        <FormField label="NOME DA EMPRESA" colSpan={4}>
                            {data.company_name}
                        </FormField>
                    </tr>
                    <tr>
                        <FormField label="ENDEREÇO" colSpan={4}>
                            {data.company_address}
                        </FormField>
                    </tr>
                    <tr>
                        <FormField label="TELEFONE" colSpan={2}>
                            {data.company_phone}
                        </FormField>
                        <FormField label="E-MAIL" colSpan={2}>
                            {data.company_email}
                        </FormField>
                    </tr>
                    <tr>
                        <FormField label="CHEFE IMEDIATO" colSpan={4}>
                            {data.company_supervisor}
                        </FormField>
                    </tr>
                </tbody>
            </FormTable>

            {/* Atividades */}
            <FormTable>
                <thead>
                    <tr>
                        <FormHeaderCell className="text-center">DESCRIÇÃO DAS ATIVIDADES DESENVOLVIDAS</FormHeaderCell>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-gray-400 p-2 align-top h-[100px] whitespace-pre-wrap">
                            {data.activities}
                        </td>
                    </tr>
                </tbody>
            </FormTable>

            {/* Período */}
            <FormTable>
                <thead>
                    <tr>
                        <FormHeaderCell colSpan={3} className="text-center">PERÍODO DE REALIZAÇÃO</FormHeaderCell>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <FormField label="DATA INICIAL" colSpan={1} className="text-center">
                            {formatDate(data.start_date)}
                        </FormField>
                        <FormField label="DATA FINAL" colSpan={1} className="text-center">
                            {formatDate(data.end_date)}
                        </FormField>
                        <FormField label="CARGA HORÁRIA TOTAL" colSpan={1} className="text-center">
                            {data.total_hours} HORAS
                        </FormField>
                    </tr>
                </tbody>
            </FormTable>

            {/* Documentos Anexos */}
            <div className="border border-gray-400 p-2 mb-4">
                <div className="font-bold mb-2 text-[9pt]">DOCUMENTOS ANEXOS (CÓPIAS AUTENTICADAS OU COM O ORIGINAL):</div>
                <Checkbox checked={data.doc_work_card === 'true'} label="Carteira de Trabalho (páginas da foto, qualificação civil e contrato de trabalho)" />
                <Checkbox checked={data.doc_service_declaration === 'true'} label="Declaração de Tempo de Serviço (em papel timbrado da empresa)" />
                <Checkbox checked={data.doc_activities_declaration === 'true'} label="Declaração de Atividades Profissionais (com descrição detalhada)" />
                <div className="flex items-center">
                    <Checkbox checked={data.doc_other === 'true'} label="Outros:" />
                    <span className="ml-2 border-b border-black flex-1 text-[9pt]">{data.doc_other_desc}</span>
                </div>
            </div>

            {/* Assinatura do Aluno */}
            <div className="text-center mt-8 mb-8">
                <div className="border-t border-black pt-1 w-1/2 mx-auto">
                    ASSINATURA DO DISCENTE
                </div>
            </div>

            {/* Parecer da Coordenação */}
            <div className="border-2 border-black p-4 mt-8">
                <div className="font-bold text-center mb-4 bg-gray-200 p-1">PARECER DA COORDENAÇÃO DE ESTÁGIOS</div>

                <div className="flex justify-center gap-8 mb-4">
                    <div className="flex items-center">
                        <div className="w-4 h-4 border border-black mr-2"></div>
                        <span>DEFERIDO</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 border border-black mr-2"></div>
                        <span>INDEFERIDO</span>
                    </div>
                </div>

                <div className="mb-2 font-bold">JUSTIFICATIVA:</div>
                <div className="border-b border-black h-6 mb-2"></div>
                <div className="border-b border-black h-6 mb-2"></div>
                <div className="border-b border-black h-6 mb-8"></div>

                <div className="text-center">
                    <div className="border-t border-black pt-1 w-1/2 mx-auto">
                        COORDENADOR DE ESTÁGIOS
                    </div>
                    <div className="text-[8pt] mt-1">DATA: ___/___/_____</div>
                </div>
            </div>

        </div>
    )
})

EquivalenceRequestDocument.displayName = 'EquivalenceRequestDocument'
