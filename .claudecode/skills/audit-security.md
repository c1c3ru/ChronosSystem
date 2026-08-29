---
name: audit-security
description: Audita o repositório nas 5 categorias (Isolamento, Permissões Frontend vs Backend, IDOR, Chaves Expostas, XSS), gera docs/security-audit/relatorio-auditoria-seguranca.pdf com gráficos e templates de issues. Use quando o usuário pedir uma auditoria de segurança, um relatório de segurança em PDF, ou disser "roda a audit-security" / "atualiza o relatório de auditoria".
---

# Skill: Auditoria de Segurança (audit-security)

Reproduz a auditoria de segurança do Chronos System com a mesma metodologia,
paleta de cores e estrutura de relatório usadas na primeira execução
(2026-08-29). Sempre que o usuário pedir uma nova auditoria, siga este
runbook do zero — não copie achados antigos sem reverificar o código atual.

## Quando usar

- "Audita o repositório de novo" / "atualiza o relatório de segurança"
- "Roda a audit-security"
- Antes de uma release grande, ou depois de mudanças em autenticação,
  autorização, rotas de API, ou geração de HTML/PDF
- Quando o usuário pedir uma auditoria de Isolamento, Permissões
  Frontend vs Backend, IDOR, Chaves Expostas ou XSS especificamente

## Regra de ouro

**Nunca reporte um achado sem ter lido o arquivo e a linha exata.** Se uma
hipótese não puder ser confirmada lendo o código-fonte atual (não a
documentação em docs/, que pode estar desatualizada — já vimos isso
acontecer aqui: docs/SECURITY.md descreve uma arquitetura NestJS que não
existe neste projeto), ela não entra no relatório como achado — no máximo
como "hipótese não confirmada" em uma nota à parte. O mesmo vale para
"pontos fortes": só documente uma proteção como forte se você a leu
funcionando no código, não porque "normalmente é assim que se faz".

## Passo 1 — Reconhecimento de stack (sempre primeiro, antes de reportar)

Releia o projeto a cada execução — dependências mudam. Não assuma que o
stack de 2026-08-29 (Next.js 16 App Router + Prisma/PostgreSQL + NextAuth
v4 + Redis) ainda é o mesmo.

1. `package.json` → framework, ORM, autenticação, libs de PDF/QR/etc.
2. `prisma/schema.prisma` (ou equivalente) → modelo de dados, quais
   entidades têm `userId`/dono, quais são globais.
3. Middleware / gate de autorização do framework → hoje é `proxy.ts` na
   raiz (Next.js 16 renomeou `middleware.ts` → `proxy.ts`; confirme a
   convenção correta da versão instalada em
   `node_modules/next/dist/lib/constants.js` antes de assumir que um
   arquivo está "morto" só porque o nome parece errado — foi verificado
   assim nesta auditoria e evitou um falso positivo grave).
4. `.env.example` → quais segredos existem e para que servem.
5. Rotas de API (`app/api/**/route.ts` ou equivalente) → liste todas antes
   de began a varredura, para não pular nenhuma.

Só depois de mapear isso, reinterprete as 5 categorias PARA ESTE STACK
específico (não use a definição genérica de cabeça) — este é o texto que
vira a seção 1 do PDF. Exemplo do que foi escrito para o stack de
2026-08-29, para servir de modelo de profundidade (adapte se o stack
mudou):

- **Isolamento**: o segredo mestre nunca deve alcançar um dispositivo
  cliente; comprometer um terminal/processo não deve comprometer os
  demais; endpoints intencionalmente públicos não devem vazar mais dado
  do que o necessário.
- **Permissões no Frontend vs Backend**: toda decisão de autorização
  visível na UI tem um espelho obrigatório no servidor, ou existe um
  caminho que confia no que o cliente decidiu não mostrar?
- **IDOR**: dá para buscar/alterar o registro de OUTRO usuário trocando
  um id/userId na URL ou no corpo, sem o handler conferir
  `session.user.id` ou role?
