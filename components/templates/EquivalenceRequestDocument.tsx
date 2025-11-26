import React from 'react'
import { getAssetUrl } from '@/lib/pdf-generator-react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

interface EquivalenceRequestDocumentProps {
    data: {
        // Discente
        student_name: string
        student_enrollment: string
        student_course: string
        student_address: string
        student_phone: string
        student_email: string

        // Empresa
        company_name: string
        company_address: string
        company_phone: string
        company_email: string
        company_supervisor: string // Chefe Imediato

        // Atividades
        activities: string

        // Período
        start_date: string
        end_date: string
        total_hours: string

        // Documentos Anexos
        doc_work_card: string
        doc_service_declaration: string
        doc_activities_declaration: string
        doc_other: string
        doc_other_desc: string
    }
}

// Estilos do documento
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 9,
        fontFamily: 'Helvetica',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    headerCenter: {
        flex: 1,
        textAlign: 'center',
        paddingHorizontal: 10,
    },
    headerTitle: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 9,
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
        marginBottom: 15,
        textTransform: 'uppercase',
    },
    introText: {
        fontSize: 9,
        textAlign: 'justify',
        marginBottom: 15,
        lineHeight: 1.4,
        textIndent: 30,
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
        minHeight: 10,
    },
    textBox: {
        borderWidth: 1, borderStyle: 'solid',
        borderColor: '#000',
        padding: 8,
        fontSize: 9,
        minHeight: 80,
        marginBottom: 10,
        textAlign: 'justify',
    },
    periodTable: {
        width: '100%',
        marginBottom: 10,
        borderWidth: 1, borderStyle: 'solid',
        borderColor: '#000',
    },
    periodHeader: {
        backgroundColor: '#e0e0e0',
        padding: 4,
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        textTransform: 'uppercase',
        borderBottomWidth: 1, borderBottomStyle: 'solid',
        borderColor: '#000',
    },
    periodRow: {
        flexDirection: 'row',
    },
    periodCell: {
        flex: 1,
        padding: 8,
        borderRightWidth: 1, borderRightStyle: 'solid',
        borderColor: '#000',
        textAlign: 'center',
    },
    periodCellLast: {
        borderRight: 0,
    },
    checkboxContainer: {
        borderWidth: 1, borderStyle: 'solid',
        borderColor: '#000',
        padding: 8,
        marginBottom: 10,
    },
    checkboxTitle: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 8,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    checkbox: {
        width: 10,
        height: 10,
        borderWidth: 1, borderStyle: 'solid',
        borderColor: '#000',
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxText: {
        fontSize: 8,
    },
    checkboxMark: {
        fontSize: 8,
    },
    checkboxOtherRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxOtherText: {
        fontSize: 8,
        fontStyle: 'italic',
        marginLeft: 8,
        borderBottomWidth: 1, borderBottomStyle: 'solid',
        borderColor: '#000',
        flex: 1,
        paddingBottom: 2,
    },
    signatureBlock: {
        marginTop: 30,
        marginBottom: 20,
    },
    signatureLine: {
        borderTopWidth: 1, borderTopStyle: 'solid',
        borderColor: '#000',
        paddingTop: 5,
        width: '50%',
        marginHorizontal: 'auto',
        textAlign: 'center',
        fontSize: 8,
        marginBottom: 30,
    },
    parecerBox: {
        border: 2,
        borderColor: '#000',
        padding: 15,
        marginTop: 15,
    },
    parecerHeader: {
        backgroundColor: '#e0e0e0',
        padding: 4,
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        borderWidth: 1, borderStyle: 'solid',
        borderColor: '#000',
        marginBottom: 15,
    },
    parecerOptions: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 30,
        marginBottom: 15,
    },
    parecerOption: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    parecerCheckbox: {
        width: 12,
        height: 12,
        borderWidth: 1, borderStyle: 'solid',
        borderColor: '#000',
        marginRight: 8,
    },
    parecerLabel: {
        fontSize: 9,
    },
    justificativaTitle: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 8,
    },
    justificativaLine: {
        borderBottomWidth: 1, borderBottomStyle: 'solid',
        borderColor: '#000',
        height: 15,
        marginBottom: 8,
    },
    parecerSignature: {
        marginTop: 30,
        textAlign: 'center',
    },
    parecerSignatureLine: {
        borderTopWidth: 1, borderTopStyle: 'solid',
        borderColor: '#000',
        paddingTop: 5,
        width: '50%',
        marginHorizontal: 'auto',
        fontSize: 8,
        marginBottom: 5,
    },
    parecerDate: {
        fontSize: 8,
        marginTop: 5,
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

export const EquivalenceRequestDocument: React.FC<EquivalenceRequestDocumentProps> = ({ data }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Cabeçalho */}
            <View style={styles.header}>
                <Image src={getAssetUrl("/assets/logoifce.png")} style={styles.logo} />
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>PRÓ-REITORIA DE EXTENSÃO</Text>
                    <Text style={styles.headerSubtitle}>COORDENAÇÃO DE ESTÁGIOS E ACOMPANHAMENTO DE EGRESSOS</Text>
                    <Text style={styles.headerSubtitle}>IFCE Campus Maracanaú</Text>
                    <Text style={styles.headerSubtitle}>Setor de Acompanhamento de Estágio</Text>
                </View>
                <Image src={getAssetUrl("/assets/brasao.png")} style={styles.logo} />
            </View>

            <Text style={styles.title}>SOLICITAÇÃO DE EQUIVALÊNCIA DE ESTÁGIO</Text>

            <Text style={styles.introText}>
                Ilmo. Sr. Coordenador de Estágios do IFCE, venho requerer a V.Sa. a equivalência da atividade profissional que exerço/exerci, como Estágio Curricular Supervisionado, conforme documentação anexa.
            </Text>

            {/* Dados do Discente */}
            <Text style={styles.sectionHeader}>DADOS DO DISCENTE</Text>
            <View style={styles.table}>
                <View style={styles.tableRow}>
                    <View style={[styles.tableCell, styles.tableCellLast, { width: '100%' }]}>
                        <Text style={styles.label}>NOME</Text>
                        <Text style={styles.value}>{data.student_name}</Text>
                    </View>
                </View>
                <View style={styles.tableRow}>
                    <View style={[styles.tableCell, { width: '30%' }]}>
                        <Text style={styles.label}>MATRÍCULA</Text>
                        <Text style={styles.value}>{data.student_enrollment}</Text>
                    </View>
                    <View style={[styles.tableCell, styles.tableCellLast, { width: '70%' }]}>
                        <Text style={styles.label}>CURSO</Text>
                        <Text style={styles.value}>{data.student_course}</Text>
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
            <Text style={styles.sectionHeader}>DADOS DA EMPRESA / INSTITUIÇÃO</Text>
            <View style={styles.table}>
                <View style={styles.tableRow}>
                    <View style={[styles.tableCell, styles.tableCellLast, { width: '100%' }]}>
                        <Text style={styles.label}>NOME DA EMPRESA</Text>
                        <Text style={styles.value}>{data.company_name}</Text>
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
                        <Text style={styles.label}>E-MAIL</Text>
                        <Text style={styles.value}>{data.company_email}</Text>
                    </View>
                </View>
                <View style={[styles.tableRow, { borderBottom: 0 }]}>
                    <View style={[styles.tableCell, styles.tableCellLast, { width: '100%' }]}>
                        <Text style={styles.label}>CHEFE IMEDIATO</Text>
                        <Text style={styles.value}>{data.company_supervisor}</Text>
                    </View>
                </View>
            </View>

            {/* Descrição das Atividades */}
            <Text style={styles.sectionHeader}>DESCRIÇÃO DAS ATIVIDADES DESENVOLVIDAS</Text>
            <View style={styles.textBox}>
                <Text>{data.activities}</Text>
            </View>

            {/* Período de Realização */}
            <View style={styles.periodTable}>
                <View style={styles.periodHeader}>
                    <Text>PERÍODO DE REALIZAÇÃO</Text>
                </View>
                <View style={styles.periodRow}>
                    <View style={[styles.periodCell, { borderRightWidth: 1, borderRightStyle: 'solid', borderColor: '#000' }]}>
                        <Text style={styles.label}>DATA INICIAL</Text>
                        <Text style={[styles.value, { marginTop: 4 }]}>{formatDate(data.start_date)}</Text>
                    </View>
                    <View style={[styles.periodCell, { borderRightWidth: 1, borderRightStyle: 'solid', borderColor: '#000' }]}>
                        <Text style={styles.label}>DATA FINAL</Text>
                        <Text style={[styles.value, { marginTop: 4 }]}>{formatDate(data.end_date)}</Text>
                    </View>
                    <View style={styles.periodCellLast}>
                        <Text style={styles.label}>CARGA HORÁRIA TOTAL</Text>
                        <Text style={[styles.value, { marginTop: 4 }]}>{data.total_hours} HORAS</Text>
                    </View>
                </View>
            </View>

            {/* Documentos Anexos */}
            <View style={styles.checkboxContainer}>
                <Text style={styles.checkboxTitle}>DOCUMENTOS ANEXOS (CÓPIAS AUTENTICADAS OU COM O ORIGINAL):</Text>

                <View style={styles.checkboxRow}>
                    <View style={styles.checkbox}>
                        {data.doc_work_card === 'true' && <Text style={styles.checkboxMark}>X</Text>}
                    </View>
                    <Text style={styles.checkboxText}>Carteira de Trabalho (páginas da foto, qualificação civil e contrato de trabalho)</Text>
                </View>

                <View style={styles.checkboxRow}>
                    <View style={styles.checkbox}>
                        {data.doc_service_declaration === 'true' && <Text style={styles.checkboxMark}>X</Text>}
                    </View>
                    <Text style={styles.checkboxText}>Declaração de Tempo de Serviço (em papel timbrado da empresa)</Text>
                </View>

                <View style={styles.checkboxRow}>
                    <View style={styles.checkbox}>
                        {data.doc_activities_declaration === 'true' && <Text style={styles.checkboxMark}>X</Text>}
                    </View>
                    <Text style={styles.checkboxText}>Declaração de Atividades Profissionais (com descrição detalhada)</Text>
                </View>

                <View style={styles.checkboxOtherRow}>
                    <View style={styles.checkbox}>
                        {data.doc_other === 'true' && <Text style={styles.checkboxMark}>X</Text>}
                    </View>
                    <Text style={styles.checkboxText}>Outros:</Text>
                    <Text style={styles.checkboxOtherText}>{data.doc_other_desc}</Text>
                </View>
            </View>

            {/* Assinatura do Aluno */}
            <View style={styles.signatureBlock}>
                <View style={styles.signatureLine}>
                    <Text>ASSINATURA DO DISCENTE</Text>
                </View>
            </View>

            {/* Parecer da Coordenação */}
            <View style={styles.parecerBox}>
                <View style={styles.parecerHeader}>
                    <Text>PARECER DA COORDENAÇÃO DE ESTÁGIOS</Text>
                </View>

                <View style={styles.parecerOptions}>
                    <View style={styles.parecerOption}>
                        <View style={styles.parecerCheckbox} />
                        <Text style={styles.parecerLabel}>DEFERIDO</Text>
                    </View>
                    <View style={styles.parecerOption}>
                        <View style={styles.parecerCheckbox} />
                        <Text style={styles.parecerLabel}>INDEFERIDO</Text>
                    </View>
                </View>

                <Text style={styles.justificativaTitle}>JUSTIFICATIVA:</Text>
                <View style={styles.justificativaLine} />
                <View style={styles.justificativaLine} />
                <View style={styles.justificativaLine} />

                <View style={styles.parecerSignature}>
                    <View style={styles.parecerSignatureLine}>
                        <Text>COORDENADOR DE ESTÁGIOS</Text>
                    </View>
                    <Text style={styles.parecerDate}>DATA: ___/___/_____</Text>
                </View>
            </View>
        </Page>
    </Document>
)
