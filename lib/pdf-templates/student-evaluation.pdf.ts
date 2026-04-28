import type { TDocumentDefinitions, Content, TableCell } from 'pdfmake/interfaces'
import { ifceHeader, docTitle, dataTable, cell, emptyCell, sectionBlock, sigBlock, fmtDate, v } from '@/lib/pdfmake-base-service'

export interface StudentEvaluationData {
  student_name?: string
  student_course?: string
  student_enrollment?: string
  company_name?: string
  company_supervisor?: string
  period_start?: string
  period_end?: string
  evaluation_date?: string
  observations?: string
  recommendation?: string
  eval_assiduity?: string
  eval_punctuality?: string
  eval_responsibility?: string
  eval_discipline?: string
  eval_cooperation?: string
  eval_initiative?: string
  eval_proactivity?: string
  eval_communication?: string
  eval_relationship?: string
  eval_technical_knowledge?: string
  eval_learning_capacity?: string
  eval_productivity?: string
  eval_quality?: string
  eval_organization?: string
  eval_creativity?: string
}

const EVAL_LABELS: [string, string][] = [
  ['eval_assiduity', 'Assiduidade'],
  ['eval_punctuality', 'Pontualidade'],
  ['eval_responsibility', 'Responsabilidade'],
  ['eval_discipline', 'Disciplina'],
  ['eval_cooperation', 'Cooperação'],
  ['eval_initiative', 'Iniciativa'],
  ['eval_proactivity', 'Proatividade'],
  ['eval_communication', 'Comunicação'],
  ['eval_relationship', 'Relacionamento Interpessoal'],
  ['eval_technical_knowledge', 'Conhecimento Técnico'],
  ['eval_learning_capacity', 'Capacidade de Aprendizagem'],
  ['eval_productivity', 'Produtividade'],
  ['eval_quality', 'Qualidade do Trabalho'],
  ['eval_organization', 'Organização'],
  ['eval_creativity', 'Criatividade'],
]

export async function buildStudentEvaluationDoc(d: StudentEvaluationData): Promise<TDocumentDefinitions> {
  const header = await ifceHeader()

  const identTable = dataTable(
    ['35%', '25%', '20%', '20%'],
    [
      [cell('Nome do Estagiário', v(d.student_name), { colSpan: 2 }), emptyCell(), cell('Curso', v(d.student_course)), cell('Matrícula', v(d.student_enrollment))],
      [cell('Empresa', v(d.company_name)), cell('Supervisor', v(d.company_supervisor)), cell('Período Início', fmtDate(d.period_start)), cell('Período Fim', fmtDate(d.period_end))],
      [cell('Data da Avaliação', fmtDate(d.evaluation_date), { colSpan: 4 }), emptyCell(), emptyCell(), emptyCell()],
    ]
  )

  const evalRows: TableCell[][] = EVAL_LABELS.map(([key, label]) => [cell(label, ''), cell('Nota (1-5)', (d as Record<string, string>)[key] || '-')])
  const evalTable = dataTable(['75%', '25%'], evalRows)

  const recText = d.recommendation === 'sim' ? '(X) Sim   ( ) Não' : d.recommendation === 'nao' ? '( ) Sim   (X) Não' : '( ) Sim   ( ) Não'

  const content: Content[] = [
    ...header,
    docTitle('Ficha de Avaliação do Discente Estagiário'),
    ...sectionBlock('IDENTIFICAÇÃO'),
    identTable,
    ...sectionBlock('CRITÉRIOS DE AVALIAÇÃO (1=Insuf. / 2=Regular / 3=Bom / 4=Muito Bom / 5=Excelente)'),
    evalTable,
    ...sectionBlock('OBSERVAÇÕES E COMENTÁRIOS', v(d.observations)),
    dataTable(['*'], [[cell('Recomendaria este estagiário?', recText)]]),
    ...sigBlock(['Supervisor do Estágio', 'Coordenador de Estágios']),
  ]

  return { content }
}
