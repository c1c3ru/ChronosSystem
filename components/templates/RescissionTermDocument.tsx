/* eslint-disable jsx-a11y/alt-text */

import React from 'react'
import { LOGO_IFCE_BASE64, BRASAO_BASE64 } from '@/lib/pdf-assets'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

interface RescissionTermDocumentProps {
    data: {
        // Dados do Estagiário
        student_name: string
        student_cpf: string
        student_rg: string
        student_course: string
        student_enrollment: string
        student_address: string
        student_phone: string
        student_email: string

        // Dados da Empresa
        company_name: string
        company_cnpj: string
        company_address: string
        company_phone: string
        company_representative: string
        company_representative_cpf: string

        // Dados do Estágio
        internship_start_date: string
        internship_end_date: string
        rescission_date: string
        rescission_reason: string

        // Dados do Termo de Compromisso Original
        original_term_date: string

        // Cidade e Data
        city: string
        date_day: string
        date_month: string
        date_year: string
    }
}

// Estilos do documento
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 10,
        fontFamily: 'Helvetica',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerCenter: {
        flex: 1,
        textAlign: 'center',
        paddingHorizontal: 10,
    },
    headerTitle: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 8,
        marginBottom: 2,
    },
    logo: {
        width: 50,
        height: 50,
    },
    title: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        marginBottom: 20,
        textTransform: 'uppercase',
    },
    sectionHeader: {
        backgroundColor: '#e0e0e0',
        padding: 4,
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        textTransform: 'uppercase',
        borderTopWidth: 1, borderTopStyle: 'solid',
        borderLeftWidth: 1, borderLeftStyle: 'solid',
        borderRightWidth: 1, borderRightStyle: 'solid',
        borderColor: '#000',
    },
    table: {
        width: '100%',
        marginBottom: 10,
        borderWidth: 1, borderStyle: 'solid',
        borderColor: '#000',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1, borderBottomStyle: 'solid',
        borderColor: '#000',
    },
    tableCell: {
        padding: 4,
        borderRightWidth: 1, borderRightStyle: 'solid',
        borderColor: '#000',
        fontSize: 7,
    },
    tableCellLast: {
        borderRight: 0,
    },
    label: {
        fontSize: 6,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    value: {
        fontSize: 8,
    },
    textBox: {
        borderWidth: 1, borderStyle: 'solid',
        borderColor: '#000',
        padding: 8,
        fontSize: 9,
        minHeight: 100,
        marginBottom: 10,
        textAlign: 'justify',
    },
    paragraph: {
        fontSize: 10,
        textAlign: 'justify',
        marginBottom: 15,
        lineHeight: 1.5,
    },
    dateRight: {
        fontSize: 10,
        textAlign: 'right',
        marginBottom: 30,
    },
    signatureBlock: {
        marginTop: 40,
        marginBottom: 20,
    },
    signatureLine: {
        borderTopWidth: 1, borderTopStyle: 'solid',
        borderColor: '#000',
        paddingTop: 5,
        width: '66%',
        marginHorizontal: 'auto',
        textAlign: 'center',
        fontSize: 8,
        marginBottom: 30,
    },
    bold: {
        fontFamily: 'Helvetica-Bold',
    },
})

const formatDate = (dateString: string): string => {
    if (!dateString) return '___/___/_____'
    const [year, month, day] = dateString.split('-')
    return `${day}/${month}/${year}`
}

