import type { TDocumentDefinitions, Content, TableCell, Alignment } from 'pdfmake/interfaces'
import { ifceHeader, docTitle, dataTable, cell, sigBlock, fmtDate, v } from '@/lib/pdfmake-base-service'

export interface RealizationTermData {
  student_name?: string
  student_cpf?: string
  student_rg?: string
  student_course?: string
  student_enrollment?: string
  company_name?: string
  company_cnpj?: string
  company_supervisor?: string
  company_address?: string
  internship_start_date?: string
  internship_end_date?: string
  total_hours?: string
  weekly_hours?: string
  activities?: string
  performance_evaluation?: string
  city?: string
  solicitation_date?: string
  authorization_date?: string
}

export async function buildRealizationTermDoc(d: RealizationTermData): Promise<TDocumentDefinitions> {
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
    [cell('CURSO', v(d.student_course))]
  ])

  const companyTable = dataTable(['*'], [
    [{ text: 'INSTITUIÇÃO CONCEDENTE / CONCEDENTE DO ESTÁGIO', style: 'tableHeader', alignment: 'center' as Alignment }],
    [cell('RAZÃO SOCIAL', v(d.company_name))],
    [cell('CNPJ', v(d.company_cnpj))],
    [cell('ENDEREÇO', v(d.company_address))],
    [cell('SUPERVISOR DO ESTÁGIO', v(d.company_supervisor))]
  ])

  const internshipTable = dataTable(['25%', '25%', '25%', '25%'], [
    [
      { text: 'DATA INÍCIO', style: 'tableHeader', alignment: 'center' as Alignment },
      { text: 'DATA FIM', style: 'tableHeader', alignment: 'center' as Alignment },
      { text: 'C.H. TOTAL', style: 'tableHeader', alignment: 'center' as Alignment },
      { text: 'C.H. SEMANAL', style: 'tableHeader', alignment: 'center' as Alignment },
    ],
    [
      { text: fmtDate(d.internship_start_date), alignment: 'center' as Alignment, fontSize: 9, margin: [0, 5, 0, 5] },
      { text: fmtDate(d.internship_end_date), alignment: 'center' as Alignment, fontSize: 9, margin: [0, 5, 0, 5] },
      { text: `${v(d.total_hours)} HORAS`, alignment: 'center' as Alignment, fontSize: 9, margin: [0, 5, 0, 5] },
      { text: `${v(d.weekly_hours)} HORAS`, alignment: 'center' as Alignment, fontSize: 9, margin: [0, 5, 0, 5] },
    ]
  ])

  const content: Content[] = [
    ...header,
    docTitle('Termo de Realização de Estágio'),
    { text: 'A Instituição Concedente acima identificada declara, para os devidos fins, que o discente acima qualificado realizou estágio curricular nesta instituição, conforme os dados e atividades abaixo relacionados.', margin: [0, 10, 0, 10], alignment: 'justify' as Alignment, fontSize: 10 },
    studentTable,
    { text: '\n' },
    companyTable,
    { text: '\n' },
    internshipTable,
    { text: '\n' },
    dataTable(['*'], [
      [{ text: 'ATIVIDADES DESENVOLVIDAS', style: 'tableHeader', alignment: 'center' as Alignment }],
      [{ text: v(d.activities), margin: [4, 10, 4, 10], fontSize: 10 }]
    ]),
    { text: '\n' },
    dataTable(['*'], [
      [{ text: 'AVALIAÇÃO DE DESEMPENHO', style: 'tableHeader', alignment: 'center' as Alignment }],
      [{ text: v(d.performance_evaluation), margin: [4, 10, 4, 10], fontSize: 10 }]
    ]),
    { text: '\n\n' },
    sigBlock(
      ['ESTAGIÁRIO(A)', 'SUPERVISOR(A) DO ESTÁGIO', 'COORDENAÇÃO DE ESTÁGIOS - IFCE'],
      undefined,
      fmtDate(d.solicitation_date),
      fmtDate(d.authorization_date)
    ),
  ]

  return { content }
}
