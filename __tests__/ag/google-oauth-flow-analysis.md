# Análise do Fluxo de Login do Google OAuth (NextAuth)

## 📋 Resumo Executivo

Este documento analisa o fluxo de login do Google OAuth segundo a documentação oficial do NextAuth e compara com a implementação atual no ChronosSystem.

---

## 🔄 Fluxo de Login Google OAuth (Segundo a Documentação)

### **Etapa 1: Configuração do Provider**

Segundo a documentação oficial do NextAuth, o Google Provider deve ser configurado da seguinte forma:

```typescript
import GoogleProvider from "next-auth/providers/google"

providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    authorization: {
      params: {
        prompt: "consent",
        access_type: "offline",
        response_type: "code"
      }
    }
  })
]
```

**Parâmetros importantes:**
- `prompt: "consent"` - Força o Google a sempre pedir consentimento (necessário para refresh tokens)
- `access_type: "offline"` - Permite obter refresh tokens
- `response_type: "code"` - Usa o fluxo de código de autorização

### **Etapa 2: Callback URLs**

A documentação especifica que as URLs de callback autorizadas devem seguir o padrão:
- **Produção:** `https://{YOUR_DOMAIN}/api/auth/callback/google`
- **Desenvolvimento:** `http://localhost:3000/api/auth/callback/google`

### **Etapa 3: Fluxo de Autenticação**

```
┌─────────────┐
│   Usuário   │
│ clica em    │
│"Login Google"│
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│ 1. signIn('google') é chamado       │
│    - Redireciona para Google OAuth  │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ 2. Usuário faz login no Google      │
│    - Insere credenciais             │
│    - Concede permissões             │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ 3. Google redireciona para callback │
│    /api/auth/callback/google        │
│    - Envia código de autorização    │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ 4. NextAuth troca código por tokens │
│    - Access token                   │
│    - Refresh token (se configurado) │
│    - ID token (perfil do usuário)   │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ 5. Callback signIn() é executado    │
│    - Recebe: user, account, profile │
│    - Retorna: true/false/URL        │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ 6. Callback jwt() é executado       │
│    - Primeira vez: recebe user,     │
│      account, profile               │
│    - Persiste dados no token JWT    │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ 7. Callback session() é executado   │
│    - Recebe token JWT               │
│    - Retorna dados para o cliente   │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ 8. Callback redirect() é executado  │
│    - Determina URL de redirecionamento│
│    - Padrão: baseUrl                │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ 9. Usuário é redirecionado          │
│    - Para callbackUrl ou baseUrl    │
└─────────────────────────────────────┘
```

### **Etapa 4: Callbacks Principais**

#### **a. signIn Callback**

**Propósito:** Controlar se um usuário pode fazer login

**Documentação oficial:**
```typescript
callbacks: {
  async signIn({ user, account, profile, email, credentials }) {
    const isAllowedToSignIn = true
    if (isAllowedToSignIn) {
      return true
    } else {
      return false // Ou return '/unauthorized'
    }
  }
}
```

**Comportamento:**
- `return true` → Permite login
- `return false` → Bloqueia login (exibe mensagem de erro padrão)
- `return '/url'` → Redireciona para URL específica

**Importante:** Para Google OAuth, o callback recebe:
- `profile.email_verified` - Boolean indicando se o email foi verificado
- `profile.email` - Email do usuário
- `profile.name` - Nome do usuário
- `profile.picture` - URL da foto de perfil

#### **b. jwt Callback**

**Propósito:** Criar e atualizar o token JWT

**Documentação oficial:**
```typescript
callbacks: {
  async jwt({ token, account, profile, user }) {
    // Primeira vez (login): account, profile e user existem
    if (account) {
      token.accessToken = account.access_token
      token.id = profile.id
    }
    // Chamadas subsequentes: apenas token existe
    return token
  }
}
```

**Comportamento:**
- **Primeira chamada (login):** Recebe `user`, `account`, `profile`
- **Chamadas subsequentes:** Recebe apenas `token`
- Deve sempre retornar o token (modificado ou não)

#### **c. session Callback**

**Propósito:** Expor dados do token para o cliente

**Documentação oficial:**
```typescript
callbacks: {
  async session({ session, token }) {
    // Enviar propriedades do token para o cliente
    session.user.id = token.id
    session.accessToken = token.accessToken
    return session
  }
}
```

#### **d. redirect Callback**

