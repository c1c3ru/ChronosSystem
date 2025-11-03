'use client'

import { useEffect, useState } from 'react'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    
    // Verificar status inicial
    updateOnlineStatus()

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  const handleRetry = () => {
    if (isOnline) {
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
          {/* Ícone de status */}
          <div className="mb-6">
            {isOnline ? (
              <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                <Wifi className="w-10 h-10 text-green-400" />
              </div>
            ) : (
              <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
                <WifiOff className="w-10 h-10 text-red-400" />
              </div>
            )}
          </div>

          {/* Título e mensagem */}
          <h1 className="text-2xl font-bold text-white mb-4">
            {isOnline ? 'Conectado!' : 'Você está offline'}
          </h1>
          
          <p className="text-slate-300 mb-6">
            {isOnline 
              ? 'Sua conexão foi restaurada. Você pode tentar recarregar a página.'
              : 'Verifique sua conexão com a internet e tente novamente.'
            }
          </p>

          {/* Status da conexão */}
          <div className="mb-6 p-4 bg-slate-700/50 rounded-lg">
            <div className="flex items-center justify-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-sm text-slate-300">
                Status: {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="space-y-3">
            <Button 
              onClick={handleRetry}
              disabled={!isOnline}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>

            <Button 
              variant="secondary"
              onClick={() => window.history.back()}
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Voltar
            </Button>
          </div>

          {/* Informações sobre PWA */}
          <div className="mt-8 pt-6 border-t border-slate-700/50">
            <p className="text-xs text-slate-400 mb-2">
              💡 <strong>Dica:</strong> Este app funciona offline!
            </p>
            <p className="text-xs text-slate-500">
              Algumas funcionalidades podem estar limitadas sem conexão com a internet.
            </p>
          </div>
        </div>

        {/* Logo/Branding */}
        <div className="mt-6">
          <p className="text-slate-500 text-sm">
            Chronos System - PWA
          </p>
        </div>
      </div>
    </div>
  )
}
