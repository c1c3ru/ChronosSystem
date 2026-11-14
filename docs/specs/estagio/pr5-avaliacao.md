# Spec PR 5 — Termo de Avaliação conforme art. 40 e 41

Plano geral: diagnóstico D8 do plano "Formulários de estágio — diagnóstico e plano SDD".
Norma: Res. CONSUP/IFCE nº 108/2023, art. 20, XV (termo de avaliação), art. 40 (critérios e
frequência mínima de 70%) e art. 41 (o orientador emite conceito satisfatório ou insatisfatório).

## Pesquisa (estado atual)

- A tela "Ficha de Avaliação" usa 15 critérios próprios de 1 a 5, definidos duas vezes (tela e
  PDF). Faltam "aplicação dos conhecimentos teóricos" e "atendimento às orientações" (art. 40).
- Não há frequência nem conceito final; o PDF é assinado por "Coordenador de Estágios", e não
  pelo orientador.
- Nada é validado; o PDF ocupa duas páginas.

## Arquivos

- `lib/student-evaluation.ts` (CRIAR): `EVALUATION_CRITERIA` (10 do art. 40 + conhecimento
  técnico, qualidade do trabalho e organização), escala, `MIN_ATTENDANCE_PERCENT = 70`,
  `FINAL_CONCEPTS`, `parseAttendance`, `averageGrade`.
- `lib/pdf-templates/student-evaluation.pdf.ts` (ALTERAR): título oficial; critérios da lista
  compartilhada em linhas compactas, com média; frequência (marca abaixo de 70%) e conceito
  final; orientador na identificação e na assinatura; cabe em uma página.
- `lib/internship-validation.ts` (ALTERAR): `validateStudentEvaluation` — nome e supervisor,
  nota em todos os critérios, frequência de 0 a 100; frequência abaixo de 70% com conceito
  satisfatório é erro, sem conceito é aviso.
- `app/documents/student-evaluation/page.tsx` (ALTERAR): usa a lista compartilhada; card
  "Frequência e Conceito Final" (frequência, orientador, conceito, média); validação como no PR 3.
- `app/employee/page.tsx` (ALTERAR): link "Termo de Avaliação".
- `__tests__/lib/student-evaluation.test.ts` (CRIAR).

## Critério de aceite

O PDF lista os critérios do art. 40, a frequência e o conceito final, em uma página; conceito
satisfatório com frequência abaixo de 70% é bloqueado; CI verde.
