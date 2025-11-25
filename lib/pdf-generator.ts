/**
 * Biblioteca para geração de PDFs dos formulários oficiais do IFCE
 * Usa html2pdf.js para converter HTML em PDF mantendo a formatação oficial
 */

interface PDFOptions {
  filename?: string
  margin?: number | [number, number, number, number]
  pagebreak?: { mode: string[] }
  html2canvas?: any
  jsPDF?: any
}

/**
 * Gera PDF a partir de um elemento HTML
 * Otimizado para formulários oficiais do IFCE
 */
export async function printElementAsPDF(
  element: HTMLElement,
  options: PDFOptions = {}
): Promise<void> {
  // Verificar se estamos no cliente
  if (typeof window === 'undefined') {
    throw new Error('printElementAsPDF só pode ser executado no navegador')
  }

  try {
    // Importar html2pdf dinamicamente (apenas no cliente)
    const html2pdf = (await import('html2pdf.js')).default

    // Configurações otimizadas para documentos oficiais do IFCE
    const pdfOptions = {
      margin: options.margin || [30, 20, 20, 30], // [Superior, Direita, Inferior, Esquerda] - Padrão IFCE
      filename: options.filename || `documento_${new Date().toISOString().split('T')[0]}.pdf`,
      image: {
        type: 'jpeg' as const,
        quality: 0.98
      },
      html2canvas: {
        scale: 2, // Resolução alta
        useCORS: true,
        allowTaint: true, // Permite processar imagens locais
        logging: false,
        letterRendering: true,
        windowWidth: 794, // Largura exata A4 em pixels (96 DPI) - evita reescalonamento estranho
        scrollY: 0,
        scrollX: 0,
        ...options.html2canvas
      },
      jsPDF: {
        unit: 'mm' as const,
        format: 'a4' as const,
        orientation: 'portrait' as const,
        compress: true,
        ...options.jsPDF
      },
      pagebreak: options.pagebreak || {
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.page-break-before',
        after: '.page-break-after',
        avoid: ['.no-page-break', 'tr', '.avoid-break'] // Evitar quebra em linhas de tabela
      }
    }

    // Clonar o elemento para não afetar a visualização
    const clone = element.cloneNode(true) as HTMLElement

    // Preparar o clone para PDF
    prepareElementForPDF(clone)

    // Forçar largura A4 no clone para garantir layout correto antes da captura
    clone.style.width = '794px' // Largura A4 aprox em pixels
    clone.style.maxWidth = '794px'
    clone.style.margin = '0 auto'
    clone.style.boxSizing = 'border-box'

    // Gerar PDF
    await html2pdf()
      .set(pdfOptions)
      .from(clone)
      .save()

    console.log('✅ PDF gerado com sucesso:', options.filename)

  } catch (error) {
    console.error('❌ Erro ao gerar PDF:', error)
    throw new Error('Falha ao gerar PDF. Verifique se todos os campos estão preenchidos.')
  }
}

/**
 * Prepara o elemento HTML para geração de PDF
 * Remove elementos desnecessários e ajusta estilos
 */
function prepareElementForPDF(element: HTMLElement): void {
  // Remover botões e elementos de navegação (não devem aparecer no PDF)
  const elementsToRemove = element.querySelectorAll(
    'button, [data-no-pdf="true"], nav, .no-print, [role="navigation"]'
  )
  elementsToRemove.forEach(el => el.remove())

  // Remover links de navegação (manter apenas texto)
  const navLinks = element.querySelectorAll('a[href^="/"]')
  navLinks.forEach(link => {
    const span = document.createElement('span')
    span.textContent = link.textContent
    span.className = link.className
    link.parentNode?.replaceChild(span, link)
  })

  // Ajustar inputs para modo de impressão
  const inputs = element.querySelectorAll('input:not([type="hidden"]), textarea, select')
  inputs.forEach((input: any) => {
    // Adicionar borda inferior para campos vazios (linha para preenchimento manual)
    if (!input.value || input.value.trim() === '') {
      input.style.borderBottom = '1px solid #000'
      input.style.minHeight = '24px'
    }

    // Garantir que o valor seja visível
    input.style.color = '#000'
    input.style.backgroundColor = 'transparent'
    input.readOnly = true
  })

  // Ajustar checkboxes e radios
  const checkboxes = element.querySelectorAll('input[type="checkbox"], input[type="radio"]')
  checkboxes.forEach((checkbox: any) => {
    checkbox.style.accentColor = '#000'
    checkbox.style.border = '1px solid #000'
  })

  // Aplicar estilos para impressão oficial
  element.style.backgroundColor = '#fff'
  element.style.color = '#000'
  element.style.fontFamily = 'Arial, sans-serif'
  element.style.fontSize = '11pt' // Reduzir levemente para caber melhor
  element.style.lineHeight = '1.4'
  element.style.padding = '20px' // Padding interno seguro
  element.style.width = '100%'
  element.style.maxWidth = '100%'
  element.style.boxSizing = 'border-box'

  // Ajustar títulos e cabeçalhos
  const headers = element.querySelectorAll('h1, h2, h3, h4, h5, h6')
  headers.forEach((header: any) => {
    header.style.color = '#000'
    header.style.pageBreakAfter = 'avoid'
    header.style.marginTop = '10px'
    header.style.marginBottom = '5px'
  })

  // Garantir que tabelas não quebrem entre páginas
  const tables = element.querySelectorAll('table')
  tables.forEach((table: any) => {
    table.style.pageBreakInside = 'auto' // Permitir quebra se necessário, mas controlar linhas
    table.style.width = '100%'
    table.style.borderCollapse = 'collapse'
    table.style.marginBottom = '10px'

    // Evitar quebra dentro de linhas da tabela
    const rows = table.querySelectorAll('tr')
    rows.forEach((row: any) => {
      row.style.pageBreakInside = 'avoid'
      row.style.pageBreakAfter = 'auto'
    })
  })

  // Ajustar cards e seções
  const cards = element.querySelectorAll('[class*="card"], [class*="section"], .avoid-break')
  cards.forEach((card: any) => {
    card.style.backgroundColor = '#fff'
    card.style.border = 'none' // Remover bordas de cards para parecer documento
    card.style.pageBreakInside = 'avoid'
    card.style.marginBottom = '15px'
    card.style.width = '100%'
  })
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
 * Gera PDF de um formulário específico
 * Wrapper conveniente para uso nos componentes de formulário
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
    validateFormData(formData)
  }

  // Gerar nome do arquivo
  const date = new Date().toISOString().split('T')[0]
  const filename = `${documentType}_${date}.pdf`

  // Gerar PDF
  await printElementAsPDF(formRef.current, { filename })
}