**Propósito:** Controlar para onde o usuário é redirecionado após login

**Documentação oficial:**
```typescript
callbacks: {
  async redirect({ url, baseUrl }) {
    // Permite URLs relativas
    if (url.startsWith("/")) return `${baseUrl}${url}`
    // Permite URLs da mesma origem
    else if (new URL(url).origin === baseUrl) return url
    return baseUrl
  }
}
```

---

## 🔍 Implementação Atual (ChronosSystem)

### **1. Configuração do Provider** ✅

**Arquivo:** `/lib/auth.ts` (linhas 89-100)

```typescript
GoogleProvider({
  clientId: GOOGLE_CLIENT_ID!,
  clientSecret: GOOGLE_CLIENT_SECRET!,
  allowDangerousEmailAccountLinking: true,
  authorization: {
    params: {
      prompt: "consent",
      access_type: "offline",
      response_type: "code"
    }
  }
})
```

**Análise:**
- ✅ Configuração correta dos parâmetros de autorização
- ✅ `prompt: "consent"` configurado
- ✅ `access_type: "offline"` configurado
- ⚠️ `allowDangerousEmailAccountLinking: true` - Permite vincular contas com mesmo email (pode ser arriscado)

### **2. Callback signIn** ⚠️

**Arquivo:** `/lib/auth.ts` (linhas 149-288)

**Implementação atual:**

```typescript
async signIn({ user, account, profile }) {
  if (account?.provider === 'google') {
    // Verificar email verificado
    if (!(profile as any)?.email_verified) {
      return false
    }
    
    // Buscar usuário existente
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email! }
    })
    
    if (existingUser) {
      // Atualizar dados do usuário no objeto user
      user.id = existingUser.id
      user.role = existingUser.role
      user.profileComplete = existingUser.profileComplete
      return true
    } else {
      // CRIAR USUÁRIO AUTOMATICAMENTE
      const newUser = await prisma.user.create({
        data: {
          email: user.email!,
          name: profile?.name || 'Usuário',
          image: (profile as any)?.picture,
          role: 'EMPLOYEE',
          profileComplete: false
        }
      })
      
      user.id = newUser.id
      user.role = newUser.role
      user.profileComplete = newUser.profileComplete
      return true
    }
  }
  return true
}
```

**Análise:**

| Aspecto | Documentação | Implementação Atual | Conformidade |
|---------|--------------|---------------------|--------------|
| **Verificação de email** | ✅ Recomendado usar `profile.email_verified` | ✅ Implementado (linha 169) | ✅ Conforme |
| **Retorno booleano** | ✅ `true` permite, `false` bloqueia | ✅ Implementado | ✅ Conforme |
| **Criação automática de usuário** | ⚠️ Não mencionado na docs | ⚠️ Implementado (linhas 213-257) | ⚠️ Extensão customizada |
| **Modificação do objeto `user`** | ⚠️ Não recomendado explicitamente | ⚠️ Implementado (linhas 198-209, 239-243) | ⚠️ Prática não documentada |
| **Logs extensivos** | ❌ Não mencionado | ✅ Implementado | ✅ Boa prática |
| **Auditoria** | ❌ Não mencionado | ✅ Implementado (linhas 246-253) | ✅ Boa prática |

**Problemas identificados:**

1. **Modificação do objeto `user`:** A documentação não recomenda modificar o objeto `user` diretamente no callback `signIn`. Os dados devem ser persistidos no callback `jwt`.

2. **Criação automática de usuários:** Embora funcional, criar usuários automaticamente pode ser um risco de segurança. A documentação sugere retornar `false` para bloquear usuários não autorizados.

3. **Uso de PrismaAdapter:** Com o `PrismaAdapter`, o NextAuth já gerencia a criação de usuários automaticamente. A criação manual pode causar conflitos.

### **3. Callback jwt** ✅

**Arquivo:** `/lib/auth.ts` (linhas 110-140)

```typescript
async jwt({ token, user, account, trigger }) {
  if (user || trigger === 'update') {
    if (user) {
      token.role = user.role
      token.sub = user.id
      token.profileComplete = user.profileComplete
    }
    
    // Buscar dados atualizados do banco
    if (token.sub) {
      const dbUser = await prisma.user.findUnique({
        where: { id: token.sub },
        select: { 
          role: true, 
          profileComplete: true,
          name: true,
          email: true 
        }
      })
      
      if (dbUser) {
        token.role = dbUser.role
        token.profileComplete = dbUser.profileComplete
        token.name = dbUser.name
        token.email = dbUser.email
      }
    }
  }
  return token
}
```

