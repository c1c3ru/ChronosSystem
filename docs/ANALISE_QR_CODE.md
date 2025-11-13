# 🔍 Análise do Sistema de Leitura de QR Code

## ❌ Problemas Identificados

### 1. **Inconsistência na Geração de QR Code**

**Problema:**
- O kiosk (`/api/kiosk/qr`) gera QR seguro com expiração de **60 segundos**
- A função `generateSecureQR()` define expiração padrão de **300 segundos** (5 minutos)
- Isso causa inconsistência entre o que é gerado e o que é validado

**Localização:**
- `app/api/kiosk/qr/route.ts:41` - Define 60 segundos
- `lib/qr-security.ts:35` - Define 300 segundos

**Impacto:**
- QR code pode expirar antes do esperado
- Validação pode falhar mesmo com QR válido
- Usuário pode receber erro "QR code expirado" incorretamente

---

### 2. **Extração de Nonce Pode Falhar**

**Problema:**
- Na linha 48 de `app/api/kiosk/qr/route.ts`, o código tenta extrair o nonce do payload decodificado:
  ```typescript
  nonce: JSON.parse(Buffer.from(secureQR.payload, 'base64url').toString()).nonce,
  ```
- Se o payload não for válido ou não puder ser decodificado, isso pode gerar exceção não tratada
- Não há tratamento de erro para essa operação

**Impacto:**
- Se a decodificação falhar, o QR não será salvo no banco
- O QR code gerado não funcionará na validação
- Erro silencioso que não é reportado ao usuário

---

### 3. **Validação de QR Seguro Falha Silenciosamente**

**Problema:**
- A API `/api/attendance/qr-scan` valida QR seguro usando `validateSecureQR()`
- Se `QR_SECRET` não estiver configurado, a validação sempre falha
- Não há mensagem de erro clara indicando o problema

**Localização:**
- `app/api/attendance/qr-scan/route.ts:28` - Validação de QR seguro
- `lib/qr-security.ts:4-7` - Verificação de QR_SECRET (só no início do módulo)

**Impacto:**
- QR codes válidos são rejeitados sem razão clara
- Usuário recebe erro genérico "QR code inválido"
- Difícil debugar o problema real

---

### 4. **Múltiplas APIs com Comportamentos Diferentes**

**Problema:**
- Existem 3 APIs diferentes para processar QR code:
  1. `/api/attendance/qr-scan` - Espera QR seguro (HMAC)
  2. `/api/qr/validate` - Espera JSON simples (`{machineId, nonce, expires}`)
  3. `/api/attendance/simple-register` - Tenta ambos (seguro e simples)

**Localização:**
- `app/api/attendance/qr-scan/route.ts` - Valida QR seguro
- `app/api/qr/validate/route.ts` - Valida JSON simples
- `app/api/attendance/simple-register/route.ts` - Tenta ambos

**Impacto:**
- Comportamento inconsistente entre APIs
- Difícil manter e debugar
- Usuário pode usar API errada e receber erro inesperado

---

### 5. **QRScanner Não Valida Formato Antes de Enviar**

**Problema:**
- O componente `QRScanner` lê o QR code e passa o texto diretamente para `processQrCode()`
- Não há validação prévia do formato do QR
- Se o QR for inválido, o erro só aparece após tentativa de processamento

**Localização:**
- `components/QRScanner.tsx:188` - Passa `qrData` diretamente para `onScan()`
- `app/employee/page.tsx:270` - Processa QR sem validação prévia

**Impacto:**
- Erros de formato não são detectados antes do envio
- Usuário pode tentar escanear QR inválido sem feedback imediato
- Pode causar múltiplas tentativas desnecessárias

---

### 6. **Falta de Sincronização entre Geração e Validação**

**Problema:**
- O kiosk gera QR com expiração de 60 segundos
- Mas salva no banco com `expiresAt` baseado em 60 segundos
- A validação usa `expiresIn` de 300 segundos do payload
- Isso causa descompasso entre o que está no banco e o que é validado

**Impacto:**
- QR pode ser rejeitado mesmo estando válido no banco
- Ou pode ser aceito mesmo estando expirado no banco
- Inconsistência de dados

---

### 7. **Nonce em Memória Não Persiste**

**Problema:**
- O sistema de nonce usa `Map` em memória (`lib/qr-security.ts:125`)
- Não há sincronização com o banco de dados
- Se o servidor reiniciar, todos os nonces são perdidos

**Impacto:**
- Nonces podem ser reutilizados após reinicialização
- Anti-replay protection não funciona corretamente
- Risco de segurança

---

## ✅ Soluções Propostas

### 1. **Padronizar Expiração de QR Code**

**Solução:**
- Usar expiração de 60 segundos em todos os lugares
- Criar função helper para gerar QR com expiração configurável
- Sincronizar entre geração e validação

**Implementação:**
```typescript
// lib/qr-security.ts
export function generateSecureQR(machineId: string, expiresIn: number = 60): SecureQRData {
  // ... código existente, mas usar expiresIn do parâmetro
}
```

---

### 2. **Melhorar Extração de Nonce**

