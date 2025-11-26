/**
 * Gerador de PDF usando @react-pdf/renderer
 * Substitui html2pdf.js e Puppeteer para uma solução mais robusta e moderna
 */

import { pdf } from '@react-pdf/renderer'
import { saveAs } from 'file-saver'

/**
 * Gera e baixa um PDF a partir de um componente React-PDF
 * @param document - Componente React-PDF (criado com @react-pdf/renderer)
 * @param filename - Nome do arquivo PDF a ser baixado
 */
export async function generateAndDownloadPDF(
    document: React.ReactElement,
    filename: string
): Promise<void> {
    try {
        // Gerar o PDF como blob
        const blob = await pdf(document).toBlob()

        // Baixar o arquivo
        saveAs(blob, filename)

        console.log('✅ PDF gerado com sucesso:', filename)
    } catch (error) {
        console.error('❌ Erro ao gerar PDF:', error)
        throw error
    }
}

/**
 * Gera um PDF e retorna como blob (útil para preview ou upload)
 * @param document - Componente React-PDF
 */
export async function generatePDFBlob(
    document: React.ReactElement
): Promise<Blob> {
    try {
        const blob = await pdf(document).toBlob()
        return blob
    } catch (error) {
        console.error('❌ Erro ao gerar PDF blob:', error)
        throw new Error('Falha ao gerar PDF.')
    }
}

/**
 * Gera um PDF e retorna como URL (útil para preview em iframe)
 * @param document - Componente React-PDF
 */
export async function generatePDFUrl(
    document: React.ReactElement
): Promise<string> {
    try {
        const blob = await pdf(document).toBlob()
        return URL.createObjectURL(blob)
    } catch (error) {
        console.error('❌ Erro ao gerar PDF URL:', error)
        throw new Error('Falha ao gerar PDF.')
    }
}

/**
 * Valida se o formulário tem dados preenchidos
 */
export function validateFormData(formData: Record<string, any>): boolean {
    const hasData = Object.values(formData).some(value =>
        value !== null &&
        value !== undefined &&
        value !== '' &&
        value !== 0
    )

    if (!hasData) {
        throw new Error('Preencha pelo menos um campo antes de gerar o PDF')
    }

    return true
}

/**
 * Formata uma data para o padrão brasileiro
 */
export function formatDate(dateString: string): string {
    if (!dateString) return '___/___/_____'
    const [year, month, day] = dateString.split('-')
    return `${day}/${month}/${year}`
}

/**
 * Formata CPF
 */
export function formatCPF(cpf: string): string {
    if (!cpf) return ''
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

/**
 * Formata CNPJ
 */
export function formatCNPJ(cnpj: string): string {
    if (!cnpj) return ''
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

/**
 * Formata telefone
 */
export function formatPhone(phone: string): string {
    if (!phone) return ''
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11) {
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    } else if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    return phone
}
