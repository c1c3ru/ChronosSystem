import {
  buildAttendanceDeclarationPdfMake,
  AttendanceDeclarationData,
} from '@/lib/pdf-schemas/pdfmake-attendance-declaration'

describe('buildAttendanceDeclarationPdfMake', () => {
  const mockData: AttendanceDeclarationData = {
    declarantName: 'João da Silva',
    documentType: 'CPF',
    documentNumber: '123.456.789-00',
    studentName: 'Maria Oliveira',
    course: 'Engenharia de Software',
    registration: '2023123456',
    institution: 'IFCE',
    campus: 'Morada Nova',
    experienceType: 'EXTENSÃO',
    projectProgram: 'Projeto XYZ',
    projectInstitution: 'Instituto ABC',
    activities: 'Desenvolvimento de software e testes.',
    startDate: '2023-01-01',
    weeklyHours: '20',
  }

  it('deve retornar um objeto TDocumentDefinitions válido', () => {
    const documentDefinition = buildAttendanceDeclarationPdfMake(mockData)

    expect(documentDefinition).toBeDefined()
    expect(documentDefinition.pageSize).toBe('A4')
    expect(documentDefinition.content).toBeDefined()
    expect(Array.isArray(documentDefinition.content)).toBe(true)
    expect(documentDefinition.styles).toBeDefined()
  })

  it('deve conter os dados fornecidos no mockData dentro do content', () => {
    const documentDefinition = buildAttendanceDeclarationPdfMake(mockData)

    // Converte para string para facilitar a busca dos valores sem usar 'any'
    const contentString = JSON.stringify(documentDefinition.content)

    expect(contentString).toContain(mockData.declarantName)
    expect(contentString).toContain(mockData.documentType)
    expect(contentString).toContain(mockData.documentNumber)
    expect(contentString).toContain(mockData.studentName)
    expect(contentString).toContain(mockData.course)
    expect(contentString).toContain(mockData.registration)
    expect(contentString).toContain(mockData.institution)
    expect(contentString).toContain(mockData.campus)
    expect(contentString).toContain(mockData.experienceType)
    expect(contentString).toContain(mockData.projectProgram)
    expect(contentString).toContain(mockData.projectInstitution)
    expect(contentString).toContain(mockData.activities)
    expect(contentString).toContain(mockData.startDate)
    expect(contentString).toContain(`${mockData.weeklyHours} HORAS`)
  })

  it('deve tratar dados vazios ou ausentes adequadamente', () => {
    const emptyData: AttendanceDeclarationData = {
      declarantName: '',
      documentType: '',
      documentNumber: '',
      studentName: '',
      course: '',
      registration: '',
      institution: '',
      campus: '',
      experienceType: '',
      projectProgram: '',
      projectInstitution: '',
      activities: '',
      startDate: '',
      weeklyHours: '',
    }

    const documentDefinition = buildAttendanceDeclarationPdfMake(emptyData)
    expect(documentDefinition).toBeDefined()

    const contentString = JSON.stringify(documentDefinition.content)
    // O template usa ' ' como fallback para campos vazios
    expect(contentString).toContain(' ')
  })

  it('deve incluir o cabeçalho correto com as descrições da instituição', () => {
    const documentDefinition = buildAttendanceDeclarationPdfMake(mockData)
    const contentString = JSON.stringify(documentDefinition.content)

    // O cabeçalho deve conter o Ministério da Educação e IFCE
    expect(contentString).toContain('MINISTÉRIO DA EDUCAÇÃO')
    expect(contentString).toContain('INSTITUTO FEDERAL DE EDUCAÇÃO, CIÊNCIA E TECNOLOGIA DO CEARÁ')

    // Verifica se as chaves de imagem estão presentes (base64)
    expect(contentString).toContain('"image"')
  })

  it('deve incluir a estrutura de assinaturas', () => {
    const documentDefinition = buildAttendanceDeclarationPdfMake(mockData)
    const contentString = JSON.stringify(documentDefinition.content)

    expect(contentString).toContain('Assinatura do Declarante')
    expect(contentString).toContain('Assinatura do Discente')
  })
})
