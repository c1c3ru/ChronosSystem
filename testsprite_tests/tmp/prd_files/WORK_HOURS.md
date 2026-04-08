# ⏰ Sistema de Controle de Carga Horária - ChronosSystem

## 📋 Visão Geral

O **ChronosSystem** agora inclui um sistema completo de controle de carga horária para estagiários, com:

- ✅ Contagem automática de horas trabalhadas
- ✅ Validações de jornada e intervalos
- ✅ Controle de contrato (início, fim, carga horária total)
- ✅ Cálculo de horas restantes e projeção de término
- ✅ Relatórios diários, semanais e mensais
- ✅ Alertas de violações e irregularidades

## 🎯 Funcionalidades

### 1. Dados do Contrato

Cada estagiário possui:

| Campo | Descrição | Padrão |
|-------|-----------|--------|
| `contractStartDate` | Data de início do estágio | - |
| `contractEndDate` | Data de término do estágio | - |
| `totalContractHours` | Carga horária total (ex: 800h) | - |
| `weeklyHours` | Horas semanais | 30h |
| `dailyHours` | Horas diárias | 6h |

### 2. Cálculo Automático de Horas

O sistema calcula automaticamente:

- **Horas trabalhadas por dia**
- **Horas trabalhadas por semana**
- **Horas trabalhadas por mês**
- **Total de horas cumpridas**
- **Horas restantes para completar o contrato**
- **Percentual de conclusão**
- **Projeção de data de término**

### 3. Validações Implementadas

#### Sequência ENTRADA → SAÍDA
- Não permite registrar ENTRADA consecutivamente
- Não permite registrar SAÍDA sem ENTRADA prévia
- Primeiro registro do dia deve ser ENTRADA

#### Jornada Máxima
- Máximo de 6 horas/dia (padrão para estagiários)
- Alerta quando ultrapassar o limite
- Bloqueia novos registros após atingir o máximo

#### Horário Permitido
- Registros permitidos entre **06:00 e 22:00**
- Bloqueia registros fora deste horário

#### Intervalo Obrigatório
- Após 4h de trabalho, exige intervalo de 15min
- Detecta quando não há intervalo
- Marca como violação

### 4. Resumo Diário (WorkSummary)

Para cada dia, o sistema calcula:

```typescript
{
  date: "2025-10-15",
  firstEntry: "08:00:00",      // Primeira entrada
  lastExit: "17:00:00",         // Última saída
  totalMinutes: 360,            // Total de minutos (6h)
  breakMinutes: 60,             // Minutos de intervalo (1h)
  workedMinutes: 300,           // Minutos efetivos (5h)
  hasIncomplete: false,         // Entrada sem saída?
  hasExtraHours: false,         // Ultrapassou limite?
  hasViolation: false,          // Alguma violação?
  violationReason: null,        // Motivo da violação
  entriesCount: 2,              // Número de entradas
  exitsCount: 2                 // Número de saídas
}
```

### 5. Resumo do Contrato

```typescript
{
  totalWorkedHours: 450,        // Horas já cumpridas
  totalContractHours: 800,      // Horas totais do contrato
  remainingHours: 350,          // Horas restantes
  percentageComplete: 56.25,    // Percentual concluído
  daysRemaining: 45,            // Dias até o fim do contrato
  averageHoursPerDay: 5.5,      // Média de horas/dia
  projectedEndDate: "2025-12-01", // Projeção de término
  isOnTrack: true               // Está no prazo?
}
```

## 🔌 API Endpoints

### GET /work-hours/daily
Resumo do dia atual ou de uma data específica.

**Query Params:**
- `date` (opcional): Data no formato ISO (ex: `2025-10-15`)

**Response:**
```json
{
  "date": "2025-10-15T00:00:00.000Z",
  "firstEntry": "2025-10-15T08:00:00.000Z",
  "lastExit": "2025-10-15T17:00:00.000Z",
  "totalMinutes": 360,
  "breakMinutes": 60,
  "workedMinutes": 300,
  "hasIncomplete": false,
  "hasExtraHours": false,
  "hasViolation": false,
  "violationReason": null,
  "entriesCount": 2,
  "exitsCount": 2
}
```

