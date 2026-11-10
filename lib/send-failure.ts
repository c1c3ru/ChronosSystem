/**
 * Traduz a mensagem técnica de uma falha de envio de alerta (gravada em
 * CronLog.failures pelos crons) em algo que o admin entenda e saiba resolver:
 * o que aconteceu, se é só um adiamento ou uma falha de verdade, e o que fazer.
 *
 * Funciona sobre o texto da mensagem — e não sobre um código gravado no banco —
 * para valer também para o histórico já existente. Sem dependências de
 * servidor: é usado direto nos componentes do painel "Status dos Alertas".
 */

export type SendFailureKind =
  | 'DEFERRED'
  | 'TIMEOUT'
  | 'NETWORK'
  | 'AUTH'
  | 'RECIPIENT'
  | 'QUOTA'
  | 'NOT_CONFIGURED'
  | 'UNKNOWN'

export interface SendFailureExplanation {
  kind: SendFailureKind
  /** true = não é erro: o envio só ficou para a próxima execução do cron. */
  deferred: boolean
  /** O que aconteceu, em uma frase. */
  title: string
  /** O que fazer (ou por que não é preciso fazer nada). */
  hint: string
}

interface Rule {
  kind: SendFailureKind
  pattern: RegExp
  title: string
  hint: string
}

// A ordem importa: a primeira regra que casar vence. As mais específicas
// (adiamento, credenciais, cota antes de destinatário — o Gmail usa 550 para os dois) vêm antes das genéricas de rede.
const RULES: Rule[] = [
  {
    kind: 'DEFERRED',
    pattern: /Orçamento de tempo excedido/i,
    title: 'Adiado: o tempo da execução acabou antes deste envio',
    hint: 'Não é um erro. O email sai automaticamente na próxima execução do cron.',
  },
  {
    kind: 'NOT_CONFIGURED',
    // Inclui as mensagens antigas, de antes de EMAIL_NOT_CONFIGURED_MESSAGE.
    pattern: /não configurado|^Falha no envio$|^Erro ao enviar email$/i,
    title: 'O envio de email não está configurado no servidor',
    hint: 'Configure SMTP_HOST, SMTP_USER, SMTP_PASSWORD e SMTP_FROM (ou GMAIL_REFRESH_TOKEN) nas variáveis de ambiente da Vercel.',
  },
  {
    kind: 'AUTH',
    pattern:
      /EAUTH|Invalid login|Username and Password not accepted|\b535\b|BadCredentials|invalid_grant|unauthorized_client|Application-specific password required/i,
    title: 'O Gmail recusou o login da conta remetente',
    hint: 'A senha de app pode ter sido revogada. Gere uma nova senha de app e atualize SMTP_PASSWORD (ou GMAIL_REFRESH_TOKEN) na Vercel.',
  },
  {
    kind: 'QUOTA',
    pattern:
      /sending limit|limit exceeded|rate ?limit|quota|\b(421|429|454)\b|Too many|temporarily (deferred|rejected)/i,
    title: 'Limite de envio do Gmail atingido',
    hint: 'O Gmail limita quantos emails a conta pode mandar por dia. Os envios voltam a funcionar sozinhos depois de algumas horas.',
  },
  {
    kind: 'RECIPIENT',
    pattern:
      /EENVELOPE|Recipient address rejected|No such user|address not found|does not exist|\b55[03]\b|Invalid To header|Invalid recipient/i,
    title: 'O endereço de email do aluno foi rejeitado',
    hint: 'Confira se o email cadastrado no perfil do aluno está correto.',
  },
  {
    kind: 'TIMEOUT',
    pattern: /excedeu o tempo limite|ETIMEDOUT|timed? ?out|TimeoutError/i,
    title: 'O servidor de email demorou demais para responder',
    hint: 'Costuma ser passageiro; o envio é tentado de novo na próxima execução. Se repetir em várias execuções, verifique o status do Gmail.',
  },
  {
    kind: 'NETWORK',
    pattern: /getaddrinfo|ENOTFOUND|EBUSY|EAI_AGAIN/i,
    title: 'Não foi possível encontrar o servidor de email',
    hint: 'Se acontecer em todas as execuções, confira SMTP_HOST na Vercel (sem espaços ou quebra de linha no fim). Se for isolado, é instabilidade de rede e se resolve sozinho.',
  },
  {
    kind: 'NETWORK',
    pattern: /ECONNREFUSED|ECONNRESET|ESOCKET|ECONNECTION|EPIPE|socket|Erro de rede|fetch failed/i,
    title: 'A conexão com o servidor de email falhou',
    hint: 'Costuma ser passageiro; o envio é tentado de novo na próxima execução. Se repetir sempre, confira SMTP_HOST e SMTP_PORT na Vercel.',
  },
]

const UNKNOWN: Omit<SendFailureExplanation, 'kind' | 'deferred'> = {
  title: 'Erro inesperado no envio',
  hint: 'Veja o detalhe técnico. Se repetir, envie esse texto para quem mantém o sistema.',
}

export function explainSendFailure(message: string | null | undefined): SendFailureExplanation {
  const text = message ?? ''
  const rule = RULES.find((r) => r.pattern.test(text))
  if (!rule) return { kind: 'UNKNOWN', deferred: false, ...UNKNOWN }
  return { kind: rule.kind, deferred: rule.kind === 'DEFERRED', title: rule.title, hint: rule.hint }
}

/** Separa as falhas de uma execução em adiadas (não são erro) e falhas reais. */
export function countFailureKinds(failures: Array<{ message: string }>): {
  deferred: number
  failed: number
} {
  let deferred = 0
  for (const failure of failures) {
    if (explainSendFailure(failure.message).deferred) deferred++
  }
  return { deferred, failed: failures.length - deferred }
}
