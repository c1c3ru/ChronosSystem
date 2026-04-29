import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces'
import { ifceHeader, docTitle, dataTable, cell, emptyCell, sectionBlock, sectionTitle, sigBlock, fmtDate, v } from '@/lib/pdfmake-base-service'

export interface InternshipRegistrationData {
  student_name?: string
  student_social_name?: string
  student_course?: string
  student_enrollment?: string
  student_cpf?: string
  student_email_institutional?: string
  student_email_personal?: string
  student_phone?: string
  student_address?: string
  student_neighborhood?: string
  student_city_uf?: string
  student_zip?: string
  student_race?: string
  student_ethnicity?: string
  student_ethnicity_community?: string
  student_disability?: string[]
  company_name?: string
  company_fantasy_name?: string
  company_cnpj?: string
  company_phone?: string
  company_address?: string
  company_neighborhood?: string
  company_city_uf?: string
  company_zip?: string
  company_email?: string
  company_representative?: string
  company_representative_role?: string
  company_representative_cpf?: string
  company_representative_phone?: string
  company_supervisor?: string
  company_supervisor_role?: string
  company_supervisor_cpf?: string
  company_supervisor_phone?: string
  company_sector?: string
  internship_type?: string
  internship_mode?: string
  start_date?: string
  end_date?: string
  weekly_hours?: string
  // Quadro de Horários
  schedule?: {
    mon?: { morning?: string; afternoon?: string; evening?: string }
    tue?: { morning?: string; afternoon?: string; evening?: string }
    wed?: { morning?: string; afternoon?: string; evening?: string }
    thu?: { morning?: string; afternoon?: string; evening?: string }
    fri?: { morning?: string; afternoon?: string; evening?: string }
    sat?: { morning?: string; afternoon?: string; evening?: string }
  }
  solicitation_date?: string
  authorization_date?: string
}

const COR_RACA_LABEL: Record<string, string> = {
  amarelo: 'Amarelo(a)',
  branco: 'Branco(a)',
  indigena: 'Indígena',
  pardo: 'Pardo(a)',
  preto: 'Preto(a)',
  nao_declarar: 'Prefiro não declarar',
}

const ETNIA_LABEL: Record<string, string> = {
  indigena: 'Indígena',
  quilombola: 'Quilombola',
  outra: 'Outra',
  nao_declarar: 'Prefiro não declarar',
}

const DEF_LABELS: Record<string, string> = {
  alta_habilidade: 'Alta habilidade/superdotação',
  auditiva: 'Def. auditiva',
  intelectual: 'Def. intelectual',
  motora: 'Def. motora',
  visual_baixa: 'Def. visual/baixa visão',
  visual: 'Def. visual',
  surdocegueira: 'Surdocegueira',
}

