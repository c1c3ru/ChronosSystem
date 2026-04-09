# 🔐 Sistema de Reset de Senha - Chronos System

Este guia explica como usar o sistema completo de reset de senha implementado no Chronos System.

## 📋 Visão Geral

O sistema permite que administradores criem tokens de reset de senha para usuários individuais ou em massa, com controle total sobre expiração, notificações e auditoria.

## 🚀 Funcionalidades

### ✅ Para Administradores

- **Reset em massa**: Resetar senhas de todos os usuários de uma vez
- **Reset individual**: Resetar senha de usuários específicos
- **Gerenciamento de tokens**: Visualizar, copiar e invalidar tokens ativos
- **Envio de emails**: Notificar usuários automaticamente
- **Auditoria completa**: Logs detalhados de todas as ações
- **Configuração flexível**: Tempo de expiração de 1 hora a 7 dias

### ✅ Para Usuários

- **Interface intuitiva**: Página simples para redefinir senha
- **Validação em tempo real**: Verificação automática do token
- **Segurança**: Confirmação de senha e validações
- **Feedback claro**: Mensagens de erro e sucesso

## 🛠️ Como Usar

### 1. Acesso Administrativo

Faça login como ADMIN ou SUPERVISOR e acesse:

```
http://localhost:5000/admin/password-reset
```

### 2. Criar Reset de Senha

#### Reset Individual:

1. Selecione "Individual"
2. Marque os usuários desejados
3. Digite o motivo do reset
4. Escolha o tempo de expiração
5. Clique em "Reset para X usuário(s)"

#### Reset em Massa:

1. Selecione "Em Massa"
2. Digite o motivo do reset
3. Escolha o tempo de expiração
4. Clique em "Reset em Massa"

### 3. Gerenciar Tokens Ativos

Na seção "Tokens Ativos" você pode:

- ✅ Ver todos os tokens válidos
- 📋 Copiar URLs de reset
- 🗑️ Invalidar tokens específicos
- ✉️ Enviar emails para usuários selecionados

### 4. Enviar Emails

1. Marque os tokens desejados
2. Digite uma mensagem personalizada (opcional)
3. Clique em "Enviar Emails"

## 🔗 URLs e Endpoints

### Páginas Web

```
/admin/password-reset          # Interface administrativa
/auth/reset-password?token=XXX # Página de reset do usuário
```

### APIs REST

#### Gerenciamento de Resets

```http
POST /api/admin/password-reset
GET  /api/admin/password-reset
DELETE /api/admin/password-reset?tokenId=XXX
```

#### Processamento de Reset

```http
POST /api/auth/reset-password
GET  /api/auth/reset-password?token=XXX
```

#### Envio de Emails

```http
POST /api/admin/send-reset-emails
GET  /api/admin/send-reset-emails
```

## 📧 Sistema de Email com Nodemailer

### ✅ Configuração Completa

O sistema de email usa **Nodemailer** e está totalmente implementado em `lib/email.ts`.

#### 🔧 Instalação (já incluída):

```bash
npm install nodemailer @types/nodemailer
```

#### ⚙️ Configuração de Produção:

Adicione as seguintes variáveis ao seu `.env`:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
SMTP_FROM=noreply@chronos.com
```

#### 📧 Configuração para Gmail:

1. **Ative a autenticação de 2 fatores** na sua conta Google
2. Vá em **Configurações da Conta > Segurança > Senhas de app**
3. **Gere uma senha de app** para "Email"
4. Use a senha gerada em `SMTP_PASS`

#### 🧪 Modo de Desenvolvimento:

Se as credenciais SMTP não estiverem configuradas, o sistema automaticamente:

- ✅ Usa **Ethereal Email** para testes
- ✅ Gera conta temporária automaticamente
- ✅ Fornece URLs de preview dos emails
- ✅ Logs detalhados no console

#### 🔄 Outros Provedores SMTP:

```env
# Outlook
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587

# Yahoo
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587

# SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
```

### Templates Incluídos

- ✅ Template HTML responsivo
- ✅ Template de texto simples
- ✅ Notificações para administradores
- ✅ Mensagens personalizáveis

## 🔒 Segurança

### Tokens

- **Geração**: 32 bytes aleatórios (hex)
- **Unicidade**: Cada token é único
- **Expiração**: Configurável (1h a 7 dias)
- **Uso único**: Invalidado após uso
- **Limpeza**: Tokens expirados são ignorados

### Validações

- ✅ Verificação de permissões (ADMIN/SUPERVISOR)
- ✅ Validação de dados com Zod
- ✅ Hash seguro de senhas (bcrypt)
- ✅ Logs de auditoria completos
- ✅ Sanitização de inputs

### Auditoria

Todas as ações são registradas:

- `MASS_PASSWORD_RESET` - Reset em massa
- `INDIVIDUAL_PASSWORD_RESET` - Reset individual
- `PASSWORD_RESET_COMPLETED` - Senha alterada
- `SEND_RESET_EMAILS` - Emails enviados
- `INVALIDATE_RESET_TOKEN` - Token invalidado

## 🧪 Testes

### Teste Completo do Sistema:

```bash
node scripts/test-password-reset.js
```

Este script:

1. ✅ Verifica usuários existentes
2. ✅ Cria tokens de teste
3. ✅ Valida funcionamento
4. ✅ Simula alteração de senha
5. ✅ Verifica logs de auditoria

### Teste do Sistema de Email:

```bash
node scripts/test-email.js
```

Este script:

1. ✅ Testa envio de email simples
2. ✅ Testa email de reset de senha
3. ✅ Testa notificação para admin
4. ✅ Verifica configuração SMTP
5. ✅ Mostra URLs de preview (modo desenvolvimento)

### 📧 Visualizar Emails de Teste:

Em modo de desenvolvimento (sem SMTP configurado):

- Os emails são enviados via **Ethereal Email**
- URLs de preview são mostradas no console
- Acesse https://ethereal.email para ver os emails

## 📊 Monitoramento

### Estatísticas Disponíveis

- 👥 Total de usuários com senha
- ⏰ Tokens válidos ativos
- ⚠️ Tokens expirados
- 📈 Histórico de envios

### Logs de Auditoria

Acesse via banco de dados:

```sql
SELECT * FROM "AuditLog"
WHERE action LIKE '%PASSWORD_RESET%'
ORDER BY timestamp DESC;
```

## 🚨 Troubleshooting

### Problemas Comuns

**Token não funciona:**

- ✅ Verifique se não expirou
- ✅ Confirme se não foi usado
- ✅ Verifique logs de auditoria

**Email não enviado:**

- ✅ Configure provedor de email
- ✅ Verifique variáveis de ambiente
- ✅ Consulte logs do servidor

**Erro de permissão:**

- ✅ Usuário deve ser ADMIN ou SUPERVISOR
- ✅ Verifique sessão ativa
- ✅ Confirme role no banco

### Logs Úteis

```bash
# Logs do Next.js
tail -f .next/trace

# Logs do banco (se configurado)
tail -f /var/log/postgresql/postgresql.log
```

## 🔄 Fluxo Completo

1. **Admin** acessa `/admin/password-reset`
2. **Admin** cria reset (massa ou individual)
3. **Sistema** gera tokens seguros
4. **Admin** envia emails (opcional)
5. **Usuário** recebe email com link
6. **Usuário** acessa `/auth/reset-password?token=XXX`
7. **Usuário** define nova senha
8. **Sistema** invalida token e atualiza senha
9. **Sistema** registra ação nos logs

## 📞 Suporte

Para dúvidas ou problemas:

1. Consulte os logs de auditoria
2. Execute o script de teste
3. Verifique configurações de email
4. Consulte a documentação do Prisma

---

**Desenvolvido para Chronos System** 🕐  
_Sistema completo e seguro de reset de senhas_
