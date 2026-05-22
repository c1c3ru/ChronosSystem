import type { TDocumentDefinitions, Content, TableCell, Alignment } from 'pdfmake/interfaces'
import {
  ifceHeader,
  docTitle,
  dataTable,
  cell,
  sigBlock,
  fmtDate,
  v,
} from '@/lib/pdfmake-base-service'

export interface RescissionTermData {
  // IFCE Campus Info
  campus_name?: string
  campus_cnpj?: string
  campus_address?: string
  campus_neighborhood?: string
  campus_city?: string
  campus_cep?: string
  campus_phone?: string
  campus_email?: string
  campus_representative?: string
  campus_rep_role?: string
  campus_rep_siape?: string
  campus_rep_email?: string
  campus_rep_phone?: string

  // Concedente Info
  company_name?: string
  company_fantasy_name?: string
  company_cnpj?: string
  company_address?: string
  company_neighborhood?: string
  company_city?: string
  company_cep?: string
  company_phone?: string
  company_email?: string
  company_representative?: string
  company_rep_role?: string
  company_rep_cpf?: string
  company_rep_phone?: string

  // Student Info
  student_name?: string
  student_social_name?: string
  student_cpf?: string
  student_rg?: string
  student_enrollment?: string
  student_course?: string
  student_period?: string
  student_address?: string
  student_neighborhood?: string
  student_city?: string
  student_cep?: string
  student_phone?: string
  student_email?: string

  // Term Info
  internship_type?: 'obrigatorio' | 'nao_obrigatorio'
  internship_mode?: 'presencial' | 'virtual'
  internship_start_date?: string
  internship_end_date?: string
  original_term_date?: string
  rescission_date?: string
  total_hours_realized?: string

  // Motivation Info
  initiator?: 'ifce' | 'company' | 'student'
  reason?:
    | 'breach'
    | 'completion'
    | 'abandonment_activities'
    | 'abandonment_course'
    | 'cancellation'
    | 'suspension'
    | 'other'
  reason_other?: string
  rescission_reason?: string
  city?: string
}

