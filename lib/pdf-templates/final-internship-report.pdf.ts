import type { TDocumentDefinitions, Content, TableCell, Alignment } from 'pdfmake/interfaces'
import { ifceHeader, docTitle, dataTable, cell, sigBlock, fmtDate, v } from '@/lib/pdfmake-base-service'

export interface FinalInternshipReportData {
  student_name?: string
  student_social_name?: string
  course?: string
  campus?: string
  advisor_name?: string
  local?: string
  ano?: string
  resumo?: string
  palavras_chave?: string
  enrollment?: string
  company_name?: string
  company_fantasy_name?: string
  company_cnpj?: string
  company_industry?: string
  internship_sector?: string
  supervisor_name?: string
  supervisor_education?: string
  supervisor_role?: string
  internship_type?: 'obrigatorio' | 'nao_obrigatorio'
  internship_mode?: 'presencial' | 'virtual'
  start_date?: string
  end_date?: string
  total_hours?: string
  activities_leveraged?: string // extensão | ic | monitoria | etc
  // Section 2 - Desenvolvimento
  desenvolvimento_text?: string
  // Section 3 - Avaliações (keys match the UI labels)
  eval_auto?: Record<string, string> // assiduidade: 'bom', etc
  eval_supervisor?: Record<string, string>
  eval_geral?: string // insatisfeito | satisfatorio | etc
  eval_auto_complement?: string
  // Section 4
  consideracoes_finais?: string
  consideracoes_matriz?: string
  solicitation_date?: string
}

