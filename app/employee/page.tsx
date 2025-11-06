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
        // Garantir que o elemento tenha um ID único
        const elementId = 'qr-reader-' + Date.now()
        qrReaderRef.current.id = elementId
        
        console.log('🔧 [QR] Configurando scanner para elemento:', elementId)
        
        const scanner = new Html5QrcodeScanner(
          elementId,
          {
            fps: 10,
            qrbox: function(viewfinderWidth: number, viewfinderHeight: number) {
              // Responsivo: ajustar tamanho do qrbox baseado no viewport
              const minEdgePercentage = 0.7 // 70% da menor dimensão
              const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight)
              const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage)
              return {
                width: Math.min(qrboxSize, 300), // máximo 300px
                height: Math.min(qrboxSize, 300)
              }
            },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
            showZoomSliderIfSupported: true,
            defaultZoomValueIfSupported: 2,
            supportedScanTypes: [0], // QR_CODE apenas
            rememberLastUsedCamera: true,
            useBarCodeDetectorIfSupported: true,
            experimentalFeatures: {
              useBarCodeDetectorIfSupported: true
            },
            // Configurações para melhor performance em mobile
            videoConstraints: {
              facingMode: 'environment' // Câmera traseira preferencial
            }
          },
          false
        )
        
        // Callback quando QR code é detectado
        const onScanSuccess = async (decodedText: string, decodedResult: any) => {
          console.log('🎯 [QR] QR Code detectado:', decodedText)
          setQrResult(decodedText)
          
          // Parar o scanner
          try {
            await scanner.clear()
            setQrScanner(null)
          } catch (clearError) {
            console.log('⚠️ [QR] Erro ao limpar scanner:', clearError)
          }
          
          // Processar o QR code
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
      console.error('❌ [QR] Erro ao iniciar scanner:', error)
      setScanning(false)
      setCameraError(`Erro ao iniciar scanner: ${error.message}`)
    }
  }
  
  const processQrCode = async (qrData: string) => {
    try {
      setProcessingQr(true)
      console.log('⚙️ [QR] Processando QR code:', qrData)
      
      // Tentar fazer parse do QR code (esperamos JSON com machineId)
      let machineId: string
      
      try {
        const qrJson = JSON.parse(qrData)
        machineId = qrJson.machineId || qrJson.id || qrData
      } catch {
        // Se não for JSON, usar o texto diretamente
        machineId = qrData
      }
      
      // Enviar registro de ponto usando API existente
      const response = await fetch('/api/attendance/qr-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          qrData: qrData
        })
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        console.log('✅ [QR] Registro de ponto realizado com sucesso!')
        
        // Atualizar dados da página
        await loadEmployeeData()
        
        // Mostrar feedback de sucesso
        setCameraError(null)
        const recordType = result.record.type === 'ENTRY' ? 'Entrada' : 'Saída'
        const recordTime = new Date(result.record.timestamp).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        })
        setQrResult(`✅ ${recordType} registrada às ${recordTime} - ${result.record.location}`)
        
        // Fechar scanner após 4 segundos
        setTimeout(() => {
          stopScanning()
        }, 4000)
        
      } else {
        console.error('❌ [QR] Erro no registro:', result.error)
        setCameraError(result.error || 'Erro ao registrar ponto')
      }
      
    } catch (error: any) {
      console.error('❌ [QR] Erro ao processar QR code:', error)
      setCameraError(`Erro ao processar QR code: ${error.message}`)
    } finally {
      setProcessingQr(false)
    }
  }

  const stopScanning = async () => {
    console.log('🛑 [QR] Parando scanner...')
    
    // Limpar QR scanner
    if (qrScanner) {
      try {
        await qrScanner.clear()
        console.log('✅ [QR] Scanner QR limpo')
      } catch (error) {
        console.log('⚠️ [QR] Erro ao limpar scanner:', error)
      }
      setQrScanner(null)
    }
    
    // Limpar stream de vídeo se existir
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    
    setScanning(false)
    setQrResult(null)
    setProcessingQr(false)
  }


  if (status === 'loading') {
    return <Loading size="lg" text="Carregando..." />
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Header */}
      <div className="glass border-b border-neutral-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <Home className="h-6 w-6 text-primary" />
              </Link>
              <div className="h-6 w-px bg-neutral-600" />
              <div className="flex items-center space-x-3">
                <div className="bg-primary/20 rounded-xl p-2">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Portal do Estagiário</h1>
                  <p className="text-neutral-400 text-sm">Sistema Chronos - Registro de Ponto</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white font-medium">{session.user.name}</p>
                <p className="text-neutral-400 text-sm">{session.user.email}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <Loading size="lg" text="Carregando dados..." />
        ) : (
          <>
            {/* Status Card */}
            <Card variant="glass" className="mb-8">
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

            {/* Scanner Modal - Responsivo */}
            {scanning && (
              <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-modal flex items-center justify-center p-2 sm:p-4">
                <Card variant="glass" className="w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
                  <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
                    <CardTitle className="text-white text-lg sm:text-xl">Scanner QR</CardTitle>
                    <Button 
                      onClick={stopScanning} 
                      variant="ghost" 
                      size="sm"
                      className="text-white hover:bg-white/10 p-2"
                    >
                      <X className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                    {/* QR Scanner Container - Responsivo */}
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <div 
                        id="qr-reader" 
                        ref={qrReaderRef}
                        className="w-full min-h-[250px] sm:min-h-[300px] lg:min-h-[350px]"
                      />
                    </div>
                    
                    {/* Status Messages - Responsivo */}
                    {processingQr && (
                      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 sm:p-4">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-blue-400"></div>
                          <p className="text-blue-400 text-sm sm:text-base">Processando QR code...</p>
                        </div>
                      </div>
                    )}
                    
                    {qrResult && (
                      <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 sm:p-4">
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <p className="text-green-400 text-sm sm:text-base break-words">{qrResult}</p>
                        </div>
                      </div>
                    )}
                    
                    {cameraError && (
                      <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 sm:p-4">
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 mt-0.5 flex-shrink-0" />
                          <p className="text-red-400 text-sm sm:text-base break-words">{cameraError}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="text-center px-2">
                      <p className="text-neutral-400 text-sm sm:text-base mb-4">
                        Aponte a câmera para o QR code da máquina
                      </p>
                      <Button 
                        onClick={stopScanning} 
                        variant="secondary" 
                        className="w-full py-2 sm:py-3 text-sm sm:text-base"
                        disabled={processingQr}
                      >
                        {processingQr ? 'Processando...' : 'Cancelar'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Main Actions */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* QR Code Scanner */}
              <Card variant="glass" className="group hover:scale-105 transition-all duration-200 h-full">
                <CardContent className="p-8 text-center flex flex-col h-full">
                  <div className="bg-primary/20 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/30 transition-colors">
                    {workStatus?.isWorking ? (
                      <Square className="h-10 w-10 text-primary" />
                    ) : (
                      <Play className="h-10 w-10 text-primary" />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {workStatus?.isWorking ? 'Registrar Saída' : 'Registrar Entrada'}
                  </h3>
                  <p className="text-neutral-400 text-sm mb-6">
                    Escaneie o QR code da máquina para registrar seu ponto
                  </p>
                  
                  {/* Área flexível para alertas */}
                  <div className="flex-1 mb-6">
                    {/* Status de verificação */}
                    {isCheckingCamera && (
                      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 mb-4">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mx-auto mb-2"></div>
                          <p className="text-blue-400 text-sm">Verificando acesso à câmera...</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Status da Câmera */}
                    {!isCheckingCamera && cameraPermission === 'denied' && (
                      <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
                        <div className="text-center">
                          <AlertTriangle className="h-6 w-6 text-red-400 mx-auto mb-2" />
                          <p className="text-red-400 text-sm font-medium mb-2">Câmera Bloqueada</p>
                          <p className="text-red-300 text-xs mb-3">
                            Para usar o scanner QR, você precisa permitir o acesso à câmera:
                          </p>
                          <div className="text-left text-xs text-red-300 mb-3 space-y-1">
                            <p><strong>Chrome/Edge:</strong></p>
                            <p>• Clique no ícone 🔒 ou 📷 na barra de endereços</p>
                            <p>• Selecione "Permitir" para câmera</p>
                            <p><strong>Firefox:</strong></p>
                            <p>• Clique no ícone do escudo na barra</p>
                            <p>• Ative as permissões da câmera</p>
                            <p><strong>Safari:</strong></p>
                            <p>• Safari → Configurações → Sites → Câmera</p>
                          </div>
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
                              Verificar Novamente
                            </Button>
                            <Button 
                              onClick={async () => {
                                console.log('🚀 [CAMERA] Forçando teste direto da câmera...')
                                setCameraPermission('prompt')
                                setCameraError(null)
                                
                                // Tentar acessar câmera diretamente
                                try {
                                  const stream = await navigator.mediaDevices.getUserMedia({ 
                                    video: { facingMode: 'environment' } 
                                  })
                                  console.log('✅ [CAMERA] Teste direto funcionou!')
                                  setCameraPermission('granted')
                                  stream.getTracks().forEach(track => track.stop())
                                } catch (error: any) {
                                  console.log('❌ [CAMERA] Teste direto falhou:', error.name)
                                  setCameraPermission('denied')
                                  setCameraError(`Erro no teste direto: ${error.message}`)
                                }
                              }} 
                              size="sm" 
                              variant="ghost"
                              className="text-blue-400 border-blue-400/50 hover:bg-blue-500/10"
                            >
                              Teste Direto
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
                <CardContent className="p-8 text-center flex flex-col h-full">
                  <div className="bg-secondary-500/20 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary-500/30 transition-colors">
                    <History className="h-10 w-10 text-secondary-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Histórico Completo
                  </h3>
                  <p className="text-neutral-400 text-sm mb-6">
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
  )
}
