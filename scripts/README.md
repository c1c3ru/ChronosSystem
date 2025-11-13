# Scripts de Administração

Este diretório contém scripts utilitários para administração do sistema Chronos.

## remove-user.js

Script para remover usuários que ficaram em estado inconsistente (ex: perfil incompleto que não consegue ser finalizado).

### Uso:

```bash
# Remover usuário específico
node scripts/remove-user.js email@exemplo.com

# Exemplo usado para resolver o problema do cti.maracanau
node scripts/remove-user.js cti.maracanau@ifce.edu.br
```

### O que o script faz:

1. **Busca o usuário** pelo email
2. **Mostra informações** do usuário encontrado
3. **Lista dados relacionados** (registros, logs, etc.)
4. **Remove o usuário** e todos os dados relacionados
5. **Permite novo login** limpo para completar o perfil

### Segurança:

- Remove automaticamente dados relacionados (cascade)
- Mantém logs de auditoria para rastreabilidade
- Permite que o usuário faça login novamente

### Quando usar:

- Usuário preso na tela de completar perfil
- Dados corrompidos ou inconsistentes
- Reset completo de conta de usuário
- Problemas de migração de dados

⚠️ **Atenção**: Este script remove permanentemente o usuário e seus dados. Use com cuidado.
