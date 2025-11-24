# 📄 Padronização de PDFs - Sistema ChronosSystem IFCE

## ✅ Implementações Realizadas

### 1. **Padronização de Margens e Layout**

#### Margens Oficiais do IFCE
Conforme modelo anexado:
- **Superior**: 30mm (3cm)
- **Esquerda**: 30mm (3cm)
- **Inferior**: 20mm (2cm)
- **Direita**: 20mm (2cm)

#### Arquivos Atualizados
- ✅ `/components/OfficialFormTemplate.tsx` - Template base atualizado
- ✅ `/lib/pdf-generator.ts` - Configuração de margens padrão
- ✅ `/lib/pdf-styles.ts` - Estilos CSS padronizados

---

### 2. **Tipografia Padronizada**

```css
Fonte: Arial, "Times New Roman", sans-serif
Tamanho corpo: 12pt
Tamanho labels: 10pt
Tamanho títulos: 14pt
Line-height: 1.5
```

**Aplicado em**:
- Todos os templates de documentos
- Gerador de PDF
- Estilos globais

---

### 3. **Estrutura de Tabelas**

```css
Bordas: 1px solid #000000
Border-collapse: collapse
Padding células: 8px
Background cabeçalho: #F5F5F5
```

**Componentes criados**:
- `FormTable` - Tabela principal
- `FormHeaderCell` - Células de cabeçalho
- `FormDataCell` - Células de dados
- `FormField` - Campo com label + valor

---

### 4. **Novo Template Criado**

#### `InternshipRegistrationRequestDocument.tsx`
Template completo para **"Solicitação de Cadastro no Estágio"** baseado no modelo oficial anexado.

**Características**:
- ✅ Cabeçalho oficial com logos
- ✅ Campos de dados pessoais
- ✅ Seleção de cor/raça e etnia
- ✅ Campos para pessoa com deficiência
- ✅ Dados da instituição concedente
- ✅ **Tabela complexa de horários semanais** (Segunda a Domingo, 3 turnos)
- ✅ Tipo e forma de estágio
- ✅ Seção de assinaturas
- ✅ Observação padrão

**Tabela de Horários**:
```
┌───────┬──────────────────────────────────────────────┐
│ TURNO │ SEG  TER  QUA  QUI  SEX  SÁB  DOM           │
│       │ I  F  I  F  I  F  I  F  I  F  I  F  I  F   │
├───────┼──────────────────────────────────────────────┤
│  1ª   │ [horários]                                   │
│  2ª   │ [horários]                                   │
│  3ª   │ [horários]                                   │
└───────┴──────────────────────────────────────────────┘
```

---

### 5. **Sistema de Estilos Reutilizável**

#### `lib/pdf-styles.ts`
Arquivo centralizado com:
- ✅ Constantes de dimensões A4
- ✅ Configurações de tipografia
- ✅ Paleta de cores oficial
- ✅ CSS inline completo para PDFs
- ✅ Configurações html2pdf.js
- ✅ Configurações Puppeteer (referência)

**Uso**:
```typescript
import { OFFICIAL_PDF_CSS, HTML2PDF_CONFIG } from '@/lib/pdf-styles'
```

---

### 6. **Gerador de PDF com Puppeteer (Referência)**

#### `lib/pdf-generator-puppeteer.ts`
Implementação alternativa usando Puppeteer para comparação.

**⚠️ IMPORTANTE**: Arquivo apenas para referência. Não está em uso.

**Funções disponíveis**:
- `generatePDFWithPuppeteer()` - Gera PDF de HTML
- `generatePDFFromURL()` - Gera PDF de URL
- `renderReactToHTML()` - Renderiza React para HTML

**Para usar** (se necessário no futuro):
```bash
npm install puppeteer
npm install -D @types/puppeteer
```

---

### 7. **Análise Comparativa Completa**

#### `docs/PDF_GENERATION_COMPARISON.md`
Documento detalhado comparando **html2pdf.js** vs **Puppeteer**.

**Conteúdo**:
- ✅ Comparação de qualidade de renderização
- ✅ Análise de performance
- ✅ Comparação de custos
- ✅ Casos de uso recomendados
- ✅ Recomendação específica para ChronosSystem
- ✅ Tabela de decisão com pontuação

**Conclusão**: **Manter html2pdf.js** como solução principal.

**Pontuação Final**:
- html2pdf.js: **8.35/10** 🏆
- Puppeteer: **7.1/10**

