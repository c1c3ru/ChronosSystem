import * as pdfMake from 'pdfmake/build/pdfmake'
import * as pdfFonts from 'pdfmake/build/vfs_fonts'
import { TDocumentDefinitions } from 'pdfmake/interfaces'

interface PdfMakeModule {
  default?: typeof pdfMake
  vfs: Record<string, string>
}

interface PdfFontsModule {
  pdfMake?: { vfs: Record<string, string> }
  vfs?: Record<string, string>
}

// Inicializa o VFS do pdfmake com as fontes padrão (Roboto) apenas no Client-Side
if (typeof window !== 'undefined') {
  const pm = ((pdfMake as unknown as PdfMakeModule).default || pdfMake) as typeof pdfMake & { vfs: Record<string, string> }
  const fonts = (pdfFonts as unknown as PdfFontsModule).pdfMake?.vfs ?? (pdfFonts as unknown as PdfFontsModule).vfs ?? {}
  pm.vfs = fonts
}

export interface PDFMakeOptions {
  filename?: string
  openInNewTab?: boolean
}

/**
 * Gera e baixa (ou abre) um PDF no cliente usando PDFMake
 */
export async function generatePDFMakeClient(
  docDefinition: TDocumentDefinitions,
  options: PDFMakeOptions = {}
): Promise<void> {
  try {
    const filename = options.filename || `documento_${new Date().toISOString().split('T')[0]}.pdf`
    
    // Adiciona margens e metadados padrão se não existirem
    const finalDocDef: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60], // [left, top, right, bottom]
      ...docDefinition,
      defaultStyle: {
        fontSize: 11,
        font: 'Roboto',
        color: '#000000',
        ...docDefinition.defaultStyle,
      }
    }

    if (options.openInNewTab) {
      pdfMake.createPdf(finalDocDef).open()
    } else {
      pdfMake.createPdf(finalDocDef).download(filename)
    }
  } catch (error) {
    console.error('Erro ao gerar PDF com PDFMake:', error)
    throw error
  }
}

/**
 * Gera o PDF como Blob (útil para enviar para a API ou preview)
 */
export function generatePDFMakeBlob(
  docDefinition: TDocumentDefinitions
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const finalDocDef: TDocumentDefinitions = {
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
        ...docDefinition,
        defaultStyle: {
          fontSize: 11,
          font: 'Roboto',
          color: '#000000',
          ...docDefinition.defaultStyle,
        }
      }

      const pdfDocGenerator = pdfMake.createPdf(finalDocDef)
      pdfDocGenerator.getBlob().then((blob: Blob) => {
        resolve(blob)
      }).catch(reject)
    } catch (error) {
      console.error('Erro ao gerar Blob com PDFMake:', error)
      reject(error)
    }
  })
}
