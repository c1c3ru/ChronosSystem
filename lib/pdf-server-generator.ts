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

// HTML template builder based on JSON schema
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
      return this.data[key] !== undefined ? this.data[key] : match
    })
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

    return `
      <div class="pdf-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #000;">
        ${showLogo ? `<img src="${process.env.NEXT_PUBLIC_LOGO_IFCE_BASE64 || ''}" alt="Logo IFCE" style="width: 60px; height: 60px;" />` : ''}
        <div style="flex: 1; text-align: center;">
          <div style="font-weight: bold; font-size: 14px; color: #c00;">${institution || ''}</div>
          ${subInstitution ? `<div style="font-size: 12px;">${subInstitution}</div>` : ''}
          ${department ? `<div style="font-size: 12px;">${department}</div>` : ''}
          ${campus ? `<div style="font-weight: bold; font-size: 12px;">${campus}</div>` : ''}
        </div>
        ${showBrasao ? `<img src="${process.env.NEXT_PUBLIC_BRASAO_BASE64 || ''}" alt="Brasão" style="width: 60px; height: 60px;" />` : ''}
      </div>
      <hr style="border: 1px solid #000; margin: 10px 0;">
    `
  }

  private buildTitle(): string {
    return `
      <div style="text-align: center; font-size: 16px; font-weight: bold; text-transform: uppercase; 
                  border: 1px solid #000; padding: 8px; background: #f0f0f0; margin: 15px 0; letter-spacing: 0.5px;">
        ${this.replacePlaceholders(this.schema.title)}
      </div>
    `
  }

  private buildSection(section: PDFSection): string {
    switch (section.type) {
      case 'table':
        return this.buildTableSection(section as any)
      case 'paragraph':
        return this.buildParagraphSection(section as any)
      case 'list':
        return this.buildListSection(section as any)
      default:
        return ''
    }
  }

  private buildTableSection(section: PDFTableSection): string {
    const { headers, rows } = section

    // Replace placeholders in headers and rows
    const processedHeaders = headers.map((h) => this.replacePlaceholders(h))
    const processedRows = rows.map((row) => row.map((cell) => this.replacePlaceholders(cell)))

    return `
      <div style="margin: 15px 0;">
        <div style="font-weight: bold; font-size: 12px; text-transform: uppercase; margin-bottom: 5px;">
          ${this.replacePlaceholders(section.title)}
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              ${processedHeaders
                .map(
                  (h) =>
                    `<th style="border: 1px solid #000; padding: 6px; text-align: left; background: #e0e0e0;">${h}</th>`
                )
                .join('')}
            </tr>
          </thead>
          <tbody>
            ${processedRows
              .map(
                (row) =>
                  `<tr>${row
                    .map(
                      (cell) =>
                        `<td style="border: 1px solid #000; padding: 6px; text-align: left;">${cell}</td>`
                    )
                    .join('')}</tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `
  }

  private buildParagraphSection(section: PDFParagraphSection): string {
    return `
      <div style="margin: 15px 0;">
        <div style="font-weight: bold; font-size: 12px; text-transform: uppercase; margin-bottom: 5px;">
          ${this.replacePlaceholders(section.title)}
        </div>
        <div style="text-align: justify; line-height: 1.6;">
          ${this.replacePlaceholders(section.content)}
        </div>
      </div>
    `
  }

  private buildListSection(section: PDFListSection): string {
    const items = section.items
      .map((item) => `<li style="margin: 5px 0;">${this.replacePlaceholders(item)}</li>`)
      .join('')

    return `
      <div style="margin: 15px 0;">
        <div style="font-weight: bold; font-size: 12px; text-transform: uppercase; margin-bottom: 5px;">
          ${this.replacePlaceholders(section.title)}
        </div>
        <ul style="padding-left: 20px;">
          ${items}
        </ul>
      </div>
    `
  }

  private buildSignatureLines(): string {
    if (!this.schema.signatureLines || this.schema.signatureLines.length === 0) return ''

    return `
      <div style="display: flex; justify-content: space-around; margin-top: 30px;">
        ${this.schema.signatureLines
          .map(
            (line) =>
              `<div style="text-align: center; width: 30%;">
            <div style="border-top: 1px solid #000; padding-top: 5px; font-weight: bold; margin-top: 25px;">
              ${this.replacePlaceholders(line.label)}
            </div>
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
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #000;
              line-height: 1.4;
            }
            @page {
              size: A4;
              margin: 20mm;
            }
          </style>
        </head>
        <body>
          ${header}
          ${title}
          ${sections}
          ${signatures}
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

    // Set page options
    await page.setViewport({
      width: landscape ? 1122 : 794, // A4 landscape/portrait in pixels @ 96 DPI
      height: landscape ? 794 : 1123,
      deviceScaleFactor: 2,
    })

    // Generate HTML from schema and data
    const templateBuilder = new PDFTemplateBuilder(schema, data)
    const htmlContent = templateBuilder.buildHTML()

    // Set content and wait for fonts/images to load
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })

    // Additional wait for any dynamic content
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape,
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
    })

    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}

/**
 * Convenience function to generate PDF and return as Blob (for browser usage)
 */
export async function generatePDFBlob(
  schema: PDFDocumentSchema,
  data: FormDataMap,
  options: { filename?: string; landscape?: boolean } = {}
): Promise<Blob> {
  const buffer = await generatePDFFromSchema(schema, data, options)
  return new Blob([new Uint8Array(buffer)], { type: 'application/pdf' })
}