/**
 * Gera PDF como Blob (para visualização)
 * Retorna o PDF como Blob ao invés de fazer download
 */
export async function generatePDFBlob(
  element: HTMLElement,
  options: PDFOptions = {}
): Promise<Blob> {
  // Verificar se estamos no cliente
  if (typeof window === 'undefined') {
    throw new Error('generatePDFBlob só pode ser executado no navegador')
  }

  try {
    // Importar html2pdf dinamicamente (apenas no cliente)
    const html2pdf = (await import('html2pdf.js')).default

    // Configurações otimizadas para documentos oficiais do IFCE
    const pdfOptions = {
      margin: options.margin || [10, 10, 10, 10], // Margem de 10mm
      filename: options.filename || `documento_${new Date().toISOString().split('T')[0]}.pdf`,
      image: {
        type: 'jpeg' as const,
        quality: 0.98
      },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true, // Permite processar imagens locais
        logging: false,
        letterRendering: true,
        windowWidth: 794, // Largura exata A4 em pixels (96 DPI)
        scrollY: 0,
        scrollX: 0,
        ...options.html2canvas
      },
      jsPDF: {
        unit: 'mm' as const,
        format: 'a4' as const,
        orientation: 'portrait' as const,
        compress: true,
        ...options.jsPDF
      },
      pagebreak: options.pagebreak || {
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.page-break-before',
        after: '.page-break-after',
        avoid: ['.no-page-break', 'tr', '.avoid-break']
      }
    }

    // Clonar o elemento para não afetar a visualização
    const clone = element.cloneNode(true) as HTMLElement

    // Preparar o clone para PDF
    prepareElementForPDF(clone)

    // Forçar largura A4 no clone para garantir layout correto antes da captura
    clone.style.width = '794px' // Largura A4 aprox em pixels
    clone.style.maxWidth = '794px'
    clone.style.margin = '0 auto'
    clone.style.boxSizing = 'border-box'

    // Gerar PDF como Blob
    const pdfBlob = await html2pdf()
      .set(pdfOptions)
      .from(clone)
      .outputPdf('blob')

    console.log('✅ PDF Blob gerado com sucesso')

    return pdfBlob as Blob

  } catch (error) {
    console.error('❌ Erro ao gerar PDF Blob:', error)
    throw new Error('Falha ao gerar visualização do PDF.')
  }
}

/**
 * Faz download de um Blob de PDF
 * Útil para baixar PDFs que foram gerados como Blob para visualização
 */
export function downloadPDFBlob(blob: Blob, filename: string): void {
  // Criar URL temporária para o blob
  const url = URL.createObjectURL(blob)

  // Criar elemento <a> temporário para download
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`

  // Adicionar ao DOM, clicar e remover
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Liberar URL temporária
  URL.revokeObjectURL(url)

  console.log('✅ PDF baixado:', link.download)
}

/**
 * Gera PDF usando Puppeteer (server-side) via API
 * Melhor qualidade e suporte a múltiplas páginas
 */
export async function generatePDFWithPuppeteer(
  element: HTMLElement,
  filename: string = 'document.pdf'
): Promise<void> {
  try {
    // Obter HTML do elemento
    const html = element.outerHTML

    // Criar HTML completo com estilos
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              background: white;
              color: black;
            }
            @page {
              size: A4;
              margin: 0;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `

    // Chamar API para gerar PDF
    const response = await fetch('/api/pdf/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        html: fullHtml,
        filename
      })
    })

    if (!response.ok) {
      throw new Error('Falha ao gerar PDF')
    }

    // Obter blob do PDF
    const blob = await response.blob()

    // Fazer download
    downloadPDFBlob(blob, filename)

    console.log('✅ PDF gerado com Puppeteer:', filename)
  } catch (error) {
    console.error('❌ Erro ao gerar PDF com Puppeteer:', error)
    throw new Error('Falha ao gerar PDF. Tente novamente.')
  }
}
