/**
 * Testes para funções utilitárias do pdf-generator-react.ts
 * Testa formatações de data, CPF, CNPJ e telefone
 */

// Mock do @react-pdf/renderer
jest.mock('@react-pdf/renderer', () => ({
    pdf: jest.fn().mockResolvedValue({
        toBlob: jest.fn().mockResolvedValue(new Blob(['mock pdf'], { type: 'application/pdf' })),
    }),
    Document: 'Document',
    Page: 'Page',
    Text: 'Text',
    View: 'View',
    Image: 'Image',
    StyleSheet: {
        create: jest.fn().mockReturnValue({}),
    },
}))

// Mock do file-saver
jest.mock('file-saver', () => ({
    saveAs: jest.fn(),
}))

import {
    formatDate,
    formatCPF,
    formatCNPJ,
    formatPhone,
    validateFormData,
} from '@/lib/pdf-generator-react'

describe('pdf-generator-react - formatDate', () => {
    it('deve formatar data no padrão DD/MM/YYYY', () => {
        expect(formatDate('2024-01-15')).toBe('15/01/2024')
    })

    it('deve formatar data com dia e mês de dois dígitos', () => {
        expect(formatDate('2024-12-31')).toBe('31/12/2024')
    })

    it('deve retornar placeholder para data vazia', () => {
        expect(formatDate('')).toBe('___/___/_____')
    })

    it('deve retornar placeholder para string não informada', () => {
        expect(formatDate(undefined as any)).toBe('___/___/_____')
    })

    it('deve retornar placeholder para null', () => {
        expect(formatDate(null as any)).toBe('___/___/_____')
    })

    it('deve formatar datas de diferentes meses', () => {
        expect(formatDate('2024-02-29')).toBe('29/02/2024')
        expect(formatDate('2024-06-15')).toBe('15/06/2024')
        expect(formatDate('2024-11-01')).toBe('01/11/2024')
    })
})

describe('pdf-generator-react - formatCPF', () => {
    it('deve formatar CPF sem máscara', () => {
        expect(formatCPF('12345678900')).toBe('123.456.789-00')
    })

    it('deve retornar string vazia para CPF vazio', () => {
        expect(formatCPF('')).toBe('')
    })

    it('deve retornar string vazia para CPF não informado', () => {
        expect(formatCPF(undefined as any)).toBe('')
    })

    it('deve formatar CPF com diferentes números', () => {
        expect(formatCPF('98765432100')).toBe('987.654.321-00')
        expect(formatCPF('11122233344')).toBe('111.222.333-44')
    })
})

describe('pdf-generator-react - formatCNPJ', () => {
    it('deve formatar CNPJ sem máscara', () => {
        expect(formatCNPJ('12345678000190')).toBe('12.345.678/0001-90')
    })

    it('deve retornar string vazia para CNPJ vazio', () => {
        expect(formatCNPJ('')).toBe('')
    })

    it('deve retornar string vazia para CNPJ não informado', () => {
        expect(formatCNPJ(undefined as any)).toBe('')
    })

    it('deve formatar CNPJ com diferentes números', () => {
        expect(formatCNPJ('98765432000100')).toBe('98.765.432/0001-00')
    })
})

describe('pdf-generator-react - formatPhone', () => {
    it('deve formatar celular com 11 dígitos', () => {
        expect(formatPhone('85999998888')).toBe('(85) 99999-8888')
    })

    it('deve formatar telefone fixo com 10 dígitos', () => {
        expect(formatPhone('8533334444')).toBe('(85) 3333-4444')
    })

    it('deve retornar string vazia para telefone vazio', () => {
        expect(formatPhone('')).toBe('')
    })

    it('deve retornar string vazia para telefone não informado', () => {
        expect(formatPhone(undefined as any)).toBe('')
    })

    it('deve retornar número original se não tiver 10 ou 11 dígitos', () => {
        expect(formatPhone('12345')).toBe('12345')
    })

    it('deve formatar diferentes números de telefone', () => {
        expect(formatPhone('11988887777')).toBe('(11) 98888-7777')
        expect(formatPhone('2133334444')).toBe('(21) 3333-4444')
    })
})

describe('pdf-generator-react - validateFormData', () => {
    it('deve validar formulário com dados', () => {
        const formData = {
            nome: 'João Silva',
            email: 'joao@email.com',
        }

        expect(validateFormData(formData)).toBe(true)
    })

    it('deve validar formulário com número zero', () => {
        const formData = {
            valor: 0,
        }

        expect(() => validateFormData(formData)).toThrow('Preencha pelo menos um campo')
    })

    it('deve lançar erro para formulário vazio', () => {
        const formData = {}

        expect(() => validateFormData(formData)).toThrow('Preencha pelo menos um campo')
    })

    it('deve lançar erro para formulário com apenas valores nulos', () => {
        const formData = {
            campo1: null,
            campo2: undefined,
            campo3: '',
        }

        expect(() => validateFormData(formData)).toThrow('Preencha pelo menos um campo')
    })

    it('deve validar formulário com pelo menos um campo preenchido', () => {
        const formData = {
            nome: 'Maria',
            email: '',
            telefone: null,
        }

        expect(validateFormData(formData)).toBe(true)
    })
})
