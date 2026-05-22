# 🔒 Documentação de Segurança

## Visão Geral

Este documento descreve as medidas de segurança implementadas no sistema de registro de ponto.

## Autenticação

### JWT (JSON Web Tokens)

**Access Token:**

- Duração: 15 minutos
- Armazenamento: localStorage (frontend)
- Payload: `{ sub: userId, email, role }`
- Algoritmo: HS256

**Refresh Token:**

- Duração: 7 dias
- Armazenamento: localStorage + banco de dados
- Rotação: novo token a cada refresh
- Revogação: ao fazer logout

### Google OAuth 2.0

- Fluxo de autorização padrão
- Scopes: email, profile
- Vinculação automática de contas
- Fallback para login tradicional

### 2FA (Two-Factor Authentication)

- Protocolo: TOTP (Time-based One-Time Password)
- Biblioteca: speakeasy
- QR code para configuração
- Janela de validação: ±2 períodos (60s cada)
- Opcional para usuários

## QR Code Security

### Geração Segura

```typescript
payload = {
  machine_id: 'MACHINE_001',
  ts: '2025-10-15T12:00:00Z',
  exp: 60,
  nonce: randomBytes(16).toString('hex'),
  version: 'v1',
}

signature = HMAC - SHA256(HMAC_SECRET, JSON.stringify(payload))
qrData = base64url(payload) + '.' + base64url(signature)
```

### Validação

1. **Verificação de Assinatura (HMAC)**
   - Recalcula HMAC com chave secreta
   - Comparação timing-safe
   - Rejeita se não corresponder

2. **Verificação de Timestamp**
   - Valida se QR não expirou (60s)
   - Margem de tolerância: 0s
   - Rejeita QR codes antigos

3. **Verificação de Nonce (Anti-Replay)**
   - Verifica se nonce já foi usado
   - Armazenado no Redis com TTL
   - Rejeita se já consumido

4. **Verificação de Máquina**
   - Valida se máquina existe
   - Verifica se está ativa
   - Rejeita se inválida

### Proteções

- ✅ Impossível falsificar sem chave secreta
- ✅ Não pode ser reutilizado (nonce único)
- ✅ Expira automaticamente (60s)
- ✅ Timing-safe comparison (previne timing attacks)

## Hash Chain (Auditoria Imutável)

### Conceito

Cada registro de ponto contém:

- `prevHash`: hash do registro anterior
- `recordHash`: hash do registro atual

Isso cria uma cadeia imutável onde qualquer alteração é detectável.

### Implementação

```typescript
// Buscar último registro
const lastRecord = await prisma.attendanceRecord.findFirst({
  where: { userId },
  orderBy: { tsServer: 'desc' },
})

const prevHash = lastRecord?.recordHash || null

// Criar registro
const record = await prisma.attendanceRecord.create({
  data: {
    userId,
    machineId,
    type,
    tsClient,
    nonce,
    prevHash,
    recordHash: '', // Será calculado
  },
})

// Calcular hash
const data = {
  id: record.id,
  userId: record.userId,
  machineId: record.machineId,
  type: record.type,
  tsClient: record.tsClient.toISOString(),
  tsServer: record.tsServer.toISOString(),
  nonce: record.nonce,
  prevHash: record.prevHash,
}

const recordHash = SHA256(JSON.stringify(data))

// Atualizar registro
await prisma.attendanceRecord.update({
  where: { id: record.id },
  data: { recordHash },
})
```

### Verificação de Integridade

```typescript
GET /api/attendance/verify-chain/:userId

// Retorna:
{
  valid: true,
  errors: []
}
```

## Rate Limiting

### Configuração

```typescript
ThrottlerModule.forRoot([
  {
    ttl: 60000, // 60 segundos
    limit: 100, // 100 requisições
  },
])
```

### Endpoints Protegidos

- `/api/auth/login` - 5 tentativas/min
- `/api/attendance/scan` - 10 registros/min
- `/api/*` - 100 requisições/min (global)

## CORS (Cross-Origin Resource Sharing)

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
})
```

## Helmet (Security Headers)

```typescript
app.use(helmet())
```

Headers configurados:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

## Content Security Policy (CSP)

```typescript
helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
  },
})
```

## Input Validation

### Backend (class-validator)

```typescript
class CreateUserDto {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(8)
  password: string

  @IsEnum(UserRole)
  role: UserRole
}
```

### Frontend (zod)

```typescript
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})
```

## SQL Injection Protection

- ✅ Prisma ORM (prepared statements)
- ✅ Parametrização automática
- ✅ Sem queries raw (exceto necessário)

## XSS Protection

- ✅ React escapa automaticamente
- ✅ Sanitização de inputs
- ✅ CSP headers
- ✅ Sem `dangerouslySetInnerHTML`

## CSRF Protection

- ✅ SameSite cookies
- ✅ Token CSRF (se necessário)
- ✅ Origin validation

## Password Security

### Hashing

```typescript
import * as bcrypt from 'bcrypt'

