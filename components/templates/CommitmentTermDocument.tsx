/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import { getAssetUrl } from '@/lib/pdf-generator-react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

interface CommitmentTermDocumentProps {
    data: {
        // Instituição Concedente
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

        // Discente
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

        // Estágio
        modality: string
        start_date: string
        end_date: string

        // Seguro e Bolsa
        insurance_policy: string
        insurance_company: string
        grant_value: string
        transport_value: string
        has_grant: string
        has_transport: string

        // Docente Orientador
        advisor_name: string
        advisor_siape: string
        advisor_phone: string
        advisor_email: string

        // Supervisor
        supervisor_name: string
        supervisor_education: string
        supervisor_cpf: string
        supervisor_phone: string
        supervisor_email: string

        // Plano de Atividades
        activities_description: string
        expected_results: string
        weekly_hours: string
        schedule: string
    }
}

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
    listItem: {
        fontSize: 9,
        textAlign: 'justify',
        marginBottom: 5,
        marginLeft: 15,
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
    textBox: {
        borderWidth: 1, borderStyle: 'solid',
        borderColor: '#000',
        padding: 8,
        fontSize: 9,
        minHeight: 80,
        marginBottom: 10,
    },
    scheduleTable: {
        width: '100%',
        borderWidth: 1, borderStyle: 'solid',
        borderColor: '#000',
        marginBottom: 10,
    },
    scheduleHeaderRow: {
        flexDirection: 'row',
        fontSize: 6,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        borderBottomWidth: 1, borderBottomStyle: 'solid',
        borderColor: '#000',
        backgroundColor: '#f0f0f0',
    },
    scheduleHeaderCell: {
        padding: 4,
        borderRightWidth: 1, borderRightStyle: 'solid',
        borderColor: '#000',
    },
    scheduleHeaderCellLast: {
        borderRight: 0,
    },
    scheduleRow: {
        flexDirection: 'row',
        fontSize: 7,
        textAlign: 'center',
        borderBottomWidth: 1, borderBottomStyle: 'solid',
        borderColor: '#000',
        minHeight: 18,
    },
    scheduleRowLast: {
        borderBottom: 0,
    },
    scheduleCell: {
        padding: 4,
        borderRightWidth: 1, borderRightStyle: 'solid',
        borderColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scheduleCellLast: {
        borderRight: 0,
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

const formatCurrency = (value: string): string => {
    if (!value) return 'R$ _____'
    
    // Se o valor já contém R$, ele provavelmente já está formatado
    if (value.includes('R$')) return value

    // Tenta limpar valores numéricos puros vindos de rascunhos ou do estado
    const numbers = value.replace(/\D/g, '')
    if (!numbers) return 'R$ _____'
    
    const amount = parseInt(numbers) / 100
    
    return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount)
}

export const CommitmentTermDocument: React.FC<CommitmentTermDocumentProps> = ({ data }) => {
    const schedule = data.schedule ? JSON.parse(data.schedule) : {}

    return (
        <Document>
            {/* Página 1 - Identificação das Partes */}
            <Page size="A4" style={styles.page}>
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

                <Text style={styles.title}>TERMO DE COMPROMISSO DE ESTÁGIO</Text>

                <Text style={styles.paragraph}>
                    Nos termos da Lei nº 11.788, de 25/09/2008, e do Regulamento de Estágio do IFCE, os entes abaixo qualificados celebram entre si o presente <Text style={styles.bold}>Termo de Compromisso de Estágio</Text>, regrado pelas cláusulas que seguem:
                </Text>

                {/* Instituição de Ensino */}
                <Text style={styles.sectionHeader}>Instituição de Ensino – IFCE</Text>
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
                            <Text style={styles.label}>ENDEREÇO (LOGRADOURO, NÚMERO E COMPLEMENTO)</Text>
                            <Text style={styles.value}>AV. VICE PRESIDENTE JOSÉ DE ALENCAR, S/N</Text>
                        </View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, { width: '33%' }]}>
                            <Text style={styles.label}>BAIRRO</Text>
                            <Text style={styles.value}>JEREISSATI I</Text>
                        </View>
                        <View style={[styles.tableCell, { width: '34%' }]}>
                            <Text style={styles.label}>MUNICÍPIO</Text>
                            <Text style={styles.value}>MARACANAÚ</Text>
                        </View>
                        <View style={[styles.tableCell, styles.tableCellLast, { width: '33%' }]}>
                            <Text style={styles.label}>CEP</Text>
                            <Text style={styles.value}>61.939-140</Text>
                        </View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, { width: '50%' }]}>
                            <Text style={styles.label}>DDD + TELEFONE</Text>
                            <Text style={styles.value}>85 3512-8709</Text>
                        </View>
                        <View style={[styles.tableCell, styles.tableCellLast, { width: '50%' }]}>
                            <Text style={styles.label}>E-MAIL</Text>
                            <Text style={styles.value}>gabmaracanau@ifce.edu.br</Text>
                        </View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, styles.tableCellLast, { width: '100%' }]}>
                            <Text style={styles.label}>REPRESENTANTE PARA ESTE ESPECÍFICO FIM</Text>
                            <Text style={styles.value}>ELDER KENED CARDOSO</Text>
                        </View>
                    </View>
                    <View style={[styles.tableRow, { borderBottom: 0 }]}>
                        <View style={[styles.tableCell, { width: '75%' }]}>
                            <Text style={styles.label}>CARGO/QUALIFICAÇÃO</Text>
                            <Text style={styles.value}>ASSISTENTE EM ADMINISTRAÇÃO</Text>
                        </View>
                        <View style={[styles.tableCell, styles.tableCellLast, { width: '25%' }]}>
                            <Text style={styles.label}>SIAPE</Text>
                            <Text style={styles.value}>1818968</Text>
                        </View>
                    </View>
                </View>

                {/* Instituição Concedente */}
                <Text style={styles.sectionHeader}>Instituição Concedente de vaga de estágio</Text>
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, styles.tableCellLast, { width: '100%' }]}>
                            <Text style={styles.label}>RAZÃO SOCIAL</Text>
                            <Text style={styles.value}>{data.company_name}</Text>
                        </View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, styles.tableCellLast, { width: '100%' }]}>
                            <Text style={styles.label}>NOME DE FANTASIA OU DE PESSOA FÍSICA</Text>
                            <Text style={styles.value}>{data.company_fantasy_name}</Text>
                        </View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, { width: '40%' }]}>
                            <Text style={styles.label}>CNPJ OU REGISTRO NO CONSELHO</Text>
                            <Text style={styles.value}>{data.company_cnpj}</Text>
                        </View>
                        <View style={[styles.tableCell, styles.tableCellLast, { width: '60%' }]}>
                            <Text style={styles.label}>ENDEREÇO</Text>
                            <Text style={styles.value}>{data.company_address}</Text>
                        </View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, { width: '30%' }]}>
                            <Text style={styles.label}>BAIRRO</Text>
                            <Text style={styles.value}>{data.company_neighborhood}</Text>
                        </View>
                        <View style={[styles.tableCell, { width: '40%' }]}>
                            <Text style={styles.label}>MUNICÍPIO-UF</Text>
                            <Text style={styles.value}>{data.company_city_state}</Text>
                        </View>
                        <View style={[styles.tableCell, styles.tableCellLast, { width: '30%' }]}>
                            <Text style={styles.label}>CEP</Text>
                            <Text style={styles.value}>{data.company_zip}</Text>
                        </View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, { width: '30%' }]}>
                            <Text style={styles.label}>DDD + TELEFONE</Text>
                            <Text style={styles.value}>{data.company_phone}</Text>
                        </View>
                        <View style={[styles.tableCell, styles.tableCellLast, { width: '70%' }]}>
                            <Text style={styles.label}>E-MAIL</Text>
                            <Text style={styles.value}>{data.company_email}</Text>
                        </View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, styles.tableCellLast, { width: '100%' }]}>
                            <Text style={styles.label}>RESPONSÁVEL LEGAL PELA INSTITUIÇÃO</Text>
                            <Text style={styles.value}>{data.company_representative}</Text>
                        </View>
                    </View>
                    <View style={[styles.tableRow, { borderBottom: 0 }]}>
                        <View style={[styles.tableCell, { width: '60%' }]}>
                            <Text style={styles.label}>CARGO/QUALIFICAÇÃO</Text>
                            <Text style={styles.value}>{data.company_representative_role}</Text>
                        </View>
                        <View style={[styles.tableCell, styles.tableCellLast, { width: '40%' }]}>
                            <Text style={styles.label}>CPF</Text>
                            <Text style={styles.value}>{data.company_representative_cpf}</Text>
                        </View>
                    </View>
                </View>

                {/* Discente */}
                <Text style={styles.sectionHeader}>DISCENTE ESTAGIÁRIO(A)</Text>
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, { width: '75%' }]}>
                            <Text style={styles.label}>NOME</Text>
                            <Text style={styles.value}>{data.student_name}</Text>
                        </View>
                        <View style={[styles.tableCell, styles.tableCellLast, { width: '25%' }]}>
                            <Text style={styles.label}>CPF</Text>
                            <Text style={styles.value}>{data.student_cpf}</Text>
                        </View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, styles.tableCellLast, { width: '100%' }]}>
                            <Text style={styles.label}>NOME SOCIAL</Text>
                            <Text style={styles.value}>{data.student_social_name}</Text>
                        </View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, { width: '75%' }]}>
                            <Text style={styles.label}>CURSO</Text>
                            <Text style={styles.value}>{data.student_course}</Text>
                        </View>
                        <View style={[styles.tableCell, styles.tableCellLast, { width: '25%' }]}>
                            <Text style={styles.label}>MATRICULA</Text>
                            <Text style={styles.value}>{data.student_id}</Text>
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
                            <Text style={styles.label}>MUNICÍPIO-UF</Text>
                            <Text style={styles.value}>{data.student_city_state}</Text>
                        </View>
                        <View style={[styles.tableCell, styles.tableCellLast, { width: '50%' }]}>
                            <Text style={styles.label}>E-MAIL INSTITUCIONAL</Text>
                            <Text style={styles.value}>{data.student_email_institutional}</Text>
                        </View>
                    </View>
                </View>
            </Page>

            {/* Página 2 - Cláusulas */}
            <Page size="A4" style={styles.page}>
                <Text style={styles.clauseTitle}>CLÁUSULA PRIMEIRA – DO OBJETO E DA VIGÊNCIA</Text>
                <Text style={styles.clauseText}>
                    I - O estágio supervisionado será OBRIGATÓRIO, com atividades compatíveis com a formação recebida no curso, realizadas de forma <Text style={styles.bold}>{data.modality ? data.modality.toUpperCase() : '_______'}</Text>.
                </Text>
                <Text style={styles.clauseText}>
                    II - Este termo terá vigência de <Text style={styles.bold}>{formatDate(data.start_date)}</Text> a <Text style={styles.bold}>{formatDate(data.end_date)}</Text>.
                </Text>

                <Text style={styles.clauseTitle}>CLÁUSULA SEGUNDA – DOS DIREITOS E DEVERES DO IFCE</Text>
                <Text style={styles.listItem}>I - Avaliar as instalações da CONCEDENTE;</Text>
                <Text style={styles.listItem}>II - Indicar Docente orientador;</Text>
                <Text style={styles.listItem}>III - Exigir relatórios das atividades;</Text>
                <Text style={styles.listItem}>IV - Reorientar o estagiário se necessário;</Text>
                <Text style={styles.listItem}>V - Manter comunicação com a concedente.</Text>

                <Text style={styles.clauseTitle}>CLÁUSULA TERCEIRA – DOS DIREITOS E DEVERES DA CONCEDENTE</Text>
                <Text style={styles.listItem}>I - Oferecer condições adequadas de desenvolvimento;</Text>
                <Text style={styles.listItem}>II - Proporcionar aprimoramento e avaliação;</Text>
                <Text style={styles.listItem}>III - Designar supervisor qualificado;</Text>
                <Text style={styles.listItem}>IV - Conceder recesso de 30 dias quando aplicável;</Text>
                <Text style={styles.listItem}>V - Fornecer termo de realização ao final.</Text>

                <Text style={styles.clauseTitle}>CLÁUSULA QUARTA – DOS DIREITOS E DEVERES DO ESTAGIÁRIO</Text>
                <Text style={styles.listItem}>I - Cumprir as atividades estabelecidas;</Text>
                <Text style={styles.listItem}>II - Respeitar as normas internas;</Text>
                <Text style={styles.listItem}>III - Respeitar a legislação pertinente;</Text>
                <Text style={styles.listItem}>IV - Cumprir as orientações do supervisor.</Text>

                <Text style={styles.clauseTitle}>CLÁUSULA QUINTA – DO SEGURO E DA REMUNERAÇÃO</Text>
                <Text style={styles.clauseText}>
                    I - Seguro contra acidentes: <Text style={styles.bold}>{data.insurance_company || '________________________'}</Text>.
                </Text>
                {data.has_grant === 'true' ? (
                    <Text style={styles.clauseText}>
                        II - Bolsa-auxílio: <Text style={styles.bold}>{formatCurrency(data.grant_value)}</Text>.
                    </Text>
                ) : (
                    <Text style={styles.clauseText}>
                        II - Sem bolsa-auxílio.
                    </Text>
                )}
                {data.has_transport === 'true' ? (
                    <Text style={styles.clauseText}>
                        III - Auxílio-transporte: <Text style={styles.bold}>{formatCurrency(data.transport_value)}</Text>.
                    </Text>
                ) : (
                    <Text style={styles.clauseText}>
                        III - Sem auxílio-transporte.
                    </Text>
                )}
            </Page>

            {/* Página 3 - Orientador, Supervisor e Plano */}
            <Page size="A4" style={styles.page}>
                <Text style={styles.clauseTitle}>CLÁUSULA SEXTA – DO DOCENTE ORIENTADOR E SUPERVISOR</Text>

                <Text style={styles.sectionHeader}>DOCENTE ORIENTADOR</Text>
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, styles.tableCellLast, { width: '100%' }]}>
                            <Text style={styles.label}>NOME</Text>
                            <Text style={styles.value}>{data.advisor_name}</Text>
                        </View>
                    </View>
                    <View style={[styles.tableRow, { borderBottom: 0 }]}>
                        <View style={[styles.tableCell, { width: '33%' }]}>
                            <Text style={styles.label}>SIAPE</Text>
                            <Text style={styles.value}>{data.advisor_siape}</Text>
                        </View>
                        <View style={[styles.tableCell, { width: '33%' }]}>
                            <Text style={styles.label}>TELEFONE</Text>
                            <Text style={styles.value}>{data.advisor_phone}</Text>
                        </View>
                        <View style={[styles.tableCell, styles.tableCellLast, { width: '34%' }]}>
                            <Text style={styles.label}>E-MAIL</Text>
                            <Text style={styles.value}>{data.advisor_email}</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionHeader}>SUPERVISOR DO ESTÁGIO</Text>
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, styles.tableCellLast, { width: '100%' }]}>
                            <Text style={styles.label}>NOME</Text>
                            <Text style={styles.value}>{data.supervisor_name}</Text>
                        </View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, styles.tableCellLast, { width: '100%' }]}>
                            <Text style={styles.label}>FORMAÇÃO OU EXPERIÊNCIA PROFISSIONAL</Text>
                            <Text style={styles.value}>{data.supervisor_education}</Text>
                        </View>
                    </View>
                    <View style={[styles.tableRow, { borderBottom: 0 }]}>
                        <View style={[styles.tableCell, { width: '33%' }]}>
                            <Text style={styles.label}>CPF</Text>
                            <Text style={styles.value}>{data.supervisor_cpf}</Text>
                        </View>
                        <View style={[styles.tableCell, { width: '33%' }]}>
                            <Text style={styles.label}>TELEFONE</Text>
                            <Text style={styles.value}>{data.supervisor_phone}</Text>
                        </View>
                        <View style={[styles.tableCell, styles.tableCellLast, { width: '34%' }]}>
                            <Text style={styles.label}>E-MAIL</Text>
                            <Text style={styles.value}>{data.supervisor_email}</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.clauseTitle}>CLÁUSULA SÉTIMA – DO PLANO DE ATIVIDADES</Text>

                <Text style={styles.sectionHeader}>ATIVIDADES A SEREM DESENVOLVIDAS</Text>
                <View style={styles.textBox}>
                    <Text>{data.activities_description}</Text>
                </View>

                <Text style={styles.sectionHeader}>RESULTADOS ESPERADOS</Text>
                <View style={styles.textBox}>
                    <Text>{data.expected_results}</Text>
                </View>

                <Text style={styles.clauseText}>
                    Carga horária semanal: <Text style={styles.bold}>{data.weekly_hours}</Text> horas.
                </Text>

                {/* Tabela de Horários Simplificada */}
                <View style={styles.scheduleTable}>
                    <View style={styles.scheduleHeaderRow}>
                        <View style={[styles.scheduleHeaderCell, { width: '15%' }]}>
                            <Text>TURNO</Text>
                        </View>
                        {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'].map((day, i) => (
                            <View key={day} style={[styles.scheduleHeaderCell, ...(i === 6 ? [styles.scheduleHeaderCellLast] : []), { width: '12.14%' }]}>
                                <Text>{day}</Text>
                            </View>
                        ))}
                    </View>
                    {['morning', 'afternoon', 'night'].map((shift, idx) => {
                        const shiftLabels = { morning: '1º', afternoon: '2º', night: '3º' }
                        return (
                            <View key={shift} style={[styles.scheduleRow, ...(idx === 2 ? [styles.scheduleRowLast] : [])]}>
                                <View style={[styles.scheduleCell, { width: '15%', fontFamily: 'Helvetica-Bold' }]}>
                                    <Text>{shiftLabels[shift as keyof typeof shiftLabels]}</Text>
                                </View>
                                {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day, i) => {
                                    const time = schedule[shift]?.[day] || ''
                                    return (
                                        <View key={day} style={[styles.scheduleCell, ...(i === 6 ? [styles.scheduleCellLast] : []), { width: '12.14%' }]}>
                                            <Text>{time}</Text>
                                        </View>
                                    )
                                })}
                            </View>
                        )
                    })}
                </View>
            </Page>

            {/* Página 4 - Disposições Finais e Assinaturas */}
            <Page size="A4" style={styles.page}>
                <Text style={styles.clauseTitle}>CLÁUSULA OITAVA – DO CANCELAMENTO</Text>
                <Text style={styles.clauseText}>Constituem motivos para cessação:</Text>
                <Text style={styles.listItem}>I - Não cumprimento das cláusulas;</Text>
                <Text style={styles.listItem}>II - Conclusão do curso;</Text>
                <Text style={styles.listItem}>III - Abandono do estágio;</Text>
                <Text style={styles.listItem}>IV - Cancelamento ou trancamento de matrícula;</Text>
                <Text style={styles.listItem}>V - Pedido de rescisão por qualquer das partes.</Text>

                <Text style={styles.clauseTitle}>CLÁUSULA NONA – DAS DISPOSIÇÕES FINAIS</Text>
                <Text style={styles.listItem}>I - Zelar pelo cumprimento deste termo;</Text>
                <Text style={styles.listItem}>II - Foro da Justiça Federal de Fortaleza.</Text>

                <Text style={styles.paragraph}>
                    Estando de acordo, as partes assinam o presente instrumento para que se cumpram os efeitos legais.
                </Text>

                <Text style={styles.dateRight}>
                    Maracanaú - CE, _____ de _______________ de 20_____.
                </Text>

                <View style={styles.signatureBlock}>
                    <View style={styles.signatureRow}>
                        <View style={styles.signatureLine}>
                            <Text style={styles.bold}>Representante do IFCE</Text>
                        </View>
                        <View style={styles.signatureLine}>
                            <Text style={styles.bold}>Representante da CONCEDENTE</Text>
                        </View>
                    </View>

                    <View style={styles.signatureLineFull}>
                        <Text style={styles.bold}>DISCENTE ESTAGIÁRIO(A)</Text>
                    </View>

                    <View style={styles.signatureRow}>
                        <View style={styles.signatureLine}>
                            <Text style={styles.bold}>Docente Orientador</Text>
                        </View>
                        <View style={styles.signatureLine}>
                            <Text style={styles.bold}>Supervisor do Estágio</Text>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    )
}
