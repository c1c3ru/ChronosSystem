// Schema definitions for PDF document generation

export interface PDFDocumentSchema {
  title: string
  header?: {
    showLogo: boolean
    showBrasao: boolean
    institution: string
    subInstitution?: string
    department?: string
    campus?: string
  }
  sections: PDFSection[]
  signatureLines?: PDFSigatureLine[]
}

export type PDFSection = PDFTableSection | PDFParagraphSection | PDFListSection

export interface PDFSectionBase {
  title: string
}

export interface PDFTableSection extends PDFSectionBase {
  type: 'table'
  headers: string[]
  rows: (string | number | boolean | null | undefined)[][]
}

export interface PDFParagraphSection extends PDFSectionBase {
  type: 'paragraph'
  content: string
}

export interface PDFListSection extends PDFSectionBase {
  type: 'list'
  items: string[]
}

export interface PDFSigatureLine {
  label: string
}

// Helper type for form data mapping
export type FormDataMap = Record<string, unknown>
