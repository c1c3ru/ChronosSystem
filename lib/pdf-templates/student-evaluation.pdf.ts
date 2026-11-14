/**
 * Template pdfmake do "Termo de Avaliação ao Discente Estagiário" (IFCE).
 * Res. CONSUP/IFCE nº 108/2023: art. 20, XV (termo de avaliação), art. 40 (critérios e
 * frequência mínima de 70%) e art. 41 (conceito satisfatório ou insatisfatório do orientador).
 */
import type { TDocumentDefinitions, Content, TableCell } from 'pdfmake/interfaces'
import {
  ifceHeader,
  docTitle,
  dataTable,
  cell,
  emptyCell,
  sectionBlock,
  sectionTitle,
  sigBlock,
  fmtDate,
  v,
} from '@/lib/pdfmake-base-service'
import {
  EVALUATION_CRITERIA,
  FINAL_CONCEPTS,
  GRADE_SCALE,
  MIN_ATTENDANCE_PERCENT,
  averageGrade,
  parseAttendance,
  type EvaluationCriterionKey,
} from '@/lib/student-evaluation'

export interface StudentEvaluationData extends Partial<Record<EvaluationCriterionKey, string>> {
  student_name?: string
  student_course?: string
  student_enrollment?: string
  company_name?: string
  company_supervisor?: string
  advisor_name?: string
  period_start?: string
  period_end?: string
  evaluation_date?: string
  attendance_percent?: string
  final_concept?: string
  observations?: string
  recommendation?: string
  solicitation_date?: string
  authorization_date?: string
}

const fmtNumber = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 })

const mark = (checked: boolean, label: string) => `(${checked ? 'X' : ' '}) ${label}`

export async function buildStudentEvaluationDoc(
  d: StudentEvaluationData
): Promise<TDocumentDefinitions> {
  const header = await ifceHeader()

  const identTable = dataTable(
    ['35%', '25%', '20%', '20%'],
    [
      [
        cell('Nome do Estagiário', v(d.student_name), { colSpan: 2 }),
        emptyCell(),
        cell('Curso', v(d.student_course)),
        cell('Matrícula', v(d.student_enrollment)),
      ],
      [
        cell('Concedente', v(d.company_name)),
        cell('Supervisor', v(d.company_supervisor)),
        cell('Período Início', fmtDate(d.period_start)),
        cell('Período Fim', fmtDate(d.period_end)),
      ],
      [
        cell('Docente Orientador', v(d.advisor_name), { colSpan: 2 }),
        emptyCell(),
        cell('Data da Avaliação', fmtDate(d.evaluation_date), { colSpan: 2 }),
        emptyCell(),
      ],
    ]
  )

  // Uma linha por critério (rótulo e nota lado a lado) para o termo caber numa página
  const row = (label: string, grade: string, bold = false): TableCell[] => [
    { text: label, bold, fontSize: 8, margin: [3, 2, 3, 2] },
    { text: grade, bold, fontSize: 8, alignment: 'center', margin: [3, 2, 3, 2] },
  ]
  const average = averageGrade(d as Record<string, string>)
  const evalTable = dataTable(
    ['80%', '20%'],
    [
      row('Critério', 'Nota (1-5)', true),
      ...EVALUATION_CRITERIA.map(({ key, label }) => row(label, d[key] || '-')),
      row('Média das notas', average === null ? '-' : fmtNumber(average), true),
    ]
  )

  const attendance = parseAttendance(d.attendance_percent)
  const attendanceText =
    attendance === null
      ? '______ %'
      : `${fmtNumber(attendance)} %${attendance < MIN_ATTENDANCE_PERCENT ? ` (abaixo do mínimo de ${MIN_ATTENDANCE_PERCENT}%)` : ''}`
  const conceptText = FINAL_CONCEPTS.map((c) => mark(d.final_concept === c.value, c.label)).join(
    '     '
  )

  const resultTable = dataTable(
    ['40%', '60%'],
    [
      [
        cell(`Frequência (mínimo ${MIN_ATTENDANCE_PERCENT}%)`, attendanceText),
        cell('Conceito final do docente orientador (art. 41)', conceptText),
      ],
    ]
  )

  const recText = `${mark(d.recommendation === 'sim', 'Sim')}   ${mark(d.recommendation === 'nao', 'Não')}`

  const content: Content[] = [
    ...header,
    docTitle('Termo de Avaliação ao Discente Estagiário'),
    sectionTitle('IDENTIFICAÇÃO'),
    identTable,
    sectionTitle(`CRITÉRIOS DE AVALIAÇÃO (${GRADE_SCALE})`),
    evalTable,
    sectionTitle('FREQUÊNCIA E CONCEITO FINAL'),
    resultTable,
    ...sectionBlock('OBSERVAÇÕES E COMENTÁRIOS', v(d.observations)),
    dataTable(['*'], [[cell('Recomendaria este estagiário?', recText)]]),
    ...sigBlock(
      ['Supervisor do Estágio', 'Docente Orientador'],
      undefined,
      fmtDate(d.solicitation_date),
      fmtDate(d.authorization_date)
    ),
  ]

  return { content }
}
