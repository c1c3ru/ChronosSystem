# 🚀 Deployment Guide - Chronos System

## Configuração de Variáveis de Ambiente

### GitHub Secrets Necessários

Para que o CI/CD funcione corretamente, configure os seguintes secrets no GitHub:

#### **Vercel Deployment**
```bash
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_vercel_org_id_here  
VERCEL_PROJECT_ID=your_vercel_project_id_here
```

#### **Database (Produção)**
```bash
DATABASE_URL=your_production_database_url_here
```

### Como Obter as Variáveis

#### 1. **VERCEL_TOKEN**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login e obter token
vercel login
vercel --token  # Mostra o token atual
```

#### 2. **VERCEL_ORG_ID e VERCEL_PROJECT_ID**
```bash
# No diretório do projeto
vercel link

# Isso criará .vercel/project.json com os IDs
cat .vercel/project.json
```

#### 3. **DATABASE_URL**
Para produção, recomendamos:
- **Vercel Postgres** (integração nativa)
- **PlanetScale** (MySQL serverless)
- **Supabase** (PostgreSQL)
- **Railway** (PostgreSQL/MySQL)

Exemplo de URLs:
```bash
# Vercel Postgres
DATABASE_URL="postgres://username:password@hostname:port/database"

# PlanetScale
DATABASE_URL="mysql://username:password@hostname:port/database?sslaccept=strict"

# Supabase
DATABASE_URL="postgresql://username:password@hostname:port/database"
```

## Deploy Manual

### 1. **Deploy para Vercel**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 2. **Configurar Database**
```bash
# Gerar Prisma Client
npx prisma generate

# Aplicar schema
npx prisma db push

# Seed inicial (opcional)
npm run db:seed
```

## Deploy Automático

### **Push para Main Branch**
```bash
git push origin main
```
- ✅ Executa todos os testes
- ✅ Build de produção
- ✅ Deploy automático para Vercel
- ✅ Aplica migrações do banco

### **Pull Request**
```bash
git push origin feature-branch
# Criar PR no GitHub
```
- ✅ Executa testes
- ✅ Deploy preview
- ✅ Comentário automático com URL
- ✅ Lighthouse audit

## Monitoramento

### **Health Check**
```bash
curl https://your-domain.vercel.app/health
```

### **Logs**
```bash
# Vercel logs
vercel logs

# GitHub Actions logs
# Acesse: GitHub > Actions > Workflow runs
```

## Troubleshooting

### **Build Failures**
1. Verificar variáveis de ambiente
2. Verificar dependências no package.json
3. Verificar logs do GitHub Actions

### **Database Issues**
1. Verificar DATABASE_URL
2. Verificar conexão de rede
3. Executar `npx prisma db push`

### **Deploy Issues**
1. Verificar VERCEL_TOKEN
2. Verificar permissões do projeto
3. Verificar logs do Vercel

## Performance

### **Otimizações Aplicadas**
- ✅ Static Site Generation (SSG)
- ✅ Image Optimization
- ✅ Bundle Splitting
- ✅ Caching Headers
- ✅ Compression

### **Lighthouse Scores Target**
- **Performance**: > 80
- **Accessibility**: > 90  
- **Best Practices**: > 90
- **SEO**: > 80

## Security

### **Headers de Segurança**
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ Referrer-Policy: strict-origin-when-cross-origin
- ✅ Permissions-Policy configurado

### **Environment Variables**
- ✅ Secrets seguros no GitHub
- ✅ Variáveis de ambiente na Vercel
- ✅ Não exposição de chaves privadas

---

**🎉 Com essa configuração, o Chronos System está pronto para produção enterprise!**
