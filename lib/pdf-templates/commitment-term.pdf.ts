/**
 * commitment-term.pdf.ts
 *
 * Template pdfmake do "Termo de Compromisso de Estágio" (IFCE).
 * Seguindo o padrão oficial multi-páginas com cláusulas jurídicas.
 */

import type { TDocumentDefinitions, Content, TableCell, Alignment } from 'pdfmake/interfaces'
import {
  ifceHeader,
  docTitle,
  cell,
  emptyCell,
  dataTable,
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
  internship_type?: 'obrigatorio' | 'nao_obrigatorio'

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
  supervisor_sector?: string

  // Plano
  activities_description?: string
  expected_results?: string
  // Quadro de Horários (7 dias x 3 turnos, com início e fim)
  horarios?: {
    segunda_feira?: { inicio?: string; final?: string }
    terca_feira?: { inicio?: string; final?: string }
    quarta_feira?: { inicio?: string; final?: string }
    quinta_feira?: { inicio?: string; final?: string }
    sexta_feira?: { inicio?: string; final?: string }
    sabado?: { inicio?: string; final?: string }
    domingo?: { inicio?: string; final?: string }
  }
  
  solicitation_date?: string
  authorization_date?: string
}

// ─── HELPERS DE TEXTO ─────────────────────────────────────────────────────────

const clauseTitle = (text: string): Content => ({
  text,
  style: 'clauseHeader',
  margin: [0, 12, 0, 4] as [number, number, number, number],
  bold: true,
})

const clauseBody = (text: string | Content[]): Content => ({
  text,
  style: 'clauseBody',
  margin: [0, 2, 0, 6] as [number, number, number, number],
  alignment: 'justify' as Alignment,
})

const subItem = (label: string, text: string): Content => ({
  columns: [
    { text: label, width: 30, bold: true },
    { text, width: '*' }
  ],
  margin: [0, 2, 0, 2] as [number, number, number, number],
  alignment: 'justify' as Alignment
})

// ─── BUILDER ─────────────────────────────────────────────────────────────────

