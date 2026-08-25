Este diretório contém as **migrations do Prisma**, aplicadas em produção via `npx prisma migrate deploy`.

## Por quê?

- O deploy em produção usa `npx prisma migrate deploy`, que **aplica apenas migrations versionadas**.
- Isso evita mudanças de schema "fora de trilha" (como `db push --accept-data-loss`) e torna o deploy reprodutível/auditável.
- O workflow de CI (`.github/workflows/chronos-pipeline.yml`) **não** tem mais fallback automático para `db push`: se `migrate deploy` falhar, o deploy para e exige revisão manual.

## Migration `_init`

A migration `_init` neste diretório é uma **baseline**: foi gerada com
`prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script`
a partir do `schema.prisma` atual — ela recria, do zero, exatamente o schema que já está em uso
em produção (que até agora era mantido via `prisma db push`).

### Passo único de adoção em produção (antes do primeiro `migrate deploy`)

Como o banco de produção **já tem** essas tabelas (criadas via `db push`), aplicar a migration
`_init` normalmente falharia (`relation already exists`). Antes do primeiro deploy com o novo
pipeline, rode **uma vez**, contra o banco de produção, com `DATABASE_URL` apontando para ele:

```bash
npx prisma migrate resolve --applied 20260825173351_init
```

Isso apenas registra a migration como já aplicada na tabela `_prisma_migrations`, sem executar o
SQL (que recriaria tabelas existentes). A partir daí, `prisma migrate deploy` funciona
normalmente para todas as migrations futuras.

Em um banco novo (ex.: ambiente de desenvolvimento vazio), basta rodar `prisma migrate deploy`
normalmente — a migration `_init` cria o schema do zero.

## Como gerar novas migrations

Em um ambiente local apontando para um banco de desenvolvimento:

```bash
npx prisma migrate dev --name nome_da_mudanca
```

Depois, versione o conteúdo gerado em `prisma/migrations/**`.
