/**
 * Testes para API route /api/pdf/generate
 * Testa os endpoints GET e POST
 */

import { NextRequest } from 'next/server'

// Mock do generatePDFFromSchema
jest.mock('@/lib/pdf-server-generator', () => ({
    generatePDFFromSchema: jest.fn().mockResolvedValue(Buffer.from('%PDF-mock-pdf-buffer')),
}))

// Mock dos schema builders
jest.mock('@/lib/pdf-schemas/templates', () => ({
    buildMonthlyReportSchema: jest.fn().mockReturnValue({ title: 'Monthly Report' }),
    buildFinalReportSchema: jest.fn().mockReturnValue({ title: 'Final Report' }),
    buildSemesterReportSchema: jest.fn().mockReturnValue({ title: 'Semester Report' }),
    buildCommitmentTermSchema: jest.fn().mockReturnValue({ title: 'Commitment Term' }),
    buildAdditiveTermSchema: jest.fn().mockReturnValue({ title: 'Additive Term' }),
    buildExtensionDeclarationSchema: jest.fn().mockReturnValue({ title: 'Extension Declaration' }),
    buildProfessionalDeclarationSchema: jest.fn().mockReturnValue({ title: 'Professional Declaration' }),
    buildInternshipRegistrationSchema: jest.fn().mockReturnValue({ title: 'Internship Registration' }),
    buildInternshipRegistrationRequestSchema: jest.fn().mockReturnValue({ title: 'Registration Request' }),
    buildRealizationTermSchema: jest.fn().mockReturnValue({ title: 'Realization Term' }),
    buildRescissionTermSchema: jest.fn().mockReturnValue({ title: 'Rescission Term' }),
    buildEquivalenceRequestSchema: jest.fn().mockReturnValue({ title: 'Equivalence Request' }),
    buildStudentEvaluationSchema: jest.fn().mockReturnValue({ title: 'Student Evaluation' }),
}))

import { generatePDFFromSchema } from '@/lib/pdf-server-generator'

// Mock da NextRequest
const createMockRequest = (body: any) => {
    return {
        json: jest.fn().mockResolvedValue(body),
    } as unknown as NextRequest
}

// Import route after mocks
const { POST, GET } = require('@/app/api/pdf/generate/route')

