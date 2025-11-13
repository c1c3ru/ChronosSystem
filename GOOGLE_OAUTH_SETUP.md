# 🔧 Configuração do Google OAuth - Resolver Erro redirect_uri_mismatch

## ❌ Erro Atual
```
Erro 400: redirect_uri_mismatch
Acesso bloqueado: a solicitação desse app é inválida
```

## 🎯 Solução

### 1. **Verificar Google Cloud Console**

Acesse: [Google Cloud Console](https://console.cloud.google.com/)

1. **Selecione seu projeto** (ou crie um novo)
2. **Vá para APIs & Services > Credentials**
3. **Clique no OAuth 2.0 Client ID** existente

### 2. **Configurar URLs Autorizadas**

Na seção **"Authorized redirect URIs"**, adicione:

#### Para Desenvolvimento:
```
http://localhost:3000/api/auth/callback/google
```

#### Para Produção (substitua pelo seu domínio):
```
https://seu-dominio.vercel.app/api/auth/callback/google
https://chronos-system.vercel.app/api/auth/callback/google
```

### 3. **Verificar Variáveis de Ambiente**

Certifique-se que o arquivo `.env.local` contém:

```bash
# URLs corretas baseadas no ambiente
NEXTAUTH_URL="http://localhost:3000"  # Para desenvolvimento
# NEXTAUTH_URL="https://seu-dominio.vercel.app"  # Para produção

# Credenciais do Google Cloud Console
GOOGLE_CLIENT_ID="seu-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-seu-client-secret"

# Secret para NextAuth (mínimo 32 caracteres)
NEXTAUTH_SECRET="sua-chave-secreta-super-segura-minimo-32-caracteres"
```

### 4. **URLs de Callback Corretas**

O NextAuth.js automaticamente cria as URLs de callback no formato:
```
[NEXTAUTH_URL]/api/auth/callback/[provider]
```

Exemplos:
- **Local**: `http://localhost:3000/api/auth/callback/google`
- **Produção**: `https://seu-dominio.vercel.app/api/auth/callback/google`

### 5. **Verificar Configuração Atual**

Execute para verificar as variáveis:

```bash
# Verificar se as variáveis estão carregadas
npm run dev
```

### 6. **Configuração para Múltiplos Ambientes**

Se você tem desenvolvimento e produção, configure ambas as URLs no Google Cloud Console:

```
http://localhost:3000/api/auth/callback/google
https://chronos-system.vercel.app/api/auth/callback/google
https://seu-dominio-personalizado.com/api/auth/callback/google
```

### 7. **Reiniciar Aplicação**

Após fazer as alterações:

```bash
# Parar o servidor
Ctrl + C

# Reiniciar
npm run dev
```

## 🔍 Debug

Para verificar se está funcionando, acesse:
```
http://localhost:3000/api/auth/providers
```

Deve mostrar o Google como provider disponível.

## ⚠️ Problemas Comuns

1. **URL com/sem barra final**: Use sem barra final
2. **HTTP vs HTTPS**: Certifique-se de usar o protocolo correto
3. **Porta diferente**: Se usar porta diferente de 3000, ajuste nas URLs
4. **Cache do navegador**: Limpe o cache ou use aba anônima
5. **Propagação DNS**: Para domínios novos, aguarde propagação

## ✅ Teste Final

1. Acesse: `http://localhost:3000/auth/signin`
2. Clique em "Entrar com Google"
3. Deve redirecionar corretamente sem erro 400

---

**💡 Dica**: Sempre mantenha as URLs do Google Cloud Console sincronizadas com suas variáveis de ambiente!
