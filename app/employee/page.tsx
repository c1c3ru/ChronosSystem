'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Clock, QrCode, History, User, LogOut, Camera } from 'lucide-react'
import { toast } from 'sonner'

export default function EmployeePage() {
  const { data: session, status } = useSession()
  const [showScanner, setShowScanner] = useState(false)
  const [lastRecord, setLastRecord] = useState<any>(null)

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn()
    }
  }, [status])

  const handleScanQR = () => {
    setShowScanner(true)
    // Em produção, aqui abriria o scanner de QR code
    toast.info('Scanner de QR code seria aberto aqui')
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-slate-400">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-primary mr-2" />
            <h1 className="text-xl font-bold text-white">Portal do Estagiário</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-slate-300">
              <User className="h-4 w-4 mr-2" />
              <span className="text-sm">{session.user?.name || session.user?.email}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center text-slate-400 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4 mr-1" />
              <span className="text-sm">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Bem-vindo, {session.user?.name?.split(' ')[0] || 'Estagiário'}!
          </h2>
          <p className="text-slate-300">
            Use o botão abaixo para registrar sua entrada ou saída
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Scan QR Code */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
            <div className="text-center">
              <div className="bg-primary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <QrCode className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Registrar Ponto
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                Escaneie o QR code da máquina para registrar entrada ou saída
              </p>
              <button
                onClick={handleScanQR}
                className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center mx-auto"
              >
                <Camera className="h-4 w-4 mr-2" />
                Escanear QR Code
              </button>
            </div>
          </div>

          {/* Last Record */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
            <div className="text-center">
              <div className="bg-blue-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <History className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Último Registro
              </h3>
              {lastRecord ? (
                <div className="text-slate-300">
                  <p className="text-sm">{lastRecord.type}</p>
                  <p className="text-xs text-slate-400">{lastRecord.time}</p>
                </div>
              ) : (
                <p className="text-slate-400 text-sm mb-4">
                  Nenhum registro encontrado hoje
                </p>
              )}
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                Ver Histórico
              </button>
            </div>
          </div>
        </div>

        {/* Today's Summary */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Resumo de Hoje</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">--:--</div>
              <div className="text-sm text-slate-400">Entrada</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">--:--</div>
              <div className="text-sm text-slate-400">Saída</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">0h 0m</div>
              <div className="text-sm text-slate-400">Trabalhadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">20h</div>
              <div className="text-sm text-slate-400">Meta Semanal</div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Como usar</h3>
          <div className="space-y-3 text-slate-300">
            <div className="flex items-start">
              <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
              <div>
                <p className="font-medium">Localize uma máquina de ponto</p>
                <p className="text-sm text-slate-400">Procure por um kiosk com QR code na sua empresa</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
              <div>
                <p className="font-medium">Clique em "Escanear QR Code"</p>
                <p className="text-sm text-slate-400">Permita o acesso à câmera quando solicitado</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
              <div>
                <p className="font-medium">Aponte para o QR code</p>
                <p className="text-sm text-slate-400">O sistema detectará automaticamente e registrará seu ponto</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
