/**
 * Server-side PDF generator using Puppeteer
 * Generates PDFs from JSON schemas with dynamic data
 */

import type {
  PDFDocumentSchema,
  PDFSection,
  PDFTableSection,
  PDFParagraphSection,
  PDFListSection,
  FormDataMap,
} from './pdf-schemas/schema'
import puppeteer from 'puppeteer'
import { LOGO_IFCE_BASE64, BRASAO_BASE64 } from './pdf-assets'

export class PDFTemplateBuilder {
  schema: PDFDocumentSchema
  data: FormDataMap

  constructor(schema: PDFDocumentSchema, data: FormDataMap) {
    this.schema = schema
    this.data = data
  }

  private replacePlaceholders(text: string): string {
    if (!text) return text
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      const value = this.data[key]
      if (value === undefined || value === null) return match
      return String(value)
    })
  }

  private buildStyles(): string {
    return `
      @page { size: A4; margin: 10mm 12mm 12mm 12mm; }
      html, body { margin: 0; padding: 0; background: #fff; }
      body {
        font-family: Arial, Helvetica, sans-serif;
        color: #000;
        line-height: 1.3;
        padding: 8px 10px 10px 10px;
      }
      * { box-sizing: border-box; }
      .page { width: 100%; }
      .ph {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 6px;
      }
      .ph-logo {
        width: 54px;
        height: 54px;
        object-fit: contain;
        flex-shrink: 0;
      }
      .ph-center {
        flex: 1;
        text-align: center;
        line-height: 1.2;
        padding: 0 4px;
      }
      .ph-line {
        text-transform: uppercase;
        color: #000;
      }
      .ph-line.strong {
        font-size: 9px;
        font-weight: bold;
      }
      .ph-line.normal {
        font-size: 8px;
      }
      .pdf-title {
        text-align: center;
        font-size: 11px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.2px;
        margin: 2px 0 8px 0;
      }
      .pdf-rule {
        border: none;
        border-top: 1px solid #000;
        margin: 4px 0 6px 0;
      }
      .pdf-section {
        margin-bottom: 4px;
      }
      .pdf-section-title {
        background: #d9d9d9;
        border: 1px solid #000;
        border-bottom: none;
        padding: 2px 4px;
        font-size: 6.5px;
        font-weight: bold;
        text-transform: uppercase;
        line-height: 1.1;
      }
      .pdf-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
      }
      .pdf-table th,
      .pdf-table td {
        border: 1px solid #000;
        padding: 2px 3px;
        vertical-align: top;
        font-size: 8px;
      }
      .pdf-table th {
        background: #d9d9d9;
        font-size: 6.5px;
        font-weight: bold;
        text-transform: uppercase;
        text-align: left;
      }
      .pdf-paragraph {
        border: 1px solid #000;
        padding: 4px;
        min-height: 42px;
        font-size: 8px;
        line-height: 1.35;
        text-align: justify;
        white-space: pre-wrap;
      }
      .pdf-list {
        border: 1px solid #000;
        padding: 4px 8px 4px 18px;
        margin: 0;
      }
      .pdf-list li {
        font-size: 8px;
        margin: 2px 0;
      }
      .pdf-signatures {
        display: grid;
        grid-template-columns: repeat(var(--sig-cols, 2), 1fr);
        border: 1px solid #000;
        min-height: 62px;
        margin-top: 6px;
      }
      .pdf-signature {
        display: flex;
        align-items: flex-end;
        justify-content: center;
        padding: 24px 6px 6px 6px;
        text-align: center;
      }
      .pdf-signature + .pdf-signature {
        border-left: 1px solid #000;
      }
      .pdf-signature-line {
        width: 100%;
        border-top: 1px solid #000;
        padding-top: 3px;
        font-size: 6.5px;
        font-weight: bold;
        text-transform: uppercase;
      }
    `
  }

  private buildHeader(): string {
    if (!this.schema.header) return ''

    const {
      showLogo = true,
      showBrasao = true,
      institution,
      subInstitution,
      department,
      campus,
    } = this.schema.header

    const logo = LOGO_IFCE_BASE64
    const brasao = BRASAO_BASE64

    return `
      <div class="pdf-header ph">
        ${showLogo ? `<img src="${logo}" alt="Logo IFCE" class="ph-logo" />` : '<div class="ph-logo"></div>'}
        <div class="ph-center">
          ${institution ? `<div class="ph-line strong" style="text-transform:uppercase;">${institution}</div>` : ''}
          ${subInstitution ? `<div class="ph-line normal" style="text-transform:uppercase;">${subInstitution}</div>` : ''}
          <div style="height:6px;"></div>
          ${campus ? `<div class="ph-line normal" style="font-weight:normal; text-transform:none;">${campus}</div>` : ''}
          ${department ? `<div class="ph-line normal" style="text-transform:none;">${department}</div>` : ''}
        </div>
        ${showBrasao ? `<img src="${brasao}" alt="Brasão" class="ph-logo" />` : '<div class="ph-logo"></div>'}
      </div>
    `
  }

  private buildTitle(): string {
    return `<div class="pdf-title">${this.replacePlaceholders(this.schema.title)}</div>`
  }

  private buildSection(section: PDFSection): string {
    switch (section.type) {
      case 'table':
        return this.buildTableSection(section as PDFTableSection)
      case 'paragraph':
        return this.buildParagraphSection(section as PDFParagraphSection)
      case 'list':
        return this.buildListSection(section as PDFListSection)
      default:
        return ''
    }
  }

  private buildTableSection(section: PDFTableSection): string {
    const processedHeaders = section.headers.map((h) => this.replacePlaceholders(h))
    const processedRows = section.rows.map((row) =>
      row.map((cell) => this.replacePlaceholders(cell))
    )

    return `
      <div class="pdf-section">
        <div class="pdf-section-title">${this.replacePlaceholders(section.title)}</div>
        <table class="pdf-table">
          <thead>
            <tr>
              ${processedHeaders.map((h) => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${processedRows
              .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`)
              .join('')}
          </tbody>
        </table>
      </div>
    `
  }

  private buildParagraphSection(section: PDFParagraphSection): string {
    return `
      <div class="pdf-section">
        <div class="pdf-section-title">${this.replacePlaceholders(section.title)}</div>
        <div class="pdf-paragraph">${this.replacePlaceholders(section.content)}</div>
      </div>
    `
  }

  private buildListSection(section: PDFListSection): string {
    const items = section.items.map((item) => `<li>${this.replacePlaceholders(item)}</li>`).join('')

    return `
      <div class="pdf-section">
        <div class="pdf-section-title">${this.replacePlaceholders(section.title)}</div>
        <ul class="pdf-list">${items}</ul>
      </div>
    `
  }

  private buildSignatureLines(): string {
    if (!this.schema.signatureLines || this.schema.signatureLines.length === 0) return ''

    return `
      <div class="pdf-signatures" style="--sig-cols:${this.schema.signatureLines.length}">
        ${this.schema.signatureLines
          .map(
            (line) => `
              <div class="pdf-signature">
                <div class="pdf-signature-line">${this.replacePlaceholders(line.label)}</div>
              </div>`
          )
          .join('')}
      </div>
    `
  }

  buildHTML(): string {
    const header = this.buildHeader()
    const title = this.buildTitle()
    const sections = this.schema.sections.map((section) => this.buildSection(section)).join('')
    const signatures = this.buildSignatureLines()

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <style>${this.buildStyles()}</style>
        </head>
        <body>
          <div class="page">
            ${header}
            ${title}
            ${sections}
            ${signatures}
          </div>
        </body>
      </html>
    `
  }
}

