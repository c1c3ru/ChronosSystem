# 🔐 Funcionalidades de Segurança - Chronos System

## Visão Geral

Este documento descreve as funcionalidades de segurança implementadas no Chronos System para garantir a integridade, autenticidade e confidencialidade dos registros de ponto.

## 🛡️ Funcionalidades Implementadas

### 1. QR Code Seguro com HMAC-SHA256

#### **Descrição**
Sistema de QR codes assinados digitalmente usando HMAC-SHA256 para garantir autenticidade e prevenir falsificação.

#### **Como Funciona**
```typescript
// Geração do QR Code
const payload = {
  machineId: "MACHINE_001",
  timestamp: Date.now(),
  nonce: "unique-random-string",
  expiresIn: 60, // segundos
  version: "v1"
}

const signature = HMAC-SHA256(secret, base64url(payload))
const qrData = base64url(payload) + "." + signature
```

#### **Validação**
1. **Verificação de Assinatura**: Recalcula HMAC e compara usando timing-safe comparison
2. **Validação Temporal**: Verifica se QR não expirou (60 segundos)
3. **Verificação de Estrutura**: Valida campos obrigatórios do payload

#### **Benefícios**
- ✅ **Impossível falsificar** sem a chave secreta
- ✅ **Expiração automática** (60 segundos)
- ✅ **Verificação criptográfica** robusta
- ✅ **Resistente a ataques** de timing

#### **Arquivos Relacionados**
- `/lib/qr-security.ts` - Funções de geração e validação
- `/app/api/kiosk/qr/route.ts` - API de geração de QR
- `/app/api/attendance/qr-scan/route.ts` - API de validação

---

### 2. Proteção Anti-Replay

#### **Descrição**
Sistema que previne a reutilização de QR codes já utilizados, garantindo que cada código só pode ser usado uma única vez.

#### **Como Funciona**
```typescript
// Verificação de nonce
if (isNonceUsed(nonce)) {
  throw new Error('QR code já foi utilizado')
}

// Marcar como usado
markNonceAsUsed(nonce)
```

#### **Implementação**
- **Cache em Memória**: Armazena nonces usados com TTL de 5 minutos
- **Limpeza Automática**: Remove nonces expirados automaticamente
- **Verificação Dupla**: Banco de dados + cache para redundância

#### **Benefícios**
- ✅ **Previne replay attacks**
- ✅ **Garante unicidade** de registros
- ✅ **Performance otimizada** com cache
- ✅ **Limpeza automática** de dados antigos

#### **Arquivos Relacionados**
- `/lib/qr-security.ts` - Funções de nonce
- `/prisma/schema.prisma` - Tabela QrEvent para auditoria

---

### 3. Hash Chain para Integridade

#### **Descrição**
Cada registro de ponto contém um hash do registro anterior, criando uma cadeia imutável que detecta alterações.

#### **Como Funciona**
```typescript
const recordHash = SHA256(
  userId + machineId + type + timestamp + prevHash
)
```

#### **Estrutura da Cadeia**
```
Registro 1: hash1 = SHA256(dados1 + "")
Registro 2: hash2 = SHA256(dados2 + hash1)
Registro 3: hash3 = SHA256(dados3 + hash2)
...
```

#### **Benefícios**
- ✅ **Detecta alterações** retroativas
- ✅ **Auditoria imutável**
- ✅ **Verificação de integridade**
- ✅ **Resistente a manipulação**

---

### 4. Autenticação de Dois Fatores (2FA)

#### **Descrição**
Sistema de autenticação adicional usando TOTP (Time-based One-Time Password) compatível com apps como Google Authenticator.

#### **Funcionalidades**
- **Setup Inicial**: Geração de QR code para configuração
- **Verificação**: Validação de códigos de 6 dígitos
- **Gerenciamento**: Habilitar/desabilitar 2FA
- **Auditoria**: Logs de todas as ações relacionadas ao 2FA

#### **Fluxo de Configuração**
1. Usuário acessa `/admin/security`
2. Clica em "Configurar 2FA"
3. Escaneia QR code no app autenticador
4. Insere código de 6 dígitos para confirmar
5. 2FA é habilitado

#### **APIs Disponíveis**
- `POST /api/auth/2fa/setup` - Iniciar configuração
- `POST /api/auth/2fa/verify` - Verificar token
- `POST /api/auth/2fa/disable` - Desabilitar 2FA
- `GET /api/auth/2fa/setup` - Status atual

#### **Benefícios**
- ✅ **Camada extra de segurança**
- ✅ **Compatível com apps padrão**
- ✅ **Fácil configuração**
- ✅ **Auditoria completa**

#### **Arquivos Relacionados**
- `/lib/two-factor.ts` - Funções de 2FA
- `/app/api/auth/2fa/` - APIs de 2FA
- `/components/two-factor-setup.tsx` - Interface de configuração
- `/app/admin/security/page.tsx` - Página de segurança

---

