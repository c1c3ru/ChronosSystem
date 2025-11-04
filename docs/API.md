# 📡 Documentação da API

## Base URL

```
http://localhost:4000/api
```

## Autenticação

A maioria dos endpoints requer autenticação via JWT Bearer Token.

```http
Authorization: Bearer <access_token>
```

---

## 🔐 Autenticação

### POST /auth/login

Login com email e senha.

**Request:**
```json
{
  "email": "estagiario@ponto.com",
  "password": "estagio123",
  "twoFactorCode": "123456" // Opcional, se 2FA habilitado
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "estagiario@ponto.com",
    "name": "João Silva",
    "role": "ESTAGIARIO"
  }
}
```

### GET /auth/google

Redireciona para autenticação Google OAuth.

### GET /auth/google/callback

Callback do Google OAuth (não chamar diretamente).

### POST /auth/refresh

Renovar access token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### POST /auth/logout

Fazer logout (revoga refresh token).

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..." // Opcional
}
```

### POST /auth/2fa/enable

Habilitar 2FA (requer autenticação).

**Response:**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "otpauth://totp/Ponto%20App..."
}
```

### POST /auth/2fa/verify

Verificar código 2FA e ativar.

**Request:**
```json
{
  "code": "123456"
}
```

### POST /auth/2fa/disable

Desabilitar 2FA.

**Request:**
```json
{
  "code": "123456"
}
```

### GET /auth/me

Obter informações do usuário autenticado.

**Response:**
```json
{
  "id": "uuid",
  "email": "estagiario@ponto.com",
  "name": "João Silva",
  "role": "ESTAGIARIO"
}
```

---

## 👥 Usuários

### GET /users

Listar todos os usuários (Admin/Supervisor).

**Response:**
```json
[
  {
    "id": "uuid",
    "email": "estagiario@ponto.com",
    "name": "João Silva",
    "role": "ESTAGIARIO",
    "isActive": true,
    "createdAt": "2025-10-15T12:00:00Z"
  }
]
```

### GET /users/:id

Obter usuário por ID.

### POST /users

Criar novo usuário (Admin/Supervisor).

**Request:**
```json
{
  "email": "novo@ponto.com",
  "name": "Novo Usuário",
  "password": "senha123",
  "role": "ESTAGIARIO"
}
```

### PATCH /users/:id

Atualizar usuário.

**Request:**
```json
{
  "name": "Nome Atualizado",
  "isActive": false
}
```

### DELETE /users/:id

Desativar usuário (Admin).

---

## 🖥️ Máquinas

### GET /machines

Listar todas as máquinas (Admin/Supervisor).

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Recepção Principal",
    "location": "Entrada do escritório",
    "timezone": "America/Sao_Paulo",
    "publicId": "MACHINE_001",
    "isActive": true,
    "createdAt": "2025-10-15T12:00:00Z"
  }
]
```

### GET /machines/:id

Obter máquina por ID.

### GET /machines/:id/qr

Obter QR code atual da máquina.

**Response:**
```json
{
  "qrData": "eyJtYWNoaW5lX2lkIjoiTUFDSElORV8wMDEiLCJ0cyI6IjIwMjUtMTAtMTVUMTI6MDA6MDBaIiwiZXhwIjo2MCwibm9uY2UiOiJhMWIyYzNkNCIsInZlcnNpb24iOiJ2MSJ9.ZjNhYjJjM2Q0ZTVmNmE3YjhjOWQwZTFmMmEzYjRjNWQ2ZTdmOGE5YjBjMWQyZTNmNGE1YjZjN2Q4ZTlmMGEx"
}
```

### POST /machines

Criar nova máquina (Admin/Supervisor).

**Request:**
```json
{
  "name": "Recepção Principal",
  "location": "Entrada do escritório",
  "timezone": "America/Sao_Paulo"
}
```

### PATCH /machines/:id

Atualizar máquina.

### DELETE /machines/:id

Desativar máquina (Admin).

---

## ⏰ Registros de Ponto

### POST /attendance/scan

Registrar ponto via QR code.

**Request:**
```json
{
  "qrData": "eyJtYWNoaW5lX2lkIjoiTUFDSElORV8wMDEi...",
  "type": "ENTRADA",
  "geoLat": -23.5505,
  "geoLng": -46.6333,
  "deviceInfo": "Mozilla/5.0...",
  "selfieUrl": "https://..." // Opcional
}
```

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "machineId": "uuid",
  "type": "ENTRADA",
  "tsClient": "2025-10-15T12:00:00Z",
  "tsServer": "2025-10-15T12:00:01Z",
  "nonce": "a1b2c3d4",
  "geoLat": -23.5505,
  "geoLng": -46.6333,
  "prevHash": "abc123...",
  "recordHash": "def456...",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "estagiario@ponto.com"
  },
  "machine": {
    "id": "uuid",
    "name": "Recepção Principal",
    "location": "Entrada do escritório"
  }
}
```

