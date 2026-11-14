# Spec PR 6b — Unificar telas duplicadas

Plano geral: diagnóstico D9 do plano "Formulários de estágio — diagnóstico e plano SDD".

## Pesquisa (estado atual)

- "Solicitação de Cadastro no Estágio" existia em quatro lugares: `app/documents/internship-registration`
  ("Ficha de Cadastro" no painel), `app/documents/internship-registration-request` (com a validação
  do PR #78), `app/employee/internship-registration` e `app/demo-form` (os dois últimos com
  `components/InternshipRegistrationForm.tsx`). Todos geram o mesmo documento.
- "Declaração de Atividades Profissionais" existia em `professional-activities` (linkada no painel,
  com datas de solicitação e autorização) e `professional-declaration` (sem link).
- Rascunhos no banco em 14/11/2026: 1 de `internship-registration` e 1 de `professional-declaration`,
  ambos de abril/2026.

## Arquivos

- REMOVER: `app/documents/internship-registration`, `app/employee/internship-registration`,
  `app/demo-form`, `components/InternshipRegistrationForm.tsx`,
  `app/documents/professional-declaration` e os templates `internship-registration.pdf.ts` e
  `professional-declaration.pdf.ts`.
- `next.config.mjs` — ALTERAR: `redirects()` temporários das rotas antigas para as que ficam.
- `app/employee/page.tsx` — ALTERAR: tira o link "Ficha de Cadastro" e usa o nome oficial
  "Declaração de Atividades Profissionais".
- `lib/form-types.ts` — ALTERAR: mantém os dois tipos antigos, marcados como legado, para a API
  continuar lendo e apagando rascunhos antigos.

## Critério de aceite

Cada documento tem uma tela só; links antigos redirecionam; lint, format:check, type-check e Jest
passam.
