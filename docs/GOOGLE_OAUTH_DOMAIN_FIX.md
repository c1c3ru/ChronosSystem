# 🔧 Correção: Domínio Inválido Google OAuth

## ❌ **Problema Identificado**

O Google OAuth não aceita domínios `.local` em produção. É necessário usar domínios públicos válidos (`.com`, `.org`, `.com.br`, etc.).

## ✅ **Soluções Disponíveis**

### **Opção 1: Usar Domínio Real (Recomendado para Produção)**

Se você tem um domínio próprio (ex: `meusite.com`):

#### **1. Configure no Google Cloud Console:**

```
https://api.meusite.com/auth/google/callback
https://pwa.meusite.com/auth/callback
```

#### **2. Atualize as variáveis de ambiente:**

```env
# No arquivo .env do backend
GOOGLE_CALLBACK_URL="https://api.meusite.com/auth/google/callback"
PWA_URL="https://pwa.meusite.com"
FRONTEND_URL="https://admin.meusite.com"
```

### **Opção 2: Usar ngrok para Desenvolvimento/Teste**

Para testes rápidos sem domínio próprio:

#### **1. Instalar ngrok:**

```bash
# Ubuntu/Debian
sudo snap install ngrok

# ou baixar de https://ngrok.com/
```

#### **2. Expor o backend:**

```bash
# Iniciar o backend na porta 4000
cd backend && npm run start:dev

# Em outro terminal, expor com ngrok
ngrok http 4000
```

#### **3. Usar a URL do ngrok:**

```
# Exemplo de URL gerada pelo ngrok
https://abc123.ngrok.io/auth/google/callback
```

#### **4. Configurar no Google Cloud Console:**

```
https://abc123.ngrok.io/auth/google/callback
```

#### **5. Atualizar variáveis de ambiente:**

```env
GOOGLE_CALLBACK_URL="https://abc123.ngrok.io/auth/google/callback"
PWA_URL="http://localhost:3001"
```

### **Opção 3: Usar Serviços Gratuitos de Domínio**

#### **Netlify/Vercel (Frontend):**

- Deploy gratuito com domínio automático
- Ex: `https://chronos-pwa.netlify.app`

#### **Railway/Render (Backend):**

- Deploy gratuito com domínio automático
- Ex: `https://chronos-api.railway.app`

## 🛠️ **Configuração Passo a Passo**

### **Para Desenvolvimento com ngrok:**

1. **Iniciar backend:**

```bash
cd backend
npm run start:dev
```

2. **Expor com ngrok:**

```bash
ngrok http 4000
# Anote a URL HTTPS gerada (ex: https://abc123.ngrok.io)
```

3. **Configurar Google Cloud Console:**
   - Acesse [Google Cloud Console](https://console.cloud.google.com/)
   - **APIs & Services > Credentials**
   - Edite o OAuth 2.0 Client ID
   - Adicione: `https://abc123.ngrok.io/auth/google/callback`

4. **Atualizar .env do backend:**

```env
GOOGLE_CALLBACK_URL="https://abc123.ngrok.io/auth/google/callback"
PWA_URL="http://localhost:3001"
```

5. **Iniciar PWA:**

```bash
cd pwa-estagiario
npm run dev
```

6. **Testar:**
   - Acesse: `http://localhost:3001`
   - Clique em "Entrar com Google"

### **Para Produção com Domínio Real:**

1. **Configurar DNS do seu domínio:**

```
api.seudominio.com    → IP do servidor
pwa.seudominio.com    → IP do servidor
admin.seudominio.com  → IP do servidor
kiosk.seudominio.com  → IP do servidor
```

2. **Configurar Google Cloud Console:**

```
https://api.seudominio.com/auth/google/callback
```

3. **Deploy com SSL:**

```bash
# Usar script de deploy com certificado SSL
sudo ./deploy/scripts/deploy-nginx.sh

# Configurar SSL com Certbot
sudo certbot --nginx -d api.seudominio.com -d pwa.seudominio.com
```

## 🔍 **URLs Corretas para Google OAuth**

### ✅ **URLs Válidas:**

```
https://api.meusite.com/auth/google/callback
https://abc123.ngrok.io/auth/google/callback
https://chronos-api.railway.app/auth/google/callback
http://localhost:4000/auth/google/callback (apenas desenvolvimento)
```

### ❌ **URLs Inválidas:**

```
http://api.chronos.local/auth/google/callback
https://chronos.local/auth/google/callback
http://192.168.1.100:4000/auth/google/callback
```

## 🚨 **Importante**

- **Desenvolvimento:** Use `localhost` ou `ngrok`
- **Produção:** Use domínio real com HTTPS
- **Nunca use:** `.local`, IPs privados, ou HTTP em produção
- **Sempre configure:** HTTPS para produção (obrigatório para OAuth)

## 📞 **Próximos Passos**

1. **Escolha uma das opções acima**
2. **Configure as URLs no Google Cloud Console**
3. **Atualize as variáveis de ambiente**
4. **Teste o login Google**

Qual opção você prefere usar? Posso ajudar com a configuração específica! 🚀
