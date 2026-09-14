# Chronos System

Sistema de registro de ponto eletrônico e gestão de estágios, construído como monolito Next.js (App Router). Usado para controlar a frequência de estagiários via QR Code, com painéis dedicados para administração, supervisão e o próprio estagiário.

## Principais funcionalidades

- **Registro de ponto por QR Code**: QR dinâmico gerado por máquina/terminal físico (`Machine`), com assinatura própria (`QR_SECRET`) e nonce de uso único para evitar reuso.
- **Modo kiosk**: terminal público dedicado (`/kiosk`) para leitura de QR Code em dispositivos fixos, provisionado com um segredo próprio (`KIOSK_PROVISION_SECRET`).
- **Papéis de acesso**: `ADMIN`, `SUPERVISOR` e `EMPLOYEE` (estagiário), cada um com seu painel e permissões.
- **Painel administrativo**: gestão de usuários, máquinas, feriados, escalas, relatórios de frequência e justificativas, e auditoria.
- **Auditoria com cadeia de hash**: toda ação sensível é registrada em `AuditLog` com verificação de integridade encadeada (hash chain), com uma tela dedicada para checar a cadeia.
- **Justificativas de falta/atraso**: fluxo de submissão pelo estagiário e aprovação/rejeição pelo admin/supervisor.
- **Documentos de estágio**: geração de termo de compromisso, termo aditivo, termo de rescisão, declaração de estágio, relatórios mensal/semestral/final, avaliação do estudante, entre outros, em PDF.
- **Autenticação**: login por credenciais (e-mail/senha) ou Google OAuth restrito a domínios institucionais configuráveis, com suporte a autenticação em dois fatores (2FA).
- **Notificações**: e-mail (SMTP) e push (Web Push/VAPID) para lembretes de ponto e alertas de justificativas pendentes, disparados por cron jobs com histórico de execução (`CronLog`) visível no painel admin.
- **PWA**: instalável, com ícone e tema próprios (`public/manifest.json`).
- **Rate limiting e cache**: via Redis, com fallback em memória quando não configurado (desenvolvimento).

## Tecnologias principais

- [Next.js 16](https://nextjs.org/) (App Router) + React 18
- [Prisma 5](https://www.prisma.io/) + PostgreSQL (hospedado no Supabase em produção)
- [NextAuth.js](https://next-auth.js.org/) (credenciais + Google OAuth)
- Tailwind CSS
- Redis (`ioredis`) para rate limiting/cache
- Nodemailer (e-mail) e `web-push` (notificações push)
- `qrcode` / `jsqr` (geração e leitura de QR Code)
- `pdfmake` (geração de documentos em PDF)
- Jest (testes unitários) e Playwright (testes end-to-end)

## Instalação

1. Clone o repositório e instale as dependências:
   ```bash
   npm install
   ```
   (o `postinstall` já roda `prisma generate` automaticamente)

2. Crie um arquivo `.env` na raiz a partir do `.env.example` e configure ao menos:
   - `DATABASE_URL` / `DIRECT_URL`: conexão PostgreSQL (pooler e direta, usadas pelo Prisma)
   - `NEXTAUTH_URL` e `NEXTAUTH_SECRET`
   - `QR_SECRET` e `KIOSK_PROVISION_SECRET`
   - `CRON_SECRET`: obrigatório para os endpoints `/api/cron/*` e `/api/notifications/cron` (fail-closed sem ele)
   - Credenciais SMTP (envio de e-mail) e, opcionalmente, chaves VAPID (push) e Google OAuth

   Veja `.env.example` para a lista completa e comentada de variáveis.

3. Aplique o schema no banco de desenvolvimento e gere o client do Prisma:
   ```bash
   npm run db:push
   ```

## Rodando localmente

```bash
npm run dev
```

A aplicação sobe em `http://localhost:5000`.

## Scripts disponíveis

- `npm run dev` — servidor de desenvolvimento (porta 5000)
- `npm run build` / `npm start` — build e start de produção
- `npm run lint` / `npm run lint:fix` — linting
- `npm run format` / `npm run format:check` — formatação (Prettier)
- `npm run type-check` — checagem de tipos (`tsc --noEmit`)
- `npm run test` / `npm run test:watch` / `npm run test:coverage` — testes unitários (Jest)
- `npm run test:e2e` / `npm run test:e2e:ui` — testes end-to-end (Playwright)
- `npm run db:push` / `npm run db:studio` / `npm run db:seed` / `npm run db:reset` — utilitários do Prisma

## Deploy

O deploy é feito na Vercel, com banco PostgreSQL no Supabase. O script `vercel-build` roda `prisma migrate deploy` (aplicando migrações pendentes) **somente no ambiente de produção** (`VERCEL_ENV=production`) antes do build — uma migração que falhe em produção interrompe o deploy, em vez de subir com o schema desatualizado. Em preview/desenvolvimento essa etapa é pulada, já que esses ambientes não têm `DIRECT_URL` configurada.

Os cron jobs de notificação (`/api/cron/daily-justification-check`, `/api/notifications/cron`) são autenticados por `CRON_SECRET` e devem ser agendados externamente (ex.: Vercel Cron ou GitHub Actions).

## Testes

```bash
npm run test        # unitários
npm run test:e2e    # end-to-end (Playwright)
npm run test:all    # ambos
```

## Documentação adicional

A pasta [`docs/`](docs) reúne guias mais específicos (arquitetura, API, variáveis de ambiente, segurança, deploy etc.).

## Licença

Este projeto está licenciado sob a licença GNU GPLv3 — veja o arquivo [LICENSE](LICENSE) para mais detalhes.
