import type { TDocumentDefinitions, Content, TableCell } from 'pdfmake/interfaces'
import {
  ifceHeader,
  docTitle,
  dataTable,
  cell,
  emptyCell,
  sectionBlock,
  sigBlock,
  fmtDate,
  v,
} from '@/lib/pdfmake-base-service'

export interface SemesterReportData {
  student_name?: string
  student_course?: string
  student_enrollment?: string
  supervisor_name?: string
  advisor_name?: string
  period_start?: string
  period_end?: string
  hours_semester?: string
  hours_total?: string
  activities?: string
  comments?: string
  // avaliações (1-4)
  criteria_1?: string
  criteria_2?: string
  criteria_3?: string
  criteria_4?: string
  criteria_5?: string
  criteria_6?: string
  criteria_7?: string
  criteria_8?: string
}

const CRITERIA_LABELS: [string, string][] = [
  ['criteria_1', 'Assiduidade e Pontualidade'],
  ['criteria_2', 'Iniciativa e Pró-atividade'],
  ['criteria_3', 'Relacionamento Interpessoal'],
  ['criteria_4', 'Capacidade de Aprendizagem'],
  ['criteria_5', 'Qualidade do Trabalho'],
  ['criteria_6', 'Organização e Planejamento'],
  ['criteria_7', 'Comunicação'],
  ['criteria_8', 'Responsabilidade'],
]

export async function buildSemesterReportDoc(d: SemesterReportData): Promise<TDocumentDefinitions> {
  const header = await ifceHeader()

  const identTable = dataTable(
    ['35%', '25%', '20%', '20%'],
    [
      [
        cell('Nome do Discente', v(d.student_name), { colSpan: 2 }),
        emptyCell(),
        cell('Curso', v(d.student_course)),
        cell('Matrícula', v(d.student_enrollment)),
      ],
      [
        cell('Supervisor', v(d.supervisor_name)),
        cell('Orientador', v(d.advisor_name)),
        cell('Início Parcial', fmtDate(d.period_start)),
        cell('Fim Parcial', fmtDate(d.period_end)),
      ],
      [
        cell('H. no Período', v(d.hours_semester)),
        cell('H. Acumuladas', v(d.hours_total), { colSpan: 3 }),
        emptyCell(),
        emptyCell(),
      ],
    ]
  )

  const evalRows: TableCell[][] = CRITERIA_LABELS.map(([key, label]) => [
    cell(label, ''),
    cell('Conceito (1-4)', (d as Record<string, string>)[key] || '-'),
  ])

  const evalTable = dataTable(['75%', '25%'], evalRows)

  const content: Content[] = [
    ...header,
    docTitle('Relatório Semestral de Atividades de Estágio'),
    ...sectionBlock('IDENTIFICAÇÃO E PERÍODO'),
    identTable,
    ...sectionBlock('ATIVIDADES DESENVOLVIDAS', v(d.activities)),
    ...sectionBlock('AVALIAÇÃO DO DISCENTE (1=Insuf. / 2=Regular / 3=Bom / 4=Muito Satisfatório)'),
    evalTable,
    ...sectionBlock('OBSERVAÇÕES E COMENTÁRIOS', v(d.comments)),
    ...sigBlock(['Supervisor do Estágio', 'Discente Estagiário', 'Coordenador de Estágios']),
  ]

  return { content }
}
