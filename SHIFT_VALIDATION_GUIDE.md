# Guia de Validação de Turnos e Horários

## 📋 Visão Geral

Sistema inteligente de validação de registros de ponto baseado em:
- **Carga horária semanal** (20h, 30h, 40h, etc)
- **Turno do usuário** (manhã, tarde, noite, híbrido)
- **Horários de funcionamento do setor** (8h-17h principal, até 22h extensível)
- **Prevenção de múltiplas batidas desnecessárias**

## 🎯 Objetivos

1. ✅ Evitar múltiplas batidas de ponto desnecessárias
2. ✅ Validar entrada/saída dentro de janelas permitidas
3. ✅ Detectar anomalias (trabalho fora do horário, horas insuficientes)
4. ✅ Fornecer feedback claro ao usuário
5. ✅ Manter conformidade com horários do setor

## 🏢 Horários do Setor de Informática

- **Principal**: 08:00 - 17:00 (9 horas)
- **Extensível**: 08:00 - 22:00 (14 horas)
- **Intervalo de Almoço**: 12:00 - 13:00 (1 hora)

## 👤 Configuração de Usuário

### Campos Adicionados ao Modelo User

```prisma
shift             String       @default("MORNING")
shiftStartTime    String       @default("08:00")
shiftEndTime      String       @default("12:00")
workingDaysPerWeek Int         @default(5)
allowFlexibleHours Boolean     @default(false)
```

### Tipos de Turno

| Turno | Descrição | Janela de Entrada | Janela de Saída |
|-------|-----------|-------------------|-----------------|
| **MORNING** | Período da Manhã | ±30min do início | ±15min do fim |
| **AFTERNOON** | Período da Tarde | ±30min do início | ±15min do fim |
| **NIGHT** | Período Noturno | ±1h do início | ±30min do fim |
| **HYBRID** | Período Híbrido | ±1h do início | ±1h do fim |

## 📊 Exemplo de Configuração

### Cenário 1: Aluno com 20h/semana (Manhã)

```
Carga Horária: 20h/semana
Dias de Trabalho: 5 dias
Horas Diárias: 4h/dia

Turno: MORNING
Horário: 08:00 - 12:00

Janela de Entrada: 07:30 - 08:30
Janela de Saída: 11:45 - 12:15
```

### Cenário 2: Aluno com 30h/semana (Híbrido)

```
Carga Horária: 30h/semana
Dias de Trabalho: 5 dias
Horas Diárias: 6h/dia

Turno: HYBRID
Horário: 08:00 - 14:00

Janela de Entrada: 07:00 - 09:00
Janela de Saída: 13:00 - 15:00
```

### Cenário 3: Aluno com 36h/semana (Tarde)

```
Carga Horária: 36h/semana
Dias de Trabalho: 5 dias
Horas Diárias: 7.2h/dia

Turno: AFTERNOON
Horário: 13:00 - 20:12

Janela de Entrada: 12:30 - 13:30
Janela de Saída: 19:57 - 20:27
```

## 🔄 Lógica de Validação

### 1. Validação de Entrada

```typescript
const validation = validateEntryTime(entryTime, userConfig)

// Verifica:
// ✓ Está dentro da janela permitida?
// ✓ Está dentro do horário de funcionamento do setor?
// ✓ Não está no intervalo de almoço?
// ✓ Não é um registro duplicado?
```

### 2. Validação de Saída

```typescript
const validation = validateExitTime(entryTime, exitTime, userConfig)

// Verifica:
// ✓ Está dentro da janela permitida?
// ✓ Trabalhou o tempo esperado?
// ✓ Não trabalhou demais?
// ✓ Está dentro do horário de funcionamento?
```

### 3. Validação de Múltiplas Batidas

```typescript
const validation = validateMultipleClocks(lastRecordTime, currentTime, recordType, userConfig)

// Verifica:
// ✓ Passou pelo menos 1 minuto desde o último registro?
// ✓ É um novo dia?
// ✓ Passou mais de 4 horas (intervalo/almoço)?
// ✓ Está dentro do tempo esperado para saída?
```

## 📝 Implementação na API

### Integração com `/api/attendance/qr-unified`

