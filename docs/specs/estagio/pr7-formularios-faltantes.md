# Spec PR 7 — Os 3 formulários oficiais que faltavam

Plano geral: diagnóstico D12 do plano "Formulários de estágio — diagnóstico e plano SDD".
Fonte: os modelos oficiais da PROEXT enviados pelo usuário em 14/11/2026 (PDF).

## Modelos

1. **Formulário para registro de avaliação do docente orientador à instituição concedente de vaga
   de estágio**: cabeçalho "Instituto Federal do Ceará — Campus \_\_\_"; dados da concedente (nome,
   ramo de atividade, CNPJ, endereço, nº, bairro, cidade, CEP, estado, telefone, e-mail),
   responsável pela empresa (nome, cargo/qualificação, telefone), supervisor (nome,
   cargo/qualificação, telefone) e setor de realização; 4 perguntas:
   1. finalidade da visita (análise da concedente / acompanhamento de atividades);
   2. compatibilidade da área com o curso (sim/não, por quê);
   3. a concedente já visitou a instituição? (sim/não);
   4. instalações (satisfatórias/insatisfatórias, por quê).
      Local e data; assinaturas do representante da concedente e do professor orientador.
2. **Declaração de proprietário**: cabeçalho com logomarca e dados da empresa; texto corrido com
   nome, RG, CPF, empresa, CNPJ, desde (data) e ramo de atividade; até 10 atividades; data;
   assinatura; observação sobre a habilitação jurídica.
3. **Declaração de atividades de profissional liberal ou autônomo**: mesmo formato; nome, RG, CPF,
   profissão, conselho e número de registro (só profissional liberal), desde (data); até 10
   atividades; observação sobre os comprovantes.

## Arquivos

- `lib/pdfmake-base-service.ts` — ALTERAR: extrair `signatureRow(labels)` de `sigBlock` (as
  declarações e a avaliação não têm a faixa "solicitação/autorização").
- `lib/work-declaration.ts` — CRIAR: tipos de declaração (texto, observação, campos),
  `MAX_ACTIVITIES = 10`, `parseActivities` (uma por linha, numeração digitada removida) e
  `longDate` ("13 de novembro de 2026").
- `lib/pdf-templates/work-declaration.pdf.ts` — CRIAR: cabeçalho com os dados do declarante (sem a
  logomarca do IFCE, pois o documento é emitido pela empresa ou pelo profissional), texto da
  declaração com os dados, lista numerada, data por extenso, assinatura e observação.
- `lib/pdf-templates/concedente-evaluation.pdf.ts` — CRIAR: espelha o modelo com `(X)` nas opções.
- `lib/internship-validation.ts` — ALTERAR: `validateConcedenteEvaluation` e
  `validateWorkDeclaration(kind)`; CPF e CNPJ com dígito verificador; pelo menos 1 atividade; o
  "desde" não pode ser no futuro; "Por quê?" obrigatório quando a área não é compatível ou as
  instalações são insatisfatórias.
- `components/forms/useDocumentForm.ts` e `components/forms/DocumentFields.tsx` — CRIAR: estado,
  rascunho, máscaras, validação e geração do PDF; campos controlados. Evita repetir nas 3 telas o
  bloco de ~150 linhas que as outras páginas copiam.
- `app/documents/concedente-evaluation`, `app/documents/owner-declaration` e
  `app/documents/self-employed-declaration` — CRIAR.
- `lib/form-types.ts` — ALTERAR: os 3 novos tipos de rascunho.
- `app/employee/page.tsx` — ALTERAR: avaliação da concedente em "Acompanhamento"; as duas
  declarações em "Casos Especiais".

## Critério de aceite

Cada modelo oficial tem tela e PDF com todos os campos do modelo; lint, format:check, type-check e
Jest passam.
