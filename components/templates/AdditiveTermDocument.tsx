import React, { forwardRef } from 'react'

interface AdditiveTermDocumentProps {
    data: {
        // Concedente
        company_name: string
        company_fantasy_name: string
        company_cnpj: string
        company_address: string
        company_neighborhood: string
        company_city_state: string
        company_zip: string
        company_phone: string
        company_email: string
        company_representative: string
        company_representative_role: string
        company_representative_cpf: string
        company_representative_phone: string

        // Estagiário
        student_name: string
        student_cpf: string
        student_social_name: string
        student_course: string
        student_id: string
        student_address: string
        student_neighborhood: string
        student_city_state: string
        student_zip: string
        student_phone: string
        student_email_institutional: string
        student_email_personal: string

        // Instituição de Ensino (IFCE)
        campus_city: string
        campus_director: string

        // Objeto do Aditivo
        additive_type_prorogation: string // 'true' or 'false'
        new_end_date: string

        additive_type_allowance: string // 'true' or 'false'
        new_allowance_value: string

        additive_type_supervisor: string // 'true' or 'false'
        new_supervisor_name: string
        new_supervisor_role: string
        new_supervisor_council: string

        additive_type_schedule: string // 'true' or 'false'
        new_schedule: string

        additive_type_other: string // 'true' or 'false'
        other_changes: string

        date_day: string
        date_month: string
        date_year: string
    }
}

