/**
 * Estilos comuns para documentos oficiais do IFCE
 * Reutilizáveis em todos os templates React-PDF
 */

import { StyleSheet } from '@react-pdf/renderer'

export const commonStyles = StyleSheet.create({
    // Página
    page: {
        padding: 30,
        fontSize: 10,
        fontFamily: 'Helvetica',
        backgroundColor: '#ffffff',
    },

    // Cabeçalho
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

    // Títulos
    title: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        marginBottom: 20,
        textTransform: 'uppercase',
    },
    subtitle: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 10,
    },

    // Seções
    sectionHeader: {
        backgroundColor: '#e0e0e0',
        padding: 4,
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        textTransform: 'uppercase',
        borderTopWidth: 1,
        borderTopStyle: 'solid',
        borderLeftWidth: 1,
        borderLeftStyle: 'solid',
        borderRightWidth: 1,
        borderRightStyle: 'solid',
        borderColor: '#000',
    },

    // Tabelas
    table: {
        width: '100%',
        marginBottom: 10,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#000',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderColor: '#000',
    },
    tableRowNoBorder: {
        flexDirection: 'row',
        borderBottomWidth: 0,
    },
    tableCell: {
        padding: 4,
        borderRightWidth: 1,
        borderRightStyle: 'solid',
        borderColor: '#000',
        fontSize: 7,
    },
    tableCellLast: {
        borderRightWidth: 0,
    },
    tableCellHeader: {
        backgroundColor: '#e0e0e0',
        padding: 4,
        borderRightWidth: 1,
        borderRightStyle: 'solid',
        borderColor: '#000',
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
    },

    // Labels e valores
    label: {
        fontSize: 6,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    value: {
        fontSize: 8,
        minHeight: 12,
    },

    // Caixas de texto
    textBox: {
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#000',
        padding: 8,
        fontSize: 9,
        minHeight: 100,
        marginBottom: 10,
        textAlign: 'justify',
    },
    textBoxSmall: {
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#000',
        padding: 6,
        fontSize: 8,
        minHeight: 60,
        marginBottom: 10,
    },

    // Parágrafos
    paragraph: {
        fontSize: 10,
        textAlign: 'justify',
        marginBottom: 15,
        lineHeight: 1.5,
    },
    paragraphSmall: {
        fontSize: 9,
        textAlign: 'justify',
        marginBottom: 10,
        lineHeight: 1.4,
    },
    paragraphIndent: {
        fontSize: 10,
        textAlign: 'justify',
        marginBottom: 15,
        lineHeight: 1.5,
        textIndent: 30,
    },

    // Alinhamentos
    textCenter: {
        textAlign: 'center',
    },
    textRight: {
        textAlign: 'right',
    },
    textJustify: {
        textAlign: 'justify',
    },

    // Data
    dateRight: {
        fontSize: 10,
        textAlign: 'right',
        marginBottom: 30,
    },
    dateCenter: {
        fontSize: 10,
        textAlign: 'center',
        marginBottom: 20,
    },

    // Assinaturas
    signatureBlock: {
        marginTop: 40,
        marginBottom: 20,
    },

    // Assinaturas
    signatureLine: {
        borderTopWidth: 1,
        borderTopStyle: 'solid',
        borderColor: '#000',
        paddingTop: 5,
        width: '66%',
        marginHorizontal: 'auto',
        textAlign: 'center',
        fontSize: 8,
        marginBottom: 30,
    },
    signatureLineSmall: {
        borderTopWidth: 1,
        borderTopStyle: 'solid',
        borderColor: '#000',
        paddingTop: 5,
        width: '50%',
        marginHorizontal: 'auto',
        textAlign: 'center',
        fontSize: 7,
        marginBottom: 25,
    },

    // Estilos de texto
    bold: {
        fontFamily: 'Helvetica-Bold',
    },
    italic: {
        fontFamily: 'Helvetica-Oblique',
    },
    boldItalic: {
        fontFamily: 'Helvetica-BoldOblique',
    },
    underline: {
        textDecoration: 'underline',
    },

    // Espaçamentos
    mb5: { marginBottom: 5 },
    mb10: { marginBottom: 10 },
    mb15: { marginBottom: 15 },
    mb20: { marginBottom: 20 },
    mt5: { marginTop: 5 },
    mt10: { marginTop: 10 },
    mt15: { marginTop: 15 },
    mt20: { marginTop: 20 },

    // Containers
    row: {
        flexDirection: 'row',
    },
    column: {
        flexDirection: 'column',
    },
    spaceBetween: {
        justifyContent: 'space-between',
    },
    spaceAround: {
        justifyContent: 'space-around',
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Bordas
    border: {
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#000',
    },
    borderTop: {
        borderTopWidth: 1,
        borderTopStyle: 'solid',
        borderColor: '#000',
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderColor: '#000',
    },
    borderLeft: {
        borderLeftWidth: 1,
        borderLeftStyle: 'solid',
        borderColor: '#000',
    },
    borderRight: {
        borderRightWidth: 1,
        borderRightStyle: 'solid',
        borderColor: '#000',
    },

    // Checkbox
    checkbox: {
        width: 10,
        height: 10,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#000',
        marginRight: 5,
        textAlign: 'center',
        fontSize: 8,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    checkboxLabel: {
        fontSize: 8,
    },
})

/**
 * Função auxiliar para formatar datas
 */
export const formatDate = (dateString: string): string => {
    if (!dateString) return '___/___/_____'
    const [year, month, day] = dateString.split('-')
    return `${day}/${month}/${year}`
}

/**
 * Função auxiliar para formatar CPF
 */
export const formatCPF = (cpf: string): string => {
    if (!cpf) return ''
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

/**
 * Função auxiliar para formatar CNPJ
 */
export const formatCNPJ = (cnpj: string): string => {
    if (!cnpj) return ''
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

/**
 * Função auxiliar para formatar telefone
 */
export const formatPhone = (phone: string): string => {
    if (!phone) return ''
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11) {
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    } else if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    return phone
}
