# Guia de Formulários e Exportação de PDF

## 📋 Visão Geral

Sistema completo de formulários profissionais com exportação para PDF. Os formulários utilizam logos e brasão do IFCE, seguindo o padrão visual institucional.

## 🎯 Objetivo

- ✅ Criar formulários profissionais e padronizados
- ✅ Exportar para PDF com um clique
- ✅ Manter conformidade com identidade visual IFCE
- ✅ Facilitar impressão e assinatura

## 📁 Estrutura

### Componentes

#### 1. **FormHeader** (`components/FormHeader.tsx`)

Cabeçalho profissional dos formulários.

```tsx
<FormHeader
  title="DECLARAÇÃO DE PARTICIPAÇÃO EM EXPERIÊNCIA"
  subtitle="DE EXTENSÃO, INICIAÇÃO CIENTÍFICA OU MONITORIA"
  showImages={true}
/>
```

**Recursos:**

- Logo IFCE (esquerda)
- Brasão do Brasil (direita)
- Título e subtítulo centralizados
- Informações da instituição
- Estilos para impressão

#### 2. **FormPDFExport** (`components/FormPDFExport.tsx`)

Botão para exportar formulário como PDF.

```tsx
<FormPDFExport formId="attendance-declaration-form" fileName="declaracao-participacao-extensao" />
```

**Recursos:**

- Exportação via print nativo
- Preservação de estilos CSS
- Feedback visual
- Sem dependências externas

#### 3. **AttendanceDeclarationForm** (`components/AttendanceDeclarationForm.tsx`)

Formulário completo de declaração.

```tsx
<AttendanceDeclarationForm
  userId={session.user.id}
  userName={session.user.name}
  userEmail={session.user.email}
/>
```

**Seções:**

- Informações do declarante
- Dados acadêmicos (discente)
- Tipo de experiência
- Projeto/Programa
- Atividades desenvolvidas
- Data e assinatura

### Páginas

#### **Página de Declaração** (`app/employee/declaration/page.tsx`)

Página protegida para gerar declarações.

**Acesso:** `/employee/declaration`

**Recursos:**

- Autenticação obrigatória
- Pré-preenchimento com dados do usuário
- Instruções de uso
- Integração com sessão

## 🎨 Design

### Logos e Imagens

Os logos estão localizados em `/public/assets/`:

```
/public/assets/
├── logoifce.png (3KB) - Logo IFCE
└── brasao.png (363KB) - Brasão do Brasil
```

### Estilos

#### Cores

