# Guia de Acessibilidade do ChronosSystem

## 📋 Visão Geral

Este documento descreve as práticas de acessibilidade implementadas no ChronosSystem para garantir que a aplicação seja utilizável por todos os usuários, incluindo pessoas com deficiências.

## ✅ Padrões Implementados

### WCAG 2.1 Level AA
Seguimos as diretrizes WCAG 2.1 nível AA, incluindo:

- **Perceptível**: Informação e componentes da interface apresentados de forma perceptível
- **Operável**: Componentes de interface e navegação operáveis
- **Compreensível**: Informação e operação da interface compreensíveis
- **Robusto**: Conteúdo robusto o suficiente para ser interpretado por tecnologias assistivas

## 🎨 Componentes Acessíveis

### Button (`components/ui/accessible-button.tsx`)
- ✅ ARIA labels (`aria-busy`, `aria-disabled`)
- ✅ Estados visuais claros (hover, focus, disabled)
- ✅ Indicador de loading com spinner
- ✅ Suporte a ícones com `aria-hidden`
- ✅ Focus ring visível (2px offset)

### Input (`components/ui/accessible-input.tsx`)
- ✅ Labels associados com `htmlFor`
- ✅ Mensagens de erro com `role="alert"` e `aria-live="polite"`
- ✅ Helper text descritivo
- ✅ Indicador visual de campo obrigatório
- ✅ Estados de validação (`aria-invalid`, `aria-describedby`)

## ⌨️ Navegação por Teclado

### Atalhos Globais
- `Tab` / `Shift+Tab`: Navegar entre elementos focáveis
- `Enter` / `Space`: Ativar botões e links
- `Escape`: Fechar modais e diálogos
- `Ctrl+S`: Salvar (onde aplicável)

### Hooks Disponíveis

#### `useKeyboardNavigation`
```tsx
import { useKeyboardNavigation } from '@/hooks/use-accessibility'

useKeyboardNavigation([
  {
    key: 's',
    ctrlKey: true,
    callback: () => handleSave(),
    description: 'Salvar'
  }
])
```

#### `useFocusTrap`
```tsx
import { useFocusTrap } from '@/hooks/use-accessibility'

const modalRef = useRef<HTMLDivElement>(null)
useFocusTrap(modalRef, isOpen)
```

#### `useScreenReaderAnnouncement`
```tsx
import { useScreenReaderAnnouncement } from '@/hooks/use-accessibility'

const { announce } = useScreenReaderAnnouncement()
announce('Registro salvo com sucesso', 'polite')
```

## 🎯 ARIA Landmarks

Todos os layouts principais usam landmarks semânticos:

```html
<header role="banner">...</header>
<nav role="navigation" aria-label="Menu principal">...</nav>
<main role="main">...</main>
<aside role="complementary">...</aside>
<footer role="contentinfo">...</footer>
```

## 🔍 Leitores de Tela

### Anúncios Dinâmicos
Use `aria-live` para anunciar mudanças:

- `aria-live="polite"`: Aguarda pausa do usuário
- `aria-live="assertive"`: Interrompe imediatamente
- `aria-atomic="true"`: Lê todo o conteúdo

### Texto Oculto Visualmente
```tsx
<span className="sr-only">Texto apenas para leitores de tela</span>
```

CSS:
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

## 🎨 Contraste de Cores

### Requisitos WCAG AA
- **Texto normal**: Contraste mínimo de 4.5:1
- **Texto grande** (18pt+): Contraste mínimo de 3:1
- **Componentes de UI**: Contraste mínimo de 3:1

### Paleta de Cores Acessível
```css
/* Cores principais com contraste adequado */
--primary: #2563eb;      /* Azul - contraste 4.5:1 em branco */
--success: #16a34a;      /* Verde - contraste 4.5:1 em branco */
--warning: #ea580c;      /* Laranja - contraste 4.5:1 em branco */
--danger: #dc2626;       /* Vermelho - contraste 4.5:1 em branco */
--text-primary: #111827; /* Preto - contraste 15:1 em branco */
--text-secondary: #6b7280; /* Cinza - contraste 4.5:1 em branco */
```

## 🧪 Testes de Acessibilidade

### Ferramentas Instaladas
- **@axe-core/react**: Testes automatizados de a11y
- **eslint-plugin-jsx-a11y**: Linting de acessibilidade

### Executar Testes
```bash
# Lint de acessibilidade
npm run lint

# Testes com axe-core (em desenvolvimento)
# Automaticamente ativo em modo dev
```

### Checklist Manual
- [ ] Navegação completa apenas com teclado
- [ ] Todos os elementos interativos têm foco visível
- [ ] Imagens têm alt text descritivo
- [ ] Formulários têm labels associados
- [ ] Mensagens de erro são anunciadas
- [ ] Contraste de cores adequado
- [ ] Zoom até 200% funciona corretamente
- [ ] Leitores de tela conseguem navegar

## 📱 Responsividade e Touch

### Tamanhos Mínimos de Toque
- **Botões**: Mínimo 44x44px (WCAG 2.5.5)
- **Links**: Mínimo 44x44px
- **Inputs**: Altura mínima de 44px

### Gestos Alternativos
- Todos os gestos de toque têm alternativas de teclado
- Swipe gestures têm botões equivalentes

## 🌍 Internacionalização

### Suporte a Idiomas
- Português Brasileiro (pt-BR) - padrão
- Inglês Americano (en-US)

### Atributo lang
```html
<html lang="pt-BR">
```

## 📚 Recursos e Referências

### Documentação
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### Ferramentas de Teste
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [NVDA](https://www.nvaccess.org/) (leitor de tela)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) (leitor de tela)

## 🔄 Manutenção

### Ao Adicionar Novos Componentes
1. Adicionar ARIA labels apropriados
2. Garantir navegação por teclado
3. Testar com leitor de tela
4. Verificar contraste de cores
5. Executar testes automatizados

### Revisão Periódica
- Auditar acessibilidade a cada release
- Testar com usuários reais
- Atualizar documentação conforme necessário

---

**Última atualização**: 28/12/2024
