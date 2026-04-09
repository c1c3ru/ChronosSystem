# Guia de Implementação da Geração de PDF nos Formulários do IFCE

## 📋 Visão Geral

A funcionalidade de geração de PDF foi implementada para converter os formulários oficiais do IFCE em documentos PDF prontos para impressão e envio, mantendo a formatação oficial.

---

## 🛠️ Como Funciona

### **1. Biblioteca `pdf-generator.ts`**

Localização: `/lib/pdf-generator.ts`

**Funções principais:**

#### `printElementAsPDF(element, options)`

- Converte qualquer elemento HTML em PDF
- Otimizado para documentos oficiais do IFCE
- Remove automaticamente botões e elementos de navegação
- Ajusta estilos para impressão profissional

#### `generateFormPDF(formRef, documentType, formData)`

- Wrapper conveniente para formulários
- Valida se há dados preenchidos
- Gera nome de arquivo automaticamente com data
- Exemplo: `relatorio-mensal_2025-11-24.pdf`

#### `validateFormData(formData)`

- Verifica se o formulário tem dados preenchidos
- Lança erro se estiver vazio

---

## 📝 Como Implementar em um Formulário

### **Passo 1: Importar a função**

```typescript
import { generateFormPDF } from '@/lib/pdf-generator'
```

### **Passo 2: Criar a função de geração**

```typescript
const handleGeneratePDF = async () => {
  try {
    // Validar se há dados preenchidos
    const hasData = Object.values(formData).some((value) => value !== '')
    if (!hasData) {
      toast.error('Preencha pelo menos um campo antes de gerar o PDF')
      return
    }

    toast.loading('Gerando PDF...', { id: 'pdf-generation' })

    // Importar dinamicamente para evitar problemas de SSR
    const { generateFormPDF } = await import('@/lib/pdf-generator')

    await generateFormPDF(formRef, 'nome-do-documento', formData)

    toast.success('PDF gerado com sucesso!', { id: 'pdf-generation' })
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    toast.error(error instanceof Error ? error.message : 'Erro ao gerar PDF. Tente novamente.', {
      id: 'pdf-generation',
    })
  }
}
```

### **Passo 3: Substituir a mensagem "em desenvolvimento"**

**Antes:**

```typescript
const handleGeneratePDF = () => {
  toast.info('Funcionalidade em desenvolvimento')
}
```

**Depois:**

```typescript
const handleGeneratePDF = async () => {
  // Código do Passo 2
}
```

---

## 📂 Formulários a Serem Atualizados

### ✅ **Já Implementado:**

- [x] `monthly-report` - Relatório Mensal

### ⏳ **Pendentes:**

1. **`semester-report`** - Relatório Semestral
   - Nome do arquivo: `relatorio-semestral`

2. **`final-report`** - Relatório Final
   - Nome do arquivo: `relatorio-final`

3. **`additive-term`** - Termo Aditivo
   - Nome do arquivo: `termo-aditivo`

4. **`commitment-term`** - Termo de Compromisso
   - Nome do arquivo: `termo-compromisso`

5. **`equivalence-request`** - Solicitação de Equivalência
   - Nome do arquivo: `solicitacao-equivalencia`

6. **`professional-declaration`** - Declaração Profissional
   - Nome do arquivo: `declaracao-profissional`

7. **`extension-declaration`** - Declaração de Prorrogação
   - Nome do arquivo: `declaracao-prorrogacao`

8. **`internship-registration`** - Cadastro de Estágio
   - Nome do arquivo: `cadastro-estagio`

---

## 🎨 Personalização do PDF

### **Ajustar Margens**

```typescript
await generateFormPDF(formRef, 'documento', formData)
// Usa margem padrão de 15mm (padrão ABNT)
```

Para margens personalizadas, use `printElementAsPDF`:

```typescript
await printElementAsPDF(formRef.current, {
  filename: 'documento.pdf',
  margin: [20, 15, 20, 15], // [top, right, bottom, left] em mm
})
```

### **Elementos que NÃO aparecem no PDF**

Adicione o atributo `data-no-pdf="true"` para remover do PDF:

```tsx
<div data-no-pdf="true">Este conteúdo não aparecerá no PDF</div>
```

Automaticamente removidos:

- Todos os `<button>`
- Links de navegação (`<a href="/">`)
- Elementos com classe `.no-print`
- Elementos `<nav>`