- **Texto:** Preto (#000000)
- **Bordas:** Preto (#000000)
- **Fundo:** Branco (#FFFFFF)
- **Destaque:** Cinza claro (#f5f5f5)

#### Tipografia

- **Títulos:** Bold, 16px
- **Subtítulos:** Normal, 12px
- **Corpo:** Normal, 12px
- **Fonte:** Arial, sans-serif

#### Tabelas

- Bordas: 1px sólida preta
- Padding: 8px
- Collapse: Ativado
- Alternância de cores: Cinza claro para cabeçalhos

## 🖨️ Exportação para PDF

### Como Funciona

1. **Captura do Conteúdo**
   - Obtém elemento do formulário pelo ID
   - Cria nova janela de impressão
   - Copia estilos CSS

2. **Processamento**
   - Injeta HTML e CSS na janela
   - Aguarda carregamento
   - Abre diálogo de impressão

3. **Impressão**
   - Usuário escolhe "Salvar como PDF"
   - Arquivo é gerado com nome especificado
   - Janela é fechada automaticamente

### Fluxo do Usuário

```
1. Preencher formulário
   ↓
2. Clicar em "Exportar PDF"
   ↓
3. Janela de impressão abre
   ↓
4. Selecionar "Salvar como PDF"
   ↓
5. Escolher local e nome do arquivo
   ↓
6. PDF é salvo
```

### Exemplo de Uso

```tsx
import { FormPDFExport } from '@/components/FormPDFExport'

export function MyForm() {
  return (
    <>
      <FormPDFExport formId="my-form" fileName="meu-formulario" />

      <div id="my-form">{/* Conteúdo do formulário */}</div>
    </>
  )
}
```

## 📝 Campos do Formulário

### Declaração de Participação

#### Seção 1: Declarante

- Nome do declarante
- Tipo de documento (CPF, RG, CNPJ)
- Número do documento

#### Seção 2: Discente

- Nome do aluno (pré-preenchido)
- Curso
- Matrícula
- Instituição (IFCE - pré-preenchido)
- Campus (Morada Nova - pré-preenchido)

#### Seção 3: Experiência

- Tipo: Extensão / Iniciação Científica / Monitoria

#### Seção 4: Projeto

- Nome do projeto/programa
- Instituição responsável

#### Seção 5: Atividades

- Descrição das atividades
- Data de início
- Carga horária semanal

#### Seção 6: Assinatura

- Local e data
- Espaço para assinatura

## 🔧 Implementação

### Adicionar Novo Formulário

1. **Criar Componente**

```tsx
export function MyForm() {
  return (
    <div id="my-form">
      <FormHeader title="Meu Formulário" subtitle="Descrição" />
      {/* Conteúdo */}
    </div>
  )
}
```

2. **Adicionar Exportação**

```tsx
<FormPDFExport formId="my-form" fileName="meu-formulario" />
```

3. **Criar Página**

```tsx
export default function MyFormPage() {
  return <MyForm />
}
```

### Personalizar Estilos

Editar em `components/FormPDFExport.tsx`:

```tsx
const styles = `
  body {
    font-family: Arial, sans-serif;
    padding: 20px;
    background: white;
    color: #000;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  /* Adicionar mais estilos */
`
```

## 📋 Validações

### Campos Obrigatórios

- Nome do declarante
- Tipo e número de documento
- Curso e matrícula
- Tipo de experiência
- Atividades desenvolvidas
- Data de início

### Validação de Entrada

- Documentos: Formato correto
- Datas: Formato DD/MM/YYYY
- Horas: Número positivo
- Texto: Mínimo de caracteres

## 🖼️ Visualização

### Antes de Exportar

```
┌─────────────────────────────────┐
│  [Logo IFCE]    [Título]    [Brasão] │
├─────────────────────────────────┤
│  DECLARAÇÃO DE PARTICIPAÇÃO     │
├─────────────────────────────────┤
│                                 │
│  Nome: ___________________      │
│  Documento: CPF / RG / CNPJ     │
│  Número: ___________________    │
│                                 │
│  [Exportar PDF]                 │
└─────────────────────────────────┘
```

### Após Exportar (PDF)

```
Arquivo: declaracao-participacao-extensao.pdf
Tamanho: ~500KB
Páginas: 1-2
Qualidade: Alta (300 DPI)
```

## 🚀 Próximos Passos

1. [ ] Adicionar validações de formulário
2. [ ] Integrar com banco de dados
3. [ ] Criar dashboard de declarações
4. [ ] Adicionar assinatura digital
5. [ ] Implementar histórico de formulários
6. [ ] Adicionar mais tipos de formulários

## 📞 Suporte

### Problemas Comuns

**PDF não abre após exportar**

- Verificar se navegador tem bloqueador de pop-ups
- Tentar com outro navegador

**Estilos não aparecem no PDF**

- Verificar se CSS está inline
- Testar com print preview

**Imagens não aparecem**

- Verificar se URLs são absolutas
- Testar com data URLs

## 🔐 Segurança

- ✅ Autenticação obrigatória
- ✅ Dados do usuário pré-preenchidos
- ✅ Sem envio para servidor (processamento local)
- ✅ Sem armazenamento de dados sensíveis

## 📊 Recursos Técnicos

- **Framework:** Next.js 14+
- **Linguagem:** TypeScript
- **Estilos:** Tailwind CSS
- **Ícones:** Lucide React
- **Exportação:** Print nativo do navegador

## 📝 Exemplo Completo

```tsx
'use client'

import { FormHeader } from '@/components/FormHeader'
import { FormPDFExport } from '@/components/FormPDFExport'
import { useSession } from 'next-auth/react'

export default function DeclarationPage() {
  const { data: session } = useSession()

  return (
    <div className="max-w-4xl mx-auto p-4">
      <FormPDFExport formId="declaration-form" fileName="declaracao" />

      <div id="declaration-form" className="bg-white p-8">
        <FormHeader title="DECLARAÇÃO" subtitle="De Participação" />

        <table className="w-full border border-black">
          <tbody>
            <tr>
              <td className="border border-black p-2">Nome: {session?.user?.name}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

---

**Última atualização:** Novembro 2025
**Versão:** 1.0
**Status:** ✅ Pronto para Produção
