'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User,
  LogOut,
  Camera,
  History,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  TrendingUp,
  Shield,
  Settings,
  Bell,
  Menu,
  X,
  Eye,
  EyeOff,
  Timer,
  Lock,
  FileText,
  ChevronRight,
  LogIn,
  Home,
  MapPin,
  Play,
  Square,
  Calendar
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { handleCompleteLogout } from '@/lib/logout'
import QRScanner from '@/components/QRScanner'
import InternshipTimeline from '@/components/InternshipTimeline'
import { HolidayNotification } from '@/components/HolidayNotification'

interface WorkStatus {
  isWorking: boolean
  lastRecord: {
    type: 'ENTRY' | 'EXIT'
    time: string
    location: string
  } | null
  todayHours: string
}

interface AttendanceRecord {
  id: string
  date: string
  entry?: string
  exit?: string
  hours: string
  status: 'Completo' | 'Em andamento' | 'Incompleto' | 'Ausente'
  location: string
  alerts?: Array<{
    type: string
    message: string
    severity: 'low' | 'medium' | 'high'
  }>
  hasJustification?: boolean
}

export default function EmployeePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [workStatus, setWorkStatus] = useState<WorkStatus | null>(null)
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [qrResult, setQrResult] = useState<string | null>(null)
  const [processingQr, setProcessingQr] = useState(false)
  const [lastRegistration, setLastRegistration] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isCheckingCamera, setIsCheckingCamera] = useState(false)
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt' | 'checking'>('prompt')
  const [scanning, setScanning] = useState(false)
  const qrReaderRef = useRef<HTMLDivElement>(null)
  const [userProfile, setUserProfile] = useState<{
    startDate?: string
    weeklyHours?: number
    contractType?: string
    completedHours?: number
  } | null>(null)

  // 🎯 Novos estados para melhorias de UX
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [lastRecordType, setLastRecordType] = useState<'ENTRY' | 'EXIT' | null>(null)

  // Verificar permissões da câmera ao carregar
  useEffect(() => {
    checkCameraPermission()
  }, [])

  const checkCameraPermission = async () => {
    try {
      setIsCheckingCamera(true)
      setCameraError(null)
      console.log('🔍 [CAMERA] Verificando permissões da câmera...')

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraPermission('denied')
        setCameraError('Câmera não suportada neste dispositivo')
        return
      }

      // Verificar se está em HTTPS (necessário para câmera)
      if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        setCameraPermission('denied')
        setCameraError('HTTPS é necessário para acessar a câmera. Acesse via https://')
        return
      }

      // Verificar se há política de permissões bloqueando
      if (typeof document !== 'undefined') {
        try {
          const doc = document as any
          const permissionsPolicy = doc.featurePolicy || doc.permissionsPolicy
          if (permissionsPolicy && typeof permissionsPolicy.allowsFeature === 'function') {
            if (!permissionsPolicy.allowsFeature('camera')) {
              setCameraPermission('denied')
              setCameraError('Política de permissões bloqueia o acesso à câmera')
              return
            }
          }
        } catch (policyError) {
          console.log('⚠️ [CAMERA] Não foi possível verificar política de permissões:', policyError)
          // Continuar sem bloquear se não conseguir verificar
        }
      }

      // MÉTODO 1: Testar acesso direto à câmera (mais confiável)
      try {
        console.log('🎥 [CAMERA] Testando acesso direto à câmera...')

        // Solicitar permissão explícita da câmera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Preferir câmera traseira
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        })

        console.log('✅ [CAMERA] Acesso à câmera concedido!')
        console.log('📹 [CAMERA] Stream obtido:', stream.getTracks().length, 'tracks')

        // Parar o stream imediatamente (só estamos testando permissão)
        stream.getTracks().forEach(track => {
          track.stop()
          console.log('🛑 [CAMERA] Track parado:', track.kind)
        })

        setCameraPermission('granted')
        console.log('✅ [CAMERA] Permissão definida como granted')
        return

      } catch (directError: any) {
        console.log('⚠️ [CAMERA] Erro no acesso direto:', directError.name, directError.message)

        // Tratar erros específicos
        if (directError.name === 'NotAllowedError') {
          setCameraPermission('denied')
          setCameraError('Permissão da câmera negada. Clique no ícone da câmera na barra de endereços e permita o acesso.')
          return
        } else if (directError.name === 'NotFoundError') {
          setCameraPermission('denied')
          setCameraError('Nenhuma câmera encontrada neste dispositivo.')
          return
        } else if (directError.name === 'NotReadableError') {
          setCameraPermission('denied')
          setCameraError('Câmera está sendo usada por outro aplicativo.')
          return
        }

        // Continuar para outros métodos se não for erro crítico
        console.log('🔄 [CAMERA] Tentando método alternativo...')
      }

      // MÉTODO 2: Usar Permissions API como fallback
      if ('permissions' in navigator) {
        try {
          const permission = await navigator.permissions.query({ name: 'camera' as PermissionName })
          const permState = permission.state as 'granted' | 'denied' | 'prompt'

          console.log('🔍 [CAMERA] Permissions API:', permState)
          setCameraPermission(permState)

          // Escutar mudanças de permissão
          permission.onchange = () => {
            const newState = permission.state as 'granted' | 'denied' | 'prompt'
            console.log('🔄 [CAMERA] Permissão mudou para:', newState)
            setCameraPermission(newState)
            if (newState === 'granted') {
              setCameraError(null)
              // Re-testar acesso quando permissão muda
              setTimeout(() => checkCameraPermission(), 500)
            }
          }
        } catch (permError) {
          console.log('⚠️ [CAMERA] Permissions API não suportada, usando prompt')
          setCameraPermission('prompt')
        }
      } else {
        // MÉTODO 3: Fallback para navegadores antigos
        console.log('⚠️ [CAMERA] Permissions API não disponível, usando prompt')
        setCameraPermission('prompt')
      }
    } catch (error) {
      console.error('❌ [CAMERA] Erro geral ao verificar permissões:', error)
      setCameraPermission('prompt')
    } finally {
      setIsCheckingCamera(false)
    }
  }

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      signIn()
    }
  }, [status])

  // Load employee data
  useEffect(() => {
    if (session) {
      loadEmployeeData()
    }
  }, [session])

  // 🎯 Cooldown timer - conta regressiva após registro
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds(cooldownSeconds - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldownSeconds])

  const loadEmployeeData = async () => {
    try {
      setLoading(true)

      // Buscar dados reais do usuário com análise de alertas
      console.log('🔍 [EMPLOYEE] Buscando dados do dashboard...')
      const response = await fetch('/api/employee/dashboard-enhanced')

      if (response.ok) {
        const data = await response.json()

        if (data.success) {
          // Definir status de trabalho
          setWorkStatus(data.workStatus)

          // Usar os dados já analisados da nova API
          const formattedRecords = data.analyzedDays.map((day: any) => ({
            id: `day-${day.date}`,
            date: day.date,
            entry: day.entry,
            exit: day.exit,
            hours: day.totalHours,
            status: day.status === 'completed' ? 'Completo' :
              day.status === 'incomplete' ? 'Incompleto' :
                day.status === 'absent' ? 'Ausente' : 'Em andamento',
            location: day.location,
            alerts: day.alerts,
            hasJustification: day.hasJustification
          }))

          setRecentRecords(formattedRecords)

          // Buscar dados do perfil para linha do tempo (se for estagiário)
          if (data.userProfile) {
            setUserProfile({
              startDate: data.userProfile.startDate,
              weeklyHours: data.userProfile.weeklyHours,
              contractType: data.userProfile.contractType,
              completedHours: data.userProfile.completedHours || 0
            })
          }
        } else {
          throw new Error(data.error || 'Erro ao carregar dados')
        }
      } else {
        throw new Error('Erro na requisição')
      }
    } catch (error) {
      console.error('Erro ao carregar dados do funcionário:', error)
      // Em caso de erro, mostrar estado vazio
      setRecentRecords([])
      setWorkStatus({
        isWorking: false,
        lastRecord: null,
        todayHours: '0h 00min'
      })
    } finally {
      setLoading(false)
    }
  }

  const startScanning = () => {
    console.log('📷 [QR] Abrindo scanner nativo...')
    setShowQRScanner(true)
    setScanning(true)
  }

  const processQrCode = async (qrData: string) => {
    try {
      setProcessingQr(true)
      setCameraError('')
      setQrResult('')

      console.log('⚙️ [QR] Processando registro de ponto...')

      // Enviar registro de ponto usando API unificada (aceita QR seguro, JSON e texto)
      const response = await fetch('/api/attendance/qr-unified', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          qrData: qrData
        })
      })

      const result = await response.json()
      console.log('📡 [QR] Resposta da API:', result)

      if (response.ok && result.success) {
        console.log('✅ [QR] Ponto registrado com sucesso!')

        // 🎯 VIBRAÇÃO - Feedback tátil
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200]) // Padrão de vibração: 200ms, pausa 100ms, 200ms
        }

        // Mostrar feedback de sucesso imediatamente
        const recordType = result.record.type === 'ENTRY' ? 'Entrada' : 'Saída'
        const recordTime = result.record.time || new Date(result.record.timestamp).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        })

        // 🎯 Salvar tipo do último registro para cores
        setLastRecordType(result.record.type)

        // 🎯 Ativar animação de sucesso
        setShowSuccessAnimation(true)
        setTimeout(() => setShowSuccessAnimation(false), 3000)

        // 🎯 Iniciar cooldown de 60 segundos
        setCooldownSeconds(60)

        // Mostrar informação inteligente se disponível
        const confidenceText = result.analysis?.confidence === 'high' ? 'Alta confiança' :
          result.analysis?.confidence === 'medium' ? 'Média confiança' : 'Baixa confiança'

        // Criar mensagem com destaque visual claro
        const displayMessage = `${recordType}\n${recordTime}\n${result.record.machineName}`
        const smartInfo = result.analysis ?
          `${result.smartMessage} (${confidenceText})` :
          `${recordType} registrada às ${recordTime}`

        setQrResult(`✅ ${displayMessage}`)
        setLastRegistration(displayMessage)

        // Log da análise inteligente
        if (result.analysis) {
          console.log('🧠 [QR] Análise inteligente:', {
            reason: result.analysis.reason,
            confidence: result.analysis.confidence,
            suggestions: result.analysis.suggestions,
            warnings: result.analysis.warnings
          })

          // Mostrar avisos se houver
          if (result.analysis.warnings.length > 0) {
            console.warn('⚠️ [QR] Avisos:', result.analysis.warnings)
          }
        }

        // Aguardar 3 segundos para mostrar o sucesso, depois fechar
        setTimeout(async () => {
          console.log('🔄 [QR] Finalizando e atualizando dados...')

          // Fechar scanner
          await stopScanning()

          // Atualizar dados da página
          setTimeout(async () => {
            await loadEmployeeData()
            console.log('✅ [QR] Dados atualizados!')

            // Limpar notificação após 5 segundos
            setTimeout(() => {
              setLastRegistration(null)
            }, 5000)
          }, 500)

        }, 3000) // Aumentar tempo para 3 segundos

      } else {
        console.error('❌ [QR] Erro no registro:', result.error)

        // Melhorar mensagem de erro para o usuário
        let userFriendlyError = result.error || 'Erro ao registrar ponto'

        // Tratar erros específicos com mensagens mais amigáveis
        if (result.code === 'MACHINE_NOT_FOUND') {
          userFriendlyError = 'Máquina não encontrada. Verifique se o QR code está correto.'
        } else if (result.code === 'QR_NOT_FOUND') {
          userFriendlyError = 'QR code inválido ou expirado. Gere um novo QR code.'
        } else if (result.code === 'QR_ALREADY_USED') {
          userFriendlyError = 'QR code já foi utilizado. Gere um novo QR code.'
        } else if (result.code === 'DUPLICATE_RECORD') {
          userFriendlyError = 'Registro já feito recentemente. Aguarde 1 minuto.'
        } else if (result.code === 'VALIDATION_FAILED') {
          userFriendlyError = 'Registro não permitido no momento. Verifique o horário.'
        } else if (result.code === 'UNAUTHORIZED') {
          userFriendlyError = 'Sessão expirada. Faça login novamente.'
        } else if (result.code === 'RATE_LIMIT_EXCEEDED') {
          userFriendlyError = 'Muitas tentativas. Aguarde alguns segundos.'
        }

        setCameraError(userFriendlyError)
        setQrResult('')
      }

    } catch (error: any) {
      console.error('❌ [QR] Erro ao processar registro:', error)
      setCameraError(`Erro ao registrar ponto: ${error.message}`)
      setQrResult('')
    } finally {
      setProcessingQr(false)
    }
  }

  const stopScanning = () => {
    console.log('🔒 [QR] Fechando scanner...')
    setShowQRScanner(false)
    setScanning(false)
    setProcessingQr(false)
    setCameraError(null)
    setQrResult(null)
  }


  if (status === 'loading') {
    return <Loading size="lg" text="Carregando..." />
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Header - Mobile Optimized */}
      <div className="glass border-b border-neutral-700/50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                <Home className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </Link>
              <div className="h-5 w-px bg-neutral-600 hidden sm:block" />
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="bg-primary/20 rounded-lg sm:rounded-xl p-1.5 sm:p-2">
                  <User className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg sm:text-xl font-bold text-white">Portal do Estagiário</h1>
                  <p className="text-neutral-400 text-xs sm:text-sm">Sistema Chronos - Registro de Ponto</p>
                </div>
                <div className="block sm:hidden">
                  <h1 className="text-base font-bold text-white">Portal</h1>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-white font-medium text-sm">{session.user.name}</p>
                <p className="text-neutral-400 text-xs">{session.user.email}</p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <Button variant="ghost" size="sm" onClick={handleCompleteLogout} className="p-2">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">




          {/* 🎯 Notificação de Último Registro com Cores Dinâmicas */}
          {lastRegistration && (
            <div className={`
              ${lastRecordType === 'ENTRY' ? 'bg-success-500/20 border-success-500/30' : 'bg-warning/20 border-warning/30'}
              border rounded-lg p-4 
              ${showSuccessAnimation ? 'animate-in slide-in-from-top-2 scale-in-95' : 'animate-in fade-in'}
              duration-300
            `}>
              <div className="flex items-center space-x-3">
                {lastRecordType === 'ENTRY' ? (
                  <LogIn className={`h-6 w-6 flex-shrink-0 ${showSuccessAnimation ? 'animate-bounce' : ''} text-success-400`} />
                ) : (
                  <LogOut className={`h-6 w-6 flex-shrink-0 ${showSuccessAnimation ? 'animate-bounce' : ''} text-warning`} />
                )}
                <div>
                  <p className={`font-bold text-lg ${lastRecordType === 'ENTRY' ? 'text-success-400' : 'text-warning'}`}>
                    ✅ {lastRecordType === 'ENTRY' ? 'ENTRADA' : 'SAÍDA'} Registrada!
                  </p>
                  <p className={`text-sm ${lastRecordType === 'ENTRY' ? 'text-success-300' : 'text-warning/80'}`}>
                    {lastRegistration}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notificação de Feriados Próximos */}
          <HolidayNotification />

          {/* Status Card */}
          <Card variant="glass" className="overflow-hidden">
            <CardContent className="p-6">
              {/* 🎯 Banner de Próximo Registro */}
              <div className={`mb-4 p-3 rounded-lg flex items-center justify-between ${workStatus?.isWorking
                ? 'bg-warning/20 border-l-4 border-warning'
                : 'bg-success-500/20 border-l-4 border-success-500'
                }`}>
                <div className="flex items-center space-x-3">
                  {workStatus?.isWorking ? (
                    <LogOut className="h-5 w-5 text-warning flex-shrink-0" />
                  ) : (
                    <LogIn className="h-5 w-5 text-success-400 flex-shrink-0" />
                  )}
                  <div>
                    <p className={`font-bold text-sm ${workStatus?.isWorking ? 'text-warning' : 'text-success-400'
                      }`}>
                      Próximo registro: {workStatus?.isWorking ? 'SAÍDA' : 'ENTRADA'}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {workStatus?.isWorking
                        ? 'Finalize seu expediente ao sair'
                        : 'Inicie seu expediente ao chegar'}
                    </p>
                  </div>
                </div>
                <div className={`text-2xl ${workStatus?.isWorking ? 'text-warning' : 'text-success-400'
                  }`}>
                  {workStatus?.isWorking ? '🔴' : '🟢'}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full ${workStatus?.isWorking ? 'bg-primary animate-pulse' : 'bg-neutral-500'
                    }`}></div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {workStatus?.isWorking ? 'Trabalhando' : 'Fora do expediente'}
                    </h2>
                    {workStatus?.lastRecord && (
                      <p className="text-neutral-400 flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        Último registro: {workStatus.lastRecord.type === 'ENTRY' ? 'Entrada' : 'Saída'} às {workStatus.lastRecord.time} - {workStatus.lastRecord.location}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-primary mb-2">
                    <Timer className="h-5 w-5 mr-2" />
                    <span className="text-2xl font-bold">{workStatus?.todayHours}</span>
                  </div>
                  <p className="text-neutral-400 text-sm">Horas hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Linha do Tempo do Estágio - Apenas para estagiários */}
          {userProfile && userProfile.contractType?.startsWith('ESTAGIO') && userProfile.startDate && (
            <InternshipTimeline
              startDate={userProfile.startDate}
              weeklyHours={userProfile.weeklyHours || 20}
              completedHours={userProfile.completedHours || 0}
              contractType={userProfile.contractType}
            />
          )}

          {/* Scanner Modal - Mobile First */}
          {scanning && (
            <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-modal flex items-start sm:items-center justify-center overflow-y-auto">
              <div className="w-full min-h-screen sm:min-h-0 sm:max-w-md lg:max-w-lg mx-auto flex items-start sm:items-center justify-center p-4 sm:p-6">
                <Card variant="glass" className="w-full max-w-none sm:max-w-md lg:max-w-lg">
                  <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6 border-b border-white/10">
                    <CardTitle className="text-white text-lg sm:text-xl">Registrar Ponto</CardTitle>
                    <Button
                      onClick={stopScanning}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/10 p-2 rounded-full"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4 p-4 sm:p-6">
                    {/* QR Scanner Container - Mobile Optimized */}
                    <div className="relative bg-black rounded-lg overflow-hidden border border-primary/30">
                      <QRScanner
                        isActive={scanning}
                        onScan={processQrCode}
                        onActivate={() => setScanning(true)}
                      />
                    </div>

                    {/* Status Messages - Mobile Optimized */}
                    {processingQr && (
                      <div className="bg-info-500/20 border border-info-500/30 rounded-lg p-4">
                        <div className="flex items-center justify-center space-x-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-info-400"></div>
                          <p className="text-info-400 text-base font-medium">Registrando ponto...</p>
                        </div>
                      </div>
                    )}

                    {qrResult && (
                      <div className="bg-success-500/20 border border-success-500/30 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-success-400 mt-0.5 flex-shrink-0" />
                          <p className="text-success-400 text-base break-words">{qrResult}</p>
                        </div>
                      </div>
                    )}

                    {cameraError && (
                      <div className="bg-error-500/20 border border-error-500/30 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <AlertTriangle className="h-5 w-5 text-error-400 mt-0.5 flex-shrink-0" />
                          <p className="text-error-400 text-base break-words">{cameraError}</p>
                        </div>
                      </div>
                    )}

                    {!cameraError && !qrResult && !processingQr && (
                      <div className="bg-success-500/20 border border-success-500/30 rounded-lg p-4">
                        <p className="text-success-400 text-center text-sm font-medium mb-2">
                          📱 Aponte a câmera para o código QR da máquina
                        </p>
                        <p className="text-success-300 text-center text-xs">
                          • Mantenha o QR dentro do quadrado verde<br />
                          • Certifique-se de que há boa iluminação<br />
                          • Mantenha a câmera estável
                        </p>
                      </div>
                    )}

                    {/* Cancel Button */}
                    <div className="text-center space-y-4 pt-2">
                      <Button
                        onClick={stopScanning}
                        variant="secondary"
                        className="w-full py-3 text-base font-medium"
                        disabled={processingQr}
                      >
                        {processingQr ? 'Processando...' : 'Cancelar'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Main Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 items-start">
            {/* QR Code Scanner */}
            <Card variant="glass" className={`group hover:scale-105 transition-all duration-200 h-full ${workStatus?.isWorking
              ? 'border-2 border-warning/50 shadow-lg shadow-warning/20'
              : 'border-2 border-success-500/50 shadow-lg shadow-success-500/20'
              }`}>
              <CardContent className="p-4 sm:p-6 lg:p-8 text-center flex flex-col h-full">
                {/* 🎯 INDICADOR VISUAL GRANDE E CLARO */}
                <div className={`rounded-2xl w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-4 transition-all ${workStatus?.isWorking
                  ? 'bg-warning/30 ring-4 ring-warning/40'
                  : 'bg-success-500/30 ring-4 ring-success-500/40'
                  }`}>
                  {workStatus?.isWorking ? (
                    <LogOut className="h-12 w-12 sm:h-14 sm:w-14 text-warning animate-pulse" />
                  ) : (
                    <LogIn className="h-12 w-12 sm:h-14 sm:w-14 text-success-400 animate-pulse" />
                  )}
                </div>

                {/* 🎯 TÍTULO GRANDE E COLORIDO */}
                <div className={`mb-3 p-3 rounded-lg ${workStatus?.isWorking
                  ? 'bg-warning/20 border-2 border-warning/40'
                  : 'bg-success-500/20 border-2 border-success-500/40'
                  }`}>
                  <h3 className={`text-xl sm:text-2xl font-bold mb-1 ${workStatus?.isWorking ? 'text-warning' : 'text-success-400'
                    }`}>
                    {workStatus?.isWorking ? '🔴 REGISTRAR SAÍDA' : '🟢 REGISTRAR ENTRADA'}
                  </h3>
                  <p className={`text-sm font-medium ${workStatus?.isWorking ? 'text-warning/80' : 'text-success-300'
                    }`}>
                    {workStatus?.isWorking
                      ? 'Você está trabalhando agora'
                      : 'Você está fora do expediente'}
                  </p>
                </div>

                <p className="text-neutral-400 text-xs sm:text-sm mb-4">
                  Use a câmera para registrar seu ponto na máquina
                </p>

                {/* Área flexível para alertas */}
                <div className="flex-1 mb-6">
                  {/* Status de verificação */}
                  {isCheckingCamera && (
                    <div className="bg-info-500/20 border border-info-500/30 rounded-lg p-3 mb-4">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-info-400 mx-auto mb-2"></div>
                        <p className="text-info-400 text-sm">Preparando câmera...</p>
                      </div>
                    </div>
                  )}

                  {/* Status da Câmera */}
                  {!isCheckingCamera && cameraPermission === 'denied' && (
                    <div className="bg-error-500/20 border border-error-500/30 rounded-lg p-3 mb-4">
                      <div className="text-center">
                        <AlertTriangle className="h-6 w-6 text-error-400 mx-auto mb-2" />
                        <p className="text-error-400 text-sm font-medium mb-2">Câmera Bloqueada</p>
                        <p className="text-error-400 text-xs mb-3">
                          Para registrar seu ponto, permita o acesso à câmera quando solicitado
                        </p>
                        <div className="space-y-2">
                          <Button
                            onClick={async () => {
                              console.log('🔄 [CAMERA] Solicitando permissão explícita...')
                              setCameraPermission('checking')
                              setCameraError(null)
                              setIsCheckingCamera(true)

                              try {
                                // Solicitar permissão explícita
                                const stream = await navigator.mediaDevices.getUserMedia({
                                  video: {
                                    facingMode: 'environment',
                                    width: { ideal: 640 },
                                    height: { ideal: 480 }
                                  }
                                })

                                console.log('✅ [CAMERA] Permissão concedida!')
                                stream.getTracks().forEach(track => track.stop())
                                setCameraPermission('granted')
                                setCameraError(null)

                              } catch (error: any) {
                                console.error('❌ [CAMERA] Permissão negada:', error)
                                setCameraPermission('denied')
                                setCameraError('Permissão da câmera é necessária para escanear QR codes')
                              }

                              setIsCheckingCamera(false)
                            }}
                            size="sm"
                            variant="ghost"
                            className="text-error-400 border-error-400/50 hover:bg-error-500/10"
                          >
                            Permitir Câmera
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {cameraError && cameraPermission !== 'denied' && (
                    <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3 mb-4">
                      <p className="text-orange-400 text-xs">{cameraError}</p>
                      <Button
                        onClick={() => {
                          setCameraError(null)
                          checkCameraPermission()
                        }}
                        size="sm"
                        variant="ghost"
                        className="text-orange-400 border-orange-400/50 hover:bg-orange-500/10 mt-2"
                      >
                        Tentar Novamente
                      </Button>
                    </div>
                  )}

                  {/* 🎯 Cooldown Timer */}
                  {cooldownSeconds > 0 && (
                    <div className="bg-warning/20 border border-warning/30 rounded-lg p-3 mb-4">
                      <div className="text-center">
                        <Clock className="h-6 w-6 text-warning mx-auto mb-2" />
                        <p className="text-warning text-sm font-medium">
                          Aguarde {cooldownSeconds}s
                        </p>
                        <p className="text-warning/70 text-xs mt-1">
                          Próximo registro disponível em breve
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => {
                    console.log('🔘 [BUTTON] Botão clicado!')
                    console.log('🔘 [BUTTON] Estados:', { scanning, isCheckingCamera, cameraPermission })
                    startScanning()
                  }}
                  className={`w-full mt-auto text-base sm:text-lg font-bold py-6 ${workStatus?.isWorking
                    ? 'bg-warning hover:bg-warning/90 text-neutral-900'
                    : 'bg-success-500 hover:bg-success-600 text-white'
                    }`}
                  disabled={scanning || isCheckingCamera || cooldownSeconds > 0}
                >
                  <Camera className="h-5 w-5 mr-2" />
                  {scanning ? 'Abrindo Scanner...' :
                    isCheckingCamera ? 'Verificando...' :
                      cooldownSeconds > 0 ? `Aguarde ${cooldownSeconds}s` :
                        workStatus?.isWorking ? '📤 REGISTRAR SAÍDA' : '📥 REGISTRAR ENTRADA'}
                </Button>
              </CardContent>
            </Card>

            {/* History */}
            <Card variant="glass" className="group hover:scale-105 transition-all duration-200 h-full">
              <CardContent className="p-4 sm:p-6 lg:p-8 text-center flex flex-col h-full">
                <div className="bg-secondary-500/20 rounded-2xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-secondary-500/30 transition-colors">
                  <History className="h-10 w-10 text-secondary-500" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                  Histórico Completo
                </h3>
                <p className="text-neutral-400 text-xs sm:text-sm mb-4 sm:mb-6">
                  Visualize seu histórico de registros e relatórios mensais
                </p>
                <div className="flex-1"></div>
                <Button variant="secondary" className="w-full mt-auto">
                  Ver Histórico
                </Button>
              </CardContent>
            </Card>

            <Card variant="glass" className="group hover:scale-105 transition-all duration-200 h-full">
              <CardContent className="p-4 sm:p-6 lg:p-8 flex flex-col h-full">
                <div className="bg-neutral-700/40 rounded-2xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Lock className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                  Senha e segurança
                </h3>
                <p className="text-neutral-400 text-xs sm:text-sm mb-4 sm:mb-6">
                  Altere sua senha com segurança sempre que precisar.
                </p>
                <div className="flex-1"></div>
                <Button asChild variant="secondary" className="w-full mt-auto">
                  <Link href="/auth/change-password">
                    Alterar senha
                  </Link>
                </Button>
                <p className="text-[11px] text-neutral-500 text-center mt-3">
                  Se esquecer a senha e não conseguir acessar, use a opção &quot;Esqueci minha senha&quot; na tela de login.
                </p>
              </CardContent>
            </Card>


            {/* FASE 1: Cadastro e Início */}
            <Card variant="glass" className="group hover:scale-105 transition-all duration-200 h-full">
              <CardContent className="p-4 sm:p-6 lg:p-8 flex flex-col h-full">
                <div className="bg-success-500/20 rounded-2xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-success-500/30 transition-colors">
                  <FileText className="h-10 w-10 text-success-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3 text-center">
                  Cadastro e Início
                </h3>
                <p className="text-neutral-400 text-xs sm:text-sm mb-4 sm:mb-6 text-center">
                  Documentos iniciais para cadastro de estágio
                </p>
                <div className="flex-1"></div>

                <div className="space-y-2">
                  <a href="/documents/internship-registration-request" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg hover:bg-success-500/10 transition-colors text-sm text-neutral-300 hover:text-success-400">
                    <span>Solicitação de Cadastro</span>
                    <ChevronRight className="h-4 w-4" />
                  </a>
                  <a href="/documents/internship-registration" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg hover:bg-success-500/10 transition-colors text-sm text-neutral-300 hover:text-success-400">
                    <span>Ficha de Cadastro</span>
                    <ChevronRight className="h-4 w-4" />
                  </a>
                  <a href="/documents/commitment-term" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg hover:bg-success-500/10 transition-colors text-sm text-neutral-300 hover:text-success-400">
                    <span>Termo de Compromisso</span>
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* FASE 2: Acompanhamento */}
            <Card variant="glass" className="group hover:scale-105 transition-all duration-200 h-full">
              <CardContent className="p-4 sm:p-6 lg:p-8 flex flex-col h-full">
                <div className="bg-info-500/20 rounded-2xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-info-500/30 transition-colors">
                  <FileText className="h-10 w-10 text-info-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3 text-center">
                  Acompanhamento
                </h3>
                <p className="text-neutral-400 text-xs sm:text-sm mb-4 sm:mb-6 text-center">
                  Relatórios e avaliações periódicas
                </p>
                <div className="flex-1"></div>

                <div className="space-y-2">
                  <a href="/documents/monthly-report" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg hover:bg-info-500/10 transition-colors text-sm text-neutral-300 hover:text-info-400">
                    <span>Relatório Mensal</span>
                    <ChevronRight className="h-4 w-4" />
                  </a>
                  <a href="/documents/semester-report" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg hover:bg-info-500/10 transition-colors text-sm text-neutral-300 hover:text-info-400">
                    <span>Relatório Semestral</span>
                    <ChevronRight className="h-4 w-4" />
                  </a>
                  <a href="/documents/student-evaluation" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg hover:bg-info-500/10 transition-colors text-sm text-neutral-300 hover:text-info-400">
                    <span>Ficha de Avaliação</span>
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* FASE 3: Alterações */}
            <Card variant="glass" className="group hover:scale-105 transition-all duration-200 h-full">
              <CardContent className="p-4 sm:p-6 lg:p-8 flex flex-col h-full">
                <div className="bg-warning/20 rounded-2xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-warning/30 transition-colors">
                  <FileText className="h-10 w-10 text-warning" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3 text-center">
                  Alterações
                </h3>
                <p className="text-neutral-400 text-xs sm:text-sm mb-4 sm:mb-6 text-center">
                  Modificações no termo de compromisso
                </p>
                <div className="flex-1"></div>

                <div className="space-y-2">
                  <a href="/documents/additive-term" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg hover:bg-warning/10 transition-colors text-sm text-neutral-300 hover:text-warning">
                    <span>Termo Aditivo</span>
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* FASE 4: Finalização */}
            <Card variant="glass" className="group hover:scale-105 transition-all duration-200 h-full">
              <CardContent className="p-4 sm:p-6 lg:p-8 flex flex-col h-full">
                <div className="bg-primary/20 rounded-2xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-primary/30 transition-colors">
                  <FileText className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3 text-center">
                  Finalização
                </h3>
                <p className="text-neutral-400 text-xs sm:text-sm mb-4 sm:mb-6 text-center">
                  Documentos de conclusão do estágio
                </p>
                <div className="flex-1"></div>

                <div className="space-y-2">
                  <a href="/documents/final-report" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg hover:bg-primary/10 transition-colors text-sm text-neutral-300 hover:text-primary">
                    <span>Relatório Final</span>
                    <ChevronRight className="h-4 w-4" />
                  </a>
                  <a href="/documents/realization-term" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg hover:bg-primary/10 transition-colors text-sm text-neutral-300 hover:text-primary">
                    <span>Termo de Realização</span>
                    <ChevronRight className="h-4 w-4" />
                  </a>
                  <a href="/documents/rescission-term" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg hover:bg-primary/10 transition-colors text-sm text-neutral-300 hover:text-primary">
                    <span>Termo de Rescisão</span>
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Casos Especiais */}
            <Card variant="glass" className="group hover:scale-105 transition-all duration-200 h-full">
              <CardContent className="p-4 sm:p-6 lg:p-8 flex flex-col h-full">
                <div className="bg-secondary-500/20 rounded-2xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-secondary-500/30 transition-colors">
                  <FileText className="h-10 w-10 text-secondary-500" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3 text-center">
                  Casos Especiais
                </h3>
                <p className="text-neutral-400 text-xs sm:text-sm mb-4 sm:mb-6 text-center">
                  Documentos para situações específicas
                </p>
                <div className="flex-1"></div>

                <div className="space-y-2">
                  <a href="/documents/equivalence-request" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary-500/10 transition-colors text-sm text-neutral-300 hover:text-secondary-500">
                    <span>Solicitação de Equivalência</span>
                    <ChevronRight className="h-4 w-4" />
                  </a>
                  <a href="/documents/professional-declaration" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary-500/10 transition-colors text-sm text-neutral-300 hover:text-secondary-500">
                    <span>Declaração Profissional</span>
                    <ChevronRight className="h-4 w-4" />
                  </a>
                  <a href="/documents/extension-declaration" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary-500/10 transition-colors text-sm text-neutral-300 hover:text-secondary-500">
                    <span>Declaração de Extensão</span>
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Justifications */}
            <Link href="/employee/justifications">
              <Card variant="glass" className="group hover:scale-105 transition-all duration-200 cursor-pointer">
                <CardContent className="p-8 text-center flex flex-col">
                  <div className="bg-warning/20 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-warning/30 transition-colors">
                    <AlertTriangle className="h-10 w-10 text-warning" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Justificativas
                  </h3>
                  <p className="text-neutral-400 text-sm mb-6">
                    Justifique atrasos e faltas (&gt;30 min)
                  </p>
                  <Button variant="ghost" className="w-full border border-warning/30 hover:bg-warning/10 mt-auto">
                    Gerenciar
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>

          {!loading && (
            <>
              {/* Recent Records */}
              <Card variant="glass">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center text-white">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    Últimos 5 Dias
                  </CardTitle>
                  <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                    <Link href="/employee/attendance-history" className="flex items-center">
                      Ver todos
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentRecords.length > 0 ? (
                      recentRecords.map((record) => (
                        <div key={record.id} className="rounded-lg bg-neutral-800/30 hover:bg-neutral-800/50 transition-colors overflow-hidden border border-neutral-700/30">
                          {/* Alertas - se houver */}
                          {record.alerts && record.alerts.length > 0 && (
                            <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-l-4 border-red-500 p-3">
                              <div className="flex items-start space-x-2">
                                <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-red-400 text-xs font-medium mb-1">Atenção Necessária</p>
                                  {record.alerts.map((alert, idx) => (
                                    <p key={idx} className="text-red-300 text-xs">
                                      • {alert.message}
                                    </p>
                                  ))}
                                  {!record.hasJustification && (
                                    <Link
                                      href="/employee/justifications"
                                      className="inline-flex items-center text-xs text-red-400 hover:text-red-300 mt-2 underline"
                                    >
                                      Justificar agora
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Conteúdo principal do registro */}
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="text-white font-semibold text-sm">{record.date}</p>
                                <p className="text-neutral-400 text-xs">Total: {record.hours}</p>
                              </div>
                              <span className={`text-xs px-3 py-1 rounded-full font-medium ${record.status === 'Completo'
                                ? 'bg-success/20 text-success border border-success/30'
                                : record.status === 'Incompleto'
                                  ? 'bg-warning/20 text-warning border border-warning/30'
                                  : record.status === 'Ausente'
                                    ? 'bg-error/20 text-error border border-error/30'
                                    : 'bg-info/20 text-info border border-info/30'
                                }`}>
                                {record.status}
                              </span>
                            </div>

                            {/* Entradas e Saídas */}
                            <div className="space-y-2">
                              {record.entry && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="text-green-400 font-medium">Entrada:</span>
                                  <span className="text-neutral-300">{record.entry}</span>
                                </div>
                              )}
                              {record.exit && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                  <span className="text-orange-400 font-medium">Saída:</span>
                                  <span className="text-neutral-300">{record.exit}</span>
                                </div>
                              )}
                              {!record.entry && record.status === 'Ausente' && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  <span className="text-red-400 font-medium">Ausente</span>
                                </div>
                              )}
                              {!record.entry && !record.exit && record.status !== 'Ausente' && (
                                <p className="text-neutral-500 text-xs italic">Sem registros</p>
                              )}
                            </div>

                            {/* Localização */}
                            <p className="text-neutral-400 text-xs mt-2 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {record.location}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="bg-neutral-800/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                          <Clock className="h-8 w-8 text-neutral-500" />
                        </div>
                        <p className="text-neutral-400 mb-2">Nenhum registro encontrado</p>
                        <p className="text-neutral-500 text-sm">Seus registros de ponto aparecerão aqui</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div >

    </div>
  )
}
