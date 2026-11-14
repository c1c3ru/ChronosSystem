# Spec PR 6a — Pré-preenchimento pelo perfil e horas pelo ponto

Plano geral: diagnósticos D10 e D11 do plano "Formulários de estágio — diagnóstico e plano SDD".
A unificação das telas duplicadas (D9) fica para o PR 6b.

## Pesquisa (estado atual)

- Os relatórios pedem nome, matrícula, período e carga horária digitados à mão, embora o sistema já
  tenha esses dados: `User.name`, `User.registrationNumber`, `User.contractStartDate`,
  `User.contractEndDate` e os registros de ponto (`AttendanceRecord`, `ENTRY`/`EXIT`).
- Os registros de ponto seguem a convenção "fake-UTC" (`lib/timezone.ts`): o dia local é o dia UTC
  do timestamp. O painel do aluno (`app/api/employee/dashboard-enhanced`) soma as horas de um dia
  pareando, em ordem, a n-ésima entrada com a n-ésima saída daquele dia; entrada sem saída não conta.
- Formulários com carga horária: `monthly-report` (hours_month, hours_total), `semester-report`
  (hours_semester, hours_total), `final-report` (total_hours) e `realization-term`
  (realized_hours).

## Arquivos

### `lib/internship-prefill.ts` — CRIAR (funções puras, sem Prisma)

- `PREFILL_FORM_TYPES`: os 4 formulários acima.
- `sumWorkedHours(records)`: agrupa por dia UTC, pareia entrada/saída como o painel e devolve horas.
- `formatHours(h)`: arredonda para 1 casa (`"80"`, `"80.5"`).
- `defaultPeriod(formType, today, contractStart, contractEnd)`:
  - mensal: do dia 1 do mês corrente (ou do início do contrato, se for depois) até hoje;
  - semestral: dos últimos 6 meses (ou do início do contrato) até hoje;
  - final e termo de realização: do início ao fim do contrato (fim limitado a hoje para as horas).
- `buildPrefillValues(formType, profile, period, hours)`: devolve os campos do formulário.
- `mergePrefill(current, prefill)`: só preenche campos vazios; o que já está no rascunho vence.

### `app/api/employee/internship-prefill/route.ts` — CRIAR

- `GET ?formType=...&from=YYYY-MM-DD&to=YYYY-MM-DD` (from/to opcionais), só os dados do próprio
  usuário logado.
- Lê o perfil, calcula o período (o informado ou o padrão), busca o ponto de
  `min(from, início do contrato)` até `to` e devolve `{ values, period }` com as horas do período e
  as acumuladas desde o início do contrato.

### `lib/internship-prefill-client.ts` — CRIAR

- `fetchInternshipPrefill(formType, period?)`: chama a API; falha silenciosa (devolve `null`).

### Páginas — ALTERAR

- Os 4 formulários: ao abrir, carregam o rascunho e completam os campos vazios com o retorno da API.
- Mensal e semestral: botão "Recalcular pelo ponto" que usa o período digitado e sobrescreve só os
  campos de carga horária.
- Campos de horas aceitam decimal (`step="0.1"`).

### `__tests__/lib/internship-prefill.test.ts` — CRIAR

- Pareamento por dia, entrada sem saída ignorada, dia sem registros, arredondamento.
- Períodos padrão (mês corrente, contrato começando no meio do mês, semestral, final).
- `mergePrefill` não sobrescreve campo preenchido.

## Critério de aceite

O relatório mensal abre com nome, matrícula, período do mês e horas do mês já preenchidos, com as
mesmas horas que o painel soma por dia; lint, format:check, type-check e Jest passam.
