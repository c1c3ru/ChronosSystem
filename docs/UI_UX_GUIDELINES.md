# UI/UX Guidelines - Chronos System

## 🎨 Design System

### Cores Semânticas

| Uso | Cor | Hex | Uso |
|-----|-----|-----|-----|
| Primary | Verde | #22c55e | Ações principais, sucesso |
| Secondary | Azul | #3b82f6 | Informações, links |
| Warning | Âmbar | #f59e0b | Avisos, atenção |
| Error | Vermelho | #ef4444 | Erros, deletar |
| Success | Verde | #22c55e | Confirmação |
| Info | Azul | #3b82f6 | Informações |
| Neutral | Cinza | #64748b | Texto secundário |

### Componentes Padrão

#### Button
```tsx
// Variantes
<Button variant="primary">Ação Principal</Button>
<Button variant="secondary">Ação Secundária</Button>
<Button variant="ghost">Ação Terciária</Button>
<Button variant="destructive">Deletar</Button>

// Tamanhos
<Button size="sm">Pequeno</Button>
<Button size="md">Médio</Button>
<Button size="lg">Grande</Button>
```

#### Card
```tsx
// Variantes
<Card variant="default">Padrão</Card>
<Card variant="glass">Glass Morphism</Card>
<Card variant="elevated">Elevado</Card>
```

#### Badge
```tsx
// Variantes
<Badge variant="primary">Primary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
```

#### FilterSelect
```tsx
<FilterSelect
  value={filterType}
  onChange={(e) => setFilterType(e.target.value)}
  options={[
    { value: 'ALL', label: 'Todas' },
    { value: 'ENTRY', label: '→ Entradas' },
    { value: 'EXIT', label: '← Saídas' }
  ]}
/>
```

---

## 🎯 Padrões de Layout

### Spacing
```
Container padding: p-6
Card padding: p-6
Item spacing: space-y-4
Horizontal spacing: space-x-4
```

### Typography
```
Page Title: text-4xl font-semibold text-white
Section Title: text-2xl font-semibold text-white
Card Title: text-lg font-semibold text-white
Label: text-sm font-medium text-white
Body: text-sm text-neutral-300
Helper: text-xs text-neutral-400
```

### Borders & Shadows
```
Cards: border border-border rounded-xl shadow-lg
Buttons: rounded-lg shadow-md
Inputs: rounded-lg border border-input
Hover: hover:shadow-lg transition-shadow
```

---

## 🎭 Ícones

### Padrão
- **Biblioteca**: lucide-react
- **Tamanho padrão**: h-4 w-4 ou h-5 w-5
- **Cores**: text-primary, text-warning, text-neutral-400

### Ícones Semânticos
| Ação | Ícone | Cor |
|------|-------|-----|
| Entrada | LogIn | primary |
| Saída | LogOut | warning |
| Deletar | Trash2 | error |
| Filtro | Filter | primary |
| Relógio | Clock | neutral-400 |
| Configurações | Settings | neutral-400 |

---

## 📱 Responsividade

### Breakpoints
```
sm: 640px   - Mobile
md: 768px   - Tablet
lg: 1024px  - Desktop
xl: 1280px  - Large Desktop
2xl: 1536px - Extra Large
```

### Mobile First
```tsx
// Padrão: mobile
<div className="text-sm">
  // Tablet+
  md:text-base
  // Desktop+
  lg:text-lg
</div>
```

---

## 🔄 Estados

### Loading
```tsx
<Loading size="lg" text="Carregando..." />
```

### Disabled
```tsx
<Button disabled>Desabilitado</Button>
```

### Error
```tsx
<Input error helperText="Campo obrigatório" />
```

### Success
```tsx
<Badge variant="success">Sucesso</Badge>
```

---

## 🎬 Animações

### Transições Padrão
```
Duração: 300ms
Easing: ease-out
Propriedades: colors, opacity, transform
```

### Exemplos
```tsx
// Hover
className="hover:bg-neutral-800/50 transition-colors"

// Focus
className="focus:ring-2 focus:ring-primary"

// Loading
className="animate-spin"
```

---

## ♿ Acessibilidade

### Contraste
- Texto branco sobre fundo escuro (WCAG AA)
- Ícones com tamanho mínimo de 24x24px
- Labels associados a inputs

### Keyboard Navigation
- Tab order lógico
- Focus visível em todos os elementos interativos
- Enter/Space para ativar botões

### ARIA
```tsx
<button aria-label="Deletar registro">
  <Trash2 className="h-4 w-4" />
</button>
```

---

## 📋 Checklist de Implementação

- [ ] Usar componentes reutilizáveis (Button, Card, Badge, FilterSelect)
- [ ] Seguir padrão de cores semânticas
- [ ] Manter espaçamento consistente
- [ ] Usar ícones do lucide-react
- [ ] Implementar estados (loading, error, success)
- [ ] Testar responsividade em todos os breakpoints
- [ ] Validar acessibilidade
- [ ] Adicionar transições suaves

---

## 🚀 Implementação

### Novo Componente
1. Criar em `components/ui/[Name].tsx`
2. Exportar em `components/ui/index.ts`
3. Documentar em `UI_UX_GUIDELINES.md`
4. Testar em múltiplos breakpoints

### Refatoração
1. Remover estilos inline
2. Usar componentes reutilizáveis
3. Aplicar design tokens
4. Testar visualmente
