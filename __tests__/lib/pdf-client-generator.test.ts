/**
 * Testes para pdf-client-generator.ts
 * Testa o gerador unificado de PDF
 */

// Mock do html2pdf.js
const mockHtml2Pdf = {
    set: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    save: jest.fn().mockResolvedValue(undefined),
}

jest.mock('html2pdf.js', () => ({
    get default() {
        return () => mockHtml2Pdf
    },
}))

import { generatePDF } from '@/lib/pdf-client-generator'
import type { PDFDocumentSchema } from '@/lib/pdf-schemas/schema'

describe('pdf-client-generator - generatePDF', () => {
    const mockSchema: PDFDocumentSchema = {
        title: 'Relatório Mensal',
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
                rows: [['Nome', '{nome}']],
            },
        ],
    }

    const mockData = { nome: 'João Silva' }

    beforeEach(() => {
        jest.clearAllMocks()
        
        // Mock do DOM para client-side generation
        global.document = {
            body: {
                appendChild: jest.fn(),
                removeChild: jest.fn(),
            },
            createElement: jest.fn().mockReturnValue({
                innerHTML: '',
                style: {},
            }),
        } as any

        mockHtml2Pdf.set.mockClear()
        mockHtml2Pdf.from.mockClear()
        mockHtml2Pdf.save.mockClear()
    })

    describe('generatePDFClientSide', () => {
        it('deve gerar PDF client-side quando preferServerSide é falso', async () => {
            await generatePDF(mockSchema, mockData, { preferServerSide: false })

            expect(global.document.createElement).toHaveBeenCalled()
            expect(global.document.body.appendChild).toHaveBeenCalled()
        })

        it('deve remover elemento temporário após geração', async () => {
            await generatePDF(mockSchema, mockData, { preferServerSide: false })

            expect(global.document.body.removeChild).toHaveBeenCalled()
        })

        it('deve chamar html2pdf com configurações corretas', async () => {
            await generatePDF(mockSchema, mockData, { preferServerSide: false })

            expect(mockHtml2Pdf.set).toHaveBeenCalled()
            expect(mockHtml2Pdf.from).toHaveBeenCalled()
            expect(mockHtml2Pdf.save).toHaveBeenCalled()
        })
    })

    describe('generatePDFServerSide', () => {
        it('deve tentar gerar PDF via API quando preferServerSide é verdadeiro', async () => {
            // Mock do fetch para simular resposta da API
            const mockBlob = new Blob(['%PDF-mock'], { type: 'application/pdf' })
            
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                blob: jest.fn().mockResolvedValue(mockBlob),
            })

            const result = await generatePDF(mockSchema, mockData, { preferServerSide: true })

            expect(global.fetch).toHaveBeenCalledWith(
                '/api/pdf/generate',
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
            )

            expect(result).toBeInstanceOf(Blob)
        })

        it('deve fazer fallback para client-side quando server-side falha', async () => {
            // Mock do fetch para simular falha da API
            global.fetch = jest.fn().mockResolvedValue({
                ok: false,
                status: 500,
                json: jest.fn().mockResolvedValue({ error: 'Server error' }),
            })

            await generatePDF(mockSchema, mockData, { preferServerSide: true })

            // Deve ter tentado client-side após falha do server
            expect(global.document.createElement).toHaveBeenCalled()
        })

        it('deve lançar erro quando server-side falha e não está no browser', async () => {
            // Simular ambiente server-side
            const originalWindow = global.window
            // @ts-ignore
            delete global.window

            global.fetch = jest.fn().mockResolvedValue({
                ok: false,
                status: 500,
                json: jest.fn().mockResolvedValue({ error: 'Server error' }),
            })

            await expect(generatePDF(mockSchema, mockData, { preferServerSide: true }))
                .rejects
                .toThrow('PDF generation failed')

            // Restaurar window
            global.window = originalWindow
        })
    })

    describe('getDocumentTypeFromSchema', () => {
        // Esta função é interna, mas podemos testá-la indiretamente
        // através do comportamento do generatePDF

        it('deve mapear título com "mensal" para monthlyReport', async () => {
            const schema: PDFDocumentSchema = {
                title: 'Relatório Mensal de Atividades',
                sections: [],
            }

            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                blob: jest.fn().mockResolvedValue(new Blob(['pdf'])),
            })

            await generatePDF(schema, {}, { preferServerSide: true })

            expect(global.fetch).toHaveBeenCalledWith(
                '/api/pdf/generate',
                expect.objectContaining({
                    body: expect.stringContaining('monthlyReport'),
                })
            )
        })

        it('deve mapear título com "final" para finalReport', async () => {
            const schema: PDFDocumentSchema = {
                title: 'Relatório Final de Estágio',
                sections: [],
            }

            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                blob: jest.fn().mockResolvedValue(new Blob(['pdf'])),
            })

            await generatePDF(schema, {}, { preferServerSide: true })

            expect(global.fetch).toHaveBeenCalledWith(
                '/api/pdf/generate',
                expect.objectContaining({
                    body: expect.stringContaining('finalReport'),
                })
            )
        })

        it('deve mapear título com "semestral" para semesterReport', async () => {
            const schema: PDFDocumentSchema = {
                title: 'Relatório Semestral',
                sections: [],
            }

            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                blob: jest.fn().mockResolvedValue(new Blob(['pdf'])),
            })

            await generatePDF(schema, {}, { preferServerSide: true })

            expect(global.fetch).toHaveBeenCalledWith(
                '/api/pdf/generate',
                expect.objectContaining({
                    body: expect.stringContaining('semesterReport'),
                })
            )
        })

        it('deve mapear título com "compromisso" para commitmentTerm', async () => {
            const schema: PDFDocumentSchema = {
                title: 'Termo de Compromisso',
                sections: [],
            }

            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                blob: jest.fn().mockResolvedValue(new Blob(['pdf'])),
            })

            await generatePDF(schema, {}, { preferServerSide: true })

            expect(global.fetch).toHaveBeenCalledWith(
                '/api/pdf/generate',
                expect.objectContaining({
                    body: expect.stringContaining('commitmentTerm'),
                })
            )
        })

        it('deve mapear título com "aditivo" para additiveTerm', async () => {
            const schema: PDFDocumentSchema = {
                title: 'Termo Aditivo',
                sections: [],
            }

            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                blob: jest.fn().mockResolvedValue(new Blob(['pdf'])),
            })

            await generatePDF(schema, {}, { preferServerSide: true })

            expect(global.fetch).toHaveBeenCalledWith(
                '/api/pdf/generate',
                expect.objectContaining({
                    body: expect.stringContaining('additiveTerm'),
                })
            )
        })

        it('deve mapear título com "prorrogação" para extensionDeclaration', async () => {
            const schema: PDFDocumentSchema = {
                title: 'Declaração de Prorrogação',
                sections: [],
            }

            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                blob: jest.fn().mockResolvedValue(new Blob(['pdf'])),
            })

            await generatePDF(schema, {}, { preferServerSide: true })

            expect(global.fetch).toHaveBeenCalledWith(
                '/api/pdf/generate',
                expect.objectContaining({
                    body: expect.stringContaining('extensionDeclaration'),
                })
            )
        })

        it('deve mapear título com "rescisão" para rescissionTerm', async () => {
            const schema: PDFDocumentSchema = {
                title: 'Termo de Rescisão',
                sections: [],
            }

            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                blob: jest.fn().mockResolvedValue(new Blob(['pdf'])),
            })

            await generatePDF(schema, {}, { preferServerSide: true })

            expect(global.fetch).toHaveBeenCalledWith(
                '/api/pdf/generate',
                expect.objectContaining({
                    body: expect.stringContaining('rescissionTerm'),
                })
            )
        })

        it('deve mapear título com "avaliação" para studentEvaluation', async () => {
            const schema: PDFDocumentSchema = {
                title: 'Ficha de Avaliação',
                sections: [],
            }

            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                blob: jest.fn().mockResolvedValue(new Blob(['pdf'])),
            })

            await generatePDF(schema, {}, { preferServerSide: true })

            expect(global.fetch).toHaveBeenCalledWith(
                '/api/pdf/generate',
                expect.objectContaining({
                    body: expect.stringContaining('studentEvaluation'),
                })
            )
        })

        it('deve usar "document" como tipo padrão quando não encontra correspondência', async () => {
            const schema: PDFDocumentSchema = {
                title: 'Documento Genérico',
                sections: [],
            }

            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                blob: jest.fn().mockResolvedValue(new Blob(['pdf'])),
            })

            await generatePDF(schema, {}, { preferServerSide: true })

            expect(global.fetch).toHaveBeenCalledWith(
                '/api/pdf/generate',
                expect.objectContaining({
                    body: expect.stringContaining('document'),
                })
            )
        })
    })

    describe('schemaToHtml', () => {
        it('deve converter schema com tabela para HTML', async () => {
            const schema: PDFDocumentSchema = {
                title: 'Test',
                sections: [
                    {
                        type: 'table',
                        title: 'Dados',
                        headers: ['Campo', 'Valor'],
                        rows: [['Nome', 'João']],
                    },
                ],
            }

            await generatePDF(schema, {}, { preferServerSide: false })

            expect(global.document.createElement).toHaveBeenCalled()
        })

        it('deve converter schema com parágrafo para HTML', async () => {
            const schema: PDFDocumentSchema = {
                title: 'Test',
                sections: [
                    {
                        type: 'paragraph',
                        title: 'Descrição',
                        content: 'Texto do parágrafo',
                    },
                ],
            }

            await generatePDF(schema, {}, { preferServerSide: false })

            expect(global.document.createElement).toHaveBeenCalled()
        })

        it('deve converter schema com lista para HTML', async () => {
            const schema: PDFDocumentSchema = {
                title: 'Test',
                sections: [
                    {
                        type: 'list',
                        title: 'Itens',
                        items: ['Item 1', 'Item 2'],
                    },
                ],
            }

            await generatePDF(schema, {}, { preferServerSide: false })

            expect(global.document.createElement).toHaveBeenCalled()
        })

        it('deve incluir header no HTML quando definido', async () => {
            const schema: PDFDocumentSchema = {
                title: 'Test',
                header: {
                    showLogo: true,
                    showBrasao: true,
                    institution: 'IFCE',
                },
                sections: [],
            }

            await generatePDF(schema, {}, { preferServerSide: false })

            expect(global.document.createElement).toHaveBeenCalled()
        })

        it('deve incluir assinaturas no HTML quando definidas', async () => {
            const schema: PDFDocumentSchema = {
                title: 'Test',
                sections: [],
                signatureLines: [
                    { label: 'Assinatura 1' },
                    { label: 'Assinatura 2' },
                ],
            }

            await generatePDF(schema, {}, { preferServerSide: false })

            expect(global.document.createElement).toHaveBeenCalled()
        })
    })

    describe('opções de PDF', () => {
        it('deve aceitar opção landscape', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                blob: jest.fn().mockResolvedValue(new Blob(['pdf'])),
            })

            await generatePDF(mockSchema, mockData, {
                preferServerSide: true,
                landscape: true,
            })

            expect(global.fetch).toHaveBeenCalled()
        })

        it('deve aceitar opção filename', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                blob: jest.fn().mockResolvedValue(new Blob(['pdf'])),
            })

            await generatePDF(mockSchema, mockData, {
                preferServerSide: true,
                filename: 'relatorio.pdf',
            })

            expect(global.fetch).toHaveBeenCalled()
        })

        it('deve aceitar opção margin', async () => {
            await generatePDF(mockSchema, mockData, {
                preferServerSide: false,
                margin: [10, 15, 10, 15],
            })

            expect(mockHtml2Pdf.set).toHaveBeenCalled()
        })
    })
})
