/**
 * Serviço de Web Push Notifications via VAPID
 *
 * Usa a biblioteca web-push para enviar notificações para dispositivos
 * que possuem o Service Worker registrado e optin de push.
 *
 * As chaves VAPID são opcionais (push desabilitado silenciosamente se ausentes).
 */

import webpush from 'web-push'
import { prisma } from './prisma'
import { logger } from './logger'

export interface PushPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  url?: string
  tag?: string
}

function isVapidConfigured(): boolean {
  return Boolean(
    process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT
  )
}

function initVapid(): void {
  if (!isVapidConfigured()) return
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )
}

// Inicializar VAPID uma vez no import
initVapid()

/**
 * Envia push notification para todos os dispositivos inscritos de um usuário.
 * Subscriptions expiradas (410 Gone) são removidas automaticamente do banco.
 *
 * @returns número de dispositivos que receberam a notificação com sucesso
 */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<number> {
  if (!isVapidConfigured()) {
    logger.warn('VAPID não configurado — push não enviado', { userId })
    return 0
  }

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  })

  if (subscriptions.length === 0) return 0

  const pushData = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon ?? '/icon-192x192.png',
    badge: payload.badge ?? '/icon-192x192.png',
    url: payload.url ?? '/employee',
    tag: payload.tag ?? 'chronos-attendance',
  })

  let successCount = 0
  const expiredEndpoints: string[] = []

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          pushData
        )
        successCount++
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode
        if (status === 410 || status === 404) {
          // Subscription expirada — remover do banco
          expiredEndpoints.push(sub.endpoint)
        } else {
          logger.error('Erro ao enviar push', {
            userId,
            endpoint: sub.endpoint.slice(0, 40),
            error: err instanceof Error ? err.message : String(err),
          })
        }
      }
    })
  )

  // Limpar subscriptions expiradas
  if (expiredEndpoints.length > 0) {
    await prisma.pushSubscription.deleteMany({
      where: { endpoint: { in: expiredEndpoints } },
    })
    logger.info('Push subscriptions expiradas removidas', {
      userId,
      count: expiredEndpoints.length,
    })
  }

  return successCount
}
