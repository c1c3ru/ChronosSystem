# 🚀 Configuração de Deploy Automático - Vercel + GitHub Actions

## 📋 **Pré-requisitos**

1. **Conta no Vercel** conectada ao GitHub
2. **Projeto já configurado** no Vercel
3. **Repositório no GitHub** com o código

## 🔑 **Configurar Secrets no GitHub**

Acesse: **GitHub Repository → Settings → Secrets and variables → Actions**

### **Secrets Obrigatórios:**

#### 1. **VERCEL_TOKEN**
```bash
# Obter em: https://vercel.com/account/tokens
# Criar novo token com escopo "Full Account"
VERCEL_TOKEN=seu_token_aqui
```

#### 2. **VERCEL_ORG_ID**
```bash
# Encontrar em: .vercel/project.json (após vercel link)
# Ou no dashboard do Vercel → Settings → General
VERCEL_ORG_ID=team_ge7p7mFdCYM0IeLheUarDt1M
```

#### 3. **VERCEL_PROJECT_ID**
```bash
# Encontrar em: .vercel/project.json (após vercel link)
# Ou no dashboard do Vercel → Settings → General  
VERCEL_PROJECT_ID=prj_kUDaw1Z8oPHJShwXQk1bbwNCuNP6
```

#### 4. **DATABASE_URL**
```bash
# URL do banco PostgreSQL para produção
DATABASE_URL=postgres://user:password@host:5432/database?sslmode=require
```

## 🛠️ **Configurar Variáveis no Vercel Dashboard**

Acesse: **Vercel Dashboard → Seu Projeto → Settings → Environment Variables**

### **Variáveis de Produção:**

```bash
# NextAuth
NEXTAUTH_URL=https://chronos-system.vercel.app
NEXTAUTH_SECRET=sua-chave-secreta-super-segura-minimo-32-caracteres

# Google OAuth
GOOGLE_CLIENT_ID=669988829985-pcebjkv860j0ke2uth2ccodof1ne4hpq.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Database
DATABASE_URL=postgres://b1d316d5b4ac81592c801607e150386f8fc45b9bd4abdf103604a27d0e2bca43:sk_tFP-v_lybGfPnRrIhvLMt@db.prisma.io:5432/postgres?sslmode=require
POSTGRES_URL=postgres://b1d316d5b4ac81592c801607e150386f8fc45b9bd4abdf103604a27d0e2bca43:sk_tFP-v_lybGfPnRrIhvLMt@db.prisma.io:5432/postgres?sslmode=require
PRISMA_DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza190RlAtdl9seWJHZlBuUnJJaHZMTXQiLCJhcGlfa2V5IjoiMDFLOUEzWjhBWlc0QUM0RldBVjBCOFRDMVAiLCJ0ZW5hbnRfaWQiOiJiMWQzMTZkNWI0YWM4MTU5MmM4MDE2MDdlMTUwMzg2ZjhmYzQ1YjliZDRhYmRmMTAzNjA0YTI3ZDBlMmJjYTQzIiwiaW50ZXJuYWxfc2VjcmV0IjoiYTUyZTBkZTMtM2NmZC00NWM0LTlhOTQtZmY2MGFkZGE1OWU5In0.2vjRmt3_ppKiI4B6bQf-MBVtZoBprYFA5gDCNgC3rvc

# QR Security
QR_SECRET=0HY4rhgEt1Bxc0LxIs7DxBJUvXdIfvAZHRZ0fSAF08k=

# Environment
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## 🔄 **Como Funciona o Deploy**

### **Deploy Automático (Push para main):**
1. **Push para branch main** → Trigger automático
2. **GitHub Actions** executa o workflow
3. **Build do projeto** com Prisma e dependências
4. **Deploy para produção** no Vercel
5. **Migração do banco** (se necessário)

### **Deploy de Preview (Pull Request):**
1. **Abrir PR** → Deploy de preview automático
2. **URL de preview** comentada no PR
3. **Testes** na URL temporária
4. **Merge** → Deploy para produção

## 📱 **URLs do Sistema**

- **Produção**: https://chronos-system.vercel.app
- **Admin**: https://chronos-system.vercel.app/admin
- **Funcionários**: https://chronos-system.vercel.app/employee
- **Kiosk**: https://chronos-system.vercel.app/kiosk

## 🔍 **Verificar Deploy**

### **Status do Workflow:**
- GitHub → Actions → Deploy to Vercel

### **Logs do Vercel:**
- Vercel Dashboard → Deployments → Ver logs

### **Testar Funcionalidades:**
- ✅ Login Google
- ✅ Completar perfil
- ✅ Registro de ponto
- ✅ Dashboard admin
- ✅ APIs funcionando

## 🚨 **Troubleshooting**

### **Erro de Build:**
```bash
# Verificar dependências
npm ci
npx prisma generate
npm run build
```

### **Erro de Database:**
```bash
# Verificar conexão
npx prisma db push
```

### **Erro de OAuth:**
```bash
# Verificar URLs no Google Cloud Console:
# https://chronos-system.vercel.app/api/auth/callback/google
```

## ✅ **Checklist de Deploy**

- [ ] Secrets configurados no GitHub
- [ ] Variáveis configuradas no Vercel
- [ ] Google OAuth URLs atualizadas
- [ ] Database URL válida
- [ ] Push para main executado
- [ ] Deploy bem-sucedido
- [ ] Testes de funcionalidade OK

---

**🎯 Após configurar tudo, faça um push para a branch main para executar o deploy automático!**