export const AdditiveTermDocument = forwardRef<HTMLDivElement, AdditiveTermDocumentProps>(({ data }, ref) => {

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

    const Checkbox = ({ checked }: { checked: boolean }) => (
        <span className={`inline-block w-3 h-3 border border-black mr-2 text-center leading-3 text-[8px] align-middle`}>
            {checked ? 'X' : ''}
        </span>
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
                    .clause-title { font-weight: bold; margin-top: 10px; margin-bottom: 5px; text-transform: uppercase; font-size: 9pt; }
                    .clause-text { text-align: justify; margin-bottom: 5px; font-size: 9pt; line-height: 1.3; }
                    .list-item { margin-left: 15px; text-indent: -15px; padding-left: 15px; }
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

            <h1 className="text-center font-bold text-[12pt] mb-4 uppercase">TERMO ADITIVO AO TERMO DE COMPROMISSO DE ESTÁGIO</h1>

            <p className="text-justify text-[9pt] mb-4">
                Pelo presente instrumento jurídico, as partes abaixo nomeadas e qualificadas celebram entre si este <strong>TERMO ADITIVO AO TERMO DE COMPROMISSO DE ESTÁGIO</strong>, firmado entre a UNIDADE CONCEDENTE e o ESTAGIÁRIO, com a interveniência obrigatória da INSTITUIÇÃO DE ENSINO, nos termos da Lei nº 11.788, de 25 de setembro de 2008, conforme as cláusulas e condições a seguir:
            </p>

            <div className="clause-title">CLÁUSULA PRIMEIRA – DA IDENTIFICAÇÃO DAS PARTES</div>

            {/* Instituição Concedente */}
            <SectionHeader title="UNIDADE CONCEDENTE" />
            <table className="official-table">
                <tbody>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Label>RAZÃO SOCIAL</Label>
                            <Value>{data.company_name}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={2}>
                            <Label>CNPJ</Label>
                            <Value>{data.company_cnpj}</Value>
                        </TableCell>
                        <TableCell colSpan={2}>
                            <Label>ENDEREÇO</Label>
                            <Value>{data.company_address}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Label>REPRESENTADA POR</Label>
                            <Value>{data.company_representative}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Label>CARGO</Label>
                            <Value>{data.company_representative_role}</Value>
                        </TableCell>
                    </TableRow>
                </tbody>
            </table>

            {/* Estagiário */}
            <SectionHeader title="ESTAGIÁRIO(A)" />
            <table className="official-table">
                <tbody>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Label>NOME</Label>
                            <Value>{data.student_name}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={2}>
                            <Label>CPF</Label>
                            <Value>{data.student_cpf}</Value>
                        </TableCell>
                        <TableCell colSpan={2}>
                            <Label>MATRÍCULA</Label>
                            <Value>{data.student_id}</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={2}>
                            <Label>CURSO</Label>
                            <Value>{data.student_course}</Value>
                        </TableCell>
                        <TableCell colSpan={2}>
                            <Label>ENDEREÇO</Label>
                            <Value>{data.student_address}</Value>
                        </TableCell>
                    </TableRow>
                </tbody>
            </table>

            {/* Instituição de Ensino */}
            <SectionHeader title="INSTITUIÇÃO DE ENSINO" />
            <table className="official-table">
                <tbody>
                    <TableRow>
                        <TableCell colSpan={3}>
                            <Label>CAMPUS</Label>
                            <Value>MARACANAÚ</Value>
                        </TableCell>
                        <TableCell>
                            <Label>CNPJ</Label>
                            <Value>10.744.098/0009-00</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Label>ENDEREÇO</Label>
                            <Value>AV. VICE PRESIDENTE JOSÉ DE ALENCAR, S/N, JEREISSATI I, MARACANAÚ-CE, CEP: 61.939-140</Value>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Label>REPRESENTADA POR</Label>
                            <Value>ELDER KENED CARDOSO - ASSISTENTE EM ADMINISTRAÇÃO - SIAPE 1818968</Value>
                        </TableCell>
                    </TableRow>
                </tbody>
            </table>

            {/* --- PÁGINA 2 --- */}
            <div style={{ pageBreakBefore: 'always' }}></div>

            <div className="clause-title">CLÁUSULA SEGUNDA – DO OBJETO DO ADITIVO</div>
            <div className="clause-text">
                O presente Termo Aditivo tem por objetivo alterar as seguintes condições do Termo de Compromisso de Estágio original:
            </div>

            <div className="border border-black p-4 mb-4 text-[9pt]">
                <div className="mb-3 flex items-start">
                    <Checkbox checked={data.additive_type_prorogation === 'true'} />
                    <div className="flex-1">
                        <strong>PRORROGAÇÃO DE VIGÊNCIA:</strong> O estágio terá sua vigência prorrogada até <strong>{data.new_end_date || '___/___/_____'}</strong>.
                    </div>
                </div>

                <div className="mb-3 flex items-start">
                    <Checkbox checked={data.additive_type_allowance === 'true'} />
                    <div className="flex-1">
                        <strong>ALTERAÇÃO DO VALOR DA BOLSA:</strong> O valor da bolsa-auxílio passará a ser de <strong>R$ {data.new_allowance_value || '_______'}</strong>.
                    </div>
                </div>

                <div className="mb-3 flex items-start">
                    <Checkbox checked={data.additive_type_supervisor === 'true'} />
                    <div className="flex-1">
                        <strong>ALTERAÇÃO DE SUPERVISOR:</strong> O novo supervisor será o(a) Sr(a). <strong>{data.new_supervisor_name || '______________________'}</strong>, cargo <strong>{data.new_supervisor_role || '________________'}</strong>, registro profissional <strong>{data.new_supervisor_council || '________________'}</strong>.
                    </div>
                </div>

                <div className="mb-3 flex items-start">
                    <Checkbox checked={data.additive_type_schedule === 'true'} />
                    <div className="flex-1">
                        <strong>ALTERAÇÃO DE HORÁRIO:</strong> O novo horário de estágio será:<br />
                        <span className="whitespace-pre-line block mt-1 ml-4 italic">{data.new_schedule || '__________________________________________________________________'}</span>
                    </div>
                </div>

                <div className="flex items-start">
                    <Checkbox checked={data.additive_type_other === 'true'} />
                    <div className="flex-1">
                        <strong>OUTRAS ALTERAÇÕES:</strong><br />
                        <span className="whitespace-pre-line block mt-1 ml-4 italic">{data.other_changes || '__________________________________________________________________'}</span>
                    </div>
                </div>
            </div>

            <div className="clause-title">CLÁUSULA TERCEIRA – DA RATIFICAÇÃO</div>
            <div className="clause-text">
                Permanecem inalteradas e ratificadas todas as demais cláusulas e condições do Termo de Compromisso de Estágio original que não foram expressamente modificadas por este instrumento.
            </div>

            <p className="mt-8 mb-8 text-justify text-[9pt]">
                E, por estarem de inteiro e comum acordo, as partes assinam o presente Termo Aditivo em 03 (três) vias de igual teor e forma.
            </p>

            <p className="text-right mb-12 text-[9pt]">
                {data.campus_city || 'Maracanaú'} - CE, {data.date_day || '___'} de {data.date_month || '_______________'} de {data.date_year || '20___'}.
            </p>

            <div className="space-y-12 mt-16">
                <div className="grid grid-cols-2 gap-8">
                    <div className="text-center">
                        <div className="border-t border-black w-full pt-1 text-[8pt]">UNIDADE CONCEDENTE<br />(Assinatura e Carimbo)</div>
                    </div>
                    <div className="text-center">
                        <div className="border-t border-black w-full pt-1 text-[8pt]">ESTAGIÁRIO(A)</div>
                    </div>
                </div>

                <div className="text-center mt-8">
                    <div className="border-t border-black w-2/3 mx-auto pt-1 text-[8pt]">INSTITUIÇÃO DE ENSINO (IFCE)<br />(Assinatura e Carimbo)</div>
                </div>
            </div>
        </div>
    )
})

AdditiveTermDocument.displayName = 'AdditiveTermDocument'
