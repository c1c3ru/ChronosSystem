import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces'
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

export interface ProfessionalDeclarationData {
  company_name?: string
  company_cnpj?: string
  city?: string
  company_address?: string
  employee_name?: string
  employee_cpf?: string
  employee_ctps?: string
  employee_ctps_series?: string
  start_date?: string
  role?: string
  weekly_hours?: string
  activities?: string
  solicitation_date?: string
  authorization_date?: string
}

export async function buildProfessionalDeclarationDoc(
  d: ProfessionalDeclarationData
): Promise<TDocumentDefinitions> {
  const header = await ifceHeader()

  const companyTable = dataTable(
    ['50%', '50%'],
    [
      [cell('Razão Social', v(d.company_name)), cell('CNPJ', v(d.company_cnpj))],
      [cell('Endereço', v(d.company_address), { colSpan: 2 }), emptyCell()],
    ]
  )

  const employeeTable = dataTable(
    ['50%', '25%', '25%'],
    [
      [
        cell('Nome do Funcionário', v(d.employee_name)),
        cell('CPF', v(d.employee_cpf)),
        emptyCell(),
      ],
      [cell('CTPS Nº', v(d.employee_ctps)), cell('Série', v(d.employee_ctps_series)), emptyCell()],
    ]
  )

  // Correction: emptyCell wasn't enough for 3 cols when colSpan is 1 for everything. Wait.
  // The widths are 3. The first row has 3 cells (the 3rd is emptyCell). Wait, `cell` with no colSpan occupies 1.
  // So: [cell, cell, cell]. Correct.
  // Actually, I'll just use regular cells for CPF and empty for the rest.
  // Wait, let's look at the dataTable. I should probably adjust it to 2 columns to be simpler.

  const employeeTableFixed = dataTable(
    ['50%', '25%', '25%'],
    [
      [
        cell('Nome do Funcionário', v(d.employee_name)),
        cell('CPF', v(d.employee_cpf), { colSpan: 2 }),
        emptyCell(),
      ],
      [
        cell('CTPS Nº', v(d.employee_ctps), { colSpan: 2 }),
        emptyCell(),
        cell('Série', v(d.employee_ctps_series)),
      ],
    ]
  )

  const linkTable = dataTable(
    ['33%', '33%', '34%'],
    [
      [
        cell('Data de Início', fmtDate(d.start_date)),
        cell('Função', v(d.role)),
        cell('Carga Horária Semanal', v(d.weekly_hours)),
      ],
    ]
  )

  const content: Content[] = [
    ...header,
    docTitle('Declaração de Atividades Profissionais'),
    sectionTitle('DADOS DA EMPRESA'),
    companyTable,
    sectionTitle('DADOS DO FUNCIONÁRIO'),
    employeeTableFixed,
    sectionTitle('DADOS DO VÍNCULO'),
    linkTable,
    ...sectionBlock('DESCRIÇÃO DAS ATIVIDADES', v(d.activities)),
    {
      text: `${v(d.city) || 'Fortaleza'}, ____ de ______________ de _______`,
      alignment: 'right',
      margin: [0, 10, 0, 5],
    },
    ...sigBlock(
      ['Representante da Empresa', 'Funcionário'],
      undefined,
      fmtDate(d.solicitation_date),
      fmtDate(d.authorization_date)
    ),
  ]

  return { content }
}
