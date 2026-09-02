Este diretório contém as **migrations do Prisma**, aplicadas em produção via `npx prisma migrate deploy`.

## Por quê?

- O deploy em produção (Vercel) roda `npx prisma migrate deploy` como parte do script `vercel-build`
  do `package.json`, **antes** de `next build` — é assim que migrations versionadas chegam ao banco.
  Se `migrate deploy` falhar, o build inteiro falha e a Vercel mantém o último deploy que funcionava
  no ar (não publica código novo esperando uma coluna/tabela que o banco ainda não tem).
- Isso evita mudanças de schema "fora de trilha" (como `db push --accept-data-loss`) e torna o deploy
  reprodutível/auditável.
- **Atenção:** por um tempo esse script não existiu (o workflow de CI que rodava `migrate deploy`
  foi removido e nada o substituiu), então migrations commitadas nesse período — como
  `20260902132210_add_student_registration_number` — nunca chegaram a ser aplicadas em produção,
  mesmo com o código já esperando por elas. Isso quebrou rotas que liam a coluna nova. Se algo
  parecido acontecer de novo, `app/api/admin/system/repair-registration-number-column/route.ts` é
  um exemplo de reparo emergencial via SQL direto (idempotente) que não depende do pipeline de
  migration para desbloquear produção na hora.

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
