/**
 * commitment-term.pdf.ts
 *
 * Template pdfmake do "Termo de Compromisso de Estágio" (IFCE).
 *
 * USO:
 *   import { buildCommitmentTermDoc } from '@/lib/pdf-templates/commitment-term.pdf'
 *   import { generatePDF } from '@/lib/pdfmake-base-service'
 *
 *   const doc = await buildCommitmentTermDoc(formData)
 *   await generatePDF(doc, { filename: 'termo-compromisso.pdf' })
 */

import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces'
import {
  ifceHeader,
  docTitle,
  cell,
  emptyCell,
  dataTable,
  sectionBlock,
  sigBlock,
  fmtDate,
  v,
} from '@/lib/pdfmake-base-service'

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface CommitmentTermData {
  // Instituição Concedente
  company_name?: string
  company_fantasy_name?: string
  company_cnpj?: string
  company_address?: string
  company_neighborhood?: string
  company_city_state?: string
  company_zip?: string
  company_phone?: string
  company_email?: string
  company_representative?: string
  company_representative_role?: string
  company_representative_cpf?: string
  company_representative_phone?: string

  // Discente
  student_name?: string
  student_cpf?: string
  student_social_name?: string
  student_course?: string
  student_id?: string
  student_address?: string
  student_neighborhood?: string
  student_city_state?: string
  student_zip?: string
  student_phone?: string
  student_email_institutional?: string
  student_email_personal?: string

  // Estágio
  modality?: string   // presencial | remota | hibrida
  start_date?: string
  end_date?: string
  weekly_hours?: string
  insurance_policy?: string
  insurance_company?: string
  grant_value?: string
  transport_value?: string
  has_grant?: string
  has_transport?: string

  // Orientador
  advisor_name?: string
  advisor_siape?: string
  advisor_phone?: string
  advisor_email?: string

  // Supervisor
  supervisor_name?: string
  supervisor_education?: string
  supervisor_cpf?: string
  supervisor_phone?: string
  supervisor_email?: string

  // Plano
  activities_description?: string
  expected_results?: string
}

// ─── HELPERS LOCAIS ───────────────────────────────────────────────────────────

function modalityLabel(m?: string): string {
  if (m === 'remota') return '( ) Presencial  (X) Remota  ( ) Híbrida'
  if (m === 'hibrida') return '( ) Presencial  ( ) Remota  (X) Híbrida'
  return '(X) Presencial  ( ) Remota  ( ) Híbrida'
}

// ─── BUILDER ─────────────────────────────────────────────────────────────────

