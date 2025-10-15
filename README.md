# 🚀 Sistema de Registro de Ponto - Estagiários

Sistema completo de registro de ponto eletrônico com QR code rotativo, autenticação segura e auditoria imutável.

## 📋 Visão Geral

Sistema modular composto por:

- **Backend API** - NestJS + PostgreSQL + Prisma
- **Admin Dashboard** - React + TypeScript + Tailwind + shadcn/ui
- **PWA Estagiário** - React PWA para registro de ponto
- **Kiosk** - Interface web fullscreen para exibição de QR code

## 🎯 Funcionalidades Principais

### Segurança
- ✅ QR code rotativo a cada 60 segundos
- ✅ Assinatura HMAC-SHA256 para autenticidade
- ✅ Proteção contra replay attacks (nonce único)
- ✅ Hash chain imutável para auditoria
- ✅ Autenticação JWT + Google OAuth + 2FA
- ✅ Geolocalização e verificação de foto (opcional)

### Módulos
- **Admin**: Gestão de usuários, máquinas, relatórios e auditoria
- **Estagiário**: Escaneamento de QR, registro de ponto, histórico
- **Kiosk**: Geração e exibição de QR code assinado

## 🛠️ Stack Tecnológica

### Backend
- Node.js 20+
- NestJS (Framework)
- PostgreSQL (Database)
- Prisma ORM
- Redis (Cache & Nonces)
- JWT + Passport
- node:crypto (HMAC)

### Frontend
- React 18 + TypeScript
- Vite (Build tool)
- Tailwind CSS
- shadcn/ui (Componentes)
- Framer Motion (Animações)
- React Query (TanStack)
- Zod (Validação)

### DevOps
- Docker + Docker Compose
- GitHub Actions (CI/CD)
- Vitest + Playwright (Testes)
- Sentry (Monitoramento)

## 🚀 Quick Start

### Pré-requisitos
```bash
node >= 20.0.0
npm >= 10.0.0
docker >= 24.0.0
docker-compose >= 2.0.0
```

### Instalação

1. **Clone o repositório**
```bash
git clone <repo-url>
cd personal-website
```

2. **Configure as variáveis de ambiente**
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

3. **Inicie os serviços com Docker**
```bash
docker-compose up -d
```

4. **Execute as migrações**
```bash
cd backend
npm run prisma:migrate
npm run prisma:seed
```

5. **Acesse as aplicações**
- Admin Dashboard: http://localhost:3000
- API Backend: http://localhost:4000
- PWA Estagiário: http://localhost:3001
- Kiosk: http://localhost:3002

## 📁 Estrutura do Projeto

```
.
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── auth/           # Autenticação (JWT, OAuth, 2FA)
│   │   ├── users/          # Gestão de usuários
│   │   ├── machines/       # Máquinas de ponto
│   │   ├── attendance/     # Registros de ponto
│   │   ├── qr/             # Geração e validação de QR
│   │   ├── audit/          # Logs de auditoria
│   │   └── common/         # Utilitários e guards
│   ├── prisma/
│   │   └── schema.prisma
│   └── test/
│
├── frontend-admin/          # Dashboard Admin
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Páginas
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilitários
│   │   └── styles/         # Estilos e tokens
│   └── public/
│
├── pwa-estagiario/         # PWA para estagiários
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── lib/
│   └── public/
│
├── kiosk/                  # Interface Kiosk
│   ├── src/
│   │   ├── components/
│   │   └── lib/
│   └── public/
│
├── docker-compose.yml
└── README.md
```

## 🔐 Segurança

### Payload do QR Code
```json
{
  "machine_id": "MACHINE_001",
  "ts": "2025-10-15T12:00:00Z",
  "exp": 60,
  "nonce": "a1b2c3d4",
  "version": "v1"
}
```

### Formato Final
```
QR = base64url(payload) + "." + base64url(HMAC-SHA256(secret, payload))
```

### Validação Backend
1. Recalcula HMAC e compara com signature
2. Verifica timestamp e expiração
3. Valida nonce único (anti-replay)
4. Registra com hash encadeado

## 🧪 Testes

```bash
# Backend
cd backend
npm run test              # Unit tests
npm run test:e2e          # E2E tests
npm run test:cov          # Coverage

# Frontend
cd frontend-admin
npm run test              # Unit tests
npm run test:e2e          # Playwright E2E
```

## 📊 Monitoramento

- **Logs**: Pino (structured logging)
- **Métricas**: Prometheus
- **Errors**: Sentry
- **Health**: `/api/health`

## 🎨 Design Tokens

```json
{
  "color": {
    "primary": "#10B981",
    "primary-600": "#059669",
    "bg": "#0F172A",
    "surface": "#0B1220",
    "text": "#FFFFFF",
    "muted": "#9CA3AF"
  },
  "radius": {
    "sm": "6px",
    "md": "12px",
    "lg": "20px"
  },
  "shadow": {
    "md": "0 8px 30px rgba(2,6,23,0.6)"
  }
}
```

## 📝 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login com email/senha
- `POST /api/auth/google` - Login com Google
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/2fa/enable` - Habilitar 2FA
- `POST /api/auth/2fa/verify` - Verificar código 2FA

### Admin
- `GET /api/admin/users` - Listar usuários
- `POST /api/admin/users` - Criar usuário
- `GET /api/admin/machines` - Listar máquinas
- `POST /api/admin/machines` - Criar máquina
- `GET /api/admin/reports` - Relatórios
- `GET /api/audit/logs` - Logs de auditoria

### Registro de Ponto
- `POST /api/attendance/scan` - Registrar ponto via QR
- `GET /api/attendance/user/:id` - Histórico do usuário
- `POST /api/attendance/correction` - Solicitar correção

### Máquina
- `GET /api/machine/:id/qr` - Obter QR atual
- `POST /api/machine/:id/generate` - Forçar nova geração

## 🔄 CI/CD

GitHub Actions configurado para:
- ✅ Lint e formatação
- ✅ Testes unitários e E2E
- ✅ Build e validação
- ✅ Deploy automático (staging/production)

## 📄 Licença

MIT

## 👥 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📞 Suporte

Para questões e suporte, abra uma issue no GitHub.