- **Chaves Expostas**: além do .env commitado / string hardcoded — em
  qualquer framework com bundling client-side (Next.js, Vite, etc.), todo
  módulo importado por um componente client-side vai para o bundle do
  navegador, mesmo que nunca apareça em uma resposta de API.
- **XSS**: onde o código sai do "trilho seguro" do framework (em React,
  fora do JSX — ex.: `dangerouslySetInnerHTML`, strings HTML montadas à
  mão em respostas de API, `eval`).

## Passo 2 — Varredura profunda (arquivo por arquivo, linha por linha)

Para cada uma das 5 categorias:

1. Comece com `grep`/busca ampla para localizar candidatos (rotas com
   `[id]`, `searchParams.get('userId'|'email'|...)`, uso ou ausência de
   checagem de sessão, `dangerouslySetInnerHTML`/`innerHTML`/`eval`,
   arquivos com "secret"/"key"/"token" no nome ou conteúdo, módulos
   importados por arquivos `'use client'`).
2. Leia cada candidato por completo — não confie em um trecho isolado do
   grep. Um `grep` mostra a linha; só a leitura do arquivo mostra se
   existe uma checagem de autorização 20 linhas antes.
3. Antes de fechar um achado, pergunte: "isso é alcançável de verdade?"
   — confira se existe um middleware/gate cobrindo aquele path antes de
   assumir que uma rota está desprotegida (o middleware pode bloquear o
   acesso antes mesmo do handler rodar — como aconteceu com
   `/api/users/[id]` nesta auditoria: o bug existe, mas só é explorável
   por SUPERVISOR, não por EMPLOYEE, porque o middleware já bloqueia
   EMPLOYEE nesse prefixo).
4. Registre também os **pontos fortes** — proteções corretas que você
   verificou linha a linha (comparações timing-safe, checagens de posse
   consistentes, ausência confirmada de sinks perigosos, etc.). O
   critério de sucesso desta skill exige pelo menos 1 ponto forte E 1
   ponto fraco por rodada (ou uma validação explícita de "100% seguro
   nesta categoria" se não houver achado real — não invente achado para
   preencher categoria).
