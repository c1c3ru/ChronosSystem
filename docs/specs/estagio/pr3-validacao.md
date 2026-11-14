# Spec PR 3 — Regras da Res. 108 nos formulários

Plano geral: diagnósticos D4 e D5 do plano "Formulários de estágio — diagnóstico e plano SDD".
Norma: Res. CONSUP/IFCE nº 108/2023, art. 34 (até 24 meses na mesma concedente, 48 para pessoa
com deficiência) e art. 35 (até 6 h/dia e 30 h/semana no superior e no técnico).

## Pesquisa (estado atual)

- Nenhum formulário de estágio valida nada: dá para gerar PDF vazio, com fim antes do início,
  CPF inválido ou 40 h semanais.
- O padrão do projeto é `lib/profile-validation.ts`: módulo puro, mensagens que dizem como
  corrigir, mapa campo → mensagem.
- Horários são texto livre ("08:00"); no Termo de Compromisso ficam num JSON `horarios`, na
  Solicitação de Cadastro num objeto `horarios`, por dia (`segunda_feira` … `domingo`).
- Só a Solicitação de Cadastro sabe se o aluno tem deficiência (`deficiencia[]`).

## Arquivos

### `lib/internship-validation.ts` — CRIAR

- `isValidCPF`, `isValidCNPJ`, `isValidEmail`, `parseTime`, `addMonthsIso`.
- `checkPeriod(start, end, fields, { hasDisability })`: datas válidas, fim depois do início,
  até 24 meses; 24–48 meses é erro sem deficiência, permitido com deficiência e aviso quando o
  formulário não sabe; acima de 48 é sempre erro.
- `checkSchedule(schedule, weeklyHours, …)`: início antes do fim, até 6 h por dia, carga e
  soma do quadro até 30 h, soma igual à carga declarada.
- `validateCommitmentTerm`, `validateRegistrationRequest`, `validateAdditiveTerm`: campos
  obrigatórios, documentos e as regras acima. Devolvem `{ errors, warnings }`.

### `components/forms/FormErrorSummary.tsx` — CRIAR

- Lista dos erros (cada um leva ao campo) e dos avisos; `focusFirstError`.
- Só tokens existentes do tema (ver tema restrito do Tailwind).

### Termo de Compromisso, Solicitação de Cadastro e Termo Aditivo — ALTERAR

- Validar ao clicar em "Gerar PDF": com erro, toast com a contagem, lista no topo e foco no
  primeiro campo; o PDF não é gerado. Rascunho continua salvando sem validação.
- Depois da primeira tentativa, a lista se atualiza enquanto o aluno corrige.

### `__tests__/lib/internship-validation.test.ts` — CRIAR

## Critério de aceite

31 h semanais, 7 h num dia, quadro diferente da carga ou mais de 24 meses (sem deficiência)
bloqueiam o PDF com mensagem clara; CI verde.

Fora deste PR: a outra tela de cadastro (`internship-registration`) será unificada no PR 6.
