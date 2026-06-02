'use client'

import { Bell, BellOff, Loader2 } from 'lucide-react'
import { usePushNotifications } from '@/lib/hooks/usePushNotifications'

/**
 * Botão de ativação/desativação de push notifications.
 * Exibe feedback visual do estado atual e orienta o usuário.
 */
export function PushNotificationSetup() {
  const { permission, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications()

  // Não renderizar se push não suportado pelo browser
  if (permission === 'unsupported') return null

  if (permission === 'denied') {
    return (
      <div className="flex items-center gap-2 text-xs text-neutral-500 px-3 py-2 rounded-lg bg-neutral-800/50">
        <BellOff size={14} className="text-neutral-400" />
        <span>Notificações bloqueadas nas configurações do navegador</span>
      </div>
    )
  }

  return (
    <button
      id="push-notification-toggle"
      onClick={isSubscribed ? unsubscribe : subscribe}
      disabled={isLoading}
      aria-label={isSubscribed ? 'Desativar notificações push' : 'Ativar notificações push'}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
        transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
        ${
          isSubscribed
            ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
            : 'bg-neutral-800 text-neutral-300 border border-neutral-700 hover:bg-neutral-700'
        }
      `}
    >
      {isLoading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : isSubscribed ? (
        <Bell size={14} />
      ) : (
        <BellOff size={14} />
      )}
      {isLoading ? 'Aguarde...' : isSubscribed ? 'Push ativado' : 'Ativar push'}
    </button>
  )
}
