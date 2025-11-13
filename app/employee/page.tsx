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
  Calendar, 
  MapPin, 
  Play, 
  Square,
  Clock,
  X,
  CheckCircle,
  Home,
  Timer
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { handleCompleteLogout } from '@/lib/logout'
import QRScanner from '@/components/QRScanner'
import InternshipTimeline from '@/components/InternshipTimeline'

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
        
        // Mostrar feedback de sucesso imediatamente
        const recordType = result.record.type === 'ENTRY' ? 'Entrada' : 'Saída'
        const recordTime = result.record.time || new Date(result.record.timestamp).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        })
        
        // Mostrar informação inteligente se disponível
        const qrTypeIcon = result.qrType === 'SECURE' ? '🔒' : 
                          result.qrType === 'SIMPLE' ? '📝' : '📄'
        const confidenceText = result.analysis?.confidence === 'high' ? 'Alta confiança' : 
                              result.analysis?.confidence === 'medium' ? 'Média confiança' : 'Baixa confiança'
        
        const smartInfo = result.analysis ? 
          `${qrTypeIcon} ${result.smartMessage} (${confidenceText})` :
          `${recordType} registrada às ${recordTime}`
          
        setQrResult(`✅ ${smartInfo}`)
        setLastRegistration(smartInfo)
        
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
          
          {/* Notificação de Último Registro */}
          {lastRegistration && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-green-400 font-medium">Ponto Registrado!</p>
                  <p className="text-green-300 text-sm">{lastRegistration}</p>
                </div>
              </div>
            </div>
          )}

          {/* Status Card */}
          <Card variant="glass" className="overflow-hidden">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-4 h-4 rounded-full ${
                      workStatus?.isWorking ? 'bg-primary animate-pulse' : 'bg-neutral-500'
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
                        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                          <div className="flex items-center justify-center space-x-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                            <p className="text-blue-400 text-base font-medium">Registrando ponto...</p>
                          </div>
                        </div>
                      )}
                      
                      {qrResult && (
                        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                            <p className="text-green-400 text-base break-words">{qrResult}</p>
                          </div>
                        </div>
                      )}
                      
                      {cameraError && (
                        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                            <p className="text-red-400 text-base break-words">{cameraError}</p>
                          </div>
                        </div>
                      )}
                      
                      {!cameraError && !qrResult && !processingQr && (
                        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                          <p className="text-green-400 text-center text-sm font-medium mb-2">
                            📱 Aponte a câmera para o código QR da máquina
                          </p>
                          <p className="text-green-300 text-center text-xs">
                            • Mantenha o QR dentro do quadrado verde<br/>
                            • Certifique-se de que há boa iluminação<br/>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* QR Code Scanner */}
              <Card variant="glass" className="group hover:scale-105 transition-all duration-200 h-full">
                <CardContent className="p-4 sm:p-6 lg:p-8 text-center flex flex-col h-full">
                  <div className="bg-primary/20 rounded-2xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-primary/30 transition-colors">
                    {workStatus?.isWorking ? (
                      <Square className="h-10 w-10 text-primary" />
                    ) : (
                      <Play className="h-10 w-10 text-primary" />
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                    {workStatus?.isWorking ? 'Registrar Saída' : 'Registrar Entrada'}
                  </h3>
                  <p className="text-neutral-400 text-xs sm:text-sm mb-4 sm:mb-6">
                    Use a câmera para registrar seu ponto na máquina
                  </p>
                  
                  {/* Área flexível para alertas */}
                  <div className="flex-1 mb-6">
                    {/* Status de verificação */}
                    {isCheckingCamera && (
                      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 mb-4">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mx-auto mb-2"></div>
                          <p className="text-blue-400 text-sm">Preparando câmera...</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Status da Câmera */}
                    {!isCheckingCamera && cameraPermission === 'denied' && (
                      <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
                        <div className="text-center">
                          <AlertTriangle className="h-6 w-6 text-red-400 mx-auto mb-2" />
                          <p className="text-red-400 text-sm font-medium mb-2">Câmera Bloqueada</p>
                          <p className="text-red-400 text-xs mb-3">
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
                              className="text-red-400 border-red-400/50 hover:bg-red-500/10"
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
                  </div>
                  
                  <Button 
                    onClick={() => {
                      console.log('🔘 [BUTTON] Botão clicado!')
                      console.log('🔘 [BUTTON] Estados:', { scanning, isCheckingCamera, cameraPermission })
                      startScanning()
                    }} 
                    className="w-full mt-auto"
                    disabled={scanning || isCheckingCamera}
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    {scanning ? 'Abrindo Scanner...' :
                     isCheckingCamera ? 'Verificando...' :
                     'Abrir Scanner QR'}
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

              {/* Justifications */}
              <Link href="/employee/justifications">
                <Card variant="glass" className="group hover:scale-105 transition-all duration-200 cursor-pointer h-full">
                  <CardContent className="p-8 text-center flex flex-col h-full">
                    <div className="bg-warning/20 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-warning/30 transition-colors">
                      <AlertTriangle className="h-10 w-10 text-warning" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      Justificativas
                    </h3>
                    <p className="text-neutral-400 text-sm mb-6">
                      Justifique atrasos e faltas (&gt;30 min)
                    </p>
                    <div className="flex-1"></div>
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
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    Registros Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <div className="space-y-4">
                  {recentRecords.length > 0 ? (
                    recentRecords.map((record) => (
                      <div key={record.id} className="rounded-lg bg-neutral-800/30 hover:bg-neutral-800/50 transition-colors overflow-hidden">
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
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center space-x-4">
                            <div className="text-center min-w-[60px]">
                              <p className="text-white font-medium">{record.date}</p>
                            </div>
                            <div className="h-8 w-px bg-neutral-600"></div>
                            <div>
                              <div className="flex items-center space-x-4 text-sm">
                                {record.entry && (
                                  <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-green-400 font-medium">
                                      Entrada: {record.entry}
                                    </span>
                                  </div>
                                )}
                                {record.exit && (
                                  <>
                                    <span className="text-neutral-500">•</span>
                                    <div className="flex items-center space-x-1">
                                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                      <span className="text-orange-400 font-medium">
                                        Saída: {record.exit}
                                      </span>
                                    </div>
                                  </>
                                )}
                                {!record.entry && record.status === 'Ausente' && (
                                  <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <span className="text-red-400 font-medium">
                                      Ausente
                                    </span>
                                  </div>
                                )}
                              </div>
                              <p className="text-neutral-400 text-xs mt-1 flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {record.location} • Total: {record.hours}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                              record.status === 'Completo' 
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
                
                <div className="mt-6 text-center">
                  <Button variant="ghost" className="text-primary hover:text-primary/80">
                    Ver todos os registros
                  </Button>
                </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

    </div>
  )
}
