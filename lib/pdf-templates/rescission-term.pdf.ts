import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces'
import { ifceHeader, docTitle, dataTable, cell, emptyCell, sectionBlock, sectionTitle, sigBlock, fmtDate, v } from '@/lib/pdfmake-base-service'

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

  const studentTable = dataTable(
    ['35%', '20%', '20%', '25%'],
    [
      [
        cell('Nome Completo', v(d.student_name), { colSpan: 2 }), emptyCell(),
        cell('CPF', v(d.student_cpf)),
        cell('RG', v(d.student_rg)),
      ],
      [
        cell('Curso', v(d.student_course)),
        cell('Matrícula', v(d.student_enrollment)),
        cell('Telefone', v(d.student_phone)),
        cell('E-mail', v(d.student_email)),
      ],
      [
        cell('Endereço', v(d.student_address), { colSpan: 4 }),
        emptyCell(), emptyCell(), emptyCell(),
      ],
    ]
  )

  const companyTable = dataTable(
    ['40%', '25%', '20%', '15%'],
    [
      [
        cell('Razão Social', v(d.company_name), { colSpan: 2 }), emptyCell(),
        cell('CNPJ', v(d.company_cnpj)),
        cell('Telefone', v(d.company_phone)),
      ],
      [
        cell('Endereço', v(d.company_address), { colSpan: 2 }), emptyCell(),
        cell('Representante Legal', v(d.company_representative)),
        cell('CPF Representante', v(d.company_representative_cpf)),
      ],
    ]
  )

  const datesTable = dataTable(
    ['*', '*', '*', '*'],
    [[
      cell('Início do Estágio', fmtDate(d.internship_start_date)),
      cell('Término Previsto', fmtDate(d.internship_end_date)),
      cell('Data do Termo Original', fmtDate(d.original_term_date)),
      cell('Data da Rescisão', fmtDate(d.rescission_date)),
    ]]
  )

  const content: Content[] = [
    ...header,
    docTitle('Termo de Rescisão de Contrato de Estágio'),
    sectionTitle('1. DADOS DO ESTAGIÁRIO'),
    studentTable,
    sectionTitle('2. DADOS DA EMPRESA CONCEDENTE'),
    companyTable,
    sectionTitle('3. DADOS DO ESTÁGIO E RESCISÃO'),
    datesTable,
    ...sectionBlock('MOTIVO DA RESCISÃO', v(d.rescission_reason)),
    ...sigBlock(
      ['Discente Estagiário', 'Representante Legal da Empresa', 'Coordenador de Estágios'],
      'Declaro que as informações acima são verdadeiras.',
      fmtDate(d.solicitation_date),
      fmtDate(d.authorization_date)
    ),
  ]

  return { content }
}
