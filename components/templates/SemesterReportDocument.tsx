import React from 'react'
import { Document, Page, Text, View, Image } from '@react-pdf/renderer'
import { commonStyles, formatDate } from '@/lib/pdf-styles-react'

interface SemesterReportDocumentProps {
    data: {
        student_name: string
        student_course: string
        student_enrollment: string
        supervisor_name: string
        advisor_name: string
        period_start: string
        period_end: string
        hours_semester: string
        hours_total: string
        activities: string
        comments: string
    }
}

export const SemesterReportDocument: React.FC<SemesterReportDocumentProps> = ({ data }) => (
    <Document>
        <Page size="A4" style={commonStyles.page}>
            <View style={commonStyles.header}>
                <Image src="/assets/logoifce.png" style={commonStyles.logo} />
                <View style={commonStyles.headerCenter}>
                    <Text style={commonStyles.headerTitle}>PRÓ-REITORIA DE EXTENSÃO</Text>
                    <Text style={commonStyles.headerSubtitle}>COORDENAÇÃO DE ESTÁGIOS E ACOMPANHAMENTO DE EGRESSOS</Text>
                    <Text style={commonStyles.headerSubtitle}>IFCE Campus Maracanaú</Text>
                    <Text style={commonStyles.headerSubtitle}>Setor de Acompanhamento de Estágio</Text>
                </View>
                <Image src="/assets/brasao.png" style={commonStyles.logo} />
            </View>

            <Text style={commonStyles.title}>RELATÓRIO SEMESTRAL DE ATIVIDADES</Text>

            <View style={commonStyles.table}>
                <View style={commonStyles.tableRow}>
                    <View style={[commonStyles.tableCell, { width: '75%' }]}>
                        <Text style={commonStyles.label}>NOME DO ESTAGIÁRIO</Text>
                        <Text style={commonStyles.value}>{data.student_name}</Text>
                    </View>
                    <View style={[commonStyles.tableCell, commonStyles.tableCellLast, { width: '25%' }]}>
                        <Text style={commonStyles.label}>MATRÍCULA</Text>
                        <Text style={commonStyles.value}>{data.student_enrollment}</Text>
                    </View>
                </View>
                <View style={commonStyles.tableRow}>
                    <View style={[commonStyles.tableCell, commonStyles.tableCellLast, { width: '100%' }]}>
                        <Text style={commonStyles.label}>CURSO</Text>
                        <Text style={commonStyles.value}>{data.student_course}</Text>
                    </View>
                </View>
                <View style={commonStyles.tableRow}>
                    <View style={[commonStyles.tableCell, { width: '50%' }]}>
                        <Text style={commonStyles.label}>SUPERVISOR</Text>
                        <Text style={commonStyles.value}>{data.supervisor_name}</Text>
                    </View>
                    <View style={[commonStyles.tableCell, commonStyles.tableCellLast, { width: '50%' }]}>
                        <Text style={commonStyles.label}>ORIENTADOR</Text>
                        <Text style={commonStyles.value}>{data.advisor_name}</Text>
                    </View>
                </View>
                <View style={[commonStyles.tableRow, { borderBottom: 0 }]}>
                    <View style={[commonStyles.tableCell, { width: '33.33%' }]}>
                        <Text style={commonStyles.label}>PERÍODO INICIAL</Text>
                        <Text style={commonStyles.value}>{formatDate(data.period_start)}</Text>
                    </View>
                    <View style={[commonStyles.tableCell, { width: '33.33%' }]}>
                        <Text style={commonStyles.label}>PERÍODO FINAL</Text>
                        <Text style={commonStyles.value}>{formatDate(data.period_end)}</Text>
                    </View>
                    <View style={[commonStyles.tableCell, commonStyles.tableCellLast, { width: '33.33%' }]}>
                        <Text style={commonStyles.label}>HORAS NO SEMESTRE</Text>
                        <Text style={commonStyles.value}>{data.hours_semester}</Text>
                    </View>
                </View>
            </View>

            <Text style={commonStyles.sectionHeader}>ATIVIDADES DESENVOLVIDAS NO SEMESTRE</Text>
            <View style={commonStyles.textBox}>
                <Text>{data.activities}</Text>
            </View>

            <Text style={commonStyles.sectionHeader}>COMENTÁRIOS E OBSERVAÇÕES</Text>
            <View style={[commonStyles.textBox, { minHeight: 80 }]}>
                <Text>{data.comments}</Text>
            </View>

            <View style={commonStyles.signatureBlock}>
                <View style={commonStyles.signatureLine}>
                    <Text style={commonStyles.bold}>{data.student_name || 'ESTAGIÁRIO(A)'}</Text>
                    <Text>Assinatura do Estagiário</Text>
                </View>
                <View style={commonStyles.signatureLine}>
                    <Text style={commonStyles.bold}>{data.supervisor_name || 'SUPERVISOR'}</Text>
                    <Text>Assinatura do Supervisor</Text>
                </View>
                <View style={commonStyles.signatureLine}>
                    <Text style={commonStyles.bold}>{data.advisor_name || 'ORIENTADOR'}</Text>
                    <Text>Assinatura do Orientador</Text>
                </View>
            </View>
        </Page>
    </Document>
)