export async function buildFinalInternshipReportDoc(d: FinalInternshipReportData): Promise<TDocumentDefinitions> {
  const header = await ifceHeader()

  const cb = (checked: boolean) => (checked ? '(X)' : '( )')

  // --- Capa ---
  const capa: Content[] = [
    { text: v(d.student_name).toUpperCase(), alignment: 'center' as Alignment, fontSize: 12, bold: true, margin: [0, 50, 0, 100] },
    { text: 'RELATÓRIO FINAL DE ESTÁGIO OBRIGATÓRIO', alignment: 'center' as Alignment, fontSize: 14, bold: true, margin: [0, 0, 0, 150] },
    {
      text: [
        'Relatório Final de Estágio Obrigatório apresentado ao curso ',
        { text: v(d.course), decoration: 'underline' },
        ' do Instituto Federal de Educação, Ciência e Tecnologia do Ceará – IFCE campus ',
        { text: v(d.campus), decoration: 'underline' },
        ' sob orientação do(a) docente ',
        { text: v(d.advisor_name), decoration: 'underline' },
        '.'
      ],
      alignment: 'justify' as Alignment,
      fontSize: 11,
      margin: [150, 0, 0, 150]
    },
    { text: `${v(d.local).toUpperCase()} / ${v(d.ano)}`, alignment: 'center' as Alignment, fontSize: 12, bold: true, pageBreak: 'after' }
  ]

  // --- Resumo ---
  const resumoPage: Content[] = [
    { text: 'RESUMO', alignment: 'center' as Alignment, fontSize: 12, bold: true, margin: [0, 0, 0, 20] },
    { text: v(d.resumo), alignment: 'justify' as Alignment, fontSize: 11, margin: [0, 0, 0, 20], lineHeight: 1.5 },
    { text: `Palavras-chaves: ${v(d.palavras_chave)}`, fontSize: 11, bold: true, pageBreak: 'after' }
  ]

  // --- Sumário ---
  const sumarioPage: Content[] = [
    { text: 'SUMÁRIO', alignment: 'center' as Alignment, fontSize: 12, bold: true, margin: [0, 0, 0, 20] },
    {
      stack: [
        { columns: [{ text: 'Resumo', width: '*' }, { text: '........ pg', width: 'auto' }] },
        { columns: [{ text: 'Introdução', width: '*' }, { text: '........ pg', width: 'auto' }] },
        { columns: [{ text: 'Desenvolvimento', width: '*' }, { text: '........ pg', width: 'auto' }] },
        { columns: [{ text: 'Avaliação', width: '*' }, { text: '........ pg', width: 'auto' }] },
        { columns: [{ text: 'Considerações', width: '*' }, { text: '........ pg', width: 'auto' }] },
      ],
      fontSize: 11,
      margin: [0, 0, 0, 20],
      lineHeight: 1.5
    },
    { text: '', pageBreak: 'after' }
  ]

  // --- 1. Introdução ---
  const studentTable = dataTable(['*'], [
    [{ text: 'DISCENTE ESTAGIÁRIO(A)', style: 'tableHeader', alignment: 'center' as Alignment }],
    [cell('NOME', v(d.student_name))],
    [cell('NOME SOCIAL', v(d.student_social_name))],
    [{
      columns: [
        cell('CURSO', v(d.course), { border: [false, false, true, true] }),
        cell('MATRÍCULA', v(d.enrollment), { border: [false, false, false, true] }),
      ]
    } as TableCell]
  ])

  const companyTable = dataTable(['*'], [
    [{ text: 'CONCEDENTE DO ESTÁGIO', style: 'tableHeader', alignment: 'center' as Alignment }],
    [cell('RAZÃO SOCIAL', v(d.company_name))],
    [cell('NOME DE FANTASIA OU DE PESSOA FÍSICA', v(d.company_fantasy_name))],
    [{
      columns: [
        cell('CNPJ OU REGISTRO NO CONSELHO', v(d.company_cnpj), { border: [false, false, true, true] }),
        cell('RAMO DE ATIVIDADE', v(d.company_industry), { border: [false, false, false, true] }),
      ]
    } as TableCell],
    [cell('ÁREA/SETOR DE REALIZAÇÃO DO ESTÁGIO', v(d.internship_sector))]
  ])

  const supervisorTable = dataTable(['*'], [
    [{ text: 'SUPERVISOR DO ESTÁGIO', style: 'tableHeader', alignment: 'center' as Alignment }],
    [cell('NOME', v(d.supervisor_name))],
    [cell('FORMAÇÃO/EXPERIÊNCIA PROFISSIONAL', v(d.supervisor_education))],
    [cell('CARGO/FUNÇÃO NA CONCEDENTE DE ESTÁGIO', v(d.supervisor_role))]
  ])

  const dataTableEstagio = dataTable(['20%', '20%', '20%', '20%', '20%'], [
    [
      { text: 'TIPO', style: 'tableHeader', alignment: 'center' as Alignment },
      { text: 'MODO', style: 'tableHeader', alignment: 'center' as Alignment },
      { text: 'DATA INICIAL', style: 'tableHeader', alignment: 'center' as Alignment },
      { text: 'DATA FINAL', style: 'tableHeader', alignment: 'center' as Alignment },
      { text: 'CARGA HORÁRIA', style: 'tableHeader', alignment: 'center' as Alignment },
    ],
    [
      { stack: [{ text: `${cb(d.internship_type === 'nao_obrigatorio')} NÃO OBRIGATÓRIO`, fontSize: 7 }, { text: `${cb(d.internship_type === 'obrigatorio')} OBRIGATÓRIO`, fontSize: 7 }], margin: [2, 2, 2, 2] },
      { stack: [{ text: `${cb(d.internship_mode === 'presencial')} PRESENCIAL`, fontSize: 7 }, { text: `${cb(d.internship_mode === 'virtual')} VIRTUAL`, fontSize: 7 }], margin: [2, 2, 2, 2] },
      { text: fmtDate(d.start_date), alignment: 'center' as Alignment, fontSize: 8, margin: [0, 5, 0, 5] },
      { text: fmtDate(d.end_date), alignment: 'center' as Alignment, fontSize: 8, margin: [0, 5, 0, 5] },
      { text: `${v(d.total_hours)} HORAS`, alignment: 'center' as Alignment, fontSize: 8, margin: [0, 5, 0, 5] },
    ]
  ])

  const activitiesLeveragedTable = dataTable(['*'], [
    [{ text: 'ATIVIDADES DO ESTÁGIO APROVEITADAS', style: 'tableHeader', alignment: 'center' as Alignment }],
    [{
      columns: [
        { stack: [{ text: `${cb(d.activities_leveraged === 'extensao')} EXTENSÃO`, fontSize: 7 }, { text: `${cb(d.activities_leveraged === 'ic')} INICIAÇÃO CIENTÍFICA`, fontSize: 7 }], width: '33%' },
        { stack: [{ text: `${cb(d.activities_leveraged === 'monitoria')} MONITORIA`, fontSize: 7 }, { text: `${cb(d.activities_leveraged === 'terceiro_setor')} MEMBRO DE INSTITUIÇÃO DO 3º SETOR`, fontSize: 7 }], width: '33%' },
        { stack: [{ text: `${cb(d.activities_leveraged === 'trabalho_clt')} TRABALHO FORMAL CELETISTA`, fontSize: 7 }, { text: `${cb(d.activities_leveraged === 'trabalho_estatutario')} TRABALHO FORMAL ESTATUTÁRIO`, fontSize: 7 }, { text: `${cb(d.activities_leveraged === 'nao_se_aplica')} NÃO SE APLICA`, fontSize: 7 }], width: '34%' },
      ],
      margin: [4, 4, 4, 4]
    }]
  ])

  // --- 3. Avaliações ---
  const evalHeaders = ['', 'INSUFICIENTE', 'REGULAR', 'BOM', 'ÓTIMO']
  const autoEvalItems = [
    { key: 'assiduidade', label: 'ASSIDUIDADE' },
    { key: 'atendimento_orientacoes', label: 'ATENDIMENTO ÀS ORIENTAÇÕES' },
    { key: 'comunicacao', label: 'COMUNICAÇÃO' },
    { key: 'cooperacao', label: 'COOPERAÇÃO' },
    { key: 'disciplina', label: 'DISCIPLINA' },
    { key: 'conhecimento_adquirido', label: 'CONHECIMENTO ADQUIRIDO NO ESTÁGIO' },
    { key: 'pontualidade', label: 'PONTUALIDADE' },
    { key: 'pontualidade_documentos', label: 'PONTUALIDADE NA ENTREGA DE DOCUMENTOS' },
    { key: 'proatividade', label: 'PROATIVIDADE' },
    { key: 'produtividade', label: 'PRODUTIVIDADE' },
    { key: 'qualidade_desempenho', label: 'QUALIDADE NO DESEMPENHO DAS ATIVIDADES' },
    { key: 'relacionamento_interpessoal', label: 'RELACIONAMENTO INTERPESSOAL' },
    { key: 'responsabilidade', label: 'RESPONSABILIDADE' },
  ]

  const supervisorEvalItems = [
    { key: 'acompanhamento', label: 'ACOMPANHAMENTO, SUPERVISÃO E CONTROLE DAS ATIVIDADES' },
    { key: 'colaboracao_plano', label: 'COLABORAÇÃO NA ELABORAÇÃO DO PLANO DE ATIVIDADES' },
    { key: 'comunicacao_discente', label: 'COMUNICAÇÃO COM O DISCENTE ESTAGIÁRIO' },
    { key: 'comunicacao_orientador', label: 'COMUNICAÇÃO COM DOCENTE ORIENTADOR' },
    { key: 'instrucoes', label: 'CORREÇÕES, ENSINAMENTOS E INSTRUÇÕES DAS ATIVIDADES' },
    { key: 'prazos', label: 'PREENCHIMENTO E ENTREGA DOS DOCUMENTOS NOS PRAZOS' },
    { key: 'relacionamento', label: 'RELACIONAMENTO INTERPESSOAL' },
  ]

  interface EvalItem {
    key: string
    label: string
  }

  const buildEvalRows = (items: EvalItem[], data: Record<string, string>) => items.map(item => [
    { text: item.label, fontSize: 8 },
    { text: cb(data[item.key] === 'insuficiente'), alignment: 'center' as Alignment },
    { text: cb(data[item.key] === 'regular'), alignment: 'center' as Alignment },
    { text: cb(data[item.key] === 'bom'), alignment: 'center' as Alignment },
    { text: cb(data[item.key] === 'otimo'), alignment: 'center' as Alignment },
  ])

  const autoEvalTable = dataTable(['40%', '15%', '15%', '15%', '15%'], [
    evalHeaders.map(h => ({ text: h, style: 'tableHeader', alignment: 'center' as Alignment })),
    ...buildEvalRows(autoEvalItems, d.eval_auto || {})
  ])

  const supervisorEvalTable = dataTable(['40%', '15%', '15%', '15%', '15%'], [
    evalHeaders.map(h => ({ text: h, style: 'tableHeader', alignment: 'center' as Alignment })),
    ...buildEvalRows(supervisorEvalItems, d.eval_supervisor || {})
  ])

  const generalEvalTable = dataTable(['25%', '25%', '25%', '25%'], [[
    { text: `${cb(d.eval_geral === 'insatisfeito')} INSATISFATÓRIO`, fontSize: 8 },
    { text: `${cb(d.eval_geral === 'satisfatorio')} SATISFATÓRIO`, fontSize: 8 },
    { text: `${cb(d.eval_geral === 'pouco_satisfatorio')} POUCO SATISFATÓRIO`, fontSize: 8 },
    { text: `${cb(d.eval_geral === 'muito_satisfatorio')} MUITO SATISFATÓRIO`, fontSize: 8 },
  ]])

  const content: Content[] = [
    ...header,
    ...capa,
    ...resumoPage,
    ...sumarioPage,
    { text: '1. INTRODUÇÃO: Identificação dos atores e entes envolvidos no estágio', style: 'sectionTitle', margin: [0, 0, 0, 10] },
    studentTable,
    { text: '\n' },
    companyTable,
    { text: '\n' },
    supervisorTable,
    { text: '\n' },
    dataTableEstagio,
    { text: '\n' },
    activitiesLeveragedTable,
    { text: '\n', pageBreak: 'after' },

    { text: '2. DESENVOLVIMENTO', style: 'sectionTitle', margin: [0, 0, 0, 10] },
    {
      ul: [
        'Descrição da estrutura ofertada pela concedente para a realização do estágio;',
        'Descrição das atividades planejadas e realizadas durante o período de estágio;',
        'Descrição dos resultados esperados e alcançados durante o período do estágio;',
        'Informação das dificuldades encontradas durante seu estágio;',
        'Informação das soluções para os problemas enfrentados;',
        'Citação de conhecimentos teóricos e práticos adquiridos no estágio...',
        'Comparação entre os conhecimentos adquiridos na instituição de ensino e as atividades práticas desenvolvidas na parte concedente do estágio.'
      ],
      fontSize: 9,
      margin: [0, 0, 0, 10],
      italics: true,
      color: '#666'
    },
    { text: v(d.desenvolvimento_text), alignment: 'justify' as Alignment, fontSize: 11, lineHeight: 1.5, pageBreak: 'after' },

    { text: '3. AVALIAÇÕES', style: 'sectionTitle', margin: [0, 0, 0, 10] },
    { text: 'AUTO AVALIAÇÃO', style: 'tableHeader', alignment: 'center' as Alignment, margin: [0, 5, 0, 5] },
    autoEvalTable,
    { text: 'COMPLEMENTAR AUTO AVALIAÇÃO ATRAVÉS DE ASPECTOS DO APRENDIZADO', style: 'tableHeader', margin: [0, 10, 0, 5] },
    { text: v(d.eval_auto_complement), fontSize: 10, margin: [0, 0, 0, 20] },

    { text: 'AVALIAÇÃO DA SUPERVISÃO DO ESTÁGIO', style: 'tableHeader', alignment: 'center' as Alignment, margin: [0, 5, 0, 5] },
    supervisorEvalTable,

    { text: 'AVALIAÇÃO GERAL SOBRE O ESTÁGIO', style: 'tableHeader', alignment: 'center' as Alignment, margin: [0, 10, 0, 5] },
    generalEvalTable,
    { text: '\n', pageBreak: 'after' },

    { text: '4. CONSIDERAÇÕES FINAIS', style: 'sectionTitle', margin: [0, 0, 0, 10] },
    { text: '4.1. Opinar sobre:', bold: true, fontSize: 11, margin: [0, 0, 0, 5] },
    {
      ul: [
        'A estrutura do local onde foram realizadas as atividades do estágio;',
        'O alinhamento entre as atividades planejadas e realizadas...',
        'A importância do estágio realizado para a sua formação profissional;',
        'Os desafios do trabalho a partir de percepções pós estágio.'
      ],
      fontSize: 9,
      margin: [0, 0, 0, 10],
      italics: true,
      color: '#666'
    },
    { text: v(d.consideracoes_finais), alignment: 'justify' as Alignment, fontSize: 11, lineHeight: 1.5, margin: [0, 0, 0, 20] },
    { text: '4.2. Indicação de Áreas de Conhecimento:', bold: true, fontSize: 11, margin: [0, 0, 0, 10] },
    { text: v(d.consideracoes_matriz), alignment: 'justify' as Alignment, fontSize: 11, lineHeight: 1.5 },

    { text: '\n\n' },
    { text: `${v(d.local)}-CE, ______de ____________________de 20____.`, alignment: 'center' as Alignment, margin: [0, 50, 0, 50] },
    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 300, y2: 0, lineWidth: 0.5 }], alignment: 'center' as Alignment },
    { text: 'DISCENTE ESTAGIÁRIO(A)', alignment: 'center' as Alignment, fontSize: 10, margin: [0, 5, 0, 0] },

    { text: 'REFERÊNCIAS', style: 'sectionTitle', margin: [0, 50, 0, 10], pageBreak: 'before' },
    { text: '(Insira as referências aqui)', italics: true, fontSize: 10 },

    { text: 'ANEXOS', style: 'sectionTitle', margin: [0, 50, 0, 10], pageBreak: 'before' },
    { text: '(Imagens, planilhas, outros documentos)', italics: true, fontSize: 10 },
  ]

  return {
    content,
    styles: {
      sectionTitle: { fontSize: 12, bold: true, color: '#2c3e50' },
      tableHeader: { fontSize: 9, bold: true, fillColor: '#f3f4f6' },
      cellValue: { fontSize: 10 }
    }
  }
}
