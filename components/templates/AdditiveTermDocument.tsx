/* eslint-disable jsx-a11y/alt-text */

import React from 'react'
import { LOGO_IFCE_BASE64, BRASAO_BASE64 } from '@/lib/pdf-assets'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

interface AdditiveTermDocumentProps {
    data: {
        // Concedente
        company_name: string
        company_fantasy_name: string
        company_cnpj: string
        company_address: string
        company_neighborhood: string
        company_city_state: string
        company_zip: string
        company_phone: string
        company_email: string
        company_representative: string
        company_representative_role: string
        company_representative_cpf: string
        company_representative_phone: string

        // Estagiário
        student_name: string
        student_cpf: string
        student_social_name: string
        student_course: string
        student_id: string
        student_address: string
        student_neighborhood: string
        student_city_state: string
        student_zip: string
        student_phone: string
        student_email_institutional: string
        student_email_personal: string

        // Instituição de Ensino (IFCE)
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
    paragraph: {
        fontSize: 9,
        textAlign: 'justify',
        marginBottom: 15,
        lineHeight: 1.4,
    },
    clauseTitle: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        marginTop: 10,
        marginBottom: 5,
    },
    clauseText: {
        fontSize: 9,
        textAlign: 'justify',
        marginBottom: 5,
        lineHeight: 1.3,
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
    changesBox: {
        borderWidth: 1, borderStyle: 'solid',
        borderColor: '#000',
        padding: 15,
        marginBottom: 15,
    },
    changeRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    checkbox: {
        width: 10,
        height: 10,
        borderWidth: 1, borderStyle: 'solid',
        borderColor: '#000',
        marginRight: 8,
        marginTop: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxMark: {
        fontSize: 7,
    },
    changeContent: {
        flex: 1,
        fontSize: 9,
    },
    dateRight: {
        fontSize: 9,
        textAlign: 'right',
        marginBottom: 30,
        marginTop: 20,
    },
    signatureBlock: {
        marginTop: 40,
    },
    signatureRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    signatureLine: {
        borderTopWidth: 1, borderTopStyle: 'solid',
        borderColor: '#000',
        paddingTop: 5,
        width: '45%',
        textAlign: 'center',
        fontSize: 7,
    },
    signatureLineFull: {
        borderTopWidth: 1, borderTopStyle: 'solid',
        borderColor: '#000',
        paddingTop: 5,
        width: '66%',
        marginHorizontal: 'auto',
        textAlign: 'center',
        fontSize: 7,
        marginTop: 20,
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

const formatCurrency = (value: string): string => {
    if (!value) return 'R$ _____'
    if (value.includes('R$')) return value
    const numbers = value.replace(/\D/g, '')
    if (!numbers) return 'R$ _____'
    const amount = parseInt(numbers) / 100
    return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
    }).format(amount)
}

export const AdditiveTermDocument: React.FC<AdditiveTermDocumentProps> = ({ data }) => (
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

            <Text style={styles.title}>TERMO ADITIVO AO TERMO DE COMPROMISSO DE ESTÁGIO</Text>

            <Text style={styles.paragraph}>
                Pelo presente instrumento jurídico, as partes abaixo nomeadas e qualificadas celebram entre si este <Text style={styles.bold}>TERMO ADITIVO AO TERMO DE COMPROMISSO DE ESTÁGIO</Text>, firmado entre a UNIDADE CONCEDENTE e o ESTAGIÁRIO, com a interveniência obrigatória da INSTITUIÇÃO DE ENSINO, nos termos da Lei nº 11.788, de 25 de setembro de 2008, conforme as cláusulas e condições a seguir:
            </Text>

            <Text style={styles.clauseTitle}>CLÁUSULA PRIMEIRA – DA IDENTIFICAÇÃO DAS PARTES</Text>

            {/* Unidade Concedente */}
            <Text style={styles.sectionHeader}>UNIDADE CONCEDENTE</Text>
            <View style={styles.table}>
                <View style={styles.tableRow}>
                    <View style={[styles.tableCell, styles.tableCellLast, { width: '100%' }]}>
                        <Text style={styles.label}>RAZÃO SOCIAL</Text>
                        <Text style={styles.value}>{data.company_name}</Text>
                    </View>
                </View>
                <View style={styles.tableRow}>
                    <View style={[styles.tableCell, { width: '50%' }]}>
                        <Text style={styles.label}>CNPJ</Text>
                        <Text style={styles.value}>{data.company_cnpj}</Text>
                    </View>
                    <View style={[styles.tableCell, styles.tableCellLast, { width: '50%' }]}>
                        <Text style={styles.label}>ENDEREÇO</Text>
                        <Text style={styles.value}>{data.company_address}</Text>
                    </View>
                </View>
                <View style={styles.tableRow}>
                    <View style={[styles.tableCell, styles.tableCellLast, { width: '100%' }]}>
                        <Text style={styles.label}>REPRESENTADA POR</Text>
                        <Text style={styles.value}>{data.company_representative}</Text>
                    </View>
                </View>
                <View style={[styles.tableRow, { borderBottom: 0 }]}>
                    <View style={[styles.tableCell, styles.tableCellLast, { width: '100%' }]}>
                        <Text style={styles.label}>CARGO</Text>
                        <Text style={styles.value}>{data.company_representative_role}</Text>
                    </View>
                </View>
            </View>

            {/* Estagiário */}
            <Text style={styles.sectionHeader}>ESTAGIÁRIO(A)</Text>
            <View style={styles.table}>
                <View style={styles.tableRow}>
                    <View style={[styles.tableCell, styles.tableCellLast, { width: '100%' }]}>
                        <Text style={styles.label}>NOME</Text>
                        <Text style={styles.value}>{data.student_name}</Text>
                    </View>
                </View>
                <View style={styles.tableRow}>
                    <View style={[styles.tableCell, { width: '50%' }]}>
                        <Text style={styles.label}>CPF</Text>
                        <Text style={styles.value}>{data.student_cpf}</Text>
                    </View>
                    <View style={[styles.tableCell, styles.tableCellLast, { width: '50%' }]}>
                        <Text style={styles.label}>MATRÍCULA</Text>
                        <Text style={styles.value}>{data.student_id}</Text>
                    </View>
                </View>
                <View style={[styles.tableRow, { borderBottom: 0 }]}>
                    <View style={[styles.tableCell, { width: '50%' }]}>
                        <Text style={styles.label}>CURSO</Text>
                        <Text style={styles.value}>{data.student_course}</Text>
                    </View>
                    <View style={[styles.tableCell, styles.tableCellLast, { width: '50%' }]}>
                        <Text style={styles.label}>ENDEREÇO</Text>
                        <Text style={styles.value}>{data.student_address}</Text>
                    </View>
                </View>
            </View>

            {/* Instituição de Ensino */}
            <Text style={styles.sectionHeader}>INSTITUIÇÃO DE ENSINO</Text>
            <View style={styles.table}>
                <View style={styles.tableRow}>
                    <View style={[styles.tableCell, { width: '75%' }]}>
                        <Text style={styles.label}>CAMPUS</Text>
                        <Text style={styles.value}>MARACANAÚ</Text>
                    </View>
                    <View style={[styles.tableCell, styles.tableCellLast, { width: '25%' }]}>
                        <Text style={styles.label}>CNPJ</Text>
                        <Text style={styles.value}>10.744.098/0009-00</Text>
                    </View>
                </View>
                <View style={styles.tableRow}>
                    <View style={[styles.tableCell, styles.tableCellLast, { width: '100%' }]}>
                        <Text style={styles.label}>ENDEREÇO</Text>
                        <Text style={styles.value}>AV. VICE PRESIDENTE JOSÉ DE ALENCAR, S/N, JEREISSATI I, MARACANAÚ-CE, CEP: 61.939-140</Text>
                    </View>
                </View>
                <View style={[styles.tableRow, { borderBottom: 0 }]}>
                    <View style={[styles.tableCell, styles.tableCellLast, { width: '100%' }]}>
                        <Text style={styles.label}>REPRESENTADA POR</Text>
                        <Text style={styles.value}>ELDER KENED CARDOSO - ASSISTENTE EM ADMINISTRAÇÃO - SIAPE 1818968</Text>
                    </View>
                </View>
            </View>

            <Text style={styles.clauseTitle}>CLÁUSULA SEGUNDA – DO OBJETO DO ADITIVO</Text>
            <Text style={styles.clauseText}>
                O presente Termo Aditivo tem por objetivo alterar as seguintes condições do Termo de Compromisso de Estágio original:
            </Text>

            <View style={styles.changesBox}>
                {/* Prorrogação */}
                <View style={styles.changeRow}>
                    <View style={styles.checkbox}>
                        {data.additive_type_prorogation === 'true' && <Text style={styles.checkboxMark}>X</Text>}
                    </View>
                    <View style={styles.changeContent}>
                        <Text style={styles.bold}>PRORROGAÇÃO DE VIGÊNCIA:</Text>
                        <Text> O estágio terá sua vigência prorrogada até <Text style={styles.bold}>{formatDate(data.new_end_date)}</Text>.</Text>
                    </View>
                </View>

                {/* Alteração de Bolsa */}
                <View style={styles.changeRow}>
                    <View style={styles.checkbox}>
                        {data.additive_type_allowance === 'true' && <Text style={styles.checkboxMark}>X</Text>}
                    </View>
                    <View style={styles.changeContent}>
                        <Text style={styles.bold}>ALTERAÇÃO DO VALOR DA BOLSA:</Text>
                        <Text> O valor da bolsa-auxílio passará a ser de <Text style={styles.bold}>{formatCurrency(data.new_allowance_value)}</Text>.</Text>
                    </View>
                </View>

                {/* Alteração de Supervisor */}
                <View style={styles.changeRow}>
                    <View style={styles.checkbox}>
                        {data.additive_type_supervisor === 'true' && <Text style={styles.checkboxMark}>X</Text>}
                    </View>
                    <View style={styles.changeContent}>
                        <Text style={styles.bold}>ALTERAÇÃO DE SUPERVISOR:</Text>
                        <Text> O novo supervisor será o(a) Sr(a). <Text style={styles.bold}>{data.new_supervisor_name || '______________________'}</Text>, cargo <Text style={styles.bold}>{data.new_supervisor_role || '________________'}</Text>, registro profissional <Text style={styles.bold}>{data.new_supervisor_council || '________________'}</Text>.</Text>
                    </View>
                </View>

                {/* Alteração de Horário */}
                <View style={styles.changeRow}>
                    <View style={styles.checkbox}>
                        {data.additive_type_schedule === 'true' && <Text style={styles.checkboxMark}>X</Text>}
                    </View>
                    <View style={styles.changeContent}>
                        <Text style={styles.bold}>ALTERAÇÃO DE HORÁRIO:</Text>
                        <Text> O novo horário de estágio será:{'\n'}</Text>
                        <Text style={{ fontStyle: 'italic', marginTop: 4, marginLeft: 15 }}>{data.new_schedule || '__________________________________________________________________'}</Text>
                    </View>
                </View>

                {/* Outras Alterações */}
                <View style={styles.changeRow}>
                    <View style={styles.checkbox}>
                        {data.additive_type_other === 'true' && <Text style={styles.checkboxMark}>X</Text>}
                    </View>
                    <View style={styles.changeContent}>
                        <Text style={styles.bold}>OUTRAS ALTERAÇÕES:</Text>
                        <Text>{'\n'}</Text>
                        <Text style={{ fontStyle: 'italic', marginTop: 4, marginLeft: 15 }}>{data.other_changes || '__________________________________________________________________'}</Text>
                    </View>
                </View>
            </View>

            <Text style={styles.clauseTitle}>CLÁUSULA TERCEIRA – DA RATIFICAÇÃO</Text>
            <Text style={styles.clauseText}>
                Permanecem inalteradas e ratificadas todas as demais cláusulas e condições do Termo de Compromisso de Estágio original que não foram expressamente modificadas por este instrumento.
            </Text>

            <Text style={styles.paragraph}>
                E, por estarem de inteiro e comum acordo, as partes assinam o presente Termo Aditivo em 03 (três) vias de igual teor e forma.
            </Text>

            <Text style={styles.dateRight}>
                {data.campus_city || 'Maracanaú'} - CE, {data.date_day || '___'} de {data.date_month || '_______________'} de {data.date_year || '20___'}.
            </Text>

            {/* Assinaturas */}
            <View style={styles.signatureBlock}>
                <View style={styles.signatureRow}>
                    <View style={styles.signatureLine}>
                        <Text style={styles.bold}>UNIDADE CONCEDENTE</Text>
                        <Text>(Assinatura e Carimbo)</Text>
                    </View>
                    <View style={styles.signatureLine}>
                        <Text style={styles.bold}>ESTAGIÁRIO(A)</Text>
                    </View>
                </View>

                <View style={styles.signatureLineFull}>
                    <Text style={styles.bold}>INSTITUIÇÃO DE ENSINO (IFCE)</Text>
                    <Text>(Assinatura e Carimbo)</Text>
                </View>
            </View>
        </Page>
    </Document>
)
