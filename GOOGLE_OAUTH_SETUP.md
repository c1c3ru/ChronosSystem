# 🔐 Configuração Google OAuth - ChronosSystem

## ✅ Credenciais Configuradas

As credenciais do Google OAuth já foram configuradas no sistema:

- **Client ID:** `669988829985-pcebjkv860j0ke2uth2ccodof1ne4hpq.apps.googleusercontent.com`
- **Client Secret:** `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`
- **Project ID:** `chronossystem`

## 🌐 URLs de Callback Configuradas

### **Desenvolvimento:**
- `http://localhost:4000/auth/google/callback`

### **Produção:**
- `https://api.seudominio.com/auth/google/callback` (substitua pelo seu domínio real)

## ⚙️ Configuração no Google Cloud Console

Para garantir que o OAuth funcione corretamente, verifique estas configurações no [Google Cloud Console](https://console.cloud.google.com/):

### **1. Tela de Consentimento OAuth**
1. Acesse **APIs & Services > OAuth consent screen**
2. Configure:
   - **Application name:** ChronosSystem
   - **User support email:** seu-email@gmail.com
   - **Developer contact information:** seu-email@gmail.com
   - **Authorized domains:** 
     - `seudominio.com` (substitua pelo seu domínio real)

### **2. Credenciais OAuth 2.0**
1. Acesse **APIs & Services > Credentials**
2. Edite o Client ID OAuth 2.0
3. Configure **Authorized redirect URIs:**

#### **Para Desenvolvimento:**
```
http://localhost:4000/auth/google/callback
```

#### **Para Produção:**
```
https://api.seudominio.com/auth/google/callback
```
*Substitua `seudominio.com` pelo seu domínio real (ex: `chronos.com.br`, `meusite.com`, etc.)*

### **3. APIs Habilitadas**
Certifique-se de que estas APIs estão habilitadas:
- **Google+ API** (ou **People API**)
- **Google OAuth2 API**

## 🚀 Testando a Configuração

### **1. Desenvolvimento:**
```bash
# Copiar arquivo de exemplo
cp backend/.env.example backend/.env

# Iniciar o backend
cd backend
npm run start:dev

# Iniciar o PWA
cd ../pwa-estagiario  
npm run dev

# Testar login Google
# Acesse: http://localhost:3001
# Clique em "Entrar com Google"
```

### **2. Produção:**
```bash
# Usar arquivo de produção
cp deploy/env/.env.production backend/.env

# Deploy com script automático
sudo ./deploy/scripts/deploy-nginx.sh

# Testar login Google
# Acesse: http://pwa.chronos.local
# Clique em "Entrar com Google"
```

## 🔍 Fluxo de Autenticação

1. **Usuário clica "Entrar com Google"** no PWA
2. **Redireciona para Google OAuth:** `https://accounts.google.com/o/oauth2/auth`
3. **Usuário autoriza no Google**
4. **Google redireciona para:** `http://api.chronos.local/auth/google/callback`
5. **Backend processa:**
   - Se usuário novo → redireciona para `/auth/register`
   - Se usuário existente → redireciona para `/auth/callback` com tokens
6. **PWA processa tokens e faz login**

## 🛠️ Troubleshooting

### **Erro: "redirect_uri_mismatch"**
- Verificar se a URL de callback está configurada no Google Cloud Console
- Verificar se a URL no código corresponde exatamente à configurada

### **Erro: "access_denied"**
- Verificar se o projeto está em modo de produção no Google Cloud Console
- Verificar se o usuário tem permissão para acessar a aplicação

### **Erro: "invalid_client"**
- Verificar se o Client ID e Client Secret estão corretos
- Verificar se as variáveis de ambiente estão carregadas

### **Login funciona mas não redireciona**
- Verificar se a variável `PWA_URL` está configurada corretamente
- Verificar se o CORS está configurado para permitir o domínio do PWA

## 📝 Variáveis de Ambiente

### **Backend (.env):**
```env
GOOGLE_CLIENT_ID="669988829985-pcebjkv860j0ke2uth2ccodof1ne4hpq.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"
PWA_URL="http://localhost:3001"  # ou http://pwa.chronos.local em produção
```

### **PWA (.env):**
```env
VITE_API_URL="http://localhost:4000"  # ou http://api.chronos.local em produção
```

## 🔒 Segurança

⚠️ **IMPORTANTE:** 
- Nunca commite arquivos `.env` com credenciais reais
- Use variáveis de ambiente diferentes para desenvolvimento e produção
- Configure HTTPS em produção
- Restrinja domínios autorizados no Google Cloud Console

## ✅ Status da Configuração

- ✅ **Credenciais configuradas** nos arquivos de ambiente
- ✅ **URLs de callback** definidas
- ✅ **Fluxo de autenticação** implementado
- ✅ **Modal de registro** para novos usuários
- ✅ **Redirecionamentos** configurados

O sistema está pronto para usar Google OAuth! 🎉