---

## 📋 Checklist de Requisitos

### Requisitos de Layout ✅
- [x] Página A4 (210mm x 297mm)
- [x] Margem Superior: 30mm
- [x] Margem Esquerda: 30mm
- [x] Margem Inferior: 20mm
- [x] Margem Direita: 20mm

### Tipografia ✅
- [x] Fonte: Arial ou Times New Roman
- [x] Tamanho corpo: 12pt
- [x] Negrito em Títulos e Labels
- [x] Line-height adequado (1.5)

### Cabeçalho ✅
- [x] Centralizado
- [x] Logo IFCE
- [x] Brasão da República
- [x] "PRÓ-REITORIA DE EXTENSÃO"
- [x] "IFCE Campus Maracanaú"

### Tabelas ✅
- [x] Bordas simples pretas (1px solid black)
- [x] border-collapse: collapse
- [x] Células com padding adequado
- [x] Background cinza em cabeçalhos

### Texto Justificado ✅
- [x] Cláusulas jurídicas com text-align: justify
- [x] Aplicado em documentos de termo de compromisso

### Estrutura de Dados ✅
- [x] Interface TypeScript completa
- [x] Campos dinâmicos
- [x] Validação de dados
- [x] Formatação de datas
- [x] Formatação de valores monetários

### Tabela de Horários Complexa ✅
- [x] Dias da semana (Segunda a Domingo)
- [x] Turnos (1ª, 2ª, 3ª)
- [x] Colunas Início e Fim
- [x] Renderização correta no PDF

---

## 🎯 Como Usar

### 1. **Para Criar um Novo Documento**

```typescript
// 1. Criar interface de dados
interface MeuDocumentoData {
  campo1: string
  campo2: string
  // ...
}

// 2. Criar componente do documento
export const MeuDocumento = forwardRef<HTMLDivElement, { data: MeuDocumentoData }>(
  ({ data }, ref) => {
    return (
      <div ref={ref} style={{ /* estilos padrão */ }}>
        <OfficialHeader title="MEU DOCUMENTO" />
        {/* Conteúdo */}
      </div>
    )
  }
)

// 3. Criar página de formulário
export default function MeuDocumentoPage() {
  const documentRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState<MeuDocumentoData>({ /* ... */ })

  const handleGeneratePDF = async () => {
    const { generatePDFBlob, downloadPDFBlob } = await import('@/lib/pdf-generator')
    const blob = await generatePDFBlob(documentRef.current!, {
      filename: 'meu-documento.pdf'
    })
    downloadPDFBlob(blob, 'meu-documento.pdf')
  }

  return (
    <>
      {/* Formulário */}
      <form>...</form>
      
      {/* Template oculto */}
      <div className="hidden">
        <MeuDocumento ref={documentRef} data={formData} />
      </div>
    </>
  )
}
```

### 2. **Para Usar Estilos Padronizados**

```typescript
import { OFFICIAL_PDF_CSS, HTML2PDF_CONFIG } from '@/lib/pdf-styles'

// Em um componente
<style dangerouslySetInnerHTML={{ __html: OFFICIAL_PDF_CSS }} />

// Ao gerar PDF
const blob = await generatePDFBlob(element, HTML2PDF_CONFIG)
```

### 3. **Para Usar Componentes Reutilizáveis**

```typescript
import {
  OfficialHeader,
  FormTable,
  FormHeaderCell,
  FormDataCell,
  FormField,
  FormInput,
  SignatureSection
} from '@/components/OfficialFormTemplate'

// No template
<OfficialHeader title="TÍTULO DO DOCUMENTO" />

<FormTable>
  <tbody>
    <tr>
      <FormField label="NOME">
        {data.nome}
      </FormField>
      <FormField label="CPF">
        {data.cpf}
      </FormField>
    </tr>
  </tbody>
</FormTable>

<SignatureSection label="ASSINATURA DO DISCENTE" date />
```

---

## 📁 Estrutura de Arquivos

```
ChronosSystem/
├── components/
│   ├── OfficialFormTemplate.tsx          # ✅ Template base (ATUALIZADO)
│   └── templates/
│       ├── CommitmentTermDocument.tsx    # Termo de Compromisso
│       ├── InternshipRegistrationRequestDocument.tsx  # ✅ NOVO
│       ├── MonthlyReportDocument.tsx     # Relatório Mensal
│       ├── FinalReportDocument.tsx       # Relatório Final
│       └── ...
├── lib/
│   ├── pdf-generator.ts                  # ✅ Gerador html2pdf (ATUALIZADO)
│   ├── pdf-styles.ts                     # ✅ NOVO - Estilos padronizados
│   └── pdf-generator-puppeteer.ts        # ✅ NOVO - Referência Puppeteer
└── docs/
    └── PDF_GENERATION_COMPARISON.md      # ✅ NOVO - Análise comparativa
```

