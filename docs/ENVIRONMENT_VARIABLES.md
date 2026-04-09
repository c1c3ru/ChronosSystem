# Variáveis de Ambiente - ChronosSystem

## Visão Geral

Este documento lista todas as variáveis de ambiente necessárias para executar o ChronosSystem. As variáveis são validadas automaticamente pelo sistema usando Zod (`lib/env.ts`).

## Variáveis Obrigatórias

### 🗄️ Banco de Dados

#### `DATABASE_URL`

- **Descrição**: URL de conexão com o PostgreSQL
- **Formato**: `postgresql://user:password@host:port/database`
- **Exemplo**: `postgresql://postgres:senha123@localhost:5432/chronos`
- **Validação**: Deve ser uma URL válida

---

### 🔐 Autenticação (NextAuth.js)

#### `NEXTAUTH_SECRET`

- **Descrição**: Secret para criptografia de tokens JWT
- **Formato**: String aleatória de no mínimo 32 caracteres
- **Geração**: `openssl rand -base64 32`
- **Exemplo**: `kJ8n2mP9qR4sT6vW8xY0zA1bC3dE5fG7hI9jK0lM2nO4pQ6rS8tU0vW2xY4zA6b=`
- **Validação**: Mínimo 32 caracteres
- **⚠️ IMPORTANTE**: Nunca compartilhe este secret!

#### `NEXTAUTH_URL`

- **Descrição**: URL base da aplicação
- **Formato**: URL completa incluindo protocolo
- **Exemplo Desenvolvimento**: `http://localhost:5000`
- **Exemplo Produção**: `https://chronos.suaempresa.com`
- **Validação**: Deve ser uma URL válida

---

### 🔑 OAuth - Google

#### `GOOGLE_CLIENT_ID`

