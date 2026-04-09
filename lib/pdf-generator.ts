/**
 * Biblioteca para geração de PDFs dos formulários oficiais do IFCE
 * Re-exporta funções da engine unificada para compatibilidade
 *
 * @deprecated Use '@/lib/pdf-engine' diretamente em novos códigos
 */

// Re-exportar da engine unificada
export {
  generatePDFClient,
  generatePDFBlobFromElement,
  generateHTMLPDF,
  downloadPDFBlob,
  generatePDFServer,
  generatePDF,
  validateFormData,
  convertImagesToBase64,
} from './pdf-engine'

// Manter compatibilidade com API antiga
export type { PDFOptions } from './pdf-engine'

/**
 * @deprecated Use generatePDFClient de pdf-engine
 */
export { generatePDFClient as printElementAsPDF } from './pdf-engine'

/**
 * @deprecated Use generatePDFClient de pdf-engine
 */
export async function generateFormPDF(
  formRef: React.RefObject<HTMLFormElement>,
  documentType: string,
  formData?: Record<string, any>
): Promise<void> {
  if (!formRef.current) {
    throw new Error('Referência do formulário não encontrada')
  }

  // Validar dados se fornecidos
  if (formData) {
    const { validateFormData } = await import('./pdf-engine')
    validateFormData(formData)
  }

  // Gerar nome do arquivo
  const date = new Date().toISOString().split('T')[0]
  const filename = `${documentType}_${date}.pdf`

  // Gerar PDF
  const { generatePDFClient } = await import('./pdf-engine')
  await generatePDFClient(formRef.current, { filename })
}

/**
 * @deprecated Use generatePDFBlobFromElement de pdf-engine
 */
export { generatePDFBlobFromElement as generatePDFBlob } from './pdf-engine'

/**
 * @deprecated Use generatePDFServer de pdf-engine
 */
export async function generatePDFWithPuppeteer(
  element: HTMLElement,
  filename: string = 'document.pdf'
): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('generatePDFWithPuppeteer só pode ser executado no navegador')
  }

  const { generatePDFServer, convertImagesToBase64, downloadPDFBlob } = await import('./pdf-engine')

  // Obter HTML do elemento
  let html = element.outerHTML

  // Converter imagens para base64
  const baseUrl = window.location.origin
  try {
    html = await convertImagesToBase64(html, baseUrl)
  } catch (error) {
    console.warn('⚠️ Erro ao converter imagens, continuando sem conversão:', error)
  }

  // Criar HTML completo
  const fullHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; background: white; color: black; }
          @page { size: A4; margin: 0; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>${html}</body>
    </html>
  `

  const blob = await generatePDFServer(fullHtml, filename)
  downloadPDFBlob(blob, filename)
}
