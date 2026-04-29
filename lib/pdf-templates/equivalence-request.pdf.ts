import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces'
import { ifceHeader, docTitle, cell, emptyCell, dataTable, sectionBlock, sectionTitle, sigBlock, fmtDate, v } from '@/lib/pdfmake-base-service'

export interface EquivalenceRequestData {
  student_name?: string
  student_enrollment?: string
  student_course?: string
  student_address?: string
  student_phone?: string
  student_email?: string
  company_name?: string
  company_address?: string
  company_phone?: string
  company_email?: string
  company_supervisor?: string
  activities?: string
  start_date?: string
  end_date?: string
  total_hours?: string
  doc_work_card?: string
  doc_service_declaration?: string
  doc_activities_declaration?: string
  doc_other?: string
  doc_other_desc?: string
  solicitation_date?: string
  authorization_date?: string
}

function chk(checked: boolean, label: string) {
  return checked ? `(X) ${label}` : `( ) ${label}`
}

export async function buildEquivalenceRequestDoc(d: EquivalenceRequestData): Promise<TDocumentDefinitions> {
  const header = await ifceHeader()

  const studentTable = dataTable(
    ['40%', '30%', '30%'],
    [
      [
        cell('Nome Completo', v(d.student_name), { colSpan: 2 }), emptyCell(),
        cell('Matrícula', v(d.student_enrollment)),
      ],
      [
        cell('Curso', v(d.student_course)),
        cell('Telefone', v(d.student_phone)),
        cell('E-mail', v(d.student_email)),
      ],
      [
        cell('Endereço', v(d.student_address), { colSpan: 3 }), emptyCell(), emptyCell(),
      ],
    ]
  )

  const companyTable = dataTable(
    ['40%', '30%', '30%'],
    [
      [
        cell('Nome da Empresa', v(d.company_name), { colSpan: 2 }), emptyCell(),
        cell('Telefone', v(d.company_phone)),
      ],
      [
        cell('Endereço', v(d.company_address), { colSpan: 2 }), emptyCell(),
        cell('E-mail', v(d.company_email)),
      ],
      [
        cell('Chefe Imediato', v(d.company_supervisor), { colSpan: 3 }), emptyCell(), emptyCell(),
      ],
    ]
  )

  const periodTable = dataTable(
    ['*', '*', '*'],
    [[
      cell('Data Inicial', fmtDate(d.start_date)),
      cell('Data Final', fmtDate(d.end_date)),
      cell('Carga Horária Total (h)', v(d.total_hours)),
    ]]
  )

  const docsChecks = [
    chk(d.doc_work_card === 'true', 'Carteira de Trabalho'),
    chk(d.doc_service_declaration === 'true', 'Declaração de Tempo de Serviço'),
    chk(d.doc_activities_declaration === 'true', 'Declaração de Atividades Profissionais'),
    d.doc_other === 'true' ? `(X) Outros: ${v(d.doc_other_desc)}` : '( ) Outros',
  ].join('   ')

  const content: Content[] = [
    ...header,
    docTitle('Solicitação de Equivalência de Estágio'),
    sectionTitle('DADOS DO DISCENTE'),
    studentTable,
    sectionTitle('DADOS DA EMPRESA'),
    companyTable,
    ...sectionBlock('ATIVIDADES REALIZADAS', v(d.activities)),
    periodTable,
    cell('DOCUMENTOS ANEXOS', docsChecks) as Content,
    ...sigBlock(
      ['Discente', 'Coordenador de Estágios'],
      undefined,
      fmtDate(d.solicitation_date),
      fmtDate(d.authorization_date)
    ),
  ]

  return { content }
}
