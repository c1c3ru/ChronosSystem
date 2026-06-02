'use client'

import { useState, useEffect } from 'react'
import { X, AlertTriangle, Clock, LogIn, type LucideIcon } from 'lucide-react'

type NotificationType = 'ENTRY_REMINDER' | 'EXIT_REMINDER' | 'MISSED_EXIT' | 'MISSED_ENTRY'

interface AttendanceNotification {
  id: string
  type: NotificationType | string
  sentAt: string
}

const NOTIFICATION_CONFIG: Record<
  NotificationType,
  {
    icon: LucideIcon
    colorClass: string
    title: string
    description: string
  }
> = {
  ENTRY_REMINDER: {
    icon: Clock,
    colorClass: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    title: 'Lembrete: Turno começa em breve',
    description: 'Seu turno começa em breve. Prepare-se para registrar sua entrada!',
  },
  MISSED_ENTRY: {
    icon: LogIn,
    colorClass: 'bg-red-500/10 border-red-500/30 text-red-400',
    title: 'Entrada não registrada!',
    description:
      'Seu turno já começou e não detectamos seu registro de entrada. Bata o ponto agora!',
  },
  EXIT_REMINDER: {
    icon: Clock,
    colorClass: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    title: 'Lembrete de Saída',
    description: 'Seu expediente termina em breve. Lembre-se de bater o ponto antes de ir.',
  },
  MISSED_EXIT: {
    icon: AlertTriangle,
    colorClass: 'bg-red-500/10 border-red-500/30 text-red-400',
    title: 'Esqueceu de bater saída?',
    description: 'Seu expediente já terminou. Não esqueça de registrar seu ponto de saída!',
  },
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<AttendanceNotification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = (await response.json()) as AttendanceNotification[]
        setNotifications(data)
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Poll a cada 1 minuto para capturar notificações recentes de MISSED_ENTRY
    const interval = setInterval(fetchNotifications, 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const acknowledge = async (id: string) => {
    // Optimistic update
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
    } catch (error) {
      console.error('Erro ao confirmar notificação:', error)
    }
  }

  if (loading || notifications.length === 0) return null

  return (
    <div className="space-y-3 mb-6" role="region" aria-label="Notificações de ponto">
      {notifications.map((n) => {
        const type = n.type as NotificationType
        const config = NOTIFICATION_CONFIG[type] ?? NOTIFICATION_CONFIG.EXIT_REMINDER
        const IconComponent = config.icon
        const [bgClass, borderClass, textClass] = config.colorClass.split(' ')

        return (
          <div
            key={n.id}
            className={`relative overflow-hidden rounded-xl border p-4 shadow-lg transition-all animate-in slide-in-from-top-2 duration-300 ${bgClass} ${borderClass}`}
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`mt-0.5 rounded-full p-2 bg-current/10 ${textClass}`}>
                  <IconComponent size={18} />
                </div>
                <div>
                  <h4 className={`font-bold ${textClass}`}>{config.title}</h4>
                  <p className="text-sm text-neutral-300 mt-1">{config.description}</p>

                  {/* CTA para tipos de MISSED — direciona para bater o ponto */}
                  {(type === 'MISSED_ENTRY' || type === 'MISSED_EXIT') && (
                    <a
                      href="/employee"
                      className={`inline-flex items-center gap-1 mt-2 text-xs font-semibold underline underline-offset-2 ${textClass} hover:opacity-80 transition-opacity`}
                    >
                      <LogIn size={12} />
                      Registrar ponto agora
                    </a>
                  )}

                  <p className="text-[10px] text-neutral-500 mt-2 uppercase tracking-wider font-semibold">
                    {new Date(n.sentAt).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => acknowledge(n.id)}
                className="text-neutral-500 hover:text-white transition-colors flex-shrink-0"
                aria-label="Descartar notificação"
              >
                <X size={18} />
              </button>
            </div>
            {/* Barra de progresso decorativa */}
            <div
              className={`absolute bottom-0 left-0 h-0.5 w-full opacity-30 bg-current ${textClass}`}
            />
          </div>
        )
      })}
    </div>
  )
}