**Análise:**
- ✅ Persiste dados customizados no token (`role`, `profileComplete`)
- ✅ Busca dados atualizados do banco
- ✅ Suporta trigger `update` para atualização de sessão
- ⚠️ Faz query ao banco em TODA chamada (pode impactar performance)

**Problema de performance:**
- O callback `jwt` é chamado em TODA requisição que acessa a sessão
- Fazer query ao banco em cada chamada pode ser custoso
- **Sugestão:** Cachear dados ou buscar apenas quando `user` existe (primeira vez)

### **4. Callback session** ✅

**Arquivo:** `/lib/auth.ts` (linhas 141-148)

```typescript
async session({ session, token }) {
  if (token) {
    session.user.id = token.sub!
    session.user.role = token.role as string
    session.user.profileComplete = token.profileComplete as boolean
  }
  return session
}
```

**Análise:**
- ✅ Expõe dados do token para o cliente
- ✅ Implementação conforme documentação
- ✅ Type-safe com declarações de módulo

### **5. Callback redirect** ⚠️

**Arquivo:** `/lib/auth.ts` (linhas 289-318)

```typescript
async redirect({ url, baseUrl }) {
  // Callback OAuth sempre redireciona para /
  if (url.includes('/api/auth/callback/')) {
    return `${baseUrl}/`
  }
  
  // URL relativa
  if (url.startsWith('/')) {
    return `${baseUrl}${url}`
  }
  
  // Mesma origem
  try {
    if (new URL(url).origin === baseUrl) {
      return url
    }
  } catch (error) {
    // ...
  }
  
  return baseUrl
}
```

**Análise:**
- ✅ Implementação base conforme documentação
- ⚠️ Redirecionamento especial para callbacks OAuth (linha 293-297)
- ⚠️ Sempre redireciona para `/` após login Google (ignora `callbackUrl`)

**Problema:**
- O redirecionamento forçado para `/` ignora o parâmetro `callbackUrl`
- Usuários não são redirecionados para a página que tentavam acessar originalmente
- **Exemplo:** Usuário tenta acessar `/admin` → faz login → é redirecionado para `/` (não para `/admin`)

### **6. Página de Login (Cliente)** ⚠️

**Arquivo:** `/app/auth/signin/page.tsx` (linhas 119-195)

```typescript
const handleGoogleSignIn = async () => {
  try {
    setIsGoogleLoading(true)
    toast.loading('Verificando usuário...', { id: 'google-login' })

    const result = await signIn('google', {
      callbackUrl: '/',
      redirect: false
    })

    if (result?.error) {
      // Tratamento de erros...
      toast.error(errorMessage, { id: 'google-login' })
    } else if (result?.ok) {
      toast.success('Login realizado com sucesso!', { id: 'google-login' })
      window.location.href = '/'
    }
  } catch (error) {
    // ...
  }
}
```

**Análise:**

| Aspecto | Documentação | Implementação Atual | Conformidade |
|---------|--------------|---------------------|--------------|
| **Uso de `signIn()`** | ✅ `signIn('google', { callbackUrl })` | ✅ Implementado | ✅ Conforme |
| **`redirect: false`** | ⚠️ Não recomendado para OAuth | ⚠️ Usado (linha 127) | ⚠️ Não ideal |
| **Redirecionamento manual** | ❌ Não recomendado | ❌ Usado (linha 186) | ❌ Não conforme |
| **Tratamento de erros** | ✅ Verificar `result.error` | ✅ Implementado extensivamente | ✅ Conforme |
| **Loading states** | ❌ Não mencionado | ✅ Implementado | ✅ Boa prática |

**Problemas identificados:**

1. **`redirect: false` para OAuth:** A documentação recomenda deixar o NextAuth gerenciar o redirecionamento para providers OAuth. Usar `redirect: false` pode causar problemas com o fluxo de callback.

2. **Redirecionamento manual com `window.location.href`:** Isso força um reload completo da página, perdendo o estado do React e causando flash de conteúdo.

3. **Verificação de usuário antes do login:** O código tem lógica comentada para verificar se o usuário existe antes de fazer login (linhas 108-117), mas não está sendo usada.

---

## 📊 Comparação: Documentação vs Implementação

