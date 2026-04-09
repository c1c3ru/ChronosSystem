/**
 * Testes para pdf-engine.ts (engine unificada)
 * Testa todas as funções exportadas
 */

// Mock do html2pdf.js
const mockHtml2Pdf = {
    set: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    save: jest.fn().mockResolvedValue(undefined),
    outputPdf: jest.fn().mockResolvedValue(new Blob(['mock pdf'], { type: 'application/pdf' })),
}

jest.mock('html2pdf.js', () => ({
    get default() {
        return () => mockHtml2Pdf
    },
}))

import {
    generatePDFClient,
    generatePDFBlobFromElement,
    generateHTMLPDF,
    downloadPDFBlob,
    validateFormData,
    convertImagesToBase64,
} from '@/lib/pdf-engine'

describe('pdf-engine - generatePDFClient', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('deve gerar PDF a partir de elemento HTML', async () => {
        const mockElement = {
            cloneNode: jest.fn().mockReturnValue({
                style: {},
                querySelectorAll: jest.fn().mockReturnValue([]),
            }),
            style: {},
        } as any

        await generatePDFClient(mockElement, { filename: 'test.pdf' })

        expect(mockElement.cloneNode).toHaveBeenCalled()
        expect(mockHtml2Pdf.set).toHaveBeenCalled()
        expect(mockHtml2Pdf.from).toHaveBeenCalled()
        expect(mockHtml2Pdf.save).toHaveBeenCalled()
    })

    it('deve usar configurações padrão quando opções não fornecidas', async () => {
        const mockElement = {
            cloneNode: jest.fn().mockReturnValue({
                style: {},
                querySelectorAll: jest.fn().mockReturnValue([]),
            }),
            style: {},
        } as any

        await generatePDFClient(mockElement)

        expect(mockHtml2Pdf.set).toHaveBeenCalledWith(
            expect.objectContaining({
                filename: expect.stringContaining('documento_'),
                image: { type: 'jpeg', quality: 0.98 },
            })
        )
    })

    it('deve lançar erro quando executado no servidor', async () => {
        const originalWindow = global.window
        // @ts-ignore
        delete global.window

        await expect(generatePDFClient({} as any)).rejects.toThrow('só pode ser executado no navegador')

        global.window = originalWindow
    })
})

describe('pdf-engine - generatePDFBlobFromElement', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('deve gerar PDF como Blob', async () => {
        const mockElement = {
            cloneNode: jest.fn().mockReturnValue({
                style: {},
                querySelectorAll: jest.fn().mockReturnValue([]),
            }),
            style: {},
        } as any

        const result = await generatePDFBlobFromElement(mockElement)

        expect(result).toBeInstanceOf(Blob)
        expect(mockHtml2Pdf.from).toHaveBeenCalled()
    })
})

describe('pdf-engine - generateHTMLPDF', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('deve criar iframe oculto para geração', async () => {
        const mockIframe = {
            contentDocument: {
                open: jest.fn(),
                write: jest.fn(),
                close: jest.fn(),
                body: {},
            },
            style: {},
        }

        const originalCreateElement = global.document.createElement
        global.document.createElement = jest.fn().mockReturnValue(mockIframe) as any

        const html = '<html><body>Test</body></html>'

        try {
            await generateHTMLPDF(html, 'test.pdf')
        } catch (e) {
            // Esperado em ambiente de teste
        }

        expect(global.document.createElement).toHaveBeenCalledWith('iframe')
        global.document.createElement = originalCreateElement
    })

    it('deve lançar erro quando não está no navegador', async () => {
        const originalWindow = global.window
        // @ts-ignore
        delete global.window

        await expect(generateHTMLPDF('<html></html>', 'test.pdf'))
            .rejects
            .toThrow('só pode ser executado no navegador')

        global.window = originalWindow
    })
})

describe('pdf-engine - downloadPDFBlob', () => {
    it('deve configurar link de download corretamente', () => {
        const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' })
        const mockLink = { click: jest.fn(), href: '', download: '' }

        global.document.createElement = jest.fn().mockReturnValue(mockLink) as any
        global.URL.createObjectURL = jest.fn().mockReturnValue('blob:url')
        global.URL.revokeObjectURL = jest.fn()

        // A função deve executar sem erros
        expect(() => downloadPDFBlob(mockBlob, 'test.pdf')).not.toThrow()
        expect(mockLink.download).toBe('test.pdf')
        expect(mockLink.click).toHaveBeenCalled()
        expect(global.URL.revokeObjectURL).toHaveBeenCalled()
    })
})

describe('pdf-engine - validateFormData', () => {
    it('deve validar formulário com dados', () => {
        const formData = { nome: 'João', email: 'joao@email.com' }
        expect(validateFormData(formData)).toBe(true)
    })

    it('deve lançar erro para formulário vazio', () => {
        const formData = {}
        expect(() => validateFormData(formData)).toThrow('Preencha pelo menos um campo')
    })

    it('deve lançar erro para formulário com valores nulos/vazios', () => {
        const formData = { campo1: null, campo2: undefined, campo3: '' }
        expect(() => validateFormData(formData)).toThrow('Preencha pelo menos um campo')
    })
})

describe('pdf-engine - convertImagesToBase64', () => {
    it('deve ignorar imagens com src absoluto (http)', async () => {
        const html = '<img src="https://example.com/logo.png" alt="Logo">'
        const baseUrl = 'http://localhost:3000'

        const result = await convertImagesToBase64(html, baseUrl)

        // Imagens com http não devem ser convertidas
        expect(result).toBe(html)
    })

    it('deve continuar mesmo se falhar ao carregar uma imagem', async () => {
        const html = '<img src="/images/logo.png" alt="Logo">'
        const baseUrl = 'http://localhost:3000'

        global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))

        const result = await convertImagesToBase64(html, baseUrl)

        expect(result).toBe(html) // Retorna HTML original se falhar
    })
})
