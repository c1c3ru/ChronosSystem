import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces'
import { ifceHeader, docTitle, dataTable, cell, emptyCell, sectionBlock, sectionTitle, sigBlock, fmtDate, v } from '@/lib/pdfmake-base-service'

export interface MonthlyReportData {
  student_name?: string
  student_course?: string
  student_enrollment?: string
  supervisor_name?: string
  advisor_name?: string
  period_start?: string
  period_end?: string
  hours_month?: string
  hours_total?: string
  activities?: string
  difficulties?: string
  solutions?: string
  solicitation_date?: string
  authorization_date?: string
}

export async function buildMonthlyReportDoc(d: MonthlyReportData): Promise<TDocumentDefinitions> {
  const header = await ifceHeader()

  const identTable = dataTable(
    ['35%', '25%', '20%', '20%'],
    [
      [
        cell('Nome do Discente', v(d.student_name), { colSpan: 2 }), emptyCell(),
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
        cell('H. no Período', v(d.hours_month)),
        cell('H. Acumuladas', v(d.hours_total), { colSpan: 3 }),
        emptyCell(), emptyCell(),
      ],
    ]
  )

  const content: Content[] = [
    ...header,
    docTitle('Relatório Mensal de Atividades'),
    sectionTitle('IDENTIFICAÇÃO E PERÍODO'),
    identTable,
    ...sectionBlock('ATIVIDADES DESENVOLVIDAS', v(d.activities)),
    ...sectionBlock('DIFICULDADES ENCONTRADAS', v(d.difficulties)),
    ...sectionBlock('SOLUÇÕES ADOTADAS', v(d.solutions)),
    ...sigBlock(
      ['Supervisor do Estágio', 'Discente Estagiário', 'Docente Orientador'],
      undefined,
      fmtDate(d.solicitation_date),
      fmtDate(d.authorization_date)
    ),
  ]

  return { content }
}
