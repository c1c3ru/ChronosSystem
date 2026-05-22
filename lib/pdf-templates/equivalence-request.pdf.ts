import type { TDocumentDefinitions, Content, TableCell, Alignment } from 'pdfmake/interfaces'
import { ifceHeader, cell, emptyCell, dataTable, fmtDate, v } from '@/lib/pdfmake-base-service'

export interface EquivalenceRequestData {
  // Student Data
  student_name?: string
  student_cpf?: string
  student_social_name?: string
  student_course?: string
  student_enrollment?: string
  student_address?: string
  student_neighborhood?: string
  student_city_uf?: string
  student_cep?: string
  student_phone?: string
  student_email_inst?: string
  student_email_personal?: string

  // Personal Info
  color_race?: string
  ethnicity?: string
  ethnicity_other?: string
  ethnicity_community?: string
  disability?: string

  // Experience to be credited
  exp_extension?: boolean
  exp_employee?: boolean
  exp_third_sector?: boolean
  exp_public_servant?: boolean

  // Attached Documents
  doc_ata_third_sector?: boolean
  doc_nomination_public?: boolean
  doc_cnpj?: boolean
  doc_ctps?: boolean
  doc_statute?: boolean
  doc_activities_declaration?: boolean
  doc_public_functions?: boolean
  doc_others?: boolean
  doc_others_desc?: string

  // Internship details
  internship_mode?: 'presencial' | 'remoto'
  start_date?: string
  weekly_hours?: string
  end_date_expected?: string

  // Schedule
  schedule?: Record<string, { start: string; end: string }>

  city_uf?: string
  solicitation_date?: string
}

