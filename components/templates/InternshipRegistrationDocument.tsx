import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

interface InternshipRegistrationDocumentProps {
    data: any
}

// Estilos do documento
const styles = StyleSheet.create({
    page: {
        padding: 25,
        fontSize: 8,
        fontFamily: 'Helvetica',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
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
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 9,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    logo: {
        width: 60,
        height: 60,
    },
    mainTitle: {
        fontSize: 14,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        textTransform: 'uppercase',
        marginBottom: 15,
    },
    formContainer: {
        border: 1,
        borderColor: '#000',
    },
    row: {
        flexDirection: 'row',
        borderBottom: 1,
        borderColor: '#000',
    },
    cell: {
        padding: 4,
        borderRight: 1,
        borderColor: '#000',
    },
    cellLast: {
        borderRight: 0,
    },
    label: {
        fontSize: 6,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        marginBottom: 2,
        color: '#666',
    },
    value: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        minHeight: 10,
    },
    sectionHeader: {
        width: '100%',
        padding: 4,
        backgroundColor: '#f0f0f0',
        textAlign: 'center',
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        borderBottom: 1,
        borderColor: '#000',
    },
    checkboxContainer: {
        padding: 6,
    },
    checkboxTitle: {
        fontSize: 6,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        marginBottom: 4,
        textAlign: 'center',
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    checkbox: {
        width: 8,
        height: 8,
        border: 1,
        borderColor: '#000',
        marginRight: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxMark: {
        fontSize: 6,
    },
    checkboxLabel: {
        fontSize: 7,
        textTransform: 'uppercase',
    },
    scheduleHeader: {
        fontSize: 6,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        textAlign: 'center',
        backgroundColor: '#f0f0f0',
        padding: 2,
        borderBottom: 1,
        borderColor: '#000',
    },
    scheduleTable: {
        borderBottom: 1,
        borderColor: '#000',
    },
    scheduleHeaderRow: {
        flexDirection: 'row',
        fontSize: 5,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        textAlign: 'center',
        borderBottom: 1,
        borderColor: '#000',
    },
    scheduleTurnLabel: {
        width: '8%',
        borderRight: 1,
        borderColor: '#000',
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scheduleDayColumn: {
        flex: 1,
        borderRight: 1,
        borderColor: '#000',
    },
    scheduleDayColumnLast: {
        borderRight: 0,
    },
    scheduleDayName: {
        borderBottom: 1,
        borderColor: '#000',
        padding: 2,
    },
    scheduleTimeRow: {
        flexDirection: 'row',
    },
    scheduleTimeCell: {
        flex: 1,
        borderRight: 1,
        borderColor: '#000',
        padding: 2,
    },
    scheduleTimeCellLast: {
        borderRight: 0,
    },
    scheduleDataRow: {
        flexDirection: 'row',
        fontSize: 7,
        textAlign: 'center',
        borderBottom: 1,
        borderColor: '#000',
        minHeight: 18,
    },
    scheduleDataRowLast: {
        borderBottom: 0,
    },
    scheduleTurnCell: {
        width: '8%',
        borderRight: 1,
        borderColor: '#000',
        padding: 2,
        fontFamily: 'Helvetica-Bold',
        backgroundColor: '#fafafa',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scheduleDayData: {
        flex: 1,
        flexDirection: 'row',
        borderRight: 1,
        borderColor: '#000',
    },
    scheduleDayDataLast: {
        borderRight: 0,
    },
    scheduleTimeData: {
        flex: 1,
        borderRight: 1,
        borderColor: '#000',
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scheduleTimeDataLast: {
        borderRight: 0,
    },
    signatureSection: {
        flexDirection: 'row',
        minHeight: 80,
        borderBottom: 1,
        borderColor: '#000',
    },
    signatureBox: {
        flex: 1,
        borderRight: 1,
        borderColor: '#000',
        padding: 8,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    signatureBoxLast: {
        borderRight: 0,
    },
    signatureLine: {
        borderTop: 1,
        borderColor: '#000',
        paddingTop: 4,
        fontSize: 7,
        textTransform: 'uppercase',
        textAlign: 'center',
        width: '80%',
        marginTop: 8,
    },
    signatureDate: {
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    footer: {
        marginTop: 8,
        fontSize: 8,
        textAlign: 'justify',
    },
    footerBold: {
        fontFamily: 'Helvetica-Bold',
    },
    footerUnderline: {
        textDecoration: 'underline',
    },
    footerUppercase: {
        textTransform: 'uppercase',
    },
})

export const InternshipRegistrationDocument: React.FC<InternshipRegistrationDocumentProps> = ({ data }) => {
    const scheduleData = data.schedule ? JSON.parse(data.schedule) : {}

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Cabeçalho */}
                <View style={styles.header}>
                    <Image src="/assets/logoifce.png" style={styles.logo} />
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Pró-Reitoria de Extensão</Text>
                        <Text style={styles.headerTitle}>Coordenação de Estágios e Acompanhamento de Egressos</Text>
                        <Text style={styles.headerSubtitle}>IFCE Campus Maracanaú</Text>
                        <Text style={styles.headerSubtitle}>Setor de Acompanhamento de Estágio</Text>
                        <Text style={styles.mainTitle}>Solicitação de Cadastro no Estágio</Text>
                    </View>
                    <Image src="/assets/brasao.png" style={styles.logo} />
                </View>

                {/* Formulário */}
                <View style={styles.formContainer}>
                    {/* Linha 1 - Nome e CPF */}
                    <View style={styles.row}>
                        <View style={[styles.cell, { width: '70%' }]}>
                            <Text style={styles.label}>Nome</Text>
                            <Text style={styles.value}>{data.student_name}</Text>
                        </View>
                        <View style={[styles.cell, styles.cellLast, { width: '30%' }]}>
                            <Text style={styles.label}>CPF</Text>
                            <Text style={styles.value}>{data.student_cpf}</Text>
                        </View>
                    </View>

                    {/* Linha 2 - Nome Social */}
                    <View style={styles.row}>
                        <View style={[styles.cell, styles.cellLast, { width: '100%' }]}>
                            <Text style={styles.label}>Nome Social</Text>
                            <Text style={styles.value}>{data.student_social_name}</Text>
                        </View>
                    </View>

                    {/* Linha 3 - Curso e Matrícula */}
                    <View style={styles.row}>
                        <View style={[styles.cell, { width: '70%' }]}>
                            <Text style={styles.label}>Curso</Text>
                            <Text style={styles.value}>{data.student_course}</Text>
                        </View>
                        <View style={[styles.cell, styles.cellLast, { width: '30%' }]}>
                            <Text style={styles.label}>Matrícula</Text>
                            <Text style={styles.value}>{data.student_enrollment}</Text>
                        </View>
                    </View>

                    {/* Linha 4 - Endereço e Bairro */}
                    <View style={styles.row}>
                        <View style={[styles.cell, { width: '60%' }]}>
                            <Text style={styles.label}>Endereço (Logradouro, Número e Complemento)</Text>
                            <Text style={styles.value}>{data.student_address}</Text>
                        </View>
                        <View style={[styles.cell, styles.cellLast, { width: '40%' }]}>
                            <Text style={styles.label}>Bairro/Distrito</Text>
                            <Text style={styles.value}>{data.student_neighborhood}</Text>
                        </View>
                    </View>

                    {/* Linha 5 - Município, CEP e Telefone */}
                    <View style={styles.row}>
                        <View style={[styles.cell, { width: '40%' }]}>
                            <Text style={styles.label}>Município-UF</Text>
                            <Text style={styles.value}>{data.student_city_uf}</Text>
                        </View>
                        <View style={[styles.cell, { width: '20%' }]}>
                            <Text style={styles.label}>CEP</Text>
                            <Text style={styles.value}>{data.student_zip}</Text>
                        </View>
                        <View style={[styles.cell, styles.cellLast, { width: '40%' }]}>
                            <Text style={styles.label}>DDD + Telefone</Text>
                            <Text style={styles.value}>{data.student_phone}</Text>
                        </View>
                    </View>

                    {/* Linha 6 - Emails */}
                    <View style={styles.row}>
                        <View style={[styles.cell, { width: '50%' }]}>
                            <Text style={styles.label}>E-mail Institucional</Text>
                            <Text style={styles.value}>{data.student_email_institutional}</Text>
                        </View>
                        <View style={[styles.cell, styles.cellLast, { width: '50%' }]}>
                            <Text style={styles.label}>E-mail Pessoal</Text>
                            <Text style={styles.value}>{data.student_email_personal}</Text>
                        </View>
                    </View>

                    {/* Linha 7 - Checkboxes Complexos */}
                    <View style={[styles.row, { minHeight: 70 }]}>
                        {/* Cor/Raça */}
                        <View style={[styles.cell, { width: '25%' }]}>
                            <Text style={styles.checkboxTitle}>Cor/Raça</Text>
                            <View style={styles.checkboxContainer}>
                                <View style={styles.checkboxRow}>
                                    <View style={styles.checkbox}>
                                        {data.student_race === 'amarelo' && <Text style={styles.checkboxMark}>X</Text>}
                                    </View>
                                    <Text style={styles.checkboxLabel}>Amarelo(a)</Text>
                                </View>
                                <View style={styles.checkboxRow}>
                                    <View style={styles.checkbox}>
                                        {data.student_race === 'branco' && <Text style={styles.checkboxMark}>X</Text>}
                                    </View>
                                    <Text style={styles.checkboxLabel}>Branco(a)</Text>
                                </View>
                                <View style={styles.checkboxRow}>
                                    <View style={styles.checkbox}>
                                        {data.student_race === 'indigena' && <Text style={styles.checkboxMark}>X</Text>}
                                    </View>
                                    <Text style={styles.checkboxLabel}>Indígena</Text>
                                </View>
                                <View style={styles.checkboxRow}>
                                    <View style={styles.checkbox}>
                                        {data.student_race === 'pardo' && <Text style={styles.checkboxMark}>X</Text>}
                                    </View>
                                    <Text style={styles.checkboxLabel}>Pardo(a)</Text>
                                </View>
                                <View style={styles.checkboxRow}>
                                    <View style={styles.checkbox}>
                                        {data.student_race === 'preto' && <Text style={styles.checkboxMark}>X</Text>}
                                    </View>
                                    <Text style={styles.checkboxLabel}>Preto(a)</Text>
                                </View>
                                <View style={styles.checkboxRow}>
                                    <View style={styles.checkbox}>
                                        {data.student_race === 'nao_declarar' && <Text style={styles.checkboxMark}>X</Text>}
                                    </View>
                                    <Text style={styles.checkboxLabel}>Prefiro não declarar</Text>
                                </View>
                            </View>
                        </View>

                        {/* Etnia */}
                        <View style={[styles.cell, { width: '35%' }]}>
                            <Text style={styles.checkboxTitle}>Etnia</Text>
                            <View style={styles.checkboxContainer}>
                                <View style={styles.checkboxRow}>
                                    <View style={styles.checkbox}>
                                        {data.student_ethnicity === 'indigena' && <Text style={styles.checkboxMark}>X</Text>}
                                    </View>
                                    <Text style={styles.checkboxLabel}>Indígena</Text>
                                </View>
                                <View style={styles.checkboxRow}>
                                    <View style={styles.checkbox}>
                                        {data.student_ethnicity === 'quilombola' && <Text style={styles.checkboxMark}>X</Text>}
                                    </View>
                                    <Text style={styles.checkboxLabel}>Quilombola</Text>
                                </View>
                                <View style={styles.checkboxRow}>
                                    <View style={styles.checkbox}>
                                        {data.student_ethnicity === 'outra' && <Text style={styles.checkboxMark}>X</Text>}
                                    </View>
                                    <Text style={styles.checkboxLabel}>Outra</Text>
                                </View>
                                <View style={styles.checkboxRow}>
                                    <View style={styles.checkbox}>
                                        {data.student_ethnicity === 'nao_declarar' && <Text style={styles.checkboxMark}>X</Text>}
                                    </View>
                                    <Text style={styles.checkboxLabel}>Prefiro não declarar</Text>
                                </View>
                                <Text style={[styles.label, { marginTop: 4 }]}>Informar comunidade se marcar etnia:</Text>
                                <Text style={[styles.value, { fontSize: 7, marginTop: 2 }]}>{data.student_ethnicity_community}</Text>
                            </View>
                        </View>

                        {/* Deficiência */}
                        <View style={[styles.cell, styles.cellLast, { width: '40%' }]}>
                            <Text style={styles.checkboxTitle}>Apenas para pessoa com deficiência e/ou AH/SD</Text>
                            <View style={styles.checkboxContainer}>
                                <View style={styles.checkboxRow}>
                                    <View style={styles.checkbox}>
                                        {data.student_disability === 'alta_habilidade' && <Text style={styles.checkboxMark}>X</Text>}
                                    </View>
                                    <Text style={styles.checkboxLabel}>Alta habilidade/superdotação</Text>
                                </View>
                                <View style={styles.checkboxRow}>
                                    <View style={styles.checkbox}>
                                        {data.student_disability === 'auditiva' && <Text style={styles.checkboxMark}>X</Text>}
                                    </View>
                                    <Text style={styles.checkboxLabel}>Deficiência auditiva</Text>
                                </View>
                                <View style={styles.checkboxRow}>
                                    <View style={styles.checkbox}>
                                        {data.student_disability === 'intelectual' && <Text style={styles.checkboxMark}>X</Text>}
                                    </View>
                                    <Text style={styles.checkboxLabel}>Deficiência intelectual</Text>
                                </View>
                                <View style={styles.checkboxRow}>
                                    <View style={styles.checkbox}>
                                        {data.student_disability === 'motora' && <Text style={styles.checkboxMark}>X</Text>}
                                    </View>
                                    <Text style={styles.checkboxLabel}>Deficiência motora</Text>
                                </View>
                                <View style={styles.checkboxRow}>
                                    <View style={styles.checkbox}>
                                        {data.student_disability === 'visual_baixa' && <Text style={styles.checkboxMark}>X</Text>}
                                    </View>
                                    <Text style={styles.checkboxLabel}>Deficiência visual/baixa visão</Text>
                                </View>
                                <View style={styles.checkboxRow}>
                                    <View style={styles.checkbox}>
                                        {data.student_disability === 'visual' && <Text style={styles.checkboxMark}>X</Text>}
                                    </View>
                                    <Text style={styles.checkboxLabel}>Deficiência visual</Text>
                                </View>
                                <View style={styles.checkboxRow}>
                                    <View style={styles.checkbox}>
                                        {data.student_disability === 'surdocegueira' && <Text style={styles.checkboxMark}>X</Text>}
                                    </View>
                                    <Text style={styles.checkboxLabel}>Surdocegueira</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Dados da Concedente - Header */}
                    <View style={styles.row}>
                        <View style={[styles.cell, styles.cellLast, { width: '100%' }]}>
                            <Text style={styles.sectionHeader}>Dados da Concedente</Text>
                        </View>
                    </View>

                    {/* Razão Social */}
                    <View style={styles.row}>
                        <View style={[styles.cell, styles.cellLast, { width: '100%' }]}>
                            <Text style={styles.label}>Razão Social</Text>
                            <Text style={styles.value}>{data.company_name}</Text>
                        </View>
                    </View>

                    {/* Nome de Fantasia */}
                    <View style={styles.row}>
                        <View style={[styles.cell, styles.cellLast, { width: '100%' }]}>
                            <Text style={styles.label}>Nome de Fantasia ou de Pessoa Física</Text>
                            <Text style={styles.value}>{data.company_fantasy_name}</Text>
                        </View>
                    </View>

                    {/* CNPJ e Endereço */}
                    <View style={styles.row}>
                        <View style={[styles.cell, { width: '30%' }]}>
                            <Text style={styles.label}>CNPJ ou Registro no Conselho</Text>
                            <Text style={styles.value}>{data.company_cnpj}</Text>
                        </View>
                        <View style={[styles.cell, styles.cellLast, { width: '70%' }]}>
                            <Text style={styles.label}>Endereço (Logradouro, Número e Complemento)</Text>
                            <Text style={styles.value}>{data.company_address}</Text>
                        </View>
                    </View>

                    {/* Bairro, Município e CEP */}
                    <View style={styles.row}>
                        <View style={[styles.cell, { width: '30%' }]}>
                            <Text style={styles.label}>Bairro</Text>
                            <Text style={styles.value}>{data.company_neighborhood}</Text>
                        </View>
                        <View style={[styles.cell, { width: '50%' }]}>
                            <Text style={styles.label}>Município-UF</Text>
                            <Text style={styles.value}>{data.company_city_uf}</Text>
                        </View>
                        <View style={[styles.cell, styles.cellLast, { width: '20%' }]}>
                            <Text style={styles.label}>CEP</Text>
                            <Text style={styles.value}>{data.company_zip}</Text>
                        </View>
                    </View>

                    {/* Telefone e Email */}
                    <View style={styles.row}>
                        <View style={[styles.cell, { width: '30%' }]}>
                            <Text style={styles.label}>DDD + Telefone</Text>
                            <Text style={styles.value}>{data.company_phone}</Text>
                        </View>
                        <View style={[styles.cell, styles.cellLast, { width: '70%' }]}>
                            <Text style={styles.label}>E-mail</Text>
                            <Text style={styles.value}>{data.company_email}</Text>
                        </View>
                    </View>

                    {/* Responsável Legal */}
                    <View style={styles.row}>
                        <View style={[styles.cell, styles.cellLast, { width: '100%' }]}>
                            <Text style={styles.label}>Responsável Legal pela Instituição para este Fim</Text>
                            <Text style={styles.value}>{data.company_representative}</Text>
                        </View>
                    </View>

                    {/* Cargo, CPF e Telefone do Responsável */}
                    <View style={styles.row}>
                        <View style={[styles.cell, { width: '60%' }]}>
                            <Text style={styles.label}>Cargo/Qualificação</Text>
                            <Text style={styles.value}>{data.company_representative_role}</Text>
                        </View>
                        <View style={[styles.cell, { width: '20%' }]}>
                            <Text style={styles.label}>CPF</Text>
                            <Text style={styles.value}>{data.company_representative_cpf}</Text>
                        </View>
                        <View style={[styles.cell, styles.cellLast, { width: '20%' }]}>
                            <Text style={styles.label}>DDD + Telefone</Text>
                            <Text style={styles.value}>{data.company_representative_phone}</Text>
                        </View>
                    </View>

                    {/* Supervisor do Estágio */}
                    <View style={styles.row}>
                        <View style={[styles.cell, styles.cellLast, { width: '100%' }]}>
                            <Text style={styles.label}>Supervisor do Estágio na Instituição Concedente</Text>
                            <Text style={styles.value}>{data.company_supervisor}</Text>
                        </View>
                    </View>

                    {/* Cargo, CPF e Telefone do Supervisor */}
                    <View style={styles.row}>
                        <View style={[styles.cell, { width: '60%' }]}>
                            <Text style={styles.label}>Cargo/Qualificação</Text>
                            <Text style={styles.value}>{data.company_supervisor_role}</Text>
                        </View>
                        <View style={[styles.cell, { width: '20%' }]}>
                            <Text style={styles.label}>CPF</Text>
                            <Text style={styles.value}>{data.company_supervisor_cpf}</Text>
                        </View>
                        <View style={[styles.cell, styles.cellLast, { width: '20%' }]}>
                            <Text style={styles.label}>DDD + Telefone</Text>
                            <Text style={styles.value}>{data.company_supervisor_phone}</Text>
                        </View>
                    </View>

                    {/* Setor */}
                    <View style={styles.row}>
                        <View style={[styles.cell, styles.cellLast, { width: '100%' }]}>
                            <Text style={styles.label}>Setor de Realização do Estágio</Text>
                            <Text style={styles.value}>{data.company_sector}</Text>
                        </View>
                    </View>

                    {/* Dados do Estágio */}
                    <View style={styles.row}>
                        {/* Tipo */}
                        <View style={[styles.cell, { width: '20%' }]}>
                            <Text style={styles.label}>Tipo de Estágio</Text>
                            <View style={styles.checkboxRow}>
                                <View style={styles.checkbox}>
                                    {data.internship_type === 'obrigatorio' && <Text style={styles.checkboxMark}>X</Text>}
                                </View>
                                <Text style={styles.checkboxLabel}>Obrigatório</Text>
                            </View>
                            <View style={styles.checkboxRow}>
                                <View style={styles.checkbox}>
                                    {data.internship_type === 'nao_obrigatorio' && <Text style={styles.checkboxMark}>X</Text>}
                                </View>
                                <Text style={styles.checkboxLabel}>Não Obrigatório</Text>
                            </View>
                        </View>
                        {/* Forma */}
                        <View style={[styles.cell, { width: '20%' }]}>
                            <Text style={styles.label}>Forma de Estágio</Text>
                            <View style={styles.checkboxRow}>
                                <View style={styles.checkbox}>
                                    {data.internship_mode === 'presencial' && <Text style={styles.checkboxMark}>X</Text>}
                                </View>
                                <Text style={styles.checkboxLabel}>Presencial</Text>
                            </View>
                            <View style={styles.checkboxRow}>
                                <View style={styles.checkbox}>
                                    {data.internship_mode === 'remoto' && <Text style={styles.checkboxMark}>X</Text>}
                                </View>
                                <Text style={styles.checkboxLabel}>Remoto</Text>
                            </View>
                        </View>
                        {/* Datas */}
                        <View style={[styles.cell, { width: '15%' }]}>
                            <Text style={styles.label}>Data Inicial</Text>
                            <Text style={styles.value}>{data.start_date}</Text>
                        </View>
                        <View style={[styles.cell, { width: '25%' }]}>
                            <Text style={styles.label}>Carga Horária Semanal</Text>
                            <Text style={styles.value}>{data.weekly_hours ? `${data.weekly_hours} HORAS` : ''}</Text>
                        </View>
                        <View style={[styles.cell, styles.cellLast, { width: '20%' }]}>
                            <Text style={styles.label}>Data Final Prevista</Text>
                            <Text style={styles.value}>{data.end_date}</Text>
                        </View>
                    </View>

                    {/* Tabela de Horários */}
                    <View style={styles.scheduleTable}>
                        <Text style={styles.scheduleHeader}>Previsão de Distribuição da Carga Horária</Text>

                        {/* Cabeçalho da Tabela */}
                        <View style={styles.scheduleHeaderRow}>
                            <View style={styles.scheduleTurnLabel}>
                                <Text>TURNO</Text>
                            </View>
                            {['SEGUNDA-FEIRA', 'TERÇA-FEIRA', 'QUARTA-FEIRA', 'QUINTA-FEIRA', 'SEXTA-FEIRA', 'SÁBADO', 'DOMINGO'].map((day, i) => (
                                <View key={day} style={[styles.scheduleDayColumn, ...(i === 6 ? [styles.scheduleDayColumnLast] : [])]}>
                                    <View style={styles.scheduleDayName}>
                                        <Text>{day}</Text>
                                    </View>
                                    <View style={styles.scheduleTimeRow}>
                                        <View style={styles.scheduleTimeCell}>
                                            <Text>INÍCIO</Text>
                                        </View>
                                        <View style={styles.scheduleTimeCellLast}>
                                            <Text>FINAL</Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* Linhas de Dados */}
                        {['1º', '2º', '3º'].map((turno, idx) => (
                            <View key={turno} style={[styles.scheduleDataRow, ...(idx === 2 ? [styles.scheduleDataRowLast] : [])]}>
                                <View style={styles.scheduleTurnCell}>
                                    <Text>{turno}</Text>
                                </View>
                                {['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'].map((day, i) => (
                                    <View key={day} style={[styles.scheduleDayData, ...(i === 6 ? [styles.scheduleDayDataLast] : [])]}>
                                        <View style={styles.scheduleTimeData}>
                                            <Text>{scheduleData[`${day}_start_${idx + 1}`] || ''}</Text>
                                        </View>
                                        <View style={styles.scheduleTimeDataLast}>
                                            <Text>{scheduleData[`${day}_end_${idx + 1}`] || ''}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>

                    {/* Assinaturas */}
                    <View style={[styles.signatureSection, { borderBottom: 0 }]}>
                        <View style={styles.signatureBox}>
                            <Text style={styles.signatureDate}>Solicitação em ____/____/____</Text>
                            <View style={styles.signatureLine}>
                                <Text>Assinatura do Discente</Text>
                            </View>
                        </View>
                        <View style={[styles.signatureBox, styles.signatureBoxLast]}>
                            <Text style={styles.signatureDate}>Autorização em ____/____/____</Text>
                            <View style={styles.signatureLine}>
                                <Text>Assinatura do Docente Orientador</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Rodapé */}
                <View style={styles.footer}>
                    <Text>
                        <Text style={styles.footerUnderline}>Observação:</Text>
                        {' '}As atividades de estágio supervisionado só podem ser{' '}
                        <Text style={styles.footerUppercase}>iniciadas após o cadastro</Text>
                        {' '}do Termo de Compromisso de Estágio no sistema competente.
                    </Text>
                </View>
            </Page>
        </Document>
    )
}
