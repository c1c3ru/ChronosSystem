# Spec PR 1 — Termo Aditivo sem perda de dados

Plano geral: diagnóstico D1 do plano "Formulários de estágio — diagnóstico e plano SDD".
Norma: Resolução CONSUP/IFCE nº 108/2023, art. 20, X e art. 37 (o termo aditivo altera datas,
carga horária, escala semanal, supervisor ou outras cláusulas do Termo de Compromisso).

## Pesquisa (estado atual)

- `app/documents/additive-term/page.tsx` coleta 30 campos, mas `handleGeneratePDF` repassa só 13,
  renomeados um a um para chaves em português.
- Ficam fora do PDF: tipos de aditivo marcados, novo supervisor (nome, cargo, conselho), novo
  horário, outras alterações, CPF/endereço/telefone do aluno, endereço e representante da
  concedente, cidade e diretor do campus.
- O PDF mostra "Telefone" da empresa, mas a tela não tem esse campo: sai sempre vazio.
- `handleSaveDraft` converte `'false'` em `'true'` (string não vazia é verdadeira), então salvar o
  rascunho marca todos os tipos de aditivo.

## Arquivos

### `lib/pdf-templates/additive-term.pdf.ts` — ALTERAR

- `AdditiveTermData` passa a usar os mesmos nomes de campo da tela (`company_name`,
  `student_cpf`, `additive_type_schedule`, `new_schedule`, ...). Sem renomeação na página.
- Identificação: concedente (razão social, CNPJ, endereço, representante e cargo) e discente
  (nome, CPF, matrícula, curso, endereço, telefone). Remove o "Telefone da empresa".
- Faixa "Objeto do aditivo": lista os 5 tipos com `(X)` ou `( )`.
- Para cada tipo marcado, uma tabela só com os campos daquele tipo:
  - Prorrogação: nova data de término, período de prorrogação.
  - Bolsa/auxílio: novo valor da bolsa, novo auxílio-transporte.
  - Supervisor: nome, cargo, registro no conselho.
  - Horário: nova carga horária semanal, novo horário.
  - Outras: descrição.
- Motivo e justificativa como seções de texto.
- Linha de local e data com a cidade do campus.
- Assinaturas: representante da concedente, supervisor, discente e IFCE (diretor do campus,
  com o nome quando preenchido).
- Exportar `ADDITIVE_TYPES` (chave + rótulo) para a tela e o teste usarem a mesma lista.

### `app/documents/additive-term/page.tsx` — ALTERAR

- `handleGeneratePDF`: `buildAdditiveTermDoc({ ...formData })`.
- `handleSaveDraft`: normalizar checkbox com `data[cb] === 'true' ? 'true' : 'false'`.

### `__tests__/lib/additive-term.pdf.test.ts` — CRIAR

- Marcar horário e supervisor: o conteúdo contém novo horário, nova carga, novo supervisor,
  CPF do aluno, representante e diretor; contém `(X) Alteração de horário`.
- Prorrogação desmarcada: a nova data de término não aparece.
- Dados vazios não quebram a geração.

## Critério de aceite

Nenhum campo preenchido na tela fica fora do PDF; lint, format:check, type-check e Jest passam.
