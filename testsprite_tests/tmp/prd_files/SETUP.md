# 🚀 Guia de Instalação e Configuração

## Pré-requisitos

Certifique-se de ter instalado:

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **Docker** >= 24.0.0
- **Docker Compose** >= 2.0.0

## 📦 Instalação Rápida com Docker

### 1. Clone o repositório

```bash
git clone <repo-url>
cd personal-website
```

### 2. Configure as variáveis de ambiente

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend Admin
cp frontend-admin/.env.example frontend-admin/.env

# PWA Estagiário
cp pwa-estagiario/.env.example pwa-estagiario/.env

# Kiosk
cp kiosk/.env.example kiosk/.env
```

### 3. Edite os arquivos .env

**backend/.env:**

```env
DATABASE_URL="postgresql://ponto_user:ponto_password_dev@postgres:5432/ponto_db"
REDIS_URL="redis://redis:6379"
JWT_SECRET="sua-chave-jwt-super-secreta-aqui"
JWT_REFRESH_SECRET="sua-chave-refresh-super-secreta-aqui"
HMAC_SECRET="sua-chave-hmac-para-qr-codes-aqui"
GOOGLE_CLIENT_ID="seu-google-client-id"
GOOGLE_CLIENT_SECRET="seu-google-client-secret"
```

**frontend-admin/.env:**

```env
VITE_API_URL=http://localhost:4000/api
VITE_GOOGLE_CLIENT_ID=seu-google-client-id
```

**pwa-estagiario/.env:**

```env
VITE_API_URL=http://localhost:4000/api
```

**kiosk/.env:**

```env
VITE_API_URL=http://localhost:4000/api
VITE_MACHINE_ID=MACHINE_001
```

### 4. Inicie os serviços

```bash
docker-compose up -d
```

### 5. Execute as migrações e seed

```bash
# Entrar no container do backend
docker exec -it ponto-backend sh

# Executar migrações
npm run prisma:migrate

# Popular banco de dados
npm run prisma:seed

# Sair do container
exit
```

### 6. Acesse as aplicações

- **Admin Dashboard**: http://localhost:3000
- **API Backend**: http://localhost:4000
- **PWA Estagiário**: http://localhost:3001
- **Kiosk**: http://localhost:3002

## 🔐 Credenciais de Teste

Após executar o seed, você terá:

### Admin

- **Email**: admin@ponto.com
- **Senha**: admin123

### Supervisor

- **Email**: supervisor@ponto.com
- **Senha**: supervisor123

### Estagiário

- **Email**: estagiario@ponto.com
- **Senha**: estagio123

## 📱 Instalação Manual (sem Docker)

### Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar .env
cp .env.example .env
# Edite o .env com suas configurações

# Gerar Prisma Client
npm run prisma:generate

# Executar migrações
npm run prisma:migrate

# Popular banco
npm run prisma:seed

# Iniciar servidor
npm run start:dev
```

### Frontend Admin

```bash
cd frontend-admin

# Instalar dependências
npm install

# Configurar .env
cp .env.example .env

# Iniciar dev server
npm run dev
```

### PWA Estagiário

```bash
cd pwa-estagiario

# Instalar dependências
npm install

# Configurar .env
cp .env.example .env

# Iniciar dev server
npm run dev
```

### Kiosk

```bash
cd kiosk

# Instalar dependências
npm install

# Configurar .env
cp .env.example .env

# Iniciar dev server
npm run dev
```

## 🔧 Configuração do Google OAuth

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API do Google+
4. Vá em "Credenciais" e crie um "ID do cliente OAuth 2.0"
5. Configure as URLs de redirecionamento:
   - `http://localhost:4000/api/auth/google/callback`
   - `http://localhost:3000/auth/callback`
6. Copie o Client ID e Client Secret para os arquivos .env

## 🗄️ Banco de Dados

### PostgreSQL

O sistema usa PostgreSQL 16. Se estiver usando Docker, o banco já está configurado.

Para instalação manual:

```bash
# Ubuntu/Debian
sudo apt install postgresql-16

# macOS
brew install postgresql@16

# Criar banco
createdb ponto_db
```

### Redis

Redis é usado para cache e armazenamento de nonces.

```bash
# Ubuntu/Debian
sudo apt install redis-server

# macOS
brew install redis

# Iniciar Redis
redis-server
```

## 🧪 Testes

```bash
# Backend
cd backend
npm test
npm run test:e2e
npm run test:cov

# Frontend
cd frontend-admin
npm test
```

## 🚀 Deploy em Produção

### Variáveis de Ambiente de Produção

Certifique-se de configurar:

- `NODE_ENV=production`
- Chaves JWT fortes e únicas
- URLs corretas de frontend/backend
- Credenciais de banco de dados seguras
- Configurar HTTPS/TLS

### Build de Produção

```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend Admin
cd frontend-admin
npm run build
# Servir pasta dist/ com nginx ou similar

# PWA
cd pwa-estagiario
npm run build

# Kiosk
cd kiosk
npm run build
```

## 📊 Monitoramento

### Health Check

```bash
curl http://localhost:4000/api/health
```

### Logs

```bash
# Docker
docker-compose logs -f backend

# Manual
# Logs estarão em stdout
```

## 🔒 Segurança

### Checklist de Segurança

- [ ] Alterar todas as senhas padrão
- [ ] Usar HTTPS em produção
- [ ] Configurar CORS adequadamente
- [ ] Rotacionar chaves JWT regularmente
- [ ] Habilitar rate limiting
- [ ] Configurar firewall
- [ ] Backup regular do banco de dados
- [ ] Monitorar logs de auditoria

## 🐛 Troubleshooting

### Erro de conexão com banco de dados

```bash
# Verificar se o PostgreSQL está rodando
docker ps | grep postgres

# Ver logs
docker logs ponto-postgres
```

### Erro de conexão com Redis

```bash
# Verificar se o Redis está rodando
docker ps | grep redis

# Testar conexão
redis-cli ping
```

### Erro ao gerar QR Code

- Verifique se o HMAC_SECRET está configurado
- Verifique se a máquina existe no banco
- Verifique logs do backend

### PWA não funciona offline

- Certifique-se de que está usando HTTPS (ou localhost)
- Limpe o cache do navegador
- Verifique se o service worker está registrado

## 📞 Suporte

Para problemas ou dúvidas:

1. Verifique a documentação
2. Consulte os logs
3. Abra uma issue no GitHub
4. Entre em contato com o time de desenvolvimento

## 🔄 Atualizações

Para atualizar o sistema:

```bash
# Parar serviços
docker-compose down

# Atualizar código
git pull

# Reconstruir containers
docker-compose build

# Executar migrações
docker exec -it ponto-backend npm run prisma:migrate

# Reiniciar serviços
docker-compose up -d
```
