# 📧 Guia de Configuração de Email - Nodemailer

Este guia explica como configurar o sistema de email do Chronos System usando Nodemailer.

## 🚀 Configuração Rápida

### 1. Gmail (Recomendado)

#### Passo 1: Ativar Autenticação de 2 Fatores

1. Acesse [myaccount.google.com](https://myaccount.google.com)
2. Vá em **Segurança**
3. Ative a **Verificação em duas etapas**

#### Passo 2: Gerar Senha de App

1. Em **Segurança**, clique em **Senhas de app**
2. Selecione **Email** como aplicativo
3. Copie a senha gerada (16 caracteres)

#### Passo 3: Configurar Variáveis de Ambiente

Adicione ao seu `.env`:

```env
# Gmail Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app-16-caracteres
SMTP_FROM=noreply@seudominio.com
```

### 2. Outlook/Hotmail

```env
# Outlook Configuration
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@outlook.com
SMTP_PASS=sua-senha
SMTP_FROM=noreply@seudominio.com
```

### 3. Yahoo Mail

```env
# Yahoo Configuration
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@yahoo.com
SMTP_PASS=sua-senha-de-app
SMTP_FROM=noreply@seudominio.com
```

### 4. SendGrid (Profissional)

```env
# SendGrid Configuration
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=sua-api-key-do-sendgrid
SMTP_FROM=noreply@seudominio.com
```

## 🧪 Testando a Configuração

### Teste Automático

Execute o script de teste:

```bash
node scripts/test-email-simple.js
```

### Teste Manual via API

Use o endpoint de teste:

```bash
curl -X POST http://localhost:5000/api/admin/send-reset-emails \
  -H "Content-Type: application/json" \
  -d '{"tokenIds": ["token-id"], "customMessage": "Teste"}'
```

## 🔧 Configurações Avançadas

### SSL/TLS

Para conexões seguras (porta 465):

```env
SMTP_PORT=465
SMTP_SECURE=true
```

### Autenticação OAuth2 (Gmail)

Para maior segurança, use OAuth2:

```env
SMTP_AUTH_TYPE=OAuth2
SMTP_CLIENT_ID=seu-client-id
SMTP_CLIENT_SECRET=seu-client-secret
SMTP_REFRESH_TOKEN=seu-refresh-token
```

### Configuração de Proxy

Se estiver atrás de um proxy:

```env
SMTP_PROXY=http://proxy.empresa.com:8080
```

## 🚨 Troubleshooting

### Problemas Comuns

#### ❌ "Invalid login"

- ✅ Verifique se a autenticação de 2 fatores está ativa
- ✅ Use senha de app, não a senha normal
- ✅ Confirme o email e senha

#### ❌ "Connection timeout"

- ✅ Verifique firewall/proxy
- ✅ Teste diferentes portas (587, 465, 25)
- ✅ Confirme o host SMTP

#### ❌ "Authentication failed"

- ✅ Gmail: Use senha de app
- ✅ Outlook: Ative "Acesso de aplicativos menos seguros"
- ✅ Yahoo: Use senha de app

#### ❌ "Message rejected"

- ✅ Verifique o endereço FROM
- ✅ Confirme limites de envio
- ✅ Verifique blacklists

### Logs Úteis

```bash
# Ver logs do Next.js
npm run dev

# Logs detalhados do Nodemailer
DEBUG=nodemailer* npm run dev
```

## 📊 Monitoramento

### Métricas Importantes

- Taxa de entrega
- Bounces (emails rejeitados)
- Tempo de resposta SMTP
- Erros de autenticação

### Ferramentas Recomendadas

- **Ethereal Email**: Desenvolvimento/teste
- **Mailtrap**: Teste em staging
- **SendGrid**: Produção profissional
- **Amazon SES**: Alta escala

## 🔐 Segurança

### Boas Práticas

1. **Nunca** commite credenciais no código
2. Use **senhas de app** específicas
3. **Rotacione** credenciais regularmente
4. **Monitore** logs de acesso
5. **Limite** taxa de envio

### Variáveis Sensíveis

```env
# ❌ NUNCA faça isso
SMTP_PASS=minha-senha-123

# ✅ Use senhas de app
SMTP_PASS=abcd-efgh-ijkl-mnop
```

## 🌐 Produção

### Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Credenciais testadas
- [ ] Limites de envio verificados
- [ ] Domínio FROM configurado
- [ ] SPF/DKIM configurados
- [ ] Monitoramento ativo

### Configuração de Domínio

Para melhor entregabilidade:

1. **SPF Record**:

```
v=spf1 include:_spf.google.com ~all
```

2. **DKIM**: Configure no provedor de email

3. **DMARC**:

```
v=DMARC1; p=quarantine; rua=mailto:dmarc@seudominio.com
```

## 📞 Suporte

### Recursos Úteis

- [Documentação Nodemailer](https://nodemailer.com/)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- [Outlook SMTP Settings](https://support.microsoft.com/en-us/office/pop-imap-and-smtp-settings-8361e398-8af4-4e97-b147-6c6c4ac95353)

### Contato

Para problemas específicos:

1. Verifique logs do sistema
2. Execute scripts de teste
3. Consulte documentação do provedor
4. Verifique configurações de firewall

---

**Desenvolvido para Chronos System** 🕐  
_Sistema de email robusto e confiável_