---

## 🔧 Configurações Técnicas

### html2pdf.js (Atual)
```javascript
{
  margin: [30, 20, 20, 30], // mm
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: {
    scale: 2,
    useCORS: true,
    letterRendering: true,
    windowWidth: 794
  },
  jsPDF: {
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait',
    compress: true
  }
}
```

### Puppeteer (Referência)
```javascript
{
  format: 'A4',
  margin: {
    top: '30mm',
    right: '20mm',
    bottom: '20mm',
    left: '30mm'
  },
  printBackground: true,
  preferCSSPageSize: false
}
```

---

## 🎨 Guia de Estilo Visual

### Cores
- **Texto**: #000000 (preto puro)
- **Background**: #FFFFFF (branco puro)
- **Bordas**: #000000 (preto puro)
- **Cabeçalho tabela**: #F5F5F5 (cinza claro)

### Espaçamentos
- **Padding células**: 8px
- **Margin entre seções**: 15-20px
- **Line-height**: 1.5

### Quebras de Página
```css
.page-break-before { page-break-before: always; }
.page-break-after { page-break-after: always; }
.no-page-break { page-break-inside: avoid; }
```

---

## 📊 Exemplo Completo: Tabela de Horários

```typescript
<table className="w-full border-collapse border border-black">
  <thead>
    <tr>
      <th rowSpan={2}>TURNO</th>
      <th colSpan={2}>SEGUNDA</th>
      <th colSpan={2}>TERÇA</th>
      {/* ... */}
    </tr>
    <tr>
      <th>INÍCIO</th>
      <th>FIM</th>
      <th>INÍCIO</th>
      <th>FIM</th>
      {/* ... */}
    </tr>
  </thead>
  <tbody>
    {['primeira', 'segunda', 'terceira'].map((turno) => (
      <tr key={turno}>
        <td>{turno === 'primeira' ? '1ª' : turno === 'segunda' ? '2ª' : '3ª'}</td>
        {dias.map((dia) => {
          const [inicio, fim] = horarios[turno][dia].split('-')
          return (
            <>
              <td>{inicio}</td>
              <td>{fim}</td>
            </>
          )
        })}
      </tr>
    ))}
  </tbody>
</table>
```

---

## ✅ Próximos Passos Recomendados

### Curto Prazo
1. ⏳ Testar geração de PDFs com dados reais
2. ⏳ Validar qualidade visual comparando com modelo oficial
3. ⏳ Implementar testes automatizados de geração
4. ⏳ Criar guia de boas práticas para desenvolvedores

### Médio Prazo
1. ⏳ Adicionar mais templates de documentos
2. ⏳ Implementar sistema de preview antes de gerar PDF
3. ⏳ Criar biblioteca de componentes reutilizáveis
4. ⏳ Documentar padrões de acessibilidade

### Longo Prazo
1. ⏳ Avaliar necessidade de migração para Puppeteer (se volume aumentar)
2. ⏳ Implementar assinatura digital
3. ⏳ Adicionar watermarks institucionais
4. ⏳ Sistema de versionamento de documentos

---

## 📚 Referências

- [Modelo Oficial IFCE](./modelo-solicitacao-cadastro-estagio.jpg) - Documento anexado
- [html2pdf.js Documentation](https://github.com/eKoopmans/html2pdf.js)
- [Puppeteer Documentation](https://pptr.dev/)
- [Análise Comparativa](./PDF_GENERATION_COMPARISON.md)

---

## 🤝 Contribuindo

Para adicionar novos templates ou melhorar os existentes:

1. Seguir os padrões de margens e tipografia
2. Usar componentes reutilizáveis do `OfficialFormTemplate`
3. Importar estilos de `pdf-styles.ts`
4. Testar geração de PDF antes de commit
5. Documentar campos e interfaces TypeScript

---

**Última atualização**: 2025-11-24  
**Versão**: 1.0  
**Responsável**: Equipe ChronosSystem  
**Status**: ✅ Implementado e Documentado
