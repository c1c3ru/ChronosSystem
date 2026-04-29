/**
 * pdfmake-base-service.ts
 *
 * Serviço central de geração de PDF para o Padrão IFCE.
 * Contém: configuração de fontes, estilos globais reutilizáveis,
 * helpers de layout (cabeçalho, tabela, seção, assinaturas)
 * e a função principal `generatePDF`.
 *
 * USO NOS FORMULÁRIOS:
 *   import { generatePDF, ifceHeader, cell, sectionTitle, sigBlock, STYLES } from '@/lib/pdfmake-base-service'
 *   const doc = { content: [...ifceHeader(), ...myContent()], styles: STYLES }
 *   generatePDF(doc, 'arquivo.pdf')
 */

import type {
  TDocumentDefinitions,
  StyleDictionary,
  Content,
  TableCell,
  ContentTable,
  ContentText,
  ContentColumns,
} from 'pdfmake/interfaces'

// ─── INICIALIZAÇÃO ────────────────────────────────────────────────────────────

let _pdfMake: PdfMakeInstance | null = null

interface PdfMakeDynamicModule {
  default?: unknown
  vfs: Record<string, string>
}

interface PdfFontsDynamicModule {
  pdfMake?: { vfs: Record<string, string> }
  vfs?: Record<string, string>
  default?: Record<string, string>
}

