'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Clock,
  Wifi,
  WifiOff,
  RotateCw,
  MapPin,
  Users,
  CheckCircle,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react'
import QRCode from 'qrcode'
import Image from 'next/image'

interface QRData {
  qrData: string
  machineId: string
  machineName: string
  location: string
  expiresAt: string
  validFor: number
}

interface Machine {
  id: string
  name: string
  location: string
  isActive: boolean
}

export default function KioskPage() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [qrData, setQrData] = useState<QRData | null>(null)
  const [qrError, setQrError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [timeLeft, setTimeLeft] = useState(0)
  interface RecentScan {
    id: string
    user: string
    type: 'ENTRY' | 'EXIT'
    timestamp: string
  }
  const [recentScans, setRecentScans] = useState<RecentScan[]>([])
  const [machines, setMachines] = useState<Machine[]>([])
  const [selectedMachineId, setSelectedMachineId] = useState<string>('')
  const [machineInfo, setMachineInfo] = useState({
    name: 'Carregando...',
    location: 'Aguarde...',
    id: '',
  })

  // Carregar máquinas disponíveis
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await fetch('/api/kiosk/machines')
        if (response.ok) {
          const data = await response.json()
          const machinesList = data.machines || []
          setMachines(machinesList)
          if (machinesList.length > 0) {
            setSelectedMachineId(machinesList[0].id)
            setMachineInfo({
              id: machinesList[0].id,
              name: machinesList[0].name,
              location: machinesList[0].location,
            })
          }
        }
      } catch (error) {
        console.error('Erro ao carregar máquinas:', error)
      }
    }

    fetchMachines()
  }, [])

  // Atualizar relógio a cada segundo (apenas no cliente)
  useEffect(() => {
    // Definir o horário inicial apenas no cliente
    setCurrentTime(new Date())

    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Gerar QR code dinâmico
  const generateQRCode = useCallback(async () => {
    setQrError(null)
    try {
      const url = new URL('/api/kiosk/qr', window.location.origin)
      if (machineInfo.id) {
        url.searchParams.append('machineId', machineInfo.id)
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const text = await response.text()

        try {
          const data: QRData = JSON.parse(text)
          setQrData(data)

          // Gerar imagem do QR code
          const qrUrl = await QRCode.toDataURL(data.qrData, {
            width: 320,
            margin: 2,
            color: {
              dark: '#22c55e',
              light: '#ffffff',
            },
            errorCorrectionLevel: 'M',
          })

          setQrCodeUrl(qrUrl)
          setQrError(null)
          setTimeLeft(data.validFor)
        } catch (parseError) {
          console.error('Erro ao fazer parse do JSON:', parseError)
          setQrCodeUrl('')
          setQrError('Erro ao processar resposta do servidor. Contate o administrador.')
        }
      } else {
        const errData = await response.json().catch(() => ({}))
        const msg = errData?.error || `Erro do servidor (${response.status})`
        console.error('Erro ao gerar QR code:', msg)
        setQrCodeUrl('')
        setQrError(msg)
      }
    } catch (error) {
      console.error('Erro ao gerar QR code:', error)
      setQrCodeUrl('')
      setQrError('Falha de conexão ao gerar QR code. Verifique a rede.')
    }
  }, [machineInfo.id])

  // Função para mudar de máquina
  const handleMachineChange = (machineId: string) => {
    const selected = machines.find((m) => m.id === machineId)
    if (selected) {
      setSelectedMachineId(machineId)
      setMachineInfo({
        id: selected.id,
        name: selected.name,
        location: selected.location,
      })
    }
  }

  // Gerar QR code inicial e configurar regeneração automática a cada 60 segundos
  useEffect(() => {
    generateQRCode()

    const qrTimer = setInterval(generateQRCode, 60 * 1000) // 60 segundos

    return () => clearInterval(qrTimer)
  }, [generateQRCode])

  // Countdown do tempo restante do QR
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && qrCodeUrl) {
      // QR expirou após 60 segundos, gerar novo
      generateQRCode()
    }
  }, [timeLeft, qrCodeUrl, generateQRCode])

  // Verificar conectividade
  useEffect(() => {
    const checkConnection = () => {
      setIsOnline(navigator.onLine)
    }

    checkConnection()
    window.addEventListener('online', checkConnection)
    window.addEventListener('offline', checkConnection)

    return () => {
      window.removeEventListener('online', checkConnection)
      window.removeEventListener('offline', checkConnection)
    }
  }, [])

  // Buscar atividade recente real
  const fetchRecentActivity = useCallback(async () => {
    try {
      let url = '/api/kiosk/recent-activity'
      if (machineInfo.id) {
        url += `?machineId=${machineInfo.id}`
      }
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        // Garantir que timestamp venha como string ISO e seja usado para formatar a hora no frontend
        const normalized = (data.activity || []).map(
          (item: {
            id: string
            user: string
            type: string
            timestamp: string | number | Date
          }) => ({
            ...item,
            timestamp:
              typeof item.timestamp === 'string'
                ? item.timestamp
                : new Date(item.timestamp).toISOString(),
          })
        )

        const today = new Date()
        const todayRecords = normalized.filter((scan: { timestamp: string }) => {
          try {
            const scanDate = new Date(scan.timestamp)
            return (
              scanDate.getDate() === today.getDate() &&
              scanDate.getMonth() === today.getMonth() &&
              scanDate.getFullYear() === today.getFullYear()
            )
          } catch {
            return false
          }
        })

        setRecentScans(todayRecords)
      } else {
        console.error('Erro ao buscar atividade:', data.error)
        setRecentScans([])
      }
    } catch (error) {
      console.error('Erro ao buscar atividade recente:', error)
      setRecentScans([])
    }
  }, [machineInfo.id])

  // Buscar atividade inicial e configurar polling a cada 30 segundos
  useEffect(() => {
    fetchRecentActivity()

    const activityTimer = setInterval(fetchRecentActivity, 30 * 1000) // 30 segundos

    return () => clearInterval(activityTimer)
  }, [fetchRecentActivity])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTimeLeft = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex flex-col">
      {/* Header */}
      <div className="glass border-b border-neutral-700/50 p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full md:w-auto text-center sm:text-left">
            <div className="bg-primary/20 rounded-xl p-3">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Chronos Kiosk</h1>
              {machines.length > 0 ? (
                <div className="flex flex-col mt-2">
                  <label htmlFor="machine-select" className="sr-only">
                    Selecionar Máquina
                  </label>
                  <select
                    id="machine-select"
                    title="Selecionar Máquina"
                    value={selectedMachineId}
                    onChange={(e) => handleMachineChange(e.target.value)}
                    className="px-3 py-1 bg-neutral-700/50 border border-neutral-600 rounded-lg text-sm text-neutral-300 hover:bg-neutral-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {machines.map((machine) => (
                      <option key={machine.id} value={machine.id}>
                        {machine.name} - {machine.location}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex items-center text-neutral-400 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  Nenhuma máquina disponível
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end space-x-6 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-neutral-700/50 md:border-0">
            <div
              className={`flex items-center space-x-2 ${isOnline ? 'text-success' : 'text-error'}`}
            >
              {isOnline ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
              <span className="text-sm font-medium">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <div className="text-right">
              <div className="text-xl sm:text-2xl font-bold text-white">
                {currentTime ? formatTime(currentTime) : '--:--:--'}
              </div>
              <div className="text-xs sm:text-sm text-neutral-400">
                {currentTime ? formatDate(currentTime) : '--/--/----'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-6 p-4 md:flex-row md:p-8 md:gap-8">
        {/* QR Code Section */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-lg">
            <div className="glass rounded-2xl p-8 mb-6">
              <h2 className="text-3xl font-semibold text-white mb-6">Registrar Ponto</h2>

              {qrError ? (
                <div className="flex flex-col items-center justify-center h-80 gap-4">
                  <div className="bg-red-900/40 border border-red-500/50 rounded-xl p-6 max-w-sm text-center">
                    <div className="text-red-400 text-4xl mb-3">⚠️</div>
                    <p className="text-red-300 font-semibold mb-1">Erro ao gerar QR Code</p>
                    <p className="text-red-400 text-sm">{qrError}</p>
                  </div>
                  <button
                    onClick={generateQRCode}
                    className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary rounded-lg text-sm transition-colors"
                  >
                    <RotateCw className="h-4 w-4" />
                    Tentar novamente
                  </button>
                </div>
              ) : qrCodeUrl ? (
                <div className="flex flex-col items-center">
                  <div className="bg-white p-6 rounded-2xl mb-4 shadow-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrCodeUrl}
                      alt="QR Code para registro de ponto"
                      className="w-80 h-80"
                    />
                  </div>

                  <div className="flex items-center justify-between w-full text-sm">
                    <div className="flex items-center text-neutral-400">
                      <RotateCw className="h-4 w-4 mr-2" />
                      Atualiza automaticamente
                    </div>
                    <div className="flex items-center text-primary font-medium">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatTimeLeft(timeLeft)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-80">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Como usar:</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center text-neutral-300">
                  <div className="bg-primary/20 rounded-full w-8 h-8 flex items-center justify-center text-primary font-bold mr-3">
                    1
                  </div>
                  <span>Abra o app Chronos no seu celular</span>
                </div>
                <div className="flex items-center text-neutral-300">
                  <div className="bg-primary/20 rounded-full w-8 h-8 flex items-center justify-center text-primary font-bold mr-3">
                    2
                  </div>
                  <span>Toque em &quot;Registrar Ponto&quot;</span>
                </div>
                <div className="flex items-center text-neutral-300">
                  <div className="bg-primary/20 rounded-full w-8 h-8 flex items-center justify-center text-primary font-bold mr-3">
                    3
                  </div>
                  <span>Escaneie o QR code acima</span>
                </div>
                <div className="flex items-center text-neutral-300">
                  <div className="bg-success/20 rounded-full w-8 h-8 flex items-center justify-center text-success font-bold mr-3">
                    ✓
                  </div>
                  <span>Ponto registrado automaticamente!</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Sidebar */}
        <div className="w-full md:w-80 md:mt-0 mt-4">
          <div className="glass rounded-xl p-6 h-full">
            <div className="flex items-center mb-6">
              <Users className="h-5 w-5 text-primary mr-2" />
              <h3 className="text-lg font-semibold text-white">Atividade Recente</h3>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentScans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-neutral-800/30 hover:bg-neutral-800/50 transition-colors"
                >
                  <div className="flex items-center">
                    {scan.type === 'ENTRY' ? (
                      <ArrowDownLeft className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-white font-medium text-sm">{scan.user}</p>
                      <p className="text-xs text-neutral-400">
                        {scan.type === 'ENTRY' ? 'Entrada' : 'Saída'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-neutral-300 font-mono">
                      {(() => {
                        try {
                          const date = new Date(scan.timestamp)
                          if (Number.isNaN(date.getTime())) return '--:--'
                          return date.toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        } catch {
                          return '--:--'
                        }
                      })()}
                    </p>
                    <CheckCircle className="h-4 w-4 text-green-500 ml-auto mt-1" />
                  </div>
                </div>
              ))}
            </div>

            {recentScans.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-neutral-600 mx-auto mb-3" />
                <p className="text-neutral-500">Nenhum registro recente</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="glass border-t border-neutral-700/50 p-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-3 text-center">
            <Image
              src="/assets/logoifce.png"
              alt="Logo IFCE"
              width={36}
              height={36}
              className="object-contain mix-blend-screen opacity-90"
              style={{ mixBlendMode: 'screen' }}
            />
            <p className="text-neutral-500 text-sm">
              © 2024 Chronos System • Coordenação de Tecnologia da Informação. Sistema de ponto
              eletrônico moderno e seguro.
            </p>
          </div>
          <p className="text-neutral-600 text-[10px] mt-1 uppercase tracking-wider opacity-50 text-center">
            Desenvolvido por c1c3ru • Campus Maracanau
          </p>
        </div>
      </div>
    </div>
  )
}