export async function buildCommitmentTermDoc(d: CommitmentTermData): Promise<TDocumentDefinitions> {
  const header = await ifceHeader()

  // ── 1. Instituição Concedente ─────────────────────────────────────────────
  const companySection: Content = {
    stack: [
      {
        table: {
          widths: ['*'],
          body: [[{
            text: '1. INSTITUIÇÃO CONCEDENTE',
            style: 'sectionBar',
            margin: [4, 2, 4, 2] as [number, number, number, number],
            border: [true, true, true, true] as [boolean, boolean, boolean, boolean],
          }]],
        },
        layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5, hLineColor: () => '#000000', vLineColor: () => '#000000' },
        margin: [0, 4, 0, 0] as [number, number, number, number],
      },
      dataTable(
        ['50%', '25%', '25%'],
        [
          [
            cell('Razão Social', v(d.company_name)),
            cell('Nome Fantasia', v(d.company_fantasy_name)),
            cell('CNPJ', v(d.company_cnpj)),
          ],
          [
            cell('Endereço', v(d.company_address)),
            cell('Bairro', v(d.company_neighborhood)),
            cell('CEP', v(d.company_zip)),
          ],
          [
            cell('Município-UF', v(d.company_city_state)),
            cell('Telefone', v(d.company_phone)),
            cell('E-mail', v(d.company_email)),
          ],
        ]
      ),
      // Sub-seção representante
      {
        table: {
          widths: ['*'],
          body: [[{
            text: 'REPRESENTANTE LEGAL',
            style: 'sectionBar',
            margin: [4, 2, 4, 2] as [number, number, number, number],
            border: [true, true, true, true] as [boolean, boolean, boolean, boolean],
          }]],
        },
        layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5, hLineColor: () => '#000000', vLineColor: () => '#000000' },
        margin: [0, 0, 0, 0] as [number, number, number, number],
      },
      dataTable(
        ['40%', '25%', '20%', '15%'],
        [[
          cell('Nome', v(d.company_representative)),
          cell('Cargo', v(d.company_representative_role)),
          cell('CPF', v(d.company_representative_cpf)),
          cell('Telefone', v(d.company_representative_phone)),
        ]]
      ),
    ],
  }

  // ── 2. Discente ───────────────────────────────────────────────────────────
  const studentSection: Content = {
    stack: [
      {
        table: {
          widths: ['*'],
          body: [[{
            text: '2. DISCENTE ESTAGIÁRIO(A)',
            style: 'sectionBar',
            margin: [4, 2, 4, 2] as [number, number, number, number],
            border: [true, true, true, true] as [boolean, boolean, boolean, boolean],
          }]],
        },
        layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5, hLineColor: () => '#000000', vLineColor: () => '#000000' },
        margin: [0, 4, 0, 0] as [number, number, number, number],
      },
      dataTable(
        ['35%', '20%', '20%', '25%'],
        [
          [
            cell('Nome Completo', v(d.student_name)),
            cell('CPF', v(d.student_cpf)),
            cell('Matrícula', v(d.student_id)),
            cell('Curso', v(d.student_course)),
          ],
          [
            cell('Nome Social', v(d.student_social_name), { colSpan: 2 }),
            emptyCell(),
            cell('Telefone', v(d.student_phone)),
            cell('CEP', v(d.student_zip)),
          ],
          [
            cell('Endereço', v(d.student_address)),
            cell('Bairro', v(d.student_neighborhood)),
            cell('Município-UF', v(d.student_city_state), { colSpan: 2 }),
            emptyCell(),
          ],
          [
            cell('E-mail Institucional', v(d.student_email_institutional), { colSpan: 2 }),
            emptyCell(),
            cell('E-mail Pessoal', v(d.student_email_personal), { colSpan: 2 }),
            emptyCell(),
          ],
        ]
      ),
    ],
  }

  // ── 3. Detalhes do Estágio ────────────────────────────────────────────────
  const internshipSection: Content = {
    stack: [
      {
        table: {
          widths: ['*'],
          body: [[{
            text: '3. DETALHES DO ESTÁGIO',
            style: 'sectionBar',
            margin: [4, 2, 4, 2] as [number, number, number, number],
            border: [true, true, true, true] as [boolean, boolean, boolean, boolean],
          }]],
        },
        layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5, hLineColor: () => '#000000', vLineColor: () => '#000000' },
        margin: [0, 4, 0, 0] as [number, number, number, number],
      },
      dataTable(
        ['40%', '20%', '20%', '20%'],
        [
          [
            cell('Modalidade', modalityLabel(d.modality)),
            cell('Data Início', fmtDate(d.start_date)),
            cell('Data Fim', fmtDate(d.end_date)),
            cell('C.H. Semanal', d.weekly_hours ? `${v(d.weekly_hours)} h` : ''),
          ],
          [
            cell('Bolsa Auxílio (R$)', d.has_grant === 'true' ? v(d.grant_value) : 'Não'),
            cell('Aux. Transporte (R$)', d.has_transport === 'true' ? v(d.transport_value) : 'Não'),
            cell('Nº Apólice de Seguro', v(d.insurance_policy)),
            cell('Seguradora', v(d.insurance_company)),
          ],
        ]
      ),
    ],
  }

  // ── 4. Orientador ─────────────────────────────────────────────────────────
  const advisorSection: Content = {
    stack: [
      {
        table: {
          widths: ['*'],
          body: [[{
            text: '4. DOCENTE ORIENTADOR (IFCE)',
            style: 'sectionBar',
            margin: [4, 2, 4, 2] as [number, number, number, number],
            border: [true, true, true, true] as [boolean, boolean, boolean, boolean],
          }]],
        },
        layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5, hLineColor: () => '#000000', vLineColor: () => '#000000' },
        margin: [0, 4, 0, 0] as [number, number, number, number],
      },
      dataTable(
        ['40%', '20%', '20%', '20%'],
        [[
          cell('Nome', v(d.advisor_name)),
          cell('SIAPE', v(d.advisor_siape)),
          cell('Telefone', v(d.advisor_phone)),
          cell('E-mail', v(d.advisor_email)),
        ]]
      ),
    ],
  }

  // ── 5. Supervisor ─────────────────────────────────────────────────────────
  const supervisorSection: Content = {
    stack: [
      {
        table: {
          widths: ['*'],
          body: [[{
            text: '5. SUPERVISOR DO ESTÁGIO (EMPRESA)',
            style: 'sectionBar',
            margin: [4, 2, 4, 2] as [number, number, number, number],
            border: [true, true, true, true] as [boolean, boolean, boolean, boolean],
          }]],
        },
        layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5, hLineColor: () => '#000000', vLineColor: () => '#000000' },
        margin: [0, 4, 0, 0] as [number, number, number, number],
      },
      dataTable(
        ['30%', '25%', '20%', '25%'],
        [[
          cell('Nome', v(d.supervisor_name)),
          cell('Formação/Experiência', v(d.supervisor_education)),
          cell('CPF', v(d.supervisor_cpf)),
          cell('Telefone', v(d.supervisor_phone)),
        ]]
      ),
      dataTable(
        ['*'],
        [[cell('E-mail', v(d.supervisor_email))]]
      ),
    ],
  }

  // ── 6. Plano de Atividades ────────────────────────────────────────────────
  const activitiesSection: Content[] = [
    ...sectionBlock('6. PLANO DE ATIVIDADES — ATIVIDADES A DESENVOLVER', v(d.activities_description)),
    ...sectionBlock('RESULTADOS ESPERADOS', v(d.expected_results)),
  ]

  // ── Assinaturas ───────────────────────────────────────────────────────────
  const signatures = sigBlock(
    ['Supervisor do Estágio', 'Discente Estagiário', 'Coordenador de Estágios'],
    'Pelo presente Termo de Compromisso, as partes ajustam o estágio nas condições acima.'
  )

  // ── Montagem final ────────────────────────────────────────────────────────
  const content: Content[] = [
    ...header,
    docTitle('Termo de Compromisso de Estágio'),
    companySection,
    studentSection,
    internshipSection,
    advisorSection,
    supervisorSection,
    ...activitiesSection,
    ...signatures,
  ]

  return { content }
}