## 📱 Progressive Web App (PWA)

### **Funcionalidades PWA**

#### **Service Worker**
- **Cache Offline**: Recursos estáticos em cache
- **Estratégia Network-First**: Tenta rede primeiro, fallback para cache
- **Sincronização**: Background sync quando volta online
- **Notificações**: Suporte a push notifications

#### **Instalação**
- **Banner Inteligente**: Aparece automaticamente quando suportado
- **Detecção Automática**: Verifica se já está instalado
- **Controle de Exibição**: Não mostra se foi dispensado nas últimas 24h

#### **Funcionalidade Offline**
- **Página Offline**: Interface personalizada quando sem conexão
- **Detecção de Status**: Monitora conexão em tempo real
- **Cache Inteligente**: Armazena recursos críticos

#### **Arquivos Relacionados**
- `/public/sw.js` - Service Worker
- `/public/manifest.json` - Manifest PWA
- `/components/pwa-installer.tsx` - Banner de instalação
- `/app/offline/page.tsx` - Página offline

---

## 🧪 Testes Implementados

### **Testes Unitários**
- **QR Security**: Geração, validação, anti-replay
- **Two Factor**: Setup, verificação, gerenciamento
- **Hash Chain**: Integridade, consistência

### **Testes E2E**
- **Fluxo de QR Seguro**: Geração no kiosk, validação no scan
- **PWA**: Service worker, instalação, offline
- **2FA**: Configuração completa, verificação
- **Segurança**: Headers, configurações

### **Executar Testes**
```bash
# Testes unitários
npm test

# Testes E2E
npm run test:e2e

# Testes específicos
npm test -- --testPathPattern=qr-security
```

---

## 🔧 Configuração de Produção

### **Variáveis de Ambiente**
```env
# QR Code Security
QR_SECRET=sua-chave-secreta-super-forte-aqui

# Database
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_SECRET=sua-chave-nextauth
NEXTAUTH_URL=https://seu-dominio.com
```

### **Recomendações de Segurança**

#### **Chaves Secretas**
- Use chaves de pelo menos 32 caracteres
- Gere chaves aleatórias criptograficamente seguras
- Rotacione chaves periodicamente
- Nunca commite chaves no código

#### **HTTPS**
- **Obrigatório em produção**
- Use certificados válidos
- Configure HSTS headers
- Redirecione HTTP para HTTPS

#### **Headers de Segurança**
```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  }
]
```

#### **Rate Limiting**
- Implemente rate limiting nas APIs
- Use Redis para cache distribuído
- Configure limites por IP e usuário

---

## 📊 Monitoramento e Auditoria

### **Logs de Segurança**
Todos os eventos de segurança são registrados na tabela `AuditLog`:

- `QR_SCAN_ATTENDANCE` - Registro de ponto via QR
- `2FA_SETUP_INITIATED` - Início da configuração 2FA
- `2FA_ENABLED` - 2FA habilitado
- `2FA_DISABLED` - 2FA desabilitado
- `2FA_VERIFICATION_SUCCESS` - Token 2FA válido
- `2FA_VERIFICATION_FAILED` - Token 2FA inválido

### **Métricas Importantes**
- Taxa de QR codes expirados
- Tentativas de replay attack
- Falhas de verificação 2FA
- Tempo de resposta das APIs de segurança

### **Alertas Recomendados**
- Múltiplas tentativas de QR inválido
- Tentativas de replay attack
- Falhas consecutivas de 2FA
- Alterações na hash chain

---

## 🚀 Próximas Melhorias

### **Planejadas**
- [ ] **Redis para Anti-Replay**: Substituir cache em memória
- [ ] **Geofencing**: Validação de localização
- [ ] **Biometria**: Integração com WebAuthn
- [ ] **Backup Codes**: Códigos de recuperação 2FA
- [ ] **Rate Limiting**: Proteção contra brute force
- [ ] **Webhook Security**: Assinatura de webhooks

### **Considerações Futuras**
- [ ] **Hardware Security Module (HSM)**
- [ ] **Certificados de Cliente**
- [ ] **Zero Trust Architecture**
- [ ] **Blockchain para Auditoria**

---

## 📞 Suporte e Manutenção

### **Logs de Debug**
```bash
# Habilitar logs detalhados
DEBUG=chronos:security npm run dev
```

### **Verificação de Integridade**
```sql
-- Verificar hash chain
SELECT id, hash, prevHash, 
       LAG(hash) OVER (ORDER BY timestamp) as expected_prev_hash
FROM AttendanceRecord 
WHERE prevHash != LAG(hash) OVER (ORDER BY timestamp);
```

### **Rotação de Chaves**
1. Gerar nova chave secreta
2. Atualizar variável de ambiente
3. Reiniciar aplicação
4. Monitorar logs por 24h
5. Confirmar funcionamento

---

**Documentação atualizada em:** Novembro 2024  
**Versão:** 2.0.0  
**Autor:** Chronos System Team
