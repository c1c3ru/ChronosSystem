import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces'
import { ifceHeader, docTitle, dataTable, cell, emptyCell, sigBlock, fmtDate, v } from '@/lib/pdfmake-base-service'

export interface ExtensionDeclarationData {
  company_name?: string
  student_name?: string
  student_course?: string
  student_enrollment?: string
  current_start_date?: string
  current_end_date?: string
  new_end_date?: string
  city?: string
  solicitation_date?: string
  authorization_date?: string
}

export async function buildExtensionDeclarationDoc(d: ExtensionDeclarationData): Promise<TDocumentDefinitions> {
  const header = await ifceHeader()

  const infoTable = dataTable(
    ['50%', '25%', '25%'],
    [
      [
        cell('Empresa Concedente', v(d.company_name)),
        cell('Nome do Estagiário', v(d.student_name), { colSpan: 2 }), emptyCell(),
      ],
      [
        cell('Curso', v(d.student_course)),
        cell('Matrícula', v(d.student_enrollment)),
        cell('Cidade', v(d.city) || 'Fortaleza'),
      ],
    ]
  )

  const datesTable = dataTable(
    ['*', '*', '*'],
    [[
      cell('Período Atual — Início', fmtDate(d.current_start_date)),
      cell('Período Atual — Fim', fmtDate(d.current_end_date)),
      cell('Nova Data Final (Prorrogação)', fmtDate(d.new_end_date)),
    ]]
  )

  const bodyText: Content = {
    text: [
      'Declaramos, para os devidos fins, que o(a) estagiário(a) ',
      { text: v(d.student_name) || '________________________________', bold: true },
      ', matriculado(a) no curso de ',
      { text: v(d.student_course) || '________________________________', bold: true },
      ', teve seu estágio prorrogado na empresa ',
      { text: v(d.company_name) || '________________________________', bold: true },
      ', com nova data de término em ',
      { text: fmtDate(d.new_end_date), bold: true },
      '.',
    ],
    style: 'para',
    margin: [0, 8, 0, 8] as [number, number, number, number],
  }

  const content: Content[] = [
    ...header,
    docTitle('Declaração de Prorrogação de Estágio'),
    infoTable,
    datesTable,
    bodyText,
    ...sigBlock(
      ['Discente Estagiário', 'Coordenador de Estágios'],
      undefined,
      fmtDate(d.solicitation_date),
      fmtDate(d.authorization_date)
    ),
  ]

  return { content }
}