### **Conformidades ✅**

| Item | Status |
|------|--------|
| Configuração do Google Provider | ✅ Conforme |
| Parâmetros de autorização (`prompt`, `access_type`) | ✅ Conforme |
| Verificação de `email_verified` | ✅ Conforme |
| Callback `jwt` - estrutura básica | ✅ Conforme |
| Callback `session` | ✅ Conforme |
| Callback `redirect` - estrutura básica | ✅ Conforme |
| Tratamento de erros no cliente | ✅ Conforme |
| Validação de variáveis de ambiente | ✅ Conforme |

### **Divergências ⚠️**

| Item | Documentação | Implementação Atual | Impacto |
|------|--------------|---------------------|---------|
| **Criação automática de usuários** | Não mencionado; PrismaAdapter já faz isso | Criação manual no `signIn` callback | ⚠️ Médio - Pode causar duplicação |
| **Modificação do objeto `user`** | Não recomendado | Modificado no `signIn` callback | ⚠️ Médio - Prática não documentada |
| **Query ao banco no `jwt` callback** | Apenas na primeira vez | Em toda chamada | ⚠️ Alto - Impacto de performance |
| **Redirecionamento após OAuth** | Usar `callbackUrl` padrão | Forçado para `/` | ⚠️ Médio - UX prejudicada |
| **`redirect: false` no cliente** | Não recomendado para OAuth | Usado | ⚠️ Baixo - Pode causar problemas |
| **Redirecionamento manual** | Deixar NextAuth gerenciar | `window.location.href` | ⚠️ Médio - Reload desnecessário |
| **`allowDangerousEmailAccountLinking`** | Não recomendado | Habilitado | ⚠️ Alto - Risco de segurança |

### **Extensões Customizadas (não documentadas, mas válidas) ✅**

| Item | Descrição |
|------|-----------|
| **Logs extensivos** | Logging detalhado em todos os callbacks |
| **Auditoria** | Registro de criação de usuários no `AuditLog` |
| **Tratamento de erros robusto** | Mensagens de erro específicas por tipo |
| **Loading states** | Estados de carregamento para melhor UX |
| **Verificação de perfil completo** | Lógica customizada de `profileComplete` |

---

## 🚨 Problemas Críticos Identificados

### **1. Conflito com PrismaAdapter** 🔴

**Problema:**
O `PrismaAdapter` já gerencia automaticamente a criação de usuários quando um novo usuário faz login via OAuth. A criação manual de usuários no callback `signIn` pode causar:
- Tentativa de criar usuário duplicado
- Conflitos de ID
- Inconsistências no banco de dados

**Solução:**
Remover a criação manual e deixar o adapter gerenciar. Usar o callback `signIn` apenas para validação:

```typescript
async signIn({ user, account, profile }) {
  if (account?.provider === 'google') {
    // Apenas validar
    if (!(profile as any)?.email_verified) {
      return false
    }
    
    // Verificar se é domínio permitido (opcional)
    // if (!profile.email.endsWith('@empresa.com')) {
    //   return false
    // }
    
    return true
  }
  return true
}
```

### **2. Performance do Callback JWT** 🔴

**Problema:**
O callback `jwt` faz query ao banco de dados em TODA chamada, incluindo:
- Cada acesso à página
- Cada chamada a `getSession()`
- Cada uso de `useSession()`

Isso pode gerar centenas de queries desnecessárias.

**Solução:**
Buscar dados do banco apenas na primeira vez (quando `user` existe):

```typescript
async jwt({ token, user, account, trigger }) {
  // Apenas na primeira vez OU quando trigger === 'update'
  if (user || trigger === 'update') {
    if (user) {
      token.role = user.role
      token.sub = user.id
      token.profileComplete = user.profileComplete
    } else if (trigger === 'update' && token.sub) {
      // Apenas atualizar quando explicitamente solicitado
      const dbUser = await prisma.user.findUnique({
        where: { id: token.sub },
        select: { role: true, profileComplete: true, name: true, email: true }
      })
      
      if (dbUser) {
        token.role = dbUser.role
        token.profileComplete = dbUser.profileComplete
        token.name = dbUser.name
        token.email = dbUser.email
      }
    }
  }
  return token
}
```

### **3. Redirecionamento Quebrado** 🟡

