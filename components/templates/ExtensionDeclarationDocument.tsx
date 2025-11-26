import React from 'react'
import { getAssetUrl } from '@/lib/pdf-generator-react'
import { Document, Page, Text, View, Image } from '@react-pdf/renderer'
import { commonStyles, formatDate } from '@/lib/pdf-styles-react'

interface ExtensionDeclarationDocumentProps {
    data: {
        student_name: string
        student_cpf: string
        student_course: string
        student_enrollment: string
        company_name: string
        original_end_date: string
        new_end_date: string
        extension_reason: string
        city: string
        date_day: string
        date_month: string
        date_year: string
    }
}

export const ExtensionDeclarationDocument: React.FC<ExtensionDeclarationDocumentProps> = ({ data }) => (
    <Document>
        <Page size="A4" style={commonStyles.page}>
            <View style={commonStyles.header}>
                <Image src={getAssetUrl("/assets/logoifce.png")} style={commonStyles.logo} />
                <View style={commonStyles.headerCenter}>
                    <Text style={commonStyles.headerTitle}>PRÓ-REITORIA DE EXTENSÃO</Text>
                    <Text style={commonStyles.headerSubtitle}>COORDENAÇÃO DE ESTÁGIOS E ACOMPANHAMENTO DE EGRESSOS</Text>
                    <Text style={commonStyles.headerSubtitle}>IFCE Campus Maracanaú</Text>
                    <Text style={commonStyles.headerSubtitle}>Setor de Acompanhamento de Estágio</Text>
                </View>
                <Image src={getAssetUrl("/assets/brasao.png")} style={commonStyles.logo} />
            </View>

            <Text style={commonStyles.title}>DECLARAÇÃO DE PRORROGAÇÃO DE ESTÁGIO</Text>

            <View style={commonStyles.table}>
                <View style={commonStyles.tableRow}>
                    <View style={[commonStyles.tableCell, { width: '75%' }]}>
                        <Text style={commonStyles.label}>NOME DO ESTAGIÁRIO</Text>
                        <Text style={commonStyles.value}>{data.student_name}</Text>
                    </View>
                    <View style={[commonStyles.tableCell, commonStyles.tableCellLast, { width: '25%' }]}>
                        <Text style={commonStyles.label}>CPF</Text>
                        <Text style={commonStyles.value}>{data.student_cpf}</Text>
                    </View>
                </View>
                <View style={commonStyles.tableRow}>
                    <View style={[commonStyles.tableCell, { width: '75%' }]}>
                        <Text style={commonStyles.label}>CURSO</Text>
                        <Text style={commonStyles.value}>{data.student_course}</Text>
                    </View>
                    <View style={[commonStyles.tableCell, commonStyles.tableCellLast, { width: '25%' }]}>
                        <Text style={commonStyles.label}>MATRÍCULA</Text>
                        <Text style={commonStyles.value}>{data.student_enrollment}</Text>
                    </View>
                </View>
                <View style={commonStyles.tableRow}>
                    <View style={[commonStyles.tableCell, commonStyles.tableCellLast, { width: '100%' }]}>
                        <Text style={commonStyles.label}>EMPRESA CONCEDENTE</Text>
                        <Text style={commonStyles.value}>{data.company_name}</Text>
                    </View>
                </View>
                <View style={[commonStyles.tableRow, { borderBottom: 0 }]}>
                    <View style={[commonStyles.tableCell, { width: '50%' }]}>
                        <Text style={commonStyles.label}>DATA DE TÉRMINO ORIGINAL</Text>
                        <Text style={commonStyles.value}>{formatDate(data.original_end_date)}</Text>
                    </View>
                    <View style={[commonStyles.tableCell, commonStyles.tableCellLast, { width: '50%' }]}>
                        <Text style={commonStyles.label}>NOVA DATA DE TÉRMINO</Text>
                        <Text style={commonStyles.value}>{formatDate(data.new_end_date)}</Text>
                    </View>
                </View>
            </View>

            <Text style={commonStyles.sectionHeader}>JUSTIFICATIVA DA PRORROGAÇÃO</Text>
            <View style={commonStyles.textBox}>
                <Text>{data.extension_reason}</Text>
            </View>

            <Text style={commonStyles.paragraph}>
                Declaramos, para os devidos fins, que o estágio do(a) aluno(a) acima identificado(a), que tinha término previsto para <Text style={commonStyles.bold}>{formatDate(data.original_end_date)}</Text>, foi prorrogado até <Text style={commonStyles.bold}>{formatDate(data.new_end_date)}</Text>, conforme justificativa apresentada.
            </Text>

            <Text style={commonStyles.dateRight}>
                {data.city || 'Fortaleza'} - CE, {data.date_day || '___'} de {data.date_month || '_______________'} de {data.date_year || '20___'}.
            </Text>

            <View style={commonStyles.signatureBlock}>
                <View style={commonStyles.signatureLine}>
                    <Text style={commonStyles.bold}>{data.student_name || 'ESTAGIÁRIO(A)'}</Text>
                    <Text>CPF: {data.student_cpf}</Text>
                </View>
                <View style={commonStyles.signatureLine}>
                    <Text style={commonStyles.bold}>{data.company_name || 'EMPRESA CONCEDENTE'}</Text>
                    <Text>Representante Legal</Text>
                </View>
                <View style={commonStyles.signatureLine}>
                    <Text style={commonStyles.bold}>INSTITUIÇÃO DE ENSINO - IFCE CAMPUS MARACANAÚ</Text>
                    <Text>Coordenador de Estágios</Text>
                </View>
            </View>
        </Page>
    </Document>
)
