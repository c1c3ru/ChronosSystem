import React, { forwardRef } from 'react'
import { OfficialHeader, FormTable, FormHeaderCell, FormDataCell, FormField } from '@/components/OfficialFormTemplate'

interface ExtensionDeclarationDocumentProps {
    data: {
        company_name: string
        student_name: string
        student_course: string
        student_enrollment: string
        current_start_date: string
        current_end_date: string
        new_end_date: string
        city: string
        date_day: string
        date_month: string
        date_year: string
    }
}

export const ExtensionDeclarationDocument = forwardRef<HTMLDivElement, ExtensionDeclarationDocumentProps>(({ data }, ref) => {
    const formatDate = (dateString: string) => {
        if (!dateString) return '___/___/_____'
        const [year, month, day] = dateString.split('-')
        return `${day}/${month}/${year}`
    }

    return (
        <div ref={ref} className="bg-white text-black p-8 w-full mx-auto text-[10pt] font-sans leading-tight">
            <OfficialHeader
                title="DECLARAÇÃO DE PRORROGAÇÃO DE ESTÁGIO"
                showLogos={true}
            />

            <div className="mb-8 text-justify indent-8 leading-relaxed mt-12">
                Declaramos que o Termo de Compromisso de Estágio firmado entre a empresa <b>{data.company_name}</b> e o estagiário <b>{data.student_name}</b>, aluno do curso <b>{data.student_course}</b>, matrícula <b>{data.student_enrollment}</b>, com vigência de <b>{formatDate(data.current_start_date)}</b> a <b>{formatDate(data.current_end_date)}</b>, fica prorrogado até <b>{formatDate(data.new_end_date)}</b>, mantendo-se inalteradas as demais cláusulas e condições do referido Termo.
            </div>

            <div className="text-right mb-24 mt-12">
                {data.city || 'Fortaleza'} - CE, {data.date_day} de {data.date_month} de {data.date_year}.
            </div>

            <div className="grid grid-cols-2 gap-8 mt-12">
                <div className="text-center">
                    <div className="border-t border-black pt-1 w-3/4 mx-auto">
                        {data.company_name}<br />
                        (Assinatura e Carimbo)
                    </div>
                </div>
                <div className="text-center">
                    <div className="border-t border-black pt-1 w-3/4 mx-auto">
                        {data.student_name}<br />
                        (Assinatura do Estagiário)
                    </div>
                </div>
            </div>

        </div>
    )
})

ExtensionDeclarationDocument.displayName = 'ExtensionDeclarationDocument'
