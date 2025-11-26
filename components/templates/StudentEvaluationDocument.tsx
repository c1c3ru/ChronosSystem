import React from 'react'
import { getAssetUrl } from '@/lib/pdf-generator-react'
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'
import { commonStyles, formatDate } from '@/lib/pdf-styles-react'

interface StudentEvaluationDocumentProps {
    data: {
        student_name: string
        student_course: string
        student_enrollment: string
        company_name: string
        company_supervisor: string
        period_start: string
        period_end: string
        eval_assiduity: string
        eval_punctuality: string
        eval_responsibility: string
        eval_discipline: string
        eval_cooperation: string
        eval_initiative: string
        eval_proactivity: string
        eval_communication: string
        eval_relationship: string
        eval_technical_knowledge: string
        eval_learning_capacity: string
        eval_productivity: string
        eval_quality: string
        eval_organization: string
        eval_creativity: string
        observations: string
        recommendation: 'sim' | 'nao' | ''
        evaluation_date: string
    }
}

const styles = StyleSheet.create({
    evaluationTable: {
        width: '100%',
        marginBottom: 10,
    },
    evaluationHeader: {
        flexDirection: 'row',
        backgroundColor: '#e0e0e0',
        borderTopWidth: 1, borderTopStyle: 'solid',
        borderLeftWidth: 1, borderLeftStyle: 'solid',
        borderRightWidth: 1, borderRightStyle: 'solid',
        borderColor: '#000',
    },
    evaluationHeaderCell: {
        padding: 4,
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        borderRightWidth: 1, borderRightStyle: 'solid',
        borderColor: '#000',
    },
    evaluationRow: {
        flexDirection: 'row',
        borderBottomWidth: 1, borderBottomStyle: 'solid',
        borderLeftWidth: 1, borderLeftStyle: 'solid',
        borderRightWidth: 1, borderRightStyle: 'solid',
        borderColor: '#000',
    },
    evaluationLabel: {
        width: '60%',
        padding: 4,
        fontSize: 8,
        borderRightWidth: 1, borderRightStyle: 'solid',
        borderColor: '#000',
    },
    evaluationCell: {
        width: '8%',
        padding: 4,
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        borderRightWidth: 1, borderRightStyle: 'solid',
        borderColor: '#000',
    },
    evaluationCellLast: {
        borderRight: 0,
    },
    infoBox: {
        backgroundColor: '#e0e0e0',
        padding: 6,
        marginBottom: 8,
        fontSize: 8,
        textAlign: 'center',
        borderWidth: 1, borderStyle: 'solid',
        borderColor: '#000',
    },
    recommendationBox: {
        borderWidth: 1, borderStyle: 'solid',
        borderColor: '#000',
        padding: 8,
        marginBottom: 15,
    },
    recommendationTitle: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 6,
    },
    checkboxRow: {
        flexDirection: 'row',
        gap: 20,
    },
})

const EvaluationRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.evaluationRow}>
        <Text style={styles.evaluationLabel}>{label}</Text>
        <Text style={[styles.evaluationCell]}>{value === '1' ? 'X' : ''}</Text>
        <Text style={[styles.evaluationCell]}>{value === '2' ? 'X' : ''}</Text>
        <Text style={[styles.evaluationCell]}>{value === '3' ? 'X' : ''}</Text>
        <Text style={[styles.evaluationCell]}>{value === '4' ? 'X' : ''}</Text>
        <Text style={[styles.evaluationCell, styles.evaluationCellLast]}>{value === '5' ? 'X' : ''}</Text>
    </View>
)

