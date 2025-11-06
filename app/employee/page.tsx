'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { 
  Camera, 
  QrCode, 
  History, 
  Timer, 
  MapPin, 
  Calendar,
  Play,
  Square,
  Clock,
  AlertTriangle,
  User,
  LogOut,
  Home
} from 'lucide-react'
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
  const videoRef = useRef<HTMLVideoElement>(null)

  // Verificar permissões da câmera ao carregar
  useEffect(() => {
    checkCameraPermission()
  }, [])

  const checkCameraPermission = async () => {
    try {
      setCameraError(null)
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraPermission('denied')
        setCameraError('Câmera não suportada neste dispositivo')
        return
      }

      // Verificar permissão atual
      if ('permissions' in navigator) {
        try {
          const permission = await navigator.permissions.query({ name: 'camera' as PermissionName })
          setCameraPermission(permission.state as 'granted' | 'denied' | 'prompt')
          
          console.log('🔍 [CAMERA] Estado da permissão:', permission.state)
          
          // Escutar mudanças de permissão
          permission.onchange = () => {
            const newState = permission.state as 'granted' | 'denied' | 'prompt'
            console.log('🔄 [CAMERA] Permissão mudou para:', newState)
            setCameraPermission(newState)
            if (newState === 'granted') {
              setCameraError(null)
            }
          }
        } catch (permError) {
          console.log('⚠️ [CAMERA] Permissions API não suportada, usando fallback')
          setCameraPermission('prompt')
        }
      } else {
        // Fallback para navegadores que não suportam Permissions API
        console.log('⚠️ [CAMERA] Permissions API não disponível')
        setCameraPermission('prompt')
      }
    } catch (error) {
      console.error('❌ [CAMERA] Erro ao verificar permissões:', error)
      setCameraPermission('prompt')
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
      console.log('📷 [CAMERA] Iniciando scanner...')
      setScanning(true)
      setCameraError(null)
      
      // Solicitar acesso à câmera
      console.log('📷 [CAMERA] Solicitando acesso à câmera...')
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      console.log('✅ [CAMERA] Acesso concedido!')
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraPermission('granted')
        console.log('📹 [CAMERA] Stream conectado ao vídeo')
      }
    } catch (error: any) {
      console.error('❌ [CAMERA] Erro ao acessar câmera:', error)
      setScanning(false)
      
      // Tratar diferentes tipos de erro
      if (error.name === 'NotAllowedError') {
        console.log('🚫 [CAMERA] Permissão negada pelo usuário')
        setCameraPermission('denied')
        setCameraError('Permissão da câmera negada. Clique no ícone da câmera na barra de endereços para permitir.')
      } else if (error.name === 'NotFoundError') {
        console.log('📷 [CAMERA] Nenhuma câmera encontrada')
        setCameraError('Nenhuma câmera encontrada no dispositivo.')
      } else if (error.name === 'NotSupportedError') {
        console.log('⚠️ [CAMERA] Câmera não suportada')
        setCameraError('Câmera não suportada neste navegador.')
      } else if (error.name === 'NotReadableError') {
        console.log('🔒 [CAMERA] Câmera em uso')
        setCameraError('Câmera está sendo usada por outro aplicativo.')
      } else {
        console.log('❓ [CAMERA] Erro desconhecido:', error.message)
        setCameraError(`Erro ao acessar a câmera: ${error.message}`)
      }
      
      // Verificar permissões novamente após erro
      setTimeout(() => {
        checkCameraPermission()
      }, 1000)
    }
  }

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
    }
    setScanning(false)
  }

  const handleQRScan = async (data: string) => {
    try {
      console.log('QR Code escaneado:', data)
      
      // Enviar para API de registro de ponto
      const response = await fetch('/api/attendance/qr-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ qrData: data })
      })
      
      const result = await response.json()
      
      if (response.ok) {
        // Sucesso - atualizar status
        console.log('Registro realizado:', result)
        
        setWorkStatus(prev => prev ? {
          ...prev,
          isWorking: result.record.type === 'ENTRY',
          lastRecord: {
            type: result.record.type,
            time: new Date(result.record.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            location: result.record.location || 'Terminal Principal'
          }
        } : null)
        
        // Mostrar mensagem de sucesso
        alert(result.message)
      } else {
        // Erro - mostrar mensagem
        console.error('Erro no registro:', result.error)
        alert(`Erro: ${result.error}`)
      }
      
      // Parar scanner
      stopScanning()
      
    } catch (error) {
      console.error('Erro ao processar QR:', error)
      alert('Erro de conexão. Tente novamente.')
      stopScanning()
    }
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

            {/* Scanner Modal */}
            {scanning && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-modal flex items-center justify-center p-4">
                <Card variant="glass" className="w-full max-w-md">
                  <CardHeader>
                    <CardTitle className="text-white text-center">Scanner QR Code</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 border-2 border-primary/50 rounded-lg">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-32 h-32 border-2 border-primary rounded-lg animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                    <p className="text-center text-neutral-400 text-sm">
                      Posicione o QR code dentro do quadrado
                    </p>
                    <Button onClick={stopScanning} variant="secondary" className="w-full">
                      Cancelar
                    </Button>
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
                    {/* Status da Câmera */}
                    {cameraPermission === 'denied' && (
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
                          <Button 
                            onClick={checkCameraPermission} 
                            size="sm" 
                            variant="ghost"
                            className="text-red-400 border-red-400/50 hover:bg-red-500/10"
                          >
                            Verificar Novamente
                          </Button>
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
                    disabled={cameraPermission === 'denied'}
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    {cameraPermission === 'checking' ? 'Verificando...' : 
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
