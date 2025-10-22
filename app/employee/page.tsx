'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { 
  Clock, 
  QrCode, 
  Calendar, 
  User,
  LogOut,
  Camera,
  History,
  Home,
  Play,
  Square,
  MapPin,
  Timer
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
  const videoRef = useRef<HTMLVideoElement>(null)

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
      
      // Simular dados por enquanto - depois conectar com APIs reais
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setWorkStatus({
        isWorking: true,
        lastRecord: {
          type: 'ENTRY',
          time: '08:00',
          location: 'Recepção Principal'
        },
        todayHours: '4h 32min'
      })

      setRecentRecords([
        {
          id: '1',
          date: 'Hoje',
          entry: '08:00',
          hours: '4h 32min',
          status: 'Em andamento',
          location: 'Recepção Principal'
        },
        {
          id: '2',
          date: 'Ontem',
          entry: '08:15',
          exit: '17:30',
          hours: '8h 15min',
          status: 'Completo',
          location: 'Recepção Principal'
        },
        {
          id: '3',
          date: '20/10',
          entry: '08:00',
          exit: '17:00',
          hours: '8h 00min',
          status: 'Completo',
          location: 'Lab TI'
        }
      ])
    } catch (error) {
      console.error('Erro ao carregar dados do funcionário:', error)
    } finally {
      setLoading(false)
    }
  }

  const startScanning = async () => {
    try {
      setScanning(true)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error)
      alert('Não foi possível acessar a câmera. Verifique as permissões.')
      setScanning(false)
    }
  }

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
    }
    setScanning(false)
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
              <Button variant="ghost" size="sm" onClick={() => router.push('/api/auth/signout')}>
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
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* QR Code Scanner */}
              <Card variant="glass" className="group hover:scale-105 transition-all duration-200">
                <CardContent className="p-8 text-center">
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
                  <Button onClick={startScanning} className="w-full">
                    <Camera className="h-5 w-5 mr-2" />
                    Abrir Scanner
                  </Button>
                </CardContent>
              </Card>

              {/* History */}
              <Card variant="glass" className="group hover:scale-105 transition-all duration-200">
                <CardContent className="p-8 text-center">
                  <div className="bg-secondary-500/20 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary-500/30 transition-colors">
                    <History className="h-10 w-10 text-secondary-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Histórico Completo
                  </h3>
                  <p className="text-neutral-400 text-sm mb-6">
                    Visualize seu histórico de registros e relatórios mensais
                  </p>
                  <Button variant="secondary" className="w-full">
                    Ver Histórico
                  </Button>
                </CardContent>
              </Card>
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
                  {recentRecords.map((record) => (
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
                  ))}
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