**Problema:**
O callback `redirect` sempre redireciona para `/` após login OAuth, ignorando o `callbackUrl`. Isso prejudica a UX:
- Usuário tenta acessar `/admin`
- É redirecionado para login
- Faz login com Google
- É redirecionado para `/` (não para `/admin`)
- Precisa navegar manualmente para `/admin`

**Solução:**
Remover o redirecionamento forçado e deixar o NextAuth usar o `callbackUrl`:

```typescript
async redirect({ url, baseUrl }) {
  // Permitir URLs relativas
  if (url.startsWith('/')) {
    return `${baseUrl}${url}`
  }
  
  // Permitir URLs da mesma origem
  try {
    if (new URL(url).origin === baseUrl) {
      return url
    }
  } catch (error) {
    console.log('Erro ao parsear URL:', error)
  }
  
  // Fallback para baseUrl
  return baseUrl
}
```

### **4. Risco de Segurança: `allowDangerousEmailAccountLinking`** 🔴

**Problema:**
A opção `allowDangerousEmailAccountLinking: true` permite que contas com o mesmo email sejam vinculadas automaticamente, mesmo que sejam de providers diferentes. Isso pode ser explorado:
- Atacante cria conta com email `admin@empresa.com` via credenciais
- Admin faz login com Google usando `admin@empresa.com`
- Contas são vinculadas automaticamente
- Atacante pode acessar a conta do admin

**Solução:**
Remover essa opção ou implementar verificação adicional:

```typescript
GoogleProvider({
  clientId: GOOGLE_CLIENT_ID!,
  clientSecret: GOOGLE_CLIENT_SECRET!,
  // Remover: allowDangerousEmailAccountLinking: true,
  authorization: {
    params: {
      prompt: "consent",
      access_type: "offline",
      response_type: "code"
    }
  }
})
```

### **5. Uso Incorreto de `redirect: false`** 🟡

**Problema:**
No cliente, o código usa `redirect: false` e depois faz redirecionamento manual com `window.location.href`. Isso:
- Causa reload completo da página
- Perde estado do React
- Pode causar flash de conteúdo
- Não é a forma recomendada para OAuth

**Solução:**
Deixar o NextAuth gerenciar o redirecionamento:

```typescript
const handleGoogleSignIn = async () => {
  try {
    setIsGoogleLoading(true)
    toast.loading('Autenticando com Google...', { id: 'google-login' })

    // Deixar NextAuth gerenciar o redirecionamento
    await signIn('google', {
      callbackUrl: '/' // Ou usar a URL que o usuário tentava acessar
    })
    
    // Não precisa de código após signIn - o NextAuth redireciona automaticamente
  } catch (error) {
    console.error('Google login error:', error)
    toast.error('Erro ao fazer login com Google', { id: 'google-login' })
    setIsGoogleLoading(false)
  }
}
```

---

## 📋 Checklist de Conformidade

### **Configuração**
- ✅ Google Provider configurado
- ✅ Client ID e Secret definidos
- ✅ Parâmetros de autorização corretos
- ⚠️ `allowDangerousEmailAccountLinking` habilitado (risco)

### **Callbacks**
- ⚠️ `signIn` - Cria usuários manualmente (conflito com adapter)
- ⚠️ `jwt` - Faz query ao banco em toda chamada (performance)
- ✅ `session` - Conforme documentação
- ⚠️ `redirect` - Força redirecionamento para `/` (UX)

### **Cliente**
- ⚠️ Usa `redirect: false` (não recomendado para OAuth)
- ⚠️ Redirecionamento manual com `window.location.href`
- ✅ Tratamento de erros robusto
- ✅ Loading states implementados

### **Segurança**
- ✅ Verificação de `email_verified`
- ⚠️ `allowDangerousEmailAccountLinking` (risco alto)
- ✅ Validação de variáveis de ambiente
- ✅ Auditoria de criação de usuários

---

## 🎯 Recomendações Prioritárias

### **Alta Prioridade** 🔴

1. **Remover `allowDangerousEmailAccountLinking`**
   - Risco de segurança alto
   - Pode permitir account takeover

2. **Otimizar callback `jwt`**
   - Reduzir queries ao banco
   - Melhorar performance significativamente

3. **Remover criação manual de usuários**
   - Deixar PrismaAdapter gerenciar
   - Evitar conflitos e duplicações

### **Média Prioridade** 🟡

4. **Corrigir redirecionamento após OAuth**
   - Respeitar `callbackUrl`
   - Melhorar UX

