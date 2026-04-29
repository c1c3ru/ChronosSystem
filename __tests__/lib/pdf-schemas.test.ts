/**
 * Testes para schemas e templates PDF
 * Testa a estrutura dos schemas, builders e validação de dados
 */

import {
  buildMonthlyReportSchema,
  buildFinalReportSchema,
  buildSemesterReportSchema,
  buildCommitmentTermSchema,
  buildAdditiveTermSchema,
  buildExtensionDeclarationSchema,
  buildProfessionalDeclarationSchema,
  buildInternshipRegistrationSchema,
  buildInternshipRegistrationRequestSchema,
  buildRealizationTermSchema,
  buildRescissionTermSchema,
  buildEquivalenceRequestSchema,
  buildStudentEvaluationSchema,
} from '@/lib/pdf-schemas/templates'
import type {
  PDFDocumentSchema,
  PDFTableSection,
  PDFParagraphSection,
  PDFListSection,
} from '@/lib/pdf-schemas/schema'

describe('pdf-schemas/templates', () => {
  describe('buildMonthlyReportSchema', () => {
    it('deve retornar schema com título correto', () => {
      const schema = buildMonthlyReportSchema()
      expect(schema.title).toBe('Relatório Mensal de Atividades')
    })

    it('deve conter header padrão do IFCE', () => {
      const schema = buildMonthlyReportSchema()
      expect(schema.header).toBeDefined()
      expect(schema.header?.institution).toContain('PRÓ-REITORIA DE EXTENSÃO')
      expect(schema.header?.showLogo).toBe(true)
      expect(schema.header?.showBrasao).toBe(true)
    })

    it('deve conter seção de tabela com dados do discente', () => {
      const schema = buildMonthlyReportSchema()
      const tableSection = schema.sections.find((s) => s.type === 'table') as PDFTableSection

      expect(tableSection).toBeDefined()
      expect(tableSection.type).toBe('table')
      expect(tableSection.headers).toEqual(['Campo', 'Valor'])
      expect(tableSection.rows.length).toBeGreaterThan(0)
    })

    it('deve conter placeholders corretos na tabela', () => {
      const schema = buildMonthlyReportSchema()
      const tableSection = schema.sections.find((s) => s.type === 'table') as PDFTableSection

      const fieldNames = tableSection.rows.map((row) => row[0])
      expect(fieldNames).toContain('Nome do Discente')
      expect(fieldNames).toContain('Curso')
      expect(fieldNames).toContain('Matrícula')
      expect(fieldNames).toContain('Supervisor do Estágio')
    })

    it('deve conter seções de parágrafo para atividades', () => {
      const schema = buildMonthlyReportSchema()
      const paragraphSections = schema.sections.filter(
        (s) => s.type === 'paragraph'
      ) as PDFParagraphSection[]

      expect(paragraphSections.length).toBeGreaterThan(0)
      expect(paragraphSections.some((s) => s.title.includes('Atividades'))).toBe(true)
      expect(paragraphSections.some((s) => s.title.includes('Dificuldades'))).toBe(true)
      expect(paragraphSections.some((s) => s.title.includes('Soluções'))).toBe(true)
    })

    it('deve conter linhas de assinatura', () => {
      const schema = buildMonthlyReportSchema()
      expect(schema.signatureLines).toBeDefined()
      expect(schema.signatureLines!.length).toBeGreaterThan(0)
      expect(schema.signatureLines![0].label).toBe('Supervisor do Estágio')
    })
  })

  describe('buildFinalReportSchema', () => {
    it('deve retornar schema com título correto', () => {
      const schema = buildFinalReportSchema()
      expect(schema.title).toBe('Relatório Final de Estágio')
    })

    it('deve conter mais seções que o relatório mensal', () => {
      const monthlySchema = buildMonthlyReportSchema()
      const finalSchema = buildFinalReportSchema()

      expect(finalSchema.sections.length).toBeGreaterThanOrEqual(monthlySchema.sections.length)
    })

    it('deve conter assinatura do Docente Orientador', () => {
      const schema = buildFinalReportSchema()
      const labels = schema.signatureLines!.map((l) => l.label)
      expect(labels).toContain('Docente Orientador')
    })
  })

  describe('buildSemesterReportSchema', () => {
    it('deve retornar schema com título correto', () => {
      const schema = buildSemesterReportSchema()
      expect(schema.title).toBe('Relatório Semestral de Estágio')
    })

    it('deve conter placeholder de carga horária semestral', () => {
      const schema = buildSemesterReportSchema()
      const tableSection = schema.sections.find((s) => s.type === 'table') as PDFTableSection
      const placeholders = tableSection.rows.map((row) => row[1])

      expect(placeholders.some((p) => typeof p === 'string' && p.includes('horas_semestre'))).toBe(true)
    })
  })

  describe('buildCommitmentTermSchema', () => {
    it('deve retornar schema com título correto', () => {
      const schema = buildCommitmentTermSchema()
      expect(schema.title).toBe('Termo de Compromisso de Estágio')
    })

    it('deve conter múltiplas seções de tabela', () => {
      const schema = buildCommitmentTermSchema()
      const tableSections = schema.sections.filter((s) => s.type === 'table')

      expect(tableSections.length).toBeGreaterThanOrEqual(2)
    })

    it('deve conter dados da empresa concedente', () => {
      const schema = buildCommitmentTermSchema()
      const html = JSON.stringify(schema)

      expect(html).toContain('empresa_nome')
      expect(html).toContain('empresa_cnpj')
    })

    it('deve conter dados do plano de estágio', () => {
      const schema = buildCommitmentTermSchema()
      const html = JSON.stringify(schema)

      expect(html).toContain('inicio_estagio')
      expect(html).toContain('fim_estagio')
      expect(html).toContain('horas_semanais')
    })
  })

  describe('buildAdditiveTermSchema', () => {
    it('deve retornar schema com título correto', () => {
      const schema = buildAdditiveTermSchema()
      expect(schema.title).toBe('Termo Aditivo ao Contrato de Estágio')
    })

    it('deve conter justificativa como parágrafo', () => {
      const schema = buildAdditiveTermSchema()
      const paraSection = schema.sections.find((s) => s.type === 'paragraph') as PDFParagraphSection

      expect(paraSection).toBeDefined()
      expect(paraSection.title).toBe('Justificativa')
      expect(paraSection.content).toBe('{justificativa}')
    })
  })

  describe('buildExtensionDeclarationSchema', () => {
    it('deve retornar schema com título correto', () => {
      const schema = buildExtensionDeclarationSchema()
      expect(schema.title).toBe('Declaração de Prorrogação de Estágio')
    })

    it('deve conter declaração com placeholders', () => {
      const schema = buildExtensionDeclarationSchema()
      const paraSection = schema.sections.find((s) => s.type === 'paragraph') as PDFParagraphSection

      expect(paraSection.content).toContain('{nome_empresa}')
      expect(paraSection.content).toContain('{nome_estudante}')
      expect(paraSection.content).toContain('{nova_data_final}')
    })
  })

  describe('buildProfessionalDeclarationSchema', () => {
    it('deve retornar schema com título correto', () => {
      const schema = buildProfessionalDeclarationSchema()
      expect(schema.title).toBe('Declaração de Estágio')
    })

    it('deve conter declaração formal', () => {
      const schema = buildProfessionalDeclarationSchema()
      const paraSection = schema.sections.find((s) => s.type === 'paragraph') as PDFParagraphSection

      expect(paraSection.content).toContain('Declaramos que')
      expect(paraSection.content).toContain('{horas_total}')
    })
  })

  describe('buildInternshipRegistrationSchema', () => {
    it('deve retornar schema com título correto', () => {
      const schema = buildInternshipRegistrationSchema()
      expect(schema.title).toBe('Solicitação de Matrícula em Estágio Curricular')
    })

    it('deve conter dados do discente e empresa', () => {
      const schema = buildInternshipRegistrationSchema()
      const tableSections = schema.sections.filter((s) => s.type === 'table') as PDFTableSection[]

      expect(tableSections.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('buildInternshipRegistrationRequestSchema', () => {
    it('deve retornar schema com título correto', () => {
      const schema = buildInternshipRegistrationRequestSchema()
      expect(schema.title).toBe('Requerimento de Estágio Supervisionado')
    })

    it('deve conter atividades previstas', () => {
      const schema = buildInternshipRegistrationRequestSchema()
      const paraSection = schema.sections.find((s) => s.type === 'paragraph') as PDFParagraphSection

      expect(paraSection.content).toBe('{atividades_previstas}')
    })
  })

  describe('buildRealizationTermSchema', () => {
    it('deve retornar schema com título correto', () => {
      const schema = buildRealizationTermSchema()
      expect(schema.title).toBe('Termo de Realização de Estágio')
    })

    it('deve conter atividades realizadas', () => {
      const schema = buildRealizationTermSchema()
      const paraSection = schema.sections.find((s) => s.type === 'paragraph') as PDFParagraphSection

      expect(paraSection.content).toBe('{atividades}')
    })
  })

  describe('buildRescissionTermSchema', () => {
    it('deve retornar schema com título correto', () => {
      const schema = buildRescissionTermSchema()
      expect(schema.title).toBe('Termo de Rescisão de Estágio')
    })

    it('deve conter motivo da rescisão', () => {
      const schema = buildRescissionTermSchema()
      const paraSection = schema.sections.find((s) => s.type === 'paragraph') as PDFParagraphSection

      expect(paraSection.content).toBe('{motivo_rescisao}')
    })
  })

  describe('buildEquivalenceRequestSchema', () => {
    it('deve retornar schema com título correto', () => {
      const schema = buildEquivalenceRequestSchema()
      expect(schema.title).toBe('Pedido de Aproveitamento / Equivalência de Estágio')
    })

    it('deve conter justificativa', () => {
      const schema = buildEquivalenceRequestSchema()
      const paraSection = schema.sections.find((s) => s.type === 'paragraph') as PDFParagraphSection

      expect(paraSection.content).toBe('{justificativa}')
    })
  })

  describe('buildStudentEvaluationSchema', () => {
    it('deve retornar schema com título correto', () => {
      const schema = buildStudentEvaluationSchema()
      expect(schema.title).toBe('Ficha de Avaliação do Estagiário')
    })

    it('deve conter múltiplos critérios de avaliação', () => {
      const schema = buildStudentEvaluationSchema()
      const paraSections = schema.sections.filter((s) => s.type === 'paragraph')

      expect(paraSections.length).toBeGreaterThanOrEqual(5)
      expect(paraSections.some((s) => s.title.includes('Pontualidade'))).toBe(true)
      expect(paraSections.some((s) => s.title.includes('Postura'))).toBe(true)
      expect(paraSections.some((s) => s.title.includes('Conhecimento'))).toBe(true)
    })
  })

  describe('estrutura comum de todos os schemas', () => {
    const schemaBuilders = [
      buildMonthlyReportSchema,
      buildFinalReportSchema,
      buildSemesterReportSchema,
      buildCommitmentTermSchema,
      buildAdditiveTermSchema,
      buildExtensionDeclarationSchema,
      buildProfessionalDeclarationSchema,
      buildInternshipRegistrationSchema,
      buildInternshipRegistrationRequestSchema,
      buildRealizationTermSchema,
      buildRescissionTermSchema,
      buildEquivalenceRequestSchema,
      buildStudentEvaluationSchema,
    ]

    it.each([
      ['Monthly Report', buildMonthlyReportSchema],
      ['Final Report', buildFinalReportSchema],
      ['Semester Report', buildSemesterReportSchema],
      ['Commitment Term', buildCommitmentTermSchema],
      ['Additive Term', buildAdditiveTermSchema],
      ['Extension Declaration', buildExtensionDeclarationSchema],
      ['Professional Declaration', buildProfessionalDeclarationSchema],
      ['Internship Registration', buildInternshipRegistrationSchema],
      ['Registration Request', buildInternshipRegistrationRequestSchema],
      ['Realization Term', buildRealizationTermSchema],
      ['Rescission Term', buildRescissionTermSchema],
      ['Equivalence Request', buildEquivalenceRequestSchema],
      ['Student Evaluation', buildStudentEvaluationSchema],
    ])('deve ter estrutura válida para %s', (_name, builder) => {
      const schema = builder()

      expect(schema.title).toBeDefined()
      expect(typeof schema.title).toBe('string')
      expect(schema.title.length).toBeGreaterThan(0)
      expect(schema.sections).toBeDefined()
      expect(Array.isArray(schema.sections)).toBe(true)
      expect(schema.sections.length).toBeGreaterThan(0)
    })

    it.each([
      ['Monthly Report', buildMonthlyReportSchema],
      ['Final Report', buildFinalReportSchema],
      ['Semester Report', buildSemesterReportSchema],
      ['Commitment Term', buildCommitmentTermSchema],
    ])('deve ter header IFCE para %s', (_name, builder) => {
      const schema = builder()

      expect(schema.header).toBeDefined()
      expect(schema.header?.institution).toContain('PRÓ-REITORIA DE EXTENSÃO')
    })
  })

  describe('placeholders nos schemas', () => {
    it('deve usar formato {campo} para placeholders', () => {
      const schema = buildMonthlyReportSchema()
      const tableSection = schema.sections.find((s) => s.type === 'table') as PDFTableSection

      tableSection.rows.forEach((row) => {
        const value = row[1]
        // Deve ser placeholder vazio ou ter formato {campo}
        expect(typeof value === 'string' && (value === '' || !!value.match(/\{[^}]+\}/))).toBeTruthy()
      })
    })

    it('deve conter placeholders únicos por schema', () => {
      const schema = buildCommitmentTermSchema()
      const allContent = JSON.stringify(schema)

      // Verifica alguns placeholders específicos
      expect(allContent).toContain('{nome_estudante}')
      expect(allContent).toContain('{cpf_estudante}')
      expect(allContent).toContain('{empresa_cnpj}')
    })
  })
})

describe('pdf-schemas/schema types', () => {
  it('deve validar interface PDFDocumentSchema', () => {
    const mockSchema: PDFDocumentSchema = {
      title: 'Test Document',
      header: {
        showLogo: true,
        showBrasao: true,
        institution: 'Test Institution',
      },
      sections: [],
    }

    expect(mockSchema.title).toBe('Test Document')
    expect(mockSchema.header?.institution).toBe('Test Institution')
  })

  it('deve validar PDFTableSection', () => {
    const tableSection: PDFTableSection = {
      type: 'table',
      title: 'Dados',
      headers: ['Campo', 'Valor'],
      rows: [['Nome', 'João']],
    }

    expect(tableSection.type).toBe('table')
    expect(tableSection.headers.length).toBe(2)
    expect(tableSection.rows.length).toBe(1)
  })

  it('deve validar PDFParagraphSection', () => {
    const paraSection: PDFParagraphSection = {
      type: 'paragraph',
      title: 'Descrição',
      content: 'Texto do parágrafo',
    }

    expect(paraSection.type).toBe('paragraph')
    expect(paraSection.content).toBe('Texto do parágrafo')
  })

  it('deve validar PDFListSection', () => {
    const listSection: PDFListSection = {
      type: 'list',
      title: 'Lista',
      items: ['Item 1', 'Item 2', 'Item 3'],
    }

    expect(listSection.type).toBe('list')
    expect(listSection.items.length).toBe(3)
  })

  it('deve aceitar schema sem header opcional', () => {
    const mockSchema: PDFDocumentSchema = {
      title: 'Test Document',
      sections: [
        {
          type: 'paragraph',
          title: 'Section',
          content: 'Content',
        },
      ],
    }

    expect(mockSchema.header).toBeUndefined()
  })

  it('deve aceitar signatureLines opcional', () => {
    const mockSchema: PDFDocumentSchema = {
      title: 'Test Document',
      sections: [],
      signatureLines: [{ label: 'Signature 1' }, { label: 'Signature 2' }],
    }

    expect(mockSchema.signatureLines!.length).toBe(2)
  })
})
