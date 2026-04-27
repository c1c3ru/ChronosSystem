/**
 * Engine unificada de geração de PDF
 * Consolida html2pdf.js (cliente) e Puppeteer (servidor) em uma API coesa
 *
 * @module pdf-engine
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PDFOptions {
  filename?: string
  margin?: number | [number, number, number, number]
  landscape?: boolean
  html2canvas?: Record<string, any>
  jsPDF?: Record<string, any>
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENT-SIDE: html2pdf.js
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Prepara elemento HTML para geração de PDF
 * Remove botões, ajusta inputs, controla quebras de página
 */
function prepareElementForPDF(element: HTMLElement): void {
  // Injeta normalização visual para garantir padrão institucional claro
  const style = document.createElement('style')
  style.textContent = `
    .pdf-export-root {
      background: #fff !important;
      color: #000 !important;
      font-family: Arial, "Times New Roman", sans-serif !important;
      box-shadow: none !important;
      filter: none !important;
    }
    .pdf-export-root *,
    .pdf-export-root *::before,
    .pdf-export-root *::after {
      text-shadow: none !important;
    }
    .pdf-export-root [class*="text-white"],
    .pdf-export-root [class*="text-slate-"],
    .pdf-export-root [class*="text-neutral-"],
    .pdf-export-root [class*="text-zinc-"],
    .pdf-export-root [class*="text-gray-"] {
      color: #000 !important;
    }
    .pdf-export-root [class*="bg-slate-"],
    .pdf-export-root [class*="bg-neutral-"],
    .pdf-export-root [class*="bg-zinc-"],
    .pdf-export-root [class*="bg-black"],
    .pdf-export-root [class*="from-slate-"],
    .pdf-export-root [class*="to-slate-"] {
      background: #fff !important;
      background-color: #fff !important;
      background-image: none !important;
    }
    .pdf-export-root [class*="border-white"] {
      border-color: #000 !important;
    }
    .pdf-export-root .shadow,
    .pdf-export-root [class*="shadow-"],
    .pdf-export-root [class*="backdrop-"],
    .pdf-export-root [class*="blur"] {
      box-shadow: none !important;
      backdrop-filter: none !important;
      filter: none !important;
    }
  `
  element.prepend(style)
  element.classList.add('pdf-export-root')

  // Remover botões e elementos de navegação
  const elementsToRemove = element.querySelectorAll(
    'button, [data-no-pdf="true"], nav, .no-print, [role="navigation"]'
  )
  elementsToRemove.forEach((el) => el.remove())

  // Remover links de navegação (manter apenas texto)
  const navLinks = element.querySelectorAll('a[href^="/"]')
  navLinks.forEach((link) => {
    const span = document.createElement('span')
    span.textContent = link.textContent
    span.className = link.className
    link.parentNode?.replaceChild(span, link)
  })

  // Ajustar inputs para modo de impressão
  const inputs = element.querySelectorAll('input:not([type="hidden"]), textarea, select')
  inputs.forEach((input: any) => {
    if (!input.value || input.value.trim() === '') {
      input.style.borderBottom = '1px solid #000'
      input.style.minHeight = '24px'
    }
    input.style.color = '#000'
    input.style.backgroundColor = '#fff'
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
  element.style.fontSize = '11pt'
  element.style.lineHeight = '1.4'
  element.style.padding = '20px'
  element.style.width = '100%'
  element.style.maxWidth = '100%'
  element.style.boxSizing = 'border-box'

  // Garantir que tabelas não quebrem entre páginas
  const tables = element.querySelectorAll('table')
  tables.forEach((table: any) => {
    table.style.pageBreakInside = 'auto'
    table.style.width = '100%'
    table.style.borderCollapse = 'collapse'
    table.style.marginBottom = '10px'

    const rows = table.querySelectorAll('tr')
    rows.forEach((row: any) => {
      row.style.pageBreakInside = 'avoid'
      row.style.pageBreakAfter = 'auto'
    })
  })
}

/**
 * Gera PDF a partir de um elemento HTML (cliente)
 * Usa html2pdf.js para converter HTML em PDF
 */
export async function generatePDFClient(
  element: HTMLElement,
  options: PDFOptions = {}
): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('generatePDFClient só pode ser executado no navegador')
  }

  // Sincronizar os valores dos inputs nativos para os atributos do DOM 
  // para que cloneNode preserve os dados preenchidos pelo usuário
  const inputs = element.querySelectorAll('input, textarea, select')
  inputs.forEach((input: any) => {
    if (input.type === 'checkbox' || input.type === 'radio') {
      if (input.checked) input.setAttribute('checked', 'checked')
      else input.removeAttribute('checked')
    } else if (input.tagName === 'TEXTAREA') {
      input.innerHTML = input.value
    } else {
      input.setAttribute('value', input.value)
    }
  })

  const html2pdf = (await import('html2pdf.js')).default

  const pdfOptions = {
    margin: options.margin || [30, 20, 20, 30],
    filename: options.filename || `documento_${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      letterRendering: true,
      backgroundColor: '#ffffff',
      windowWidth: 794,
      scrollY: 0,
      scrollX: 0,
      ...options.html2canvas,
    },
    jsPDF: {
      unit: 'mm' as const,
      format: 'a4' as const,
      orientation: (options.landscape ? 'landscape' : 'portrait') as 'landscape' | 'portrait',
      compress: true,
      ...options.jsPDF,
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.page-break-before',
      after: '.page-break-after',
      avoid: ['.no-page-break', 'tr', '.avoid-break'],
    },
  }

  const clone = element.cloneNode(true) as HTMLElement
  prepareElementForPDF(clone)
  clone.style.width = '794px'
  clone.style.maxWidth = '794px'
  clone.style.margin = '0 auto'
  clone.style.boxSizing = 'border-box'

  await html2pdf().set(pdfOptions).from(clone).save()
}

/**
 * Gera PDF como Blob a partir de um elemento HTML (cliente)
 * Útil para preview antes do download
 */
export async function generatePDFBlobFromElement(
  element: HTMLElement,
  options: PDFOptions = {}
): Promise<Blob> {
  if (typeof window === 'undefined') {
    throw new Error('generatePDFBlobFromElement só pode ser executado no navegador')
  }

  const html2pdf = (await import('html2pdf.js')).default

  const pdfOptions = {
    margin: options.margin || [10, 10, 10, 10],
    filename: options.filename || `documento_${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      letterRendering: true,
      backgroundColor: '#ffffff',
      windowWidth: 794,
      scrollY: 0,
      scrollX: 0,
      ...options.html2canvas,
    },
    jsPDF: {
      unit: 'mm' as const,
      format: 'a4' as const,
      orientation: (options.landscape ? 'landscape' : 'portrait') as 'landscape' | 'portrait',
      compress: true,
      ...options.jsPDF,
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.page-break-before',
      after: '.page-break-after',
      avoid: ['.no-page-break', 'tr', '.avoid-break'],
    },
  }

  const clone = element.cloneNode(true) as HTMLElement
  prepareElementForPDF(clone)
  clone.style.width = '794px'
  clone.style.maxWidth = '794px'
  clone.style.margin = '0 auto'
  clone.style.boxSizing = 'border-box'

  return await html2pdf().set(pdfOptions).from(clone).outputPdf('blob')
}

