# 📄 Template de Formulários Oficiais IFCE

Sistema de templates reutilizáveis para criar formulários oficiais do IFCE com layout padronizado e formato A4 profissional.

## 🎯 Objetivo

Garantir **consistência visual** em todos os documentos oficiais gerados pelo sistema, seguindo o padrão institucional do IFCE.

## ✨ Características

- ✅ **Formato A4** (210mm x 297mm) garantido
- ✅ **Cabeçalho oficial** padronizado com logos
- ✅ **Tipografia profissional** (Arial, 10pt)
- ✅ **Layout otimizado** para impressão
- ✅ **Componentes reutilizáveis** para tabelas, inputs e assinaturas
- ✅ **Geração de PDF** com alta qualidade

## 📦 Componentes Disponíveis

### 1. `OfficialFormTemplate`

Componente principal que fornece o layout base do formulário.

```tsx
import { OfficialFormTemplate } from '@/components/OfficialFormTemplate'

;<OfficialFormTemplate
  formId="meu-formulario"
  title="TÍTULO DO FORMULÁRIO"
  subtitle="Subtítulo opcional"
  campus="Maracanaú"
  sector="Setor Responsável"
>
  {/* Conteúdo do formulário */}
</OfficialFormTemplate>
```

**Props:**

- `formId` (string, obrigatório): ID para geração de PDF
- `title` (string, obrigatório): Título principal
- `subtitle` (string, opcional): Subtítulo
- `campus` (string, opcional): Campus do IFCE (padrão: "Maracanaú")
- `sector` (string, opcional): Setor responsável
- `showLogos` (boolean, opcional): Mostrar logos (padrão: true)

### 2. `FormTable`

Tabela padronizada com bordas pretas.

```tsx
import { FormTable } from '@/components/OfficialFormTemplate'

;<FormTable>
  <tbody>{/* Linhas da tabela */}</tbody>
</FormTable>
```

### 3. `FormHeaderCell`

Célula de cabeçalho (label) com fundo cinza.

```tsx
import { FormHeaderCell } from '@/components/OfficialFormTemplate'

;<FormHeaderCell colSpan={2}>NOME DO CAMPO</FormHeaderCell>
```

### 4. `FormDataCell`

Célula de dados (input).

```tsx
import { FormDataCell } from '@/components/OfficialFormTemplate'

;<FormDataCell>
  <FormInput name="campo" />
</FormDataCell>
```

### 5. `FormInput`

Input padronizado sem bordas.

```tsx
import { FormInput } from '@/components/OfficialFormTemplate'

;<FormInput
  type="text"
  name="nome"
  value={formData.nome}
  onChange={handleChange}
  placeholder="Digite aqui"
/>
```

### 6. `FormTextarea`

Textarea padronizado.

```tsx
import { FormTextarea } from '@/components/OfficialFormTemplate'

;<FormTextarea name="descricao" value={formData.descricao} onChange={handleChange} rows={4} />
```

### 7. `FormSelect`

Select padronizado.

```tsx
import { FormSelect } from '@/components/OfficialFormTemplate'

;<FormSelect name="tipo" value={formData.tipo} onChange={handleChange}>
  <option value="opcao1">Opção 1</option>
  <option value="opcao2">Opção 2</option>
</FormSelect>
```

### 8. `SignatureSection`

Seção de assinatura com linha.

```tsx
import { SignatureSection } from '@/components/OfficialFormTemplate'

;<SignatureSection
  label="ASSINATURA DO RESPONSÁVEL"
  date={true} // Adiciona campo de data
/>
```

## 📝 Exemplo Completo

