/**
 * Biblioteca para gerar PDFs dos formulários
 * Usa a API de impressão do navegador (window.print)
 */

export interface PDFOptions {
  filename: string
  title?: string
}

/**
 * Imprime um elemento como PDF
 * Abre a caixa de diálogo de impressão do navegador
 */
export function printElementAsPDF(
  element: HTMLElement,
  options: PDFOptions
): void {
  const { filename } = options

  // Cria um iframe oculto
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  document.body.appendChild(iframe)

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
  if (!iframeDoc) {
    console.error('Não foi possível acessar o documento do iframe')
    return
  }

  // Copia o HTML do elemento
  iframeDoc.open()
  iframeDoc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${filename}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `)
  iframeDoc.close()

  // Aguarda o carregamento e imprime
  setTimeout(() => {
    iframe.contentWindow?.print()
    // Remove o iframe após a impressão
    setTimeout(() => {
      document.body.removeChild(iframe)
    }, 100)
  }, 250)
}

/**
 * Exporta um elemento como PDF usando a API de impressão
 * com nome de arquivo personalizado
 */
export function exportElementAsPDF(
  element: HTMLElement,
  filename: string
): void {
  const opt = {
    margin: 10,
    filename: `${filename}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
  }

  // Usa a API de impressão nativa
  printElementAsPDF(element, { filename })
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
