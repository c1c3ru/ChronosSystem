import type { TDocumentDefinitions, Content, TableCell } from 'pdfmake/interfaces'
import { ifceHeader, docTitle, dataTable, cell, emptyCell, sectionBlock, sectionTitle, sigBlock, fmtDate, v } from '@/lib/pdfmake-base-service'

export interface FinalReportData {
  student_name?: string
  student_course?: string
  student_enrollment?: string
  supervisor_name?: string
  advisor_name?: string
  period_start?: string
  period_end?: string
  hours_total?: string
  activities?: string
  comments?: string
  // avaliações (1-4)
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
  solicitation_date?: string
  authorization_date?: string
}

const EVAL_LABELS: Record<string, string> = {
  eval_assiduity: 'Assiduidade',
  eval_punctuality: 'Pontualidade',
  eval_responsibility: 'Responsabilidade',
  eval_discipline: 'Disciplina',
  eval_cooperation: 'Cooperação',
  eval_initiative: 'Iniciativa',
  eval_proactivity: 'Proatividade',
  eval_communication: 'Comunicação',
  eval_relationship: 'Relacionamento Interpessoal',
  eval_technical_knowledge: 'Conhecimento Técnico',
  eval_learning_capacity: 'Capacidade de Aprendizagem',
  eval_productivity: 'Produtividade',
  eval_quality: 'Qualidade do Trabalho',
  eval_organization: 'Organização',
  eval_creativity: 'Criatividade',
}

export async function buildFinalReportDoc(d: FinalReportData): Promise<TDocumentDefinitions> {
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
        cell('Início', fmtDate(d.period_start)),
        cell('Fim', fmtDate(d.period_end)),
      ],
      [
        cell('C.H. Total (h)', v(d.hours_total), { colSpan: 4 }),
        emptyCell(), emptyCell(), emptyCell(),
      ],
    ]
  )

  // Tabela de avaliação
  const evalRows: TableCell[][] = Object.entries(EVAL_LABELS).map(([key, label]) => [
    cell(label, ''),
    cell('Conceito', (d as Record<string, string>)[key] || '-'),
  ])

  const evalTable = dataTable(['75%', '25%'], evalRows)

  const content: Content[] = [
    ...header,
    docTitle('Relatório Final de Atividades de Estágio'),
    sectionTitle('IDENTIFICAÇÃO E PERÍODO'),
    identTable,
    ...sectionBlock('ATIVIDADES DESENVOLVIDAS', v(d.activities)),
    sectionTitle('AVALIAÇÃO DO DISCENTE (1=Insuf. / 2=Regular / 3=Bom / 4=Muito Satisfatório)'),
    evalTable,
    ...sectionBlock('OBSERVAÇÕES E COMENTÁRIOS', v(d.comments)),
    ...sigBlock(
      ['Supervisor do Estágio', 'Discente Estagiário', 'Coordenador de Estágios'],
      undefined,
      fmtDate(d.solicitation_date),
      fmtDate(d.authorization_date)
    ),
  ]

  return { content }
}