### **Quebras de Página**

Use classes CSS para controlar quebras:

```tsx
<div className="page-break-before">
  Este conteúdo começará em uma nova página
</div>

<div className="page-break-after">
  Após este conteúdo, haverá uma nova página
</div>

<div className="no-page-break">
  Este conteúdo não será quebrado entre páginas
</div>
```

---

## 🔧 Configurações Técnicas

### **Especificações do PDF Gerado:**

- **Formato:** A4 (210mm x 297mm)
- **Orientação:** Retrato (portrait)
- **Margens:** 15mm (padrão ABNT)
- **Resolução:** Scale 2 (alta qualidade)
- **Tipo de imagem:** JPEG com 98% de qualidade
- **Compressão:** Ativada
- **Fonte:** Arial, sans-serif
- **Tamanho da fonte:** 12pt
- **Espaçamento de linha:** 1.5

### **Otimizações Aplicadas:**

1. **Campos vazios:** Recebem linha inferior para preenchimento manual
2. **Inputs:** Convertidos para texto estático
3. **Checkboxes/Radios:** Mantidos visíveis com borda preta
4. **Tabelas:** Não quebram entre páginas
5. **Cabeçalhos:** Não quebram da seção seguinte
6. **Cards/Seções:** Evitam quebra interna

---

## 🐛 Troubleshooting

### **Problema: "Elemento do formulário não encontrado"**

**Solução:** Certifique-se de que o `formRef` está corretamente atribuído:

```tsx
const formRef = useRef<HTMLFormElement>(null)

return <form ref={formRef}>{/* conteúdo */}</form>
```

### **Problema: "Preencha pelo menos um campo"**

**Solução:** Verifique se `formData` está sendo atualizado corretamente:

```typescript
const handleChange = (e) => {
  const { name, value } = e.target
  setFormData((prev) => ({ ...prev, [name]: value }))
}
```

### **Problema: PDF com formatação quebrada**

**Solução:** Verifique se os estilos CSS estão inline ou em classes globais. Evite usar:

- Gradientes complexos
- Sombras muito elaboradas
- Animações CSS

### **Problema: Erro de SSR (Server-Side Rendering)**

**Solução:** A importação já é dinâmica, mas se persistir:

```typescript
if (typeof window === 'undefined') {
  toast.error('Esta funcionalidade só está disponível no navegador')
  return
}
```

---

## 📊 Exemplo Completo

```tsx
'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'

export default function DocumentPage() {
  const formRef = useRef<HTMLFormElement>(null)
  const [formData, setFormData] = useState({
    field1: '',
    field2: '',
    // ...
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleGeneratePDF = async () => {
    try {
      const hasData = Object.values(formData).some((value) => value !== '')
      if (!hasData) {
        toast.error('Preencha pelo menos um campo antes de gerar o PDF')
        return
      }

      toast.loading('Gerando PDF...', { id: 'pdf-generation' })

      const { generateFormPDF } = await import('@/lib/pdf-generator')
      await generateFormPDF(formRef, 'nome-documento', formData)

      toast.success('PDF gerado com sucesso!', { id: 'pdf-generation' })
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar PDF.', {
        id: 'pdf-generation',
      })
    }
  }

  return (
    <form ref={formRef}>
      {/* Campos do formulário */}

      <button onClick={handleGeneratePDF}>Gerar PDF</button>
    </form>
  )
}
```

---

## ✅ Checklist de Implementação

Para cada formulário:

- [ ] Importar `generateFormPDF`
- [ ] Criar função `handleGeneratePDF` assíncrona
- [ ] Adicionar validação de dados
- [ ] Adicionar feedback com toast (loading, success, error)
- [ ] Definir nome do arquivo apropriado
- [ ] Testar geração do PDF
- [ ] Verificar formatação do PDF gerado
- [ ] Confirmar que botões não aparecem no PDF
- [ ] Verificar quebras de página

---

## 📚 Referências

- **html2pdf.js:** https://github.com/eKoopmans/html2pdf.js
- **Padrões ABNT:** Margens de 15mm, fonte 12pt, espaçamento 1.5
- **Formato A4:** 210mm x 297mm

---

**Última atualização:** 2025-11-24  
**Status:** ✅ Implementado e testado no `monthly-report`
