import { prisma } from './prisma'
import { emailService } from './email'
import { getNowInFortaleza } from './timezone'
import { sendPushToUser } from './push'
import { runBatchWithAllSettled, type CronRunSummary, type CronFailureDetail } from './cron-log'

export type NotificationType = 'ENTRY_REMINDER' | 'EXIT_REMINDER' | 'MISSED_EXIT' | 'MISSED_ENTRY'

interface UserWithAttendance {
  id: string
  name: string | null
  email: string
  shiftStartTime: string
  shiftEndTime: string
  attendanceRecords: Array<{ type: string; timestamp: Date }>
  attendanceNotifications: Array<{ type: string }>
}

interface NotificationTask {
  intern: UserWithAttendance
  type: NotificationType
}

/**
 * Verifica e notifica funcionários sobre pontos de entrada/saída.
 *
 * Critérios de notificação:
 *  - ENTRY_REMINDER : Faltam até 15 min para o início do turno e não há registro de entrada
 *  - MISSED_ENTRY   : Passou 1 min do início do turno e não há registro de entrada
 *  - EXIT_REMINDER  : Faltam até 15 min para o fim do turno e há ENTRY sem EXIT correspondente
 *  - MISSED_EXIT    : Passou o horário de fim do turno e há ENTRY sem EXIT correspondente
 *
 * Para pegar os estagiários dentro dessas janelas de 15 min, este endpoint
 * precisa ser chamado por um cron externo a cada poucos minutos durante o
 * horário comercial — ver .github/workflows/attendance-reminder-cron.yml.
 *
 * A decisão de "quem precisa de notificação" é toda síncrona (primeira
 * passada, sem I/O); o envio em si roda depois, em paralelo via
 * Promise.allSettled (runBatchWithAllSettled) — uma falha de e-mail isolada
 * não impede o envio dos demais nem aborta o restante do lote.
 */
export async function checkAndNotifyAttendance(): Promise<CronRunSummary> {
  const now = getNowInFortaleza()

  // Início do dia para filtrar registros de hoje
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)

  const interns = await prisma.user.findMany({
    where: { role: 'EMPLOYEE' },
    select: {
      id: true,
      name: true,
      email: true,
      shiftStartTime: true,
      shiftEndTime: true,
      attendanceRecords: {
        where: { timestamp: { gte: todayStart } },
        orderBy: { timestamp: 'desc' },
        select: { type: true, timestamp: true },
      },
      attendanceNotifications: {
        where: { sentAt: { gte: todayStart } },
        select: { type: true },
      },
    },
  })

  const tasks: NotificationTask[] = []

  for (const intern of interns as UserWithAttendance[]) {
    const { shiftStartTime, shiftEndTime, attendanceRecords, attendanceNotifications } = intern

    if (!shiftStartTime || !shiftEndTime) continue

    const alreadySentTypes = new Set(attendanceNotifications.map((n) => n.type))

    // ── Verificação de ENTRADA ────────────────────────────────────────────────
    const hasEntryToday = attendanceRecords.some((r) => r.type === 'ENTRY')

    if (!hasEntryToday) {
      const [startH, startM] = shiftStartTime.split(':').map(Number)
      const shiftStart = new Date(now)
      shiftStart.setHours(startH, startM, 0, 0)

      const minsFromStart = (now.getTime() - shiftStart.getTime()) / (1000 * 60)

      // 15 min ANTES do turno → lembrete preventivo
      if (minsFromStart >= -15 && minsFromStart < 0 && !alreadySentTypes.has('ENTRY_REMINDER')) {
        tasks.push({ intern, type: 'ENTRY_REMINDER' })
      }

      // 1 min DEPOIS do turno → alerta de entrada esquecida
      if (minsFromStart >= 1 && !alreadySentTypes.has('MISSED_ENTRY')) {
        tasks.push({ intern, type: 'MISSED_ENTRY' })
      }

      // Se não tem entrada, não verificar saída
      continue
    }

    // ── Verificação de SAÍDA ──────────────────────────────────────────────────
    // Pega o último registro do dia — se for EXIT, o funcionário já saiu
    const lastRecord = attendanceRecords[0]
    if (lastRecord.type === 'EXIT') continue

    const [endH, endM] = shiftEndTime.split(':').map(Number)
    const shiftEnd = new Date(now)
    shiftEnd.setHours(endH, endM, 0, 0)

    const diffMinutes = (shiftEnd.getTime() - now.getTime()) / (1000 * 60)

    let notificationType: NotificationType | null = null

    if (diffMinutes <= 15 && diffMinutes > 0) {
      notificationType = 'EXIT_REMINDER'
    } else if (diffMinutes <= 0) {
      notificationType = 'MISSED_EXIT'
    }

    if (notificationType && !alreadySentTypes.has(notificationType)) {
      tasks.push({ intern, type: notificationType })
    }
  }

  return runBatchWithAllSettled(
    tasks,
    (task) => sendNotification(task.intern, task.type, task.intern.shiftStartTime, task.intern.shiftEndTime),
    (task, reason): CronFailureDetail => ({
      email: task.intern.email,
      message: reason instanceof Error ? reason.message : String(reason),
    })
  )
}