export const RescissionTermDocument: React.FC<RescissionTermDocumentProps> = ({ data }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Cabeçalho */}
            <View style={styles.header}>
                <Image src={LOGO_IFCE_BASE64} style={styles.logo} />
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>PRÓ-REITORIA DE EXTENSÃO</Text>
                    <Text style={styles.headerSubtitle}>COORDENAÇÃO DE ESTÁGIOS E ACOMPANHAMENTO DE EGRESSOS</Text>
                    <Text style={styles.headerSubtitle}>IFCE Campus Maracanaú</Text>
                    <Text style={styles.headerSubtitle}>Setor de Acompanhamento de Estágio</Text>
                </View>
                <Image src={BRASAO_BASE64} style={styles.logo} />
            </View>

            <Text style={styles.title}>TERMO DE RESCISÃO DE CONTRATO DE ESTÁGIO</Text>

            {/* Dados do Estagiário */}
            <Text style={styles.sectionHeader}>DADOS DO ESTAGIÁRIO</Text>
            <View style={styles.table}>
                <View style={styles.tableRow}>
                    <View style={[styles.tableCell, { width: '75%' }]}>
                        <Text style={styles.label}>NOME COMPLETO</Text>
                        <Text style={styles.value}>{data.student_name}</Text>
                    </View>
                    <View style={[styles.tableCell, styles.tableCellLast, { width: '25%' }]}>
                        <Text style={styles.label}>CPF</Text>
                        <Text style={styles.value}>{data.student_cpf}</Text>
                    </View>
                </View>
                <View style={styles.tableRow}>
                    <View style={[styles.tableCell, { width: '25%' }]}>
                        <Text style={styles.label}>RG</Text>
                        <Text style={styles.value}>{data.student_rg}</Text>
                    </View>
                    <View style={[styles.tableCell, { width: '50%' }]}>
                        <Text style={styles.label}>CURSO</Text>
                        <Text style={styles.value}>{data.student_course}</Text>
                    </View>
                    <View style={[styles.tableCell, styles.tableCellLast, { width: '25%' }]}>
                        <Text style={styles.label}>MATRÍCULA</Text>
                        <Text style={styles.value}>{data.student_enrollment}</Text>
                    </View>
                </View>
                <View style={styles.tableRow}>
                    <View style={[styles.tableCell, styles.tableCellLast, { width: '100%' }]}>
                        <Text style={styles.label}>ENDEREÇO</Text>
                        <Text style={styles.value}>{data.student_address}</Text>
                    </View>
                </View>
                <View style={[styles.tableRow, { borderBottom: 0 }]}>
                    <View style={[styles.tableCell, { width: '50%' }]}>
                        <Text style={styles.label}>TELEFONE</Text>
                        <Text style={styles.value}>{data.student_phone}</Text>
                    </View>
                    <View style={[styles.tableCell, styles.tableCellLast, { width: '50%' }]}>
                        <Text style={styles.label}>E-MAIL</Text>
                        <Text style={styles.value}>{data.student_email}</Text>
                    </View>
                </View>
            </View>

            {/* Dados da Empresa */}
            <Text style={styles.sectionHeader}>DADOS DA EMPRESA CONCEDENTE</Text>
            <View style={styles.table}>
                <View style={styles.tableRow}>
                    <View style={[styles.tableCell, { width: '75%' }]}>
                        <Text style={styles.label}>RAZÃO SOCIAL</Text>
                        <Text style={styles.value}>{data.company_name}</Text>
                    </View>
                    <View style={[styles.tableCell, styles.tableCellLast, { width: '25%' }]}>
                        <Text style={styles.label}>CNPJ</Text>
                        <Text style={styles.value}>{data.company_cnpj}</Text>
                    </View>
                </View>
                <View style={styles.tableRow}>
                    <View style={[styles.tableCell, styles.tableCellLast, { width: '100%' }]}>
                        <Text style={styles.label}>ENDEREÇO</Text>
                        <Text style={styles.value}>{data.company_address}</Text>
                    </View>
                </View>
                <View style={styles.tableRow}>
                    <View style={[styles.tableCell, { width: '50%' }]}>
                        <Text style={styles.label}>TELEFONE</Text>
                        <Text style={styles.value}>{data.company_phone}</Text>
                    </View>
                    <View style={[styles.tableCell, styles.tableCellLast, { width: '50%' }]}>
                        <Text style={styles.label}>REPRESENTANTE LEGAL</Text>
                        <Text style={styles.value}>{data.company_representative}</Text>
                    </View>
                </View>
                <View style={[styles.tableRow, { borderBottom: 0 }]}>
                    <View style={[styles.tableCell, styles.tableCellLast, { width: '100%' }]}>
                        <Text style={styles.label}>CPF DO REPRESENTANTE</Text>
                        <Text style={styles.value}>{data.company_representative_cpf}</Text>
                    </View>
                </View>
            </View>

            {/* Dados do Estágio */}
            <Text style={styles.sectionHeader}>DADOS DO ESTÁGIO</Text>
            <View style={styles.table}>
                <View style={styles.tableRow}>
                    <View style={[styles.tableCell, { width: '50%' }]}>
                        <Text style={styles.label}>DATA DE INÍCIO DO ESTÁGIO</Text>
                        <Text style={styles.value}>{formatDate(data.internship_start_date)}</Text>
                    </View>
                    <View style={[styles.tableCell, styles.tableCellLast, { width: '50%' }]}>
                        <Text style={styles.label}>DATA PREVISTA DE TÉRMINO</Text>
                        <Text style={styles.value}>{formatDate(data.internship_end_date)}</Text>
                    </View>
                </View>
                <View style={[styles.tableRow, { borderBottom: 0 }]}>
                    <View style={[styles.tableCell, { width: '50%' }]}>
                        <Text style={styles.label}>DATA DO TERMO DE COMPROMISSO ORIGINAL</Text>
                        <Text style={styles.value}>{formatDate(data.original_term_date)}</Text>
                    </View>
                    <View style={[styles.tableCell, styles.tableCellLast, { width: '50%' }]}>
                        <Text style={styles.label}>DATA DA RESCISÃO</Text>
                        <Text style={styles.value}>{formatDate(data.rescission_date)}</Text>
                    </View>
                </View>
            </View>

            {/* Motivo da Rescisão */}
            <Text style={styles.sectionHeader}>MOTIVO DA RESCISÃO</Text>
            <View style={styles.textBox}>
                <Text>{data.rescission_reason}</Text>
            </View>

            {/* Declaração */}
            <Text style={styles.paragraph}>
                Por meio deste instrumento, as partes acima qualificadas declaram rescindido, de comum acordo, o Termo de Compromisso de Estágio firmado em <Text style={styles.bold}>{formatDate(data.original_term_date)}</Text>, a partir da data de <Text style={styles.bold}>{formatDate(data.rescission_date)}</Text>, ficando as partes desobrigadas de quaisquer responsabilidades decorrentes do referido termo a partir desta data.
            </Text>

            <Text style={styles.dateRight}>
                {data.city || 'Fortaleza'} - CE, {data.date_day || '___'} de {data.date_month || '_______________'} de {data.date_year || '20___'}.
            </Text>

            {/* Assinaturas */}
            <View style={styles.signatureBlock}>
                <View style={styles.signatureLine}>
                    <Text style={styles.bold}>{data.student_name || 'ESTAGIÁRIO(A)'}</Text>
                    <Text>CPF: {data.student_cpf}</Text>
                    <Text>Assinatura do(a) Aluno(a)</Text>
                </View>

                <View style={styles.signatureLine}>
                    <Text style={styles.bold}>{data.company_name || 'EMPRESA CONCEDENTE'}</Text>
                    <Text>{data.company_representative}</Text>
                    <Text>CPF: {data.company_representative_cpf}</Text>
                    <Text>Responsável pela Empresa</Text>
                </View>

                <View style={styles.signatureLine}>
                    <Text style={styles.bold}>INSTITUIÇÃO DE ENSINO - IFCE CAMPUS MARACANAÚ</Text>
                    <Text>Coordenador de Estágios</Text>
                </View>
            </View>
        </Page>
    </Document>
)