**Solução:**
- Adicionar tratamento de erro na extração do nonce
- Validar payload antes de decodificar
- Usar try-catch para capturar erros

**Implementação:**
```typescript
// app/api/kiosk/qr/route.ts
try {
  const payloadJson = Buffer.from(secureQR.payload, 'base64url').toString()
  const payload = JSON.parse(payloadJson)
  const nonce = payload.nonce
  
  if (!nonce) {
    throw new Error('Nonce não encontrado no payload')
  }
  
  // ... resto do código
} catch (error) {
  console.error('Erro ao extrair nonce:', error)
  throw new Error('Erro ao gerar QR code: ' + error.message)
}
```

---

### 3. **Adicionar Validação de QR_SECRET**

**Solução:**
- Verificar se `QR_SECRET` está configurado antes de gerar/validar
- Retornar erro claro se não estiver configurado
- Adicionar validação em todas as funções que usam QR_SECRET

**Implementação:**
```typescript
// lib/qr-security.ts
function validateQRSecret(): void {
  if (!QR_SECRET) {
    throw new Error('QR_SECRET não está configurado. Configure a variável de ambiente QR_SECRET.')
  }
}

export function generateSecureQR(machineId: string): SecureQRData {
  validateQRSecret()
  // ... resto do código
}
```

---

### 4. **Unificar APIs de Processamento**

**Solução:**
- Usar uma única API para processar QR code (`/api/attendance/qr-scan`)
- Remover APIs duplicadas ou marcar como deprecadas
- Manter apenas `simple-register` como fallback

**Implementação:**
- Manter `/api/attendance/qr-scan` como principal
- Deprecar `/api/qr/validate`
- Usar `/api/attendance/simple-register` apenas como fallback

---

### 5. **Adicionar Validação Prévia no QRScanner**

**Solução:**
- Validar formato do QR antes de enviar para processamento
- Mostrar feedback imediato se QR for inválido
- Adicionar função helper para validar formato

**Implementação:**
```typescript
// components/QRScanner.tsx
const validateQRFormat = (qrData: string): boolean => {
  // Verificar se é QR seguro (formato payload.signature)
  if (qrData.includes('.')) {
    const parts = qrData.split('.')
    if (parts.length === 2) {
      return true // QR seguro
    }
  }
  
  // Verificar se é JSON válido
  try {
    const parsed = JSON.parse(qrData)
    return parsed.machineId !== undefined
  } catch {
    return false
  }
}

const handleScan = (qrData: string) => {
  if (!validateQRFormat(qrData)) {
    setError('QR code inválido. Formato não reconhecido.')
    return
  }
  
  onScan(qrData)
}
```

---

### 6. **Sincronizar Geração e Validação**

**Solução:**
- Usar mesma lógica de expiração em geração e validação
- Salvar `expiresAt` no banco baseado no `expiresIn` do payload
- Validar usando `expiresAt` do banco, não do payload

**Implementação:**
```typescript
// app/api/kiosk/qr/route.ts
const secureQR = generateSecureQR(machineId, 60) // 60 segundos
const payload = JSON.parse(Buffer.from(secureQR.payload, 'base64url').toString())
const expiresAt = new Date(payload.timestamp + (payload.expiresIn * 1000))

// Salvar no banco com expiresAt correto
await prisma.qrEvent.create({
  data: {
    machineId,
    qrData: secureQR.fullQR,
    nonce: payload.nonce,
    expiresAt, // Usar expiresAt calculado do payload
    used: false
  }
})
```

---

### 7. **Usar Banco de Dados para Nonce**

**Solução:**
- Armazenar nonces no banco de dados (tabela `QrEvent`)
- Verificar nonce no banco ao invés de memória
- Limpar nonces expirados periodicamente

**Implementação:**
```typescript
// lib/qr-security.ts
export async function isNonceUsed(nonce: string): Promise<boolean> {
  const qrEvent = await prisma.qrEvent.findUnique({
    where: { nonce },
    select: { used: true, expiresAt: true }
  })
  
  if (!qrEvent) {
    return false
  }
  
  // Verificar se expirou
  if (new Date() > qrEvent.expiresAt) {
    return false // Nonce expirado não conta como usado
  }
  
  return qrEvent.used
}
```

---

## 🎯 Prioridades

### Alta Prioridade
1. ✅ Padronizar expiração de QR code
2. ✅ Melhorar extração de nonce
3. ✅ Adicionar validação de QR_SECRET
4. ✅ Sincronizar geração e validação

### Média Prioridade
5. ✅ Unificar APIs de processamento
6. ✅ Adicionar validação prévia no QRScanner

### Baixa Prioridade
7. ✅ Usar banco de dados para nonce

---

## 📝 Conclusão

O sistema de leitura de QR code tem vários problemas que impedem seu funcionamento correto:

1. **Inconsistências** entre geração e validação
2. **Falta de tratamento de erros** em operações críticas
3. **Múltiplas APIs** com comportamentos diferentes
4. **Validação insuficiente** antes do processamento
5. **Armazenamento de nonce** em memória (não persistente)

As correções propostas resolverão esses problemas e tornarão o sistema mais robusto e confiável.


