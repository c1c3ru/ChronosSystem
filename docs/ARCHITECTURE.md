# 🏗️ Arquitetura do Sistema

## Visão Geral

O sistema de registro de ponto é composto por 4 módulos principais:

```
┌─────────────────────────────────────────────────────────────┐
│                     Sistema de Ponto                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Frontend   │  │     PWA      │  │    Kiosk     │      │
│  │    Admin     │  │  Estagiário  │  │   Máquina    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │               │
│         └──────────────────┼──────────────────┘               │
│                            │                                  │
│                    ┌───────▼────────┐                        │
│                    │   API Backend  │                        │
│                    │    (NestJS)    │                        │
│                    └───────┬────────┘                        │
│                            │                                  │
│              ┌─────────────┼─────────────┐                   │
│              │             │             │                   │
│         ┌────▼────┐   ┌───▼────┐   ┌───▼────┐              │
│         │PostgreSQL│   │ Redis  │   │  S3    │              │
│         │   DB     │   │ Cache  │   │Storage │              │
│         └──────────┘   └────────┘   └────────┘              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Módulos

### 1. Backend API (NestJS)

**Responsabilidades:**
- Autenticação e autorização (JWT + OAuth)
- Geração e validação de QR codes com HMAC
- Gerenciamento de usuários e máquinas
- Registro de pontos com hash chain
- Auditoria e logs
- API RESTful

**Stack:**
- NestJS (Framework)
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis
- Passport (Auth)
- node:crypto (HMAC)

**Estrutura:**
```
backend/
├── src/
│   ├── auth/          # Autenticação (JWT, OAuth, 2FA)
│   ├── users/         # CRUD de usuários
│   ├── machines/      # Gerenciamento de máquinas
│   ├── qr/            # Geração/validação de QR
│   ├── attendance/    # Registros de ponto
│   ├── audit/         # Logs de auditoria
│   ├── prisma/        # Database service
│   └── redis/         # Cache service
├── prisma/
│   ├── schema.prisma  # Schema do banco
│   └── seed.ts        # Dados iniciais
└── test/              # Testes
```

### 2. Frontend Admin (React)

**Responsabilidades:**
- Dashboard administrativo
- Gerenciamento de usuários e máquinas
- Visualização de relatórios
- Logs de auditoria
- Configurações do sistema

**Stack:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Framer Motion
- React Query
- React Router

**Páginas:**
- `/dashboard` - Visão geral
- `/users` - Gerenciar usuários
- `/machines` - Gerenciar máquinas
- `/attendance` - Registros de ponto
- `/reports` - Relatórios
- `/audit` - Logs de auditoria

### 3. PWA Estagiário (React PWA)

**Responsabilidades:**
- Escaneamento de QR code
- Registro de entrada/saída
- Histórico pessoal
- Funciona offline (cache)

**Stack:**
- React 18
- TypeScript
- Vite PWA Plugin
- Tailwind CSS
- html5-qrcode
- Geolocation API

**Fluxo:**
1. Login
2. Ver próxima ação (ENTRADA/SAÍDA)
3. Escanear QR code
4. Capturar geolocalização
5. Enviar para backend
6. Confirmar registro

### 4. Kiosk (React)

**Responsabilidades:**
- Exibir QR code rotativo
- Mostrar relógio em tempo real
- Interface fullscreen
- Atualização automática

**Stack:**
- React 18
- TypeScript
- qrcode.react
- Framer Motion

**Características:**
- QR code atualiza a cada 60s
- Relógio em tempo real
- Status de conectividade
- Design minimalista

## Fluxo de Dados

### Registro de Ponto

```
1. Kiosk solicita QR code ao backend
   GET /api/machines/:id/qr

2. Backend gera payload + HMAC
   {
     machine_id: "MACHINE_001",
     ts: "2025-10-15T12:00:00Z",
     exp: 60,
     nonce: "a1b2c3d4",
     version: "v1"
   }
   signature = HMAC-SHA256(secret, payload)
   qr = base64url(payload) + "." + base64url(signature)

3. Kiosk exibe QR code

4. Estagiário escaneia QR via PWA

5. PWA captura geolocalização

6. PWA envia para backend
   POST /api/attendance/scan
   {
     qrData: "...",
     type: "ENTRADA",
     geoLat: -23.5505,
     geoLng: -46.6333
   }

