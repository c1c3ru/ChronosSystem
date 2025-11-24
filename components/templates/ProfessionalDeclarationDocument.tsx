import React, { forwardRef } from 'react'
import { OfficialHeader, FormTable, FormHeaderCell, FormDataCell, FormField } from '@/components/OfficialFormTemplate'

interface ProfessionalDeclarationDocumentProps {
    data: {
        company_name: string
        company_cnpj: string
        company_address: string

        employee_name: string
        employee_cpf: string
        employee_ctps: string
        employee_ctps_series: string

        start_date: string
        role: string
        weekly_hours: string

        activities: string

        city: string
        date_day: string
        date_month: string
        date_year: string
    }
}

export const ProfessionalDeclarationDocument = forwardRef<HTMLDivElement, ProfessionalDeclarationDocumentProps>(({ data }, ref) => {
    const formatDate = (dateString: string) => {
        if (!dateString) return '___/___/_____'
        const [year, month, day] = dateString.split('-')
        return `${day}/${month}/${year}`
    }

    return (
        <div ref={ref} className="bg-white text-black p-8 max-w-[210mm] mx-auto text-[10pt] font-sans leading-tight">
            <OfficialHeader
                title="DECLARAÇÃO DE ATIVIDADES PROFISSIONAIS"
                showLogos={true}
            />

            <div className="mb-8 text-justify indent-8 leading-relaxed">
                Declaramos para os devidos fins que o(a) Sr(a) <b>{data.employee_name}</b>, portador(a) do CPF nº <b>{data.employee_cpf}</b> e da CTPS nº <b>{data.employee_ctps}</b>, Série <b>{data.employee_ctps_series}</b>, exerce atividades nesta empresa desde <b>{formatDate(data.start_date)}</b>, na função de <b>{data.role}</b>, cumprindo carga horária semanal de <b>{data.weekly_hours}</b> horas.
            </div>

            <div className="mb-4 font-bold">DESCRIÇÃO DAS ATIVIDADES DESENVOLVIDAS:</div>

            <div className="border border-gray-400 p-4 min-h-[300px] whitespace-pre-wrap mb-8 text-justify">
                {data.activities}
            </div>

            <div className="text-right mb-16">
                {data.city || 'Fortaleza'} - CE, {data.date_day} de {data.date_month} de {data.date_year}.
            </div>

            <div className="text-center">
                <div className="border-t border-black pt-1 w-1/2 mx-auto">
                    {data.company_name}<br />
                    CNPJ: {data.company_cnpj}<br />
                    (Assinatura e Carimbo)
                </div>
            </div>

            <div className="mt-16 text-center text-[8pt] text-gray-500">
                {data.company_address}
            </div>

        </div>
    )
})

ProfessionalDeclarationDocument.displayName = 'ProfessionalDeclarationDocument'
