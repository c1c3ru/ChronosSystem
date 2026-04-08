
import React from 'react'
import { LOGO_IFCE_BASE64, BRASAO_BASE64 } from '@/lib/pdf-assets'
import { Document, Page, Text, View, Image } from '@react-pdf/renderer'
import { commonStyles, formatDate } from '@/lib/pdf-styles-react'

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

export const ProfessionalDeclarationDocument: React.FC<ProfessionalDeclarationDocumentProps> = ({ data }) => (
    <Document>
        <Page size="A4" style={commonStyles.page}>
            <View style={commonStyles.header}>
                <Image src={LOGO_IFCE_BASE64} style={commonStyles.logo} />
                <View style={commonStyles.headerCenter}>
                    <Text style={commonStyles.headerTitle}>PRÓ-REITORIA DE EXTENSÃO</Text>
                    <Text style={commonStyles.headerSubtitle}>COORDENAÇÃO DE ESTÁGIOS E ACOMPANHAMENTO DE EGRESSOS</Text>
                    <Text style={commonStyles.headerSubtitle}>IFCE Campus Maracanaú</Text>
                    <Text style={commonStyles.headerSubtitle}>Setor de Acompanhamento de Estágio</Text>
                </View>
                <Image src={BRASAO_BASE64} style={commonStyles.logo} />
            </View>

            <Text style={commonStyles.title}>DECLARAÇÃO DE ATIVIDADES PROFISSIONAIS</Text>

            <View style={commonStyles.table}>
                <View style={commonStyles.tableRow}>
                    <View style={[commonStyles.tableCell, { width: '75%' }]}>
                        <Text style={commonStyles.label}>EMPRESA</Text>
                        <Text style={commonStyles.value}>{data.company_name}</Text>
                    </View>
                    <View style={[commonStyles.tableCell, commonStyles.tableCellLast, { width: '25%' }]}>
                        <Text style={commonStyles.label}>CNPJ</Text>
                        <Text style={commonStyles.value}>{data.company_cnpj}</Text>
                    </View>
                </View>
                <View style={commonStyles.tableRow}>
                    <View style={[commonStyles.tableCell, commonStyles.tableCellLast, { width: '100%' }]}>
                        <Text style={commonStyles.label}>ENDEREÇO</Text>
                        <Text style={commonStyles.value}>{data.company_address}</Text>
                    </View>
                </View>
                <View style={commonStyles.tableRow}>
                    <View style={[commonStyles.tableCell, { width: '75%' }]}>
                        <Text style={commonStyles.label}>FUNCIONÁRIO</Text>
                        <Text style={commonStyles.value}>{data.employee_name}</Text>
                    </View>
                    <View style={[commonStyles.tableCell, commonStyles.tableCellLast, { width: '25%' }]}>
                        <Text style={commonStyles.label}>CPF</Text>
                        <Text style={commonStyles.value}>{data.employee_cpf}</Text>
                    </View>
                </View>
                <View style={commonStyles.tableRow}>
                    <View style={[commonStyles.tableCell, { width: '50%' }]}>
                        <Text style={commonStyles.label}>CTPS</Text>
                        <Text style={commonStyles.value}>{data.employee_ctps}</Text>
                    </View>
                    <View style={[commonStyles.tableCell, commonStyles.tableCellLast, { width: '50%' }]}>
                        <Text style={commonStyles.label}>SÉRIE</Text>
                        <Text style={commonStyles.value}>{data.employee_ctps_series}</Text>
                    </View>
                </View>
                <View style={[commonStyles.tableRow, { borderBottom: 0 }]}>
                    <View style={[commonStyles.tableCell, { width: '33.33%' }]}>
                        <Text style={commonStyles.label}>DATA DE ADMISSÃO</Text>
                        <Text style={commonStyles.value}>{formatDate(data.start_date)}</Text>
                    </View>
                    <View style={[commonStyles.tableCell, { width: '33.33%' }]}>
                        <Text style={commonStyles.label}>CARGO</Text>
                        <Text style={commonStyles.value}>{data.role}</Text>
                    </View>
                    <View style={[commonStyles.tableCell, commonStyles.tableCellLast, { width: '33.33%' }]}>
                        <Text style={commonStyles.label}>CARGA HORÁRIA SEMANAL</Text>
                        <Text style={commonStyles.value}>{data.weekly_hours}h</Text>
                    </View>
                </View>
            </View>

            <Text style={commonStyles.sectionHeader}>ATIVIDADES PROFISSIONAIS DESENVOLVIDAS</Text>
            <View style={commonStyles.textBox}>
                <Text>{data.activities}</Text>
            </View>

            <Text style={commonStyles.paragraph}>
                Declaramos, para os devidos fins, que o(a) funcionário(a) acima identificado(a) exerce atividades profissionais em nossa empresa desde <Text style={commonStyles.bold}>{formatDate(data.start_date)}</Text>, no cargo de <Text style={commonStyles.bold}>{data.role}</Text>, com carga horária semanal de <Text style={commonStyles.bold}>{data.weekly_hours} horas</Text>.
            </Text>

            <Text style={commonStyles.dateRight}>
                {data.city || 'Fortaleza'} - CE, {data.date_day || '___'} de {data.date_month || '_______________'} de {data.date_year || '20___'}.
            </Text>

            <View style={commonStyles.signatureBlock}>
                <View style={commonStyles.signatureLine}>
                    <Text style={commonStyles.bold}>{data.company_name || 'EMPRESA'}</Text>
                    <Text>Representante Legal</Text>
                    <Text>Assinatura e Carimbo</Text>
                </View>
            </View>
        </Page>
    </Document>
)
