import { NextRequest, NextResponse } from 'next/server'
import { checkAndNotifyAttendance } from '@/lib/notifications'
import { checkCronAuth } from '@/lib/cron-auth'
import { apiLogger } from '@/lib/logger'
import { recordCronLog, recordCronError, cronHttpStatus } from '@/lib/cron-log'

export const dynamic = 'force-dynamic'
// Teto de execução na Vercel — é a rede de segurança da plataforma, NÃO o que
// garante a resposta a tempo: quem chama é um `curl --max-time 30` no GitHub
// Actions (ver .github/workflows/attendance-reminder-cron.yml), então uma
// função que usasse os 60s inteiros mataria o job com exit 28 sem nunca dizer
// o que o cron fez. Quem segura a resposta dentro da janela do curl é o
// orçamento de tempo do lote (CRON_EMAIL_TIME_BUDGET_MS) + o teto por envio
// (CRON_SEND_TIMEOUT_MS), ambos em lib/cron-log.ts. Mesmo valor já usado pelo
// cron irmão em app/api/cron/daily-justification-check/route.ts.
export const maxDuration = 60

const JOB_NAME = 'attendance-reminder'

/**
 * API de Cron Job para lembretes de entrada/saída de ponto.
 *
 * GET /api/notifications/cron
 * Header obrigatório: Authorization: Bearer <CRON_SECRET>
 *
 * Retorna 200 quando todas as notificações elegíveis foram enviadas, 207
 * (Multi-Status) quando parte delas falhou — o job rodou até o fim, é uma
 * falha de envio, não de API; o orçamento de tempo estourado conta como falha
 * aqui também, e o que sobrou é reenviado no ciclo seguinte (deduplicado por
 * AttendanceNotification) — e 500 apenas quando o job quebra antes de
 * terminar. Cada execução grava uma linha em CronLog (tabela `cron_logs`),
 * consumida pelo painel "Status dos Alertas" no admin.
 */
export async function GET(request: NextRequest) {
  // Fail-closed em qualquer ambiente: nunca depender de NODE_ENV para decidir
  // se a autenticação é aplicada (ver lib/cron-auth.ts).
  const auth = checkCronAuth(request)
  if (!auth.authorized) {
    if (auth.reason === 'missing_secret') {
      apiLogger.error('Cron auth failed: CRON_SECRET não configurado no servidor', {
        path: request.nextUrl.pathname,
      })
      return NextResponse.json(
        { error: 'Erro de configuração do servidor: CRON_SECRET não definido' },
        { status: 500 }
      )
    }

    apiLogger.security('Tentativa de acesso não autorizado ao cron de notificações', {
      reason: auth.reason,
      ip: request.headers.get('x-forwarded-for') || undefined,
    })
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const startedAtMs = Date.now()
  const startedAt = new Date(startedAtMs)

  try {
    // O orçamento conta a partir daqui (e não do início do lote de envios)
    // para que a consulta ao banco feita por checkAndNotifyAttendance também
    // entre na conta dos 30s que o chamador espera.
    const summary = await checkAndNotifyAttendance({ startedAt: startedAtMs })
    await recordCronLog(JOB_NAME, startedAt, summary)

    return NextResponse.json(
      {
        success: summary.status === 'SUCCESS',
        processedAt: new Date().toISOString(),
        results: summary,
      },
      { status: cronHttpStatus(summary.status) }
    )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Erro no processamento do cron de notificações:', error)
    await recordCronError(JOB_NAME, startedAt, error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    )
  }
}
