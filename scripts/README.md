# Scripts de Administração

Este diretório contém scripts utilitários para administração do sistema Chronos.

## create-admin.ts

Cria um usuário administrador interativamente (prompt de nome/email/senha/departamento).

```bash
npx tsx scripts/create-admin.ts
```

## authorize-google-user.ts

Pré-cadastra um usuário (qualquer role) para completar o perfil no primeiro login.

```bash
npx tsx scripts/authorize-google-user.ts
```

## seed-machines.js

Cria máquinas de kiosk de teste (idempotente — pula as que já existem).

```bash
node scripts/seed-machines.js
```

## debug-records.ts / check-oauth-config.js / test-email.ts

Diagnósticos somente-leitura: últimos registros de ponto por usuário, configuração
de OAuth do Google (`.env`) e um teste de envio de e-mail pelo `emailService` real
da aplicação (respeita as variáveis `SMTP_*` configuradas).

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
