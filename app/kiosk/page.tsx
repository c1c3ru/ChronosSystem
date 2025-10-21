'use client'

import { useState, useEffect } from 'react'
import { Clock, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import QRCode from 'qrcode'

export default function KioskPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [qrCode, setQrCode] = useState('')
  const [isOnline, setIsOnline] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Atualizar relógio a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Gerar novo QR code a cada 60 segundos
  useEffect(() => {
    const generateQR = async () => {
      setIsRefreshing(true)
      
      try {
        // Simular dados do QR (em produção viria da API)
        const qrData = {
          machineId: 'KIOSK_001',
          timestamp: new Date().toISOString(),
          nonce: Math.random().toString(36).substring(2, 15),
          expires: 60
        }

        const qrString = await QRCode.toDataURL(JSON.stringify(qrData), {
          width: 300,
          margin: 2,
          color: {
            dark: '#10B981',
            light: '#FFFFFF'
          }
        })

        setQrCode(qrString)
        setIsOnline(true)
      } catch (error) {
        console.error('Erro ao gerar QR code:', error)
        setIsOnline(false)
      } finally {
        setIsRefreshing(false)
      }
    }

    // Gerar QR imediatamente
    generateQR()

    // Gerar novo QR a cada 60 segundos
    const qrTimer = setInterval(generateQR, 60000)

    return () => clearInterval(qrTimer)
  }, [])

  // Verificar conectividade
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 p-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-2xl font-bold text-white">Chronos System - Kiosk</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Status de Conectividade */}
            <div className="flex items-center">
              {isOnline ? (
                <Wifi className="h-5 w-5 text-green-400 mr-2" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-400 mr-2" />
              )}
              <span className={`text-sm ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            {/* Indicador de Refresh */}
            {isRefreshing && (
              <RefreshCw className="h-5 w-5 text-primary animate-spin" />
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Relógio */}
          <div className="mb-12">
            <div className="text-6xl md:text-8xl font-bold text-white mb-4 font-mono">
              {formatTime(currentTime)}
            </div>
            <div className="text-xl md:text-2xl text-slate-300 capitalize">
              {formatDate(currentTime)}
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-2xl p-8 inline-block shadow-2xl mb-8">
            {qrCode ? (
              <div className="text-center">
                <img 
                  src={qrCode} 
                  alt="QR Code para registro de ponto" 
                  className="mx-auto mb-4"
                />
                <p className="text-gray-600 text-sm font-medium">
                  QR Code válido por 60 segundos
                </p>
              </div>
            ) : (
              <div className="w-[300px] h-[300px] flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                  <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-2 animate-spin" />
                  <p className="text-gray-500">Gerando QR Code...</p>
                </div>
              </div>
            )}
          </div>

          {/* Instruções */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-white mb-4">
              Como registrar seu ponto
            </h2>
            <div className="space-y-3 text-slate-300">
              <div className="flex items-center">
                <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">1</span>
                <span>Abra o app do estagiário no seu celular</span>
              </div>
              <div className="flex items-center">
                <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">2</span>
                <span>Toque em "Escanear QR Code"</span>
              </div>
              <div className="flex items-center">
                <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">3</span>
                <span>Aponte a câmera para o QR code acima</span>
              </div>
              <div className="flex items-center">
                <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">4</span>
                <span>Confirme o registro de entrada ou saída</span>
              </div>
            </div>
          </div>

          {/* Informações da Máquina */}
          <div className="mt-8 text-slate-400 text-sm">
            <p>Máquina: KIOSK_001 | Local: Recepção Principal</p>
            <p>QR Code atualizado automaticamente a cada 60 segundos</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800/50 backdrop-blur-sm border-t border-slate-700 p-4">
        <div className="text-center text-slate-500 text-sm">
          © 2024 Chronos System - Sistema de Ponto Eletrônico
        </div>
      </footer>
    </div>
  )
}