- **Descrição**: Client ID do Google OAuth
- **Onde obter**: [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- **Exemplo**: `123456789-abc123def456.apps.googleusercontent.com`
- **Validação**: Não pode ser vazio

#### `GOOGLE_CLIENT_SECRET`

- **Descrição**: Client Secret do Google OAuth
- **Onde obter**: Google Cloud Console (mesmo local do Client ID)
- **Exemplo**: `GOCSPX-abc123def456ghi789jkl012`
- **Validação**: Não pode ser vazio
- **⚠️ IMPORTANTE**: Mantenha este secret seguro!

**Como configurar Google OAuth**:

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione existente
3. Ative a API "Google+ API"
4. Vá em "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure as URLs autorizadas:
   - **Authorized JavaScript origins**: `http://localhost:5000` (dev) ou sua URL de produção
   - **Authorized redirect URIs**: `http://localhost:5000/api/auth/callback/google`

---

### 🔒 Segurança - QR Codes

#### `QR_SECRET`

- **Descrição**: Secret para assinatura HMAC-SHA256 dos QR codes
- **Formato**: String aleatória de no mínimo 32 caracteres
- **Geração**: `openssl rand -base64 32`
- **Exemplo**: `aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3aB4cD5eF6gH7iJ8kL9mN0oP1q=`
- **Validação**: Mínimo 32 caracteres
- **⚠️ CRÍTICO**: Este secret protege contra falsificação de QR codes!

---

### 📧 Email - SMTP

#### `SMTP_HOST`

- **Descrição**: Servidor SMTP para envio de emails
- **Exemplos**:
  - Gmail: `smtp.gmail.com`
  - Outlook: `smtp-mail.outlook.com`
  - SendGrid: `smtp.sendgrid.net`
  - Mailgun: `smtp.mailgun.org`
- **Validação**: Não pode ser vazio

#### `SMTP_PORT`

- **Descrição**: Porta do servidor SMTP
- **Valores comuns**:
  - `587` - TLS/STARTTLS (recomendado)
  - `465` - SSL
  - `25` - Sem criptografia (não recomendado)
- **Validação**: Número entre 1 e 65535

#### `SMTP_USER`

- **Descrição**: Usuário para autenticação SMTP
- **Formato**: Geralmente o email completo
- **Exemplo**: `noreply@chronos.com`
- **Validação**: Não pode ser vazio

#### `SMTP_PASSWORD`

- **Descrição**: Senha para autenticação SMTP
- **Nota Gmail**: Use "App Password" em vez da senha normal
- **Validação**: Não pode ser vazio
- **⚠️ IMPORTANTE**: Mantenha seguro!

#### `SMTP_FROM`

- **Descrição**: Email remetente dos emails enviados
- **Formato**: Email válido
- **Exemplo**: `ChronosSystem <noreply@chronos.com>`
- **Validação**: Deve ser um email válido

**Configuração Gmail**:

1. Ative a verificação em duas etapas
2. Gere uma "App Password" em [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Use a senha gerada em `SMTP_PASSWORD`

---

### ⚙️ Aplicação

#### `NODE_ENV`

- **Descrição**: Ambiente de execução
- **Valores permitidos**: `development`, `production`, `test`
- **Padrão**: `development`
- **Validação**: Deve ser um dos valores permitidos

---

## Variáveis Opcionais

### 🔴 Redis (Cache e Rate Limiting)

#### `REDIS_URL`

- **Descrição**: URL de conexão com Redis
- **Formato**: `redis://user:password@host:port`
- **Exemplo**: `redis://localhost:6379`
- **Quando usar**: Recomendado para produção (cache e rate limiting)
- **Validação**: Se fornecido, deve ser uma URL válida

**Se não configurado**: Sistema usa cache em memória (menos eficiente)

---

### 📊 Sentry (Error Tracking)

#### `NEXT_PUBLIC_SENTRY_DSN`

- **Descrição**: DSN do Sentry para rastreamento de erros
- **Onde obter**: [sentry.io](https://sentry.io)
- **Formato**: URL do Sentry
- **Exemplo**: `https://abc123@o123456.ingest.sentry.io/7654321`
- **Validação**: Se fornecido, deve ser uma URL válida

---

### 📈 Google Analytics

#### `NEXT_PUBLIC_GA_ID`

- **Descrição**: ID do Google Analytics
- **Formato**: `G-XXXXXXXXXX` (GA4) ou `UA-XXXXXXXXX-X` (Universal)
- **Exemplo**: `G-ABC123DEF4`
- **Onde obter**: [analytics.google.com](https://analytics.google.com)

---

### 🎛️ Feature Flags

#### `ENABLE_2FA`

- **Descrição**: Habilita autenticação de dois fatores
- **Valores**: `true` ou `false`
- **Padrão**: `true`

#### `ENABLE_PWA`

- **Descrição**: Habilita funcionalidades de PWA
- **Valores**: `true` ou `false`
- **Padrão**: `true`

#### `ENABLE_OFFLINE_MODE`

- **Descrição**: Habilita modo offline completo
- **Valores**: `true` ou `false`
- **Padrão**: `true`

---

## Arquivo .env de Exemplo

```bash
# ========================================
# DATABASE
# ========================================
DATABASE_URL="postgresql://postgres:senha@localhost:5432/chronos"

# ========================================
# AUTENTICAÇÃO
# ========================================
NEXTAUTH_SECRET="seu-secret-de-32-caracteres-aqui"
NEXTAUTH_URL="http://localhost:5000"

# ========================================
# GOOGLE OAUTH
# ========================================
GOOGLE_CLIENT_ID="123456789-abc123.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abc123def456"

# ========================================
# SEGURANÇA QR
# ========================================
QR_SECRET="seu-qr-secret-de-32-caracteres-aqui"

# ========================================
# EMAIL SMTP
# ========================================
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="noreply@chronos.com"
SMTP_PASSWORD="sua-app-password-aqui"
SMTP_FROM="ChronosSystem <noreply@chronos.com>"

# ========================================
# AMBIENTE
# ========================================
NODE_ENV="development"

# ========================================
# OPCIONAL - REDIS
# ========================================
# REDIS_URL="redis://localhost:6379"

# ========================================
# OPCIONAL - SENTRY
# ========================================
# NEXT_PUBLIC_SENTRY_DSN="https://abc@sentry.io/123"

# ========================================
# OPCIONAL - ANALYTICS
# ========================================
# NEXT_PUBLIC_GA_ID="G-ABC123DEF4"

# ========================================
# OPCIONAL - FEATURE FLAGS
# ========================================
ENABLE_2FA="true"
ENABLE_PWA="true"
ENABLE_OFFLINE_MODE="true"
```

---

## Validação Automática

O sistema valida automaticamente todas as variáveis ao iniciar. Se alguma variável obrigatória estiver faltando ou inválida, você verá uma mensagem de erro clara:

```
❌ Erro na validação de variáveis de ambiente:

  • NEXTAUTH_SECRET: NEXTAUTH_SECRET deve ter no mínimo 32 caracteres
  • SMTP_FROM: SMTP_FROM deve ser um email válido

Verifique o arquivo .env e corrija as variáveis acima.
```

---

## Segurança

### ⚠️ NUNCA faça commit de arquivos .env

Adicione ao `.gitignore`:

```
.env
.env.local
.env.production
.env.*.local
```

### ✅ Use .env.example para documentação

Crie um arquivo `.env.example` com valores de exemplo (sem secrets reais):

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/database"
NEXTAUTH_SECRET="gere-com-openssl-rand-base64-32"
# ... etc
```

### 🔐 Rotação de Secrets

Recomenda-se rotacionar secrets periodicamente:

- `NEXTAUTH_SECRET`: A cada 6 meses
- `QR_SECRET`: A cada 3 meses
- `SMTP_PASSWORD`: Conforme política da empresa

---

## Troubleshooting

### Erro: "QR_SECRET environment variable is required"

**Solução**: Adicione `QR_SECRET` ao arquivo `.env` com no mínimo 32 caracteres.

### Erro: "NEXTAUTH_URL deve ser uma URL válida"

**Solução**: Certifique-se de incluir o protocolo (`http://` ou `https://`).

### Erro: "SMTP connection failed"

**Solução**:

1. Verifique se `SMTP_HOST` e `SMTP_PORT` estão corretos
2. Para Gmail, use App Password em vez da senha normal
3. Verifique se o firewall permite conexões na porta SMTP

### Erro: "Google OAuth redirect_uri_mismatch"

**Solução**:

1. Acesse Google Cloud Console
2. Verifique se a URL de redirect está correta: `{NEXTAUTH_URL}/api/auth/callback/google`
3. Certifique-se de que `NEXTAUTH_URL` não tem barra final

---

## Referências

- [NextAuth.js Environment Variables](https://next-auth.js.org/configuration/options#environment-variables)
- [Prisma Connection URLs](https://www.prisma.io/docs/reference/database-reference/connection-urls)
- [Google OAuth Setup](https://support.google.com/cloud/answer/6158849)
- [Zod Documentation](https://zod.dev)

---

**Última atualização**: 28/12/2024
