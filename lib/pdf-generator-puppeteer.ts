/**
 * Gerador de PDF usando Puppeteer (Node.js)
 * Alternativa ao html2pdf.js para geração server-side
 * 
 * ⚠️ IMPORTANTE: Este arquivo é apenas para REFERÊNCIA e COMPARAÇÃO
 * 
 * Para usar Puppeteer, você precisa instalar:
 * ```bash
 * npm install puppeteer
 * npm install -D @types/puppeteer
 * ```
 * 
 * NOTA: Puppeteer baixa ~300MB do Chromium na instalação
 * 
 * Este código roda apenas no servidor (API Routes do Next.js)
 */

// Tipo condicional para evitar erro quando puppeteer não está instalado
type PDFOptions = {
  format?: string
  margin?: {
    top?: string
    right?: string
    bottom?: string
    left?: string
  }
  printBackground?: boolean
  preferCSSPageSize?: boolean
  displayHeaderFooter?: boolean
}

/**
 * Configurações padrão para Puppeteer
 * Seguindo o padrão oficial do IFCE
 */
export const PUPPETEER_DEFAULT_OPTIONS: PDFOptions = {
  format: 'A4',
  margin: {
    top: '30mm',
    right: '20mm',
    bottom: '20mm',
    left: '30mm',
  },
  printBackground: true,
  preferCSSPageSize: false,
  displayHeaderFooter: false,
}

/**
 * Gera PDF a partir de HTML usando Puppeteer
 * 
 * @param html - String HTML completa do documento
 * @param options - Opções de configuração do PDF
 * @returns Buffer do PDF gerado
 * 
 * @example
 * ```typescript
 * const html = `
 *   <!DOCTYPE html>
 *   <html>
 *     <head>
 *       <meta charset="UTF-8">
 *       <style>${OFFICIAL_PDF_CSS}</style>
 *     </head>
 *     <body>
 *       <div class="official-header">...</div>
 *     </body>
 *   </html>
 * `
 * const pdfBuffer = await generatePDFWithPuppeteer(html)
 * ```
 */
export async function generatePDFWithPuppeteer(
  html: string,
  options: Partial<PDFOptions> = {}
): Promise<Buffer> {
  // Importar puppeteer dinamicamente (apenas no servidor)
  // @ts-ignore - Puppeteer não está instalado, este arquivo é apenas para referência
  const puppeteer = await import('puppeteer')

  // Lançar navegador headless
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    // Criar nova página
    const page = await browser.newPage()

    // Definir conteúdo HTML
    await page.setContent(html, {
      waitUntil: 'networkidle0', // Aguardar carregamento completo
    })

    // Gerar PDF
    const pdfBuffer = await page.pdf({
      ...PUPPETEER_DEFAULT_OPTIONS,
      ...options,
    })

    return Buffer.from(pdfBuffer)
  } finally {
    // Sempre fechar o navegador
    await browser.close()
  }
}

/**
 * Gera PDF a partir de uma URL usando Puppeteer
 * Útil para gerar PDFs de páginas já renderizadas
 * 
 * @param url - URL da página a ser convertida em PDF
 * @param options - Opções de configuração do PDF
 * @returns Buffer do PDF gerado
 */
export async function generatePDFFromURL(
  url: string,
  options: Partial<PDFOptions> = {}
): Promise<Buffer> {
  // @ts-ignore - Puppeteer não está instalado, este arquivo é apenas para referência
  const puppeteer = await import('puppeteer')

  const browser = await puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()

    // Navegar para a URL
    await page.goto(url, {
      waitUntil: 'networkidle0',
    })

    // Gerar PDF
    const pdfBuffer = await page.pdf({
      ...PUPPETEER_DEFAULT_OPTIONS,
      ...options,
    })

    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}

/**
 * Renderiza um template React em HTML string
 * Para uso com Puppeteer
 * 
 * @param Component - Componente React a ser renderizado
 * @param props - Props do componente
 * @returns HTML string completo
 */
export async function renderReactToHTML<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  props: T
): Promise<string> {
  const ReactDOMServer = await import('react-dom/server')
  const React = await import('react')

  // Renderizar componente para HTML
  const componentHTML = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Component, props as any)
  )

  // Envolver em documento HTML completo
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Documento IFCE</title>
        <style>
          @page {
            size: A4;
            margin: 30mm 20mm 20mm 30mm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: Arial, 'Times New Roman', sans-serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #000000;
            background: #FFFFFF;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
          }
          
          table, th, td {
            border: 1px solid #000000;
          }
          
          th, td {
            padding: 8px;
            text-align: left;
            vertical-align: top;
          }
          
          .no-page-break {
            page-break-inside: avoid;
          }
        </style>
      </head>
      <body>
        ${componentHTML}
      </body>
    </html>
  `
}

/**
 * Exemplo de uso em API Route
 * 
 * @example
 * ```typescript
 * // app/api/documents/generate-pdf/route.ts
 * import { NextRequest, NextResponse } from 'next/server'
 * import { generatePDFWithPuppeteer, renderReactToHTML } from '@/lib/pdf-generator-puppeteer'
 * import { CommitmentTermDocument } from '@/components/templates/CommitmentTermDocument'
 * 
 * export async function POST(request: NextRequest) {
 *   const data = await request.json()
 *   
 *   // Renderizar componente React para HTML
 *   const html = await renderReactToHTML(CommitmentTermDocument, { data })
 *   
 *   // Gerar PDF
 *   const pdfBuffer = await generatePDFWithPuppeteer(html)
 *   
 *   // Retornar PDF
 *   return new NextResponse(pdfBuffer, {
 *     headers: {
 *       'Content-Type': 'application/pdf',
 *       'Content-Disposition': 'attachment; filename="documento.pdf"',
 *     },
 *   })
 * }
 * ```
 */
