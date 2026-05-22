import type { TDocumentDefinitions, Content, TableCell, Alignment } from 'pdfmake/interfaces'
import { ifceHeader, docTitle, dataTable, cell, sigBlock, fmtDate, v } from '@/lib/pdfmake-base-service'

export interface RealizationTermData {
  // Identification
  student_name?: string
  student_course?: string
  student_enrollment?: string
  advisor_name?: string
  company_name?: string
  company_cnpj?: string
  company_supervisor?: string
  company_supervisor_phone?: string
  start_date?: string
  end_date?: string
  realized_hours?: string

  // Activities
  activities_text?: string

  // Tracking
  tracking_student?: {
    meetings?: boolean
    reports?: boolean
    observation?: boolean
    other?: boolean
    other_text?: string
  }
  tracking_supervisor_advisor?: {
    meetings?: boolean
    phone?: boolean
    visit?: boolean
    other?: boolean
    other_text?: string
  }

  // Evaluation
  overall_evaluation?: 'insuficiente' | 'regular' | 'bom' | 'otimo'
  traits?: {
    assiduidade?: 1 | 2 | 3 | 4
    atendimento_orientacoes?: 1 | 2 | 3 | 4
    comunicacao?: 1 | 2 | 3 | 4
    cooperacao?: 1 | 2 | 3 | 4
    disciplina?: 1 | 2 | 3 | 4
    conhecimento_adquirido?: 1 | 2 | 3 | 4
    pontualidade?: 1 | 2 | 3 | 4
    pontualidade_documentos?: 1 | 2 | 3 | 4
    proatividade?: 1 | 2 | 3 | 4
    produtividade?: 1 | 2 | 3 | 4
    qualidade_desempenho?: 1 | 2 | 3 | 4
    relacionamento_interpessoal?: 1 | 2 | 3 | 4
    responsabilidade?: 1 | 2 | 3 | 4
  }

  suggestions?: string
  city?: string
  supervisor_date?: string
  student_aware_date?: string
}

