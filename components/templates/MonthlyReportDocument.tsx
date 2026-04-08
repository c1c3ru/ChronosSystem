import React from 'react'
import { LOGO_IFCE_BASE64, BRASAO_BASE64 } from '@/lib/pdf-assets'
import { Document, Page, Text, View, Image } from '@react-pdf/renderer'
import { commonStyles, formatDate } from '@/lib/pdf-styles-react'

interface MonthlyReportDocumentProps {
    data: {
        nome_estudante: string
        curso_estudante: string
        matricula_estudante: string
        nome_supervisor: string
        nome_orientador: string
        inicio_periodo: string
        fim_periodo: string
        horas_mes: string
        atividades: string
        dificuldades: string
        solucoes: string
    }
}

export const MonthlyReportDocument: React.FC<MonthlyReportDocumentProps> = ({ data }) => (
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

            <Text style={commonStyles.title}>RELATÓRIO MENSAL DE ATIVIDADES</Text>

            <View style={commonStyles.table}>
                <View style={commonStyles.tableRow}>
                    <View style={[commonStyles.tableCell, { width: '75%' }]}>
                        <Text style={commonStyles.label}>NOME DO DISCENTE</Text>
                        <Text style={commonStyles.value}>{data.nome_estudante}</Text>
                    </View>
                    <View style={[commonStyles.tableCell, commonStyles.tableCellLast, { width: '25%' }]}>
                        <Text style={commonStyles.label}>MATRÍCULA</Text>
                        <Text style={commonStyles.value}>{data.matricula_estudante}</Text>
                    </View>
                </View>

                <View style={commonStyles.tableRow}>
                    <View style={[commonStyles.tableCell, commonStyles.tableCellLast]}>
                        <Text style={commonStyles.label}>CURSO</Text>
                        <Text style={commonStyles.value}>{data.curso_estudante}</Text>
                    </View>
                </View>

                <View style={commonStyles.tableRow}>
                    <View style={[commonStyles.tableCell, { width: '50%' }]}>
                        <Text style={commonStyles.label}>SUPERVISOR DO ESTÁGIO (Empresa/IFCE)</Text>
                        <Text style={commonStyles.value}>{data.nome_supervisor}</Text>
                    </View>
                    <View style={[commonStyles.tableCell, commonStyles.tableCellLast, { width: '50%' }]}>
                        <Text style={commonStyles.label}>DOCENTE ORIENTADOR (IFCE)</Text>
                        <Text style={commonStyles.value}>{data.nome_orientador}</Text>
                    </View>
                </View>

                <View style={commonStyles.tableRow}>
                    <View style={[commonStyles.tableCell, { width: '35%' }]}>
                        <Text style={commonStyles.label}>DATA INICIAL PARCIAL</Text>
                        <Text style={commonStyles.value}>{formatDate(data.inicio_periodo)}</Text>
                    </View>
                    <View style={[commonStyles.tableCell, { width: '35%' }]}>
                        <Text style={commonStyles.label}>DATA FINAL PARCIAL</Text>
                        <Text style={commonStyles.value}>{formatDate(data.fim_periodo)}</Text>
                    </View>
                    <View style={[commonStyles.tableCell, commonStyles.tableCellLast, { width: '30%' }]}>
                        <Text style={commonStyles.label}>CARGA HORÁRIA NO PERÍODO</Text>
                        <Text style={commonStyles.value}>{data.horas_mes} horas</Text>
                    </View>
                </View>
            </View>

            <View style={commonStyles.section}>
                <Text style={commonStyles.sectionTitle}>1. PRINCIPAIS ATIVIDADES DESENVOLVIDAS NO PERÍODO</Text>
                <View style={commonStyles.textArea}>
                    <Text style={commonStyles.text}>{data.atividades}</Text>
                </View>
            </View>

            <View style={commonStyles.section}>
                <Text style={commonStyles.sectionTitle}>2. DIFICULDADES ENCONTRADAS</Text>
                <View style={commonStyles.textArea}>
                    <Text style={commonStyles.text}>{data.dificuldades}</Text>
                </View>
            </View>

            <View style={commonStyles.section}>
                <Text style={commonStyles.sectionTitle}>3. SOLUÇÕES ADOTADAS</Text>
                <View style={commonStyles.textArea}>
                    <Text style={commonStyles.text}>{data.solucoes}</Text>
                </View>
            </View>

            <View style={commonStyles.signatureSection}>
                <View style={commonStyles.signatureBox}>
                    <View style={commonStyles.signatureLine} />
                    <Text style={commonStyles.signatureLabel}>SUPERVISOR DO ESTÁGIO</Text>
                </View>
                <View style={commonStyles.signatureBox}>
                    <View style={commonStyles.signatureLine} />
                    <Text style={commonStyles.signatureLabel}>DISCENTE ESTAGIÁRIO</Text>
                </View>
            </View>
        </Page>
    </Document>
)
