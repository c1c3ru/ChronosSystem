import { prisma } from './prisma'
import { logger } from './logger'
import type { Prisma } from '@prisma/client'

/**
 * Lógica de status compartilhada pelos crons de notificação (justificativas
 * pendentes e lembretes de ponto): ambos processam uma lista de destinatários
 * sequencialmente, dentro de um orçamento de tempo, e o resultado agregado
 * vira uma linha em CronLog (tabela `cron_logs`) consumida pelo painel
 * "Status dos Alertas" no admin.
 */

export type CronRunStatus = 'SUCCESS' | 'PARTIAL_FAILURE' | 'ERROR'

/**
 * Orçamento de tempo (ms) para o lote de envios de um cron, contado a partir
 * do início da requisição. O que não couber é marcado como falha e
 * reprocessado na próxima execução (sem reenviar o que já foi entregue,
 * graças à deduplicação por AttendanceNotification).
 *
 * O chamador dos crons é um `curl --max-time 30` no GitHub Actions (ver
 * .github/workflows/*.yml): o endpoint PRECISA responder bem antes disso, ou
 * o job morre com exit 28 sem nunca saber o que o cron fez. Orçamento + um
 * envio no limite (CRON_SEND_TIMEOUT_MS) é o pior caso da resposta, então a
 * soma dos dois é mantida com folga abaixo dos 30s.
 */
export const CRON_EMAIL_TIME_BUDGET_MS = Number(process.env.CRON_EMAIL_TIME_BUDGET_MS) || 8_000

/**
 * Teto de tempo (ms) para UM envio (e-mail + push + gravação do
 * AttendanceNotification). O orçamento acima só é conferido ENTRE itens, então
 * sem este teto um único destinatário travado — conexão SMTP pendurada, push
 * sem resposta — segura o lote inteiro indefinidamente e o cron nunca
 * responde. Um envio estourado vira falha daquele destinatário e o lote segue.
 */
export const CRON_SEND_TIMEOUT_MS = Number(process.env.CRON_SEND_TIMEOUT_MS) || 12_000

export const TIME_BUDGET_EXCEEDED_MESSAGE =
  'Orçamento de tempo excedido — será reprocessado na próxima execução'

export interface CronFailureDetail {
  email: string
  message: string
}

export interface CronRunSummary {
  status: CronRunStatus
  totalCount: number
  successCount: number
  failureCount: number
  failures: CronFailureDetail[]
}

/**
 * SUCCESS sem nenhuma falha de envio; PARTIAL_FAILURE com pelo menos uma
 * (mesmo que sejam todas as tentativas) — o job em si rodou até o fim, então
 * não é um erro de API. ERROR é reservado para quando o job quebra fora do
 * loop de envio (ver recordCronError).
 */
export function summarizeOutcomes(
  totalCount: number,
  failures: CronFailureDetail[]
): CronRunSummary {
  const failureCount = failures.length
  return {
    status: failureCount === 0 ? 'SUCCESS' : 'PARTIAL_FAILURE',
    totalCount,
    successCount: totalCount - failureCount,
    failureCount,
    failures,
  }
}

/**
 * Mapeia o status de uma execução para o HTTP status da resposta do cron: 200
 * quando tudo foi enviado, 207 (Multi-Status) quando parte dos e-mails falhou
 * — o chamador (GitHub Actions) não precisa tratar isso como falha da chamada
 * HTTP em si, e o próprio cron reprocessa o que faltou no próximo ciclo,
 * graças à deduplicação por AttendanceNotification — e 500 só quando o job
 * quebrou antes de terminar (erro de API/infra, não de envio de e-mail).
 */
export function cronHttpStatus(status: CronRunStatus): 200 | 207 | 500 {
  if (status === 'SUCCESS') return 200
  if (status === 'PARTIAL_FAILURE') return 207
  return 500
}

/**
 * Opções de orçamento de tempo de um lote — ver CRON_EMAIL_TIME_BUDGET_MS.
 */
export interface BatchTimeOptions {
  /** Instante (Date.now()) a partir do qual o orçamento é contado. Padrão: agora. */
  startedAt?: number
  /** Orçamento total do lote. Padrão: CRON_EMAIL_TIME_BUDGET_MS. */
  timeBudgetMs?: number
  /** Teto de um envio individual. Padrão: CRON_SEND_TIMEOUT_MS. */
  sendTimeoutMs?: number
}

class SendTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Envio excedeu o tempo limite de ${timeoutMs}ms`)
    this.name = 'SendTimeoutError'
  }
}

/**
 * Corre `promise` contra um timeout. O trabalho em si não é cancelável (SMTP e
 * push já estão em voo), mas o cron para de esperar por ele e consegue
 * responder ao chamador — que é o que evita o `exit 28` do curl no GitHub
 * Actions.
 */
export async function withSendTimeout<R>(
  promise: Promise<R>,
  timeoutMs: number = CRON_SEND_TIMEOUT_MS
): Promise<R> {
  let timer: ReturnType<typeof setTimeout> | undefined

  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new SendTimeoutError(timeoutMs)), timeoutMs)
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

/**
 * Roda `sendOne` para cada item de `items` sequencialmente, um de cada vez —
 * uma falha de envio isolada (ex.: SMTP fora do ar para um destinatário) não
 * impede as demais nem aborta o restante do lote. Deliberadamente NÃO
 * paraleliza os envios: abrir várias conexões SMTP simultâneas contra o
 * mesmo host, a partir da mesma função serverless, é o gatilho mais provável
 * para erros de baixo nível como "getaddrinfo EBUSY" (contenção do
 * threadpool de DNS do Node) — o mesmo padrão sequencial já usado em
 * app/api/admin/send-reset-emails/route.ts.
 *
 * Como o tempo total cresce com o número de destinatários, o lote respeita
 * dois limites (ver CRON_EMAIL_TIME_BUDGET_MS e CRON_SEND_TIMEOUT_MS): um
 * orçamento conferido ANTES de cada envio, e um teto por envio para que um
 * único destinatário travado não segure o lote. Em ambos os casos o que ficou
 * de fora é contabilizado como falha (status 207) e reprocessado no próximo
 * ciclo, em vez de deixar a requisição sem resposta.
 *
 * Para jobs que precisam categorizar resultados além de sucesso/falha (ex.: o
 * cron de justificativas, que separa "sem pendência" de falha), monte o resumo
 * na mão com summarizeOutcomes() em vez de usar este helper.
 */
export async function runBatchSequentially<T>(
  items: T[],
  sendOne: (item: T) => Promise<boolean>,
  describeFailure: (item: T, reason: unknown) => CronFailureDetail,
  options: BatchTimeOptions = {}
): Promise<CronRunSummary> {
  const startedAt = options.startedAt ?? Date.now()
  const timeBudgetMs = options.timeBudgetMs ?? CRON_EMAIL_TIME_BUDGET_MS
  const sendTimeoutMs = options.sendTimeoutMs ?? CRON_SEND_TIMEOUT_MS
  const failures: CronFailureDetail[] = []

  for (let i = 0; i < items.length; i++) {
    const item = items[i]

    if (Date.now() - startedAt > timeBudgetMs) {
      const remaining = items.slice(i)
      for (const pending of remaining) {
        failures.push(describeFailure(pending, new Error(TIME_BUDGET_EXCEEDED_MESSAGE)))
      }
      logger.warn('Lote de cron encerrado por orçamento de tempo', {
        processed: i,
        remaining: remaining.length,
        timeBudgetMs,
      })
      break
    }

    try {
      const sent = await withSendTimeout(sendOne(item), sendTimeoutMs)
      if (!sent) {
        failures.push(describeFailure(item, new Error('Falha no envio')))
      }
    } catch (reason) {
      failures.push(describeFailure(item, reason))
    }
  }

  return summarizeOutcomes(items.length, failures)
}

async function writeCronLog(data: Prisma.CronLogCreateInput): Promise<void> {
  try {
    await prisma.cronLog.create({ data })
  } catch (error: unknown) {
    // Nunca deixar uma falha ao GRAVAR o log derrubar a resposta do cron em si.
    logger.error('Falha ao registrar CronLog', {
      jobName: data.jobName,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

export async function recordCronLog(
  jobName: string,
  startedAt: Date,
  summary: CronRunSummary
): Promise<void> {
  await writeCronLog({
    jobName,
    status: summary.status,
    startedAt,
    finishedAt: new Date(),
    totalCount: summary.totalCount,
    successCount: summary.successCount,
    failureCount: summary.failureCount,
    errors: summary.failures.length > 0 ? JSON.stringify(summary.failures) : null,
  })
}

export async function recordCronError(
  jobName: string,
  startedAt: Date,
  error: unknown
): Promise<void> {
  await writeCronLog({
    jobName,
    status: 'ERROR',
    startedAt,
    finishedAt: new Date(),
    errorMessage: error instanceof Error ? error.message : String(error),
  })
}
