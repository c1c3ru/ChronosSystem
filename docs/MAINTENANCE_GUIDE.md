# 🛠️ Guia de Manutenção - Mantendo o Projeto Limpo

## Verificações Regulares

### Semanalmente

#### 1. Verificar Imports Não Utilizados
```bash
# Executar ESLint para identificar imports não utilizados
npm run lint
```

#### 2. Verificar Arquivos de Teste
```bash
# Listar arquivos de teste que podem estar fora de lugar
find . -name "*test*" -not -path "./node_modules/*" -not -path "./__tests__/*" -not -path "./e2e/*" -not -path "./testsprite_tests/*"
```

#### 3. Verificar Arquivos Temporários
```bash
# Listar arquivos temporários ou de backup
find . -name "*.backup" -o -name "*.tmp" -o -name "*copy*" | grep -v node_modules
```

### Mensalmente

#### 1. Analisar Bundle Size
```bash
# Executar build e verificar tamanho dos bundles
npm run build
```

#### 2. Verificar Dependências Não Utilizadas
```bash
# Instalar depcheck (se não tiver)
npm install -g depcheck

# Executar análise
depcheck
```

#### 3. Limpar Cache
```bash
# Limpar cache do Next.js
rm -rf .next

# Limpar cache do npm
npm cache clean --force
```

## Boas Práticas

### Ao Criar Novos Arquivos

1. **Evitar arquivos de teste no código de produção**
   - Manter testes em `__tests__/`, `e2e/` ou `testsprite_tests/`
   - Não criar páginas de teste em `/app/`

2. **Nomear arquivos adequadamente**
   - Evitar nomes como `test-`, `example-`, `copy-`
   - Usar nomes descritivos e significativos

3. **Documentação**
   - Evitar duplicação de documentos
   - Consolidar informações similares
   - Manter documentação atualizada

### Ao Importar Bibliotecas

1. **Importar apenas o necessário**
   ```typescript
   // ❌ Evitar
   import * as Icons from 'lucide-react'
   
   // ✅ Preferir
   import { Clock, Users, Shield } from 'lucide-react'
   ```

2. **Remover imports não utilizados**
   - Configurar editor para remover automaticamente
   - Revisar antes de commit

### Ao Fazer Commit

1. **Verificar arquivos modificados**
   ```bash
   git status
   ```

2. **Executar lint antes de commit**
   ```bash
   npm run lint:fix
   ```

3. **Executar build para verificar erros**
   ```bash
   npm run build
   ```

## Configuração do Editor

### VS Code

Adicionar ao `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true,
    "source.fixAll.eslint": true
  },
  "typescript.preferences.autoImportFileExcludePatterns": [
    "**/node_modules/*",
    "**/.next/*"
  ]
}
```

## Scripts Úteis

### Adicionar ao package.json

```json
{
  "scripts": {
    "clean": "rm -rf .next node_modules/.cache",
    "clean:all": "rm -rf .next node_modules",
    "analyze": "ANALYZE=true npm run build",
    "check:unused": "depcheck",
    "check:types": "tsc --noEmit"
  }
}
```

## Checklist de Limpeza Mensal

- [ ] Executar `npm run lint:fix`
- [ ] Executar `npm run build` e verificar avisos
- [ ] Verificar arquivos de teste fora de lugar
- [ ] Verificar imports não utilizados
- [ ] Revisar e consolidar documentação
- [ ] Limpar arquivos temporários e backups
- [ ] Atualizar dependências (com cuidado)
- [ ] Verificar tamanho do bundle
- [ ] Remover console.logs desnecessários
- [ ] Revisar TODOs e implementar quando possível

## Ferramentas Recomendadas

1. **ESLint** - Já configurado no projeto
2. **Prettier** - Já configurado no projeto
3. **depcheck** - Para verificar dependências não utilizadas
4. **bundle-analyzer** - Para analisar tamanho do bundle
5. **lighthouse** - Para análise de performance

## Recursos Adicionais

- [Next.js Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [ESLint Rules](https://eslint.org/docs/latest/rules/)
- [TypeScript Compiler Options](https://www.typescriptlang.org/tsconfig)

---

**Última atualização**: 2025-11-21
