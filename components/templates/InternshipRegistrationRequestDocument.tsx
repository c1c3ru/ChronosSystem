/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import { getAssetUrl } from '@/lib/pdf-generator-react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

interface InternshipRegistrationRequestData {
    // Dados Pessoais
    nome: string
    cpf: string
    nome_social: string
    curso: string
    matricula: string
    endereco: string
    bairro: string
    municipio_uf: string
    cep: string
    telefone: string
    email_institucional: string
    email_pessoal: string

    // Cor/Raça
    cor_raca: 'amarelo' | 'branco' | 'indigena' | 'pardo' | 'preto' | 'prefiro_nao_declarar'

    // Etnia
    etnia: 'indigena' | 'quilombola' | 'outra' | 'prefiro_nao_declarar'
    etnia_outra?: string
    comunidade_etnia?: string

    // Pessoa com Deficiência
    deficiencia: string[]

    // Dados de Pessoa Física (se aplicável)
    nome_fantasia_pf?: string
    cnpj_registro_conselho?: string
    endereco_pf?: string
    bairro_pf?: string
    municipio_uf_pf?: string
    cep_pf?: string
    telefone_pf?: string
    email_pf?: string

    // Responsável Legal
    responsavel_legal?: string
    cargo_qualificacao?: string
    cpf_responsavel?: string
    telefone_responsavel?: string

    // Supervisor do Estágio
    supervisor_nome?: string
    supervisor_cargo?: string

    // Setor de Realização
    setor_realizacao?: string

    // Tipo de Estágio
    tipo_estagio: 'obrigatorio' | 'nao_obrigatorio'
    forma_estagio: 'presencial' | 'remoto'

    // Datas e Carga Horária
    data_inicial?: string
    carga_horaria_semanal?: string
    data_final_prevista?: string

    // Turnos
    turnos?: {
        primeira: { segunda: string, terca: string, quarta: string, quinta: string, sexta: string, sabado: string, domingo: string }
        segunda: { segunda: string, terca: string, quarta: string, quinta: string, sexta: string, sabado: string, domingo: string }
        terceira: { segunda: string, terca: string, quarta: string, quinta: string, sexta: string, sabado: string, domingo: string }
    }

    // Datas de Solicitação e Autorização
    data_solicitacao?: string
    data_autorizacao?: string
}

interface InternshipRegistrationRequestDocumentProps {
    data: InternshipRegistrationRequestData
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
        width: 50,
        height: 50,
    },
    mainTitle: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        textTransform: 'uppercase',
        marginBottom: 15,
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
    checkboxContainer: {
        padding: 6,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 3,
    },
    checkbox: {
        width: 8,
        height: 8,
        borderWidth: 1, borderStyle: 'solid',
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
    },
    scheduleTable: {
        borderBottomWidth: 1, borderBottomStyle: 'solid',
        borderColor: '#000',
    },
    scheduleHeader: {
        fontSize: 6,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        textAlign: 'center',
        backgroundColor: '#e0e0e0',
        padding: 2,
        borderBottomWidth: 1, borderBottomStyle: 'solid',
        borderColor: '#000',
    },
    scheduleHeaderRow: {
        flexDirection: 'row',
        fontSize: 5,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        textAlign: 'center',
        borderBottomWidth: 1, borderBottomStyle: 'solid',
        borderColor: '#000',
    },
    scheduleTurnLabel: {
        width: '8%',
        borderRightWidth: 1, borderRightStyle: 'solid',
        borderColor: '#000',
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scheduleDayColumn: {
        flex: 1,
        borderRightWidth: 1, borderRightStyle: 'solid',
        borderColor: '#000',
    },
    scheduleDayColumnLast: {
        borderRight: 0,
    },
    scheduleDayName: {
        borderBottomWidth: 1, borderBottomStyle: 'solid',
        borderColor: '#000',
        padding: 2,
    },
    scheduleTimeRow: {
        flexDirection: 'row',
    },
    scheduleTimeCell: {
        flex: 1,
        borderRightWidth: 1, borderRightStyle: 'solid',
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
        borderBottomWidth: 1, borderBottomStyle: 'solid',
        borderColor: '#000',
        minHeight: 18,
    },
    scheduleDataRowLast: {
        borderBottom: 0,
    },
    scheduleTurnCell: {
        width: '8%',
        borderRightWidth: 1, borderRightStyle: 'solid',
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
        borderRightWidth: 1, borderRightStyle: 'solid',
        borderColor: '#000',
    },
    scheduleDayDataLast: {
        borderRight: 0,
    },
    scheduleTimeData: {
        flex: 1,
        borderRightWidth: 1, borderRightStyle: 'solid',
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
        marginTop: 20,
        marginBottom: 10,
    },
    signatureBox: {
        flex: 1,
        textAlign: 'center',
    },
    signatureLine: {
        borderTopWidth: 1, borderTopStyle: 'solid',
        borderColor: '#000',
        paddingTop: 4,
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        width: '80%',
        marginHorizontal: 'auto',
        marginTop: 30,
    },
    footer: {
        marginTop: 10,
        fontSize: 8,
        textAlign: 'justify',
    },
    footerBold: {
        fontFamily: 'Helvetica-Bold',
    },
    bold: {
        fontFamily: 'Helvetica-Bold',
    },
})

