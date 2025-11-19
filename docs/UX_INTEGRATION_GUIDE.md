# 🎨 Guia de Integração UX - ChronosSystem

Este guia mostra como usar as funcionalidades de UX prontas para integração no ChronosSystem.

## 📦 Funcionalidades Disponíveis

### 1. ✨ Skeletons (Loading States)

Componentes de loading prontos para usar em diferentes contextos.

#### Importação
```tsx
import { FormSkeleton, CardSkeleton, TableSkeleton, ListSkeleton } from '@/components/skeletons'
```

#### Uso

**FormSkeleton** - Para formulários
```tsx
<FormSkeleton 
  fields={5}                    // Número de campos (padrão: 4)
  showSubmitButton={true}       // Mostrar botão submit (padrão: true)
  className="custom-class"      // Classes adicionais
/>
```

**CardSkeleton** - Para cards
```tsx
<CardSkeleton 
  count={3}                     // Número de cards (padrão: 1)
  className="custom-class"
/>
```

**TableSkeleton** - Para tabelas
```tsx
<TableSkeleton 
  rows={5}                      // Número de linhas (padrão: 5)
  columns={4}                   // Número de colunas (padrão: 3)
  className="custom-class"
/>
```

**ListSkeleton** - Para listas
```tsx
<ListSkeleton 
  items={5}                     // Número de itens (padrão: 5)
  className="custom-class"
/>
```

#### Exemplo Prático
```tsx
'use client'

import { useState, useEffect } from 'react'
import { FormSkeleton } from '@/components/skeletons'

export default function MyPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    fetchData().then(data => {
      setData(data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <FormSkeleton fields={6} />
  }

  return <MyForm data={data} />
}
```

---

### 2. 📳 Haptic Feedback

Feedback tátil para dispositivos móveis.

#### Importação
```tsx
import { haptic } from '@/lib/haptic'
```

#### Métodos Disponíveis

```tsx
// Toque leve (botões normais)
haptic.tap()

// Impacto médio (botões importantes)
haptic.impact()

// Impacto pesado (ações críticas)
haptic.heavy()

// Feedback de sucesso (✓)
haptic.success()

// Feedback de erro (✗)
haptic.error()

// Feedback de aviso (⚠)
haptic.warning()

// Feedback de seleção (itens de lista)
haptic.selection()

// Cancelar feedback em andamento
haptic.cancel()
```

#### Exemplo Prático
```tsx
'use client'

import { haptic } from '@/lib/haptic'
import { Button } from '@/components/ui/Button'

export default function MyButton() {
  const handleClick = async () => {
    haptic.tap() // Feedback ao clicar
    
    try {
      await submitForm()
      haptic.success() // Feedback de sucesso
    } catch (error) {
      haptic.error() // Feedback de erro
    }
  }

  return (
    <Button onClick={handleClick}>
      Enviar
    </Button>
  )
}
```

#### Casos de Uso Recomendados

| Ação | Método | Quando usar |
|------|--------|-------------|
| Clique em botão | `haptic.tap()` | Botões normais, links |
| Botão importante | `haptic.impact()` | Botões primários, CTAs |
| Ação crítica | `haptic.heavy()` | Deletar, confirmar ações irreversíveis |
| Sucesso | `haptic.success()` | Formulário enviado, ação concluída |
| Erro | `haptic.error()` | Validação falhou, erro de API |
| Aviso | `haptic.warning()` | Alertas, confirmações |
| Seleção | `haptic.selection()` | Selecionar item de lista, checkbox |

---

### 3. 🎬 Page Transitions

Transições suaves entre páginas.

#### Importação
```tsx
import { PageTransition } from '@/components/PageTransition'
```

#### Uso

```tsx
<PageTransition 
  variant="fade"                // 'fade' | 'slide' | 'scale' (padrão: 'fade')
  duration={0.3}                // Duração em segundos (padrão: 0.3)
>
  {children}
</PageTransition>
```

#### Variantes Disponíveis

**fade** - Fade in/out suave
```tsx
<PageTransition variant="fade">
  <MyPageContent />
</PageTransition>
```

**slide** - Desliza da esquerda para direita
```tsx
<PageTransition variant="slide">
  <MyPageContent />
</PageTransition>
```

**scale** - Zoom in/out
```tsx
<PageTransition variant="scale">
  <MyPageContent />
</PageTransition>
```

#### Exemplo Prático - Layout
```tsx
// app/layout.tsx ou app/(dashboard)/layout.tsx
import { PageTransition } from '@/components/PageTransition'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <PageTransition variant="fade" duration={0.2}>
        {children}
      </PageTransition>
      <Footer />
    </div>
  )
}
```

