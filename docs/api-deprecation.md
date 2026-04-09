# 🗑️ APIs e Códigos Removidos/Deprecated

## 📅 **Data da Limpeza:** Novembro 2024

---

## 🚫 **APIs REMOVIDAS**

### **1. `/api/attendance/simple-register`**

- **Status:** ❌ **REMOVIDA**
- **Substituída por:** `/api/attendance/qr-unified`
- **Motivo:** Funcionalidade duplicada, API unificada é mais robusta

### **2. `/api/qr/validate`**

- **Status:** ❌ **REMOVIDA**
- **Substituída por:** `/api/attendance/qr-unified`
- **Motivo:** Funcionalidade duplicada, validação mais simples

---

## ⚠️ **FUNÇÕES DEPRECATED**

### **`lib/qr-security.ts`**

#### **`isNonceUsed(nonce: string)`**

- **Status:** 🔶 **DEPRECATED**
- **Substituída por:** Verificação direta no banco de dados via `QrEvent.used`
- **Motivo:** Cache em memória era redundante e causava problemas em deploys

```typescript
// ❌ DEPRECATED - Não usar
if (isNonceUsed(nonce)) {
  // ...
}

// ✅ RECOMENDADO - Usar verificação no banco
const qrEvent = await prisma.qrEvent.findUnique({
  where: { nonce },
})
if (qrEvent?.used) {
  // ...
}
```

#### **`markNonceAsUsed(nonce: string)`**

- **Status:** 🔶 **DEPRECATED**
- **Substituída por:** Update direto no banco de dados via `QrEvent.used = true`
- **Motivo:** Cache em memória era redundante e não persistente

```typescript
// ❌ DEPRECATED - Não usar
markNonceAsUsed(nonce)

// ✅ RECOMENDADO - Usar update no banco
await prisma.qrEvent.update({
  where: { nonce },
  data: {
    used: true,
    usedAt: new Date(),
    usedBy: userId,
  },
})
```

---

## 📋 **MIGRAÇÃO RECOMENDADA**

### **Para Desenvolvedores:**

#### **1. Atualizar Chamadas de API:**

```typescript
// ❌ ANTIGO
fetch('/api/attendance/simple-register', { ... })
fetch('/api/qr/validate', { ... })

// ✅ NOVO
fetch('/api/attendance/qr-unified', { ... })
```

#### **2. Remover Imports Deprecated:**

```typescript
// ❌ ANTIGO
import { isNonceUsed, markNonceAsUsed } from '@/lib/qr-security'

// ✅ NOVO
import { validateSecureQR, generateRecordHash } from '@/lib/qr-security'
```

#### **3. Usar Verificação no Banco:**

```typescript
// ❌ ANTIGO
if (isNonceUsed(nonce)) {
  return { error: 'Nonce já usado' }
}
markNonceAsUsed(nonce)

// ✅ NOVO
const qrEvent = await prisma.qrEvent.findUnique({
  where: { nonce },
})
if (qrEvent?.used) {
  return { error: 'QR code já usado' }
}
await prisma.qrEvent.update({
  where: { id: qrEvent.id },
  data: { used: true, usedAt: new Date() },
})
```

---

## 🎯 **BENEFÍCIOS DA LIMPEZA**

### **✅ Consolidação:**

- **3 APIs** → **1 API unificada**
- Menos endpoints para manter
- Lógica centralizada

### **✅ Confiabilidade:**

- Cache em memória removido
- Verificação persistente no banco
- Sem perda de dados em restarts

### **✅ Performance:**

- Menos código duplicado
- Imports otimizados
- Bundle menor

### **✅ Manutenibilidade:**

- Código mais limpo
- Menos complexidade
- Documentação clara

---

## 🔄 **COMPATIBILIDADE**

### **Funções Deprecated:**

- ✅ Ainda existem para compatibilidade
- ⚠️ Emitem warnings no console
- 🔶 Serão removidas na próxima versão major

### **APIs Antigas:**

- ❌ `/api/attendance/qr-scan` - Ainda existe (legacy)
- ❌ `/api/qr/generate` - Ainda existe (necessária)
- ✅ `/api/attendance/qr-unified` - Nova API principal

---

## 📊 **ESTATÍSTICAS DA LIMPEZA**

| Item              | Antes  | Depois     | Redução |
| ----------------- | ------ | ---------- | ------- |
| **APIs QR**       | 3      | 1          | -67%    |
| **Funções Nonce** | Ativas | Deprecated | -100%   |
| **Cache Memória** | Sim    | Não        | -100%   |
| **Linhas Código** | ~800   | ~400       | -50%    |

---

## 🚀 **PRÓXIMOS PASSOS**

### **Versão Atual (v2.1):**

- ✅ APIs antigas deprecated
- ✅ Funções deprecated com warnings
- ✅ Nova API unificada ativa

### **Próxima Versão (v3.0):**

- 🔄 Remover APIs antigas completamente
- 🔄 Remover funções deprecated
- 🔄 Cleanup final do código

### **Recomendações:**

1. **Migrar** para `/api/attendance/qr-unified`
2. **Atualizar** código para usar banco de dados
3. **Testar** nova implementação
4. **Remover** imports deprecated

---

**📝 Documentação atualizada em:** Novembro 2024  
**🔧 Responsável:** Sistema de Limpeza Automática  
**📋 Status:** Concluída
