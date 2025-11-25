import React, { forwardRef } from 'react'

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
        <div ref={ref} className="bg-white text-black font-sans box-border mx-auto" style={{ width: '210mm', padding: '10mm' }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                    @media print {
                        @page { margin: 10mm; size: A4; }
                        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    }
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

            <h1 className="text-center font-bold text-[12pt] mb-12 uppercase mt-8">DECLARAÇÃO DE ATIVIDADES PROFISSIONAIS</h1>

            <div className="mb-8 text-justify indent-12 leading-loose text-[10pt]">
                Declaramos para os devidos fins que o(a) Sr(a) <strong>{data.employee_name || '__________________________________________________'}</strong>, portador(a) do CPF nº <strong>{data.employee_cpf || '__________________'}</strong> e da CTPS nº <strong>{data.employee_ctps || '__________'}</strong>, Série <strong>{data.employee_ctps_series || '_____'}</strong>, exerce atividades nesta empresa desde <strong>{formatDate(data.start_date)}</strong>, na função de <strong>{data.role || '____________________'}</strong>, cumprindo carga horária semanal de <strong>{data.weekly_hours || '___'}</strong> horas.
            </div>

            <div className="mb-4 font-bold text-[10pt]">DESCRIÇÃO DAS ATIVIDADES DESENVOLVIDAS:</div>

            <div className="border border-black p-4 min-h-[300px] whitespace-pre-wrap mb-12 text-justify text-[10pt]">
                {data.activities}
            </div>

            <div className="text-right mb-24 text-[10pt]">
                {data.city || 'Fortaleza'} - CE, {data.date_day || '___'} de {data.date_month || '_______________'} de {data.date_year || '20___'}.
            </div>

            <div className="text-center">
                <div className="border-t border-black pt-1 w-2/3 mx-auto text-[10pt]">
                    <strong>{data.company_name || 'RAZÃO SOCIAL DA EMPRESA'}</strong><br />
                    CNPJ: {data.company_cnpj || '__________________'}<br />
                    (Assinatura e Carimbo)
                </div>
            </div>

            <div className="mt-24 text-center text-[8pt] text-gray-600 border-t border-gray-300 pt-2 w-full">
                {data.company_address || 'Endereço da Empresa'}
            </div>

        </div>
    )
})

ProfessionalDeclarationDocument.displayName = 'ProfessionalDeclarationDocument'
