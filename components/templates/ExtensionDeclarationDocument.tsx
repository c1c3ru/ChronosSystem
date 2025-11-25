import React, { forwardRef } from 'react'

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

            <h1 className="text-center font-bold text-[12pt] mb-12 uppercase mt-8">DECLARAÇÃO DE PRORROGAÇÃO DE ESTÁGIO</h1>

            <div className="mb-8 text-justify indent-12 leading-loose text-[10pt]">
                Declaramos que o Termo de Compromisso de Estágio firmado entre a empresa <strong>{data.company_name || '__________________________________________________'}</strong> e o estagiário <strong>{data.student_name || '__________________________________________________'}</strong>, aluno do curso <strong>{data.student_course || '____________________'}</strong>, matrícula <strong>{data.student_enrollment || '__________'}</strong>, com vigência de <strong>{formatDate(data.current_start_date)}</strong> a <strong>{formatDate(data.current_end_date)}</strong>, fica prorrogado até <strong>{formatDate(data.new_end_date)}</strong>, mantendo-se inalteradas as demais cláusulas e condições do referido Termo.
            </div>

            <div className="text-right mb-24 mt-12 text-[10pt]">
                {data.city || 'Fortaleza'} - CE, {data.date_day || '___'} de {data.date_month || '_______________'} de {data.date_year || '20___'}.
            </div>

            <div className="grid grid-cols-2 gap-8 mt-12">
                <div className="text-center">
                    <div className="border-t border-black pt-1 w-3/4 mx-auto text-[10pt]">
                        <strong>{data.company_name || 'EMPRESA CONCEDENTE'}</strong><br />
                        (Assinatura e Carimbo)
                    </div>
                </div>
                <div className="text-center">
                    <div className="border-t border-black pt-1 w-3/4 mx-auto text-[10pt]">
                        <strong>{data.student_name || 'ESTAGIÁRIO(A)'}</strong><br />
                        (Assinatura do Estagiário)
                    </div>
                </div>
            </div>

        </div>
    )
})

ExtensionDeclarationDocument.displayName = 'ExtensionDeclarationDocument'
