/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import { getAssetUrl } from '@/lib/pdf-generator-react'
import { Document, Page, Text, View, Image } from '@react-pdf/renderer'
import { commonStyles, formatDate } from '@/lib/pdf-styles-react'

interface RealizationTermDocumentProps {
    data: {
        // Dados do Estagiário
        student_name: string
        student_cpf: string
        student_rg: string
        student_course: string
        student_enrollment: string

        // Dados da Empresa
        company_name: string
        company_cnpj: string
        company_address: string
        company_supervisor: string

        // Dados do Estágio
        internship_start_date: string
        internship_end_date: string
        total_hours: string
        weekly_hours: string

        // Atividades Desenvolvidas
        activities: string

        // Avaliação do Desempenho
        performance_evaluation: string

        // Cidade e Data
        city: string
        date_day: string
        date_month: string
        date_year: string
    }
}

export const RealizationTermDocument: React.FC<RealizationTermDocumentProps> = ({ data }) => (
    <Document>
        <Page size="A4" style={commonStyles.page}>
            {/* Cabeçalho */}
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

            <Text style={commonStyles.title}>TERMO DE REALIZAÇÃO DE ESTÁGIO</Text>

            {/* Dados do Estagiário */}
            <Text style={commonStyles.sectionHeader}>DADOS DO ESTAGIÁRIO</Text>
            <View style={commonStyles.table}>
                <View style={commonStyles.tableRow}>
                    <View style={[commonStyles.tableCell, { width: '75%' }]}>
                        <Text style={commonStyles.label}>NOME COMPLETO</Text>
                        <Text style={commonStyles.value}>{data.student_name}</Text>
                    </View>
                    <View style={[commonStyles.tableCell, commonStyles.tableCellLast, { width: '25%' }]}>
                        <Text style={commonStyles.label}>CPF</Text>
                        <Text style={commonStyles.value}>{data.student_cpf}</Text>
                    </View>
                </View>
                <View style={[commonStyles.tableRow, { borderBottom: 0 }]}>
                    <View style={[commonStyles.tableCell, { width: '25%' }]}>
                        <Text style={commonStyles.label}>RG</Text>
                        <Text style={commonStyles.value}>{data.student_rg}</Text>
                    </View>
                    <View style={[commonStyles.tableCell, { width: '50%' }]}>
                        <Text style={commonStyles.label}>CURSO</Text>
                        <Text style={commonStyles.value}>{data.student_course}</Text>
                    </View>
                    <View style={[commonStyles.tableCell, commonStyles.tableCellLast, { width: '25%' }]}>
                        <Text style={commonStyles.label}>MATRÍCULA</Text>
                        <Text style={commonStyles.value}>{data.student_enrollment}</Text>
                    </View>
                </View>
            </View>

            {/* Dados da Empresa */}
            <Text style={commonStyles.sectionHeader}>DADOS DA EMPRESA CONCEDENTE</Text>
            <View style={commonStyles.table}>
                <View style={commonStyles.tableRow}>
                    <View style={[commonStyles.tableCell, { width: '75%' }]}>
                        <Text style={commonStyles.label}>RAZÃO SOCIAL</Text>
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
                <View style={[commonStyles.tableRow, { borderBottom: 0 }]}>
                    <View style={[commonStyles.tableCell, commonStyles.tableCellLast, { width: '100%' }]}>
                        <Text style={commonStyles.label}>SUPERVISOR DO ESTÁGIO</Text>
                        <Text style={commonStyles.value}>{data.company_supervisor}</Text>
                    </View>
                </View>
            </View>

            {/* Dados do Estágio */}
            <Text style={commonStyles.sectionHeader}>DADOS DO ESTÁGIO REALIZADO</Text>
            <View style={commonStyles.table}>
                <View style={[commonStyles.tableRow, { borderBottom: 0 }]}>
                    <View style={[commonStyles.tableCell, { width: '25%' }]}>
                        <Text style={commonStyles.label}>DATA DE INÍCIO</Text>
                        <Text style={commonStyles.value}>{formatDate(data.internship_start_date)}</Text>
                    </View>
                    <View style={[commonStyles.tableCell, { width: '25%' }]}>
                        <Text style={commonStyles.label}>DATA DE TÉRMINO</Text>
                        <Text style={commonStyles.value}>{formatDate(data.internship_end_date)}</Text>
                    </View>
                    <View style={[commonStyles.tableCell, { width: '25%' }]}>
                        <Text style={commonStyles.label}>CARGA HORÁRIA TOTAL</Text>
                        <Text style={commonStyles.value}>{data.total_hours} HORAS</Text>
                    </View>
                    <View style={[commonStyles.tableCell, commonStyles.tableCellLast, { width: '25%' }]}>
                        <Text style={commonStyles.label}>CARGA HORÁRIA SEMANAL</Text>
                        <Text style={commonStyles.value}>{data.weekly_hours} HORAS</Text>
                    </View>
                </View>
            </View>

            {/* Atividades Desenvolvidas */}
            <Text style={commonStyles.sectionHeader}>ATIVIDADES DESENVOLVIDAS DURANTE O ESTÁGIO</Text>
            <View style={commonStyles.textBox}>
                <Text>{data.activities}</Text>
            </View>

            {/* Avaliação do Desempenho */}
            <Text style={commonStyles.sectionHeader}>AVALIAÇÃO DO DESEMPENHO DO ESTAGIÁRIO</Text>
            <View style={[commonStyles.textBox, { minHeight: 80 }]}>
                <Text>{data.performance_evaluation}</Text>
            </View>

            {/* Declaração */}
            <Text style={commonStyles.paragraph}>
                Declaramos, para os devidos fins, que o(a) estagiário(a) acima identificado(a) concluiu com êxito as atividades de estágio no período de <Text style={commonStyles.bold}>{formatDate(data.internship_start_date)}</Text> a <Text style={commonStyles.bold}>{formatDate(data.internship_end_date)}</Text>, cumprindo a carga horária total de <Text style={commonStyles.bold}>{data.total_hours} horas</Text>, conforme estabelecido no Termo de Compromisso de Estágio.
            </Text>

            <Text style={commonStyles.dateRight}>
                {data.city || 'Fortaleza'} - CE, {data.date_day || '___'} de {data.date_month || '_______________'} de {data.date_year || '20___'}.
            </Text>

            {/* Assinaturas */}
            <View style={commonStyles.signatureBlock}>
                <View style={commonStyles.signatureLine}>
                    <Text style={commonStyles.bold}>{data.company_name || 'EMPRESA CONCEDENTE'}</Text>
                    <Text>{data.company_supervisor}</Text>
                    <Text>Supervisor do Estágio</Text>
                </View>

                <View style={commonStyles.signatureLine}>
                    <Text style={commonStyles.bold}>{data.student_name || 'ESTAGIÁRIO(A)'}</Text>
                    <Text>CPF: {data.student_cpf}</Text>
                </View>

                <View style={commonStyles.signatureLine}>
                    <Text style={commonStyles.bold}>INSTITUIÇÃO DE ENSINO - IFCE CAMPUS MARACANAÚ</Text>
                    <Text>Coordenador de Estágios</Text>
                </View>
            </View>
        </Page>
    </Document>
)