/**
 * Generate PDF from JSON schema and data
 */
export async function generatePDFFromSchema(
  schema: PDFDocumentSchema,
  data: FormDataMap,
  options: { filename?: string; landscape?: boolean } = {}
): Promise<Buffer> {
  const { filename = 'document.pdf', landscape = false } = options

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()

    await page.setViewport({
      width: landscape ? 1122 : 794,
      height: landscape ? 794 : 1123,
      deviceScaleFactor: 2,
    })

    const templateBuilder = new PDFTemplateBuilder(schema, data)
    const htmlContent = templateBuilder.buildHTML()

    await page.setContent(htmlContent, { waitUntil: 'load' })
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape,
      printBackground: true,
      margin: {
        top: '10mm',
        right: '12mm',
        bottom: '12mm',
        left: '12mm',
      },
    })

    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}

export async function generatePDFBlob(
  schema: PDFDocumentSchema,
  data: FormDataMap,
  options: { filename?: string; landscape?: boolean } = {}
): Promise<Blob> {
  const buffer = await generatePDFFromSchema(schema, data, options)
  return new Blob([new Uint8Array(buffer)], { type: 'application/pdf' })
}

/**
 * Generate PDF directly from HTML string
 */
export async function generatePDFFromHTML(
  html: string,
  options: { filename?: string; landscape?: boolean } = {}
): Promise<Buffer> {
  const { landscape = false } = options

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()

    await page.setViewport({
      width: landscape ? 1122 : 794,
      height: landscape ? 794 : 1123,
      deviceScaleFactor: 2,
    })

    await page.setContent(html, { waitUntil: 'networkidle0' })
    // Extra delay to ensure fonts/images are fully rendered
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape,
      printBackground: true,
      margin: {
        top: '10mm',
        right: '12mm',
        bottom: '12mm',
        left: '12mm',
      },
    })

    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}
