/**
 * Testes para pdf-server-generator.ts
 * Testa o PDFTemplateBuilder e generatePDFFromSchema
 */

import {
  PDFTemplateBuilder,
  generatePDFFromSchema,
  generatePDFBlob,
} from '@/lib/pdf-server-generator'
import type {
  PDFDocumentSchema,
  PDFTableSection,
  PDFParagraphSection,
  PDFListSection,
} from '@/lib/pdf-schemas/schema'

// Mock do Puppeteer
jest.mock('puppeteer', () => {
  const mockPage = {
    setViewport: jest.fn().mockResolvedValue(undefined),
    setContent: jest.fn().mockResolvedValue(undefined),
    pdf: jest.fn().mockResolvedValue(Buffer.from('%PDF-mock')),
  }

  const mockBrowser = {
    newPage: jest.fn().mockResolvedValue(mockPage),
    close: jest.fn().mockResolvedValue(undefined),
  }

  return {
    launch: jest.fn().mockResolvedValue(mockBrowser),
  }
})

import puppeteer from 'puppeteer'

describe('pdf-server-generator - PDFTemplateBuilder', () => {
  describe('buildHeader', () => {
    it('deve construir header com logo e brasão', () => {
      const schema: PDFDocumentSchema = {
        title: 'Test Document',
        header: {
          showLogo: true,
          showBrasao: true,
          institution: 'IFCE',
          subInstitution: 'Pró-Reitoria',
          department: 'Diretoria de Extensão',
          campus: 'Campus Maracanaú',
        },
        sections: [],
      }

      const builder = new PDFTemplateBuilder(schema, {})
      const html = builder.buildHTML()

      expect(html).toContain('pdf-header')
      expect(html).toContain('IFCE')
      expect(html).toContain('Campus Maracanaú')
    })

    it('deve construir header sem logo quando showLogo é falso', () => {
      const schema: PDFDocumentSchema = {
        title: 'Test Document',
        header: {
          showLogo: false,
          showBrasao: true,
          institution: 'IFCE',
        },
        sections: [],
      }

      const builder = new PDFTemplateBuilder(schema, {})
      const html = builder.buildHTML()

      expect(html).toContain('IFCE')
      // Não deve conter imagem do logo
      expect(html).not.toContain('Logo IFCE')
    })

    it('deve construir header sem brasão quando showBrasao é falso', () => {
      const schema: PDFDocumentSchema = {
        title: 'Test Document',
        header: {
          showLogo: true,
          showBrasao: false,
          institution: 'IFCE',
        },
        sections: [],
      }

      const builder = new PDFTemplateBuilder(schema, {})
      const html = builder.buildHTML()

      expect(html).toContain('IFCE')
      expect(html).not.toContain('Brasão')
    })

    it('deve construir header vazio quando não há header no schema', () => {
      const schema: PDFDocumentSchema = {
        title: 'Test Document',
        sections: [],
      }

      const builder = new PDFTemplateBuilder(schema, {})
      const html = builder.buildHTML()

      expect(html).not.toContain('pdf-header')
    })
  })

  describe('buildTitle', () => {
    it('deve construir título com texto simples', () => {
      const schema: PDFDocumentSchema = {
        title: 'Relatório Mensal',
        sections: [],
      }

      const builder = new PDFTemplateBuilder(schema, {})
      const html = builder.buildHTML()

      expect(html).toContain('Relatório Mensal')
    })

    it('deve substituir placeholders no título', () => {
      const schema: PDFDocumentSchema = {
        title: 'Relatório de {nome_estudante}',
        sections: [],
      }

      const data = { nome_estudante: 'João Silva' }
      const builder = new PDFTemplateBuilder(schema, data)
      const html = builder.buildHTML()

      expect(html).toContain('Relatório de João Silva')
    })
  })

  describe('buildTableSection', () => {
    it('deve construir tabela com headers e rows', () => {
      const tableSection: PDFTableSection = {
        type: 'table',
        title: 'Dados do Discente',
        headers: ['Campo', 'Valor'],
        rows: [
          ['Nome', 'João Silva'],
          ['Curso', 'Informática'],
        ],
      }

      const schema: PDFDocumentSchema = {
        title: 'Test',
        sections: [tableSection],
      }

      const builder = new PDFTemplateBuilder(schema, {})
      const html = builder.buildHTML()

      expect(html).toContain('Dados do Discente')
      expect(html).toContain('<table')
      expect(html).toContain('Campo')
      expect(html).toContain('João Silva')
      expect(html).toContain('Informática')
    })

    it('deve substituir placeholders na tabela', () => {
      const tableSection: PDFTableSection = {
        type: 'table',
        title: 'Dados',
        headers: ['Campo', 'Valor'],
        rows: [
          ['Nome', '{nome}'],
          ['Curso', '{curso}'],
        ],
      }

      const schema: PDFDocumentSchema = {
        title: 'Test',
        sections: [tableSection],
      }

      const data = { nome: 'Maria', curso: 'Administração' }
      const builder = new PDFTemplateBuilder(schema, data)
      const html = builder.buildHTML()

      expect(html).toContain('Maria')
      expect(html).toContain('Administração')
      expect(html).not.toContain('{nome}')
      expect(html).not.toContain('{curso}')
    })
  })

  describe('buildParagraphSection', () => {
    it('deve construir seção de parágrafo', () => {
      const paraSection: PDFParagraphSection = {
        type: 'paragraph',
        title: 'Atividades',
        content: 'Desenvolvimento de sistemas web',
      }

      const schema: PDFDocumentSchema = {
        title: 'Test',
        sections: [paraSection],
      }

      const builder = new PDFTemplateBuilder(schema, {})
      const html = builder.buildHTML()

      expect(html).toContain('Atividades')
      expect(html).toContain('Desenvolvimento de sistemas web')
    })

    it('deve substituir placeholders no parágrafo', () => {
      const paraSection: PDFParagraphSection = {
        type: 'paragraph',
        title: 'Descrição',
        content: 'O estudante {nome} realizou {atividade}',
      }

      const schema: PDFDocumentSchema = {
        title: 'Test',
        sections: [paraSection],
      }

      const data = { nome: 'Pedro', atividade: 'pesquisa' }
      const builder = new PDFTemplateBuilder(schema, data)
      const html = builder.buildHTML()

      expect(html).toContain('O estudante Pedro realizou pesquisa')
    })
  })

  describe('buildListSection', () => {
    it('deve construir seção de lista', () => {
      const listSection: PDFListSection = {
        type: 'list',
        title: 'Tarefas',
        items: ['Tarefa 1', 'Tarefa 2', 'Tarefa 3'],
      }

      const schema: PDFDocumentSchema = {
        title: 'Test',
        sections: [listSection],
      }

      const builder = new PDFTemplateBuilder(schema, {})
      const html = builder.buildHTML()

      expect(html).toContain('Tarefas')
      expect(html).toContain('<ul')
      expect(html).toContain('Tarefa 1')
      expect(html).toContain('Tarefa 2')
      expect(html).toContain('Tarefa 3')
    })

    it('deve substituir placeholders na lista', () => {
      const listSection: PDFListSection = {
        type: 'list',
        title: 'Dados',
        items: ['Nome: {nome}', 'Curso: {curso}'],
      }

      const schema: PDFDocumentSchema = {
        title: 'Test',
        sections: [listSection],
      }

      const data = { nome: 'Ana', curso: 'Direito' }
      const builder = new PDFTemplateBuilder(schema, data)
      const html = builder.buildHTML()

      expect(html).toContain('Nome: Ana')
      expect(html).toContain('Curso: Direito')
    })
  })

  describe('buildSignatureLines', () => {
    it('deve construir linhas de assinatura', () => {
      const schema: PDFDocumentSchema = {
        title: 'Test',
        sections: [],
        signatureLines: [{ label: 'Supervisor do Estágio' }, { label: 'Discente Estagiário' }],
      }

      const builder = new PDFTemplateBuilder(schema, {})
      const html = builder.buildHTML()

      expect(html).toContain('Supervisor do Estágio')
      expect(html).toContain('Discente Estagiário')
      expect(html).toContain('border-top: 1px solid #000')
    })

    it('deve substituir placeholders nas assinaturas', () => {
      const schema: PDFDocumentSchema = {
        title: 'Test',
        sections: [],
        signatureLines: [{ label: '{cargo_supervisor}' }],
      }

      const data = { cargo_supervisor: 'Coordenador de Estágios' }
      const builder = new PDFTemplateBuilder(schema, data)
      const html = builder.buildHTML()

      expect(html).toContain('Coordenador de Estágios')
    })

    it('não deve construir assinaturas quando lista está vazia', () => {
      const schema: PDFDocumentSchema = {
        title: 'Test',
        sections: [],
        signatureLines: [],
      }

      const builder = new PDFTemplateBuilder(schema, {})
      const html = builder.buildHTML()

      expect(html).not.toContain('sig-item')
    })

    it('não deve construir assinaturas quando não definidas', () => {
      const schema: PDFDocumentSchema = {
        title: 'Test',
        sections: [],
      }

      const builder = new PDFTemplateBuilder(schema, {})
      const html = builder.buildHTML()

      expect(html).not.toContain('sig-item')
    })
  })

  describe('buildHTML - estrutura completa', () => {
    it('deve gerar HTML completo com todas as seções', () => {
      const schema: PDFDocumentSchema = {
        title: 'Relatório de {nome_estudante}',
        header: {
          showLogo: true,
          showBrasao: true,
          institution: 'IFCE',
          campus: 'Campus Maracanaú',
        },
        sections: [
          {
            type: 'table',
            title: 'Dados',
            headers: ['Campo', 'Valor'],
            rows: [['Nome', '{nome}']],
          },
          {
            type: 'paragraph',
            title: 'Atividades',
            content: '{atividades}',
          },
        ],
        signatureLines: [{ label: 'Assinatura' }],
      }

      const data = {
        nome_estudante: 'João',
        nome: 'João Silva',
        atividades: 'Desenvolvimento web',
      }

      const builder = new PDFTemplateBuilder(schema, data)
      const html = builder.buildHTML()

      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('IFCE')
      expect(html).toContain('Relatório de João')
      expect(html).toContain('João Silva')
      expect(html).toContain('Desenvolvimento web')
      expect(html).toContain('Assinatura')
    })

    it('deve manter placeholders não substituídos', () => {
      const schema: PDFDocumentSchema = {
        title: 'Relatório',
        sections: [
          {
            type: 'paragraph',
            title: 'Dados',
            content: 'Nome: {nome}, Email: {email}',
          },
        ],
      }

      const data = { nome: 'Maria' }
      const builder = new PDFTemplateBuilder(schema, data)
      const html = builder.buildHTML()

      expect(html).toContain('Nome: Maria')
      expect(html).toContain('Email: {email}')
    })
  })
})

