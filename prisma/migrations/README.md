Este diretório é reservado para **migrations do Prisma** (geradas por `prisma migrate dev`).

## Por quê?
- O deploy em produção usa `npx prisma migrate deploy`, que **aplica apenas migrations versionadas**.
- Isso evita mudanças de schema “fora de trilha” (como `db push`) e torna o deploy reprodutível/auditável.

## Como gerar a primeira migration
Em um ambiente local apontando para um banco de desenvolvimento:

```bash
npx prisma migrate dev --name init
```

Depois, versione o conteúdo de `prisma/migrations/**`.
