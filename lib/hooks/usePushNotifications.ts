'use client'

import { useState, useEffect, useCallback } from 'react'

type PushPermission = 'default' | 'granted' | 'denied' | 'unsupported'

interface UsePushNotificationsReturn {
  permission: PushPermission
  isSubscribed: boolean
  isLoading: boolean
  subscribe: () => Promise<void>
  unsubscribe: () => Promise<void>
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

/**
 * Hook para gerenciar push notifications via Web Push API / VAPID.
 * Solicita permissão, cria subscription e sincroniza com o backend.
 */
export function usePushNotifications(): UsePushNotificationsReturn {
  const [permission, setPermission] = useState<PushPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  // Verificar suporte e estado inicial
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPermission('unsupported')
      return
    }

    setPermission(Notification.permission as PushPermission)

    navigator.serviceWorker.ready.then((reg) => {
      setRegistration(reg)
      reg.pushManager.getSubscription().then((sub) => {
        setIsSubscribed(!!sub)
      })
    })
  }, [])

  const subscribe = useCallback(async () => {
    if (!registration || permission === 'unsupported') return

    setIsLoading(true)
    try {
      // Buscar chave pública VAPID
      const keyRes = await fetch('/api/notifications/vapid-public-key')
      if (!keyRes.ok) throw new Error('Push não configurado no servidor')

      const { publicKey } = await keyRes.json() as { publicKey: string }

      // Solicitar permissão
      const perm = await Notification.requestPermission()
      setPermission(perm as PushPermission)

      if (perm !== 'granted') return

      // Criar subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey).buffer as ArrayBuffer,
      })

      const subJson = subscription.toJSON() as {
        endpoint: string
        keys: { p256dh: string; auth: string }
      }

      // Registrar no backend
      await fetch('/api/notifications/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subJson),
      })

      setIsSubscribed(true)
    } catch (err) {
      console.error('Erro ao ativar push notifications:', err)
    } finally {
      setIsLoading(false)
    }
  }, [registration, permission])

  const unsubscribe = useCallback(async () => {
    if (!registration) return

    setIsLoading(true)
    try {
      const subscription = await registration.pushManager.getSubscription()
      if (!subscription) return

      const endpoint = subscription.endpoint

      await subscription.unsubscribe()

      await fetch('/api/notifications/push-unsubscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint }),
      })

      setIsSubscribed(false)
    } catch (err) {
      console.error('Erro ao desativar push notifications:', err)
    } finally {
      setIsLoading(false)
    }
  }, [registration])

  return { permission, isSubscribed, isLoading, subscribe, unsubscribe }
}