const formatDate = (dateString?: string): string => {
    if (!dateString) return '___/___/_____'
    const [year, month, day] = dateString.split('-')
    return `${day}/${month}/${year}`
}

export const InternshipRegistrationRequestDocument: React.FC<InternshipRegistrationRequestDocumentProps> = ({ data }) => {
    const turnos = data.turnos || { primeira: {}, segunda: {}, terceira: {} }

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Cabeçalho */}
                <View style={styles.header}>
                    <Image src={getAssetUrl("/assets/logoifce.png")} style={styles.logo} />
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Pró-Reitoria de Extensão</Text>
                        <Text style={styles.headerTitle}>Coordenação de Estágios e Acompanhamento de Egressos</Text>
                        <Text style={styles.headerSubtitle}>IFCE Campus Maracanaú</Text>
                        <Text style={styles.headerSubtitle}>Setor de Acompanhamento de Estágio</Text>
                    </View>
                    <Image src={getAssetUrl("/assets/brasao.png")} style={styles.logo} />
                </View>

                <Text style={styles.mainTitle}>Solicitação de Cadastro no Estágio</Text>

                {/* Dados Pessoais */}
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, { width: '75%' }]}>
                            <Text style={styles.label}>NOME</Text>
                            <Text style={styles.value}>{data.nome}</Text>
                        </View>
                        <View style={[styles.tableCell, styles.tableCellLast, { width: '25%' }]}>
                            <Text style={styles.label}>CPF</Text>
                            <Text style={styles.value}>{data.cpf}</Text>
                        </View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, styles.tableCellLast, { width: '100%' }]}>
                            <Text style={styles.label}>NOME SOCIAL</Text>
                            <Text style={styles.value}>{data.nome_social}</Text>
                        </View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, { width: '75%' }]}>
                            <Text style={styles.label}>CURSO</Text>
                            <Text style={styles.value}>{data.curso}</Text>
                        </View>
                        <View style={[styles.tableCell, styles.tableCellLast, { width: '25%' }]}>
                            <Text style={styles.label}>MATRÍCULA</Text>
                            <Text style={styles.value}>{data.matricula}</Text>
                        </View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, { width: '60%' }]}>
                            <Text style={styles.label}>ENDEREÇO (LOGRADOURO, NÚMERO E COMPLEMENTO)</Text>
                            <Text style={styles.value}>{data.endereco}</Text>
                        </View>
                        <View style={[styles.tableCell, styles.tableCellLast, { width: '40%' }]}>
                            <Text style={styles.label}>BAIRRO/DISTRITO</Text>
                            <Text style={styles.value}>{data.bairro}</Text>
                        </View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, { width: '40%' }]}>
                            <Text style={styles.label}>MUNICÍPIO-UF</Text>
                            <Text style={styles.value}>{data.municipio_uf}</Text>
                        </View>
                        <View style={[styles.tableCell, { width: '20%' }]}>
                            <Text style={styles.label}>CEP</Text>
                            <Text style={styles.value}>{data.cep}</Text>
                        </View>
                        <View style={[styles.tableCell, styles.tableCellLast, { width: '40%' }]}>
                            <Text style={styles.label}>DDD + TELEFONE</Text>
                            <Text style={styles.value}>{data.telefone}</Text>
                        </View>
                    </View>
                    <View style={[styles.tableRow, { borderBottom: 0 }]}>
                        <View style={[styles.tableCell, { width: '50%' }]}>
                            <Text style={styles.label}>E-MAIL INSTITUCIONAL</Text>
                            <Text style={styles.value}>{data.email_institucional}</Text>
                        </View>
                        <View style={[styles.tableCell, styles.tableCellLast, { width: '50%' }]}>
                            <Text style={styles.label}>E-MAIL PESSOAL</Text>
                            <Text style={styles.value}>{data.email_pessoal}</Text>
                        </View>
                    </View>
                </View>

                {/* Cor/Raça e Etnia */}
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, { width: '50%' }]}>
                            <Text style={styles.label}>COR/RAÇA</Text>
                            <View style={styles.checkboxContainer}>
                                {['amarelo', 'branco', 'indigena', 'pardo', 'preto', 'prefiro_nao_declarar'].map((cor) => (
                                    <View key={cor} style={styles.checkboxRow}>
                                        <View style={styles.checkbox}>
                                            {data.cor_raca === cor && <Text style={styles.checkboxMark}>X</Text>}
                                        </View>
                                        <Text style={styles.checkboxLabel}>
                                            {cor === 'amarelo' ? 'Amarelo(a)' :
                                                cor === 'branco' ? 'Branco(a)' :
                                                    cor === 'indigena' ? 'Indígena' :
                                                        cor === 'pardo' ? 'Pardo(a)' :
                                                            cor === 'preto' ? 'Preto(a)' :
                                                                'Prefiro não declarar'}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                        <View style={[styles.tableCell, styles.tableCellLast, { width: '50%' }]}>
                            <Text style={styles.label}>ETNIA</Text>
                            <View style={styles.checkboxContainer}>
                                {['indigena', 'quilombola', 'outra', 'prefiro_nao_declarar'].map((etnia) => (
                                    <View key={etnia} style={styles.checkboxRow}>
                                        <View style={styles.checkbox}>
                                            {data.etnia === etnia && <Text style={styles.checkboxMark}>X</Text>}
                                        </View>
                                        <Text style={styles.checkboxLabel}>
                                            {etnia === 'indigena' ? 'Indígena' :
                                                etnia === 'quilombola' ? 'Quilombola' :
                                                    etnia === 'outra' ? 'Outra' :
                                                        'Prefiro não declarar'}
                                        </Text>
                                    </View>
                                ))}
                                {data.comunidade_etnia && (
                                    <Text style={[styles.value, { marginTop: 4, fontSize: 7 }]}>
                                        Comunidade: {data.comunidade_etnia}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Responsável Legal e Supervisor */}
                <Text style={styles.sectionHeader}>DADOS DA CONCEDENTE</Text>
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, styles.tableCellLast, { width: '100%' }]}>
                            <Text style={styles.label}>RESPONSÁVEL LEGAL PELA INSTITUIÇÃO PARA ESTE FIM</Text>
                            <Text style={styles.value}>{data.responsavel_legal}</Text>
                        </View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, { width: '50%' }]}>
                            <Text style={styles.label}>CARGO/QUALIFICAÇÃO</Text>
                            <Text style={styles.value}>{data.cargo_qualificacao}</Text>
                        </View>
                        <View style={[styles.tableCell, { width: '25%' }]}>
                            <Text style={styles.label}>CPF</Text>
                            <Text style={styles.value}>{data.cpf_responsavel}</Text>
                        </View>
                        <View style={[styles.tableCell, styles.tableCellLast, { width: '25%' }]}>
                            <Text style={styles.label}>DDD + TELEFONE</Text>
                            <Text style={styles.value}>{data.telefone_responsavel}</Text>
                        </View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, { width: '75%' }]}>
                            <Text style={styles.label}>SUPERVISOR DO ESTÁGIO NA INSTITUIÇÃO CONCEDENTE</Text>
                            <Text style={styles.value}>{data.supervisor_nome}</Text>
                        </View>
                        <View style={[styles.tableCell, styles.tableCellLast, { width: '25%' }]}>
                            <Text style={styles.label}>CARGO/QUALIFICAÇÃO</Text>
                            <Text style={styles.value}>{data.supervisor_cargo}</Text>
                        </View>
                    </View>
                    <View style={[styles.tableRow, { borderBottom: 0 }]}>
                        <View style={[styles.tableCell, styles.tableCellLast, { width: '100%' }]}>
                            <Text style={styles.label}>SETOR DE REALIZAÇÃO DO ESTÁGIO</Text>
                            <Text style={styles.value}>{data.setor_realizacao}</Text>
                        </View>
                    </View>
                </View>

                {/* Tipo de Estágio e Datas */}
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, { width: '25%' }]}>
                            <Text style={styles.label}>TIPO DE ESTÁGIO</Text>
                            <View style={styles.checkboxContainer}>
                                <View style={styles.checkboxRow}>
                                    <View style={styles.checkbox}>
                                        {data.tipo_estagio === 'obrigatorio' && <Text style={styles.checkboxMark}>X</Text>}
                                    </View>
                                    <Text style={styles.checkboxLabel}>Obrigatório</Text>
                                </View>
                                <View style={styles.checkboxRow}>
                                    <View style={styles.checkbox}>
                                        {data.tipo_estagio === 'nao_obrigatorio' && <Text style={styles.checkboxMark}>X</Text>}
                                    </View>
                                    <Text style={styles.checkboxLabel}>Não Obrigatório</Text>
                                </View>
                            </View>
                        </View>
                        <View style={[styles.tableCell, { width: '25%' }]}>
                            <Text style={styles.label}>FORMA DE ESTÁGIO</Text>
                            <View style={styles.checkboxContainer}>
                                <View style={styles.checkboxRow}>
                                    <View style={styles.checkbox}>
                                        {data.forma_estagio === 'presencial' && <Text style={styles.checkboxMark}>X</Text>}
                                    </View>
                                    <Text style={styles.checkboxLabel}>Presencial</Text>
                                </View>
                                <View style={styles.checkboxRow}>
                                    <View style={styles.checkbox}>
                                        {data.forma_estagio === 'remoto' && <Text style={styles.checkboxMark}>X</Text>}
                                    </View>
                                    <Text style={styles.checkboxLabel}>Remoto</Text>
                                </View>
                            </View>
                        </View>
                        <View style={[styles.tableCell, { width: '17%' }]}>
                            <Text style={styles.label}>DATA INICIAL</Text>
                            <Text style={styles.value}>{formatDate(data.data_inicial)}</Text>
                        </View>
                        <View style={[styles.tableCell, { width: '16%' }]}>
                            <Text style={styles.label}>CARGA HORÁRIA</Text>
                            <Text style={styles.value}>{data.carga_horaria_semanal} H</Text>
                        </View>
                        <View style={[styles.tableCell, styles.tableCellLast, { width: '17%' }]}>
                            <Text style={styles.label}>DATA FINAL</Text>
                            <Text style={styles.value}>{formatDate(data.data_final_prevista)}</Text>
                        </View>
                    </View>
                </View>

                {/* Tabela de Horários */}
                <View style={styles.scheduleTable}>
                    <Text style={styles.scheduleHeader}>Distribuição da Carga Horária Semanal</Text>

                    <View style={styles.scheduleHeaderRow}>
                        <View style={styles.scheduleTurnLabel}>
                            <Text>TURNO</Text>
                        </View>
                        {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'].map((day, i) => (
                            <View key={day} style={[styles.scheduleDayColumn, ...(i === 6 ? [styles.scheduleDayColumnLast] : [])]}>
                                <View style={styles.scheduleDayName}>
                                    <Text>{day}</Text>
                                </View>
                                <View style={styles.scheduleTimeRow}>
                                    <View style={styles.scheduleTimeCell}>
                                        <Text>INI</Text>
                                    </View>
                                    <View style={styles.scheduleTimeCellLast}>
                                        <Text>FIM</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>

                    {['primeira', 'segunda', 'terceira'].map((turno, idx) => {
                        const turnoData = turnos[turno as keyof typeof turnos] || {}
                        return (
                            <View key={turno} style={[styles.scheduleDataRow, ...(idx === 2 ? [styles.scheduleDataRowLast] : [])]}>
                                <View style={styles.scheduleTurnCell}>
                                    <Text>{idx + 1}º</Text>
                                </View>
                                {['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'].map((dia, i) => {
                                    const horario = (turnoData[dia as keyof typeof turnoData] || '') as string
                                    const [inicio, fim] = horario.includes('-') ? horario.split('-') : ['', '']
                                    return (
                                        <View key={dia} style={[styles.scheduleDayData, ...(i === 6 ? [styles.scheduleDayDataLast] : [])]}>
                                            <View style={styles.scheduleTimeData}>
                                                <Text>{inicio}</Text>
                                            </View>
                                            <View style={styles.scheduleTimeDataLast}>
                                                <Text>{fim}</Text>
                                            </View>
                                        </View>
                                    )
                                })}
                            </View>
                        )
                    })}
                </View>

                {/* Assinaturas */}
                <View style={styles.signatureSection}>
                    <View style={styles.signatureBox}>
                        <View style={styles.signatureLine}>
                            <Text>Assinatura do Discente</Text>
                        </View>
                    </View>
                    <View style={styles.signatureBox}>
                        <View style={styles.signatureLine}>
                            <Text>Assinatura do Docente Orientador</Text>
                        </View>
                    </View>
                </View>

                {/* Observação */}
                <View style={styles.footer}>
                    <Text>
                        <Text style={styles.footerBold}>Observação:</Text>
                        {' '}As atividades de estágio supervisionado só podem ser{' '}
                        <Text style={styles.footerBold}>iniciadas após o cadastro</Text>
                        {' '}do Termo de Compromisso de Estágio no sistema competente.
                    </Text>
                </View>
            </Page>
        </Document>
    )
}