/**
 * Gera PDF a partir de HTML string usando iframe oculto (cliente)
 * Usado pelos builders de documentos IFCE
 */
export async function generateHTMLPDF(html: string, filename: string): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('generateHTMLPDF só pode ser executado no navegador')
  }

  const html2pdf = (await import('html2pdf.js')).default

  const iframe = document.createElement('iframe')
  iframe.style.cssText =
    'position:fixed;top:0;left:-9999px;width:794px;height:1123px;border:none;background:#fff !important;'
  document.body.appendChild(iframe)

  const doc = iframe.contentDocument || iframe.contentWindow?.document
  if (!doc) {
    document.body.removeChild(iframe)
    throw new Error('iframe falhou')
  }

  // Injeta CSS que força modo claro/impressão
  const printOverrideCSS = `
    <style>
      html, body { 
        background: #fff !important; 
        color: #000 !important; 
        margin: 0 !important; 
        padding: 0 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      * { 
        box-sizing: border-box !important;
        text-shadow: none !important;
      }
      body * {
        color: #000 !important;
      }
      /* Reverter apenas backgrounds de dark-mode — NÃO usar transparent global */
      [class*="bg-slate-"], [class*="bg-neutral-"], [class*="bg-zinc-"],
      [class*="bg-gray-"], [class*="bg-black"], [class*="from-slate-"],
      [class*="to-slate-"], [class*="backdrop-"] {
        background: #fff !important;
        background-color: #fff !important;
        background-image: none !important;
      }
      table, td, th {
        border-color: #000 !important;
      }
      .page, .hdr, .hdr-txt, .doc-title, .sig-date-box, .sec-body, .para {
        background: #fff !important;
        color: #000 !important;
      }
      .sec-bar, th, [class*="d9d9d9"] {
        background: #d9d9d9 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    </style>
  `

  // Se o HTML já for um documento completo, injetamos o CSS no head
  let finalHtml = ''
  if (html.includes('<head>')) {
    finalHtml = html.replace('<head>', `<head>${printOverrideCSS}`)
  } else {
    finalHtml = printOverrideCSS + html
  }

  // Usar srcdoc em vez de doc.write (que está depreciado)
  await new Promise<void>((resolve) => {
    iframe.onload = () => {
      // Pequeno delay adicional para garantir que fontes e assets internos renderizem
      setTimeout(resolve, 500)
    }
    iframe.srcdoc = finalHtml
  })

  // Força fundo branco no body do iframe
  if (iframe.contentDocument?.body) {
    iframe.contentDocument.body.style.background = '#fff'
    iframe.contentDocument.body.style.color = '#000'
  }

  const opt = {
    margin: [6, 6, 6, 6] as [number, number, number, number],
    filename,
    image: { type: 'jpeg' as const, quality: 0.97 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
      windowHeight: 1123,
    },
    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
  }

  try {
    await html2pdf().set(opt).from(doc.body).save()
  } finally {
    document.body.removeChild(iframe)
  }
}