### GET /attendance/user/:userId

Obter histórico de registros de um usuário.

**Query Params:**
- `from` - Data inicial (ISO 8601)
- `to` - Data final (ISO 8601)

**Response:**
```json
[
  {
    "id": "uuid",
    "type": "ENTRADA",
    "tsServer": "2025-10-15T08:00:00Z",
    "machine": {
      "name": "Recepção Principal",
      "location": "Entrada do escritório"
    }
  }
]
```

### GET /attendance

Listar todos os registros (Admin/Supervisor).

### POST /attendance/correction

Solicitar correção de ponto.

**Request:**
```json
{
  "attendanceRecordId": "uuid",
  "reason": "Esqueci de registrar a saída",
  "newType": "SAIDA",
  "newTimestamp": "2025-10-15T18:00:00Z"
}
```

### PATCH /attendance/correction/:id/review

Aprovar ou rejeitar correção (Admin/Supervisor).

**Request:**
```json
{
  "status": "APROVADO",
  "reviewNotes": "Aprovado conforme justificativa"
}
```

### GET /attendance/verify-chain/:userId

Verificar integridade da cadeia de hashes (Admin/Audit).

**Response:**
```json
{
  "valid": true,
  "errors": []
}
```

---

## 🔍 Auditoria

### GET /audit/logs

Listar logs de auditoria (Admin/Audit).

**Query Params:**
- `actorId` - Filtrar por usuário
- `resource` - Filtrar por recurso
- `action` - Filtrar por ação

**Response:**
```json
[
  {
    "id": "uuid",
    "actorId": "uuid",
    "action": "CREATE_USER",
    "resource": "users",
    "resourceId": "uuid",
    "details": "{\"email\":\"novo@ponto.com\"}",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "ts": "2025-10-15T12:00:00Z",
    "actor": {
      "id": "uuid",
      "name": "Admin",
      "email": "admin@ponto.com"
    }
  }
]
```

---

## 🏥 Health Check

### GET /health

Verificar status do sistema.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-15T12:00:00Z",
  "services": {
    "database": "ok",
    "redis": "ok"
  }
}
```

---

## ❌ Códigos de Erro

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "QR code inválido",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Credenciais inválidas",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Acesso negado",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Recurso não encontrado",
  "error": "Not Found"
}
```

### 429 Too Many Requests
```json
{
  "statusCode": 429,
  "message": "Muitas requisições",
  "error": "Too Many Requests"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Erro interno do servidor",
  "error": "Internal Server Error"
}
```

---

## 📝 Notas

### Rate Limiting

- Global: 100 requisições/minuto
- Login: 5 tentativas/minuto
- Scan: 10 registros/minuto

### Paginação

Endpoints de listagem suportam paginação:

```
GET /users?page=1&limit=20
```

### Ordenação

```
GET /attendance?orderBy=tsServer&order=desc
```

### Filtros

```
GET /users?role=ESTAGIARIO&isActive=true
```
