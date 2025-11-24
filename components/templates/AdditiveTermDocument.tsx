import React, { forwardRef } from 'react'
import { OfficialHeader, FormTable, FormHeaderCell, FormDataCell, FormField } from '@/components/OfficialFormTemplate'

interface AdditiveTermDocumentProps {
    data: {
        // Concedente
        company_name: string
        company_cnpj: string
        company_address: string
        company_representative: string
        company_representative_role: string

        // Estagiário
        student_name: string
        student_cpf: string
        student_enrollment: string
        student_course: string
        student_address: string

        // Instituição de Ensino (IFCE) - Dados fixos ou preenchíveis
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
    const Checkbox = ({ checked }: { checked: boolean }) => (
        <span className={`inline-block w-4 h-4 border border-black mr-2 text-center leading-3 text-[10px]`}>
            {checked ? 'X' : ''}
        </span>
    )

    return (
        <div ref={ref} className="bg-white text-black w-full mx-auto text-justify" style={{
            fontSize: '12pt',
            fontFamily: 'Arial, "Times New Roman", sans-serif',
            lineHeight: '1.5',
            padding: '30mm 20mm 20mm 30mm',
            maxWidth: '210mm',
            minHeight: '297mm'
        }}>
            <OfficialHeader
                title="TERMO ADITIVO AO TERMO DE COMPROMISSO DE ESTÁGIO"
                showLogos={true}
            />

            <p className="mb-4 indent-8">
                Pelo presente instrumento jurídico, as partes abaixo nomeadas e qualificadas celebram entre si este TERMO ADITIVO AO TERMO DE COMPROMISSO DE ESTÁGIO, firmado entre a UNIDADE CONCEDENTE e o ESTAGIÁRIO, com a interveniência obrigatória da INSTITUIÇÃO DE ENSINO, nos termos da Lei nº 11.788, de 25 de setembro de 2008, conforme as cláusulas e condições a seguir:
            </p>

            <div className="font-bold mb-2">CLÁUSULA PRIMEIRA – DA IDENTIFICAÇÃO DAS PARTES</div>

            {/* Concedente */}
            <FormTable>
                <tbody>
                    <tr>
                        <FormHeaderCell colSpan={4} className="bg-gray-200 text-center font-bold">UNIDADE CONCEDENTE</FormHeaderCell>
                    </tr>
                    <tr>
                        <FormField label="RAZÃO SOCIAL" colSpan={4}>
                            {data.company_name}
                        </FormField>
                    </tr>
                    <tr>
                        <FormField label="CNPJ" colSpan={2}>
                            {data.company_cnpj}
                        </FormField>
                        <FormField label="ENDEREÇO" colSpan={2}>
                            {data.company_address}
                        </FormField>
                    </tr>
                    <tr>
                        <FormField label="REPRESENTADA POR" colSpan={2}>
                            {data.company_representative}
                        </FormField>
                        <FormField label="CARGO" colSpan={2}>
                            {data.company_representative_role}
                        </FormField>
                    </tr>
                </tbody>
            </FormTable>

            {/* Estagiário */}
            <FormTable>
                <tbody>
                    <tr>
                        <FormHeaderCell colSpan={4} className="bg-gray-200 text-center font-bold">ESTAGIÁRIO(A)</FormHeaderCell>
                    </tr>
                    <tr>
                        <FormField label="NOME" colSpan={4}>
                            {data.student_name}
                        </FormField>
                    </tr>
                    <tr>
                        <FormField label="CPF" colSpan={2}>
                            {data.student_cpf}
                        </FormField>
                        <FormField label="MATRÍCULA" colSpan={2}>
                            {data.student_enrollment}
                        </FormField>
                    </tr>
                    <tr>
                        <FormField label="CURSO" colSpan={2}>
                            {data.student_course}
                        </FormField>
                        <FormField label="ENDEREÇO" colSpan={2}>
                            {data.student_address}
                        </FormField>
                    </tr>
                </tbody>
            </FormTable>

            {/* Instituição de Ensino */}
            <FormTable>
                <tbody>
                    <tr>
                        <FormHeaderCell colSpan={4} className="bg-gray-200 text-center font-bold">INSTITUIÇÃO DE ENSINO</FormHeaderCell>
                    </tr>
                    <tr>
                        <td className="border border-gray-400 p-2 text-[9pt]" colSpan={4}>
                            INSTITUTO FEDERAL DE EDUCAÇÃO, CIÊNCIA E TECNOLOGIA DO CEARÁ – IFCE<br />
                            CNPJ: 10.744.098/0001-45<br />
                            REPRESENTADA POR: {data.campus_director || 'DIRETOR GERAL DO CAMPUS'}
                        </td>
                    </tr>
                </tbody>
            </FormTable>

            <div className="font-bold mb-2 mt-4">CLÁUSULA SEGUNDA – DO OBJETO DO ADITIVO</div>
            <p className="mb-2">O presente Termo Aditivo tem por objetivo alterar as seguintes condições do Termo de Compromisso de Estágio original:</p>

            <div className="space-y-2 ml-4">
                <div className="flex items-start">
                    <Checkbox checked={data.additive_type_prorogation === 'true'} />
                    <div className="flex-1">
                        <span className="font-bold">PRORROGAÇÃO DE VIGÊNCIA:</span> O estágio terá sua vigência prorrogada até {data.new_end_date}.
                    </div>
                </div>

                <div className="flex items-start">
                    <Checkbox checked={data.additive_type_allowance === 'true'} />
                    <div className="flex-1">
                        <span className="font-bold">ALTERAÇÃO DO VALOR DA BOLSA:</span> O valor da bolsa-auxílio passará a ser de R$ {data.new_allowance_value}.
                    </div>
                </div>

                <div className="flex items-start">
                    <Checkbox checked={data.additive_type_supervisor === 'true'} />
                    <div className="flex-1">
                        <span className="font-bold">ALTERAÇÃO DE SUPERVISOR:</span> O novo supervisor será o(a) Sr(a). {data.new_supervisor_name}, cargo {data.new_supervisor_role}, registro profissional {data.new_supervisor_council}.
                    </div>
                </div>

                <div className="flex items-start">
                    <Checkbox checked={data.additive_type_schedule === 'true'} />
                    <div className="flex-1">
                        <span className="font-bold">ALTERAÇÃO DE HORÁRIO:</span> O novo horário de estágio será: {data.new_schedule}.
                    </div>
                </div>

                <div className="flex items-start">
                    <Checkbox checked={data.additive_type_other === 'true'} />
                    <div className="flex-1">
                        <span className="font-bold">OUTRAS ALTERAÇÕES:</span> {data.other_changes}.
                    </div>
                </div>
            </div>

            <div className="font-bold mb-2 mt-4">CLÁUSULA TERCEIRA – DA RATIFICAÇÃO</div>
            <p className="mb-4 indent-8">
                Permanecem inalteradas e ratificadas todas as demais cláusulas e condições do Termo de Compromisso de Estágio original que não foram expressamente modificadas por este instrumento.
            </p>

            <p className="mb-8 indent-8">
                E, por estarem de inteiro e comum acordo, as partes assinam o presente Termo Aditivo em 03 (três) vias de igual teor e forma.
            </p>

            <div className="text-right mb-12">
                {data.campus_city || 'Fortaleza'} - CE, {data.date_day} de {data.date_month} de {data.date_year}.
            </div>

            {/* Assinaturas */}
            <div className="grid grid-cols-2 gap-8 mt-8">
                <div className="text-center">
                    <div className="border-t border-black pt-1 w-3/4 mx-auto">
                        UNIDADE CONCEDENTE<br />
                        (Assinatura e Carimbo)
                    </div>
                </div>
                <div className="text-center">
                    <div className="border-t border-black pt-1 w-3/4 mx-auto">
                        ESTAGIÁRIO(A)
                    </div>
                </div>
                <div className="text-center col-span-2 mt-8">
                    <div className="border-t border-black pt-1 w-1/2 mx-auto">
                        INSTITUIÇÃO DE ENSINO (IFCE)<br />
                        (Assinatura e Carimbo)
                    </div>
                </div>
            </div>

        </div>
    )
})

AdditiveTermDocument.displayName = 'AdditiveTermDocument'