interface PdfMakeInstance {
  vfs: Record<string, string>
  addVirtualFileSystem?: (vfs: Record<string, string>) => void
  fonts?: Record<string, {
    normal: string
    bold: string
    italics: string
    bolditalics: string
  }>
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

async function getPdfMake(): Promise<PdfMakeInstance> {
  if (_pdfMake) return _pdfMake
  const [pdfMakeModule, pdfFontsModule] = await Promise.all([
    import('pdfmake/build/pdfmake'),
    import('pdfmake/build/vfs_fonts'),
  ])
  
  const pmModule = pdfMakeModule as unknown as PdfMakeDynamicModule
  const fontsModule = pdfFontsModule as unknown as PdfFontsDynamicModule
  
  const pm = (pmModule.default || pdfMakeModule) as unknown as PdfMakeInstance
  const vfs = fontsModule.pdfMake?.vfs || fontsModule.vfs || fontsModule.default || (fontsModule as unknown as Record<string, string>) || {}
  
  if (pm.addVirtualFileSystem) {
    pm.addVirtualFileSystem(vfs)
  } else {
    pm.vfs = vfs
  }
  
  // Garantir que todas as variantes do Roboto existam no VFS (fallback para Regular)
  const variants = ['Roboto-Regular.ttf', 'Roboto-Medium.ttf', 'Roboto-Italic.ttf', 'Roboto-MediumItalic.ttf']
  const fallback = vfs['Roboto-Regular.ttf'] || Object.values(vfs)[0]
  if (fallback) {
    variants.forEach(v => {
      if (!vfs[v]) vfs[v] = fallback
    })
  }

  // Configuração explícita de fontes para evitar erros de "font not found"
  pm.fonts = {
    Roboto: {
      normal: 'Roboto-Regular.ttf',
      bold: 'Roboto-Medium.ttf',
      italics: 'Roboto-Italic.ttf',
      bolditalics: 'Roboto-MediumItalic.ttf'
    }
  }
  
  _pdfMake = pm
  return pm
}

// ─── MARGENS E CONFIGURAÇÃO PADRÃO A4 ────────────────────────────────────────

/** Margens padrão A4 IFCE (em pontos: 1 mm ≈ 2.835 pt) */
export const PAGE_MARGINS: [number, number, number, number] = [
  34, // left  ≈ 12 mm
  28, // top   ≈ 10 mm
  34, // right ≈ 12 mm
  34, // bottom ≈ 12 mm
]

// ─── ESTILOS GLOBAIS (StyleDictionary) ───────────────────────────────────────

export const STYLES: StyleDictionary = {
  // Cabeçalho institucional
  headerInstitution: {
    fontSize: 9,
    bold: true,
    alignment: 'center',
    color: '#000000',
  },
  headerSubtitle: {
    fontSize: 8,
    alignment: 'center',
    color: '#000000',
  },
  headerCampus: {
    fontSize: 9,
    alignment: 'center',
    color: '#000000',
  },

  // Título do documento
  docTitle: {
    fontSize: 10,
    bold: true,
    alignment: 'center',
    color: '#000000',
    margin: [0, 2, 0, 4],
  },

  // Rótulo de célula (label pequeno acima do valor)
  cellLabel: {
    fontSize: 5.8,
    bold: true,
    color: '#000000',
    margin: [0, 0, 0, 1],
  },
  // Valor dentro de célula
  cellValue: {
    fontSize: 8,
    color: '#000000',
  },

  // Cabeçalho de seção (faixa cinza)
  sectionBar: {
    fontSize: 6.5,
    bold: true,
    fillColor: '#d9d9d9',
    color: '#000000',
  },
  // Corpo de seção (parágrafo com borda)
  sectionBody: {
    fontSize: 8,
    color: '#000000',
    lineHeight: 1.2,
  },

  // Cabeçalho de coluna de tabela
  tableHeader: {
    fontSize: 6.5,
    bold: true,
    fillColor: '#d9d9d9',
    color: '#000000',
  },

  // Linha de assinatura
  signatureLine: {
    fontSize: 6.5,
    bold: true,
    alignment: 'center',
    color: '#000000',
  },

  // Observação ao pé de página
  obs: {
    fontSize: 6.8,
    color: '#000000',
    italics: true,
    margin: [0, 4, 0, 0],
  },

  // Parágrafo justificado
  para: {
    fontSize: 8,
    alignment: 'justify',
    lineHeight: 1.4,
    color: '#000000',
  },
}

// ─── TIPOS AUXILIARES ─────────────────────────────────────────────────────────

export interface CellOptions {
  /** Número de colunas que a célula ocupa */
  colSpan?: number
  /** Largura relativa (ex: '*' ou número de pontos) */
  width?: string | number
}

// ─── HELPERS DE LAYOUT ────────────────────────────────────────────────────────

/**
 * Retorna as imagens do cabeçalho IFCE como base64.
 * Import lazy para não pesar no bundle inicial.
 */
async function getHeaderImages(): Promise<{ logo: string; brasao: string }> {
  const assets = await import('./pdf-assets')
  return { logo: assets.LOGO_IFCE_BASE64, brasao: assets.BRASAO_BASE64 }
}

/**
 * Cabeçalho institucional IFCE padrão.
 * Retorna um array de Content pronto para ser embutido em `content`.
 * É assíncrono pois carrega as imagens em base64.
 */
export async function ifceHeader(): Promise<Content[]> {
  const { logo, brasao } = await getHeaderImages()

  const header: ContentColumns = {
    columns: [
      logo ? {
        image: logo,
        width: 54,
        height: 54,
        margin: [0, 0, 8, 0],
      } : { text: '', width: 54 },
      {
        stack: [
          { text: 'PRÓ-REITORIA DE EXTENSÃO', style: 'headerInstitution' },
          { text: 'COORDENAÇÃO DE ESTÁGIOS E ACOMPANHAMENTO DE EGRESSOS', style: 'headerSubtitle' },
          { text: ' ', fontSize: 4 }, // spacer
          { text: 'IFCE Campus Maracanaú', style: 'headerCampus' },
          { text: 'Setor de Acompanhamento de Estágio', style: 'headerSubtitle' },
        ],
        alignment: 'center',
        width: '*',
      },
      brasao ? {
        image: brasao,
        width: 54,
        height: 54,
        margin: [8, 0, 0, 0],
      } : { text: '', width: 54 },
    ],
    columnGap: 0,
    margin: [0, 0, 0, 6],
  }

  return [header]
}

/**
 * Título do documento.
 */
export function docTitle(title: string): ContentText {
  return { text: title.toUpperCase(), style: 'docTitle' }
}

/**
 * Célula de tabela com label + valor (padrão IFCE).
 */
export function cell(label: string, value?: string, options?: CellOptions): TableCell {
  return {
    stack: [
      { text: label.toUpperCase(), style: 'cellLabel' },
      { text: value ?? '', style: 'cellValue' },
    ],
    colSpan: options?.colSpan,
    border: [true, true, true, true],
    margin: [2, 2, 2, 2],
  }
}

/**
 * Célula vazia de preenchimento (para preencher colSpan).
 * Para colSpan, o pdfMake recomenda um objeto vazio.
 */
export function emptyCell(): TableCell {
  return {}
}

/**
 * Apenas a barra de título da seção (cinza, negrito, uppercase).
 * Usado quando a seção é seguida por uma tabela de dados.
 */
export function sectionTitle(title: string): Content {
  return {
    table: {
      widths: ['*'],
      body: [
        [{
          text: title.toUpperCase(),
          style: 'sectionBar',
          margin: [4, 2, 4, 2],
          border: [true, true, true, true],
        }],
      ],
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
      fillColor: (rowIndex: number) => (rowIndex === 0 ? '#E0E0E0' : null),
    },
    margin: [0, 4, 0, 0],
  }
}

/**
 * Bloco de seção com título e corpo.
 * Se o conteúdo for omitido, gera apenas o título (estilo barra).
 */
export function sectionBlock(title: string, content?: string): Content[] {
  if (!content) {
    return [sectionTitle(title)]
  }

  return [
    {
      table: {
        widths: ['*'],
        body: [
          [{
            text: title.toUpperCase(),
            style: 'sectionBar',
            margin: [4, 2, 4, 2],
            border: [true, true, true, false],
          }],
          [{
            text: content,
            style: 'sectionBody',
            margin: [4, 4, 4, 8],
            border: [true, false, true, true],
          }],
        ],
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#000000',
        vLineColor: () => '#000000',
      },
      margin: [0, 3, 0, 3],
    },
  ]
}

/**
 * Tabela de dados IFCE com bordas em todas as células.
 * Passa as linhas já montadas com `cell()`.
 */
export function dataTable(
  widths: (string | number)[],
  rows: TableCell[][]
): ContentTable {
  return {
    table: {
      widths,
      body: rows,
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
      paddingLeft: () => 3,
      paddingRight: () => 3,
      paddingTop: () => 2,
      paddingBottom: () => 2,
    },
    margin: [0, 0, 0, 0],
  }
}

/**
 * Bloco de datas (SOLICITAÇÃO / AUTORIZAÇÃO) + linhas de assinatura.
 */
export function sigBlock(labels: string[], obs?: string, requestDate?: string, approvalDate?: string): Content[] {
  const dateRow: ContentTable = {
    table: {
      widths: ['*', '*'],
      body: [[
        { text: [{ text: 'SOLICITAÇÃO EM ', bold: true, fontSize: 7 }, { text: requestDate || '____/____/______', fontSize: 7 }], border: [true, true, false, true], margin: [4, 3, 4, 3] },
        { text: [{ text: 'AUTORIZAÇÃO EM ', bold: true, fontSize: 7 }, { text: approvalDate || '____/____/______', fontSize: 7 }], border: [false, true, true, true], margin: [4, 3, 4, 3] },
      ]],
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
    },
    margin: [0, 6, 0, 0],
  }

  const sigCells: TableCell[] = labels.map((label, i) => ({
    stack: [
      { text: '', margin: [0, 22, 0, 0] as [number, number, number, number] },
      {
        canvas: [{
          type: 'line' as const,
          x1: 2,
          y1: 0,
          x2: (515 / labels.length) - 6,
          y2: 0,
          lineWidth: 0.5,
        }],
      },
      {
        text: label.toUpperCase(),
        style: 'signatureLine',
        margin: [0, 3, 0, 0] as [number, number, number, number],
      },
    ],
    border: [
      i === 0,                   // left
      true,                       // top
      i === labels.length - 1,   // right
      true,                       // bottom
    ] as [boolean, boolean, boolean, boolean],
    margin: [4, 4, 4, 6] as [number, number, number, number],
  }))

  const sigsTable: ContentTable = {
    table: {
      widths: labels.map(() => '*'),
      body: [sigCells],
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
    },
    margin: [0, 0, 0, 0],
  }

  const result: Content[] = [dateRow, sigsTable]

  if (obs) {
    result.push({ text: `Observação: ${obs}`, style: 'obs' })
  }

  return result
}

// ─── FUNÇÃO PRINCIPAL ─────────────────────────────────────────────────────────

export interface PDFGenerateOptions {
  filename?: string
  openInNewTab?: boolean
  landscape?: boolean
}

/**
 * Gera e baixa (ou abre) o PDF no cliente.
 * Aplica configurações padrão A4 IFCE automaticamente.
 */
export async function generatePDF(
  docDefinition: Omit<TDocumentDefinitions, 'pageSize' | 'pageMargins' | 'defaultStyle'> & {
    pageSize?: TDocumentDefinitions['pageSize']
    pageMargins?: TDocumentDefinitions['pageMargins']
    defaultStyle?: TDocumentDefinitions['defaultStyle']
  },
  options: PDFGenerateOptions = {}
): Promise<void> {
  const pdfMake = (await getPdfMake()) as unknown as PdfMakeInstance
  const { filename = 'documento.pdf', openInNewTab = false, landscape = false } = options

  const finalDoc: TDocumentDefinitions = {
    pageSize: 'A4',
    pageOrientation: landscape ? 'landscape' : 'portrait',
    pageMargins: PAGE_MARGINS,
    ...docDefinition,
    styles: { ...STYLES, ...(docDefinition.styles ?? {}) },
    defaultStyle: {
      font: 'Roboto',
      fontSize: 8,
      color: '#000000',
      lineHeight: 1.2,
      ...(docDefinition.defaultStyle ?? {}),
    },
  }

  if (openInNewTab) {
    pdfMake.createPdf(finalDoc, undefined, pdfMake.fonts, pdfMake.vfs).open()
  } else {
    pdfMake.createPdf(finalDoc, undefined, pdfMake.fonts, pdfMake.vfs).download(filename)
  }
}

/**
 * Gera o PDF como Blob (para preview ou envio à API).
 */
export async function generatePDFBlob(
  docDefinition: Omit<TDocumentDefinitions, 'pageSize' | 'pageMargins' | 'defaultStyle'> & Partial<Pick<TDocumentDefinitions, 'pageSize' | 'pageMargins' | 'defaultStyle'>>
): Promise<Blob> {
  const pdfMake = (await getPdfMake()) as unknown as PdfMakeInstance

  const finalDoc: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: PAGE_MARGINS,
    ...docDefinition,
    styles: { ...STYLES, ...(docDefinition.styles ?? {}) },
    defaultStyle: {
      font: 'Roboto',
      fontSize: 8,
      color: '#000000',
      lineHeight: 1.2,
      ...(docDefinition.defaultStyle ?? {}),
    },
  }

  return new Promise((resolve, reject) => {
    try {
      pdfMake
        .createPdf(finalDoc, undefined, pdfMake.fonts, pdfMake.vfs)
        .getBlob()
        .then(resolve)
        .catch(reject)
    } catch (err) {
      reject(err)
    }
  })
}

// ─── UTILITÁRIOS ──────────────────────────────────────────────────────────────

/**
 * Formata data de yyyy-mm-dd para dd/mm/yyyy.
 */
export function fmtDate(d?: string): string {
  if (!d) return '___/___/_____'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

/**
 * Retorna '' se o valor for nulo/indefinido.
 */
export function v(value?: string | null): string {
  return value ?? ''
}
