import type { TDocumentDefinitions, Content, TableCell, Alignment } from 'pdfmake/interfaces'
import { ifceHeader, docTitle, dataTable, cell, sigBlock, fmtDate, v } from '@/lib/pdfmake-base-service'

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

export async function buildInternshipRegistrationDoc(d: InternshipRegistrationData): Promise<TDocumentDefinitions> {
  const header = await ifceHeader()

  const studentTable = dataTable(
    ['*'],
    [
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
            cell('MATRÍCULA', v(d.student_enrollment), { border: [false, false, false, true] }),
          ]
        } as TableCell
      ],
      [cell('ENDEREÇO (LOGRADOURO, NÚMERO E COMPLEMENTO)', v(d.student_address))],
      [
        {
          columns: [
            cell('BAIRRO/DISTRITO', v(d.student_neighborhood), { border: [false, false, true, true] }),
            cell('MUNICÍPIO-UF', v(d.student_city_uf), { border: [false, false, true, true] }),
            cell('CEP', v(d.student_zip), { border: [false, false, false, true] }),
          ]
        } as TableCell
      ],
      [
        {
          columns: [
            cell('DDD + TELEFONE', v(d.student_phone), { border: [false, false, true, true] }),
            cell('E-MAIL INSTITUCIONAL', v(d.student_email_institutional), { border: [false, false, true, true] }),
            cell('E-MAIL PESSOAL', v(d.student_email_personal), { border: [false, false, false, true] }),
          ]
        } as TableCell
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
        { text: 'APENAS PARA PESSOA COM DEFICIÊNCIA (CID e laudo)', style: 'tableHeader', alignment: 'center' as Alignment },
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
          margin: [2, 2, 2, 2] as [number, number, number, number]
        },
        {
          stack: [
            { text: `${cb(d.student_ethnicity === 'indigena')} Indígena`, fontSize: 7 },
            { text: `${cb(d.student_ethnicity === 'quilombola')} Quilombola`, fontSize: 7 },
            { text: `${cb(d.student_ethnicity === 'outra')} Outra ________________`, fontSize: 7 },
            { text: `${cb(d.student_ethnicity === 'nao_declarar')} Prefiro não declarar`, fontSize: 7 },
            { text: `Informar comunidade se marcar etnia:\n${v(d.student_ethnicity_community)}`, fontSize: 6, italics: true, margin: [0, 4, 0, 0] as [number, number, number, number] },
          ],
          margin: [2, 2, 2, 2] as [number, number, number, number]
        },
        {
          stack: [
            { text: `${cb(!!d.student_disability?.includes('alta_habilidade'))} Alta habilidade/superdotação`, fontSize: 7 },
            { text: `${cb(!!d.student_disability?.includes('auditiva'))} Deficiência auditiva`, fontSize: 7 },
            { text: `${cb(!!d.student_disability?.includes('intelectual'))} Deficiência intelectual`, fontSize: 7 },
            { text: `${cb(!!d.student_disability?.includes('motora'))} Deficiência motora`, fontSize: 7 },
            { text: `${cb(!!d.student_disability?.includes('visual_baixa'))} Deficiência visual/baixa visão`, fontSize: 7 },
            { text: `${cb(!!d.student_disability?.includes('visual'))} Deficiência visual`, fontSize: 7 },
            { text: `${cb(!!d.student_disability?.includes('surdocegueira'))} Surdocegueira`, fontSize: 7 },
          ],
          margin: [2, 2, 2, 2] as [number, number, number, number]
        }
      ]
    ]
  )

  const companyTable = dataTable(
    ['*'],
    [
      [{ text: 'RAZÃO SOCIAL', style: 'tableHeader', alignment: 'center' as Alignment }],
      [cell(' ', v(d.company_name))],
      [{ text: 'NOME DE FANTASIA OU DE PESSOA FÍSICA', style: 'tableHeader', alignment: 'center' as Alignment }],
      [cell(' ', v(d.company_fantasy_name))],
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
            cell('MUNICÍPIO-UF', v(d.company_city_uf), { border: [false, false, true, true] }),
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
      [{ text: 'RESPONSÁVEL LEGAL PELA INSTITUIÇÃO PARA ESTE FIM', style: 'tableHeader', alignment: 'center' as Alignment }],
      [cell(' ', v(d.company_representative))],
      [
        {
          columns: [
            cell('CARGO/QUALIFICAÇÃO', v(d.company_representative_role), { border: [false, false, true, true] }),
            cell('CPF', v(d.company_representative_cpf), { border: [false, false, true, true] }),
            cell('DDD + TELEFONE', v(d.company_representative_phone), { border: [false, false, false, true] }),
          ]
        } as TableCell
      ],
      [{ text: 'SUPERVISOR DO ESTÁGIO NA INSTITUIÇÃO CONCEDENTE DA VAGA DE ESTÁGIO', style: 'tableHeader', alignment: 'center' as Alignment }],
      [cell(' ', v(d.company_supervisor))],
      [
        {
          columns: [
            cell('CARGO/QUALIFICAÇÃO', v(d.company_supervisor_role), { border: [false, false, true, true] }),
            cell('CPF', v(d.company_supervisor_cpf), { border: [false, false, true, true] }),
            cell('DDD + TELEFONE', v(d.company_supervisor_phone), { border: [false, false, false, true] }),
          ]
        } as TableCell
      ],
      [cell('SETOR DE REALIZAÇÃO DO ESTÁGIO', v(d.company_sector))],
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
            { text: `${cb(d.internship_type === 'obrigatorio')} OBRIGATÓRIO`, fontSize: 7 },
            { text: `${cb(d.internship_type === 'nao_obrigatorio')} NÃO OBRIGATÓRIO`, fontSize: 7 },
          ],
          margin: [4, 4, 4, 4] as [number, number, number, number]
        },
        {
          stack: [
            { text: `${cb(d.internship_mode === 'presencial')} PRESENCIAL`, fontSize: 7 },
            { text: `${cb(d.internship_mode === 'remoto')} REMOTO`, fontSize: 7 },
          ],
          margin: [4, 4, 4, 4] as [number, number, number, number]
        },
        { text: fmtDate(d.start_date), alignment: 'center' as Alignment, margin: [0, 8, 0, 8] as [number, number, number, number] },
        { text: `${v(d.weekly_hours)} HORAS`, alignment: 'center' as Alignment, margin: [0, 8, 0, 8] as [number, number, number, number] },
        { text: fmtDate(d.end_date), alignment: 'center' as Alignment, margin: [0, 8, 0, 8] as [number, number, number, number] },
      ]
    ]
  )

  const hor = d.schedule || {}
  const scheduleTable = dataTable(
    ['12%', '6%', '6%', '6%', '6%', '6%', '6%', '6%', '6%', '6%', '6%', '6%', '6%', '6%', '6%'],
    [
      [
        { text: 'TURNO', style: 'tableHeader', alignment: 'center' as Alignment, rowSpan: 2, margin: [0, 8, 0, 8] as [number, number, number, number] },
        { text: 'PREVISÃO DE DISTRIBUIÇÃO DA CARGA HORÁRIA', style: 'tableHeader', alignment: 'center' as Alignment, colSpan: 14 },
        {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}
      ],
      [
        {},
        { text: 'SEG-FEIRA', style: 'tableHeader', alignment: 'center' as Alignment, colSpan: 2 }, {},
        { text: 'TER-FEIRA', style: 'tableHeader', alignment: 'center' as Alignment, colSpan: 2 }, {},
        { text: 'QUA-FEIRA', style: 'tableHeader', alignment: 'center' as Alignment, colSpan: 2 }, {},
        { text: 'QUI-FEIRA', style: 'tableHeader', alignment: 'center' as Alignment, colSpan: 2 }, {},
        { text: 'SEX-FEIRA', style: 'tableHeader', alignment: 'center' as Alignment, colSpan: 2 }, {},
        { text: 'SÁBADO', style: 'tableHeader', alignment: 'center' as Alignment, colSpan: 2 }, {},
        { text: 'DOMINGO', style: 'tableHeader', alignment: 'center' as Alignment, colSpan: 2 }, {},
      ],
      [
        { text: '', style: 'tableHeader' },
        { text: 'INÍCIO', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 }, { text: 'FIM', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 },
        { text: 'INÍCIO', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 }, { text: 'FIM', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 },
        { text: 'INÍCIO', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 }, { text: 'FIM', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 },
        { text: 'INÍCIO', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 }, { text: 'FIM', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 },
        { text: 'INÍCIO', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 }, { text: 'FIM', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 },
        { text: 'INÍCIO', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 }, { text: 'FIM', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 },
        { text: 'INÍCIO', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 }, { text: 'FIM', style: 'tableHeader', alignment: 'center' as Alignment, fontSize: 5 },
      ],
      [
        { text: '1º', style: 'cellValue', alignment: 'center' as Alignment, fontSize: 7 },
        { text: v(hor.mon?.morning), fontSize: 7, alignment: 'center' as Alignment }, { text: v(hor.mon?.afternoon), fontSize: 7, alignment: 'center' as Alignment },
        { text: v(hor.tue?.morning), fontSize: 7, alignment: 'center' as Alignment }, { text: v(hor.tue?.afternoon), fontSize: 7, alignment: 'center' as Alignment },
        { text: v(hor.wed?.morning), fontSize: 7, alignment: 'center' as Alignment }, { text: v(hor.wed?.afternoon), fontSize: 7, alignment: 'center' as Alignment },
        { text: v(hor.thu?.morning), fontSize: 7, alignment: 'center' as Alignment }, { text: v(hor.thu?.afternoon), fontSize: 7, alignment: 'center' as Alignment },
        { text: v(hor.fri?.morning), fontSize: 7, alignment: 'center' as Alignment }, { text: v(hor.fri?.afternoon), fontSize: 7, alignment: 'center' as Alignment },
        { text: v(hor.sat?.morning), fontSize: 7, alignment: 'center' as Alignment }, { text: v(hor.sat?.afternoon), fontSize: 7, alignment: 'center' as Alignment },
        { text: '', fontSize: 7 }, { text: '', fontSize: 7 },
      ],
      [{ text: '2º', style: 'cellValue', alignment: 'center' as Alignment, fontSize: 7 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
      [{ text: '3º', style: 'cellValue', alignment: 'center' as Alignment, fontSize: 7 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
    ]
  )

  const content: Content[] = [
    ...header,
    docTitle('Ficha de Cadastro no Estágio'),
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
      ['ASSINATURA DO DISCENTE', 'ASSINATURA DO RESPONSÁVEL LEGAL', 'ASSINATURA DO SUPERVISOR'],
      'Declaro que as informações acima são verdadeiras.',
      fmtDate(d.solicitation_date),
      fmtDate(d.authorization_date)
    ),
  ]

  return { content, styles: { tableHeader: { bold: true, fontSize: 8, fillColor: '#f3f4f6' }, cellLabel: { fontSize: 7, color: '#666' }, cellValue: { fontSize: 9 } } }
}