5. Justifique a severidade (CRITICAL/HIGH/MEDIUM/LOW) pelo impacto real e
   pela facilidade de exploração — não pelo "soa grave". Documente o
   pré-requisito de exploração (ex.: "requer uma conta SUPERVISOR
   existente" muda HIGH de "qualquer visitante" para "só um papel já
   privilegiado consegue").

## Passo 3 — Estruturar os dados

Edite `docs/security-audit/audit_data.json` com o resultado da varredura
(mantenha o schema — `meta`, `stack`, `category_definitions`,
`strengths[]`, `findings[]`, `recommendations_prioritized[]`, `notes[]`).
Cada item de `findings` e `strengths` precisa de `file`/`files` com
caminho relativo ao repo e `line` com o número ou intervalo exato.

Não escreva HTML bruto (`<td>`, `<script>`, etc.) sem se preocupar — o
script escapa tudo automaticamente (`esc()`/`esc_br()` em
`generate_report.py`) antes de colocar no PDF, então cite o código-fonte
literal na evidência sem medo de quebrar o layout.

## Passo 4 — Gerar o PDF (script isolado, sem tocar no Python global)

```bash
cd docs/security-audit
python3 -m venv .venv        # só na primeira vez, ou se a venv sumiu
source .venv/bin/activate
pip install -r requirements.txt
python generate_report.py
```

O script (`docs/security-audit/generate_report.py`) lê
`audit_data.json`, gera dois gráficos com matplotlib (rosca de
severidade + barras de categoria) e monta o PDF com reportlab em
`docs/security-audit/relatorio-auditoria-seguranca.pdf`. Não precisa
tocar no código do script para uma auditoria de rotina — só o JSON muda.
Se novas seções forem necessárias, edite `generate_report.py`, mas
preserve a paleta e a ordem de seções abaixo.

Depois de gerar, **abra o PDF e confira visualmente** (o tool `Read`
consegue renderizar páginas de PDF) — pelo menos a capa, o resumo
executivo com os gráficos, uma página de achado, e a última página do
anexo. Erros de layout (texto cortado, tabela estourando a margem) são
mais fáceis de ver do que de prever lendo o código do script.

## Paleta hexadecimal canônica (não mudar sem atualizar as duas pontas)

Definida em `PALETTE` no topo de `generate_report.py` — mantenha os dois
arquivos (script + esta skill) sincronizados se a paleta mudar.

| Uso | Token | Hex |
|---|---|---|
| Fundo escuro (capa) | `ink` | `#0F172A` |
| Texto secundário | `muted` | `#475569` |
| Linhas/bordas | `line` | `#CBD5E1` |
| Fundo de página | `paper` | `#FFFFFF` |
| Fundo de painel/zebra | `panel` | `#F1F5F9` |
| Acento de marca (verde do próprio app) | `brand` | `#22C55E` |
| Pontos fortes | `strength` | `#15803D` |
| Severidade — Crítica | `severity.CRITICAL` | `#B91C1C` |
| Severidade — Alta | `severity.HIGH` | `#EA580C` |
| Severidade — Média | `severity.MEDIUM` | `#D97706` |
| Severidade — Baixa | `severity.LOW` | `#2563EB` |
| Categoria — Isolamento | `category.Isolamento` | `#0E7490` |
| Categoria — Permissões Frontend vs Backend | `category["Permissões..."]` | `#6D28D9` |
| Categoria — IDOR | `category.IDOR` | `#BE185D` |
| Categoria — Chaves Expostas | `category["Chaves Expostas"]` | `#92400E` |
| Categoria — XSS | `category.XSS` | `#3730A3` |

Se uma nova rodada de auditoria adicionar uma 6ª categoria (fora do
escopo original), escolha uma cor nova que não colida em tom com as
existentes e some-a às duas tabelas (`PALETTE["category"]` no script e
esta tabela aqui).

## Estrutura fixa do relatório (não reordenar as seções)

1. **Capa** — título, subtítulo com as 5 categorias, cartões de
   severidade e chips de categoria (já antecipam as cores dos gráficos),
   metadados (repo/branch/data/auditor).
2. **Metodologia e Reconhecimento de Stack** — tabela de stack +
   definição de cada categoria para este projeto específico.
3. **Resumo Executivo** — texto curto + gráfico de rosca (severidade) +
   gráfico de barras (categoria).
4. **Pontos Fortes Verificados** — tabela ID/Categoria/Arquivo:Linha/Descrição.
5. **Achados Detalhados** — um bloco por achado: título + badge de
   severidade, categoria, local (arquivo:linha), descrição, evidência
   (bloco mono), impacto, recomendação.
6. **Recomendações Priorizadas** — tabela ordenada por risco combinado.
7. **Anexo — Templates de Issues (Markdown)** — um template por achado
   MEDIUM+ (título, labels, severidade, categoria, impacto, evidência em
   bloco de código, arquivos afetados, recomendação, checklist de
   aceite). Gerado automaticamente por `render_issue_markdown()` a partir
   de `findings[]` — não precisa escrever à mão.

## Passo 5 — Resumir no chat

Depois de gerar o PDF, responda ao usuário no chat (não só no PDF) com:

- Confirmação de que o stack foi mapeado (uma frase).
- Lista dos achados, um por um, no formato
  `[SEVERIDADE] arquivo:linha — resumo de uma frase`.
- Pelo menos um ponto forte citado explicitamente.
- Caminho do PDF gerado e contagem de páginas.
- Se algum achado CRITICAL/HIGH foi encontrado, destaque-o antes do
  resto — não deixe enterrado no meio da lista.

## Limites e re-tentativas

Se `pip install` falhar (sem rede, wheel indisponível para a versão do
Python instalada, etc.), NÃO caia para instalar reportlab/matplotlib
globalmente — tente novamente dentro da venv, e só se persistir, avise o
usuário explicitamente que a geração do PDF está bloqueada por ambiente e
descreva o erro exato. Da mesma forma, se um achado não puder ser
confirmado com confiança depois de investigar, é melhor reportá-lo como
"suspeita não confirmada" nas notas do que inflar a lista de achados.
