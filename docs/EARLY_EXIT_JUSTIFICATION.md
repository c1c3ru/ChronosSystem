# Sistema de Justificativa para Saída Antecipada

## 📋 Visão Geral

Quando um aluno sai **mais de 10 minutos antes** do horário esperado, o sistema exige uma justificativa obrigatória. Isso garante que saídas antecipadas sejam documentadas e possam ser revisadas pelo administrador.

## 🎯 Objetivo

- ✅ Documentar saídas antecipadas
- ✅ Permitir que administrador revise motivos
- ✅ Manter conformidade com horários
- ✅ Evitar saídas não autorizadas

## 🔄 Fluxo

```
1. Usuário escaneia QR para sair
   ↓
2. Sistema valida horário de saída
   ↓
3. Se sair > 10 minutos antes:
   ├─ Exibe modal com justificativa obrigatória
   ├─ Usuário preenche motivo (mín. 10 caracteres)
   └─ Justificativa é salva no banco
   ↓
4. Administrador pode revisar justificativas
```

## 📊 Exemplos

### Cenário 1: Saída No Horário

```
Turno: 08:00-12:00
Saída: 11:58
Diferença: 2 minutos
Resultado: ✅ Sem justificativa necessária
```

### Cenário 2: Saída 10 Minutos Antes

```
Turno: 08:00-12:00
Saída: 11:50
Diferença: 10 minutos
Resultado: ✅ Sem justificativa necessária (limite é > 10 min)
```

### Cenário 3: Saída 15 Minutos Antes

```
Turno: 08:00-12:00
Saída: 11:45
Diferença: 15 minutos
Resultado: ❌ Justificativa obrigatória
Modal exibe: "Você está saindo 15 minutos antes do horário esperado (12:00)"
```

### Cenário 4: Saída 1 Hora Antes

```
Turno: 08:00-12:00
Saída: 11:00
Diferença: 60 minutos
Resultado: ❌ Justificativa obrigatória
Modal exibe: "Você está saindo 60 minutos antes do horário esperado (12:00)"
```

## 🛠️ Implementação

### 1. Validação (lib/shift-validation.ts)

```typescript
export function validateExitTime(
  entryTime: Date,
  exitTime: Date,
  config: UserShiftConfig
): ShiftValidationResult {
  // ... código ...

  // Converter horário de saída esperado para minutos
  const [expectedEndHour, expectedEndMin] = config.shiftEndTime.split(':').map(Number)
  const expectedEndMinutes = expectedEndHour * 60 + expectedEndMin
  const actualExitMinutes = exitTime.getHours() * 60 + exitTime.getMinutes()
  const minutesEarly = expectedEndMinutes - actualExitMinutes

  // Verificar se saiu mais de 10 minutos antes do horário esperado
  if (minutesEarly > 10) {
    requiresJustification = true
    justificationReason = `Saída ${minutesEarly} minutos antes do horário esperado (${config.shiftEndTime}). Justificativa obrigatória.`
  }

  return {
    // ... resultado ...
    requiresJustification,
    justificationReason,
  }
}
```

### 2. Componente Modal (components/EarlyExitJustification.tsx)

```typescript
<EarlyExitJustification
  minutesEarly={15}
  expectedEndTime="12:00"
  onSubmit={async (justification) => {
    // Enviar para API com justificativa
    await fetch('/api/attendance/qr-unified', {
      method: 'POST',
      body: JSON.stringify({
        qrData,
        location,
        justification // ← Justificativa obrigatória
      })
    })
  }}
  onCancel={() => {
    // Usuário cancelou saída
  }}
/>
```

### 3. API (app/api/attendance/qr-unified/route.ts)

```typescript
const { qrData, location, justification } = await request.json()

const attendanceRecord = await prisma.attendanceRecord.create({
  data: {
    userId: session.user.id,
    machineId: machineId,
    type: recordType,
    timestamp: getNowInFortaleza(),
    qrData: qrData,
    hash: recordHash,
    prevHash: lastRecord?.hash,
    latitude: location?.latitude,
    longitude: location?.longitude,
    justification: justification || null, // ← Salvar justificativa
  },
})
```

### 4. Schema (prisma/schema.prisma)

