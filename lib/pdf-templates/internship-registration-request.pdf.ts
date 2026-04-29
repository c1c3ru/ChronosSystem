import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces'
import { ifceHeader, docTitle, dataTable, cell, emptyCell, sectionBlock, sectionTitle, sigBlock, fmtDate, v } from '@/lib/pdfmake-base-service'

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
  comunidade_etnia?: string
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
  activities?: string
  // Quadro de Horários (Início/Fim)
  horarios?: {
    segunda_feira?: { inicio?: string; final?: string }
    terca_feira?: { inicio?: string; final?: string }
    quarta_feira?: { inicio?: string; final?: string }
    quinta_feira?: { inicio?: string; final?: string }
    sexta_feira?: { inicio?: string; final?: string }
    sabado?: { inicio?: string; final?: string }
    domingo?: { inicio?: string; final?: string }
  }
  // Turnos (Escolaridade)
  turnos?: {
    primeira?: { segunda?: string }
    segunda?: { segunda?: string }
    terceira?: { segunda?: string }
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

export async function buildInternshipRegistrationRequestDoc(d: InternshipRegistrationRequestData): Promise<TDocumentDefinitions> {
  const header = await ifceHeader()

  const studentTable = dataTable(
    ['35%', '20%', '20%', '25%'],
    [
      [cell('Nome Completo', v(d.nome), { colSpan: 2 }), emptyCell(), cell('CPF', v(d.cpf)), cell('Matrícula', v(d.matricula))],
      [cell('Nome Social', v(d.nome_social)), cell('Curso', v(d.curso)), cell('Telefone', v(d.telefone)), cell('CEP', v(d.cep))],
      [cell('Endereço', v(d.endereco), { colSpan: 2 }), emptyCell(), cell('Bairro', v(d.bairro)), cell('Município/UF', v(d.municipio_uf))],
      [cell('CEP', v(d.cep)), cell('Telefone', v(d.telefone)), cell('E-mail Institucional', v(d.email_institucional)), cell('E-mail Pessoal', v(d.email_pessoal))],
    ]
  )

  const corRacaText = COR_RACA_LABEL[d.cor_raca ?? ''] ?? v(d.cor_raca)
  const etniaText = ETNIA_LABEL[d.etnia ?? ''] ?? v(d.etnia)
  const defText = (d.deficiencia ?? []).map((k) => DEF_LABELS[k] ?? k).join(', ') || 'Nenhuma'

  const complementTable = dataTable(
    ['25%', '25%', '25%', '25%'],
    [[cell('Cor/Raça', corRacaText), cell('Etnia', etniaText), cell('Comunidade', v(d.comunidade_etnia)), cell('Deficiência', defText)]]
  )

  const companyTable = dataTable(
    ['35%', '25%', '20%', '20%'],
    [
      [cell('Nome Fantasia / Razão Social', v(d.nome_fantasia_pf), { colSpan: 2 }), emptyCell(), cell('CNPJ / Registro', v(d.cnpj_registro_conselho)), cell('Telefone', v(d.telefone_pf))],
      [cell('Endereço', v(d.endereco_pf), { colSpan: 2 }), emptyCell(), cell('Bairro', v(d.bairro_pf)), cell('Município/UF', v(d.municipio_uf_pf))],
      [cell('CEP', v(d.cep_pf)), cell('E-mail', v(d.email_pf), { colSpan: 3 }), emptyCell(), emptyCell()],
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
    sectionTitle('1. DADOS PESSOAIS DO DISCENTE'),
    studentTable,
    sectionTitle('2. COR/RAÇA E ETNIA'),
    complementTable,
    sectionTitle('3. INFORMAÇÕES DO ESTÁGIO'),
    internshipTable,
    sectionTitle('4. UNIDADE CONCEDENTE / EMPRESA'),
    companyTable,
    sectionTitle('5. RESPONSÁVEL LEGAL E SUPERVISOR'),
    legalTable,
    sectionTitle('6. HORÁRIOS E ESCOLARIDADE'),
    { text: 'JORNADA DE ATIVIDADE (HORÁRIOS DE INÍCIO E FIM)', style: 'cellLabel', margin: [0, 4, 0, 2], bold: true },
    dataTable(
      ['16%', '12%', '12%', '12%', '12%', '12%', '12%', '12%'],
      [
        [
          { text: 'PERÍODO', style: 'tableHeader', alignment: 'center' },
          { text: 'SEG', style: 'tableHeader', alignment: 'center' },
          { text: 'TER', style: 'tableHeader', alignment: 'center' },
          { text: 'QUA', style: 'tableHeader', alignment: 'center' },
          { text: 'QUI', style: 'tableHeader', alignment: 'center' },
          { text: 'SEX', style: 'tableHeader', alignment: 'center' },
          { text: 'SÁB', style: 'tableHeader', alignment: 'center' },
          { text: 'DOM', style: 'tableHeader', alignment: 'center' },
        ],
        [
          { text: 'Início', style: 'cellLabel', margin: [0, 2] },
          { text: v(d.horarios?.segunda_feira?.inicio), style: 'cellValue', alignment: 'center' },
          { text: v(d.horarios?.terca_feira?.inicio), style: 'cellValue', alignment: 'center' },
          { text: v(d.horarios?.quarta_feira?.inicio), style: 'cellValue', alignment: 'center' },
          { text: v(d.horarios?.quinta_feira?.inicio), style: 'cellValue', alignment: 'center' },
          { text: v(d.horarios?.sexta_feira?.inicio), style: 'cellValue', alignment: 'center' },
          { text: v(d.horarios?.sabado?.inicio), style: 'cellValue', alignment: 'center' },
          { text: v(d.horarios?.domingo?.inicio), style: 'cellValue', alignment: 'center' },
        ],
        [
          { text: 'Fim', style: 'cellLabel', margin: [0, 2] },
          { text: v(d.horarios?.segunda_feira?.final), style: 'cellValue', alignment: 'center' },
          { text: v(d.horarios?.terca_feira?.final), style: 'cellValue', alignment: 'center' },
          { text: v(d.horarios?.quarta_feira?.final), style: 'cellValue', alignment: 'center' },
          { text: v(d.horarios?.quinta_feira?.final), style: 'cellValue', alignment: 'center' },
          { text: v(d.horarios?.sexta_feira?.final), style: 'cellValue', alignment: 'center' },
          { text: v(d.horarios?.sabado?.final), style: 'cellValue', alignment: 'center' },
          { text: v(d.horarios?.domingo?.final), style: 'cellValue', alignment: 'center' },
        ],
      ]
    ),
    { text: 'ESCOLARIDADE (INFORMAR O ESTÁGIO DO TURNO DAS AULAS)', style: 'cellLabel', margin: [0, 4, 0, 2], bold: true },
    dataTable(
      ['33%', '33%', '34%'],
      [
        [
          { text: '1ª Opção', style: 'tableHeader', alignment: 'center' },
          { text: '2ª Opção', style: 'tableHeader', alignment: 'center' },
          { text: '3ª Opção', style: 'tableHeader', alignment: 'center' },
        ],
        [
          { text: v(d.turnos?.primeira?.segunda), style: 'cellValue', alignment: 'center' },
          { text: v(d.turnos?.segunda?.segunda), style: 'cellValue', alignment: 'center' },
          { text: v(d.turnos?.terceira?.segunda), style: 'cellValue', alignment: 'center' },
        ],
      ]
    ),
    ...sectionBlock('DESCRIÇÃO DAS ATIVIDADES', v(d.activities)),
    ...sigBlock(
      ['Discente', 'Responsável Legal', 'Supervisor do Estágio'],
      'Declaro que as informações acima são verdadeiras e me comprometo a atualizá-las quando necessário.',
      fmtDate(d.solicitation_date),
      fmtDate(d.authorization_date)
    ),
  ]

  return { content }
}