export async function buildInternshipRegistrationDoc(d: InternshipRegistrationData): Promise<TDocumentDefinitions> {
  const header = await ifceHeader()

  const studentTable = dataTable(
    ['35%', '20%', '20%', '25%'],
    [
      [cell('Nome Completo', v(d.student_name), { colSpan: 2 }), emptyCell(), cell('CPF', v(d.student_cpf)), cell('Matrícula', v(d.student_enrollment))],
      [cell('Nome Social', v(d.student_social_name)), cell('Curso', v(d.student_course)), cell('Telefone', v(d.student_phone)), cell('CEP', v(d.student_zip))],
      [cell('Endereço', v(d.student_address), { colSpan: 2 }), emptyCell(), cell('Bairro', v(d.student_neighborhood)), cell('Município/UF', v(d.student_city_uf))],
      [cell('E-mail Institucional', v(d.student_email_institutional), { colSpan: 2 }), emptyCell(), cell('E-mail Pessoal', v(d.student_email_personal), { colSpan: 2 }), emptyCell()],
    ]
  )

  const raceText = COR_RACA_LABEL[d.student_race ?? ''] ?? v(d.student_race)
  const etniaText = ETNIA_LABEL[d.student_ethnicity ?? ''] ?? v(d.student_ethnicity)
  const defText = (d.student_disability ?? []).map((k) => DEF_LABELS[k] ?? k).join(', ') || 'Nenhuma'

  const complementTable = dataTable(
    ['33%', '33%', '34%'],
    [[cell('Cor/Raça', raceText), cell('Etnia', etniaText), cell('Deficiência', defText)]]
  )

  const companyTable = dataTable(
    ['35%', '25%', '20%', '20%'],
    [
      [cell('Razão Social', v(d.company_name), { colSpan: 2 }), emptyCell(), cell('CNPJ', v(d.company_cnpj)), cell('Telefone', v(d.company_phone))],
      [cell('Endereço', v(d.company_address), { colSpan: 2 }), emptyCell(), cell('Bairro', v(d.company_neighborhood)), cell('Município/UF', v(d.company_city_uf))],
      [cell('Responsável Legal', v(d.company_representative)), cell('Cargo', v(d.company_representative_role)), cell('CPF', v(d.company_representative_cpf)), cell('Telefone', v(d.company_representative_phone))],
      [cell('Supervisor', v(d.company_supervisor)), cell('Cargo', v(d.company_supervisor_role)), cell('Setor', v(d.company_sector)), cell('CPF', v(d.company_supervisor_cpf))],
    ]
  )

  const typeText = d.internship_type === 'obrigatorio'
    ? '(X) Obrigatório  ( ) Não Obrigatório'
    : '( ) Obrigatório  (X) Não Obrigatório'
  const modeText = d.internship_mode === 'presencial'
    ? '(X) Presencial  ( ) Remoto'
    : '( ) Presencial  (X) Remoto'

  const internshipTable = dataTable(
    ['40%', '30%', '15%', '15%'],
    [[
      cell('Tipo', typeText),
      cell('Forma', modeText),
      cell('Início', fmtDate(d.start_date)),
      cell('Fim', fmtDate(d.end_date)),
    ]]
  )

  const content: Content[] = [
    ...header,
    docTitle('Ficha de Cadastro no Estágio'),
    sectionTitle('1. DADOS DO DISCENTE'),
    studentTable,
    sectionTitle('2. INFORMAÇÕES COMPLEMENTARES'),
    complementTable,
    sectionTitle('3. INSTITUIÇÃO CONCEDENTE'),
    companyTable,
    sectionTitle('4. INFORMAÇÕES DO ESTÁGIO'),
    internshipTable,
    { text: 'QUADRO DE HORÁRIOS', style: 'cellLabel', margin: [0, 4, 0, 2], bold: true },
    dataTable(
      ['16%', '14%', '14%', '14%', '14%', '14%', '14%'],
      [
        [
          { text: 'TURNO', style: 'tableHeader', alignment: 'center' },
          { text: 'SEG', style: 'tableHeader', alignment: 'center' },
          { text: 'TER', style: 'tableHeader', alignment: 'center' },
          { text: 'QUA', style: 'tableHeader', alignment: 'center' },
          { text: 'QUI', style: 'tableHeader', alignment: 'center' },
          { text: 'SEX', style: 'tableHeader', alignment: 'center' },
          { text: 'SÁB', style: 'tableHeader', alignment: 'center' },
        ],
        [
          { text: '1º Turno', style: 'cellLabel', margin: [0, 2] },
          { text: v(d.schedule?.mon?.morning), style: 'cellValue', alignment: 'center' },
          { text: v(d.schedule?.tue?.morning), style: 'cellValue', alignment: 'center' },
          { text: v(d.schedule?.wed?.morning), style: 'cellValue', alignment: 'center' },
          { text: v(d.schedule?.thu?.morning), style: 'cellValue', alignment: 'center' },
          { text: v(d.schedule?.fri?.morning), style: 'cellValue', alignment: 'center' },
          { text: v(d.schedule?.sat?.morning), style: 'cellValue', alignment: 'center' },
        ],
        [
          { text: '2º Turno', style: 'cellLabel', margin: [0, 2] },
          { text: v(d.schedule?.mon?.afternoon), style: 'cellValue', alignment: 'center' },
          { text: v(d.schedule?.tue?.afternoon), style: 'cellValue', alignment: 'center' },
          { text: v(d.schedule?.wed?.afternoon), style: 'cellValue', alignment: 'center' },
          { text: v(d.schedule?.thu?.afternoon), style: 'cellValue', alignment: 'center' },
          { text: v(d.schedule?.fri?.afternoon), style: 'cellValue', alignment: 'center' },
          { text: v(d.schedule?.sat?.afternoon), style: 'cellValue', alignment: 'center' },
        ],
        [
          { text: '3º Turno', style: 'cellLabel', margin: [0, 2] },
          { text: v(d.schedule?.mon?.evening), style: 'cellValue', alignment: 'center' },
          { text: v(d.schedule?.tue?.evening), style: 'cellValue', alignment: 'center' },
          { text: v(d.schedule?.wed?.evening), style: 'cellValue', alignment: 'center' },
          { text: v(d.schedule?.thu?.evening), style: 'cellValue', alignment: 'center' },
          { text: v(d.schedule?.fri?.evening), style: 'cellValue', alignment: 'center' },
          { text: v(d.schedule?.sat?.evening), style: 'cellValue', alignment: 'center' },
        ],
      ]
    ),
    ...sigBlock(
      ['Discente', 'Responsável Legal', 'Supervisor do Estágio'],
      'Declaro que as informações acima são verdadeiras.',
      fmtDate(d.solicitation_date),
      fmtDate(d.authorization_date)
    ),
  ]

  return { content }
}