```prisma
model AttendanceRecord {
  id            String   @id @default(cuid())
  userId        String
  machineId     String
  type          String
  timestamp     DateTime @default(now())
  latitude      Float?
  longitude     Float?
  qrData        String
  hash          String
  prevHash      String?
  justification String?  // ← Campo para justificativa

  user    User    @relation(fields: [userId], references: [id])
  machine Machine @relation(fields: [machineId], references: [id])

  @@index([userId, timestamp])
  @@index([machineId, timestamp])
}
```

## 📋 Validações

### Justificativa Obrigatória

- ✅ Mínimo 10 caracteres
- ✅ Não pode estar vazia
- ✅ Deve ser preenchida antes de confirmar saída

### Detecção de Saída Antecipada

- ✅ Calcula diferença em minutos
- ✅ Compara com limite de 10 minutos
- ✅ Retorna motivo detalhado

## 🔍 Revisão pelo Administrador

### Dashboard Admin

```
Registros com Justificativa:
├─ João Silva - 15 min antes - "Consulta médica"
├─ Maria Santos - 20 min antes - "Problema familiar"
└─ Pedro Costa - 45 min antes - "Emergência"

Filtros:
- Por data
- Por usuário
- Por minutos de antecipação
- Por status de revisão
```

### Ações Possíveis

- ✅ Revisar justificativa
- ✅ Aprovar saída antecipada
- ✅ Rejeitar e solicitar esclarecimento
- ✅ Exportar relatório

## 📊 Relatórios

### Saídas Antecipadas

```
Período: Novembro 2025
Total de Saídas: 150
Saídas Antecipadas: 12 (8%)

Motivos Mais Comuns:
1. Consulta médica (4)
2. Problema familiar (3)
3. Emergência (2)
4. Outros (3)

Tempo Médio de Antecipação: 22 minutos
```

## 🚀 Integração

### 1. Na Página de Ponto

```tsx
import { EarlyExitJustification } from '@/components/EarlyExitJustification'

export function AttendancePage() {
  const [showJustification, setShowJustification] = useState(false)
  const [minutesEarly, setMinutesEarly] = useState(0)

  const handleExit = async (validation: ShiftValidationResult) => {
    if (validation.requiresJustification) {
      setMinutesEarly(validation.minutesEarly)
      setShowJustification(true)
      return
    }

    // Processar saída normalmente
    await submitExit()
  }

  return (
    <>
      {/* ... conteúdo ... */}

      {showJustification && (
        <EarlyExitJustification
          minutesEarly={minutesEarly}
          expectedEndTime="12:00"
          onSubmit={async (justification) => {
            await submitExit(justification)
            setShowJustification(false)
          }}
          onCancel={() => setShowJustification(false)}
        />
      )}
    </>
  )
}
```

### 2. Na API

```typescript
// Validar saída
const exitValidation = validateExitTime(entryTime, exitTime, userConfig)

// Se requer justificativa
if (exitValidation.requiresJustification && !justification) {
  return NextResponse.json(
    {
      error: exitValidation.justificationReason,
      requiresJustification: true,
      minutesEarly: minutesEarly,
    },
    { status: 400 }
  )
}

// Processar com justificativa
const record = await prisma.attendanceRecord.create({
  data: {
    // ... dados ...
    justification: justification || null,
  },
})
```

## 📝 Notas Importantes

1. **Limite de 10 minutos**: Saídas até 10 minutos antes são permitidas sem justificativa
2. **Mínimo 10 caracteres**: Justificativa deve ter conteúdo significativo
3. **Obrigatória**: Usuário não pode sair sem preencher
4. **Revisável**: Administrador pode revisar todas as justificativas
5. **Auditável**: Todas as saídas antecipadas são registradas

## 🔐 Segurança

- ✅ Justificativa é salva no banco de dados
- ✅ Não pode ser alterada após criação
- ✅ Auditoria completa de quem criou
- ✅ Timestamp de criação registrado
- ✅ Acesso restrito ao administrador

## 📞 Suporte

Para dúvidas sobre o sistema de justificativa:

1. Consulte este documento
2. Revise exemplos em `components/EarlyExitJustification.tsx`
3. Verifique validação em `lib/shift-validation.ts`
4. Contate o administrador do sistema