async function sendNotification(
  user: UserWithAttendance,
  type: NotificationType,
  shiftStartTime: string,
  shiftEndTime: string
): Promise<boolean> {
  const { subject, content, pushPayload } = buildNotificationContent(
    user.name,
    type,
    shiftStartTime,
    shiftEndTime
  )

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #333;">🕐 Chronos System</h2>
      ${content}
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
        Este é um lembrete automático. Por favor, não responda a este email.
      </div>
    </div>
  `

  const emailDelivered = await emailService.sendAttendanceNotificationEmail(
    user.email,
    subject,
    html
  )

  // Enviar push em paralelo (falha silenciosa se não configurado)
  void sendPushToUser(user.id, pushPayload)

  if (emailDelivered) {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 3)
    await prisma.attendanceNotification.create({
      data: { userId: user.id, type, expiresAt },
    })
  }

  return emailDelivered
}

interface NotificationContent {
  subject: string
  content: string
  pushPayload: import('./push').PushPayload
}

function buildNotificationContent(
  name: string | null,
  type: NotificationType,
  shiftStartTime: string,
  shiftEndTime: string
): NotificationContent {
  const displayName = name ?? 'Funcionário(a)'

  switch (type) {
    case 'ENTRY_REMINDER':
      return {
        subject: '⏰ Lembrete: Seu turno começa em breve',
        content: `
          <p>Olá <strong>${displayName}</strong>,</p>
          <p>Seu turno começa às <strong>${shiftStartTime}</strong>. Lembre-se de registrar sua entrada ao chegar!</p>
          <p style="margin-top: 16px; background-color: #e0f2fe; padding: 12px; border-radius: 6px; border-left: 4px solid #0284c7;">
            <strong>⏰ Ação recomendada:</strong> Acesse o sistema e registre sua entrada no horário correto.
          </p>
        `,
        pushPayload: {
          title: '⏰ Turno começa em breve',
          body: `Seu turno inicia às ${shiftStartTime}. Não esqueça de bater o ponto!`,
          tag: 'entry-reminder',
          url: '/employee',
        },
      }

    case 'MISSED_ENTRY':
      return {
        subject: '⚠️ Alerta: Você esqueceu de registrar sua entrada?',
        content: `
          <p>Olá <strong>${displayName}</strong>,</p>
          <p>Seu turno começou às <strong>${shiftStartTime}</strong> e não detectamos seu registro de entrada.</p>
          <p>Por favor, registre sua entrada o mais breve possível para evitar divergências no seu banco de horas.</p>
          <p style="margin-top: 16px; background-color: #fef3c7; padding: 12px; border-radius: 6px; border-left: 4px solid #f59e0b;">
            <strong>⏰ Ação necessária:</strong> Acesse o sistema e registre sua entrada.
          </p>
        `,
        pushPayload: {
          title: '⚠️ Entrada não registrada',
          body: `Seu turno começou às ${shiftStartTime}. Registre sua entrada agora!`,
          tag: 'missed-entry',
          url: '/employee',
        },
      }

    case 'EXIT_REMINDER':
      return {
        subject: '⏰ Lembrete: Seu expediente termina em breve',
        content: `
          <p>Olá <strong>${displayName}</strong>,</p>
          <p>Seu expediente termina às <strong>${shiftEndTime}</strong>. Não se esqueça de registrar sua saída!</p>
        `,
        pushPayload: {
          title: '⏰ Saída em breve',
          body: `Seu expediente termina às ${shiftEndTime}. Não esqueça de bater o ponto de saída!`,
          tag: 'exit-reminder',
          url: '/employee',
        },
      }

    case 'MISSED_EXIT':
      return {
        subject: '⚠️ Alerta: Você esqueceu de registrar sua saída?',
        content: `
          <p>Olá <strong>${displayName}</strong>,</p>
          <p>Seu expediente terminou às <strong>${shiftEndTime}</strong> e não detectamos seu registro de saída.</p>
          <p>Por favor, registre sua saída o mais breve possível para evitar divergências no seu banco de horas.</p>
          <p style="margin-top: 16px; background-color: #fef3c7; padding: 12px; border-radius: 6px; border-left: 4px solid #f59e0b;">
            <strong>⏰ Ação necessária:</strong> Acesse o sistema e registre sua saída.
          </p>
        `,
        pushPayload: {
          title: '⚠️ Saída não registrada',
          body: `Seu expediente terminou às ${shiftEndTime}. Registre sua saída agora!`,
          tag: 'missed-exit',
          url: '/employee',
        },
      }
  }
}