describe('API /api/pdf/generate', () => {
    describe('GET - Health Check', () => {
        it('deve retornar status ok', async () => {
            const response = await GET()
            const data = await response.json()

            expect(data.status).toBe('ok')
            expect(data.message).toBe('PDF generation API is ready')
        })

        it('deve retornar lista de tipos suportados', async () => {
            const response = await GET()
            const data = await response.json()

            expect(data.supportedTypes).toBeDefined()
            expect(Array.isArray(data.supportedTypes)).toBe(true)
            expect(data.supportedTypes.length).toBe(13)
        })

        it('deve conter todos os tipos de documentos suportados', async () => {
            const response = await GET()
            const data = await response.json()

            const expectedTypes = [
                'monthlyReport',
                'finalReport',
                'semesterReport',
                'commitmentTerm',
                'additiveTerm',
                'extensionDeclaration',
                'professionalDeclaration',
                'internshipRegistration',
                'internshipRegistrationRequest',
                'realizationTerm',
                'rescissionTerm',
                'equivalenceRequest',
                'studentEvaluation',
            ]

            expectedTypes.forEach(type => {
                expect(data.supportedTypes).toContain(type)
            })
        })
    })

    describe('POST - Generate PDF', () => {
        beforeEach(() => {
            jest.clearAllMocks()
        })

        it('deve retornar erro 400 quando documentType não fornecido', async () => {
            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    data: { nome: 'João' },
                }),
            } as any

            const response = await POST(mockRequest as NextRequest)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toContain('documentType')
        })

        it('deve retornar erro 400 quando data não fornecido', async () => {
            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    documentType: 'monthlyReport',
                }),
            } as any

            const response = await POST(mockRequest as NextRequest)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toContain('data')
        })

        it('deve retornar erro 400 para tipo de documento não suportado', async () => {
            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    documentType: 'invalidType',
                    data: { nome: 'João' },
                }),
            } as any

            const response = await POST(mockRequest as NextRequest)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toContain('Unsupported document type')
        })

        it('deve gerar PDF para monthlyReport', async () => {
            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    documentType: 'monthlyReport',
                    data: {
                        nome_estudante: 'João Silva',
                        curso_estudante: 'Informática',
                    },
                    options: {
                        filename: 'relatorio-mensal.pdf',
                    },
                }),
            } as any

            const response = await POST(mockRequest as NextRequest)

            expect(response.status).toBe(200)
            expect(response.headers.get('Content-Type')).toBe('application/pdf')
            expect(response.headers.get('Content-Disposition')).toContain('relatorio-mensal.pdf')
        })

        it('deve gerar PDF para finalReport', async () => {
            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    documentType: 'finalReport',
                    data: { nome: 'Maria' },
                }),
            } as any

            const response = await POST(mockRequest as NextRequest)

            expect(response.status).toBe(200)
        })

        it('deve gerar PDF para commitmentTerm', async () => {
            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    documentType: 'commitmentTerm',
                    data: { nome: 'Pedro' },
                }),
            } as any

            const response = await POST(mockRequest as NextRequest)

            expect(response.status).toBe(200)
        })

        it('deve gerar PDF para rescissionTerm', async () => {
            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    documentType: 'rescissionTerm',
                    data: { nome: 'Ana' },
                }),
            } as any

            const response = await POST(mockRequest as NextRequest)

            expect(response.status).toBe(200)
        })

        it('deve gerar PDF para studentEvaluation', async () => {
            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    documentType: 'studentEvaluation',
                    data: { nome: 'Carlos' },
                }),
            } as any

            const response = await POST(mockRequest as NextRequest)

            expect(response.status).toBe(200)
        })

        it('deve chamar generatePDFFromSchema com schema e data corretos', async () => {
            const mockData = {
                nome_estudante: 'João Silva',
                curso_estudante: 'Informática',
            }

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    documentType: 'monthlyReport',
                    data: mockData,
                }),
            } as any

            await POST(mockRequest as NextRequest)

            expect(generatePDFFromSchema).toHaveBeenCalled()
        })

        it('deve retornar erro 500 quando geração do PDF falha', async () => {
            // Mock para simular erro na geração do PDF
            ; (generatePDFFromSchema as jest.Mock).mockRejectedValueOnce(new Error('PDF generation failed'))

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    documentType: 'monthlyReport',
                    data: { nome: 'João' },
                }),
            } as any

            const response = await POST(mockRequest as NextRequest)
            const data = await response.json()

            expect(response.status).toBe(500)
            expect(data.error).toBe('Failed to generate PDF')
        })

        it('deve usar filename padrão quando não especificado', async () => {
            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    documentType: 'monthlyReport',
                    data: { nome: 'João' },
                    options: {},
                }),
            } as any

            const response = await POST(mockRequest as NextRequest)

            expect(response.status).toBe(200)
            expect(response.headers.get('Content-Disposition')).toContain('document.pdf')
        })

        it('deve suportar todos os tipos de documentos', async () => {
            const documentTypes = [
                'monthlyReport',
                'finalReport',
                'semesterReport',
                'commitmentTerm',
                'additiveTerm',
                'extensionDeclaration',
                'professionalDeclaration',
                'internshipRegistration',
                'internshipRegistrationRequest',
                'realizationTerm',
                'rescissionTerm',
                'equivalenceRequest',
                'studentEvaluation',
            ]

            for (const docType of documentTypes) {
                const mockRequest = {
                    json: jest.fn().mockResolvedValue({
                        documentType: docType,
                        data: { teste: 'data' },
                    }),
                } as any

                const response = await POST(mockRequest as NextRequest)
                expect(response.status).toBe(200)
            }
        })
    })

    describe('integração completa', () => {
        it('deve gerar PDF com opções customizadas', async () => {
            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    documentType: 'monthlyReport',
                    data: {
                        nome_estudante: 'Test User',
                        curso_estudante: 'Test Course',
                    },
                    options: {
                        filename: 'custom-name.pdf',
                        landscape: false,
                    },
                }),
            } as any

            const response = await POST(mockRequest as NextRequest)

            expect(response.status).toBe(200)
            expect(response.headers.get('Content-Type')).toBe('application/pdf')
            expect(response.headers.get('Content-Disposition')).toContain('custom-name.pdf')
        })
    })
})
