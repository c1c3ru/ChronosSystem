'use client'

import { useState, useEffect } from 'react'
import { Bell, X, AlertTriangle, Clock } from 'lucide-react'
import { Button } from './ui/Button'

interface Notification {
  id: string
  type: 'EXIT_REMINDER' | 'MISSED_EXIT' | string
  sentAt: string
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
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
    // Poll every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const acknowledge = async (id: string) => {
    try {
      setNotifications(notifications.filter((n) => n.id !== id))
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
    } catch (error) {
      console.error('Erro ao confirmar notificação:', error)
    }
  }

  if (notifications.length === 0) return null

  return (
    <div className="space-y-3 mb-6">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`relative overflow-hidden rounded-xl border p-4 shadow-lg transition-all animate-in slide-in-from-top-2 duration-300 ${
            n.type === 'MISSED_EXIT'
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-amber-500/10 border-amber-500/30'
          }`}
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div
                className={`mt-0.5 rounded-full p-2 ${
                  n.type === 'MISSED_EXIT'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                {n.type === 'MISSED_EXIT' ? <AlertTriangle size={18} /> : <Clock size={18} />}
              </div>
              <div>
                <h4
                  className={`font-bold ${n.type === 'MISSED_EXIT' ? 'text-red-400' : 'text-amber-400'}`}
                >
                  {n.type === 'MISSED_EXIT' ? 'Esqueceu de bater saída?' : 'Lembrete de Saída'}
                </h4>
                <p className="text-sm text-neutral-300 mt-1">
                  {n.type === 'MISSED_EXIT'
                    ? 'Seu expediente já terminou. Não esqueça de registrar seu ponto de saída!'
                    : 'Seu expediente termina em breve. Lembre-se de bater o ponto antes de ir.'}
                </p>
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
              className="text-neutral-500 hover:text-white transition-colors"
              aria-label="Descartar notificação"
            >
              <X size={18} />
            </button>
          </div>
          {/* Progress bar effect for visual flair */}
          <div
            className={`absolute bottom-0 left-0 h-1 bg-current opacity-20 transition-all w-full ${
              n.type === 'MISSED_EXIT' ? 'text-red-500' : 'text-amber-500'
            }`}
          />
        </div>
      ))}
    </div>
  )
}
