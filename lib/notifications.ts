import { prisma } from './prisma'
import { emailService } from './email'
import { getNowInFortaleza } from './timezone'

export type NotificationType = 'EXIT_REMINDER' | 'MISSED_EXIT' | 'MISSED_ENTRY'

interface UserWithAttendance {
  id: string
  name: string | null
  email: string
  shiftStartTime: string
  shiftEndTime: string
  attendanceRecords: Array<{ type: string; timestamp: Date }>
  attendanceNotifications: Array<{ type: string }>
}

/**
 * Verifica e notifica estagiários que esqueceram de bater o ponto
 * (tanto entrada quanto saída).
 *
 * Critérios de notificação:
 *  - MISSED_ENTRY:  Passou 30 min do início do turno e não há registro de entrada
 *  - EXIT_REMINDER: Faltam até 15 min para o fim do turno e há ENTRY sem EXIT correspondente
 *  - MISSED_EXIT:   Passou o horário de fim do turno e há ENTRY sem EXIT correspondente
 */
export async function checkAndNotifyAttendance() {
  const now = getNowInFortaleza()

  // Início do dia em UTC para filtrar registros de hoje
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

  const sentNotifications: Array<{ user: string; type: NotificationType }> = []

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

      const minsAfterStart = (now.getTime() - shiftStart.getTime()) / (1000 * 60)

      // Só notifica se já passou mais de 30 min do início do turno
      if (minsAfterStart >= 30 && !alreadySentTypes.has('MISSED_ENTRY')) {
        const delivered = await sendNotification(
          intern,
          'MISSED_ENTRY',
          shiftStartTime,
          shiftEndTime
        )
        if (delivered) sentNotifications.push({ user: intern.email, type: 'MISSED_ENTRY' })
      }

      // Se não tem entrada, não faz sentido verificar saída
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
      const delivered = await sendNotification(
        intern,
        notificationType,
        shiftStartTime,
        shiftEndTime
      )
      if (delivered) sentNotifications.push({ user: intern.email, type: notificationType })
    }
  }

  return sentNotifications
}

async function sendNotification(
  user: UserWithAttendance,
  type: NotificationType,
  shiftStartTime: string,
  shiftEndTime: string
): Promise<boolean> {
  const { subject, content } = buildEmailContent(user.name, type, shiftStartTime, shiftEndTime)

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #333;">🕐 Chronos System</h2>
      ${content}
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
        Este é um lembrete automático. Por favor, não responda a este email.
      </div>
    </div>
  `

  const delivered = await emailService.sendAttendanceNotificationEmail(user.email, subject, html)

  if (delivered) {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 3)
    await prisma.attendanceNotification.create({
      data: { userId: user.id, type, expiresAt },
    })
  }

  return delivered
}

function buildEmailContent(
  name: string | null,
  type: NotificationType,
  shiftStartTime: string,
  shiftEndTime: string
): { subject: string; content: string } {
  const displayName = name ?? 'Estagiário(a)'

  switch (type) {
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
      }
    case 'EXIT_REMINDER':
      return {
        subject: '⏰ Lembrete: Seu expediente termina em breve',
        content: `
          <p>Olá <strong>${displayName}</strong>,</p>
          <p>Seu expediente termina às <strong>${shiftEndTime}</strong>. Não se esqueça de registrar sua saída!</p>
        `,
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
      }
  }
}
