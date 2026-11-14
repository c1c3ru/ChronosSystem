/**
 * additive-term.pdf.ts
 *
 * Template pdfmake do "Termo Aditivo ao Termo de Compromisso de Estágio" (IFCE).
 * Res. CONSUP/IFCE nº 108/2023, art. 20, X e art. 37.
 *
 * Os campos têm os mesmos nomes da tela (`app/documents/additive-term/page.tsx`),
 * para que a página repasse o formulário inteiro sem renomear nada.
 *
 * USO:
 *   const doc = await buildAdditiveTermDoc({ ...formData })
 *   await generatePDF(doc, { filename: 'termo-aditivo.pdf' })
 */

import type { TDocumentDefinitions, Content, TableCell } from 'pdfmake/interfaces'
import {
  ifceHeader,
  docTitle,
  cell,
  dataTable,
  sectionTitle,
  sectionBlock,
  sigBlock,
  fmtDate,
  v,
} from '@/lib/pdfmake-base-service'

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export const ADDITIVE_TYPES = [
  { key: 'additive_type_prorogation', label: 'Prorrogação de Vigência' },
  { key: 'additive_type_allowance', label: 'Alteração do Valor da Bolsa' },
  { key: 'additive_type_supervisor', label: 'Alteração de Supervisor' },
  { key: 'additive_type_schedule', label: 'Alteração de Horário' },
  { key: 'additive_type_other', label: 'Outras Alterações' },
] as const

export type AdditiveTypeKey = (typeof ADDITIVE_TYPES)[number]['key']

export interface AdditiveTermData extends Partial<Record<AdditiveTypeKey, string>> {
  // Concedente
  company_name?: string
  company_cnpj?: string
  company_address?: string
  company_representative?: string
  company_representative_role?: string

  // Discente
  student_name?: string
  student_cpf?: string
  student_enrollment?: string
  student_course?: string
  student_address?: string
  student_phone?: string

  // Dados gerais
  additive_reason?: string
  justification?: string

  // Prorrogação
  new_end_date?: string
  extension_period?: string

  // Bolsa
  new_allowance_value?: string
  new_transport_aid?: string

  // Supervisor
  new_supervisor_name?: string
  new_supervisor_role?: string
  new_supervisor_council?: string

  // Horário
  new_weekly_hours?: string
  new_schedule?: string

  // Outras
  other_changes?: string

  // Local e assinatura
  campus_city?: string
  campus_director?: string
}

const isChecked = (value?: string): boolean => value === 'true'

const withName = (name: string | undefined, role: string): string =>
  name?.trim() ? `${name.trim()}\n${role}` : role

// ─── BUILDER ─────────────────────────────────────────────────────────────────

export async function buildAdditiveTermDoc(d: AdditiveTermData): Promise<TDocumentDefinitions> {
  const header = await ifceHeader()

  const concedente = dataTable(
    ['60%', '40%'],
    [
      [cell('Concedente (Razão Social)', v(d.company_name)), cell('CNPJ', v(d.company_cnpj))],
      [cell('Endereço', v(d.company_address), { colSpan: 2 }), {}],
      [
        cell('Representante Legal', v(d.company_representative)),
        cell('Cargo', v(d.company_representative_role)),
      ],
    ]
  )

  const discente = dataTable(
    ['40%', '20%', '40%'],
    [
      [
        cell('Discente', v(d.student_name)),
        cell('CPF', v(d.student_cpf)),
        cell('Matrícula', v(d.student_enrollment)),
      ],
      [
        cell('Curso', v(d.student_course)),
        cell('Telefone', v(d.student_phone)),
        cell('Endereço', v(d.student_address)),
      ],
    ]
  )

  const objeto: Content = dataTable(
    ['*'],
    [
      [
        {
          text: ADDITIVE_TYPES.map((t) => `(${isChecked(d[t.key]) ? 'X' : ' '}) ${t.label}`).join(
            '     '
          ),
          fontSize: 8,
          margin: [4, 4, 4, 4],
        } as TableCell,
      ],
    ]
  )

  const alteracoes: Content[] = []

  if (isChecked(d.additive_type_prorogation)) {
    alteracoes.push(sectionTitle('Prorrogação de Vigência'))
    alteracoes.push(
      dataTable(
        ['50%', '50%'],
        [
          [
            cell('Nova Data de Término', fmtDate(d.new_end_date)),
            cell('Período de Prorrogação', v(d.extension_period)),
          ],
        ]
      )
    )
  }

  if (isChecked(d.additive_type_allowance)) {
    alteracoes.push(sectionTitle('Alteração do Valor da Bolsa'))
    alteracoes.push(
      dataTable(
        ['50%', '50%'],
        [
          [
            cell('Novo Valor da Bolsa (R$)', v(d.new_allowance_value)),
            cell('Novo Auxílio-Transporte (R$)', v(d.new_transport_aid)),
          ],
        ]
      )
    )
  }

  if (isChecked(d.additive_type_supervisor)) {
    alteracoes.push(sectionTitle('Alteração de Supervisor'))
    alteracoes.push(
      dataTable(
        ['40%', '30%', '30%'],
        [
          [
            cell('Novo Supervisor', v(d.new_supervisor_name)),
            cell('Cargo', v(d.new_supervisor_role)),
            cell('Registro no Conselho', v(d.new_supervisor_council)),
          ],
        ]
      )
    )
  }

  if (isChecked(d.additive_type_schedule)) {
    alteracoes.push(sectionTitle('Alteração de Horário'))
    alteracoes.push(
      dataTable(
        ['30%', '70%'],
        [
          [
            cell('Nova C.H. Semanal', d.new_weekly_hours ? `${d.new_weekly_hours} h` : ''),
            cell('Novo Horário', v(d.new_schedule)),
          ],
        ]
      )
    )
  }

  if (isChecked(d.additive_type_other)) {
    alteracoes.push(...sectionBlock('Outras Alterações', v(d.other_changes) || ' '))
  }

  const localData: Content = {
    text: `${d.campus_city?.trim() || '____________________'}, ____ de ____________________ de ________.`,
    alignment: 'right',
    fontSize: 8,
    margin: [0, 8, 0, 0],
  }

  const signatures = sigBlock(
    [
      withName(d.company_representative, 'Representante da Concedente'),
      'Supervisor do Estágio',
      withName(d.student_name, 'Discente Estagiário'),
      withName(d.campus_director, 'Diretor(a) do Campus – IFCE'),
    ],
    'As demais cláusulas do Termo de Compromisso permanecem inalteradas.'
  )

  const content: Content[] = [
    ...header,
    docTitle('Termo Aditivo ao Termo de Compromisso de Estágio'),
    sectionTitle('Identificação das Partes'),
    concedente,
    discente,
    sectionTitle('Objeto do Aditivo'),
    objeto,
    ...alteracoes,
    ...sectionBlock('Motivo do Aditivo', v(d.additive_reason) || ' '),
    ...sectionBlock('Justificativa', v(d.justification) || ' '),
    localData,
    ...signatures,
  ]

  return { content }
}
