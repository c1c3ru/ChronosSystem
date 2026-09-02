import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email'
import { apiLogger } from '@/lib/logger'
import { checkCronAuth } from '@/lib/cron-auth'
import {
  analyzeDayForJustification,
  isWeekend,
  HORARIO_TRABALHO_PADRAO,
} from '@/lib/attendance-logic'
import { getHolidaysForPeriod } from '@/lib/holidays'
import type { AttendanceRecord, Justification, Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'
// Teto de execução na Vercel — a plataforma limita ao máximo permitido pelo
// plano (ex.: 10s no Hobby) mesmo se este valor for maior; ver EMAIL_TIME_BUDGET_MS
// abaixo para o orçamento interno que realmente evita o timeout.
export const maxDuration = 60

/**
 * API de Cron Job para verificação diária de justificativas pendentes
 *
 * GET /api/cron/daily-justification-check
 * Header obrigatório: Authorization: Bearer <CRON_SECRET>
 *
 * Busca, entre os estagiários ativos, dias com registro de ponto em
 * aberto/irregular (falta, atraso ou saída antecipada) que ainda não têm
 * justificativa aprovada nem enviada (uma justificativa REJEITADA volta a
 * contar como pendente). Para cada estagiário com pendências, dispara um
 * lembrete por e-mail — no máximo um por dia por usuário (deduplicado via
 * AttendanceNotification), o que também torna a rota segura para reexecução
 * (retry do GitHub Actions ou nova chamada do cron no mesmo dia).
 *
 * Só retorna 200 quando todos os lembretes elegíveis foram efetivamente
 * enviados; qualquer falha de envio — ou o orçamento de tempo estourado —
 * resulta em 500, para que o chamador (GitHub Actions) tente novamente.
 * Graças à deduplicação, uma nova tentativa não reenvia e-mails já entregues.
 */

const REMINDER_NOTIFICATION_TYPE = 'JUSTIFICATION_PENDING_REMINDER'
const DAYS_TO_ANALYZE = 30
const EMAIL_BATCH_SIZE = 8
const EMAIL_TIME_BUDGET_MS = Number(process.env.CRON_EMAIL_TIME_BUDGET_MS) || 8_000

type EmployeeForCheck = Prisma.UserGetPayload<{
  select: { id: true; name: true; email: true }
}>

type PendingReason = 'ABSENCE' | 'LATE' | 'EARLY_DEPARTURE'

interface PendingDay {
  date: string
  type: PendingReason
  description: string
}

interface Candidate {
  employee: EmployeeForCheck
  pendingDays: PendingDay[]
}

type CronDetail =
  | { userId: string; email: string; status: 'sent'; pendingCount: number; oldestDate: string }
  | { userId: string; email: string; status: 'skipped'; message: string }
  | { userId: string; email: string; status: 'failed'; message: string }

interface DayRecords {
  entry: AttendanceRecord | null
  exit: AttendanceRecord | null
}

// ── Regra de negócio ─────────────────────────────────────────────────────────

function groupByUserId<T extends { userId: string }>(items: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>()
  for (const item of items) {
    const existing = map.get(item.userId)
    if (existing) {
      existing.push(item)
    } else {
      map.set(item.userId, [item])
    }
  }
  return map
}

function buildPendingDay(
  dateKey: string,
  analysis: ReturnType<typeof analyzeDayForJustification>,
  dayData: DayRecords
): PendingDay {
  const formattedDate = new Date(`${dateKey}T00:00:00`).toLocaleDateString('pt-BR')

  if (!analysis.hasEntry && !analysis.hasExit) {
    return { date: dateKey, type: 'ABSENCE', description: `Falta no dia ${formattedDate}` }
  }

  if (analysis.lateArrival?.requiresJustification) {
    const entryTime = dayData.entry
      ? new Date(dayData.entry.timestamp).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : null
    return {
      date: dateKey,
      type: 'LATE',
      description: `Atraso de ${analysis.lateArrival.minutesLate} minutos${
        entryTime ? ` (entrada às ${entryTime})` : ''
      }`,
    }
  }

  if (analysis.earlyDeparture?.requiresJustification) {
    const hoursWorked = Math.floor(analysis.earlyDeparture.hoursWorked)
    const minutesWorked = Math.round((analysis.earlyDeparture.hoursWorked - hoursWorked) * 60)
    return {
      date: dateKey,
      type: 'EARLY_DEPARTURE',
      description: `Saída antecipada: trabalhou ${hoursWorked}h${minutesWorked}min, faltam ${analysis.earlyDeparture.minutesShort} minutos`,
    }
  }

  return {
    date: dateKey,
    type: 'ABSENCE',
    description: analysis.justificationReason || 'Pendência detectada',
  }
}

/**
 * Analisa os últimos DAYS_TO_ANALYZE dias úteis de um estagiário e retorna os
 * dias que têm registro de ponto irregular (falta, atraso ou saída
 * antecipada) e ainda precisam de justificativa — ou seja, sem justificativa
 * enviada, ou com a última enviada REJEITADA. Dias com justificativa PENDENTE
 * (aguardando revisão) ou APROVADA são considerados resolvidos e não entram
 * na lista.
 */
function computePendingDays(
  attendanceRecords: AttendanceRecord[],
  justifications: Justification[],
  holidayMap: Map<string, string>
): PendingDay[] {
  const dayRecords = new Map<string, DayRecords>()
  for (const record of attendanceRecords) {
    const dateKey = record.timestamp.toISOString().split('T')[0]
    const day = dayRecords.get(dateKey) ?? { entry: null, exit: null }
    if (record.type === 'ENTRY') {
      day.entry = record
    } else {
      day.exit = record
    }
    dayRecords.set(dateKey, day)
  }

  const justificationByDate = new Map(
    justifications.map((j) => [j.date.toISOString().split('T')[0], j])
  )

  const pendingDays: PendingDay[] = []

  // Começa em i=1 para não cobrar justificativa do dia corrente, ainda em curso.
  for (let i = 1; i <= DAYS_TO_ANALYZE; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    const dateKey = date.toISOString().split('T')[0]

    const isWorkDay = !isWeekend(date) && !holidayMap.has(dateKey)
    if (!isWorkDay) continue

    const dayData = dayRecords.get(dateKey) ?? { entry: null, exit: null }
    const analysis = analyzeDayForJustification(
      date,
      dayData.entry,
      dayData.exit,
      HORARIO_TRABALHO_PADRAO,
      isWorkDay
    )

    if (!analysis.requiresJustification) continue

    const existingJustification = justificationByDate.get(dateKey)
    const alreadyHandled = existingJustification && existingJustification.status !== 'REJECTED'
    if (alreadyHandled) continue

    pendingDays.push(buildPendingDay(dateKey, analysis, dayData))
  }

  return pendingDays.sort((a, b) => (a.date < b.date ? -1 : 1))
}

// ── Envio ────────────────────────────────────────────────────────────────────

async function dispatchReminder(candidate: Candidate): Promise<boolean> {
  const { employee, pendingDays } = candidate

  const sent = await emailService.sendJustificationRequiredEmail(
    employee.email,
    employee.name || 'Estagiário',
    pendingDays
  )

  if (sent) {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 3)
    // Registra o envio para deduplicar novas execuções no mesmo dia
    // (nova invocação do cron ou retry do GitHub Actions).
    await prisma.attendanceNotification.create({
      data: { userId: employee.id, type: REMINDER_NOTIFICATION_TYPE, expiresAt },
    })
  }

  return sent
}

