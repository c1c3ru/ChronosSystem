import { prisma } from './prisma'
import { resend, RESEND_FROM } from './resend'
import { getNowInFortaleza, formatDateFortaleza } from './timezone'

export type NotificationType = 'EXIT_REMINDER' | 'MISSED_EXIT'

export async function checkAndNotifyAttendance() {
  const now = getNowInFortaleza()
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  // 1. Buscar estagiários ativos
  const interns = await prisma.user.findMany({
    where: {
      role: 'EMPLOYEE',
    },
    include: {
      attendanceRecords: {
        where: {
          timestamp: {
            gte: today,
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
      },
      attendanceNotifications: {
        where: {
          sentAt: {
            gte: today,
          },
        },
      },
    },
  })

  const sentNotifications = []

  for (const intern of interns) {
    // Se não tem records hoje, ignorar
    if (intern.attendanceRecords.length === 0) continue

    const lastRecord = intern.attendanceRecords[0]

    // Se o último record foi EXIT, ele já saiu. Ignorar.
    if (lastRecord.type === 'EXIT') continue

    // Se o último record foi ENTRY, ele ainda está "clocked in"
    // Verificar se precisamos notificar
    const shiftEndTime = intern.shiftEndTime // Formato HH:MM
    if (!shiftEndTime) continue

    const [endHours, endMinutes] = shiftEndTime.split(':').map(Number)
    const shiftEnd = new Date(now)
    shiftEnd.setHours(endHours, endMinutes, 0, 0)

    const diffMinutes = (shiftEnd.getTime() - now.getTime()) / (1000 * 60)

    let notificationType: NotificationType | null = null

    // Critério 1: Faltam 15 minutos para o fim do expediente
    if (diffMinutes <= 15 && diffMinutes > 0) {
      notificationType = 'EXIT_REMINDER'
    }
    // Critério 2: Passou do horário de saída
    else if (diffMinutes <= 0) {
      notificationType = 'MISSED_EXIT'
    }

    if (notificationType) {
      // Verificar se já enviamos essa notificação hoje
      const alreadySent = intern.attendanceNotifications.some((n) => n.type === notificationType)

      if (!alreadySent) {
        await sendNotification(intern, notificationType, shiftEndTime)
        sentNotifications.push({ user: intern.email, type: notificationType })
      }
    }
  }

  return sentNotifications
}

async function sendNotification(
  user: { id: string; name: string | null; email: string },
  type: NotificationType,
  shiftEndTime: string
) {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 3)

  // 1. Criar registro no banco
  await prisma.attendanceNotification.create({
    data: {
      userId: user.id,
      type,
      expiresAt,
    },
  })

  // 2. Enviar Email via Resend
  const subject =
    type === 'EXIT_REMINDER'
      ? '⏰ Lembrete: Seu expediente termina em breve'
      : '⚠️ Alerta: Você esqueceu de bater o ponto de saída?'

  const content =
    type === 'EXIT_REMINDER'
      ? `<p>Olá <strong>${user.name}</strong>,</p>
       <p>Seu expediente termina às <strong>${shiftEndTime}</strong>. Não se esqueça de registrar sua saída!</p>`
      : `<p>Olá <strong>${user.name}</strong>,</p>
       <p>Seu expediente terminou às <strong>${shiftEndTime}</strong> e não detectamos seu registro de saída.</p>
       <p>Por favor, registre sua saída o mais breve possível para evitar divergências no seu banco de horas.</p>`

  try {
    await resend.emails.send({
      from: RESEND_FROM,
      to: user.email,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #333;">Chronos System</h2>
          ${content}
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            Este é um lembrete automático. Por favor, não responda a este email.
          </div>
        </div>
      `,
    })
    console.log(`✅ Email de ${type} enviado para ${user.email}`)
  } catch (error) {
    console.error(`❌ Erro ao enviar email para ${user.email}:`, error)
  }
}
