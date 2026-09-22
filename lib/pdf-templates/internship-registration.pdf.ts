import type { TDocumentDefinitions, Content, Alignment } from 'pdfmake/interfaces'
import {
  ifceHeader,
  docTitle,
  dataTable,
  cell,
  cellRow,
  sigBlock,
  fmtDate,
  v,
} from '@/lib/pdfmake-base-service'

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

export async function buildInternshipRegistrationDoc(
  d: InternshipRegistrationData
): Promise<TDocumentDefinitions> {
  const header = await ifceHeader()

  const studentTable: Content[] = [
    cellRow([
      { label: 'NOME', value: v(d.student_name), width: '70%' },
      { label: 'CPF', value: v(d.student_cpf), width: '30%' },
    ]),
    dataTable(['*'], [[cell('NOME SOCIAL', v(d.student_social_name))]]),
    cellRow([
      { label: 'CURSO', value: v(d.student_course), width: '70%' },
      { label: 'MATRÍCULA', value: v(d.student_enrollment), width: '30%' },
    ]),
    dataTable(['*'], [[cell('ENDEREÇO (LOGRADOURO, NÚMERO E COMPLEMENTO)', v(d.student_address))]]),
    cellRow([
      { label: 'BAIRRO/DISTRITO', value: v(d.student_neighborhood), width: '40%' },
      { label: 'MUNICÍPIO-UF', value: v(d.student_city_uf), width: '35%' },
      { label: 'CEP', value: v(d.student_zip), width: '25%' },
    ]),
    cellRow([
      { label: 'DDD + TELEFONE', value: v(d.student_phone), width: '25%' },
      { label: 'E-MAIL INSTITUCIONAL', value: v(d.student_email_institutional), width: '40%' },
      { label: 'E-MAIL PESSOAL', value: v(d.student_email_personal), width: '35%' },
    ]),
  ]

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
            { text: `${cb(d.student_race === 'amarelo')} Amarelo(a)`, fontSize: 7 },
            { text: `${cb(d.student_race === 'branco')} Branco(a)`, fontSize: 7 },
            { text: `${cb(d.student_race === 'indigena')} Indígena`, fontSize: 7 },
            { text: `${cb(d.student_race === 'pardo')} Pardo(a)`, fontSize: 7 },
            { text: `${cb(d.student_race === 'preto')} Preto(a)`, fontSize: 7 },
            { text: `${cb(d.student_race === 'nao_declarar')} Prefiro não declarar`, fontSize: 7 },
          ],
          margin: [2, 2, 2, 2] as [number, number, number, number],
        },
        {
          stack: [
            { text: `${cb(d.student_ethnicity === 'indigena')} Indígena`, fontSize: 7 },
            { text: `${cb(d.student_ethnicity === 'quilombola')} Quilombola`, fontSize: 7 },
            { text: `${cb(d.student_ethnicity === 'outra')} Outra ________________`, fontSize: 7 },
            {
              text: `${cb(d.student_ethnicity === 'nao_declarar')} Prefiro não declarar`,
              fontSize: 7,
            },
            {
              text: `Informar comunidade se marcar etnia:\n${v(d.student_ethnicity_community)}`,
              fontSize: 6,
              italics: true,
              margin: [0, 4, 0, 0] as [number, number, number, number],
            },
          ],
          margin: [2, 2, 2, 2] as [number, number, number, number],
        },
        {
          stack: [
            {
              text: `${cb(!!d.student_disability?.includes('alta_habilidade'))} Alta habilidade/superdotação`,
              fontSize: 7,
            },
            {
              text: `${cb(!!d.student_disability?.includes('auditiva'))} Deficiência auditiva`,
              fontSize: 7,
            },
            {
              text: `${cb(!!d.student_disability?.includes('intelectual'))} Deficiência intelectual`,
              fontSize: 7,
            },
            {
              text: `${cb(!!d.student_disability?.includes('motora'))} Deficiência motora`,
              fontSize: 7,
            },
            {
              text: `${cb(!!d.student_disability?.includes('visual_baixa'))} Deficiência visual/baixa visão`,
              fontSize: 7,
            },
            {
              text: `${cb(!!d.student_disability?.includes('visual'))} Deficiência visual`,
              fontSize: 7,
            },
            {
              text: `${cb(!!d.student_disability?.includes('surdocegueira'))} Surdocegueira`,
              fontSize: 7,
            },
          ],
          margin: [2, 2, 2, 2] as [number, number, number, number],
        },
      ],
    ]
  )

  const companyTable: Content[] = [
    dataTable(
      ['*'],
      [[{ text: 'RAZÃO SOCIAL', style: 'tableHeader', alignment: 'center' as Alignment }]]
    ),
    dataTable(['*'], [[cell(' ', v(d.company_name))]]),
    dataTable(
      ['*'],
      [
        [
          {
            text: 'NOME DE FANTASIA OU DE PESSOA FÍSICA',
            style: 'tableHeader',
            alignment: 'center' as Alignment,
          },
        ],
      ]
    ),
    dataTable(['*'], [[cell(' ', v(d.company_fantasy_name))]]),
    cellRow([
      { label: 'CNPJ OU REGISTRO NO CONSELHO', value: v(d.company_cnpj), width: '35%' },
      {
        label: 'ENDEREÇO (LOGRADOURO, NÚMERO E COMPLEMENTO)',
        value: v(d.company_address),
        width: '65%',
      },
    ]),
    cellRow([
      { label: 'BAIRRO', value: v(d.company_neighborhood), width: '35%' },
      { label: 'MUNICÍPIO-UF', value: v(d.company_city_uf), width: '40%' },
      { label: 'CEP', value: v(d.company_zip), width: '25%' },
    ]),
    cellRow([
      { label: 'DDD + TELEFONE', value: v(d.company_phone), width: '30%' },
      { label: 'E-MAIL', value: v(d.company_email), width: '70%' },
    ]),
    dataTable(
      ['*'],
      [
        [
          {
            text: 'RESPONSÁVEL LEGAL PELA INSTITUIÇÃO PARA ESTE FIM',
            style: 'tableHeader',
            alignment: 'center' as Alignment,
          },
        ],
      ]
    ),
    dataTable(['*'], [[cell(' ', v(d.company_representative))]]),
    cellRow([
      { label: 'CARGO/QUALIFICAÇÃO', value: v(d.company_representative_role), width: '40%' },
      { label: 'CPF', value: v(d.company_representative_cpf), width: '30%' },
      { label: 'DDD + TELEFONE', value: v(d.company_representative_phone), width: '30%' },
    ]),
    dataTable(
      ['*'],
      [
        [
          {
            text: 'SUPERVISOR DO ESTÁGIO NA INSTITUIÇÃO CONCEDENTE DA VAGA DE ESTÁGIO',
            style: 'tableHeader',
            alignment: 'center' as Alignment,
          },
        ],
      ]
    ),
    dataTable(['*'], [[cell(' ', v(d.company_supervisor))]]),
    cellRow([
      { label: 'CARGO/QUALIFICAÇÃO', value: v(d.company_supervisor_role), width: '40%' },
      { label: 'CPF', value: v(d.company_supervisor_cpf), width: '30%' },
      { label: 'DDD + TELEFONE', value: v(d.company_supervisor_phone), width: '30%' },
    ]),
    dataTable(['*'], [[cell('SETOR DE REALIZAÇÃO DO ESTÁGIO', v(d.company_sector))]]),
  ]

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
            { text: `${cb(d.internship_type === 'obrigatorio')} OBRIGATÓRIO`, fontSize: 7 },
            { text: `${cb(d.internship_type === 'nao_obrigatorio')} NÃO OBRIGATÓRIO`, fontSize: 7 },
          ],
          margin: [4, 4, 4, 4] as [number, number, number, number],
        },
        {
          stack: [
            { text: `${cb(d.internship_mode === 'presencial')} PRESENCIAL`, fontSize: 7 },
            { text: `${cb(d.internship_mode === 'remoto')} REMOTO`, fontSize: 7 },
          ],
          margin: [4, 4, 4, 4] as [number, number, number, number],
        },
        {
          text: fmtDate(d.start_date),
          alignment: 'center' as Alignment,
          margin: [0, 8, 0, 8] as [number, number, number, number],
        },
        {
          text: `${v(d.weekly_hours)} HORAS`,
          alignment: 'center' as Alignment,
          margin: [0, 8, 0, 8] as [number, number, number, number],
        },
        {
          text: fmtDate(d.end_date),
          alignment: 'center' as Alignment,
          margin: [0, 8, 0, 8] as [number, number, number, number],
        },
      ],
    ]
  )

  const hor = d.schedule || {}
  const scheduleTable = dataTable(
    ['12%', '6%', '6%', '6%', '6%', '6%', '6%', '6%', '6%', '6%', '6%', '6%', '6%', '6%', '6%'],
    [
      [
        {
          text: 'TURNO',
          style: 'tableHeader',
          alignment: 'center' as Alignment,
          rowSpan: 2,
          margin: [0, 8, 0, 8] as [number, number, number, number],
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
        { text: v(hor.mon?.morning), fontSize: 7, alignment: 'center' as Alignment },
        { text: v(hor.mon?.afternoon), fontSize: 7, alignment: 'center' as Alignment },
        { text: v(hor.tue?.morning), fontSize: 7, alignment: 'center' as Alignment },
        { text: v(hor.tue?.afternoon), fontSize: 7, alignment: 'center' as Alignment },
        { text: v(hor.wed?.morning), fontSize: 7, alignment: 'center' as Alignment },
        { text: v(hor.wed?.afternoon), fontSize: 7, alignment: 'center' as Alignment },
        { text: v(hor.thu?.morning), fontSize: 7, alignment: 'center' as Alignment },
        { text: v(hor.thu?.afternoon), fontSize: 7, alignment: 'center' as Alignment },
        { text: v(hor.fri?.morning), fontSize: 7, alignment: 'center' as Alignment },
        { text: v(hor.fri?.afternoon), fontSize: 7, alignment: 'center' as Alignment },
        { text: v(hor.sat?.morning), fontSize: 7, alignment: 'center' as Alignment },
        { text: v(hor.sat?.afternoon), fontSize: 7, alignment: 'center' as Alignment },
        { text: '', fontSize: 7 },
        { text: '', fontSize: 7 },
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
    docTitle('Ficha de Cadastro no Estágio'),
    ...studentTable,
    { text: '\n' },
    complementTable,
    { text: '\n' },
    ...companyTable,
    { text: '\n' },
    internshipTable,
    { text: '\n' },
    scheduleTable,
    { text: '\n' },
    sigBlock(
      ['ASSINATURA DO DISCENTE', 'ASSINATURA DO RESPONSÁVEL LEGAL', 'ASSINATURA DO SUPERVISOR'],
      'Declaro que as informações acima são verdadeiras.',
      fmtDate(d.solicitation_date),
      fmtDate(d.authorization_date)
    ),
  ]

  return {
    content,
    styles: {
      tableHeader: { bold: true, fontSize: 8, fillColor: '#f3f4f6' },
      cellLabel: { fontSize: 7, color: '#666' },
      cellValue: { fontSize: 9 },
    },
  }
}