export async function buildRescissionTermDoc(d: RescissionTermData): Promise<TDocumentDefinitions> {
  const header = await ifceHeader()
  const cb = (checked: boolean) => (checked ? '(X)' : '( )')

  const ifceTable = dataTable(
    ['*'],
    [
      [
        {
          text: 'Instituição de Ensino – IFCE',
          style: 'tableHeader',
          alignment: 'center' as Alignment,
        },
      ],
      [
        {
          columns: [
            cell('CAMPUS', v(d.campus_name), { width: '50%', border: [false, false, true, true] }),
            cell('CNPJ', v(d.campus_cnpj), { width: '50%', border: [false, false, false, true] }),
          ],
        } as TableCell,
      ],
      [cell('ENDEREÇO (LOGRADOURO, NÚMERO E COMPLEMENTO)', v(d.campus_address))],
      [
        {
          columns: [
            cell('BAIRRO', v(d.campus_neighborhood), {
              width: '40%',
              border: [false, false, true, true],
            }),
            cell('MUNICÍPIO', v(d.campus_city), {
              width: '40%',
              border: [false, false, true, true],
            }),
            cell('CEP', v(d.campus_cep), { width: '20%', border: [false, false, false, true] }),
          ],
        } as TableCell,
      ],
      [
        {
          columns: [
            cell('DDD + TELEFONE', v(d.campus_phone), {
              width: '40%',
              border: [false, false, true, true],
            }),
            cell('E-MAIL', v(d.campus_email), {
              width: '60%',
              border: [false, false, false, true],
            }),
          ],
        } as TableCell,
      ],
      [cell('REPRESENTANTE PARA ESTE ESPECÍFICO FIM', v(d.campus_representative))],
      [
        {
          columns: [
            cell('CARGO/QUALIFICAÇÃO', v(d.campus_rep_role), {
              width: '70%',
              border: [false, false, true, true],
            }),
            cell('SIAPE', v(d.campus_rep_siape), {
              width: '30%',
              border: [false, false, false, true],
            }),
          ],
        } as TableCell,
      ],
      [
        {
          columns: [
            cell('E-MAIL', v(d.campus_rep_email), {
              width: '60%',
              border: [false, false, true, true],
            }),
            cell('DDD+TELEFONE', v(d.campus_rep_phone), {
              width: '40%',
              border: [false, false, false, true],
            }),
          ],
        } as TableCell,
      ],
    ]
  )

  const companyTable = dataTable(
    ['*'],
    [
      [
        {
          text: 'Instituição Concedente de vaga de estágio – CONCEDENTE DO ESTÁGIO',
          style: 'tableHeader',
          alignment: 'center' as Alignment,
        },
      ],
      [cell('RAZÃO SOCIAL', v(d.company_name))],
      [cell('NOME DE FANTASIA OU DE PESSOA FÍSICA', v(d.company_fantasy_name))],
      [
        {
          columns: [
            cell('CNPJ OU REGISTRO NO CONSELHO', v(d.company_cnpj), {
              width: '50%',
              border: [false, false, true, true],
            }),
            cell('ENDEREÇO (LOGRADOURO, NÚMERO E COMPLEMENTO)', v(d.company_address), {
              width: '50%',
              border: [false, false, false, true],
            }),
          ],
        } as TableCell,
      ],
      [
        {
          columns: [
            cell('BAIRRO', v(d.company_neighborhood), {
              width: '40%',
              border: [false, false, true, true],
            }),
            cell('MUNICÍPIO', v(d.company_city), {
              width: '40%',
              border: [false, false, true, true],
            }),
            cell('CEP', v(d.company_cep), { width: '20%', border: [false, false, false, true] }),
          ],
        } as TableCell,
      ],
      [
        {
          columns: [
            cell('DDD + TELEFONE', v(d.company_phone), {
              width: '40%',
              border: [false, false, true, true],
            }),
            cell('E-MAIL', v(d.company_email), {
              width: '60%',
              border: [false, false, false, true],
            }),
          ],
        } as TableCell,
      ],
      [cell('REPRESENTANTE LEGAL PARA ASSINATURA DESTE TERMO', v(d.company_representative))],
      [
        {
          columns: [
            cell('CARGO/QUALIFICAÇÃO', v(d.company_rep_role), {
              width: '40%',
              border: [false, false, true, true],
            }),
            cell('CPF', v(d.company_rep_cpf), { width: '30%', border: [false, false, true, true] }),
            cell('DDD + TELEFONE', v(d.company_rep_phone), {
              width: '30%',
              border: [false, false, false, true],
            }),
          ],
        } as TableCell,
      ],
    ]
  )

  const studentTable = dataTable(
    ['*'],
    [
      [{ text: 'Discente Estagiário(A)', style: 'tableHeader', alignment: 'center' as Alignment }],
      [
        {
          columns: [
            cell('NOME', v(d.student_name), { width: '70%', border: [false, false, true, true] }),
            cell('CPF', v(d.student_cpf), { width: '30%', border: [false, false, false, true] }),
          ],
        } as TableCell,
      ],
      [cell('NOME SOCIAL', v(d.student_social_name))],
      [
        {
          columns: [
            cell('CURSO', v(d.student_course), {
              width: '70%',
              border: [false, false, true, true],
            }),
            cell('MATRÍCULA', v(d.student_enrollment), {
              width: '30%',
              border: [false, false, false, true],
            }),
          ],
        } as TableCell,
      ],
      [cell('ENDEREÇO (LOGRADOURO, NÚMERO E COMPLEMENTO)', v(d.student_address))],
      [
        {
          columns: [
            cell('MUNICÍPIO-UF', v(d.student_city), {
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
      ],
      [
        {
          columns: [
            cell('E-MAIL INSTITUCIONAL', v(d.student_email), {
              width: '50%',
              border: [false, false, true, true],
            }),
            cell('E-MAIL PESSOAL', '', { width: '50%', border: [false, false, false, true] }),
          ],
        } as TableCell,
      ],
    ]
  )

  const termBox = dataTable(
    ['33%', '33%', '34%'],
    [
      [
        {
          text: 'TERMO DE COMPROMISSO DE ESTÁGIO',
          style: 'tableHeader',
          alignment: 'center' as Alignment,
          colSpan: 3,
        },
        {},
        {},
      ],
      [
        { text: 'TIPO DE ESTÁGIO', style: 'tableHeader', alignment: 'center' as Alignment },
        { text: 'MODO DE ESTÁGIO', style: 'tableHeader', alignment: 'center' as Alignment },
        { text: 'DATA ORIGINAL', style: 'tableHeader', alignment: 'center' as Alignment },
      ],
      [
        {
          text: `${cb(d.internship_type === 'nao_obrigatorio')} NÃO OBRIGATÓRIO  ${cb(d.internship_type === 'obrigatorio')} OBRIGATÓRIO`,
          fontSize: 7,
          alignment: 'center' as Alignment,
          margin: [0, 5, 0, 5],
        },
        {
          text: `${cb(d.internship_mode === 'presencial')} PRESENCIAL  ${cb(d.internship_mode === 'virtual')} VIRTUAL`,
          fontSize: 7,
          alignment: 'center' as Alignment,
          margin: [0, 5, 0, 5],
        },
        {
          text: fmtDate(d.original_term_date),
          alignment: 'center' as Alignment,
          fontSize: 8,
          margin: [0, 5, 0, 5],
        },
      ],
    ]
  )

  const content: Content[] = [
    ...header,
    docTitle('TERMO DE RESCISÃO DE COMPROMISSO DE ESTÁGIO'),
    {
      text: 'Nos termos da Lei nº 11.788, de 25/09/2008 e do Regulamento de Estágio do IFCE, os entes abaixo qualificados RESCINDEM Termo de Compromisso de Estágio sub-referido, pelos motivos e na forma que seguem.',
      fontSize: 10,
      alignment: 'justify' as Alignment,
      margin: [0, 5, 0, 10],
    },
    ifceTable,
    { text: '\n' },
    companyTable,
    { text: '\n' },
    studentTable,
    { text: '', pageBreak: 'after' },

    termBox,
    { text: '\n' },
    {
      text: 'CLÁUSULA PRIMEIRA – DAS CONDIÇÕES DA RESCISÃO',
      bold: true,
      fontSize: 10,
      margin: [0, 10, 0, 5],
    },
    {
      stack: [
        {
          columns: [
            { text: 'I -', width: 20 },
            {
              text: [
                'O Termo de Compromisso de Estágio ',
                { text: 'suprarreferido', decoration: 'underline' },
                ' torna-se sem efeito jurídico a partir de ',
                { text: fmtDate(d.rescission_date), decoration: 'underline' },
                '.',
              ],
            },
          ],
        },
        {
          columns: [
            { text: 'II -', width: 20 },
            {
              text: 'A partir desta data é imediata a suspensão da cobertura do seguro de vida obrigatório.',
            },
          ],
        },
        {
          columns: [
            { text: 'III -', width: 20 },
            {
              text: `A carga horária referente a atividades realizadas até a data da rescisão é de ${v(d.total_hours_realized)} horas.`,
            },
          ],
        },
        {
          columns: [
            { text: 'IV -', width: 20 },
            {
              text: 'O Supervisor do estágio emitirá Termo de Realização de Estágio referente à carga horária realizada constante do inciso III.',
            },
          ],
        },
      ],
      fontSize: 10,
      margin: [0, 0, 0, 15],
    },

    {
      text: 'CLÁUSULA SEGUNDA – DAS MOTIVAÇÕES DA RESCISÃO',
      bold: true,
      fontSize: 10,
      margin: [0, 10, 0, 5],
    },
    {
      stack: [
        { text: 'I -    A motivação da rescisão inicia-se:', fontSize: 10, margin: [0, 5, 0, 5] },
        { text: `${cb(d.initiator === 'ifce')} a) Pelo IFCE`, fontSize: 10, margin: [20, 0, 0, 2] },
        {
          text: `${cb(d.initiator === 'company')} b) Pela Concedente do Estágio`,
          fontSize: 10,
          margin: [20, 0, 0, 2],
        },
        {
          text: `${cb(d.initiator === 'student')} c) Pelo Discente Estagiário`,
          fontSize: 10,
          margin: [20, 0, 0, 10],
        },

        {
          text: 'II -   A justificativa apresentada pela parte motivadora foi:',
          fontSize: 10,
          margin: [0, 5, 0, 5],
        },
        {
          text: `${cb(d.reason === 'breach')} a) Descumprimento de cláusula(s) estabelecida(s) no Termo de Compromisso de Estágio;`,
          fontSize: 10,
          margin: [20, 0, 0, 2],
        },
        {
          text: `${cb(d.reason === 'completion')} b) Conclusão do curso`,
          fontSize: 10,
          margin: [20, 0, 0, 2],
        },
        {
          text: `${cb(d.reason === 'abandonment_activities')} c) Abandono das atividades de estágio`,
          fontSize: 10,
          margin: [20, 0, 0, 2],
        },
        {
          text: `${cb(d.reason === 'abandonment_course')} d) Abandono do semestre ou do curso`,
          fontSize: 10,
          margin: [20, 0, 0, 2],
        },
        {
          text: `${cb(d.reason === 'cancellation')} e) Cancelamento de matrícula`,
          fontSize: 10,
          margin: [20, 0, 0, 2],
        },
        {
          text: `${cb(d.reason === 'suspension')} f) Trancamento de matrícula`,
          fontSize: 10,
          margin: [20, 0, 0, 2],
        },
        {
          text: `${cb(d.reason === 'other')} g) ( ) Outra: ${v(d.reason_other)}`,
          fontSize: 10,
          margin: [20, 0, 0, 15],
        },
      ],
    },

    {
      text: 'Estando de acordo com rescisão, vai o presente instrumento assinado pelas partes citadas, para que se cumpram os efeitos legais.',
      fontSize: 10,
      margin: [0, 10, 0, 10],
    },
    {
      text: `${v(d.city) || 'Maracanaú'}-CE, ______ de ____________________ de 20____.`,
      alignment: 'center' as Alignment,
      margin: [0, 20, 0, 30],
    },

    {
      canvas: [{ type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 0.5 }],
      alignment: 'center' as Alignment,
    },
    {
      text: 'Representante do IFCE',
      alignment: 'center' as Alignment,
      fontSize: 8,
      margin: [0, 2, 0, 20],
    },

    {
      canvas: [{ type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 0.5 }],
      alignment: 'center' as Alignment,
    },
    {
      text: 'Representante da CONCEDENTE DO ESTÁGIO',
      alignment: 'center' as Alignment,
      fontSize: 8,
      margin: [0, 2, 0, 20],
    },

    {
      canvas: [{ type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 0.5 }],
      alignment: 'center' as Alignment,
    },
    {
      text: 'Discente Estagiário',
      alignment: 'center' as Alignment,
      fontSize: 8,
      margin: [0, 2, 0, 20],
    },

    {
      canvas: [{ type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 0.5 }],
      alignment: 'center' as Alignment,
    },
    {
      text: 'Docente Orientador',
      alignment: 'center' as Alignment,
      fontSize: 8,
      margin: [0, 2, 0, 20],
    },

    {
      canvas: [{ type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 0.5 }],
      alignment: 'center' as Alignment,
    },
    {
      text: 'Supervisor do estágio',
      alignment: 'center' as Alignment,
      fontSize: 8,
      margin: [0, 2, 0, 10],
    },
  ]

  return {
    content,
    styles: {
      tableHeader: { fontSize: 8, bold: true, fillColor: '#f3f4f6' },
      cellValue: { fontSize: 9 },
    },
  }
}
