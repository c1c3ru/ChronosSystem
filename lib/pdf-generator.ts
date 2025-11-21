/**
 * Biblioteca para gerar PDFs dos formulários
 * Usa html2pdf.js para gerar PDFs reais que podem ser baixados
 */

// Dynamic import to avoid SSR issues
const loadHtml2Pdf = async () => {
  const html2pdf = await import('html2pdf.js')
  return html2pdf.default || html2pdf
}

export interface PDFOptions {
  filename: string
  title?: string
  margin?: number | [number, number, number, number]
  pagebreak?: {
    mode?: string | string[]
    before?: string | string[]
    after?: string | string[]
    avoid?: string | string[]
  }
}

/**
 * Gera e baixa um PDF do elemento HTML
 * Usa html2pdf.js para criar um PDF real em formato A4
 */
export async function printElementAsPDF(
  element: HTMLElement,
  options: PDFOptions
): Promise<void> {
  const { filename, margin = 0, pagebreak } = options
  const html2pdf = await loadHtml2Pdf()

  // Configurações otimizadas para formato A4 profissional
  const opt = {
    margin: margin,
    filename: `${filename}.pdf`,
    image: {
      type: 'jpeg' as const,
      quality: 0.98
    },
    html2canvas: {
      scale: 2, // Alta resolução
      useCORS: true,
      letterRendering: true,
      logging: false,
      width: 794, // 210mm em pixels (96 DPI)
      windowWidth: 794,
      backgroundColor: '#ffffff'
    },
    jsPDF: {
      unit: 'mm' as const,
      format: 'a4' as const,
      orientation: 'portrait' as const,
      compress: true
    },
    pagebreak: pagebreak || {
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.page-break-before',
      after: '.page-break-after',
      avoid: '.no-page-break'
    }
  }

  try {
    // Clona o elemento para não afetar a página
    const clone = element.cloneNode(true) as HTMLElement

    // Remove elementos que não devem aparecer no PDF
    const noPrintElements = clone.querySelectorAll('.no-print')
    noPrintElements.forEach(el => el.remove())

    // Aplica estilos para impressão profissional
    clone.style.backgroundColor = '#ffffff'
    clone.style.color = '#000000'
    clone.style.width = '210mm'
    clone.style.minHeight = '297mm'
    clone.style.boxSizing = 'border-box'

    // Gera o PDF
    await html2pdf().set(opt).from(clone).save()
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    throw new Error('Falha ao gerar PDF')
  }
}

/**
 * Exporta um elemento como PDF
 * Wrapper para printElementAsPDF com opções simplificadas
 */
export async function exportElementAsPDF(
  element: HTMLElement,
  filename: string
): Promise<void> {
  await printElementAsPDF(element, { filename })
}

/**
 * Gera PDF com configurações customizadas
 */
export async function generateCustomPDF(
  element: HTMLElement,
  options: {
    filename: string
    orientation?: 'portrait' | 'landscape'
    format?: string
    margin?: number | [number, number, number, number]
  }
): Promise<void> {
  const { filename, orientation = 'portrait', format = 'a4', margin = 10 } = options
  const html2pdf = await loadHtml2Pdf()

  const opt = {
    margin: margin,
    filename: `${filename}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true
    },
    jsPDF: {
      unit: 'mm' as const,
      format: format as any,
      orientation: orientation
    }
  }

  try {
    const clone = element.cloneNode(true) as HTMLElement
    const noPrintElements = clone.querySelectorAll('.no-print')
    noPrintElements.forEach(el => el.remove())

    clone.style.backgroundColor = 'white'
    clone.style.color = 'black'

    await html2pdf().set(opt).from(clone).save()
  } catch (error) {
    console.error('Erro ao gerar PDF customizado:', error)
    throw new Error('Falha ao gerar PDF')
  }
}

/**
 * Gera um Blob do PDF para preview
 * Usa as mesmas configurações profissionais do printElementAsPDF
 */
export async function generatePDFBlob(
  element: HTMLElement,
  options: PDFOptions
): Promise<Blob> {
  const { margin = 0, pagebreak } = options
  const html2pdf = await loadHtml2Pdf()

  // Configurações otimizadas para formato A4 profissional
  const opt = {
    margin: margin,
    filename: 'preview.pdf',
    image: {
      type: 'jpeg' as const,
      quality: 0.98
    },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false,
      width: 794, // 210mm em pixels (96 DPI)
      windowWidth: 794,
      backgroundColor: '#ffffff'
    },
    jsPDF: {
      unit: 'mm' as const,
      format: 'a4' as const,
      orientation: 'portrait' as const,
      compress: true
    },
    pagebreak: pagebreak || {
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.page-break-before',
      after: '.page-break-after',
      avoid: '.no-page-break'
    }
  }

  try {
    const clone = element.cloneNode(true) as HTMLElement
    const noPrintElements = clone.querySelectorAll('.no-print')
    noPrintElements.forEach(el => el.remove())

    clone.style.backgroundColor = '#ffffff'
    clone.style.color = '#000000'
    clone.style.width = '210mm'
    clone.style.minHeight = '297mm'
    clone.style.boxSizing = 'border-box'

    const pdf = await html2pdf().set(opt).from(clone).outputPdf('blob')
    return pdf
  } catch (error) {
    console.error('Erro ao gerar Blob do PDF:', error)
    throw new Error('Falha ao gerar preview do PDF')
  }
}

/**
 * Cria um link de download para um blob de PDF
 */
export function downloadPDFBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
