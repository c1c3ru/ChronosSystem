# Segurança: rotação de segredos e purge do histórico

Você tinha segredos reais versionados em `.env.production`, `.env.local` e `.env.local.backup`. Esses arquivos já foram removidos do working tree, mas **os segredos ainda podem existir no histórico do git**.

## 1) Rotacione (revogue e gere novos)

Faça **antes** do purge, porque o histórico pode já ter sido clonado.

- **Vercel**
  - Revogue e gere um novo `VERCEL_TOKEN`
  - Revogue/regenere `VERCEL_PROJECT_ID`/`VERCEL_ORG_ID` se necessário
- **Google OAuth**
  - Gere um novo `GOOGLE_CLIENT_SECRET` (e revise redirect URIs)
  - Considere recriar credenciais se você não tem certeza do alcance do vazamento
- **NextAuth**
  - Gere um novo `NEXTAUTH_SECRET` (>= 32 chars, forte)
- **QR**
  - Gere um novo `QR_SECRET` (>= 32 chars, forte)
- **Banco/Prisma**
  - Troque `DATABASE_URL`/`POSTGRES_URL` (senha/usuário/rotas)
  - Se estiver usando Prisma Accelerate, revogue e gere novo `PRISMA_DATABASE_URL`

## 2) Garanta que apenas exemplos ficam no repo

- Mantenha `.env.example` (sem segredos reais)
- Use variáveis no painel da Vercel/GitHub Secrets para produção/CI
- Evite backups de `.env` dentro do repo (ex.: `*.backup`)

## 3) Purge do histórico (remove os segredos dos commits antigos)

**Atenção:** isso reescreve histórico. Em geral exige **force push** e coordenação com a equipe.

### Opção A (recomendada): `git filter-repo`

1. Instale `git-filter-repo` (conforme seu sistema).
2. Rode (no root do repo):

```bash
git filter-repo --force \
  --path .env.production --path .env.local --path .env.local.backup \
  --invert-paths
```

3. Depois, invalide objetos antigos no remoto (quando fizer push) e peça para todos re-clonarem ou seguirem instruções de “fresh clone”.

### Opção B: BFG Repo-Cleaner

Útil se você preferir uma ferramenta focada em limpeza de secrets/arquivos grandes.

## 4) Depois do purge

- Faça **nova rotação** (sim, de novo) se você suspeitar que tokens foram capturados durante o intervalo.
- Procure por chaves antigas em logs/variáveis e revogue tudo que ainda estiver válido.
- Considere habilitar *secret scanning* no GitHub, se aplicável.