describe('pdf-server-generator - generatePDFFromSchema', () => {
  const mockSchema: PDFDocumentSchema = {
    title: 'Test Document',
    header: {
      showLogo: true,
      showBrasao: true,
      institution: 'IFCE',
    },
    sections: [
      {
        type: 'table',
        title: 'Dados',
        headers: ['Campo', 'Valor'],
        rows: [['Nome', 'João']],
      },
    ],
  }

  const mockData = { nome: 'João Silva' }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve chamar puppeteer.launch com configurações corretas', async () => {
    await generatePDFFromSchema(mockSchema, mockData)

    expect(puppeteer.launch).toHaveBeenCalledWith({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
  })

  it('deve retornar buffer PDF', async () => {
    const result = await generatePDFFromSchema(mockSchema, mockData)

    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
  })

  it('deve gerar PDF em modo landscape quando especificado', async () => {
    await generatePDFFromSchema(mockSchema, mockData, { landscape: true })

    const browser = await (puppeteer.launch as jest.Mock).mock.results[0].value
    const page = await browser.newPage.mock.results[0].value
    
    expect(page.setViewport).toHaveBeenCalledWith(
      expect.objectContaining({
        width: 1122,
        height: 794,
      })
    )
  })

  it('deve gerar PDF em modo portrait por padrão', async () => {
    await generatePDFFromSchema(mockSchema, mockData, { landscape: false })

    const browser = await (puppeteer.launch as jest.Mock).mock.results[0].value
    const page = await browser.newPage.mock.results[0].value

    expect(page.setViewport).toHaveBeenCalledWith(
      expect.objectContaining({
        width: 794,
        height: 1123,
      })
    )
  })

  it('deve fechar browser após geração', async () => {
    await generatePDFFromSchema(mockSchema, mockData)

    const browser = await (puppeteer.launch as jest.Mock).mock.results[0].value
    expect(browser.close).toHaveBeenCalled()
  })
})

describe('pdf-server-generator - generatePDFBlob', () => {
  const mockSchema: PDFDocumentSchema = {
    title: 'Test',
    sections: [],
  }

  it('deve retornar Blob', async () => {
    const result = await generatePDFBlob(mockSchema, {})

    expect(result).toBeInstanceOf(Blob)
    expect(result.type).toBe('application/pdf')
  })
})
