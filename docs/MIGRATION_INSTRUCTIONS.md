# Instruções de Migração - Campos de Turno

## 🔄 Próximos Passos

Após fazer o commit, execute os seguintes comandos para aplicar as mudanças ao banco de dados:

### 1. Criar Migração do Prisma

```bash
npx prisma migrate dev --name add_shift_configuration
```

Este comando irá:

- ✅ Criar um arquivo de migração em `prisma/migrations/`
- ✅ Aplicar as mudanças ao banco de dados
- ✅ Regenerar o Prisma Client

### 2. Verificar o Schema

```bash
npx prisma db push
```

### 3. Regenerar Prisma Client (se necessário)

```bash
npx prisma generate
```

## 📝 Mudanças no Schema

### Novos Campos no Modelo User

```prisma
shift             String       @default("MORNING")
shiftStartTime    String       @default("08:00")
shiftEndTime      String       @default("12:00")
workingDaysPerWeek Int         @default(5)
allowFlexibleHours Boolean     @default(false)
```

## 🎯 Campos Adicionados aos Formulários

### Complete Profile Form

- `shift` - Tipo de turno (MORNING, AFTERNOON, NIGHT, HYBRID)
- `shiftStartTime` - Horário de início (HH:MM)
- `shiftEndTime` - Horário de fim (HH:MM)
- `workingDaysPerWeek` - Dias de trabalho por semana
- `allowFlexibleHours` - Permite horas flexíveis?

### API Endpoint

- `/api/auth/complete-profile` - Agora aceita os novos campos de turno

## ✅ Validações

Os campos de turno são:

- **Opcionais** no formulário (têm valores padrão)
- **Salvos** no banco de dados com valores padrão se não fornecidos
- **Utilizados** pela API de validação de ponto (`lib/shift-validation.ts`)

## 🚀 Após a Migração

1. Reinicie o servidor de desenvolvimento
2. Teste o formulário de complete-profile
3. Verifique se os campos de turno aparecem
4. Teste a validação de ponto com os novos horários

## 📋 Checklist

- [ ] Executar `npx prisma migrate dev --name add_shift_configuration`
- [ ] Verificar se a migração foi criada em `prisma/migrations/`
- [ ] Verificar se o banco de dados foi atualizado
- [ ] Reiniciar servidor de desenvolvimento
- [ ] Testar formulário de complete-profile
- [ ] Testar validação de ponto com novos horários
- [ ] Fazer commit das mudanças
