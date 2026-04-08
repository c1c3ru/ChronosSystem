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

#### 1c. Environment Pull
```yaml
# deploy.yml:38
- name: Pull Vercel Environment Information
  run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
```

#### 1d. Production Build
```yaml
# deploy.yml:45
- name: Build Project Artifacts
  run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
```

#### 1e. Production Deployment
```yaml
# deploy.yml:51
- name: Deploy Project Artifacts to Vercel
  run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

#### 1f. Post-Deploy Database Operations
```yaml
# deploy.yml:58
- name: Run Database Migrations (Production)
  run: npx prisma db push
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### 2. Preview Deployment System

#### 2a. GitHub Actions Workflow Trigger
```yaml
# deploy.yml:65
deploy-preview:
  name: Deploy Preview
  runs-on: ubuntu-latest
  if: github.event_name == 'pull_request'
```

#### 2b. Preview Environment Setup
```yaml
# deploy.yml:87
- name: Pull Vercel Environment Information
  run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}
```

#### 2c. Preview Deployment Process
```yaml
# deploy.yml:101
- name: Deploy Project Artifacts to Vercel (Preview)
  id: deploy-preview
  run: |
    url=$(vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }})
    echo "preview-url=$url" >> $GITHUB_OUTPUT
```

#### 2d. URL Output
```yaml
# deploy.yml:102
echo "preview-url=$url" >> $GITHUB_OUTPUT
```

#### 2e. Pull Request Integration - PR Comment
```yaml
# deploy.yml:124
- name: Comment PR with Preview URL
  uses: actions/github-script@v7
  with:
    script: |
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: comment
      });
```

### 3. Environment Management System

#### 3a. Required GitHub Secrets
```bash
# VERCEL_SETUP.md:35
VERCEL_TOKEN: vercel_xxx...     # Token gerado no Vercel
VERCEL_ORG_ID: team_xxx...      # ID da organização
VERCEL_PROJECT_ID: prj_xxx...   # ID do projeto
DATABASE_URL: postgresql://...  # URL do banco PostgreSQL
```

#### 3b. Secret Injection
```yaml
# deploy.yml:39
env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

#### 3c. Vercel Environment Configuration
```json
# vercel.json:13
"env": {
  "NEXTAUTH_URL": "https://chronos-system.vercel.app",
  "NODE_ENV": "production"
}
```

#### 3d. Next.js Configuration
```javascript
# next.config.js:22
env: {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000'
}
```

#### 3e. Auth Secret Usage
```typescript
# auth.ts:231
secret: process.env.NEXTAUTH_SECRET,
```

### 4. CI/CD Testing Pipeline

#### 4a. Workflow Trigger Setup
```yaml
# ci.yml:3
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
```

#### 4b. Type Checking
```yaml
# ci.yml:31
- name: Type check
  run: npm run type-check
```

#### 4c. Test Database Setup
```yaml
# ci.yml:41
- name: Setup test database
  run: npx prisma db push --force-reset
  env:
    DATABASE_URL: file:./test.db
```

#### 4d. Unit Tests
```yaml
# ci.yml:47
- name: Run unit tests
  run: npm run test:coverage
```

#### 4e. E2E Tests
```yaml
# ci.yml:91
- name: Run E2E tests
  run: npm run test:e2e
```

#### 4f. Build Validation
```yaml
# ci.yml:127
- name: Build application
  run: npm run build
```

## 🔧 Configuration Files

### Vercel Configuration (vercel.json)
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "framework": "nextjs",
  "regions": ["gru1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NEXTAUTH_URL": "https://chronos-system.vercel.app",
    "NODE_ENV": "production"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=*, microphone=*, geolocation=*"
        }
      ]
    }
  ]
}
```

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "prisma generate && next build",
    "postinstall": "prisma generate",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts"
  }
}
```

## 🚀 Deployment Process

### Production Deployment Flow
1. **Push to main** → Triggers production deployment
2. **Environment pull** → Gets production config from Vercel
3. **Build artifacts** → Creates optimized production build
4. **Deploy to Vercel** → Deploys to production domain
5. **Database migrations** → Updates production database schema

### Preview Deployment Flow
1. **Create PR** → Triggers preview deployment
2. **Environment pull** → Gets preview config from Vercel
3. **Build artifacts** → Creates preview build
4. **Deploy preview** → Creates unique preview URL
5. **Comment on PR** → Adds preview URL to PR comments

## 🔐 Security Configuration

### Environment Variables
```bash
# Production (Vercel Dashboard)
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=production-secret-key
NEXTAUTH_URL=https://chronos-system.vercel.app
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
QR_SECRET=production-qr-secret

# GitHub Secrets
VERCEL_TOKEN=vercel_xxx...
VERCEL_ORG_ID=team_xxx...
VERCEL_PROJECT_ID=prj_xxx...
```

### Security Headers
```json
{
  "headers": [
    {
      "key": "X-Frame-Options",
      "value": "DENY"
    },
    {
      "key": "X-Content-Type-Options",
      "value": "nosniff"
    },
    {
      "key": "Referrer-Policy",
      "value": "strict-origin-when-cross-origin"
    },
    {
      "key": "Permissions-Policy",
      "value": "camera=*, microphone=*, geolocation=*"
    }
  ]
}
```

## 📊 Monitoring & Analytics

### Build Monitoring
- GitHub Actions logs
- Vercel deployment logs
- Build time metrics
- Bundle size analysis

### Runtime Monitoring
- Vercel Analytics
- Error tracking
- Performance metrics
- Database connection monitoring

## 🔄 Rollback Strategy

### Automatic Rollback
```bash
# Vercel CLI
vercel rollback [deployment-url] --token=$VERCEL_TOKEN
```

### Manual Rollback
1. Access Vercel Dashboard
2. Navigate to Deployments
3. Select previous stable deployment
4. Click "Promote to Production"

## 🧪 Testing Strategy

### Pre-deployment Tests
- Unit tests with Jest
- Integration tests
- E2E tests with Playwright
- Type checking with TypeScript
- Linting with ESLint

### Post-deployment Tests
- Health check endpoints
- Database connectivity
- Authentication flow
- QR code generation
- Camera permissions

## 📈 Performance Optimization

### Build Optimizations
```javascript
// next.config.js
{
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  }
}
```

### Caching Strategy
```json
{
  "headers": [
    {
      "source": "/_next/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## 🚨 Troubleshooting

### Common Issues
1. **Build failures** → Check dependencies and environment variables
2. **Database connection** → Verify DATABASE_URL and network access
3. **Authentication issues** → Check NEXTAUTH_SECRET and OAuth config
4. **Preview deployment fails** → Verify PR permissions and secrets

### Debug Commands
```bash
# Local debugging
npm run build
npm run test:coverage
npm run type-check

# Vercel debugging
vercel logs [deployment-url]
vercel env ls
vercel domains ls
```

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

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