export async function buildRealizationTermDoc(d: RealizationTermData): Promise<TDocumentDefinitions> {
  const header = await ifceHeader()
  const cb = (checked?: boolean) => (checked ? '( X )' : '(   )')

  const infoTable = dataTable(['*'], [
    [cell('DISCENTE ESTAGIÁRIO', v(d.student_name))],
    [{
      columns: [
        cell('CURSO', v(d.student_course), { width: '70%', border: [false, false, true, true] }),
        cell('MATRÍCULA', v(d.student_enrollment), { width: '30%', border: [false, false, false, true] }),
      ]
    } as TableCell],
    [cell('DOCENTE ORIENTADOR', v(d.advisor_name))],
    [{
      columns: [
        cell('CONCEDENTE DO ESTÁGIO (RAZÃO SOCIAL)', v(d.company_name), { width: '70%', border: [false, false, true, true] }),
        cell('CNPJ', v(d.company_cnpj), { width: '30%', border: [false, false, false, true] }),
      ]
    } as TableCell],
    [{
      columns: [
        cell('SUPERVISOR DO ESTÁGIO', v(d.company_supervisor), { width: '70%', border: [false, false, true, true] }),
        cell('DDD + TELEFONE', v(d.company_supervisor_phone), { width: '30%', border: [false, false, false, true] }),
      ]
    } as TableCell],
    [{
      columns: [
        cell('DATA INICIAL DO ESTÁGIO', fmtDate(d.start_date), { width: '35%', border: [false, false, true, false] }),
        cell('DATA FINAL DO ESTÁGIO', fmtDate(d.end_date), { width: '35%', border: [false, false, true, false] }),
        {
          text: [
            { text: 'CARGA HORÁRIA REALIZADA: ', fontSize: 8, bold: true },
            { text: `${v(d.realized_hours)} HORAS`, fontSize: 8 }
          ],
          margin: [4, 4, 4, 4]
        }
      ]
    } as TableCell]
  ])

  const traits = [
    { label: 'ASSIDUIDADE', value: d.traits?.assiduidade },
    { label: 'ATENDIMENTO ÀS ORIENTAÇÕES', value: d.traits?.atendimento_orientacoes },
    { label: 'COMUNICAÇÃO', value: d.traits?.comunicacao },
    { label: 'COOPERAÇÃO', value: d.traits?.cooperacao },
    { label: 'DISCIPLINA', value: d.traits?.disciplina },
    { label: 'CONHECIMENTO ADQUIRIDO NO ESTÁGIO', value: d.traits?.conhecimento_adquirido },
    { label: 'PONTUALIDADE', value: d.traits?.pontualidade },
    { label: 'PONTUALIDADE NA ENTREGA DE DOCUMENTOS', value: d.traits?.pontualidade_documentos },
    { label: 'PROATIVIDADE', value: d.traits?.proatividade },
    { label: 'PRODUTIVIDADE', value: d.traits?.produtividade },
    { label: 'QUALIDADE NO DESEMPENHO DAS ATIVIDADES', value: d.traits?.qualidade_desempenho },
    { label: 'RELACIONAMENTO INTERPESSOAL', value: d.traits?.relacionamento_interpessoal },
    { label: 'RESPONSABILIDADE', value: d.traits?.responsabilidade },
  ]

  const content: Content[] = [
    ...header,
    docTitle('TERMO DE REALIZAÇÃO DE ESTÁGIO'),
    infoTable,
    { text: '\n' },
    dataTable(['*'], [
      [{ text: 'ATIVIDADES DESENVOLVIDAS NO ESTÁGIO', style: 'tableHeader', alignment: 'center' as Alignment }],
      [{ text: v(d.activities_text), fontSize: 9, margin: [5, 5, 5, 40] }]
    ]),
    { text: '\n' },
    dataTable(['50%', '50%'], [
      [{ text: 'SOBRE O ACOMPANHAMENTO DO ESTÁGIO', style: 'tableHeader', alignment: 'center' as Alignment, colSpan: 2 }, {}],
      [
        {
          stack: [
            { text: 'A AVALIAÇÃO DE DESEMPENHO DO DISCENTE ESTAGIÁRIO FOI REALIZADA ATRAVÉS DE', fontSize: 7, bold: true, alignment: 'center' as Alignment },
            { text: '\n' },
            { text: `${cb(d.tracking_student?.meetings)} REUNIÃO(ÕES)`, fontSize: 8, margin: [10, 0, 0, 2] },
            { text: `${cb(d.tracking_student?.reports)} RELATÓRIO(S)`, fontSize: 8, margin: [10, 0, 0, 2] },
            { text: `${cb(d.tracking_student?.observation)} OBSERVAÇÃO(ÕES)`, fontSize: 8, margin: [10, 0, 0, 2] },
            { text: `${cb(d.tracking_student?.other)} OUTRO(S) MEIO(S) (CITAR ABAIXO)`, fontSize: 8, margin: [10, 0, 0, 2] },
            { text: `_______________________________________`, fontSize: 8, margin: [10, 0, 0, 5], alignment: 'center' as Alignment }
          ]
        },
        {
          stack: [
            { text: 'A COMUNICAÇÃO ENTRE O SUPERVISOR E O DOCENTE ORIENTADOR FOI REALIZADA ATRAVÉS DE', fontSize: 7, bold: true, alignment: 'center' as Alignment },
            { text: '\n' },
            { text: `${cb(d.tracking_supervisor_advisor?.meetings)} REUNIÃO(ÕES)`, fontSize: 8, margin: [10, 0, 0, 2] },
            { text: `${cb(d.tracking_supervisor_advisor?.phone)} TELEFONE`, fontSize: 8, margin: [10, 0, 0, 2] },
            { text: `${cb(d.tracking_supervisor_advisor?.visit)} VISITA(S)`, fontSize: 8, margin: [10, 0, 0, 2] },
            { text: `${cb(d.tracking_supervisor_advisor?.other)} OUTRO(S) MEIO(S) (CITAR ABAIXO)`, fontSize: 8, margin: [10, 0, 0, 2] },
            { text: `_______________________________________`, fontSize: 8, margin: [10, 0, 0, 5], alignment: 'center' as Alignment }
          ]
        }
      ],
      [{
        colSpan: 2,
        columns: [
          { text: 'AVALIAÇÃO', fontSize: 8, bold: true, width: 'auto', margin: [0, 4, 10, 0] },
          { text: `${cb(d.overall_evaluation === 'insuficiente')} INSUFICIENTE`, fontSize: 8, margin: [0, 4, 10, 0] },
          { text: `${cb(d.overall_evaluation === 'regular')} REGULAR`, fontSize: 8, margin: [0, 4, 10, 0] },
          { text: `${cb(d.overall_evaluation === 'bom')} BOM`, fontSize: 8, margin: [0, 4, 10, 0] },
          { text: `${cb(d.overall_evaluation === 'otimo')} ÓTIMO`, fontSize: 8, margin: [0, 4, 10, 0] },
        ]
      } as TableCell, {}]
    ]),
    { text: '\n' },
    dataTable(['75%', '25%'], [
      [{ text: 'AVALIAÇÃO DO DISCENTE ESTAGIÁRIO', style: 'tableHeader', alignment: 'center' as Alignment, colSpan: 2 }, {}],
      [
        {
          stack: [
            { text: 'ATRIBUIR VALORES PARA AS CARACTERÍSTICAS DO DISCENTE ESTAGIÁRIO, DE ACORDO COM OS CONCEITOS:', fontSize: 7, bold: true, alignment: 'center' as Alignment },
            { text: '( 1 ) INSUFICIENTE   ( 2 ) REGULAR   ( 3 ) BOM   ( 4 ) ÓTIMO', fontSize: 7, alignment: 'center' as Alignment, margin: [0, 2, 0, 2] }
          ],
          margin: [0, 5, 0, 5]
        },
        {
          table: {
            widths: ['*'],
            body: traits.map(t => [{
              columns: [
                { text: `(   ) ${t.label}`, fontSize: 7, width: '*' },
                { text: t.value?.toString() || '', fontSize: 7, width: 20, alignment: 'center' as Alignment, bold: true }
              ]
            }])
          },
          layout: 'noBorders'
        }
      ]
    ]),
    { text: '\n' },
    dataTable(['*'], [
      [{ text: 'SUGESTÕES PARA O IFCE MELHORAR A QUALIFICAÇÃO PROFISSIONAL DE SEUS ALUNOS', style: 'tableHeader', alignment: 'center' as Alignment }],
      [{ text: v(d.suggestions), fontSize: 9, margin: [5, 5, 5, 20] }]
    ]),
    { text: '\n' },
    {
      table: {
        widths: ['*', '20%'],
        body: [
          [
            {
              stack: [
                { text: 'SUPERVISOR DO ESTÁGIO', fontSize: 7, bold: true },
                { text: '\n\n' },
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 0.5 }] }
              ]
            },
            {
              stack: [
                { text: 'DATA', fontSize: 7, bold: true, alignment: 'center' as Alignment },
                { text: fmtDate(d.supervisor_date) || '___/___/___', fontSize: 8, alignment: 'center' as Alignment, margin: [0, 5, 0, 0] }
              ]
            }
          ],
          [
            {
              stack: [
                { text: 'DISCENTE ESTAGIÁRIO', fontSize: 7, bold: true },
                { text: '\n\n' },
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 0.5 }] }
              ]
            },
            {
              stack: [
                { text: 'CIENTE EM', fontSize: 7, bold: true, alignment: 'center' as Alignment },
                { text: fmtDate(d.student_aware_date) || '___/___/___', fontSize: 8, alignment: 'center' as Alignment, margin: [0, 5, 0, 0] }
              ]
            }
          ]
        ]
      }
    }
  ]

  return {
    content,
    styles: {
      tableHeader: { fontSize: 8, bold: true, fillColor: '#f3f4f6' },
      cellValue: { fontSize: 9 }
    }
  }
}