export const StudentEvaluationDocument: React.FC<StudentEvaluationDocumentProps> = ({ data }) => (
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

            <Text style={commonStyles.title}>FICHA DE AVALIAÇÃO DO DISCENTE ESTAGIÁRIO</Text>

            {/* Dados do Estagiário */}
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
                    <View style={[commonStyles.tableCell, commonStyles.tableCellLast, { width: '100%' }]}>
                        <Text style={commonStyles.label}>EMPRESA CONCEDENTE</Text>
                        <Text style={commonStyles.value}>{data.company_name}</Text>
                    </View>
                </View>
                <View style={commonStyles.tableRow}>
                    <View style={[commonStyles.tableCell, commonStyles.tableCellLast, { width: '100%' }]}>
                        <Text style={commonStyles.label}>SUPERVISOR DO ESTÁGIO</Text>
                        <Text style={commonStyles.value}>{data.company_supervisor}</Text>
                    </View>
                </View>
                <View style={[commonStyles.tableRow, { borderBottom: 0 }]}>
                    <View style={[commonStyles.tableCell, { width: '50%' }]}>
                        <Text style={commonStyles.label}>PERÍODO INICIAL</Text>
                        <Text style={commonStyles.value}>{formatDate(data.period_start)}</Text>
                    </View>
                    <View style={[commonStyles.tableCell, commonStyles.tableCellLast, { width: '50%' }]}>
                        <Text style={commonStyles.label}>PERÍODO FINAL</Text>
                        <Text style={commonStyles.value}>{formatDate(data.period_end)}</Text>
                    </View>
                </View>
            </View>

            {/* Critérios de Avaliação */}
            <View style={styles.infoBox}>
                <Text style={commonStyles.bold}>CRITÉRIOS DE AVALIAÇÃO</Text>
            </View>
            <Text style={[commonStyles.paragraphSmall, { textAlign: 'center', marginBottom: 8 }]}>
                Atribua uma nota de 1 a 5 para cada critério, sendo: <Text style={commonStyles.bold}>1 - Insuficiente | 2 - Regular | 3 - Bom | 4 - Muito Bom | 5 - Excelente</Text>
            </Text>

            <View style={styles.evaluationTable}>
                <View style={styles.evaluationHeader}>
                    <Text style={[styles.evaluationHeaderCell, { width: '60%' }]}>CRITÉRIO</Text>
                    <Text style={[styles.evaluationHeaderCell, { width: '8%' }]}>1</Text>
                    <Text style={[styles.evaluationHeaderCell, { width: '8%' }]}>2</Text>
                    <Text style={[styles.evaluationHeaderCell, { width: '8%' }]}>3</Text>
                    <Text style={[styles.evaluationHeaderCell, { width: '8%' }]}>4</Text>
                    <Text style={[styles.evaluationHeaderCell, { width: '8%', borderRight: 0 }]}>5</Text>
                </View>
                <EvaluationRow label="Assiduidade" value={data.eval_assiduity} />
                <EvaluationRow label="Pontualidade" value={data.eval_punctuality} />
                <EvaluationRow label="Responsabilidade" value={data.eval_responsibility} />
                <EvaluationRow label="Disciplina" value={data.eval_discipline} />
                <EvaluationRow label="Cooperação" value={data.eval_cooperation} />
                <EvaluationRow label="Iniciativa" value={data.eval_initiative} />
                <EvaluationRow label="Proatividade" value={data.eval_proactivity} />
                <EvaluationRow label="Comunicação" value={data.eval_communication} />
                <EvaluationRow label="Relacionamento Interpessoal" value={data.eval_relationship} />
                <EvaluationRow label="Conhecimento Técnico" value={data.eval_technical_knowledge} />
                <EvaluationRow label="Capacidade de Aprendizagem" value={data.eval_learning_capacity} />
                <EvaluationRow label="Produtividade" value={data.eval_productivity} />
                <EvaluationRow label="Qualidade do Trabalho" value={data.eval_quality} />
                <EvaluationRow label="Organização" value={data.eval_organization} />
                <EvaluationRow label="Criatividade" value={data.eval_creativity} />
            </View>

            {/* Observações */}
            <Text style={commonStyles.sectionHeader}>OBSERVAÇÕES E COMENTÁRIOS</Text>
            <View style={[commonStyles.textBox, { minHeight: 80 }]}>
                <Text>{data.observations}</Text>
            </View>

            {/* Recomendação */}
            <View style={styles.recommendationBox}>
                <Text style={styles.recommendationTitle}>RECOMENDARIA ESTE ESTAGIÁRIO PARA FUTURAS OPORTUNIDADES?</Text>
                <View style={styles.checkboxRow}>
                    <View style={commonStyles.checkboxRow}>
                        <View style={commonStyles.checkbox}>
                            <Text>{data.recommendation === 'sim' ? 'X' : ''}</Text>
                        </View>
                        <Text style={commonStyles.checkboxLabel}>SIM</Text>
                    </View>
                    <View style={commonStyles.checkboxRow}>
                        <View style={commonStyles.checkbox}>
                            <Text>{data.recommendation === 'nao' ? 'X' : ''}</Text>
                        </View>
                        <Text style={commonStyles.checkboxLabel}>NÃO</Text>
                    </View>
                </View>
            </View>

            <Text style={commonStyles.dateRight}>Data: {formatDate(data.evaluation_date)}</Text>

            {/* Assinatura */}
            <View style={[commonStyles.signatureBlock, { marginTop: 30 }]}>
                <View style={commonStyles.signatureLine}>
                    <Text style={commonStyles.bold}>{data.company_supervisor || 'SUPERVISOR DO ESTÁGIO'}</Text>
                    <Text>{data.company_name}</Text>
                    <Text>Assinatura e Carimbo</Text>
                </View>
            </View>
        </Page>
    </Document>
)
