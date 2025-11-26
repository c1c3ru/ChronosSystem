import React from 'react'
import { getAssetUrl } from '@/lib/pdf-generator-react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

interface FinalReportDocumentProps {
    data: {
        student_name: string
        student_course: string
        student_enrollment: string
        supervisor_name: string
        advisor_name: string
        period_start: string
        period_end: string
        hours_total: string
        activities: string
        comments: string

        // Avaliações (1 a 4)
        eval_assiduity: string
        eval_guidance: string
        eval_communication: string
        eval_cooperation: string
        eval_discipline: string
        eval_knowledge: string
        eval_punctuality: string
        eval_delivery: string
        eval_proactivity: string
        eval_productivity: string
        eval_quality: string
        eval_relationship: string
        eval_responsibility: string
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
        minHeight: 10,
    },
    periodTable: {
        width: '100%',
        marginBottom: 10,
        borderWidth: 1, borderStyle: 'solid',
        borderColor: '#000',
    },
    periodHeader: {
        flexDirection: 'row',
        backgroundColor: '#e0e0e0',
        borderBottomWidth: 1, borderBottomStyle: 'solid',
        borderColor: '#000',
    },
    periodHeaderCell: {
        padding: 4,
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        textTransform: 'uppercase',
        borderRightWidth: 1, borderRightStyle: 'solid',
        borderColor: '#000',
    },
    periodHeaderCellLast: {
        borderRight: 0,
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
    textBox: {
        borderWidth: 1, borderStyle: 'solid',
        borderColor: '#000',
        padding: 8,
        fontSize: 9,
        minHeight: 400,
        marginBottom: 10,
        textAlign: 'justify',
    },
    evaluationContainer: {
        borderWidth: 1, borderStyle: 'solid',
        borderColor: '#000',
        marginBottom: 15,
    },
    evaluationHeader: {
        backgroundColor: '#e0e0e0',
        padding: 8,
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        borderBottomWidth: 1, borderBottomStyle: 'solid',
        borderColor: '#000',
    },
    evaluationBody: {
        flexDirection: 'row',
    },
    evaluationLegend: {
        width: '33%',
        padding: 8,
        borderRightWidth: 1, borderRightStyle: 'solid',
        borderColor: '#000',
    },
    evaluationLegendTitle: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        marginBottom: 15,
    },
    evaluationLegendItem: {
        fontSize: 8,
        marginBottom: 8,
        paddingLeft: 8,
    },
    evaluationTable: {
        width: '67%',
    },
    evaluationTableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1, borderBottomStyle: 'solid',
        borderColor: '#000',
    },
    evaluationTableHeaderCell: {
        padding: 4,
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        borderRightWidth: 1, borderRightStyle: 'solid',
        borderColor: '#000',
    },
    evaluationTableHeaderCellLast: {
        borderRight: 0,
    },
    evaluationTableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1, borderBottomStyle: 'solid',
        borderColor: '#000',
    },
    evaluationTableRowLast: {
        borderBottom: 0,
    },
    evaluationTableCell: {
        padding: 4,
        fontSize: 8,
        borderRightWidth: 1, borderRightStyle: 'solid',
        borderColor: '#000',
    },
    evaluationTableCellCenter: {
        textAlign: 'center',
        fontFamily: 'Helvetica-Bold',
    },
    evaluationTableCellLast: {
        borderRight: 0,
    },
    commentsBox: {
        borderWidth: 1, borderStyle: 'solid',
        borderColor: '#000',
        padding: 8,
        fontSize: 9,
        minHeight: 150,
        marginBottom: 20,
        textAlign: 'justify',
    },
    signatureTable: {
        width: '100%',
        borderWidth: 1, borderStyle: 'solid',
        borderColor: '#000',
    },
    signatureHeader: {
        flexDirection: 'row',
        backgroundColor: '#e0e0e0',
        borderBottomWidth: 1, borderBottomStyle: 'solid',
        borderColor: '#000',
    },
    signatureHeaderCell: {
        padding: 4,
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        borderRightWidth: 1, borderRightStyle: 'solid',
        borderColor: '#000',
    },
    signatureHeaderCellLast: {
        borderRight: 0,
    },
    signatureRow: {
        flexDirection: 'row',
        minHeight: 60,
        borderBottomWidth: 1, borderBottomStyle: 'solid',
        borderColor: '#000',
    },
    signatureRowLast: {
        borderBottom: 0,
    },
    signatureCell: {
        padding: 8,
        borderRightWidth: 1, borderRightStyle: 'solid',
        borderColor: '#000',
        justifyContent: 'flex-end',
    },
    signatureCellLast: {
        borderRight: 0,
    },
    signatureLabel: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
    },
    signatureDateLabel: {
        fontSize: 7,
        marginBottom: 20,
    },
    signatureDate: {
        fontSize: 8,
        textAlign: 'center',
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

export const FinalReportDocument: React.FC<FinalReportDocumentProps> = ({ data }) => {
    const evaluations = [
        { label: 'ASSIDUIDADE', value: data.eval_assiduity },
        { label: 'ATENDIMENTO ÀS ORIENTAÇÕES', value: data.eval_guidance },
        { label: 'COMUNICAÇÃO', value: data.eval_communication },
        { label: 'COOPERAÇÃO', value: data.eval_cooperation },
        { label: 'DISCIPLINA', value: data.eval_discipline },
        { label: 'CONHECIMENTO ADQUIRIDO NO ESTÁGIO', value: data.eval_knowledge },
        { label: 'PONTUALIDADE', value: data.eval_punctuality },
        { label: 'PONTUALIDADE NA ENTREGA DE DOCUMENTOS', value: data.eval_delivery },
        { label: 'PROATIVIDADE', value: data.eval_proactivity },
        { label: 'PRODUTIVIDADE', value: data.eval_productivity },
        { label: 'QUALIDADE NO DESEMPENHO DAS ATIVIDADES', value: data.eval_quality },
        { label: 'RELACIONAMENTO INTERPESSOAL', value: data.eval_relationship },
        { label: 'RESPONSABILIDADE', value: data.eval_responsibility },
    ]

    return (
        <Document>
            {/* Página 1 - Identificação */}
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

                <Text style={styles.title}>RELATÓRIO FINAL DE ATIVIDADES</Text>

                {/* Identificação */}
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, styles.tableCellLast, { width: '100%' }]}>
                            <Text style={styles.label}>DISCENTE ESTAGIÁRIO(A)</Text>
                            <Text style={styles.value}>{data.student_name}</Text>
                        </View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, { width: '75%' }]}>
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
                            <Text style={styles.label}>SUPERVISOR DO ESTÁGIO</Text>
                            <Text style={styles.value}>{data.supervisor_name}</Text>
                        </View>
                    </View>
                    <View style={[styles.tableRow, { borderBottom: 0 }]}>
                        <View style={[styles.tableCell, styles.tableCellLast, { width: '100%' }]}>
                            <Text style={styles.label}>DOCENTE ORIENTADOR</Text>
                            <Text style={styles.value}>{data.advisor_name}</Text>
                        </View>
                    </View>
                </View>

                {/* Período e Carga Horária */}
                <View style={styles.periodTable}>
                    <View style={styles.periodHeader}>
                        <View style={[styles.periodHeaderCell, { width: '33%' }]}>
                            <Text>PERÍODO</Text>
                        </View>
                        <View style={[styles.periodHeaderCell, { width: '33%' }]}>
                            <Text></Text>
                        </View>
                        <View style={[styles.periodHeaderCell, styles.periodHeaderCellLast, { width: '34%' }]}>
                            <Text>CARGA HORÁRIA</Text>
                        </View>
                    </View>
                    <View style={styles.periodRow}>
                        <View style={[styles.periodCell, { width: '33%' }]}>
                            <Text style={styles.label}>DATA INICIAL</Text>
                            <Text style={[styles.value, { marginTop: 4 }]}>{formatDate(data.period_start)}</Text>
                        </View>
                        <View style={[styles.periodCell, { width: '33%' }]}>
                            <Text style={styles.label}>DATA FINAL</Text>
                            <Text style={[styles.value, { marginTop: 4 }]}>{formatDate(data.period_end)}</Text>
                        </View>
                        <View style={[styles.periodCell, styles.periodCellLast, { width: '34%' }]}>
                            <Text style={styles.label}>CARGA HORÁRIA TOTAL</Text>
                            <Text style={[styles.value, { marginTop: 4 }]}>{data.hours_total} HORAS</Text>
                        </View>
                    </View>
                </View>

                {/* Atividades */}
                <Text style={styles.sectionHeader}>PRINCIPAIS ATIVIDADES DESENVOLVIDAS NO ESTÁGIO DURANTE O PERÍODO</Text>
                <View style={styles.textBox}>
                    <Text>{data.activities}</Text>
                </View>
            </Page>

            {/* Página 2 - Avaliação */}
            <Page size="A4" style={styles.page}>
                {/* Avaliação */}
                <View style={styles.evaluationContainer}>
                    <Text style={styles.evaluationHeader}>AVALIAÇÃO AO DISCENTE ESTAGIÁRIO</Text>
                    <View style={styles.evaluationBody}>
                        {/* Legenda */}
                        <View style={styles.evaluationLegend}>
                            <Text style={styles.evaluationLegendTitle}>
                                ATRIBUIR VALORES ÀS CARACTERÍSTICAS DO ESTAGIÁRIO, DE ACORDO COM OS CONCEITOS
                            </Text>
                            <Text style={styles.evaluationLegendItem}>( 1 ) INSATISFATÓRIO</Text>
                            <Text style={styles.evaluationLegendItem}>( 2 ) POUCO SATISFATÓRIO</Text>
                            <Text style={styles.evaluationLegendItem}>( 3 ) SATISFATÓRIO</Text>
                            <Text style={styles.evaluationLegendItem}>( 4 ) MUITO SATISFATÓRIO</Text>
                        </View>

                        {/* Tabela de Avaliação */}
                        <View style={styles.evaluationTable}>
                            <View style={styles.evaluationTableHeader}>
                                <View style={[styles.evaluationTableHeaderCell, { width: '60%' }]}>
                                    <Text>CONCEITOS</Text>
                                </View>
                                <View style={[styles.evaluationTableHeaderCell, { width: '10%' }]}>
                                    <Text>(1)</Text>
                                </View>
                                <View style={[styles.evaluationTableHeaderCell, { width: '10%' }]}>
                                    <Text>(2)</Text>
                                </View>
                                <View style={[styles.evaluationTableHeaderCell, { width: '10%' }]}>
                                    <Text>(3)</Text>
                                </View>
                                <View style={[styles.evaluationTableHeaderCell, styles.evaluationTableHeaderCellLast, { width: '10%' }]}>
                                    <Text>(4)</Text>
                                </View>
                            </View>

                            {evaluations.map((evaluation, index) => (
                                <View
                                    key={evaluation.label}
                                    style={[
                                        styles.evaluationTableRow,
                                        ...(index === evaluations.length - 1 ? [styles.evaluationTableRowLast] : [])
                                    ]}
                                >
                                    <View style={[styles.evaluationTableCell, { width: '60%' }]}>
                                        <Text>{evaluation.label}</Text>
                                    </View>
                                    <View style={[styles.evaluationTableCell, styles.evaluationTableCellCenter, { width: '10%' }]}>
                                        <Text>{evaluation.value === '1' ? 'X' : ''}</Text>
                                    </View>
                                    <View style={[styles.evaluationTableCell, styles.evaluationTableCellCenter, { width: '10%' }]}>
                                        <Text>{evaluation.value === '2' ? 'X' : ''}</Text>
                                    </View>
                                    <View style={[styles.evaluationTableCell, styles.evaluationTableCellCenter, { width: '10%' }]}>
                                        <Text>{evaluation.value === '3' ? 'X' : ''}</Text>
                                    </View>
                                    <View style={[styles.evaluationTableCell, styles.evaluationTableCellCenter, styles.evaluationTableCellLast, { width: '10%' }]}>
                                        <Text>{evaluation.value === '4' ? 'X' : ''}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Observações */}
                <Text style={styles.sectionHeader}>OBSERVAÇÕES – COMENTÁRIOS – SUGESTÕES</Text>
                <View style={styles.commentsBox}>
                    <Text>{data.comments}</Text>
                </View>

                {/* Assinaturas */}
                <View style={styles.signatureTable}>
                    <View style={styles.signatureHeader}>
                        <View style={[styles.signatureHeaderCell, { width: '75%' }]}>
                            <Text>ASSINATURAS</Text>
                        </View>
                        <View style={[styles.signatureHeaderCell, styles.signatureHeaderCellLast, { width: '25%' }]}>
                            <Text>DATA</Text>
                        </View>
                    </View>
                    <View style={styles.signatureRow}>
                        <View style={[styles.signatureCell, { width: '75%' }]}>
                            <Text style={styles.signatureLabel}>SUPERVISOR DO ESTÁGIO</Text>
                        </View>
                        <View style={[styles.signatureCell, styles.signatureCellLast, { width: '25%' }]}>
                            <Text style={styles.signatureDateLabel}>EMITIDO EM</Text>
                            <Text style={styles.signatureDate}>___/___/_____</Text>
                        </View>
                    </View>
                    <View style={[styles.signatureRow, styles.signatureRowLast]}>
                        <View style={[styles.signatureCell, { width: '75%' }]}>
                            <Text style={styles.signatureLabel}>DISCENTE ESTAGIÁRIO</Text>
                        </View>
                        <View style={[styles.signatureCell, styles.signatureCellLast, { width: '25%' }]}>
                            <Text style={styles.signatureDateLabel}>CIENTE EM</Text>
                            <Text style={styles.signatureDate}>___/___/_____</Text>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    )
}
