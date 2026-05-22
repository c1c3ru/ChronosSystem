import type { TDocumentDefinitions, Content, TableCell, Alignment } from 'pdfmake/interfaces'
import { ifceHeader, cell, emptyCell, dataTable, fmtDate, v } from '@/lib/pdfmake-base-service'

export interface ExperienceDeclarationData {
  // Declarante
  declarant_name?: string
  doc_type?: string
  doc_number?: string

  // Discente
  student_name?: string
  student_course?: string
  student_enrollment?: string
  campus?: string

  // Experiência
  exp_type?: 'extensao' | 'iniciacao' | 'monitoria'
  title?: string
  project_program?: string
  institution?: string

  // Atividades
  activities?: string

  // Footer
  start_date?: string
  weekly_hours?: string
  
  city?: string
  solicitation_date?: string
}

export async function buildExperienceDeclarationDoc(d: ExperienceDeclarationData): Promise<TDocumentDefinitions> {
  const header = await ifceHeader()
  const cb = (checked?: boolean) => (checked ? '( X )' : '(   )')

  const declarantTable = dataTable(['75%', '25%'], [
    [cell('NOME DO DECLARANTE (SERVIDOR(A) ORIENTADOR(A)/SUPERVISOR(A) DA BOLSA OU COORDENADOR(A) DO PROJETO/PROGRAMA)', v(d.declarant_name), { colSpan: 2 }), emptyCell()],
    [cell('DOCUMENTO TIPO', v(d.doc_type)), cell('NÚMERO', v(d.doc_number))]
  ])

  const introText: Content = {
    text: [
      '\nPara fins de EQUIPARAÇÃO a atividades de estágio supervisionado obrigatório, ',
      { text: 'declaro', bold: true },
      ' os fatos a seguir descritos, para que surjam efeitos legais.\n\n'
    ],
    fontSize: 9,
    alignment: 'center'
  }

  const studentTable = dataTable(['*'], [
    [cell('DISCENTE', v(d.student_name))],
    [{
      columns: [
        cell('CURSO', v(d.student_course), { width: '70%', border: [false, false, true, true] }),
        cell('MATRÍCULA', v(d.student_enrollment), { width: '30%', border: [false, false, false, true] })
      ]
    } as TableCell],
    [cell('INSTITUIÇÃO DE ENSINO', 'INSTITUTO FEDERAL DE EDUCAÇÃO, CIÊNCIA E TECNOLOGIA – IFCE')],
    [cell('CAMPUS', v(d.campus) || 'MARACANAÚ')]
  ])

  const experienceSection = dataTable(['*'], [
    [{ text: 'EXPERIÊNCIA', style: 'tableHeader', alignment: 'center' as Alignment }],
    [{
      columns: [
        { text: `${cb(d.exp_type === 'extensao')} EXTENSÃO`, fontSize: 9, alignment: 'center', width: '33%' },
        { text: `${cb(d.exp_type === 'iniciacao')} INICIAÇÃO CIENTÍFICA`, fontSize: 9, alignment: 'center', width: '33%' },
        { text: `${cb(d.exp_type === 'monitoria')} MONITORIA`, fontSize: 9, alignment: 'center', width: '34%' },
      ],
      margin: [0, 4, 0, 4]
    }]
  ])

  const detailsTable = dataTable(['*'], [
    [cell('TÍTULO', v(d.title))],
    [cell('PROJETO/PROGRAMA', v(d.project_program))],
    [cell('INSTITUIÇÃO', v(d.institution))]
  ])

  const activitiesTable = dataTable(['*'], [
    [{ text: 'ATIVIDADES DESENVOLVIDAS PELO(A) DISCENTE', style: 'tableHeader', alignment: 'center' as Alignment }],
    [{
      text: v(d.activities) || '1.',
      fontSize: 9,
      margin: [5, 5, 5, 20]
    }]
  ])

  const footerTable = dataTable(['60%', '40%'], [
    [
      cell('INÍCIO', fmtDate(d.start_date)),
      cell('CARGA HORÁRIA SEMANAL', `${v(d.weekly_hours)} horas`)
    ]
  ])

  const content: Content[] = [
    ...header,
    { text: 'DECLARAÇÃO DE PARTICIPAÇÃO EM EXPERIÊNCIA DE EXTENSÃO, INICIAÇÃO CIENTÍFICA OU MONITORIA', style: 'docTitle', margin: [0, 10, 0, 10] },
    declarantTable,
    introText,
    studentTable,
    experienceSection,
    detailsTable,
    activitiesTable,
    footerTable,
    { text: '\n\n' },
    {
      text: `${v(d.city) || 'Maracanaú'}-CE, ____ de _________________ de 20____`,
      alignment: 'center',
      fontSize: 10,
      margin: [0, 20, 0, 40]
    },
    { canvas: [{ type: 'line', x1: 150, y1: 0, x2: 350, y2: 0, lineWidth: 0.5 }], alignment: 'center' as Alignment },
    { text: 'ASSINATURA DO (A) DECLARANTE', fontSize: 7, alignment: 'center' as Alignment }
  ]

  return { content }
}
