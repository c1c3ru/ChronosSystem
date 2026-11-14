/**
 * Template pdfmake do "Formulário para Registro de Avaliação do Docente Orientador à Instituição
 * Concedente de Vaga de Estágio" (modelo oficial da PROEXT/IFCE).
 */
import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces'
import {
  cell,
  dataTable,
  docTitle,
  emptyCell,
  ifceHeader,
  sectionTitle,
  signatureRow,
  v,
} from '@/lib/pdfmake-base-service'
import { longDate } from '@/lib/work-declaration'
import {
  FACILITIES_OPTIONS,
  VISIT_PURPOSES,
  YES_NO,
  type Option,
} from '@/lib/concedente-evaluation'

export interface ConcedenteEvaluationData {
  campus?: string
  company_name?: string
  company_industry?: string
  company_cnpj?: string
  company_address?: string
  company_address_number?: string
  company_neighborhood?: string
  company_city?: string
  company_zip?: string
  company_state?: string
  company_phone?: string
  company_email?: string
  company_representative?: string
  company_representative_role?: string
  company_representative_phone?: string
  company_supervisor?: string
  company_supervisor_role?: string
  company_supervisor_phone?: string
  internship_sector?: string
  /** 01 */
  visit_purpose?: string
  /** 02 */
  area_compatible?: string
  area_compatible_reason?: string
  /** 03 */
  company_visited_institution?: string
  /** 04 */
  facilities_evaluation?: string
  facilities_reason?: string
  city?: string
  evaluation_date?: string
  advisor_name?: string
}

const options = (list: readonly Option[], selected?: string): Content => ({
  stack: list.map((o) => ({ text: `(${selected === o.value ? 'X' : ' '}) ${o.label}` })),
  margin: [12, 2, 0, 2],
})

const question = (n: string, text: string): Content => ({
  text: `${n}. ${text}`,
  bold: true,
  margin: [0, 6, 0, 0],
})

const reason = (value?: string): Content => ({
  text: [{ text: 'Por quê? ', bold: true }, value?.trim() || '_'.repeat(90)],
  margin: [12, 0, 0, 2],
})

export async function buildConcedenteEvaluationDoc(
  d: ConcedenteEvaluationData
): Promise<TDocumentDefinitions> {
  const header = await ifceHeader()

  const companyTable = dataTable(
    ['22%', '18%', '20%', '20%', '20%'],
    [
      [
        cell('Nome da concedente do estágio', v(d.company_name), { colSpan: 5 }),
        emptyCell(),
        emptyCell(),
        emptyCell(),
        emptyCell(),
      ],
      [
        cell('Ramo de atividade', v(d.company_industry), { colSpan: 5 }),
        emptyCell(),
        emptyCell(),
        emptyCell(),
        emptyCell(),
      ],
      [
        cell('CNPJ', v(d.company_cnpj)),
        cell('Endereço', v(d.company_address), { colSpan: 3 }),
        emptyCell(),
        emptyCell(),
        cell('Nº', v(d.company_address_number)),
      ],
      [
        cell('Bairro', v(d.company_neighborhood), { colSpan: 3 }),
        emptyCell(),
        emptyCell(),
        cell('Cidade', v(d.company_city), { colSpan: 2 }),
        emptyCell(),
      ],
      [
        cell('CEP', v(d.company_zip)),
        cell('Estado', v(d.company_state)),
        cell('Telefone', v(d.company_phone)),
        cell('E-mail', v(d.company_email), { colSpan: 2 }),
        emptyCell(),
      ],
      [
        cell('Responsável pela empresa', v(d.company_representative), { colSpan: 5 }),
        emptyCell(),
        emptyCell(),
        emptyCell(),
        emptyCell(),
      ],
      [
        cell('Cargo/Qualificação', v(d.company_representative_role), { colSpan: 3 }),
        emptyCell(),
        emptyCell(),
        cell('Telefone do responsável', v(d.company_representative_phone), { colSpan: 2 }),
        emptyCell(),
      ],
      [
        cell('Supervisor do estágio na empresa', v(d.company_supervisor), { colSpan: 5 }),
        emptyCell(),
        emptyCell(),
        emptyCell(),
        emptyCell(),
      ],
      [
        cell('Cargo/Qualificação', v(d.company_supervisor_role), { colSpan: 3 }),
        emptyCell(),
        emptyCell(),
        cell('Telefone do supervisor', v(d.company_supervisor_phone), { colSpan: 2 }),
        emptyCell(),
      ],
      [
        cell('Setor de realização do estágio', v(d.internship_sector), { colSpan: 5 }),
        emptyCell(),
        emptyCell(),
        emptyCell(),
        emptyCell(),
      ],
    ]
  )

  const place = d.city?.trim() || '______________________________'

  const content: Content[] = [
    ...header,
    {
      text: `Campus ${d.campus?.trim() || '_______________________'}`,
      alignment: 'center',
      bold: true,
      margin: [0, 0, 0, 2],
    },
    docTitle(
      'Formulário para Registro de Avaliação do Docente Orientador à Instituição Concedente de Vaga de Estágio'
    ),
    sectionTitle('Dados da concedente'),
    companyTable,
    sectionTitle('Avaliação'),
    question('01', 'Qual a finalidade da visita?'),
    options(VISIT_PURPOSES, d.visit_purpose),
    question(
      '02',
      'A área de atuação da concedente apresenta compatibilidade com a proposta pedagógica do curso e formação profissional do estagiário?'
    ),
    options(YES_NO, d.area_compatible),
    reason(d.area_compatible_reason),
    question('03', 'A parte concedente já visitou a instituição?'),
    options(YES_NO, d.company_visited_institution),
    question(
      '04',
      'Avaliação das instalações da parte concedente do estágio e sua adequação à formação cultural e profissional do estagiário.'
    ),
    options(FACILITIES_OPTIONS, d.facilities_evaluation),
    reason(d.facilities_reason),
    {
      text: `${place}, ${longDate(d.evaluation_date)}.`,
      alignment: 'right',
      margin: [0, 12, 0, 8],
    },
    signatureRow([
      'Representante da empresa concedente',
      d.advisor_name?.trim()
        ? `Professor orientador: ${d.advisor_name.trim()}`
        : 'Professor orientador',
    ]),
  ]

  return { content }
}