export async function buildCommitmentTermDoc(d: CommitmentTermData): Promise<TDocumentDefinitions> {
  const header = await ifceHeader()

  // ── 1. Tabelas de Identificação ───────────────────────────────────────────
  
  const ifceTable = dataTable(
    ['*'],
    [
      [{ text: 'Instituição de Ensino – IFCE', style: 'tableHeader', alignment: 'center' as Alignment }],
      [
        {
          columns: [
            cell('CAMPUS', 'MARACANAÚ', { border: [false, false, true, true] }),
            cell('CNPJ', '10.744.098/0009-00', { border: [false, false, false, true] }),
          ]
        } as TableCell
      ],
      [cell('ENDEREÇO (LOGRADOURO, NÚMERO E COMPLEMENTO)', 'AV. VICE PRESIDENTE JOSÉ DE ALENCAR, S/N')],
      [
        {
          columns: [
            cell('BAIRRO', 'JEREISSATI I', { border: [false, false, true, true] }),
            cell('MUNICÍPIO', 'MARACANAÚ', { border: [false, false, true, true] }),
            cell('CEP', '61.939-140', { border: [false, false, false, true] }),
          ]
        } as TableCell
      ],
      [
        {
          columns: [
            cell('DDD + TELEFONE', '85 3512-8709', { border: [false, false, true, true] }),
            cell('E-MAIL', 'gabmaracanau@ifce.edu.br', { border: [false, false, false, true] }),
          ]
        } as TableCell
      ],
      [cell('REPRESENTANTE PARA ESTE ESPECÍFICO FIM', 'ELDER KENED CARDOSO')],
      [
        {
          columns: [
            cell('CARGO/QUALIFICAÇÃO', 'ASSISTENTE EM ADMINISTRAÇÃO', { border: [false, false, true, true] }),
            cell('SIAPE', '1818968', { border: [false, false, false, true] }),
          ]
        } as TableCell
      ],
      [
        {
          columns: [
            cell('E-MAIL', 'estagio.maracanau@ifce.edu.br', { border: [false, false, true, true] }),
            cell('DDD + TELEFONE', '85 3512-8706', { border: [false, false, false, true] }),
          ]
        } as TableCell
      ],
    ]
  )

  const companyTable = dataTable(
    ['*'],
    [
      [{ text: 'Instituição Concedente de vaga de estágio – CONCEDENTE DO ESTÁGIO', style: 'tableHeader', alignment: 'center' as Alignment }],
      [cell('RAZÃO SOCIAL', v(d.company_name))],
      [cell('NOME DE FANTASIA OU DE PESSOA FÍSICA', v(d.company_fantasy_name))],
      [
        {
          columns: [
            cell('CNPJ OU REGISTRO NO CONSELHO', v(d.company_cnpj), { border: [false, false, true, true] }),
            cell('ENDEREÇO (LOGRADOURO, NÚMERO E COMPLEMENTO)', v(d.company_address), { border: [false, false, false, true] }),
          ]
        } as TableCell
      ],
      [
        {
          columns: [
            cell('BAIRRO', v(d.company_neighborhood), { border: [false, false, true, true] }),
            cell('MUNICÍPIO-UF', v(d.company_city_state), { border: [false, false, true, true] }),
            cell('CEP', v(d.company_zip), { border: [false, false, false, true] }),
          ]
        } as TableCell
      ],
      [
        {
          columns: [
            cell('DDD + TELEFONE', v(d.company_phone), { border: [false, false, true, true] }),
            cell('E-MAIL', v(d.company_email), { border: [false, false, false, true] }),
          ]
        } as TableCell
      ],
      [cell('RESPONSÁVEL LEGAL PELA INSTITUIÇÃO PARA ESTE FIM', v(d.company_representative))],
      [
        {
          columns: [
            cell('CARGO/QUALIFICAÇÃO', v(d.company_representative_role), { border: [false, false, true, true] }),
            cell('CPF', v(d.company_representative_cpf), { border: [false, false, true, true] }),
            cell('DDD + TELEFONE', v(d.company_representative_phone), { border: [false, false, false, true] }),
          ]
        } as TableCell
      ],
    ]
  )

  const studentTable = dataTable(
    ['*'],
    [
      [{ text: 'DISCENTE ESTAGIÁRIO(A)', style: 'tableHeader', alignment: 'center' as Alignment }],
      [
        {
          columns: [
            cell('NOME', v(d.student_name), { border: [false, false, true, true] }),
            cell('CPF', v(d.student_cpf), { border: [false, false, false, true] }),
          ]
        } as TableCell
      ],
      [cell('NOME SOCIAL', v(d.student_social_name))],
      [
        {
          columns: [
            cell('CURSO', v(d.student_course), { border: [false, false, true, true] }),
            cell('MATRÍCULA', v(d.student_id), { border: [false, false, false, true] }),
          ]
        } as TableCell
      ],
    ]
  )

  // ── 2. Conteúdo Jurídico ──────────────────────────────────────────────────

  const preamble = {
    text: [
      'Nos termos da Lei nº 11.788, de 25/09/2008, e do Regulamento de Estágio do IFCE, os entes abaixo qualificados celebram entre si o presente ',
      { text: 'Termo de Compromisso de Estágio', bold: true },
      ', regrado pelas cláusulas que seguem:'
    ],
    margin: [0, 10, 0, 10] as [number, number, number, number],
    alignment: 'justify' as Alignment
  }

  const clauses = [
    clauseTitle('CLÁUSULA PRIMEIRA – DO OBJETO, DE SUA QUALIFICAÇÃO E DA VIGÊNCIA DO CONTRATO'),
    clauseBody([
      subItem('I -', `O estágio supervisionado regrado por este termo será ${v(d.internship_type === 'obrigatorio' ? 'OBRIGATÓRIO' : 'NÃO OBRIGATÓRIO')}, com atividades compatíveis com a formação recebida no curso do DISCENTE ESTAGIÁRIO, e realizadas de forma ${v(d.modality?.toUpperCase())} (presencial, remota ou híbrida), tudo conforme plano de atividades constantes da CLÁUSULA SEXTA.`),
      subItem('II -', `Este termo de compromisso terá vigência de ${fmtDate(d.start_date)} a ${fmtDate(d.end_date)}, podendo ser rescindido a qualquer tempo, unilateralmente, mediante comunicação formal, independente de pré-aviso.`),
      subItem('III -', 'O aditamento deste termo será realizado em caso das necessidades previstas no Regulamento de Estágio do IFCE.')
    ]),

    clauseTitle('CLÁUSULA SEGUNDA – DOS DIREITOS E DEVERES DO IFCE'),
    clauseBody([
      'Caberá à unidade do IFCE onde o discente estuda:',
      subItem('I -', 'Avaliar as instalações da CONCEDENTE DO ESTÁGIO e sua adequação às atividades previstas no plano de atividades;'),
      subItem('II -', 'Indicar Docente orientador como responsável pelo acompanhamento e avaliação das atividades do DISCENTE ESTAGIÁRIO;'),
      subItem('III -', 'Exigir do DISCENTE ESTAGIÁRIO a apresentação de relatório das atividades;'),
      subItem('IV -', 'Reorientar o DISCENTE ESTAGIÁRIO para outro local em caso de descumprimento de normas pertinentes ao estágio supervisionado;'),
      subItem('V -', 'Manter comunicação com a parte concedente do estágio para o bom desenvolvimento das atividades.')
    ]),

    clauseTitle('CLÁUSULA TERCEIRA – DOS DIREITOS E DEVERES DA CONCEDENTE DO ESTÁGIO'),
    clauseBody([
      'Caberá à Instituição Concedente da vaga de Estágio:',
      subItem('I -', 'Oferecer ao DISCENTE ESTAGIÁRIO, inclusive aquele com deficiência, condições de desenvolvimento vivencial, treinamento prático e de relacionamento humano com observância do plano de atividades do estagiário que passa a ser parte integrante deste documento;'),
      subItem('II -', 'Proporcionar ao IFCE condições para o aprimoramento e avaliação do DISCENTE ESTAGIÁRIO;'),
      subItem('III -', 'Designar profissional com formação e/ou experiência profissional na área para supervisionar das atividades do estágio;'),
      subItem('IV -', 'Estabelecer nos períodos de atividades acadêmicas redução de, pelo menos, a metade da jornada a ser cumprida em estágio;'),
      subItem('V -', 'Conceder período de 30 dias de recesso ao DISCENTE ESTAGIÁRIO sempre que o estágio tenha duração igual ou superior a 01(um) ano ou proporcional quando de duração inferior, a ser gozado preferencialmente durante as férias escolares;'),
      subItem('VI -', 'Fornecer, por ocasião do encerramento do estágio, termo de realização do estágio com indicação resumida das atividades desenvolvidas, dos períodos e da avaliação de desempenho do DISCENTE ESTAGIÁRIO;'),
      { text: 'PARÁGRAFO ÚNICO – A CONCEDENTE DO ESTÁGIO autoriza o IFCE ao uso de suas informações para cadastro em sistemas competentes.', margin: [0, 4, 0, 0] as [number, number, number, number], italics: true }
    ]),

    clauseTitle('CLÁUSULA QUARTA – DOS DIREITOS E DEVERES DO DISCENTE ESTAGIÁRIO'),
    clauseBody([
      'Caberá ao DISCENTE ESTAGIÁRIO:',
      subItem('I -', 'Cumprir as atividades estabelecidas no plano de atividades;'),
      subItem('II -', 'Respeitar as normas internas da CONCEDENTE DO ESTÁGIO;'),
      subItem('III -', 'Respeitar a legislação pertinente ao estágio;'),
      subItem('IV -', 'Cumprir as orientações do Docente orientador e/ou do Supervisor do estágio.')
    ]),

    clauseTitle('CLÁUSULA QUINTA – DO SEGURO OBRIGATÓRIO E DA REMUNERAÇÃO'),
    clauseBody([
      subItem('I -', `A concedente neste ato contrata em favor do DISCENTE ESTAGIÁRIO seguro contra acidentes pessoais, com cobertura limitada ao local e período de estágio, mediante apólice ${v(d.insurance_policy)} da empresa ${v(d.insurance_company)}.`),
      d.has_grant === 'true' 
        ? subItem('II -', `A CONCEDENTE DO ESTÁGIO remunerará mensalmente o DISCENTE ESTAGIÁRIO através de bolsa-auxílio no valor de R$ ${v(d.grant_value)} (${v(d.grant_value)}).`)
        : subItem('II -', 'A CONCEDENTE DO ESTÁGIO não remunerará mensalmente o DISCENTE ESTAGIÁRIO.'),
      d.has_transport === 'true'
        ? subItem('III -', `A CONCEDENTE DO ESTÁGIO fornecerá ao DISCENTE ESTAGIÁRIO auxílio-transporte no valor de R$ ${v(d.transport_value)}.`)
        : subItem('III -', 'A CONCEDENTE DO ESTÁGIO não fornecerá ao DISCENTE ESTAGIÁRIO auxílio-transporte.')
    ]),

    clauseTitle('CLÁUSULA SEXTA – DO DOCENTE ORIENTADOR E DO SUPERVISOR DO ESTÁGIO'),
    clauseBody([
      subItem('I -', 'O IFCE designa o(a) professor(a) a seguir qualificado(a) como Docente orientador do estágio, para cumprir funções previstas no Regulamento de Estágio do IFCE.'),
      dataTable(['*'], [
        [{ text: 'DOCENTE ORIENTADOR', style: 'tableHeader', alignment: 'center' as Alignment }],
        [cell('NOME', v(d.advisor_name))],
        [{
          columns: [
            cell('SIAPE', v(d.advisor_siape), { border: [false, false, true, true] }),
            cell('DDD + TELEFONE', v(d.advisor_phone), { border: [false, false, true, true] }),
            cell('E-MAIL', v(d.advisor_email), { border: [false, false, false, true] }),
          ]
        } as TableCell]
      ]),
      { text: '\n' },
      subItem('II -', 'A CONCEDENTE DO ESTÁGIO designa o profissional a seguir qualificado(a) como Supervisor do Estágio, para cumprir funções previstas Regulamento de Estágio do IFCE.'),
      dataTable(['*'], [
        [{ text: 'SUPERVISOR DO ESTÁGIO', style: 'tableHeader', alignment: 'center' as Alignment }],
        [cell('NOME', v(d.supervisor_name))],
        [cell('FORMAÇÃO OU EXPERIÊNCIA PROFISSIONAL', v(d.supervisor_education))],
        [{
          columns: [
            cell('CPF', v(d.supervisor_cpf), { border: [false, false, true, true] }),
            cell('DDD + TELEFONE', v(d.supervisor_phone), { border: [false, false, true, true] }),
            cell('E-MAIL', v(d.supervisor_email), { border: [false, false, false, true] }),
          ]
        } as TableCell]
      ]),
    ]),

    clauseTitle('CLÁUSULA SÉTIMA – DO PLANO DE ATIVIDADES, DO CRONOGRAMA E DA CARGA HORÁRIA DO ESTÁGIO'),
    clauseBody([
      subItem('I -', 'O Plano de Atividades do estágio é acordado entre o Docente Orientador, o Supervisor do Estágio e o DISCENTE ESTAGIÁRIO, e se configura conforme o quadro abaixo:'),
      dataTable(['*'], [
        [{ text: 'ATIVIDADES A SEREM DESENVOLVIDAS', style: 'tableHeader', alignment: 'center' as Alignment }],
        [{ text: v(d.activities_description), margin: [4, 20, 4, 20] as [number, number, number, number] }],
        [{ text: 'RESULTADOS ESPERADOS', style: 'tableHeader', alignment: 'center' as Alignment }],
        [{ text: v(d.expected_results), margin: [4, 20, 4, 20] as [number, number, number, number] }]
      ]),
      { text: '\n' },
      subItem('II -', `A carga horária semanal de estágio será de ${v(d.weekly_hours)} horas, distribuídas conforme detalhado no quadro abaixo:`),
    ]),
  ]

  // ── Quadro de Horários 15 colunas ──────────────────────────────────────────
  const days = ['SEGUNDA-FEIRA', 'TERÇA-FEIRA', 'QUARTA-FEIRA', 'QUINTA-FEIRA', 'SEXTA-FEIRA', 'SÁBADO', 'DOMINGO']
  const hor = d.horarios || {}
  
  const scheduleTable = dataTable(
    ['12%', '6%', '6%', '6%', '6%', '6%', '6%', '6%', '6%', '6%', '6%', '6%', '6%', '6%', '6%'],
    [
      [
        { text: 'TURN', style: 'tableHeader', alignment: 'center' as Alignment, rowSpan: 2, margin: [0, 8] },
        { text: 'DIAS DA SEMANA', style: 'tableHeader', alignment: 'center' as Alignment, colSpan: 14 },
        {},{},{},{},{},{},{},{},{},{},{},{},{}
      ],
      [
        {},
        { text: 'SEG', style: 'tableHeader', alignment: 'center' as Alignment, colSpan: 2 }, {},
        { text: 'TER', style: 'tableHeader', alignment: 'center' as Alignment, colSpan: 2 }, {},
        { text: 'QUA', style: 'tableHeader', alignment: 'center' as Alignment, colSpan: 2 }, {},
        { text: 'QUI', style: 'tableHeader', alignment: 'center' as Alignment, colSpan: 2 }, {},
        { text: 'SEX', style: 'tableHeader', alignment: 'center' as Alignment, colSpan: 2 }, {},
        { text: 'SÁB', style: 'tableHeader', alignment: 'center' as Alignment, colSpan: 2 }, {},
        { text: 'DOM', style: 'tableHeader', alignment: 'center' as Alignment, colSpan: 2 }, {},
      ],
      [
        { text: 'O', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 6 },
        { text: 'INÍCIO', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 }, { text: 'FIM', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 },
        { text: 'INÍCIO', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 }, { text: 'FIM', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 },
        { text: 'INÍCIO', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 }, { text: 'FIM', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 },
        { text: 'INÍCIO', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 }, { text: 'FIM', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 },
        { text: 'INÍCIO', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 }, { text: 'FIM', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 },
        { text: 'INÍCIO', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 }, { text: 'FIM', style: 'tableHeader', alignment: 'center', fontSize: 5 },
        { text: 'INÍCIO', style: 'tableHeader', alignment: 'center', fontSize: 5 }, { text: 'FIM', style: 'tableHeader', alignment: 'center', fontSize: 5 },
      ],
      [
        { text: '1º', style: 'cellValue', alignment: 'center' as Alignment, fontSize: 7 },
        { text: v(hor.segunda_feira?.inicio), fontSize: 7, alignment: 'center' as Alignment }, { text: v(hor.segunda_feira?.final), fontSize: 7, alignment: 'center' as Alignment },
        { text: v(hor.terca_feira?.inicio), fontSize: 7, alignment: 'center' as Alignment }, { text: v(hor.terca_feira?.final), fontSize: 7, alignment: 'center' as Alignment },
        { text: v(hor.quarta_feira?.inicio), fontSize: 7, alignment: 'center' as Alignment }, { text: v(hor.quarta_feira?.final), fontSize: 7, alignment: 'center' as Alignment },
        { text: v(hor.quinta_feira?.inicio), fontSize: 7, alignment: 'center' as Alignment }, { text: v(hor.quinta_feira?.final), fontSize: 7, alignment: 'center' as Alignment },
        { text: v(hor.sexta_feira?.inicio), fontSize: 7, alignment: 'center' as Alignment }, { text: v(hor.sexta_feira?.final), fontSize: 7, alignment: 'center' as Alignment },
        { text: v(hor.sabado?.inicio), fontSize: 7, alignment: 'center' as Alignment }, { text: v(hor.sabado?.final), fontSize: 7, alignment: 'center' as Alignment },
        { text: v(hor.domingo?.inicio), fontSize: 7, alignment: 'center' as Alignment }, { text: v(hor.domingo?.final), fontSize: 7, alignment: 'center' as Alignment },
      ],
      // Adicionar linhas vazias para 2º e 3º turnos se necessário, ou deixar em branco
      [{ text: '2º', style: 'cellValue', alignment: 'center' as Alignment, fontSize: 7 }, {},{},{},{},{},{},{},{},{},{},{},{},{},{}],
      [{ text: '3º', style: 'cellValue', alignment: 'center' as Alignment, fontSize: 7 }, {},{},{},{},{},{},{},{},{},{},{},{},{},{}],
    ]
  )

  const finalClauses = [
    clauseTitle('CLÁUSULA OITAVA – DO CANCELAMENTO DO ESTÁGIO'),
    clauseBody([
      'Constituem motivos para cessação automática do presente Termo de Compromisso:',
      subItem('I -', 'O não cumprimento das cláusulas estabelecidas neste documento;'),
      subItem('II -', 'A conclusão do curso;'),
      subItem('III -', 'O abandono do estágio, do semestre ou do curso;'),
      subItem('IV -', 'O cancelamento ou trancamento da matrícula no curso;'),
      subItem('V -', 'Pedido de rescisão por qualquer das partes definidas na inicial deste termo.')
    ]),

    clauseTitle('CLÁUSULA NOVA – DAS DISPOSIÇÕES ESPECIAIS E DO FORO'),
    clauseBody([
      subItem('I -', 'A todos os partícipes no estágio compete zelar pelo cumprimento deste termo de compromisso.'),
      subItem('II -', 'As partes elegem o Foro da Justiça Federal de Fortaleza, Seção Judiciária do Estado do Ceará, renunciando, desde logo, a qualquer outro, por mais privilégios que venha a ter, para dirimir qualquer questão que se originar deste termo de compromisso e que não possa ser resolvido amigavelmente.'),
      { text: '\nEstando de acordo com o que ficou acima expresso, vai o presente instrumento assinado pelas partes citadas, para que se cumpram os efeitos legais.', margin: [0, 10, 0, 0] as [number, number, number, number] }
    ]),
  ]

  // ── Assinaturas ───────────────────────────────────────────────────────────
  
  const dateLine: Content = {
    text: `Maracanaú-CE, ________ de ________________________ de 20________`,
    margin: [0, 20, 0, 30] as [number, number, number, number],
    alignment: 'center' as Alignment
  }

  const sigRow = (label: string): Content => ({
    stack: [
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 300, y2: 0, lineWidth: 0.5 }], margin: [0, 20, 0, 2] as [number, number, number, number] },
      { text: label, alignment: 'center', fontSize: 9 }
    ],
    alignment: 'center' as Alignment
  })

  const signatureBlocks: Content = {
    stack: [
      sigRow('Representante do IFCE'),
      sigRow('Representante da CONCEDENTE DO ESTÁGIO'),
      sigRow('DISCENTE ESTAGIÁRIO'),
      sigRow('Docente Orientador'),
      sigRow('Supervisor do estágio'),
    ],
    margin: [0, 0, 0, 20] as [number, number, number, number]
  }

  // ── Montagem final ────────────────────────────────────────────────────────
  const content: Content[] = [
    ...header,
    docTitle('TERMO DE COMPROMISSO DE ESTÁGIO'),
    preamble,
    ifceTable,
    { text: '\n' },
    companyTable,
    { text: '\n' },
    studentTable,
    ...clauses,
    scheduleTable,
    ...finalClauses,
    dateLine,
    signatureBlocks,
  ]

  return {
    content,
    styles: {
      clauseHeader: { fontSize: 10, bold: true },
      clauseBody: { fontSize: 9 },
      tableHeader: { fontSize: 8, bold: true, fillColor: '#f3f4f6' },
      cellLabel: { fontSize: 7, color: '#666' },
      cellValue: { fontSize: 9 },
    }
  }
}