export async function buildEquivalenceRequestDoc(
  d: EquivalenceRequestData
): Promise<TDocumentDefinitions> {
  const header = await ifceHeader()
  const cb = (checked?: boolean) => (checked ? '( X )' : '(   )')

  const studentTable = dataTable(
    ['75%', '25%'],
    [
      [cell('NOME', v(d.student_name)), cell('CPF', v(d.student_cpf))],
      [cell('NOME SOCIAL', v(d.student_social_name), { colSpan: 2 }), emptyCell()],
      [cell('CURSO', v(d.student_course)), cell('MATRÍCULA', v(d.student_enrollment))],
      [
        cell('ENDEREÇO (LOGRADOURO, NÚMERO E COMPLEMENTO)', v(d.student_address)),
        cell('BAIRRO/DISTRITO', v(d.student_neighborhood)),
      ],
      [
        {
          columns: [
            cell('MUNICÍPIO-UF', v(d.student_city_uf), {
              width: '40%',
              border: [false, false, true, true],
            }),
            cell('CEP', v(d.student_cep), { width: '30%', border: [false, false, true, true] }),
            cell('DDD + TELEFONE', v(d.student_phone), {
              width: '30%',
              border: [false, false, false, true],
            }),
          ],
        } as TableCell,
        emptyCell(),
      ],
      [
        cell('E-MAIL INSTITUCIONAL', v(d.student_email_inst)),
        cell('E-MAIL PESSOAL', v(d.student_email_personal)),
      ],
    ]
  )

  const personalInfoTable = dataTable(
    ['33%', '33%', '34%'],
    [
      [
        { text: 'COR/RAÇA', style: 'tableHeader', alignment: 'center' as Alignment },
        { text: 'ETNIA', style: 'tableHeader', alignment: 'center' as Alignment },
        {
          text: 'APENAS PARA PESSOA COM DEFICIÊNCIA',
          style: 'tableHeader',
          alignment: 'center' as Alignment,
        },
      ],
      [
        {
          stack: [
            { text: `${cb(d.color_race === 'amarelo')} Amarelo(a)`, fontSize: 7 },
            { text: `${cb(d.color_race === 'branco')} Branco(a)`, fontSize: 7 },
            { text: `${cb(d.color_race === 'indigena')} Indígena`, fontSize: 7 },
            { text: `${cb(d.color_race === 'pardo')} Pardo(a)`, fontSize: 7 },
            { text: `${cb(d.color_race === 'preto')} Preto(a)`, fontSize: 7 },
            { text: `${cb(d.color_race === 'nao_declarar')} Prefiro não declarar`, fontSize: 7 },
          ],
          margin: [2, 2, 2, 2],
        },
        {
          stack: [
            { text: `${cb(d.ethnicity === 'indigena')} Indígena`, fontSize: 7 },
            { text: `${cb(d.ethnicity === 'quilombola')} Quilombola`, fontSize: 7 },
            { text: `${cb(d.ethnicity === 'outra')} Outra: ${v(d.ethnicity_other)}`, fontSize: 7 },
            { text: `${cb(d.ethnicity === 'nao_declarar')} Prefiro não declarar`, fontSize: 7 },
            {
              text: `Informar comunidade se marcar etnia: ${v(d.ethnicity_community)}`,
              fontSize: 6,
              margin: [0, 4, 0, 0],
            },
          ],
          margin: [2, 2, 2, 2],
        },
        {
          stack: [
            {
              text: `${cb(d.disability?.includes('alta_habilidade'))} Alta habilidade/superdotação`,
              fontSize: 7,
            },
            { text: `${cb(d.disability?.includes('auditiva'))} Deficiência auditiva`, fontSize: 7 },
            {
              text: `${cb(d.disability?.includes('intelectual'))} Deficiência intelectual`,
              fontSize: 7,
            },
            { text: `${cb(d.disability?.includes('motora'))} Deficiência motora`, fontSize: 7 },
            {
              text: `${cb(d.disability?.includes('visual_baixa'))} Deficiência visual/baixa visão`,
              fontSize: 7,
            },
            { text: `${cb(d.disability?.includes('visual'))} Deficiência visual`, fontSize: 7 },
            { text: `${cb(d.disability?.includes('surdocegueira'))} Surdocegueira`, fontSize: 7 },
          ],
          margin: [2, 2, 2, 2],
        },
      ],
    ]
  )

  const experienceTable = dataTable(
    ['*'],
    [
      [
        {
          text: 'EXPERIÊNCIA A SER APROVEITADA COMO ATIVIDADE DE ESTÁGIO',
          style: 'tableHeader',
          alignment: 'center' as Alignment,
        },
      ],
      [
        {
          stack: [
            {
              text: `${cb(d.exp_extension)} Atividade de extensão, Iniciação científica ou monitoria`,
              fontSize: 8,
              margin: [0, 2, 0, 2],
            },
            {
              text: `${cb(d.exp_employee)} Empregado de empresa privada ou pública`,
              fontSize: 8,
              margin: [0, 2, 0, 2],
            },
            {
              text: `${cb(d.exp_third_sector)} Membro ou empregado de instituição do terceiro setor`,
              fontSize: 8,
              margin: [0, 2, 0, 2],
            },
            {
              text: `${cb(d.exp_public_servant)} Servidor público estatutário`,
              fontSize: 8,
              margin: [0, 2, 0, 2],
            },
          ],
          margin: [5, 5, 5, 5],
        },
      ],
    ]
  )

  const docsTable = dataTable(
    ['*'],
    [
      [{ text: 'DOCUMENTOS ANEXOS', style: 'tableHeader', alignment: 'center' as Alignment }],
      [
        {
          stack: [
            {
              text: `${cb(d.doc_ata_third_sector)} Ata de nomeação do membro de instituição do terceiro setor`,
              fontSize: 8,
              margin: [0, 1, 0, 1],
            },
            {
              text: `${cb(d.doc_nomination_public)} Ato de nomeação do servidor público`,
              fontSize: 8,
              margin: [0, 1, 0, 1],
            },
            {
              text: `${cb(d.doc_cnpj)} Cartão do Cadastro Nacional de Pessoa Jurídica – CNPJ`,
              fontSize: 8,
              margin: [0, 1, 0, 1],
            },
            {
              text: `${cb(d.doc_ctps)} Carteira de Trabalho e Previdência Social – CPTS`,
              fontSize: 8,
              margin: [0, 1, 0, 1],
            },
            {
              text: `${cb(d.doc_statute)} Contrato Social ou Estatuto da instituição`,
              fontSize: 8,
              margin: [0, 1, 0, 1],
            },
            {
              text: `${cb(d.doc_activities_declaration)} Declaração de atividades`,
              fontSize: 8,
              margin: [0, 1, 0, 1],
            },
            {
              text: `${cb(d.doc_public_functions)} Regulamento das funções do cargo público`,
              fontSize: 8,
              margin: [0, 1, 0, 1],
            },
            {
              text: `${cb(d.doc_others)} Outros documentos: ${v(d.doc_others_desc)}`,
              fontSize: 8,
              margin: [0, 1, 0, 1],
            },
          ],
          margin: [5, 5, 5, 5],
        },
      ],
    ]
  )

  const internshipTable = dataTable(
    ['20%', '25%', '18%', '19%', '18%'],
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
          text: 'OBRIGATÓRIO',
          fontSize: 9,
          bold: true,
          alignment: 'center' as Alignment,
          margin: [0, 8, 0, 0],
        },
        {
          stack: [
            {
              text: `${cb(d.internship_mode === 'presencial')} PRESENCIAL`,
              fontSize: 7,
              margin: [0, 2, 0, 2],
            },
            {
              text: `${cb(d.internship_mode === 'remoto')} REMOTO`,
              fontSize: 7,
              margin: [0, 2, 0, 2],
            },
          ],
          margin: [5, 2, 5, 2],
        },
        {
          text: fmtDate(d.start_date),
          fontSize: 9,
          alignment: 'center' as Alignment,
          margin: [0, 8, 0, 0],
        },
        {
          text: `${v(d.weekly_hours)} HORAS`,
          fontSize: 9,
          alignment: 'center' as Alignment,
          margin: [0, 8, 0, 0],
        },
        {
          text: fmtDate(d.end_date_expected),
          fontSize: 9,
          alignment: 'center' as Alignment,
          margin: [0, 8, 0, 0],
        },
      ],
    ]
  )

  // Helper for schedule table
  const days = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo']
  const dayLabels = [
    'SEGUNDA-FEIRA',
    'TERÇA-FEIRA',
    'QUARTA-FEIRA',
    'QUINTA-FEIRA',
    'SEXTA-FEIRA',
    'SÁBADO',
    'DOMINGO',
  ]

  const scheduleRows: TableCell[][] = [
    [
      { text: 'TURNO', style: 'tableHeader', alignment: 'center' as Alignment, rowSpan: 2 },
      ...dayLabels.map((label) => ({
        text: label,
        style: 'tableHeader',
        alignment: 'center' as Alignment,
        colSpan: 2,
      })),
      ...Array(6).fill(emptyCell()), // for colSpans
    ],
    [
      emptyCell(),
      ...Array(7)
        .fill([
          { text: 'INÍCIO', fontSize: 5, bold: true, alignment: 'center' as Alignment },
          { text: 'FINAL', fontSize: 5, bold: true, alignment: 'center' as Alignment },
        ])
        .flat(),
    ],
  ]

  const turns = ['1º', '2º', '3º']
  turns.forEach((turn, turnIdx) => {
    const row: TableCell[] = [
      { text: turn, fontSize: 8, alignment: 'center' as Alignment, bold: true },
    ]
    days.forEach((day) => {
      const key = `${day}_${turnIdx + 1}`
      const entry = d.schedule?.[key]
      row.push({ text: entry?.start || '', fontSize: 7, alignment: 'center' as Alignment })
      row.push({ text: entry?.end || '', fontSize: 7, alignment: 'center' as Alignment })
    })
    scheduleRows.push(row)
  })

  const scheduleTable = dataTable(['4.7%', ...Array(14).fill('6.8%')], scheduleRows)

  const content: Content[] = [
    ...header,
    {
      text: 'SOLICITAÇÃO DE APROVEITAMENTO DE EXPERIÊNCIA ACADÊMICA OU DE TRABALHO',
      style: 'docTitle',
      margin: [0, 10, 0, 10],
    },
    studentTable,
    { text: '\n', fontSize: 4 },
    personalInfoTable,
    { text: '\n', fontSize: 4 },
    experienceTable,
    { text: '\n', fontSize: 4 },
    docsTable,
    { text: '\n', fontSize: 4 },
    internshipTable,
    {
      text: 'PREVISÃO DE DISTRIBUIÇÃO DA CARGA HORÁRIA',
      style: 'tableHeader',
      alignment: 'center' as Alignment,
      margin: [0, 2, 0, 0],
    },
    scheduleTable,
    { text: '\n' },
    {
      columns: [
        {
          stack: [
            {
              canvas: [{ type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 0.5 }],
              margin: [0, 20, 0, 2],
            },
            { text: 'ASSINATURA DO DISCENTE', fontSize: 7, alignment: 'center' as Alignment },
          ],
          width: '50%',
        },
        {
          stack: [
            {
              text: `${v(d.city_uf || 'Maracanaú-CE')}, ${fmtDate(d.solicitation_date)}`,
              fontSize: 9,
              alignment: 'right' as Alignment,
              margin: [0, 20, 0, 0],
            },
          ],
          width: '50%',
        },
      ],
    },
    { text: '\n\n' },
    {
      canvas: [{ type: 'line', x1: 150, y1: 0, x2: 350, y2: 0, lineWidth: 0.5 }],
      alignment: 'center' as Alignment,
    },
    { text: 'COORDENADOR DE ESTÁGIOS', fontSize: 7, alignment: 'center' as Alignment },
  ]

  return { content }
}
