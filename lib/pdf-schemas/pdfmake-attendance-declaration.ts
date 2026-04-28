import { TDocumentDefinitions } from 'pdfmake/interfaces'
import { LOGO_IFCE_BASE64, BRASAO_BASE64 } from '../pdf-assets'

export interface AttendanceDeclarationData {
  declarantName: string
  documentType: string
  documentNumber: string
  studentName: string
  course: string
  registration: string
  institution: string
  campus: string
  experienceType: string
  projectProgram: string
  projectInstitution: string
  activities: string
  startDate: string
  weeklyHours: string
}

export function buildAttendanceDeclarationPdfMake(data: AttendanceDeclarationData): TDocumentDefinitions {
  return {
    pageSize: 'A4',
    defaultStyle: {
      font: 'Roboto',
      fontSize: 10,
      lineHeight: 1.2,
      columnGap: 20
    },
    content: [
      // HEADER
      {
        columns: [
          {
            image: BRASAO_BASE64,
            width: 50,
            alignment: 'left'
          },
          {
            stack: [
              { text: 'MINISTÉRIO DA EDUCAÇÃO', style: 'headerBold' },
              { text: 'SECRETARIA DE EDUCAÇÃO PROFISSIONAL E TECNOLÓGICA', style: 'headerBold' },
              { text: 'INSTITUTO FEDERAL DE EDUCAÇÃO, CIÊNCIA E TECNOLOGIA DO CEARÁ', style: 'headerBold' },
              { text: 'PRÓ-REITORIA DE EXTENSÃO', style: 'headerBold' },
              { text: 'COORDENAÇÃO DE ESTÁGIOS E ACOMPANHAMENTO DE EGRESSOS', style: 'headerBold' }
            ],
            alignment: 'center',
            width: '*',
            margin: [0, 5, 0, 0]
          },
          {
            image: LOGO_IFCE_BASE64,
            width: 70,
            alignment: 'right'
          }
        ],
        margin: [0, 0, 0, 20]
      },
      
      // TITLE
      {
        text: 'DECLARAÇÃO DE PARTICIPAÇÃO EM EXPERIÊNCIA\nDE EXTENSÃO, INICIAÇÃO CIENTÍFICA OU MONITORIA',
        style: 'title',
        margin: [0, 0, 0, 15]
      },

      // DESCRIPTION
      {
        text: [
          'Para fins de ',
          { text: 'EQUIPARAÇÃO', bold: true },
          ' a atividades de estágio supervisionado obrigatório, declaro os fatos a seguir descritos, para que surjam efeitos legais.'
        ],
        alignment: 'justify',
        margin: [0, 0, 0, 15]
      },

      // FIRST TABLE: Declarant and Student Details
      {
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              { 
                text: [
                  { text: 'NOME DO DECLARANTE (SERVIDOR/ORIENTADOR/SUPERVISOR)\n', style: 'label' },
                  { text: data.declarantName || ' ' }
                ],
                colSpan: 3
              },
              {}, {}
            ],
            [
              {
                text: [
                  { text: 'TIPO DE DOCUMENTO\n', style: 'label' },
                  { text: data.documentType || ' ' }
                ]
              },
              {
                text: [
                  { text: 'NÚMERO DO DOCUMENTO\n', style: 'label' },
                  { text: data.documentNumber || ' ' }
                ],
                colSpan: 2
              },
              {}
            ],
            [
              {
                text: [
                  { text: 'NOME DO DISCENTE\n', style: 'label' },
                  { text: data.studentName || ' ' }
                ],
                colSpan: 3
              },
              {}, {}
            ],
            [
              {
                text: [
                  { text: 'CURSO\n', style: 'label' },
                  { text: data.course || ' ' }
                ],
                colSpan: 2
              },
              {},
              {
                text: [
                  { text: 'MATRÍCULA\n', style: 'label' },
                  { text: data.registration || ' ' }
                ]
              }
            ],
            [
              {
                text: [
                  { text: 'INSTITUIÇÃO DE ENSINO\n', style: 'label' },
                  { text: data.institution || ' ' }
                ],
                colSpan: 2
              },
              {},
              {
                text: [
                  { text: 'CAMPUS\n', style: 'label' },
                  { text: data.campus || ' ' }
                ]
              }
            ]
          ]
        },
        margin: [0, 0, 0, 15]
      },

      // SECTION TITLE
      {
        text: 'DETALHES DA EXPERIÊNCIA',
        style: 'sectionTitle',
        margin: [0, 0, 0, 5]
      },

      // SECOND TABLE: Experience Details
      {
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              {
                text: [
                  { text: 'TIPO DE EXPERIÊNCIA\n', style: 'label' },
                  { text: data.experienceType || ' ' }
                ],
                colSpan: 3
              },
              {}, {}
            ],
            [
              {
                text: [
                  { text: 'NOME DO PROJETO / PROGRAMA\n', style: 'label' },
                  { text: data.projectProgram || ' ' }
                ],
                colSpan: 3
              },
              {}, {}
            ],
            [
              {
                text: [
                  { text: 'INSTITUIÇÃO RESPONSÁVEL\n', style: 'label' },
                  { text: data.projectInstitution || ' ' }
                ],
                colSpan: 3
              },
              {}, {}
            ],
            [
              {
                text: [
                  { text: 'ATIVIDADES DESENVOLVIDAS PELO(A) DISCENTE\n', style: 'label' },
                  { text: data.activities || ' ' }
                ],
                colSpan: 3,
                margin: [0, 0, 0, 40]
              },
              {}, {}
            ],
            [
              {
                text: [
                  { text: 'DATA DE INÍCIO\n', style: 'label' },
                  { text: data.startDate || ' ' }
                ]
              },
              {
                text: [
                  { text: 'CARGA HORÁRIA SEMANAL\n', style: 'label' },
                  { text: data.weeklyHours ? `${data.weeklyHours} HORAS` : ' ' }
                ],
                colSpan: 2
              },
              {}
            ]
          ]
        },
        margin: [0, 0, 0, 30]
      },

      // SIGNATURES
      {
        columns: [
          {
            stack: [
              { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1 }] },
              { text: 'Assinatura do Declarante', alignment: 'center', margin: [0, 5, 0, 0] }
            ],
            alignment: 'center'
          },
          {
            stack: [
              { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1 }] },
              { text: 'Assinatura do Discente', alignment: 'center', margin: [0, 5, 0, 0] }
            ],
            alignment: 'center'
          }
        ],
        margin: [0, 40, 0, 0]
      }
    ],
    styles: {
      headerBold: {
        fontSize: 10,
        bold: true,
        alignment: 'center'
      },
      title: {
        fontSize: 12,
        bold: true,
        alignment: 'center'
      },
      sectionTitle: {
        fontSize: 9,
        bold: true,
        fillColor: '#eeeeee',
        alignment: 'left'
      },
      label: {
        fontSize: 7,
        bold: true,
        color: '#555555'
      }
    }
  }
}