```typescript
import { 
  validateEntryTime, 
  validateExitTime,
  validateMultipleClocks,
  calculateExpectedDailyHours
} from '@/lib/shift-validation'

// 1. Buscar configuração do usuário
const user = await prisma.user.findUnique({
  where: { id: session.user.id },
  select: {
    weeklyHours: true,
    shift: true,
    shiftStartTime: true,
    shiftEndTime: true,
    workingDaysPerWeek: true,
    allowFlexibleHours: true
  }
})

// 2. Validar entrada/saída
if (recordType === 'ENTRY') {
  const validation = validateEntryTime(currentTime, {
    weeklyHours: user.weeklyHours,
    shift: user.shift,
    shiftStartTime: user.shiftStartTime,
    shiftEndTime: user.shiftEndTime,
    workingDaysPerWeek: user.workingDaysPerWeek,
    allowFlexibleHours: user.allowFlexibleHours
  })
  
  if (!validation.isValid && !user.allowFlexibleHours) {
    return NextResponse.json({
      error: validation.reason,
      warnings: validation.warnings,
      suggestions: validation.suggestions
    }, { status: 400 })
  }
} else {
  const validation = validateExitTime(lastEntryTime, currentTime, userConfig)
  // ... similar logic
}

// 3. Validar múltiplas batidas
const multipleClockValidation = validateMultipleClocks(
  lastRecord?.timestamp,
  currentTime,
  recordType,
  userConfig
)

if (!multipleClockValidation.isValid) {
  return NextResponse.json({
    error: multipleClockValidation.reason,
    code: 'DUPLICATE_RECORD'
  }, { status: 400 })
}
```

## 🎨 Resposta da API

```json
{
  "success": true,
  "record": {
    "id": "rec_123",
    "type": "ENTRY",
    "typeLabel": "Entrada",
    "timestamp": "2025-11-18T08:15:00-03:00",
    "time": "08:15"
  },
  "validation": {
    "isValid": true,
    "reason": "Entrada dentro da janela permitida (07:30-08:30)",
    "expectedDailyHours": 4,
    "currentShiftStart": "08:00",
    "currentShiftEnd": "12:00",
    "allowedEntryWindow": {
      "start": "07:30",
      "end": "08:30"
    },
    "allowedExitWindow": {
      "start": "11:45",
      "end": "12:15"
    },
    "warnings": [],
    "suggestions": []
  }
}
```

## ⚙️ Configuração no Perfil do Usuário

### Página de Configuração de Turno

Adicionar em `/app/auth/complete-profile/page.tsx` ou `/app/employee/page.tsx`:

```tsx
<div className="space-y-4">
  <h3 className="text-lg font-semibold">Configuração de Turno</h3>
  
  <div>
    <label>Tipo de Turno</label>
    <select value={shift} onChange={(e) => setShift(e.target.value)}>
      <option value="MORNING">Período da Manhã</option>
      <option value="AFTERNOON">Período da Tarde</option>
      <option value="NIGHT">Período Noturno</option>
      <option value="HYBRID">Período Híbrido</option>
    </select>
  </div>
  
  <div>
    <label>Horário de Início</label>
    <input type="time" value={shiftStartTime} onChange={(e) => setShiftStartTime(e.target.value)} />
  </div>
  
  <div>
    <label>Horário de Fim</label>
    <input type="time" value={shiftEndTime} onChange={(e) => setShiftEndTime(e.target.value)} />
  </div>
  
  <div>
    <label>Dias de Trabalho por Semana</label>
    <input type="number" min="1" max="7" value={workingDaysPerWeek} onChange={(e) => setWorkingDaysPerWeek(Number(e.target.value))} />
  </div>
  
  <div>
    <label>
      <input type="checkbox" checked={allowFlexibleHours} onChange={(e) => setAllowFlexibleHours(e.target.checked)} />
      Permitir horas flexíveis?
    </label>
  </div>
</div>
```

## 🧪 Testes

### Teste 1: Entrada Válida

```typescript
const result = validateEntryTime(
  new Date('2025-11-18T08:15:00'),
  {
    weeklyHours: 20,
    shift: 'MORNING',
    shiftStartTime: '08:00',
    shiftEndTime: '12:00',
    workingDaysPerWeek: 5,
    allowFlexibleHours: false
  }
)

expect(result.isValid).toBe(true)
expect(result.expectedDailyHours).toBe(4)
```

### Teste 2: Entrada Fora da Janela

```typescript
const result = validateEntryTime(
  new Date('2025-11-18T09:00:00'), // Fora da janela 07:30-08:30
  userConfig
)

expect(result.isValid).toBe(false)
expect(result.warnings.length).toBeGreaterThan(0)
```

### Teste 3: Múltiplas Batidas

```typescript
const lastRecord = new Date('2025-11-18T08:15:00')
const currentTime = new Date('2025-11-18T08:16:00') // 1 minuto depois

const result = validateMultipleClocks(lastRecord, currentTime, 'EXIT', userConfig)

expect(result.isValid).toBe(true) // Passou 1 minuto
```

## 📚 Referências

- **Carga Horária**: Baseada em `user.weeklyHours`
- **Turno**: Baseado em `user.shift`
- **Horários**: `user.shiftStartTime` e `user.shiftEndTime`
- **Flexibilidade**: `user.allowFlexibleHours`

## 🚀 Próximos Passos

1. ✅ Criar migração do Prisma
2. ✅ Implementar validação de turno
3. [ ] Integrar com API de QR
4. [ ] Adicionar UI de configuração
5. [ ] Testar com dados reais
6. [ ] Documentar em Storybook
