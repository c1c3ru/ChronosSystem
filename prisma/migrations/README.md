Este diretório contém as **migrations do Prisma**, aplicadas em produção via `npx prisma migrate deploy`.

## Por quê?

- O deploy em produção (Vercel) roda `npx prisma migrate deploy` como parte do script `vercel-build`
  do `package.json`, **antes** de `next build` — é assim que migrations versionadas chegam ao banco.
- Isso evita mudanças de schema "fora de trilha" (como `db push --accept-data-loss`) e torna o deploy
  reprodutível/auditável.
- **Atenção:** por um tempo esse script não existiu (o workflow de CI que rodava `migrate deploy`
  foi removido e nada o substituiu), então migrations commitadas nesse período — como
  `20260902132210_add_student_registration_number` — nunca chegaram a ser aplicadas em produção,
  mesmo com o código já esperando por elas. Isso quebrou rotas que liam a coluna nova. Se algo
  parecido acontecer de novo, `app/api/admin/system/repair-registration-number-column/route.ts` é
  um exemplo de reparo emergencial via SQL direto (idempotente) que não depende do pipeline de
  migration para desbloquear produção na hora.

### ⚠️ Estado atual: `vercel-build` está em modo não-bloqueante

`vercel-build` hoje é `(prisma migrate deploy || true) && next build` — a falha do `migrate deploy`
**não** derruba o build. Isso é temporário: ao ligar esse script pela primeira vez, `migrate deploy`
falhou em produção com `P3018 relation "Account" already exists` (o passo de adoção da migration
`_init` abaixo nunca foi executado) e em Preview por faltar `DIRECT_URL` naquele ambiente — e um
`vercel-build` que falha bloqueia *todo* deploy, não só quem toca na coluna nova, então foi
revertido para não-bloqueante às pressas para não deixar o site inteiro sem poder receber deploy
novo. Antes de voltar a fazer `vercel-build` estrito (remover o `|| true`):

1. Rode o "Passo único de adoção" abaixo contra o banco de produção.
2. Configure `DIRECT_URL` (conexão direta, não pooled) também no ambiente Preview da Vercel.
3. Confirme com um deploy de teste que `migrate deploy` passa limpo antes de remover o `|| true`.

Enquanto isso não acontece, migrations novas continuam precisando do reparo manual/endpoint de
emergência de sempre — o `vercel-build` não está de fato aplicando nada ainda.

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