export async function GET(request: NextRequest) {
  // TODO(temp-log): remover após confirmar em produção que o cron autentica
  // corretamente — ajuda a distinguir "não chegou requisição" de "chegou e
  // falhou na auth" nos logs da Vercel.
  apiLogger.info('Cron request received: daily-justification-check', {
    path: request.nextUrl.pathname,
  })

  const auth = checkCronAuth(request)
  if (!auth.authorized) {
    if (auth.reason === 'missing_secret') {
      // CRON_SECRET não está configurado no servidor (Vercel) — isso é um
      // erro de CONFIGURAÇÃO, não uma tentativa de acesso indevido. Retornar
      // 500 em vez de 401 deixa claro, do lado de fora, que o problema é a
      // env var ausente na Vercel, não um secret incorreto no GitHub.
      apiLogger.error('Cron auth failed: CRON_SECRET não configurado no servidor', {
        path: request.nextUrl.pathname,
      })
      return NextResponse.json(
        { error: 'Erro de configuração do servidor: CRON_SECRET não definido' },
        { status: 500 }
      )
    }

    // Nunca logar o header/token recebido nem o CRON_SECRET aqui — apenas o
    // motivo classificado (auth.reason), suficiente para depurar sem vazar o
    // segredo.
    apiLogger.security('Tentativa de acesso não autorizado ao cron de justificativas', {
      reason: auth.reason,
      ip: request.headers.get('x-forwarded-for') || undefined,
    })
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const startedAt = Date.now()

  try {
    apiLogger.info('Starting daily justification check')

    const employees: EmployeeForCheck[] = await prisma.user.findMany({
      where: { role: 'EMPLOYEE', isActive: true },
      select: { id: true, name: true, email: true },
    })

    const results = {
      total: employees.length,
      sent: 0,
      skipped: 0,
      failed: 0,
      details: new Array<CronDetail>(),
    }

    if (employees.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhum estagiário ativo encontrado',
        timestamp: new Date().toISOString(),
        results,
      })
    }

    const employeeIds = employees.map((employee) => employee.id)

    const periodStart = new Date()
    periodStart.setDate(periodStart.getDate() - DAYS_TO_ANALYZE)
    periodStart.setHours(0, 0, 0, 0)

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    // Todas as buscas usam `in: employeeIds` para evitar N+1 (uma query por
    // estagiário) — essencial para caber no tempo de função serverless.
    const [allAttendanceRecords, allJustifications, holidayMap, notifiedToday] = await Promise.all([
      prisma.attendanceRecord.findMany({
        where: { userId: { in: employeeIds }, timestamp: { gte: periodStart } },
      }),
      prisma.justification.findMany({
        where: { userId: { in: employeeIds }, date: { gte: periodStart } },
      }),
      getHolidaysForPeriod(periodStart, todayStart),
      prisma.attendanceNotification.findMany({
        where: {
          userId: { in: employeeIds },
          type: REMINDER_NOTIFICATION_TYPE,
          sentAt: { gte: todayStart },
        },
        select: { userId: true },
      }),
    ])

    const attendanceByUser = groupByUserId(allAttendanceRecords)
    const justificationsByUser = groupByUserId(allJustifications)
    const alreadyNotifiedToday = new Set(notifiedToday.map((n) => n.userId))

    const candidates: Candidate[] = []

    for (const employee of employees) {
      const pendingDays = computePendingDays(
        attendanceByUser.get(employee.id) ?? [],
        justificationsByUser.get(employee.id) ?? [],
        holidayMap
      )

      if (pendingDays.length === 0) {
        results.skipped++
        results.details.push({
          userId: employee.id,
          email: employee.email,
          status: 'skipped',
          message: 'Sem pendências',
        })
        continue
      }

      if (alreadyNotifiedToday.has(employee.id)) {
        results.skipped++
        results.details.push({
          userId: employee.id,
          email: employee.email,
          status: 'skipped',
          message: 'Lembrete já enviado hoje',
        })
        continue
      }

      candidates.push({ employee, pendingDays })
    }

    // Disparo em lotes com Promise.allSettled: paraleliza os envios sem abrir
    // uma conexão SMTP por estagiário de uma vez, e uma falha isolada não
    // derruba o lote inteiro. Entre lotes, verifica o orçamento de tempo para
    // encerrar com segurança antes do limite da função serverless — o que
    // sobrar fica marcado como falha e será reprocessado (sem duplicar
    // e-mails já entregues, graças à deduplicação por AttendanceNotification).
    for (let i = 0; i < candidates.length; i += EMAIL_BATCH_SIZE) {
      if (Date.now() - startedAt > EMAIL_TIME_BUDGET_MS) {
        for (const remaining of candidates.slice(i)) {
          results.failed++
          results.details.push({
            userId: remaining.employee.id,
            email: remaining.employee.email,
            status: 'failed',
            message: 'Orçamento de tempo excedido — será reprocessado na próxima execução',
          })
        }
        apiLogger.warn('Daily justification check: time budget exceeded', {
          processed: i,
          remaining: candidates.length - i,
        })
        break
      }

      const batch = candidates.slice(i, i + EMAIL_BATCH_SIZE)
      const settled = await Promise.allSettled(
        batch.map((candidate) => dispatchReminder(candidate))
      )

      settled.forEach((outcome, index) => {
        const candidate = batch[index]

        if (outcome.status === 'fulfilled' && outcome.value) {
          results.sent++
          results.details.push({
            userId: candidate.employee.id,
            email: candidate.employee.email,
            status: 'sent',
            pendingCount: candidate.pendingDays.length,
            oldestDate: candidate.pendingDays[0].date,
          })
          return
        }

        const message =
          outcome.status === 'rejected'
            ? outcome.reason instanceof Error
              ? outcome.reason.message
              : String(outcome.reason)
            : 'Erro ao enviar email'

        results.failed++
        results.details.push({
          userId: candidate.employee.id,
          email: candidate.employee.email,
          status: 'failed',
          message,
        })
        apiLogger.error('Reminder failed', { email: candidate.employee.email, message })
      })
    }

    const durationMs = Date.now() - startedAt
    const success = results.failed === 0

    apiLogger.info('Daily justification check completed', {
      total: results.total,
      sent: results.sent,
      skipped: results.skipped,
      failed: results.failed,
      durationMs,
    })

    return NextResponse.json(
      {
        success,
        message: success
          ? `Verificação diária concluída: ${results.sent} lembrete(s) enviado(s)`
          : `Verificação diária concluída com falhas: ${results.sent} enviado(s), ${results.failed} falharam`,
        timestamp: new Date().toISOString(),
        results,
      },
      { status: success ? 200 : 500 }
    )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    apiLogger.error('Error in daily justification check', { error: errorMessage })
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
