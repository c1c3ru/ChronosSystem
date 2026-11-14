# Spec PR 4 — Rascunhos seguros

Plano geral: diagnósticos D6 e D7 do plano "Formulários de estágio — diagnóstico e plano SDD".

## Pesquisa (estado atual)

- `lib/form-drafts.ts` grava a cópia local em `form_draft_<tipo>`, sem o usuário. Em computador
  compartilhado (laboratório, setor), o próximo aluno abre o rascunho do anterior, com CPF,
  endereço e telefone.
- `saveDraft` engole a falha do servidor e as 14 telas mostram "Rascunho salvo com sucesso!"
  sempre.
- `lib/logout.ts` limpa o `localStorage` só depois de `signOut({ redirect: true })`; como a
  página navega, a limpeza pode não acontecer.
- A API `/api/forms/drafts` aceita qualquer `formType`.

## Arquivos

- `lib/form-types.ts` (CRIAR): `FORM_TYPES`, `FormType`, `isFormType`, sem código de navegador,
  para a API usar a mesma lista.
- `lib/form-drafts.ts` (ALTERAR): chave local `form_draft:<id do usuário>:<tipo>`; sem usuário
  logado não grava cópia local; apaga as chaves antigas ao carregar; `saveDraft` devolve
  `{ savedOnServer, savedLocally }`; `notifyDraftSaved` mostra sucesso, aviso (só no navegador)
  ou erro; `clearLocalDrafts` para o logout. Ao carregar, o servidor tem prioridade e a cópia
  local do mesmo usuário cobre o salvamento que não chegou ao servidor.
- 14 telas em `app/documents/*` (ALTERAR): `notifyDraftSaved(await saveDraft(...))`.
- `lib/logout.ts` (ALTERAR): `clearLocalDrafts()` antes do `signOut`.
- `app/api/forms/drafts/route.ts` (ALTERAR): `formType` validado contra `FORM_TYPES` no POST,
  GET e DELETE.
- `__tests__/lib/form-drafts.test.ts` (CRIAR).

## Critério de aceite

Dois usuários no mesmo navegador não veem o rascunho um do outro; falha do servidor não aparece
como sucesso; CI verde.
