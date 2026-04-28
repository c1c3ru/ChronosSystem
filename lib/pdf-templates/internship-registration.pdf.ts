import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces'
import { ifceHeader, docTitle, dataTable, cell, emptyCell, sectionBlock, sigBlock, fmtDate, v } from '@/lib/pdfmake-base-service'

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
  student_disability?: string
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
}

function chkRace(selected: string | undefined, value: string) {
  return selected === value ? '(X)' : '( )'
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

  const raceText = [
    `${chkRace(d.student_race, 'amarelo')} Amarelo`,
    `${chkRace(d.student_race, 'branco')} Branco`,
    `${chkRace(d.student_race, 'indigena')} Indígena`,
    `${chkRace(d.student_race, 'pardo')} Pardo`,
    `${chkRace(d.student_race, 'preto')} Preto`,
    `${chkRace(d.student_race, 'nao_declarar')} Prefiro não declarar`,
  ].join('   ')

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
    docTitle('Solicitação de Cadastro no Estágio'),
    ...sectionBlock('1. DADOS DO DISCENTE'),
    studentTable,
    dataTable(['*'], [[cell('COR/RAÇA', raceText)]]),
    ...sectionBlock('2. INSTITUIÇÃO CONCEDENTE'),
    companyTable,
    ...sectionBlock('3. INFORMAÇÕES DO ESTÁGIO'),
    internshipTable,
    ...sigBlock(['Discente', 'Responsável Legal', 'Supervisor do Estágio'],
      'Declaro que as informações acima são verdadeiras.'),
  ]

  return { content }
}
