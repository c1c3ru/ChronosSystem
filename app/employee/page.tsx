'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
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
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'

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
  status: 'Completo' | 'Em andamento'
  location: string
}

export default function EmployeePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [workStatus, setWorkStatus] = useState<WorkStatus | null>(null)
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt' | 'checking'>('checking')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isCheckingCamera, setIsCheckingCamera] = useState(false)
  const [qrScanner, setQrScanner] = useState<Html5QrcodeScanner | null>(null)
  const [qrResult, setQrResult] = useState<string | null>(null)
  const [processingQr, setProcessingQr] = useState(false)
  const [lastRegistration, setLastRegistration] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const qrReaderRef = useRef<HTMLDivElement>(null)

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
        console.log('🧪 [CAMERA] Testando acesso direto à câmera...')
        const testStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { min: 320 },
            height: { min: 240 }
          } 
        })
        
        // Se chegou aqui, a câmera está acessível
        console.log('✅ [CAMERA] Teste direto: Câmera acessível!')
        setCameraPermission('granted')
        
        // Parar o stream de teste
        testStream.getTracks().forEach(track => track.stop())
        
        return
      } catch (testError: any) {
        console.log('❌ [CAMERA] Teste direto falhou:', testError.name)
        
        if (testError.name === 'NotAllowedError') {
          setCameraPermission('denied')
          return
        }
        // Continuar para outros métodos se não for erro de permissão
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
      
      // Buscar dados reais do usuário
      console.log('🔍 [EMPLOYEE] Buscando dados do dashboard...')
      const response = await fetch('/api/employee/dashboard')
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.success) {
          // Definir status de trabalho
          setWorkStatus(data.workStatus)
          
          // Agrupar registros por data para exibição
          const recordsByDate = new Map()
          
          data.recentRecords.forEach((record: any) => {
            const date = record.date
            if (!recordsByDate.has(date)) {
              recordsByDate.set(date, {
                id: `day-${date}`,
                date,
                entry: null,
                exit: null,
                hours: '-',
                status: 'Em andamento',
                location: record.machine.location
              })
            }
            
            const dayRecord = recordsByDate.get(date)
            if (record.type === 'ENTRY') {
              dayRecord.entry = record.time
            } else if (record.type === 'EXIT') {
              dayRecord.exit = record.time
              dayRecord.status = 'Completo'
            }
          })
          
          // Converter para array e limitar a 5 registros
          const formattedRecords = Array.from(recordsByDate.values()).slice(0, 5)
          setRecentRecords(formattedRecords)
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

  const startScanning = async () => {
    try {
      console.log('📷 [QR] Iniciando scanner QR...')
      setScanning(true)
      setCameraError(null)
      setQrResult(null)
      
      // Limpar scanner anterior se existir
      if (qrScanner) {
        await qrScanner.clear()
        setQrScanner(null)
      }
      
      // Aguardar o DOM estar pronto
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Configurar o scanner QR
      if (qrReaderRef.current) {
        console.log('🔧 [QR] Configurando scanner...')
        
        const scanner = new Html5QrcodeScanner(
          "qr-reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            // Configurações de câmera (preferir traseira, mas aceitar frontal)
            videoConstraints: {
              facingMode: 'environment' // Preferir câmera traseira, mas não forçar
            },
            // Ocultar elementos técnicos da interface
            showTorchButtonIfSupported: false,
            showZoomSliderIfSupported: false,
            defaultZoomValueIfSupported: 1
          },
          false // verbose = false para não mostrar logs técnicos
        )
        
        // Callback quando código é detectado
        const onScanSuccess = async (decodedText: string, decodedResult: any) => {
          console.log('✅ Código detectado:', decodedText.substring(0, 20) + '...')
          
          // Parar o scanner imediatamente
          try {
            await scanner.clear()
            setQrScanner(null)
          } catch (clearError) {
            console.log('Scanner finalizado')
          }
          
          // Processar o código
          await processQrCode(decodedText)
        }
        
        // Callback para erros (opcional, não logamos para evitar spam)
        const onScanFailure = (error: string) => {
          // Não fazer nada - erros de scan são normais durante a busca
        }
        
        // Iniciar o scanner com delay para garantir que o DOM esteja pronto
        setTimeout(() => {
          try {
            scanner.render(onScanSuccess, onScanFailure)
            setQrScanner(scanner)
            console.log('✅ [QR] Scanner QR iniciado com sucesso!')
          } catch (renderError: any) {
            console.error('❌ [QR] Erro ao renderizar scanner:', renderError)
            setCameraError(`Erro ao inicializar câmera: ${renderError.message || 'Erro desconhecido'}`)
            setScanning(false)
          }
        }, 200)
        
      } else {
        throw new Error('Elemento do scanner não encontrado')
      }
    } catch (error: any) {
      console.error('❌ Erro ao iniciar scanner:', error)
      setScanning(false)
      
      // Tratamento específico para erros de câmera
      if (error.name === 'OverconstrainedError') {
        setCameraError('Câmera não disponível. Tente usar um dispositivo com câmera traseira.')
      } else if (error.name === 'NotAllowedError') {
        setCameraError('Permissão da câmera negada. Permita o acesso e tente novamente.')
      } else if (error.name === 'NotFoundError') {
        setCameraError('Nenhuma câmera encontrada neste dispositivo.')
      } else {
        setCameraError(`Erro ao acessar câmera: ${error.message}`)
      }
    } finally {
      setIsCheckingCamera(false)
      document.body.classList.remove('modal-open')
    }
  }

  const processQrCode = async (qrData: string) => {
    try {
      setProcessingQr(true)
      setCameraError('')
      setQrResult('')
      
      console.log('⚙️ [QR] Processando registro de ponto...')
      
      // Enviar registro de ponto usando API simples (aceita QR seguro e simples)
      const response = await fetch('/api/attendance/simple-register', {
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
        
        setQrResult(`✅ ${recordType} registrada às ${recordTime}`)
        setLastRegistration(`${recordType} registrada às ${recordTime}`)
        
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
        setCameraError(result.error || 'Erro ao registrar ponto')
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

  const stopScanning = async () => {
    console.log(' Fechando câmera...')
    
    // Remover classe modal-open do body
    document.body.classList.remove('modal-open')
    
    // Limpar scanner
    if (qrScanner) {
      try {
        await qrScanner.clear()
        console.log(' Scanner finalizado')
      } catch (error) {
        console.log('Scanner finalizado')
      }
      setQrScanner(null)
    }
    
    // Limpar stream de vídeo se existir
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    
    // Limpar todos os estados relacionados ao scanner
    setScanning(false)
    setQrResult(null)
    setProcessingQr(false)
    setCameraError(null)
    
    console.log('✅ Câmera fechada')
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
              <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/' })} className="p-2">
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
                        <div 
                          id="qr-reader" 
                          ref={qrReaderRef}
                          className="w-full min-h-[280px] sm:min-h-[320px] lg:min-h-[350px]"
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
                      
                      {/* Instructions and Cancel Button */}
                      <div className="text-center space-y-4 pt-2">
                        <p className="text-neutral-300 text-base">
                          Aponte a câmera para o código QR da máquina
                        </p>
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
                                console.log('🔄 [CAMERA] Forçando re-verificação completa...')
                                setCameraPermission('checking')
                                setCameraError(null)
                                setIsCheckingCamera(true)
                                
                                // Aguardar um pouco e re-verificar
                                setTimeout(async () => {
                                  await checkCameraPermission()
                                }, 500)
                              }} 
                              size="sm" 
                              variant="ghost"
                              className="text-red-400 border-red-400/50 hover:bg-red-500/10"
                            >
                              Tentar Novamente
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
                    onClick={startScanning} 
                    className="w-full mt-auto"
                    disabled={isCheckingCamera || (cameraPermission === 'denied' && !isCheckingCamera)}
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    {isCheckingCamera ? 'Verificando...' :
                     cameraPermission === 'checking' ? 'Verificando...' : 
                     cameraPermission === 'denied' ? 'Câmera Bloqueada' : 
                     cameraPermission === 'prompt' ? 'Solicitar Câmera' :
                     'Abrir Scanner'}
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
                      <div key={record.id} className="flex items-center justify-between p-4 rounded-lg bg-neutral-800/30 hover:bg-neutral-800/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="text-center min-w-[60px]">
                            <p className="text-white font-medium">{record.date}</p>
                          </div>
                          <div className="h-8 w-px bg-neutral-600"></div>
                          <div>
                            <div className="flex items-center space-x-4 text-sm">
                              {record.entry && (
                                <span className="text-primary">
                                  Entrada: {record.entry}
                                </span>
                              )}
                              {record.exit && (
                                <>
                                  <span className="text-neutral-500">•</span>
                                  <span className="text-warning">
                                    Saída: {record.exit}
                                  </span>
                                </>
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
                              : 'bg-warning/20 text-warning border border-warning/30'
                          }`}>
                            {record.status}
                          </span>
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