/**
 * Faz download de um Blob de PDF
 */
export function downloadPDFBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERVER-SIDE: Puppeteer via API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Gera PDF via API (Puppeteer server-side)
 * Melhor qualidade, suporte a múltiplas páginas
 */
export async function generatePDFServer(
  html: string,
  filename: string,
  options: { landscape?: boolean } = {}
): Promise<Blob> {
  const response = await fetch('/api/pdf/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      html,
      filename,
      options: { landscape: options.landscape },
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(`Falha ao gerar PDF: ${errorData.error || response.statusText}`)
  }

  return await response.blob()
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Gera PDF com fallback automático
 * Tenta server-side primeiro (melhor qualidade), fallback para client-side
 */
export async function generatePDF(
  html: string,
  filename: string,
  options: PDFOptions & { preferServer?: boolean } = {}
): Promise<void> {
  const { preferServer = true, ...pdfOptions } = options

  if (preferServer && typeof window !== 'undefined') {
    try {
      const blob = await generatePDFServer(html, filename, {
        landscape: pdfOptions.landscape,
      })
      downloadPDFBlob(blob, filename)
      return
    } catch (error) {
      console.warn('⚠️ Server-side PDF failed, falling back to client-side:', error)
    }
  }

  // Client-side fallback: cria iframe com HTML
  if (typeof window !== 'undefined') {
    await generateHTMLPDF(html, filename)
    return
  }

  throw new Error('PDF generation requires browser environment')
}

/**
 * Valida se há dados preenchidos
 */
export function validateFormData(formData: Record<string, any>): boolean {
  const hasData = Object.values(formData).some(
    (value) => value !== null && value !== undefined && value !== '' && value !== 0
  )

  if (!hasData) {
    throw new Error('Preencha pelo menos um campo antes de gerar o PDF')
  }

  return true
}

/**
 * Converte imagens em base64 para uso no PDF
 */
export async function convertImagesToBase64(html: string, baseUrl: string): Promise<string> {
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
  let result = html
  const matches = Array.from(html.matchAll(imgRegex))

  for (const match of matches) {
    const fullTag = match[0]
    const src = match[1]

    if (src && src.startsWith('/')) {
      try {
        const fullUrl = `${baseUrl}${src}`
        const response = await fetch(fullUrl)
        const blob = await response.blob()
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(blob)
        })

        result = result.replace(fullTag, fullTag.replace(src, base64))
      } catch (error) {
        console.warn(`Não foi possível carregar imagem: ${src}`, error)
      }
    }
  }

  return result
}
