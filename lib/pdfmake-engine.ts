import * as pdfMake from 'pdfmake/build/pdfmake'
import * as pdfFonts from 'pdfmake/build/vfs_fonts'
import { TDocumentDefinitions } from 'pdfmake/interfaces'

interface PdfFontsModule {
  pdfMake?: { vfs: Record<string, string> }
  vfs?: Record<string, string>
  default?: Record<string, string>
}

interface PdfMakeInstance {
  vfs: Record<string, string>
  addVirtualFileSystem?: (vfs: Record<string, string>) => void
  fonts?: Record<
    string,
    {
      normal: string
      bold: string
      italics: string
      bolditalics: string
    }
  >
  createPdf: (
    docDefinition: TDocumentDefinitions,
    tableLayouts?: unknown,
    fonts?: unknown,
    vfs?: unknown
  ) => {
    open: () => void
    download: (filename?: string) => void
    getBlob: (cb?: (blob: Blob) => void) => Promise<Blob>
  }
}

// Inicializa o VFS do pdfmake com as fontes padrão (Roboto) apenas no Client-Side
if (typeof window !== 'undefined') {
  const pm =
    (pdfMake as unknown as { default?: PdfMakeInstance }).default ||
    (pdfMake as unknown as PdfMakeInstance)
  const vfs =
    (pdfFonts as unknown as PdfFontsModule).pdfMake?.vfs ||
    (pdfFonts as unknown as PdfFontsModule).vfs ||
    (pdfFonts as unknown as PdfFontsModule).default ||
    (pdfFonts as unknown as Record<string, string>) ||
    {}

  if (pm.addVirtualFileSystem) {
    pm.addVirtualFileSystem(vfs)
  } else {
    pm.vfs = vfs
  }

  // Garantir que todas as variantes do Roboto existam no VFS (fallback para Regular)
  const variants = [
    'Roboto-Regular.ttf',
    'Roboto-Medium.ttf',
    'Roboto-Italic.ttf',
    'Roboto-MediumItalic.ttf',
  ]
  const fallback = vfs['Roboto-Regular.ttf'] || Object.values(vfs)[0]
  if (fallback) {
    variants.forEach((v) => {
      if (!vfs[v]) vfs[v] = fallback
    })
  }

  // Configuração explícita de fontes para evitar erros de "font not found"
  pm.fonts = {
    Roboto: {
      normal: 'Roboto-Regular.ttf',
      bold: 'Roboto-Medium.ttf',
      italics: 'Roboto-Italic.ttf',
      bolditalics: 'Roboto-MediumItalic.ttf',
    },
  }
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
      },
    }

    const pmInstance =
      (pdfMake as unknown as { default?: PdfMakeInstance }).default ||
      (pdfMake as unknown as PdfMakeInstance)
    if (options.openInNewTab) {
      pmInstance.createPdf(finalDocDef, undefined, pmInstance.fonts, pmInstance.vfs).open()
    } else {
      pmInstance
        .createPdf(finalDocDef, undefined, pmInstance.fonts, pmInstance.vfs)
        .download(filename)
    }
  } catch (error) {
    console.error('Erro ao gerar PDF com PDFMake:', error)
    throw error
  }
}

/**
 * Gera o PDF como Blob (útil para enviar para a API ou preview)
 */
export function generatePDFMakeBlob(docDefinition: TDocumentDefinitions): Promise<Blob> {
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
        },
      }

      const pmInstance =
        (pdfMake as unknown as { default?: PdfMakeInstance }).default ||
        (pdfMake as unknown as PdfMakeInstance)
      const pdfDocGenerator = pmInstance.createPdf(
        finalDocDef,
        undefined,
        pmInstance.fonts,
        pmInstance.vfs
      )
      pdfDocGenerator
        .getBlob()
        .then((blob: Blob) => {
          resolve(blob)
        })
        .catch(reject)
    } catch (error) {
      console.error('Erro ao gerar Blob com PDFMake:', error)
      reject(error)
    }
  })
}
