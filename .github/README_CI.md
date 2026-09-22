# Workflows do GitHub Actions

Este repositório tem três workflows, cada um com um papel bem separado.

## 1. `ci.yml` — Qualidade do código

Roda em todo pull request para `main`, em todo push para `main` e sob demanda
(`workflow_dispatch`). Um único job executa, em runner hospedado pelo GitHub:

- `npm ci` e `npx prisma generate`
- `npm run lint`
- `npm run format:check`
- `npm run type-check`
- `npm test`

Nenhum teste abre conexão real com banco ou SMTP; as variáveis de ambiente
definidas no workflow existem só porque os módulos importados esperam
encontrá-las.

Se o passo de formatação reprovar, rode `npm run format` e comite o resultado.

## 2. `attendance-reminder-cron.yml` — Lembrete de entrada/saída

Chama `/api/notifications/cron` a cada 10 minutos no horário comercial. Existe
como workflow porque o plano gratuito da Vercel não oferece Cron Jobs.

## 3. `daily-justification-cron.yml` — Lembrete de justificativas pendentes

Chama `/api/cron/daily-justification-check` uma vez por dia útil, às 09:05 BRT.

Os dois crons ficam separados do `ci.yml` de propósito: com workflows distintos,
cada um tem sua própria concurrency e um push nunca cancela um disparo de cron
em andamento.

## Secrets necessários

- `CRON_SECRET`: usado pelos dois workflows de cron para autenticar a chamada
  nas rotas `/api/cron/*` e `/api/notifications/cron`. Precisa ser o mesmo valor
  configurado na Vercel.

O `ci.yml` não depende de nenhum secret.

## Deploy

O deploy não passa por GitHub Actions. Produção roda na Vercel, conectada pela
integração nativa Git -> Vercel (projeto `chronos-system`): todo push em `main`
já dispara build e deploy automaticamente.
