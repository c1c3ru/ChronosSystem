# Spec PR 2 — Termo de Compromisso fiel ao tipo de estágio

Plano geral: diagnósticos D2 e D3 do plano "Formulários de estágio — diagnóstico e plano SDD".
Norma: Res. CONSUP/IFCE nº 108/2023, art. 27 (seguro do obrigatório pelo IFCE, do não
obrigatório pela concedente); Lei nº 11.788/2008, art. 9º, parágrafo único, e art. 12 (no não
obrigatório, bolsa e auxílio-transporte são compulsórios).

## Pesquisa (estado atual)

- O PDF já tem `internship_type`, mas a tela nunca pergunta o tipo: a Cláusula Primeira sai
  sempre "NÃO OBRIGATÓRIO".
- A Cláusula Quinta diz sempre que a concedente contrata o seguro, o que é falso no obrigatório.
- A bolsa sai "R$ R$ 600,00 (R$ 600,00)": a máscara de moeda já inclui "R$" e não há extenso.
  O transporte também duplica o "R$".

## Arquivos

### `lib/valor-por-extenso.ts` — CRIAR

- `parseBRL`, `formatBRL`, `numeroPorExtenso`, `valorPorExtenso`, `valorComExtenso`.
- `valorComExtenso('R$ 600,00')` → `R$ 600,00 (seiscentos reais)`; texto inválido volta como veio.

### `lib/pdf-templates/commitment-term.pdf.ts` — ALTERAR

- `internshipTypeLabel`: tipo vazio vira lacuna, nunca presume "não obrigatório".
- `insuranceClause`: obrigatório → seguro pelo IFCE (apólice só se informada); não obrigatório →
  concedente, com a apólice ou lacunas.
- Bolsa e transporte com `valorComExtenso`; valor vazio vira lacuna.

### `app/documents/commitment-term/page.tsx` — ALTERAR

- Campo obrigatório "Tipo de estágio" (Selecione / Obrigatório / Não obrigatório).
- Gerar PDF sem tipo: mensagem de erro e foco no campo.
- Não obrigatório: bolsa e transporte marcados e travados, com explicação; obrigatório: aviso de
  que o seguro é do IFCE.

### Testes — CRIAR

- `__tests__/lib/valor-por-extenso.test.ts` e `__tests__/lib/commitment-term.pdf.test.ts`.

## Critério de aceite

Obrigatório imprime "OBRIGATÓRIO" e o seguro pelo IFCE; não obrigatório imprime a apólice da
concedente; valores saem uma vez com "R$" e por extenso; CI verde.