5. **Remover `redirect: false` no cliente**
   - Deixar NextAuth gerenciar
   - Evitar reloads desnecessários

### **Baixa Prioridade** 🟢

6. **Adicionar cache ao callback `jwt`**
   - Considerar usar Redis para cache de sessão
   - Reduzir ainda mais queries ao banco

7. **Implementar renovação automática de tokens**
   - Usar refresh tokens do Google
   - Manter usuários logados por mais tempo

---

## 📈 Fluxo Ideal (Recomendado)

```
┌─────────────────────────────────────┐
│ 1. Usuário clica "Login com Google" │
│    signIn('google', { callbackUrl }) │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ 2. Redireciona para Google OAuth    │
│    - Parâmetros: prompt, access_type│
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ 3. Usuário faz login no Google      │
│    - Concede permissões             │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ 4. Callback: /api/auth/callback/google│
│    - NextAuth troca código por tokens│
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ 5. Callback signIn()                │
│    - Verifica email_verified        │
│    - Retorna true (permite login)   │
│    - PrismaAdapter cria usuário     │
│      automaticamente se não existir │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ 6. Callback jwt() - PRIMEIRA VEZ    │
│    - Recebe user do adapter         │
│    - Persiste role, profileComplete │
│    - NÃO faz query ao banco         │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ 7. Callback session()               │
│    - Expõe dados do token           │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ 8. Callback redirect()              │
│    - Usa callbackUrl se fornecido   │
│    - Senão, usa baseUrl             │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ 9. Middleware verifica perfil       │
│    - Se incompleto → /complete-profile│
│    - Se completo → dashboard        │
└─────────────────────────────────────┘
```

---

## 🔧 Código Refatorado Sugerido

### **lib/auth.ts - Callbacks**

```typescript
callbacks: {
  async signIn({ user, account, profile }) {
    if (account?.provider === 'google') {
      // Apenas validar - NÃO criar usuário manualmente
      if (!(profile as any)?.email_verified) {
        console.log('❌ Email não verificado pelo Google')
        return false
      }
      
      // Opcional: Validar domínio
      // if (!profile.email.endsWith('@empresa.com')) {
      //   return false
      // }
      
      console.log('✅ Login Google autorizado:', profile.email)
      return true
    }
    return true
  },
  
  async jwt({ token, user, trigger }) {
    // Apenas na primeira vez OU quando explicitamente atualizado
    if (user) {
      // Primeira vez - dados vêm do PrismaAdapter
      token.role = user.role
      token.sub = user.id
      token.profileComplete = user.profileComplete
    } else if (trigger === 'update' && token.sub) {
      // Atualização explícita via update()
      const dbUser = await prisma.user.findUnique({
        where: { id: token.sub },
        select: { role: true, profileComplete: true, name: true, email: true }
      })
      
      if (dbUser) {
        token.role = dbUser.role
        token.profileComplete = dbUser.profileComplete
        token.name = dbUser.name
        token.email = dbUser.email
      }
    }
    return token
  },
  
  async session({ session, token }) {
    if (token) {
      session.user.id = token.sub!
      session.user.role = token.role as string
      session.user.profileComplete = token.profileComplete as boolean
    }
    return session
  },
  
  async redirect({ url, baseUrl }) {
    // Permitir URLs relativas
    if (url.startsWith('/')) {
      return `${baseUrl}${url}`
    }
    
    // Permitir URLs da mesma origem
    try {
      if (new URL(url).origin === baseUrl) {
        return url
      }
    } catch (error) {
      console.log('Erro ao parsear URL:', error)
    }
    
    return baseUrl
  }
}
```

### **app/auth/signin/page.tsx - handleGoogleSignIn**

```typescript
const handleGoogleSignIn = async () => {
  try {
    setIsGoogleLoading(true)
    toast.loading('Autenticando com Google...', { id: 'google-login' })

    // Deixar NextAuth gerenciar o redirecionamento
    await signIn('google', {
      callbackUrl: '/' // Middleware redirecionará conforme role e profileComplete
    })
    
    // NextAuth redireciona automaticamente - não precisa de código aqui
  } catch (error) {
    console.error('Google login error:', error)
    toast.error('Erro ao fazer login com Google', { id: 'google-login' })
    setIsGoogleLoading(false)
  }
}
```

---

**Data da análise:** 2025-11-24  
**Versão:** 1.0  
**Status:** ⚠️ Divergências identificadas - Refatoração recomendada