```tsx
'use client'

import React, { useState } from 'react'
import { FormPDFExport } from '@/components/FormPDFExport'
import {
  OfficialFormTemplate,
  FormTable,
  FormHeaderCell,
  FormDataCell,
  FormInput,
  FormTextarea,
  SignatureSection,
} from '@/components/OfficialFormTemplate'

export function MeuFormulario() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    descricao: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="w-full max-w-[210mm] mx-auto p-4 bg-neutral-50">
      {/* Botão de Exportar PDF */}
      <div className="mb-6 flex justify-end no-print">
        <FormPDFExport formId="meu-formulario" fileName="meu-documento" />
      </div>

      {/* Formulário */}
      <OfficialFormTemplate
        formId="meu-formulario"
        title="MEU FORMULÁRIO OFICIAL"
        campus="Maracanaú"
      >
        {/* Dados Pessoais */}
        <FormTable>
          <tbody>
            <tr>
              <FormHeaderCell>NOME COMPLETO</FormHeaderCell>
            </tr>
            <tr>
              <FormDataCell>
                <FormInput type="text" name="nome" value={formData.nome} onChange={handleChange} />
              </FormDataCell>
            </tr>
            <tr>
              <FormHeaderCell>E-MAIL</FormHeaderCell>
            </tr>
            <tr>
              <FormDataCell>
                <FormInput
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </FormDataCell>
            </tr>
          </tbody>
        </FormTable>

        {/* Descrição */}
        <FormTable>
          <tbody>
            <tr>
              <FormHeaderCell>DESCRIÇÃO</FormHeaderCell>
            </tr>
            <tr>
              <FormDataCell>
                <FormTextarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  rows={4}
                />
              </FormDataCell>
            </tr>
          </tbody>
        </FormTable>

        {/* Assinatura */}
        <SignatureSection label="ASSINATURA DO RESPONSÁVEL" date={true} />
      </OfficialFormTemplate>
    </div>
  )
}
```

## 🎨 Padrões de Design

### Cores

- **Bordas**: Preto (#000000)
- **Fundo de cabeçalho**: Cinza claro (#f5f5f5)
- **Texto**: Preto (#000000)
- **Background**: Branco (#ffffff)

### Tipografia

- **Fonte**: Arial, sans-serif
- **Tamanho base**: 10pt
- **Cabeçalhos**: 12pt (título), 10pt (subtítulo)
- **Labels**: Bold

### Espaçamento

- **Padding interno**: 15mm
- **Margem entre tabelas**: 3mm (mb-3)
- **Padding células**: 1.5 (p-1.5)

## 📊 Formulários Implementados

1. ✅ **Solicitação de Cadastro de Estágio** (`InternshipRegistrationForm.tsx`)
2. ✅ **Declaração de Participação** (`ParticipationDeclarationForm.tsx`)
3. ⏳ **Declaração de Frequência** (a implementar)
4. ⏳ **Relatório de Atividades** (a implementar)

## 🔧 Como Criar um Novo Formulário

1. **Crie o componente** em `/components/SeuFormulario.tsx`
2. **Importe o template** e componentes auxiliares
3. **Defina o estado** do formulário
4. **Monte a estrutura** usando os componentes
5. **Adicione o botão** de exportar PDF

```tsx
// 1. Imports
import {
  OfficialFormTemplate,
  FormTable,
  FormHeaderCell,
  FormDataCell,
  FormInput
} from '@/components/OfficialFormTemplate'

// 2. Estado
const [formData, setFormData] = useState({ ... })

// 3. Estrutura
<OfficialFormTemplate formId="..." title="...">
  <FormTable>
    {/* Seus campos aqui */}
  </FormTable>
</OfficialFormTemplate>
```

## 🚀 Geração de PDF

O PDF é gerado automaticamente com:

- ✅ Formato A4 (210mm x 297mm)
- ✅ Alta qualidade (scale: 2, quality: 0.98)
- ✅ Compressão otimizada
- ✅ Margem zero (controle total no componente)

**Configurações em** `lib/pdf-generator.ts`:

```typescript
{
  margin: 0,
  html2canvas: {
    scale: 2,
    width: 794, // 210mm em pixels
    backgroundColor: '#ffffff'
  },
  jsPDF: {
    format: 'a4',
    orientation: 'portrait',
    compress: true
  }
}
```

## 📱 Responsividade

O formulário é otimizado para:

- ✅ **Desktop**: Visualização e edição
- ✅ **Impressão**: Formato A4 perfeito
- ✅ **PDF**: Layout preservado

## 🔒 Segurança

- ✅ CSP configurado para permitir blob: URLs (preview de PDF)
- ✅ Validação de dados no componente
- ✅ Sanitização de inputs

## 📚 Referências

- [html2pdf.js](https://github.com/eKoopmans/html2pdf.js)
- [Padrões IFCE](https://ifce.edu.br)
- [Formato A4](https://en.wikipedia.org/wiki/ISO_216)

## 🤝 Contribuindo

Para adicionar um novo formulário:

1. Crie o componente usando o template
2. Teste a geração de PDF
3. Verifique o layout no formato A4
4. Adicione à lista de formulários implementados
5. Faça commit e push

## 📄 Licença

Este template é parte do ChronosSystem e segue a mesma licença do projeto.
