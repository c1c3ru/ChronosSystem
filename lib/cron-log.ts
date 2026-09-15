import { prisma } from './prisma'
import { logger } from './logger'
import type { Prisma } from '@prisma/client'

/**
 * Lógica de status compartilhada pelos crons de notificação (justificativas
 * pendentes e lembretes de ponto): ambos processam uma lista de destinatários
 * via Promise.allSettled, e o resultado agregado vira uma linha em CronLog
 * (tabela `cron_logs`) consumida pelo painel "Status dos Alertas" no admin.
 */

export type CronRunStatus = 'SUCCESS' | 'PARTIAL_FAILURE' | 'ERROR'

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
export function summarizeOutcomes(totalCount: number, failures: CronFailureDetail[]): CronRunSummary {
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
 * Roda `sendOne` para cada item de `items` sequencialmente, um de cada vez —
 * uma falha de envio isolada (ex.: SMTP fora do ar para um destinatário) não
 * impede as demais nem aborta o restante do lote. Deliberadamente NÃO
 * paraleliza os envios: abrir várias conexões SMTP simultâneas contra o
 * mesmo host, a partir da mesma função serverless, é o gatilho mais provável
 * para erros de baixo nível como "getaddrinfo EBUSY" (contenção do
 * threadpool de DNS do Node) — o mesmo padrão sequencial já usado em
 * app/api/admin/send-reset-emails/route.ts. Para jobs com necessidade de
 * lotes/orçamento de tempo (ex.: o cron de justificativas, que também
 * precisa categorizar "sem pendência" separado de falha), monte o resumo na
 * mão com summarizeOutcomes() em vez de usar este helper.
 */
export async function runBatchSequentially<T>(
  items: T[],
  sendOne: (item: T) => Promise<boolean>,
  describeFailure: (item: T, reason: unknown) => CronFailureDetail
): Promise<CronRunSummary> {
  const failures: CronFailureDetail[] = []

  for (const item of items) {
    try {
      const sent = await sendOne(item)
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

export async function recordCronError(jobName: string, startedAt: Date, error: unknown): Promise<void> {
  await writeCronLog({
    jobName,
    status: 'ERROR',
    startedAt,
    finishedAt: new Date(),
    errorMessage: error instanceof Error ? error.message : String(error),
  })
}
