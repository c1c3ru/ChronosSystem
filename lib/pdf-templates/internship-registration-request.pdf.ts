import type { TDocumentDefinitions, Content, TableCell, Alignment } from 'pdfmake/interfaces'
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
  supervisor_cpf?: string
  supervisor_telefone?: string
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

export async function buildInternshipRegistrationRequestDoc(
  d: InternshipRegistrationRequestData
): Promise<TDocumentDefinitions> {
  const header = await ifceHeader()

  const studentTable = dataTable(
    ['*'],
    [
      [
        {
          columns: [
            cell('NOME', v(d.nome), { border: [false, false, true, true] }),
            cell('CPF', v(d.cpf), { border: [false, false, false, true] }),
          ],
        } as TableCell,
      ],
      [cell('NOME SOCIAL', v(d.nome_social))],
      [
        {
          columns: [
            cell('CURSO', v(d.curso), { border: [false, false, true, true] }),
            cell('MATRÍCULA', v(d.matricula), { border: [false, false, false, true] }),
          ],
        } as TableCell,
      ],
      [cell('ENDEREÇO (LOGRADOURO, NÚMERO E COMPLEMENTO)', v(d.endereco))],
      [
        {
          columns: [
            cell('BAIRRO/DISTRITO', v(d.bairro), { border: [false, false, true, true] }),
            cell('MUNICÍPIO-UF', v(d.municipio_uf), { border: [false, false, true, true] }),
            cell('CEP', v(d.cep), { border: [false, false, false, true] }),
          ],
        } as TableCell,
      ],
      [
        {
          columns: [
            cell('DDD + TELEFONE', v(d.telefone), { border: [false, false, true, true] }),
            cell('E-MAIL INSTITUCIONAL', v(d.email_institucional), {
              border: [false, false, true, true],
            }),
            cell('E-MAIL PESSOAL', v(d.email_pessoal), { border: [false, false, false, true] }),
          ],
        } as TableCell,
      ],
    ]
  )

  const cb = (checked: boolean) => (checked ? '(X)' : '( )')

  const complementTable = dataTable(
    ['33%', '33%', '34%'],
    [
      [
        { text: 'COR/RAÇA', style: 'tableHeader', alignment: 'center' as Alignment },
        { text: 'ETNIA', style: 'tableHeader', alignment: 'center' as Alignment },
        {
          text: 'APENAS PARA PESSOA COM DEFICIÊNCIA (CID e laudo)',
          style: 'tableHeader',
          alignment: 'center' as Alignment,
        },
      ],
      [
        {
          stack: [
            { text: `${cb(d.cor_raca === 'amarelo')} Amarelo(a)`, fontSize: 7 },
            { text: `${cb(d.cor_raca === 'branco')} Branco(a)`, fontSize: 7 },
            { text: `${cb(d.cor_raca === 'indigena')} Indígena`, fontSize: 7 },
            { text: `${cb(d.cor_raca === 'pardo')} Pardo(a)`, fontSize: 7 },
            { text: `${cb(d.cor_raca === 'preto')} Preto(a)`, fontSize: 7 },
            { text: `${cb(d.cor_raca === 'nao_declarar')} Prefiro não declarar`, fontSize: 7 },
          ],
          margin: [2, 2, 2, 2],
        },
        {
          stack: [
            { text: `${cb(d.etnia === 'indigena')} Indígena`, fontSize: 7 },
            { text: `${cb(d.etnia === 'quilombola')} Quilombola`, fontSize: 7 },
            { text: `${cb(d.etnia === 'outra')} Outra ________________`, fontSize: 7 },
            { text: `${cb(d.etnia === 'nao_declarar')} Prefiro não declarar`, fontSize: 7 },
            {
              text: `Informar comunidade se marcar etnia:\n${v(d.comunidade_etnia)}`,
              fontSize: 6,
              italics: true,
              margin: [0, 4, 0, 0],
            },
          ],
          margin: [2, 2, 2, 2],
        },
        {
          stack: [
            {
              text: `${cb(!!d.deficiencia?.includes('alta_habilidade'))} Alta habilidade/superdotação`,
              fontSize: 7,
            },
            {
              text: `${cb(!!d.deficiencia?.includes('auditiva'))} Deficiência auditiva`,
              fontSize: 7,
            },
            {
              text: `${cb(!!d.deficiencia?.includes('intelectual'))} Deficiência intelectual`,
              fontSize: 7,
            },
            { text: `${cb(!!d.deficiencia?.includes('motora'))} Deficiência motora`, fontSize: 7 },
            {
              text: `${cb(!!d.deficiencia?.includes('visual_baixa'))} Deficiência visual/baixa visão`,
              fontSize: 7,
            },
            { text: `${cb(!!d.deficiencia?.includes('visual'))} Deficiência visual`, fontSize: 7 },
            {
              text: `${cb(!!d.deficiencia?.includes('surdocegueira'))} Surdocegueira`,
              fontSize: 7,
            },
          ],
          margin: [2, 2, 2, 2],
        },
      ],
    ]
  )

  const companyTable = dataTable(
    ['*'],
    [
      [{ text: 'RAZÃO SOCIAL', style: 'tableHeader', alignment: 'center' as Alignment }],
      [cell(' ', '')], // Placeholder for social name if needed, usually empty in this doc
      [
        {
          text: 'NOME DE FANTASIA OU DE PESSOA FÍSICA',
          style: 'tableHeader',
          alignment: 'center' as Alignment,
        },
      ],
      [cell(' ', v(d.nome_fantasia_pf))],
      [
        {
          columns: [
            cell('CNPJ OU REGISTRO NO CONSELHO', v(d.cnpj_registro_conselho), {
              border: [false, false, true, true],
            }),
            cell('ENDEREÇO (LOGRADOURO, NÚMERO E COMPLEMENTO)', v(d.endereco_pf), {
              border: [false, false, false, true],
            }),
          ],
        } as TableCell,
      ],
      [
        {
          columns: [
            cell('BAIRRO', v(d.bairro_pf), { border: [false, false, true, true] }),
            cell('MUNICÍPIO-UF', v(d.municipio_uf_pf), { border: [false, false, true, true] }),
            cell('CEP', v(d.cep_pf), { border: [false, false, false, true] }),
          ],
        } as TableCell,
      ],
      [
        {
          columns: [
            cell('DDD + TELEFONE', v(d.telefone_pf), { border: [false, false, true, true] }),
            cell('E-MAIL', v(d.email_pf), { border: [false, false, false, true] }),
          ],
        } as TableCell,
      ],
      [
        {
          text: 'RESPONSÁVEL LEGAL PELA INSTITUIÇÃO PARA ESTE FIM',
          style: 'tableHeader',
          alignment: 'center' as Alignment,
        },
      ],
      [cell(' ', v(d.responsavel_legal))],
      [
        {
          columns: [
            cell('CARGO/QUALIFICAÇÃO', v(d.cargo_qualificacao), {
              border: [false, false, true, true],
            }),
            cell('CPF', v(d.cpf_responsavel), { border: [false, false, true, true] }),
            cell('DDD + TELEFONE', v(d.telefone_responsavel), {
              border: [false, false, false, true],
            }),
          ],
        } as TableCell,
      ],
      [
        {
          text: 'SUPERVISOR DO ESTÁGIO NA INSTITUIÇÃO CONCEDENTE DA VAGA DE ESTÁGIO',
          style: 'tableHeader',
          alignment: 'center' as Alignment,
        },
      ],
      [cell(' ', v(d.supervisor_nome))],
      [
        {
          columns: [
            cell('CARGO/QUALIFICAÇÃO', v(d.supervisor_cargo), {
              border: [false, false, true, true],
            }),
            cell('CPF', ' ', { border: [false, false, true, true] }), // CPF supervisor often not in basic registration
            cell('DDD + TELEFONE', ' ', { border: [false, false, false, true] }),
          ],
        } as TableCell,
      ],
      [cell('SETOR DE REALIZAÇÃO DO ESTÁGIO', v(d.setor_realizacao))],
    ]
  )

  const internshipTable = dataTable(
    ['25%', '25%', '16.6%', '16.6%', '16.8%'],
    [
      [
        { text: 'TIPO DE ESTÁGIO', style: 'tableHeader', alignment: 'center' as Alignment },
        { text: 'FORMA DE ESTÁGIO', style: 'tableHeader', alignment: 'center' as Alignment },
        { text: 'DATA INICIAL', style: 'tableHeader', alignment: 'center' as Alignment },
        { text: 'CARGA HORÁRIA SEMANAL', style: 'tableHeader', alignment: 'center' as Alignment },
        { text: 'DATA FINAL PREVISTA', style: 'tableHeader', alignment: 'center' as Alignment },
      ],
      [
        {
          stack: [
            { text: `${cb(d.tipo_estagio === 'obrigatorio')} OBRIGATÓRIO`, fontSize: 7 },
            { text: `${cb(d.tipo_estagio === 'nao_obrigatorio')} NÃO OBRIGATÓRIO`, fontSize: 7 },
          ],
          margin: [4, 4, 4, 4],
        },
        {
          stack: [
            { text: `${cb(d.forma_estagio === 'presencial')} PRESENCIAL`, fontSize: 7 },
            { text: `${cb(d.forma_estagio === 'remoto')} REMOTO`, fontSize: 7 },
          ],
          margin: [4, 4, 4, 4],
        },
        { text: fmtDate(d.data_inicial), alignment: 'center', margin: [0, 8] },
        { text: `${v(d.carga_horaria_semanal)} HORAS`, alignment: 'center', margin: [0, 8] },
        { text: fmtDate(d.data_final_prevista), alignment: 'center', margin: [0, 8] },
      ],
    ]
  )

  // Quadro de Horários 15 colunas
  const hor = d.horarios || {}
  const scheduleTable = dataTable(
    ['12%', '6%', '6%', '6%', '6%', '6%', '6%', '6%', '6%', '6%', '6%', '6%', '6%', '6%', '6%'],
    [
      [
        {
          text: 'TURNO',
          style: 'tableHeader',
          alignment: 'center' as Alignment,
          rowSpan: 2,
          margin: [0, 8],
        },
        {
          text: 'PREVISÃO DE DISTRIBUIÇÃO DA CARGA HORÁRIA',
          style: 'tableHeader',
          alignment: 'center' as Alignment,
          colSpan: 14,
        },
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
      ],
      [
        {},
        { text: 'SEG-FEIRA', style: 'tableHeader', alignment: 'center' as Alignment, colSpan: 2 },
        {},
        { text: 'TER-FEIRA', style: 'tableHeader', alignment: 'center' as Alignment, colSpan: 2 },
        {},
        { text: 'QUA-FEIRA', style: 'tableHeader', alignment: 'center' as Alignment, colSpan: 2 },
        {},
        { text: 'QUI-FEIRA', style: 'tableHeader', alignment: 'center' as Alignment, colSpan: 2 },
        {},
        { text: 'SEX-FEIRA', style: 'tableHeader', alignment: 'center' as Alignment, colSpan: 2 },
        {},
        { text: 'SÁBADO', style: 'tableHeader', alignment: 'center' as Alignment, colSpan: 2 },
        {},
        { text: 'DOMINGO', style: 'tableHeader', alignment: 'center' as Alignment, colSpan: 2 },
        {},
      ],
      [
        { text: '', style: 'tableHeader' },
        { text: 'INÍCIO', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 },
        { text: 'FIM', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 },
        { text: 'INÍCIO', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 },
        { text: 'FIM', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 },
        { text: 'INÍCIO', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 },
        { text: 'FIM', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 },
        { text: 'INÍCIO', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 },
        { text: 'FIM', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 },
        { text: 'INÍCIO', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 },
        { text: 'FIM', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 },
        { text: 'INÍCIO', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 },
        { text: 'FIM', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 },
        { text: 'INÍCIO', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 },
        { text: 'FIM', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 },
      ],
      [
        { text: '1º', style: 'cellValue', alignment: 'center' as Alignment, fontSize: 7 },
        { text: v(hor.segunda_feira?.inicio), fontSize: 7, alignment: 'center' as Alignment },
        { text: v(hor.segunda_feira?.final), fontSize: 7, alignment: 'center' as Alignment },
        { text: v(hor.terca_feira?.inicio), fontSize: 7, alignment: 'center' as Alignment },
        { text: v(hor.terca_feira?.final), fontSize: 7, alignment: 'center' as Alignment },
        { text: v(hor.quarta_feira?.inicio), fontSize: 7, alignment: 'center' as Alignment },
        { text: v(hor.quarta_feira?.final), fontSize: 7, alignment: 'center' as Alignment },
        { text: v(hor.quinta_feira?.inicio), fontSize: 7, alignment: 'center' as Alignment },
        { text: v(hor.quinta_feira?.final), fontSize: 7, alignment: 'center' as Alignment },
        { text: v(hor.sexta_feira?.inicio), fontSize: 7, alignment: 'center' as Alignment },
        { text: v(hor.sexta_feira?.final), fontSize: 7, alignment: 'center' as Alignment },
        { text: v(hor.sabado?.inicio), fontSize: 7, alignment: 'center' as Alignment },
        { text: v(hor.sabado?.final), fontSize: 7, alignment: 'center' as Alignment },
        { text: v(hor.domingo?.inicio), fontSize: 7, alignment: 'center' as Alignment },
        { text: v(hor.domingo?.final), fontSize: 7, alignment: 'center' as Alignment },
      ],
      [
        { text: '2º', style: 'cellValue', alignment: 'center' as Alignment, fontSize: 7 },
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
      ],
      [
        { text: '3º', style: 'cellValue', alignment: 'center' as Alignment, fontSize: 7 },
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
      ],
    ]
  )

  const content: Content[] = [
    ...header,
    docTitle('Solicitação de Cadastro no Estágio'),
    studentTable,
    { text: '\n' },
    complementTable,
    { text: '\n' },
    companyTable,
    { text: '\n' },
    internshipTable,
    { text: '\n' },
    scheduleTable,
    { text: '\n' },
    sigBlock(
      ['ASSINATURA DO DISCENTE', 'ASSINATURA DO DOCENTE ORIENTADOR'],
      'Observação: As atividades de estágio supervisionado só podem ser iniciadas após o cadastro do Termo de Compromisso de Estágio no sistema competente.',
      fmtDate(d.solicitation_date),
      fmtDate(d.authorization_date)
    ),
  ]

  return { content }
}
