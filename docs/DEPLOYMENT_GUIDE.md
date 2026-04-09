# 🚀 Guia Completo de Deploy - ChronosSystem

Este guia unifica todas as instruções de deploy para o ChronosSystem, cobrindo tanto a infraestrutura em nuvem (Vercel) quanto servidores próprios (Nginx/Apache).

## 📋 Índice

1. [Deploy na Vercel (Recomendado)](#1-deploy-na-vercel-recomendado)
2. [Deploy Automático com GitHub Actions](#2-deploy-automático-com-github-actions)
3. [Deploy em Servidor Próprio (Nginx/Apache)](#3-deploy-em-servidor-próprio-nginxapache)
4. [Configuração de Banco de Dados](#4-configuração-de-banco-de-dados)
5. [Troubleshooting](#5-troubleshooting)

---

## 1. Deploy na Vercel (Recomendado)

A Vercel é a plataforma recomendada para o ChronosSystem devido à sua integração nativa com Next.js.

### Pré-requisitos

- Conta na Vercel
- Repositório no GitHub/GitLab/Bitbucket
- Banco de dados PostgreSQL hospedado (ex: Neon, Supabase, Vercel Postgres)

### Passo a Passo

1. **Importar Projeto**
   - Acesse o dashboard da Vercel
   - Clique em "Add New..." > "Project"
   - Selecione seu repositório git

2. **Configurar Variáveis de Ambiente**
   Configure as seguintes variáveis nas configurações do projeto:

   ```bash
   # Autenticação
   NEXTAUTH_URL=https://seu-projeto.vercel.app
   NEXTAUTH_SECRET=sua-chave-secreta-super-segura-minimo-32-caracteres

   # Google OAuth
   GOOGLE_CLIENT_ID=seu_client_id
   GOOGLE_CLIENT_SECRET=seu_client_secret

   # Banco de Dados
   DATABASE_URL=postgres://user:password@host:5432/database?sslmode=require

   # Segurança QR Code
   QR_SECRET=sua_chave_secreta_qr

   # Configurações Gerais
   NODE_ENV=production
   NEXT_TELEMETRY_DISABLED=1
   ```

3. **Deploy**
   - Clique em "Deploy"
   - A Vercel detectará automaticamente que é um projeto Next.js e configurará o build

---

## 2. Deploy Automático com GitHub Actions

Para automatizar o deploy a cada push na branch `main`.

### Configurar Secrets no GitHub

Acesse: **Settings → Secrets and variables → Actions**

Adicione os seguintes secrets:

- `VERCEL_TOKEN`: Seu token de API da Vercel
- `VERCEL_ORG_ID`: ID da organização
- `VERCEL_PROJECT_ID`: ID do projeto
- `DATABASE_URL`: URL de conexão do banco de produção

### Workflow

O arquivo `.github/workflows/deploy.yml` já está configurado para realizar o deploy automaticamente.

---

## 3. Deploy em Servidor Próprio (Nginx/Apache)

Para hospedar em sua própria infraestrutura (VPS, On-premise).

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Redis (opcional, para cache/sessões)
- PM2 (gerenciador de processos)

### Instalação

1. **Preparar o Servidor**

   ```bash
   # Instalar dependências básicas
   sudo apt update
   sudo apt install -y curl git nginx nodejs npm postgresql

   # Instalar PM2
   sudo npm install -g pm2
   ```

2. **Configurar Aplicação**

   ```bash
   # Clonar repositório
   git clone https://github.com/seu-usuario/chronos-system.git
   cd chronos-system

   # Instalar dependências
   npm install

   # Configurar ambiente
   cp .env.example .env
   # Edite o .env com suas configurações

   # Build
   npm run build

   # Migrações do banco
   npx prisma migrate deploy
   ```

3. **Iniciar Aplicação**

   ```bash
   pm2 start npm --name "chronos-system" -- start
   pm2 save
   pm2 startup
   ```

4. **Configurar Nginx (Reverse Proxy)**
   Crie o arquivo `/etc/nginx/sites-available/chronos`:

   ```nginx
   server {
       listen 80;
       server_name seu-dominio.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Ative o site:

   ```bash
   sudo ln -s /etc/nginx/sites-available/chronos /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

## 4. Configuração de Banco de Dados

### PostgreSQL

1. **Criar Banco e Usuário**

   ```sql
   CREATE USER chronos WITH PASSWORD 'senha_segura';
   CREATE DATABASE chronos_db;
   GRANT ALL PRIVILEGES ON DATABASE chronos_db TO chronos;
   ```

2. **String de Conexão**
   ```
   DATABASE_URL="postgresql://chronos:senha_segura@localhost:5432/chronos_db?schema=public"
   ```

---

## 5. Troubleshooting

### Erros Comuns

1. **Erro de Build (Prisma)**
   - Execute `npx prisma generate` antes do build
   - Verifique se a `DATABASE_URL` está correta

2. **Erro 500 no Deploy**
   - Verifique os logs: `pm2 logs chronos-system` ou logs da Vercel
   - Verifique se todas as variáveis de ambiente estão definidas

3. **Google OAuth Falhando**
   - Verifique se a URL de callback está autorizada no Google Cloud Console
   - Formato: `https://seu-dominio.com/api/auth/callback/google`

### Comandos Úteis

```bash
# Verificar status do banco
npx prisma status

# Verificar integridade do schema
npx prisma validate

# Limpar cache do Next.js
rm -rf .next
```

---

**Suporte:** Para problemas não listados, consulte a documentação oficial do Next.js ou abra uma issue no repositório.
