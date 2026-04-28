import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces'
import { ifceHeader, docTitle, dataTable, cell, emptyCell, sigBlock, fmtDate, v } from '@/lib/pdfmake-base-service'

export interface InternshipRegistrationRequestData {
  nome?: string
  cpf?: string
  nome_social?: string
  curso?: string
  matricula?: string
  endereco?: string
  bairro?: string
  municipio_uf?: string
  cep?: string
  telefone?: string
  email_institucional?: string
  email_pessoal?: string
  cor_raca?: string
  etnia?: string
  deficiencia?: string[]
  nome_fantasia_pf?: string
  cnpj_registro_conselho?: string
  endereco_pf?: string
  bairro_pf?: string
  municipio_uf_pf?: string
  cep_pf?: string
  telefone_pf?: string
  email_pf?: string
  responsavel_legal?: string
  cargo_qualificacao?: string
  cpf_responsavel?: string
  telefone_responsavel?: string
  supervisor_nome?: string
  supervisor_cargo?: string
  setor_realizacao?: string
  tipo_estagio?: string
  forma_estagio?: string
  data_inicial?: string
  carga_horaria_semanal?: string
  data_final_prevista?: string
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

export async function buildInternshipRegistrationRequestDoc(d: InternshipRegistrationRequestData): Promise<TDocumentDefinitions> {
  const header = await ifceHeader()

  const studentTable = dataTable(
    ['35%', '20%', '20%', '25%'],
    [
      [cell('Nome Completo', v(d.nome), { colSpan: 2 }), emptyCell(), cell('CPF', v(d.cpf)), cell('Matrícula', v(d.matricula))],
      [cell('Nome Social', v(d.nome_social)), cell('Curso', v(d.curso)), cell('Telefone', v(d.telefone)), cell('CEP', v(d.cep))],
      [cell('Endereço', v(d.endereco), { colSpan: 2 }), emptyCell(), cell('Bairro', v(d.bairro)), cell('Município/UF', v(d.municipio_uf))],
      [cell('E-mail Institucional', v(d.email_institucional), { colSpan: 2 }), emptyCell(), cell('E-mail Pessoal', v(d.email_pessoal), { colSpan: 2 }), emptyCell()],
    ]
  )

  const corRacaText = COR_RACA_LABEL[d.cor_raca ?? ''] ?? v(d.cor_raca)
  const etniaText = ETNIA_LABEL[d.etnia ?? ''] ?? v(d.etnia)
  const defText = (d.deficiencia ?? []).map((k) => DEF_LABELS[k] ?? k).join(', ') || 'Nenhuma'

  const complementTable = dataTable(
    ['33%', '33%', '34%'],
    [[cell('Cor/Raça', corRacaText), cell('Etnia', etniaText), cell('Deficiência', defText)]]
  )

  const companyTable = dataTable(
    ['35%', '25%', '20%', '20%'],
    [
      [cell('Nome Fantasia / Razão Social', v(d.nome_fantasia_pf), { colSpan: 2 }), emptyCell(), cell('CNPJ / Registro', v(d.cnpj_registro_conselho)), cell('Telefone', v(d.telefone_pf))],
      [cell('Endereço', v(d.endereco_pf), { colSpan: 2 }), emptyCell(), cell('Bairro', v(d.bairro_pf)), cell('Município/UF', v(d.municipio_uf_pf))],
      [cell('E-mail', v(d.email_pf), { colSpan: 4 }), emptyCell(), emptyCell(), emptyCell()],
    ]
  )

  const legalTable = dataTable(
    ['35%', '25%', '20%', '20%'],
    [
      [cell('Responsável Legal', v(d.responsavel_legal)), cell('Cargo/Qualificação', v(d.cargo_qualificacao)), cell('CPF', v(d.cpf_responsavel)), cell('Telefone', v(d.telefone_responsavel))],
      [cell('Supervisor', v(d.supervisor_nome)), cell('Cargo', v(d.supervisor_cargo)), cell('Setor de Realização', v(d.setor_realizacao), { colSpan: 2 }), emptyCell()],
    ]
  )

  const typeText = d.tipo_estagio === 'obrigatorio'
    ? '(X) Obrigatório  ( ) Não Obrigatório'
    : '( ) Obrigatório  (X) Não Obrigatório'
  const modeText = d.forma_estagio === 'presencial'
    ? '(X) Presencial  ( ) Remoto'
    : '( ) Presencial  (X) Remoto'

  const internshipTable = dataTable(
    ['35%', '25%', '20%', '20%'],
    [[
      cell('Tipo', typeText),
      cell('Forma', modeText),
      cell('Data Inicial', fmtDate(d.data_inicial)),
      cell('Data Final Prevista', fmtDate(d.data_final_prevista)),
    ]]
  )

  const content: Content[] = [
    ...header,
    docTitle('Solicitação de Cadastro no Estágio'),
    dataTable(['*'], [[cell('1. DADOS PESSOAIS DO DISCENTE', '')]]),
    studentTable,
    complementTable,
    dataTable(['*'], [[cell('2. UNIDADE CONCEDENTE / EMPRESA', '')]]),
    companyTable,
    dataTable(['*'], [[cell('3. RESPONSÁVEL LEGAL E SUPERVISOR', '')]]),
    legalTable,
    dataTable(['*'], [[cell('4. INFORMAÇÕES DO ESTÁGIO', '')]]),
    internshipTable,
    ...sigBlock(
      ['Discente', 'Responsável Legal', 'Supervisor do Estágio'],
      'Declaro que as informações acima são verdadeiras e me comprometo a atualizá-las quando necessário.'
    ),
  ]

  return { content }
}
