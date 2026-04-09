/**
 * Unified PDF Generator for Client and Server
 * Provides a consistent interface for generating PDFs
 * Uses html2pdf.js for client-side and calls API for server-side rendering
 */

import {
  PDFDocumentSchema,
  FormDataMap,
  PDFTableSection,
  PDFParagraphSection,
  PDFListSection,
} from './pdf-schemas/schema'

// Detect if we're running in browser or server
const isBrowser = typeof window !== 'undefined'

interface PDFOptions {
  filename?: string
  landscape?: boolean
  margin?: number | [number, number] | [number, number, number, number]
  html2canvas?: any
  jsPDF?: any
}

/**
 * Generate PDF using client-side html2pdf.js (fallback for simple documents)
 */
async function generatePDFClientSide(
  schema: PDFDocumentSchema,
  data: FormDataMap,
  options: PDFOptions = {}
): Promise<void> {
  // Import html2pdf only in browser
  const { default: html2pdf } = await import('html2pdf.js')

  // Convert schema to HTML (simplified version for client-side)
  const htmlContent = schemaToHtml(schema, data)

  const opt = {
    margin: options.margin !== undefined ? options.margin : ([10, 10, 10, 10] as [number, number, number, number]),
    filename: options.filename || 'document.pdf',
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      ...options.html2canvas,
    },
    jsPDF: {
      unit: 'mm' as const,
      format: 'a4' as const,
      orientation: options.landscape ? 'landscape' : ('portrait' as const),
      compress: true,
      ...options.jsPDF,
    },
  }

  // Create temporary div for HTML content
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = htmlContent
  document.body.appendChild(tempDiv)

  try {
    await html2pdf().set(opt).from(tempDiv).save()
  } finally {
    document.body.removeChild(tempDiv)
  }
}

/**
 * Generate PDF using server-side API (preferred method)
 */
async function generatePDFServerSide(
  schema: PDFDocumentSchema,
  data: FormDataMap,
  options: PDFOptions = {}
): Promise<Blob> {
  // Convert schema to a format the API understands
  const apiData = {
    documentType: getDocumentTypeFromSchema(schema),
    data,
    options: {
      filename: options.filename,
      landscape: options.landscape,
    },
  }

  const response = await fetch('/api/pdf/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`PDF generation failed: ${errorData.error || response.statusText}`)
  }

  return await response.blob()
}

/**
 * Main unified PDF generator function
 */
export async function generatePDF(
  schema: PDFDocumentSchema,
  data: FormDataMap,
  options: PDFOptions & { preferServerSide?: boolean } = {}
): Promise<Blob | void> {
  const { preferServerSide = true } = options

  // Use server-side by default for better quality and consistency
  if (preferServerSide) {
    try {
      return await generatePDFServerSide(schema, data, options)
    } catch (error) {
      console.warn('⚠️ Server-side PDF generation failed, falling back to client-side:', error)
      // Fallback to client-side if server fails
      if (isBrowser) {
        await generatePDFClientSide(schema, data, options)
        return
      }
      throw error
    }
  } else {
    // Force client-side (for simple documents or offline use)
    if (isBrowser) {
      await generatePDFClientSide(schema, data, options)
      return
    }
    throw new Error('Client-side PDF generation only available in browser')
  }
}

/**
 * Convert schema to HTML string (simplified for client-side)
 */
function schemaToHtml(schema: PDFDocumentSchema, data: FormDataMap): string {
  // Simple placeholder replacement
  const replacePlaceholders = (text: string): string => {
    if (!text) return ''
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match
    })
  }

  // Build basic HTML structure
  let html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #000; }
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
          .title { text-align: center; font-size: 18px; font-weight: bold; text-transform: uppercase; 
                   border: 1px solid #000; padding: 8px; background: #f0f0f0; margin: 15px 0; }
          .section-title { font-weight: bold; font-size: 14px; text-transform: uppercase; margin: 15px 0 5px 0; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { border: 1px solid #000; padding: 6px; text-align: left; }
          th { background-color: #e0e0e0; }
          .signature { display: flex; justify-content: space-around; margin-top: 30px; }
          .sig-item { text-align: center; width: 30%; }
          .sig-line { border-top: 1px solid #000; padding-top: 5px; font-weight: bold; margin-top: 25px; }
        </style>
      </head>
      <body>
  `

  // Add header (simplified)
  html += '<div class="header">'
  if (schema.header?.showLogo) {
    html += `<img src="${process.env.NEXT_PUBLIC_LOGO_IFCE_BASE64 || ''}" alt="Logo" style="width: 50px; height: 50px;">`
  }
  html += `<div><strong>${schema.header?.institution || ''}</strong></div>`
  if (schema.header?.showBrasao) {
    html += `<img src="${process.env.NEXT_PUBLIC_BRASAO_BASE64 || ''}" alt="Brasão" style="width: 50px; height: 50px;">`
  }
  html += '</div><hr>'

  // Add title
  html += `<div class="title">${replacePlaceholders(schema.title)}</div>`

  // Add sections
  for (const section of schema.sections) {
    html += `<div class="section-title">${replacePlaceholders(section.title)}</div>`

    switch (section.type) {
      case 'table':
        const table = section as PDFTableSection
        html += '<table>'
        if (table.headers) {
          html += '<thead><tr>'
          for (const header of table.headers) {
            html += `<th>${replacePlaceholders(header)}</th>`
          }
          html += '</tr></thead>'
        }
        html += '<tbody>'
        if (table.rows) {
          for (const row of table.rows) {
            html += '<tr>'
            for (const cell of row) {
              html += `<td>${replacePlaceholders(cell)}</td>`
            }
            html += '</tr>'
          }
        }
        html += '</tbody></table>'
        break

      case 'paragraph':
        const para = section as PDFParagraphSection
        html += `<p>${replacePlaceholders(para.content)}</p>`
        break

      case 'list':
        const list = section as PDFListSection
        html += '<ul>'
        if (list.items) {
          for (const item of list.items) {
            html += `<li>${replacePlaceholders(item)}</li>`
          }
        }
        html += '</ul>'
        break
    }
  }

  // Add signature lines (simplified)
  if (schema.signatureLines && schema.signatureLines.length > 0) {
    html += '<div class="signature">'
    for (const line of schema.signatureLines) {
      html += `<div class="sig-item"><div class="sig-line">${replacePlaceholders(line.label)}</div></div>`
    }
    html += '</div>'
  }

  html += '</body></html>'
  return html
}

/**
 * Helper to determine document type from schema title
 * In a real implementation, this would be more sophisticated
 */
function getDocumentTypeFromSchema(schema: PDFDocumentSchema): string {
  const title = schema.title.toLowerCase()
  if (title.includes('mensal')) return 'monthlyReport'
  if (title.includes('final')) return 'finalReport'
  if (title.includes('semestral')) return 'semesterReport'
  if (title.includes('compromisso')) return 'commitmentTerm'
  if (title.includes('aditivo')) return 'additiveTerm'
  if (title.includes('prorrogação') || title.includes('extension')) return 'extensionDeclaration'
  if (title.includes('declaração') && title.includes('estágio')) return 'professionalDeclaration'
  if (title.includes('matrícula')) return 'internshipRegistration'
  if (title.includes('requerimento')) return 'internshipRegistrationRequest'
  if (title.includes('realização')) return 'realizationTerm'
  if (title.includes('rescisão')) return 'rescissionTerm'
  if (title.includes('equivalência')) return 'equivalenceRequest'
  if (title.includes('avaliação')) return 'studentEvaluation'
  return 'document' // default
}