### GET /work-hours/weekly
Resumo da semana.

**Query Params:**
- `startDate` (opcional): Data de início da semana

**Response:**
```json
{
  "startDate": "2025-10-13T00:00:00.000Z",
  "endDate": "2025-10-20T00:00:00.000Z",
  "summaries": [...],
  "totalWorkedHours": 30,
  "daysWorked": 5,
  "averageHoursPerDay": 6
}
```

### GET /work-hours/monthly
Resumo do mês.

**Query Params:**
- `year` (opcional): Ano (ex: `2025`)
- `month` (opcional): Mês (ex: `10`)

**Response:**
```json
{
  "year": 2025,
  "month": 10,
  "startDate": "2025-10-01T00:00:00.000Z",
  "endDate": "2025-10-31T23:59:59.999Z",
  "summaries": [...],
  "totalWorkedHours": 120,
  "daysWorked": 20,
  "daysWithViolation": 2,
  "averageHoursPerDay": 6
}
```

### GET /work-hours/contract
Resumo completo do contrato.

**Response:**
```json
{
  "totalWorkedHours": 450,
  "totalContractHours": 800,
  "remainingHours": 350,
  "percentageComplete": 56.25,
  "daysRemaining": 45,
  "averageHoursPerDay": 5.5,
  "projectedEndDate": "2025-12-01T00:00:00.000Z",
  "isOnTrack": true
}
```

### GET /work-hours/user/:userId/daily
Resumo diário de um usuário específico (Admin/Supervisor).

### GET /work-hours/user/:userId/contract
Resumo do contrato de um usuário específico (Admin/Supervisor).

## 🗄️ Modelo de Dados

### User (atualizado)

```prisma
model User {
  // ... campos existentes
  
  // Dados do contrato
  contractStartDate  DateTime?
  contractEndDate    DateTime?
  totalContractHours Int?       // ex: 800
  weeklyHours        Int?       @default(30)
  dailyHours         Int?       @default(6)
  
  workSummaries      WorkSummary[]
}
```

### WorkSummary (novo)

```prisma
model WorkSummary {
  id              String    @id @default(uuid())
  userId          String
  date            DateTime  @db.Date
  
  firstEntry      DateTime?
  lastExit        DateTime?
  
  totalMinutes    Int       @default(0)
  breakMinutes    Int       @default(0)
  workedMinutes   Int       @default(0)
  
  hasIncomplete   Boolean   @default(false)
  hasExtraHours   Boolean   @default(false)
  hasViolation    Boolean   @default(false)
  violationReason String?
  
  entriesCount    Int       @default(0)
  exitsCount      Int       @default(0)
  
  user            User      @relation(fields: [userId], references: [id])
  
  @@unique([userId, date])
}
```

## 🚀 Como Usar

### 1. Configurar Dados do Contrato

Ao criar ou editar um estagiário, defina:

```typescript
PATCH /users/:id
{
  "contractStartDate": "2025-01-15",
  "contractEndDate": "2025-12-15",
  "totalContractHours": 800,
  "weeklyHours": 30,
  "dailyHours": 6
}
```

### 2. Registrar Ponto Normalmente

O sistema automaticamente:
- Valida se o registro é permitido
- Calcula as horas trabalhadas
- Atualiza o resumo diário
- Detecta violações

```typescript
POST /attendance/scan
{
  "qrData": "...",
  "type": "ENTRADA"
}
```

### 3. Consultar Horas

```typescript
// Horas de hoje
GET /work-hours/daily

// Horas da semana
GET /work-hours/weekly

// Resumo do contrato
GET /work-hours/contract
```

## 📊 Dashboard (Frontend)

O frontend deve exibir:

### Para Estagiários

1. **Card de Hoje**
   - Horas trabalhadas hoje
   - Próxima ação (ENTRADA/SAÍDA)
   - Tempo restante para completar a jornada