// Hash
const hash = await bcrypt.hash(password, 10)

// Verify
const isValid = await bcrypt.compare(password, hash)
```

### Requisitos

- Mínimo 8 caracteres
- Recomendado: letras, números, símbolos
- Hash: bcrypt (10 rounds)

## Secrets Management

### Desenvolvimento

```bash
# .env (não commitar)
JWT_SECRET=your-secret-here
HMAC_SECRET=your-hmac-secret-here
```

### Produção

- ✅ Usar vault (HashiCorp Vault, AWS Secrets Manager)
- ✅ Rotação periódica de chaves
- ✅ Nunca commitar secrets
- ✅ Variáveis de ambiente seguras

## Geolocalização

### Captura

```typescript
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude } = position.coords
    // Enviar para backend
  },
  (error) => {
    // Opcional: permitir registro sem geo
  }
)
```

### Validação (Opcional)

```typescript
// Verificar se está dentro do raio permitido
const distance = calculateDistance(userLat, userLng, machineLat, machineLng)

if (distance > MAX_DISTANCE_METERS) {
  throw new Error('Muito longe da máquina')
}
```

## Auditoria

### Logs Imutáveis

```typescript
await prisma.auditLog.create({
  data: {
    actorId: user.id,
    action: 'CREATE_USER',
    resource: 'users',
    resourceId: newUser.id,
    details: JSON.stringify({ email: newUser.email }),
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  },
})
```

### Eventos Auditados

- Login/Logout
- Criação/Edição/Exclusão de usuários
- Criação/Edição de máquinas
- Registros de ponto
- Correções de ponto
- Alterações de configuração

## HTTPS/TLS

### Desenvolvimento

- HTTP permitido (localhost)

### Produção

- ✅ HTTPS obrigatório
- ✅ TLS 1.3
- ✅ Certificado válido (Let's Encrypt)
- ✅ HSTS header
- ✅ Redirect HTTP → HTTPS

## Database Security

### Conexão

```typescript
DATABASE_URL = 'postgresql://user:password@host:5432/db?sslmode=require'
```

### Backup

- Backup diário automático
- Criptografia em repouso
- Retenção: 30 dias
- Teste de restore mensal

### Permissões

- Usuário da aplicação: apenas necessário
- Sem acesso root
- Princípio do menor privilégio

## Redis Security

### Configuração

```redis
# redis.conf
requirepass your-strong-password
bind 127.0.0.1
protected-mode yes
```

### Uso

- Apenas cache e nonces
- TTL em todos os dados
- Sem dados sensíveis permanentes

## Compliance

### LGPD (Lei Geral de Proteção de Dados)

- ✅ Consentimento explícito
- ✅ Direito ao esquecimento
- ✅ Portabilidade de dados
- ✅ Anonimização após período
- ✅ Logs de acesso

### GDPR (se aplicável)

- ✅ Data minimization
- ✅ Right to erasure
- ✅ Data portability
- ✅ Privacy by design

## Incident Response

### Em caso de brecha de segurança:

1. **Contenção**
   - Isolar sistema afetado
   - Revogar tokens comprometidos
   - Bloquear acesso suspeito

2. **Investigação**
   - Analisar logs de auditoria
   - Identificar escopo do incidente
   - Documentar tudo

3. **Notificação**
   - Informar usuários afetados
   - Notificar autoridades (se necessário)
   - Comunicação transparente

4. **Recuperação**
   - Restaurar de backup
   - Aplicar patches
   - Reforçar segurança

5. **Pós-Incidente**
   - Análise de causa raiz
   - Implementar melhorias
   - Atualizar documentação

## Security Checklist

### Desenvolvimento

- [ ] Nunca commitar secrets
- [ ] Validar todos os inputs
- [ ] Usar HTTPS em produção
- [ ] Implementar rate limiting
- [ ] Logs de auditoria
- [ ] Testes de segurança

### Deploy

- [ ] Alterar senhas padrão
- [ ] Configurar firewall
- [ ] HTTPS/TLS configurado
- [ ] Backup automático
- [ ] Monitoramento ativo
- [ ] Plano de incident response

### Manutenção

- [ ] Atualizar dependências
- [ ] Rotacionar chaves
- [ ] Revisar logs
- [ ] Testes de penetração
- [ ] Auditoria de código
- [ ] Treinamento de equipe

## Contato de Segurança

Para reportar vulnerabilidades:

- Email: security@example.com
- Responsible disclosure
- Não divulgar publicamente antes de patch

## Referências

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [CWE Top 25](https://cwe.mitre.org/top25/)
