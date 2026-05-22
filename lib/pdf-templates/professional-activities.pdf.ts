import type { TDocumentDefinitions, Content, TableCell, Alignment } from 'pdfmake/interfaces'
import { ifceHeader, cell, emptyCell, dataTable, fmtDate, v } from '@/lib/pdfmake-base-service'

export interface ProfessionalActivitiesData {
  // Empresa
  company_name?: string
  company_cnpj?: string
  company_address?: string

  // Funcionário
  employee_name?: string
  employee_cpf?: string
  employee_ctps_number?: string
  employee_ctps_series?: string

  // Vínculo
  start_date?: string
  function_name?: string
  weekly_hours?: string

  // Atividades
  activities?: string

  solicitation_date?: string
  authorization_date?: string
  city?: string
}

export async function buildProfessionalActivitiesDoc(
  d: ProfessionalActivitiesData
): Promise<TDocumentDefinitions> {
  const header = await ifceHeader()

  const companyTable = dataTable(
    ['70%', '30%'],
    [
      [
        {
          text: 'DADOS DA EMPRESA',
          style: 'tableHeader',
          alignment: 'center' as Alignment,
          colSpan: 2,
        },
        emptyCell(),
      ],
      [cell('RAZÃO SOCIAL', v(d.company_name)), cell('CNPJ', v(d.company_cnpj))],
      [cell('ENDEREÇO', v(d.company_address), { colSpan: 2 }), emptyCell()],
    ]
  )

  const employeeTable = dataTable(
    ['70%', '30%'],
    [
      [
        {
          text: 'DADOS DO FUNCIONÁRIO',
          style: 'tableHeader',
          alignment: 'center' as Alignment,
          colSpan: 2,
        },
        emptyCell(),
      ],
      [cell('NOME DO FUNCIONÁRIO', v(d.employee_name)), cell('CPF', v(d.employee_cpf))],
      [cell('CTPS Nº', v(d.employee_ctps_number)), cell('SÉRIE', v(d.employee_ctps_series))],
    ]
  )

  const contractTable = dataTable(
    ['33%', '34%', '33%'],
    [
      [
        {
          text: 'DADOS DO VÍNCULO',
          style: 'tableHeader',
          alignment: 'center' as Alignment,
          colSpan: 3,
        },
        emptyCell(),
        emptyCell(),
      ],
      [
        cell('DATA DE INÍCIO', fmtDate(d.start_date)),
        cell('FUNÇÃO', v(d.function_name)),
        cell('CARGA HORÁRIA SEMANAL', `${v(d.weekly_hours)} h`),
      ],
    ]
  )

  const activitiesTable = dataTable(
    ['*'],
    [
      [
        {
          text: 'DESCRIÇÃO DAS ATIVIDADES',
          style: 'tableHeader',
          alignment: 'center' as Alignment,
        },
      ],
      [
        {
          text: v(d.activities),
          fontSize: 9,
          margin: [5, 5, 5, 30],
        },
      ],
    ]
  )

  const content: Content[] = [
    ...header,
    { text: 'DECLARAÇÃO DE ATIVIDADES PROFISSIONAIS', style: 'docTitle', margin: [0, 10, 0, 10] },
    companyTable,
    employeeTable,
    contractTable,
    activitiesTable,
    { text: '\n' },
    {
      text: `${v(d.city || 'Maracanaú')}, ____ de _________________ de ________`,
      alignment: 'right',
      fontSize: 10,
      margin: [0, 10, 0, 10],
    },
    {
      table: {
        widths: ['*', '*'],
        body: [
          [
            {
              text: [
                { text: 'SOLICITAÇÃO EM ', bold: true, fontSize: 7 },
                { text: fmtDate(d.solicitation_date), fontSize: 7 },
              ],
              border: [true, true, false, true],
              margin: [4, 3, 4, 3],
            },
            {
              text: [
                { text: 'AUTORIZAÇÃO EM ', bold: true, fontSize: 7 },
                { text: fmtDate(d.authorization_date), fontSize: 7 },
              ],
              border: [false, true, true, true],
              margin: [4, 3, 4, 3],
            },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#000000',
        vLineColor: () => '#000000',
      },
    },
    { text: '\n\n' },
    {
      columns: [
        {
          stack: [
            {
              canvas: [{ type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 0.5 }],
              margin: [0, 20, 0, 2],
            },
            { text: 'REPRESENTANTE DA EMPRESA', fontSize: 7, alignment: 'center' as Alignment },
          ],
          width: '50%',
        },
        {
          stack: [
            {
              canvas: [{ type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 0.5 }],
              margin: [0, 20, 0, 2],
            },
            { text: 'FUNCIONÁRIO', fontSize: 7, alignment: 'center' as Alignment },
          ],
          width: '50%',
        },
      ],
    },
  ]

  return { content }
}