2. **Card do Contrato**
   - Percentual de conclusão
   - Horas cumpridas / Total
   - Horas restantes
   - Projeção de término
   - Status: "No prazo" ou "Atrasado"

3. **Gráfico Semanal**
   - Horas por dia da semana
   - Meta diária (linha)

4. **Alertas**
   - Violações detectadas
   - Dias com registros incompletos

### Para Administradores

1. **Lista de Estagiários**
   - Nome
   - Percentual de conclusão
   - Status (no prazo / atrasado)
   - Horas cumpridas / Total
   - Dias restantes

2. **Relatórios**
   - Exportar horas por período
   - Exportar violações
   - Exportar projeções

## ⚠️ Regras de Negócio

### Estagiários (Lei 11.788/2008)

- **Jornada máxima:** 6 horas/dia ou 30 horas/semana
- **Intervalo:** 15 minutos após 4 horas de trabalho
- **Horário:** Entre 06:00 e 22:00
- **Carga horária total:** Definida no contrato (ex: 800h)

### Validações Automáticas

- ❌ Bloqueia registro fora do horário permitido
- ❌ Bloqueia jornada acima do limite
- ❌ Detecta falta de intervalo
- ❌ Detecta entrada sem saída
- ✅ Permite correções via sistema de correções

## 🔄 Migração

Para aplicar as mudanças no banco:

```bash
cd backend

# Gerar Prisma Client
npx prisma generate

# Executar migração
npx prisma migrate deploy

# Ou criar nova migração
npx prisma migrate dev --name add_work_hours
```

## 📝 Exemplo de Uso Completo

```typescript
// 1. Criar estagiário com contrato
POST /users
{
  "email": "joao@example.com",
  "name": "João Silva",
  "role": "ESTAGIARIO",
  "contractStartDate": "2025-01-15",
  "contractEndDate": "2025-12-15",
  "totalContractHours": 800,
  "weeklyHours": 30,
  "dailyHours": 6
}

// 2. João registra entrada
POST /attendance/scan
{
  "qrData": "...",
  "type": "ENTRADA"
}
// Response: Sucesso

// 3. João tenta registrar entrada novamente
POST /attendance/scan
{
  "qrData": "...",
  "type": "ENTRADA"
}
// Response: Erro - "Não é possível registrar ENTRADA consecutivamente"

// 4. João registra saída após 6h
POST /attendance/scan
{
  "qrData": "...",
  "type": "SAIDA"
}
// Response: Sucesso

// 5. Consultar resumo do dia
GET /work-hours/daily
// Response: 6h trabalhadas, sem violações

// 6. Consultar resumo do contrato
GET /work-hours/contract
// Response: 6h cumpridas de 800h (0.75%), 794h restantes
```

## 🎨 Componentes de UI Sugeridos

### HoursCard
```tsx
<HoursCard
  title="Horas de Hoje"
  hours={6}
  maxHours={6}
  status="complete"
/>
```

### ContractProgress
```tsx
<ContractProgress
  completed={450}
  total={800}
  percentage={56.25}
  daysRemaining={45}
  isOnTrack={true}
/>
```

### WeeklyChart
```tsx
<WeeklyChart
  data={[
    { day: 'Seg', hours: 6 },
    { day: 'Ter', hours: 5.5 },
    { day: 'Qua', hours: 6 },
    { day: 'Qui', hours: 6 },
    { day: 'Sex', hours: 5 },
  ]}
  target={6}
/>
```

## 🔮 Próximas Melhorias

- [ ] Notificações quando atingir 80% da carga horária
- [ ] Alertas de prazo próximo ao vencimento
- [ ] Relatório PDF automático mensal
- [ ] Integração com folha de pagamento
- [ ] Dashboard de produtividade
- [ ] Comparação entre estagiários
- [ ] Metas personalizadas
- [ ] Gamificação (badges, conquistas)

---

**ChronosSystem** - Controle total sobre o tempo! ⏰
