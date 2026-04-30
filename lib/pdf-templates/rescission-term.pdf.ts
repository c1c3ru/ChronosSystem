import type { TDocumentDefinitions, Content, TableCell, Alignment } from 'pdfmake/interfaces'
import { ifceHeader, docTitle, dataTable, cell, sigBlock, fmtDate, v } from '@/lib/pdfmake-base-service'

export interface RescissionTermData {
  student_name?: string
  student_cpf?: string
  student_rg?: string
  student_course?: string
  student_enrollment?: string
  student_address?: string
  student_phone?: string
  student_email?: string
  company_name?: string
  company_cnpj?: string
  company_phone?: string
  company_address?: string
  company_representative?: string
  company_representative_cpf?: string
  internship_start_date?: string
  internship_end_date?: string
  original_term_date?: string
  rescission_date?: string
  rescission_reason?: string
  city?: string
  solicitation_date?: string
  authorization_date?: string
}

export async function buildRescissionTermDoc(d: RescissionTermData): Promise<TDocumentDefinitions> {
  const header = await ifceHeader()

  const studentTable = dataTable(['*'], [
    [{ text: 'DISCENTE ESTAGIÁRIO(A)', style: 'tableHeader', alignment: 'center' as Alignment }],
    [cell('NOME', v(d.student_name))],
    [{
      columns: [
        cell('CPF', v(d.student_cpf), { border: [false, false, true, true] }),
        cell('MATRÍCULA', v(d.student_enrollment), { border: [false, false, false, true] }),
      ]
    } as TableCell],
    [cell('CURSO', v(d.student_course))],
    [cell('ENDEREÇO', v(d.student_address))],
    [{
      columns: [
        cell('TELEFONE', v(d.student_phone), { border: [false, false, true, true] }),
        cell('E-MAIL', v(d.student_email), { border: [false, false, false, true] }),
      ]
    } as TableCell]
  ])

  const companyTable = dataTable(['*'], [
    [{ text: 'INSTITUIÇÃO CONCEDENTE / CONCEDENTE DO ESTÁGIO', style: 'tableHeader', alignment: 'center' as Alignment }],
    [cell('RAZÃO SOCIAL', v(d.company_name))],
    [{
      columns: [
        cell('CNPJ', v(d.company_cnpj), { border: [false, false, true, true] }),
        cell('DDD + TELEFONE', v(d.company_phone), { border: [false, false, false, true] }),
      ]
    } as TableCell],
    [cell('ENDEREÇO', v(d.company_address))],
    [cell('REPRESENTANTE LEGAL', v(d.company_representative))]
  ])

  const internshipTable = dataTable(['25%', '25%', '25%', '25%'], [
    [
      { text: 'DATA INÍCIO', style: 'tableHeader', alignment: 'center' as Alignment },
      { text: 'DATA FIM PREVISTA', style: 'tableHeader', alignment: 'center' as Alignment },
      { text: 'DATA TERMO ORIGINAL', style: 'tableHeader', alignment: 'center' as Alignment },
      { text: 'DATA RESCISÃO', style: 'tableHeader', alignment: 'center' as Alignment },
    ],
    [
      { text: fmtDate(d.internship_start_date), alignment: 'center' as Alignment, fontSize: 9, margin: [0, 5, 0, 5] },
      { text: fmtDate(d.internship_end_date), alignment: 'center' as Alignment, fontSize: 9, margin: [0, 5, 0, 5] },
      { text: fmtDate(d.original_term_date), alignment: 'center' as Alignment, fontSize: 9, margin: [0, 5, 0, 5] },
      { text: fmtDate(d.rescission_date), alignment: 'center' as Alignment, fontSize: 9, margin: [0, 5, 0, 5] },
    ]
  ])

  const content: Content[] = [
    ...header,
    docTitle('Termo de Rescisão de Compromisso de Estágio'),
    { text: 'Pelo presente instrumento, as partes acima qualificadas resolvem, de comum acordo, rescindir o Termo de Compromisso de Estágio celebrado entre si, cessando todos os seus efeitos a partir da data de rescisão acima indicada.', margin: [0, 10, 0, 10], alignment: 'justify' as Alignment, fontSize: 10 },
    studentTable,
    { text: '\n' },
    companyTable,
    { text: '\n' },
    internshipTable,
    { text: '\n' },
    dataTable(['*'], [
      [{ text: 'MOTIVO DA RESCISÃO', style: 'tableHeader', alignment: 'center' as Alignment }],
      [{ text: v(d.rescission_reason), margin: [4, 10, 4, 10], fontSize: 10 }]
    ]),
    { text: '\n\n' },
    sigBlock(
      ['DISCENTE ESTAGIÁRIO(A)', 'REPRESENTANTE DA CONCEDENTE', 'IFCE - CAMPUS MARACANAÚ'],
      undefined,
      fmtDate(d.solicitation_date),
      fmtDate(d.authorization_date)
    ),
  ]

  return { content }
}
