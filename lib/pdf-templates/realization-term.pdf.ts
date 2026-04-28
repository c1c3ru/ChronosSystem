import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces'
import { ifceHeader, docTitle, dataTable, cell, emptyCell, sectionBlock, sigBlock, fmtDate, v } from '@/lib/pdfmake-base-service'

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
}

export async function buildRealizationTermDoc(d: RealizationTermData): Promise<TDocumentDefinitions> {
  const header = await ifceHeader()

  const studentTable = dataTable(
    ['50%', '25%', '25%'],
    [
      [
        cell('Nome Completo', v(d.student_name)),
        cell('CPF', v(d.student_cpf)),
        cell('RG', v(d.student_rg)),
      ],
      [
        cell('Curso', v(d.student_course), { colSpan: 2 }), emptyCell(),
        cell('Matrícula', v(d.student_enrollment)),
      ],
    ]
  )

  const companyTable = dataTable(
    ['50%', '50%'],
    [
      [
        cell('Razão Social', v(d.company_name)),
        cell('CNPJ', v(d.company_cnpj)),
      ],
      [
        cell('Supervisor', v(d.company_supervisor)),
        cell('Endereço', v(d.company_address)),
      ],
    ]
  )

  const internshipTable = dataTable(
    ['25%', '25%', '25%', '25%'],
    [
      [
        cell('Data de Início', fmtDate(d.internship_start_date)),
        cell('Data de Término', fmtDate(d.internship_end_date)),
        cell('Carga H. Total', v(d.total_hours)),
        cell('Carga H. Semanal', v(d.weekly_hours)),
      ],
    ]
  )

  const content: Content[] = [
    ...header,
    docTitle('Termo de Realização de Estágio'),
    ...sectionBlock('DADOS DO ESTAGIÁRIO'),
    studentTable,
    ...sectionBlock('DADOS DA EMPRESA CONCEDENTE'),
    companyTable,
    ...sectionBlock('DADOS DO ESTÁGIO REALIZADO'),
    internshipTable,
    ...sectionBlock('ATIVIDADES DESENVOLVIDAS', v(d.activities)),
    ...sectionBlock('AVALIAÇÃO DO DESEMPENHO', v(d.performance_evaluation)),
    { text: `${v(d.city) || 'Fortaleza'}, ____ de ______________ de _______`, alignment: 'right', margin: [0, 20, 0, 0] },
    ...sigBlock(['Estagiário(a)', 'Supervisor(a) do Estágio', 'Coordenador(a) de Estágios']),
  ]

  return { content }
}
