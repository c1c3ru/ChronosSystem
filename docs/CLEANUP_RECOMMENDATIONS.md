# Recomendações Adicionais de Limpeza

## Console.logs em Produção

Foram identificados vários `console.log` em arquivos de API que podem ser removidos ou substituídos por um sistema de logging adequado em produção:

### Arquivos com console.log:

- `/app/api/machines/generate-qr/route.ts`
- `/app/api/justifications/route.ts`
- `/app/api/auth/complete-profile/route.ts`
- `/app/api/kiosk/qr/route.ts`
- `/app/api/auth/2fa/setup/route.ts`
- `/app/api/auth/2fa/disable/route.ts`
- `/app/api/attendance/route.ts`
- `/app/api/attendance/[id]/route.ts`
- `/app/api/attendance/qr-scan/route.ts`
- `/app/api/employee/dashboard-enhanced/route.ts`
- `/app/api/employee/dashboard/route.ts`

### Recomendação:

1. **Manter logs de erro** - `console.error` são importantes para debugging
2. **Remover logs de debug** - `console.log` de desenvolvimento podem ser removidos
3. **Usar logger adequado** - Considerar usar a biblioteca `lib/logger.ts` que já existe no projeto
4. **Logs condicionais** - Usar `process.env.NODE_ENV !== 'production'` para logs apenas em desenvolvimento

## Avisos de React Hooks

### Problema:

Vários componentes têm avisos sobre dependências faltantes em arrays de `useEffect`.

### Arquivos Afetados:

- `/app/admin/machines/page.tsx`
- `/app/admin/machines/[id]/edit/page.tsx`
- `/app/admin/page.tsx`
- `/app/admin/reports/detailed/page.tsx`
- `/app/admin/reports/frequency/page.tsx`
- `/app/admin/reports/justifications/page.tsx`
- `/app/admin/reports/page.tsx`
- `/app/admin/users/[id]/edit/page.tsx`
- `/app/admin/users/[id]/page.tsx`
- `/app/admin/users/new/page.tsx`
- `/app/admin/users/page.tsx`
- `/app/auth/complete-profile/page.tsx`
- `/app/auth/reset-password/page.tsx`

### Recomendação:

1. **Revisar dependências** - Adicionar dependências faltantes ou usar `useCallback` para funções
2. **Evitar loops infinitos** - Garantir que adicionar dependências não cause re-renders infinitos
3. **Usar ESLint** - Seguir as sugestões do ESLint para melhorar a qualidade do código

## Variáveis Não Reatribuídas

### Arquivo:

- `/app/api/users/contract/route.ts` (linha 193)

### Recomendação:

Trocar `let validation` por `const validation` se a variável não for reatribuída.

## Próximos Passos

### Curto Prazo:

1. ✅ Arquivos desnecessários removidos
2. ✅ Imports não utilizados corrigidos
3. ⏳ Revisar e implementar TODOs identificados

### Médio Prazo:

1. Implementar sistema de logging adequado para produção
2. Corrigir avisos de React Hooks
3. Consolidar documentação em `/docs/`

### Longo Prazo:

1. Configurar CI/CD para detectar código não utilizado automaticamente
2. Implementar análise de código estático (SonarQube, CodeClimate)
3. Revisar e otimizar bundle size do Next.js
