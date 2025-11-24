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
      margin: options.margin || 15, // Margem de 15mm (padrão ABNT)
      filename: options.filename || `documento_${new Date().toISOString().split('T')[0]}.pdf`,
      image: {
        type: 'jpeg' as const, // Tipo literal para compatibilidade
        quality: 0.98 // Alta qualidade para documentos oficiais
      },
      html2canvas: {
        scale: 2, // Resolução alta
        useCORS: true,
        logging: false,
        letterRendering: true,
        windowWidth: 1200,
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
        avoid: '.no-page-break'
      }
    }

    // Clonar o elemento para não afetar a visualização
    const clone = element.cloneNode(true) as HTMLElement

    // Preparar o clone para PDF
    prepareElementForPDF(clone)

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
  element.style.fontSize = '12pt'
  element.style.lineHeight = '1.5'
  element.style.padding = '0'
  element.style.maxWidth = '100%'

  // Ajustar títulos e cabeçalhos
  const headers = element.querySelectorAll('h1, h2, h3, h4, h5, h6')
  headers.forEach((header: any) => {
    header.style.color = '#000'
    header.style.pageBreakAfter = 'avoid'
  })

  // Garantir que tabelas não quebrem entre páginas
  const tables = element.querySelectorAll('table')
  tables.forEach((table: any) => {
    table.style.pageBreakInside = 'avoid'
    table.style.borderCollapse = 'collapse'
  })

  // Ajustar cards e seções
  const cards = element.querySelectorAll('[class*="card"], [class*="section"]')
  cards.forEach((card: any) => {
    card.style.backgroundColor = '#fff'
    card.style.border = '1px solid #ddd'
    card.style.pageBreakInside = 'avoid'
    card.style.marginBottom = '10px'
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
      margin: options.margin || 15,
      filename: options.filename || `documento_${new Date().toISOString().split('T')[0]}.pdf`,
      image: {
        type: 'jpeg' as const,
        quality: 0.98
      },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true,
        windowWidth: 1200,
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
        avoid: '.no-page-break'
      }
    }

    // Clonar o elemento para não afetar a visualização
    const clone = element.cloneNode(true) as HTMLElement

    // Preparar o clone para PDF
    prepareElementForPDF(clone)

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
