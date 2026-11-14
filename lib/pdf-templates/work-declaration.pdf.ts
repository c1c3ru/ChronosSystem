/**
 * Template pdfmake da "Declaração de Proprietário" e da "Declaração de Atividades de Profissional
 * Liberal ou Autônomo" (modelos oficiais da PROEXT/IFCE). O documento é emitido pela empresa ou
 * pelo profissional, então o cabeçalho traz os dados do declarante, não a logomarca do IFCE.
 */
import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces'
import { docTitle, fmtDate } from '@/lib/pdfmake-base-service'
import {
  MAX_ACTIVITIES,
  PROFESSIONAL_TYPES,
  WORK_DECLARATIONS,
  longDate,
  parseActivities,
  type WorkDeclarationKind,
} from '@/lib/work-declaration'

export interface WorkDeclarationData {
  declarant_name?: string
  declarant_rg?: string
  declarant_cpf?: string
  /** Proprietário */
  company_name?: string
  company_cnpj?: string
  company_industry?: string
  /** Autônomo ou profissional liberal */
  professional_type?: string
  profession?: string
  council_name?: string
  council_number?: string
  /** Desde quando é proprietário ou exerce a profissão (YYYY-MM-DD) */
  since_date?: string
  activities?: string
  /** Cabeçalho */
  header_address?: string
  header_phone?: string
  header_email?: string
  city?: string
  declaration_date?: string
}

const BLANK = '____________________'
const fill = (value?: string, blank = BLANK) => (value && value.trim() ? value.trim() : blank)
const bold = (value?: string, blank = BLANK) => ({ text: fill(value, blank), bold: true })

function declarationText(kind: WorkDeclarationKind, d: WorkDeclarationData): Content {
  const intro = [
    'Declaro para fins de aproveitamento de horas como atividade de estágio supervisionado obrigatório no Instituto Federal de Educação, Ciência e Tecnologia do Ceará (IFCE) que eu, ',
    bold(d.declarant_name, '_____________________________________________'),
    ', RG ',
    bold(d.declarant_rg),
    ', CPF ',
    bold(d.declarant_cpf),
    ', ',
  ]

  const since = { text: d.since_date ? fmtDate(d.since_date) : '____/____/______', bold: true }

  if (kind === 'owner') {
    return {
      text: [
        ...intro,
        'sou proprietário(a) da empresa ',
        bold(d.company_name, '_____________________________________________'),
        ', CNPJ ',
        bold(d.company_cnpj),
        ', desde ',
        since,
        ', que atua no ramo de atividades ',
        bold(d.company_industry, '_____________________________________________'),
        ', onde desempenho as seguintes atividades:',
      ],
      style: 'sectionBody',
    }
  }

  const type = PROFESSIONAL_TYPES.find((t) => t.value === d.professional_type)
  const isLiberal = d.professional_type === 'liberal'
  const council = isLiberal
    ? [
        ', com registro no conselho ',
        bold(d.council_name, '______________________________'),
        ' com número ',
        bold(d.council_number),
      ]
    : []

  return {
    text: [
      ...intro,
      'sou ',
      bold(d.profession, '______________________________'),
      ` (${type ? type.label.toLowerCase() : 'profissional liberal ou autônomo'})`,
      ...council,
      ', desde ',
      since,
      ', exercendo as seguintes atividades:',
    ],
    style: 'sectionBody',
  }
}

function declarantHeader(kind: WorkDeclarationKind, d: WorkDeclarationData): Content {
  const name = kind === 'owner' ? fill(d.company_name, '') : fill(d.declarant_name, '')
  const sub =
    kind === 'owner'
      ? d.company_cnpj
        ? `CNPJ ${d.company_cnpj}`
        : ''
      : [
          d.profession,
          d.professional_type === 'liberal' && d.council_name && d.council_number
            ? `${d.council_name} ${d.council_number}`
            : '',
        ]
          .filter(Boolean)
          .join(' · ')
  const contact = [d.header_address, d.header_phone, d.header_email].filter(Boolean).join(' · ')

  return {
    stack: [
      { text: name.toUpperCase() || ' ', bold: true, fontSize: 11, alignment: 'center' },
      ...(sub ? [{ text: sub, fontSize: 8, alignment: 'center' as const }] : []),
      ...(contact ? [{ text: contact, fontSize: 8, alignment: 'center' as const }] : []),
      {
        canvas: [{ type: 'line', x1: 0, y1: 4, x2: 515, y2: 4, lineWidth: 0.5 }],
        margin: [0, 2, 0, 10],
      },
    ],
  }
}

export async function buildWorkDeclarationDoc(
  kind: WorkDeclarationKind,
  d: WorkDeclarationData
): Promise<TDocumentDefinitions> {
  const config = WORK_DECLARATIONS[kind]
  const activities = parseActivities(d.activities).slice(0, MAX_ACTIVITIES)
  // Sem atividades, imprime linhas em branco como o modelo, para preencher à mão
  const lines = activities.length > 0 ? activities : Array(5).fill('_'.repeat(80))
  const place = d.city?.trim() ? `${d.city.trim()}, ` : ''

  const content: Content[] = [
    declarantHeader(kind, d),
    docTitle(config.title),
    { ...(declarationText(kind, d) as object), margin: [0, 8, 0, 6] } as Content,
    {
      ol: lines.map((text) => ({ text, margin: [0, 1, 0, 1] })),
      style: 'sectionBody',
      margin: [16, 0, 0, 8],
    },
    {
      text: 'Por ser verdade, firmo a presente declaração para que surta seus efeitos legais.',
      style: 'sectionBody',
      margin: [0, 4, 0, 12],
    },
    {
      text: `${place}${longDate(d.declaration_date)}.`,
      alignment: 'right',
      style: 'sectionBody',
      margin: [0, 0, 0, 16],
    },
    {
      stack: [
        { canvas: [{ type: 'line', x1: 107, y1: 0, x2: 407, y2: 0, lineWidth: 0.5 }] },
        { text: 'Assinatura', alignment: 'center', style: 'signatureLine', margin: [0, 3, 0, 0] },
        ...(d.declarant_name?.trim()
          ? [
              {
                text: d.declarant_name.trim().toUpperCase(),
                alignment: 'center' as const,
                fontSize: 8,
              },
            ]
          : []),
      ],
      margin: [0, 24, 0, 0],
    },
    {
      text: [{ text: 'OBSERVAÇÃO: ', bold: true }, config.observation],
      style: 'obs',
      margin: [0, 16, 0, 0],
    },
  ]

  return { content }
}