7. Backend valida:
   - Recalcula HMAC
   - Verifica timestamp
   - Valida nonce único
   - Verifica sequência ENTRADA/SAÍDA

8. Backend registra com hash chain:
   - Busca último registro (prevHash)
   - Cria novo registro
   - Calcula recordHash
   - Salva no banco

9. Backend consome nonce (anti-replay)

10. Retorna sucesso para PWA
```

## Segurança

### Camadas de Segurança

1. **QR Code Assinado (HMAC-SHA256)**
   - Payload + assinatura
   - Impossível falsificar sem a chave secreta
   - Validação no backend

2. **Nonce Único (Anti-Replay)**
   - Cada QR tem nonce único
   - Armazenado no Redis com TTL
   - Não pode ser reutilizado

3. **Timestamp + Expiração**
   - QR válido por 60 segundos
   - Verificação de janela de tempo

4. **Hash Chain (Auditoria)**
   - Cada registro tem hash do anterior
   - Cadeia imutável
   - Detecta alterações

5. **Autenticação JWT**
   - Access token (15min)
   - Refresh token (7 dias)
   - Armazenamento seguro

6. **2FA (Opcional)**
   - TOTP (Time-based OTP)
   - QR code para configuração
   - Código de 6 dígitos

7. **Geolocalização (Opcional)**
   - Verifica proximidade
   - Armazena coordenadas
   - Previne registros remotos

## Banco de Dados

### Schema Principal

```prisma
User
├── id (UUID)
├── email (unique)
├── password (hashed)
├── role (ADMIN|SUPERVISOR|ESTAGIARIO|AUDIT)
├── googleId (OAuth)
├── twoFactorSecret
└── twoFactorEnabled

Machine
├── id (UUID)
├── name
├── location
├── publicId (unique)
└── isActive

AttendanceRecord
├── id (UUID)
├── userId (FK)
├── machineId (FK)
├── type (ENTRADA|SAIDA)
├── tsClient
├── tsServer
├── nonce (unique)
├── geoLat, geoLng
├── prevHash
└── recordHash (SHA-256)

MachineQrEvent
├── id (UUID)
├── machineId (FK)
├── payload
├── signature
├── nonce
└── expiresAt

Nonce (Redis + DB)
├── machineId
├── nonce
└── expiresAt

AuditLog
├── id (UUID)
├── actorId (FK)
├── action
├── resource
└── ts
```

## Performance

### Otimizações

1. **Redis Cache**
   - Nonces com TTL
   - Rate limiting
   - Session storage

2. **Database Indexes**
   - userId, machineId, tsServer
   - nonce (unique)
   - email, googleId

3. **Query Optimization**
   - Prisma select específico
   - Paginação
   - Eager loading

4. **Frontend**
   - Code splitting
   - Lazy loading
   - React Query cache
   - PWA offline cache

## Escalabilidade

### Horizontal Scaling

- Backend: múltiplas instâncias (stateless)
- Load balancer (nginx/HAProxy)
- Redis cluster para cache distribuído
- PostgreSQL read replicas

### Vertical Scaling

- Aumentar recursos do servidor
- Otimizar queries
- Índices adequados

## Monitoramento

### Métricas

- Latência de endpoints
- Taxa de erro
- Uso de CPU/memória
- Conexões de banco
- Cache hit rate

### Logs

- Structured logging (Pino)
- Níveis: error, warn, info, debug
- Auditoria completa
- Sentry para erros

### Health Checks

```
GET /api/health
{
  "status": "ok",
  "services": {
    "database": "ok",
    "redis": "ok"
  }
}
```

## Deployment

### Docker Compose (Dev)

```yaml
services:
  - postgres
  - redis
  - backend
  - frontend-admin
  - pwa-estagiario
  - kiosk
```

### Produção

- Kubernetes (recomendado)
- Docker Swarm
- VMs tradicionais

### CI/CD

- GitHub Actions
- Testes automatizados
- Build e deploy automático
- Rollback automático em falhas

## Extensões Futuras

### Planejadas

- [ ] Selfie com liveness detection
- [ ] Geofencing avançado
- [ ] Notificações push (Firebase)
- [ ] Relatórios PDF automatizados
- [ ] Integração com folha de pagamento
- [ ] Dashboard de integridade das máquinas
- [ ] App mobile nativo (React Native)
- [ ] Assinatura assimétrica (Ed25519)
- [ ] Blockchain para auditoria
- [ ] Machine Learning para detecção de anomalias
