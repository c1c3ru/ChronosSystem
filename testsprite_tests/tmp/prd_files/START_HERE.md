# 🎯 COMECE AQUI - Sistema de Ponto

## ⚠️ IMPORTANTE: Instalação das Dependências

**ANTES DE FAZER QUALQUER COISA**, você precisa instalar as dependências de todos os módulos.

### Opção 1: Script Automático (Recomendado)

```bash
chmod +x install.sh
./install.sh
```

### Opção 2: Manual

```bash
# Backend
cd backend
npm install
cd ..

# Frontend Admin
cd frontend-admin
npm install
cd ..

# PWA Estagiário
cd pwa-estagiario
npm install
cd ..

# Kiosk
cd kiosk
npm install
cd ..
```

## 🐳 Iniciar com Docker (Mais Fácil)

```bash
# 1. Copiar arquivos de ambiente
cp backend/.env.example backend/.env
cp frontend-admin/.env.example frontend-admin/.env
cp pwa-estagiario/.env.example pwa-estagiario/.env
cp kiosk/.env.example kiosk/.env

# 2. Editar backend/.env e adicionar suas chaves secretas
# Mínimo necessário:
# JWT_SECRET=sua-chave-secreta-aqui
# JWT_REFRESH_SECRET=outra-chave-secreta-aqui
# HMAC_SECRET=chave-para-qr-codes-aqui

# 3. Iniciar todos os serviços
docker-compose up -d

# 4. Executar migrações do banco
docker exec -it ponto-backend npm run prisma:migrate

# 5. Popular banco com dados de teste
docker exec -it ponto-backend npm run prisma:seed
```

## 💻 Iniciar Manualmente (Sem Docker)

### 1. PostgreSQL e Redis

Você precisa ter PostgreSQL e Redis rodando:

```bash
# PostgreSQL (porta 5432)
# Redis (porta 6379)
```

### 2. Backend

```bash
cd backend

# Configurar .env
cp .env.example .env
# Edite .env com suas configurações

# Instalar dependências (se ainda não fez)
npm install

# Gerar Prisma Client
npx prisma generate

# Executar migrações
npx prisma migrate deploy

# Popular banco
npx prisma db seed

# Iniciar servidor
npm run start:dev
```

### 3. Frontend Admin

```bash
cd frontend-admin

# Configurar .env
cp .env.example .env

# Instalar dependências (se ainda não fez)
npm install

# Iniciar
npm run dev
```

### 4. PWA Estagiário

```bash
cd pwa-estagiario

# Configurar .env
cp .env.example .env

# Instalar dependências (se ainda não fez)
npm install

# Iniciar
npm run dev
```

### 5. Kiosk

```bash
cd kiosk

# Configurar .env
cp .env.example .env
# Edite e defina VITE_MACHINE_ID=MACHINE_001

# Instalar dependências (se ainda não fez)
npm install

# Iniciar
npm run dev
```

## 🌐 Acessar as Aplicações

| Aplicação | URL | Credenciais |
|-----------|-----|-------------|
| **Admin** | http://localhost:3000 | admin@ponto.com / admin123 |
| **PWA** | http://localhost:3001 | estagiario@ponto.com / estagio123 |
| **Kiosk** | http://localhost:3002 | - |
| **API** | http://localhost:4000/api | - |

## 🧪 Testar o Sistema

1. **Abra o Kiosk** (http://localhost:3002)
   - Você verá um QR code

2. **Abra o PWA** (http://localhost:3001)
   - Faça login com: estagiario@ponto.com / estagio123
   - Clique em "Escanear QR Code"
   - Escaneie o QR do Kiosk (ou use uma ferramenta de QR virtual)

3. **Verifique no Admin** (http://localhost:3000)
   - Faça login com: admin@ponto.com / admin123
   - Vá em "Registros" para ver o ponto registrado

## ❌ Erros Comuns

### "Cannot find module"

**Solução:** Você esqueceu de instalar as dependências!

```bash
cd [pasta-do-projeto]
npm install
```

### "Port already in use"

**Solução:** Algum serviço já está usando a porta.

```bash
# Descobrir qual processo está usando a porta
lsof -i :3000  # ou :3001, :3002, :4000

# Matar o processo
kill -9 <PID>
```

### Erro de conexão com banco de dados

**Solução:** PostgreSQL não está rodando ou URL está errada.

```bash
# Verificar se PostgreSQL está rodando
docker ps | grep postgres

# Ou se instalado localmente
pg_isready
```

### QR code não funciona

**Solução:** 
1. Verifique se o backend está rodando
2. Verifique se o HMAC_SECRET está configurado no .env
3. Veja os logs: `docker logs ponto-backend`

## 📚 Documentação Completa

- **README.md** - Visão geral do projeto
- **QUICKSTART.md** - Guia rápido (5 minutos)
- **SETUP.md** - Instalação detalhada
- **ARCHITECTURE.md** - Arquitetura do sistema
- **SECURITY.md** - Documentação de segurança
- **API.md** - Documentação da API REST
- **PROJECT_SUMMARY.md** - Resumo completo

## 🆘 Precisa de Ajuda?

1. Verifique se instalou TODAS as dependências
2. Verifique se PostgreSQL e Redis estão rodando
3. Verifique os logs dos serviços
4. Consulte a documentação acima
5. Abra uma issue no GitHub

## ✅ Checklist de Instalação

- [ ] Instalei Node.js 20+
- [ ] Instalei Docker (se for usar Docker)
- [ ] Clonei o repositório
- [ ] Executei `npm install` em TODOS os 4 módulos
- [ ] Copiei os arquivos .env.example para .env
- [ ] Editei os arquivos .env com minhas configurações
- [ ] PostgreSQL está rodando
- [ ] Redis está rodando (se não usar Docker)
- [ ] Executei as migrações do Prisma
- [ ] Executei o seed do banco
- [ ] Todos os serviços estão rodando sem erros

## 🚀 Pronto!

Se você seguiu todos os passos acima, o sistema deve estar funcionando perfeitamente!

**Dica:** Use o VS Code com as extensões TypeScript, Prisma, Tailwind CSS e ESLint para melhor experiência de desenvolvimento.