#### Exemplo Prático - Página Individual
```tsx
// app/documents/extension-declaration/page.tsx
import { PageTransition } from '@/components/PageTransition'

export default function ExtensionDeclarationPage() {
  return (
    <PageTransition variant="slide">
      <div className="container mx-auto p-6">
        <h1>Declaração de Extensão</h1>
        {/* Conteúdo da página */}
      </div>
    </PageTransition>
  )
}
```

---

## 🎯 Exemplo Completo de Integração

Aqui está um exemplo completo combinando todas as funcionalidades:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { PageTransition } from '@/components/PageTransition'
import { FormSkeleton } from '@/components/skeletons'
import { haptic } from '@/lib/haptic'
import { Button } from '@/components/ui/Button'

export default function MyFormPage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState(null)

  useEffect(() => {
    // Carregar dados do formulário
    fetchFormData().then(data => {
      setFormData(data)
      setLoading(false)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    haptic.tap() // Feedback ao clicar
    
    setSubmitting(true)
    
    try {
      await submitForm(formData)
      haptic.success() // Feedback de sucesso
      // Redirecionar ou mostrar mensagem
    } catch (error) {
      haptic.error() // Feedback de erro
      // Mostrar mensagem de erro
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageTransition variant="fade">
      <div className="container mx-auto p-6">
        <h1>Meu Formulário</h1>
        
        {loading ? (
          <FormSkeleton fields={5} />
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Campos do formulário */}
            
            <Button 
              type="submit" 
              disabled={submitting}
              onClick={() => haptic.tap()}
            >
              {submitting ? 'Enviando...' : 'Enviar'}
            </Button>
          </form>
        )}
      </div>
    </PageTransition>
  )
}
```

---

## ✅ Checklist de Integração

Use este checklist ao adicionar UX em novas páginas:

- [ ] **Page Transition** adicionado no layout ou página
- [ ] **Skeleton** implementado para estados de loading
- [ ] **Haptic feedback** em botões principais
- [ ] **Haptic feedback** em ações de sucesso/erro
- [ ] **Haptic feedback** em seleções (se aplicável)
- [ ] Testado em dispositivo móvel (haptic)
- [ ] Testado com `prefers-reduced-motion` (acessibilidade)

---

## 🔧 Utilitários Avançados

### Hook useHaptic

Para casos mais complexos, use o hook:

```tsx
import { useHaptic } from '@/lib/hooks/useHaptic'

export default function MyComponent() {
  const { triggerHaptic, isSupported } = useHaptic()

  const handleAction = () => {
    if (isSupported) {
      triggerHaptic('medium')
    }
  }

  return <button onClick={handleAction}>Ação</button>
}
```

### Funções de Verificação

```tsx
import { isHapticSupported, prefersReducedMotion, shouldEnableHaptic } from '@/lib/haptic'

// Verificar se haptic é suportado
if (isHapticSupported()) {
  // Dispositivo suporta vibração
}

// Verificar preferência de movimento reduzido
if (prefersReducedMotion()) {
  // Usuário prefere movimento reduzido
}

// Verificar se deve habilitar haptic (combina ambos)
if (shouldEnableHaptic()) {
  // Pode usar haptic com segurança
}
```

---

## 📱 Compatibilidade

### Haptic Feedback
- ✅ Android (Chrome, Firefox)
- ✅ iOS (Safari, Chrome)
- ❌ Desktop (gracefully degraded)
- ✅ Respeita `prefers-reduced-motion`

### Page Transitions
- ✅ Todos os navegadores modernos
- ✅ Respeita `prefers-reduced-motion`
- ✅ SSR-safe

### Skeletons
- ✅ Todos os navegadores
- ✅ Acessível (ARIA labels)

---

## 🎨 Customização

### Customizar Skeletons

```tsx
<FormSkeleton 
  fields={5}
  className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4"
/>
```

### Customizar Transitions

```tsx
<PageTransition 
  variant="slide"
  duration={0.5}  // Transição mais lenta
>
  {children}
</PageTransition>
```

### Customizar Haptic Patterns

Edite `/lib/haptic.ts` para adicionar novos padrões:

```tsx
const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  // ... padrões existentes
  custom: [10, 20, 10, 20, 30], // Seu padrão customizado
}
```

---

## 🐛 Troubleshooting

### Haptic não funciona
1. Verifique se está em dispositivo móvel
2. Verifique se o navegador suporta Vibration API
3. Verifique se o usuário não tem `prefers-reduced-motion` ativado
4. Verifique permissões do navegador

### Transitions não aparecem
1. Verifique se `framer-motion` está instalado
2. Verifique se o componente é `'use client'`
3. Verifique se `prefers-reduced-motion` não está ativado

### Skeletons não aparecem
1. Verifique a importação
2. Verifique se o estado de loading está correto
3. Verifique o console para erros

---

## 📚 Recursos Adicionais

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Vibration API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Última atualização:** 2025-11-19
