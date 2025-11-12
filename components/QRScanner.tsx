'use client'

import { useRef, useEffect, useState } from 'react'
import { Camera, X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface QRScannerProps {
  onScan: (data: string) => void
  isActive: boolean
  onActivate: () => void
}

// Declaração do BarcodeDetector para TypeScript
declare global {
  interface Window {
    BarcodeDetector?: any;
  }
}

export default function QRScanner({ onScan, isActive, onActivate }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)

  useEffect(() => {
    if (!isActive) {
      console.log('⏸️ [QR] Scanner desativado, parando câmera...')
      stopCamera()
      return
    }
    
    console.log('🎯 [QR] Scanner ativado, iniciando câmera...')
    console.log('🎯 [QR] Estados:', { 
      isLoading, 
      hasPermission, 
      error, 
      videoRef: !!videoRef.current,
      canvasRef: !!canvasRef.current 
    })
    
    // Pequeno delay para garantir que o componente está montado e renderizado
    // Isso é especialmente importante quando o componente é renderizado em um modal
    let retryTimer: NodeJS.Timeout | null = null
    const timer = setTimeout(() => {
      if (videoRef.current && canvasRef.current) {
        console.log('✅ [QR] Elementos DOM prontos, iniciando câmera...')
        startCamera()
      } else {
        console.warn('⚠️ [QR] Elementos DOM não estão prontos ainda, aguardando...')
        // Tentar novamente após mais tempo
        retryTimer = setTimeout(() => {
          if (videoRef.current && canvasRef.current) {
            console.log('✅ [QR] Elementos DOM prontos (retry), iniciando câmera...')
            startCamera()
          } else {
            console.error('❌ [QR] Elementos DOM ainda não estão prontos após retry')
            setError('Erro ao inicializar scanner. Tente novamente.')
          }
        }, 500)
      }
    }, 200) // Delay para garantir que o DOM está pronto
    
    return () => {
      clearTimeout(timer)
      if (retryTimer) {
        clearTimeout(retryTimer)
      }
      if (!isActive) {
        stopCamera()
      }
    }
  }, [isActive]) // Dependência apenas de isActive

  const startCamera = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('📱 [CAMERA] Iniciando câmera...')
      
      // Verificar se mediaDevices está disponível
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia não é suportado neste navegador')
      }
      
      // Parar stream anterior se existir
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      
      // Estratégia para câmera traseira: usar facingMode: 'environment'
      // Isso força o uso da câmera traseira em dispositivos móveis
      let stream: MediaStream | null = null
      
      // Primeiro, tentar com facingMode: 'environment' (obrigatório - câmera traseira)
      try {
        console.log('📱 [CAMERA] Tentando câmera traseira (facingMode: environment - obrigatório)...')
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Forçar câmera traseira (obrigatório)
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 }
          }
        })
        console.log('✅ [CAMERA] Câmera traseira obtida com sucesso (environment obrigatório)')
      } catch (envError: any) {
        console.warn('⚠️ [CAMERA] Erro ao acessar câmera traseira (environment obrigatório):', envError.name)
        
        // Se falhar, tentar com ideal (pode usar frontal ou traseira, mas prefere traseira)
        try {
          console.log('📱 [CAMERA] Tentando câmera traseira (facingMode: environment - ideal)...')
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: 'environment' }, // Preferir câmera traseira (ideal)
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          })
          console.log('✅ [CAMERA] Câmera obtida (environment ideal)')
        } catch (idealError: any) {
          console.warn('⚠️ [CAMERA] Erro ao acessar câmera (environment ideal):', idealError.name)
          
          // Se ainda falhar, tentar listar dispositivos e escolher manualmente
          try {
            console.log('📱 [CAMERA] Listando dispositivos para encontrar câmera traseira...')
            
            // Primeiro, precisamos de permissão para listar dispositivos com labels
            const tempStream = await navigator.mediaDevices.getUserMedia({ video: true })
            tempStream.getTracks().forEach(track => track.stop()) // Parar stream temporário
            
            // Agora listar dispositivos (labels estarão disponíveis após getUserMedia)
            const devices = await navigator.mediaDevices.enumerateDevices()
            const videoDevices = devices.filter(d => d.kind === 'videoinput')
            console.log('📹 [CAMERA] Dispositivos de vídeo encontrados:', videoDevices.length)
            
            // Encontrar câmera traseira (geralmente tem label contendo "back", "rear", "environment", etc)
            const backCamera = videoDevices.find(device => {
              const label = device.label.toLowerCase()
              return label.includes('back') || 
                     label.includes('rear') || 
                     label.includes('environment') ||
                     label.includes('traseira') ||
                     label.includes('posterior') ||
                     label.includes('camera 1') || // Alguns dispositivos numeram as câmeras
                     (videoDevices.length > 1 && device.deviceId === videoDevices[1].deviceId) // Segunda câmera geralmente é traseira
            })
            
            if (backCamera && backCamera.deviceId) {
              console.log('📱 [CAMERA] Câmera traseira encontrada:', backCamera.label)
              stream = await navigator.mediaDevices.getUserMedia({
                video: {
                  deviceId: { exact: backCamera.deviceId },
                  width: { ideal: 1280 },
                  height: { ideal: 720 }
                }
              })
              console.log('✅ [CAMERA] Câmera traseira obtida por deviceId')
            } else {
              // Se não encontrou, tentar qualquer câmera (última tentativa)
              console.warn('⚠️ [CAMERA] Câmera traseira não encontrada, usando qualquer câmera disponível...')
              stream = await navigator.mediaDevices.getUserMedia({
                video: {
                  facingMode: 'environment' // Tentar novamente
                }
              })
              console.log('✅ [CAMERA] Câmera obtida (fallback)')
            }
          } catch (deviceError: any) {
            console.error('❌ [CAMERA] Erro ao listar dispositivos:', deviceError)
            // Última tentativa: qualquer câmera disponível
            try {
              stream = await navigator.mediaDevices.getUserMedia({ 
                video: true // Sem restrições - última tentativa
              })
              console.log('✅ [CAMERA] Câmera obtida (última tentativa - qualquer câmera)')
            } catch (lastError: any) {
              console.error('❌ [CAMERA] Todas as tentativas falharam:', lastError)
              throw lastError
            }
          }
        }
      }
      
      if (!stream) {
        throw new Error('Não foi possível obter stream de vídeo após todas as tentativas')
      }
      
      console.log('✅ [CAMERA] Stream obtido:', {
        tracks: stream.getTracks().length,
        videoTracks: stream.getVideoTracks().length,
        settings: stream.getVideoTracks()[0]?.getSettings()
      })
      
      streamRef.current = stream
      
      // Verificar qual câmera está sendo usada
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        const settings = videoTrack.getSettings()
        console.log('📹 [CAMERA] Configurações da câmera:', {
          facingMode: settings.facingMode,
          width: settings.width,
          height: settings.height,
          deviceId: settings.deviceId
        })
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        // Aguardar vídeo estar pronto para reprodução
        await new Promise<void>((resolve, reject) => {
          const video = videoRef.current!
          
          const onLoaded = () => {
            console.log('📹 [CAMERA] Vídeo carregado, estado:', video.readyState)
            if (video.readyState >= 2) { // HAVE_CURRENT_DATA ou superior
              resolve()
            }
          }
          
          const onError = () => {
            console.error('❌ [CAMERA] Erro ao carregar vídeo')
            reject(new Error('Erro ao carregar vídeo'))
          }
          
          video.addEventListener('loadeddata', onLoaded, { once: true })
          video.addEventListener('loadedmetadata', onLoaded, { once: true })
          video.addEventListener('canplay', onLoaded, { once: true })
          video.addEventListener('error', onError, { once: true })
          
          // Tentar reproduzir o vídeo explicitamente
          const playPromise = video.play()
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('▶️ [CAMERA] Vídeo iniciado com sucesso')
                // Verificar se o vídeo realmente está reproduzindo
                if (video.paused) {
                  console.warn('⚠️ [CAMERA] Vídeo pausado após play(), tentando novamente...')
                  video.play().catch(err => {
                    console.error('❌ [CAMERA] Erro ao reproduzir vídeo novamente:', err)
                  })
                }
                
                // Aguardar um pouco para garantir que o vídeo está renderizando
                setTimeout(() => {
                  if (video.readyState >= 2) {
                    console.log('✅ [CAMERA] Vídeo pronto para uso')
                    resolve()
                  } else {
                    console.warn('⚠️ [CAMERA] Vídeo não está pronto, mas continuando...')
                    resolve() // Continuar mesmo assim
                  }
                }, 300)
              })
              .catch(err => {
                console.error('❌ [CAMERA] Erro ao reproduzir vídeo:', err)
                // Tentar continuar mesmo com erro
                setTimeout(() => {
                  if (video.readyState >= 2) {
                    console.log('✅ [CAMERA] Vídeo pronto apesar do erro de play')
                    resolve()
                  } else {
                    console.warn('⚠️ [CAMERA] Continuando mesmo sem vídeo pronto')
                    resolve() // Continuar mesmo com erro
                  }
                }, 500)
              })
          } else {
            // Fallback para navegadores antigos
            console.log('⚠️ [CAMERA] play() não retorna Promise, usando fallback')
            setTimeout(() => {
              resolve()
            }, 500)
          }
          
          // Timeout de segurança (mais curto)
          setTimeout(() => {
            if (video.readyState >= 2) {
              console.log('✅ [CAMERA] Vídeo pronto (timeout)')
              resolve()
            } else {
              console.warn('⚠️ [CAMERA] Timeout aguardando vídeo, mas continuando...')
              resolve() // Continuar mesmo com timeout
            }
          }, 2000)
        })
        
        console.log('✅ [CAMERA] Vídeo configurado, iniciando scanner...')
        setHasPermission(true)
        setIsLoading(false)
        
        // Iniciar scanner após vídeo estar pronto (dar tempo para renderizar)
        setTimeout(() => {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            console.log('🔍 [CAMERA] Iniciando scanner de QR code...')
            startScanning()
          } else {
            console.warn('⚠️ [CAMERA] Vídeo ainda não está pronto, mas iniciando scanner...')
            startScanning()
          }
        }, 500)
      }
      
    } catch (err: any) {
      console.error('❌ [CAMERA] Erro ao acessar câmera:', err)
      console.error('❌ [CAMERA] Detalhes do erro:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      })
      setIsLoading(false)
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Permissão da câmera negada. Por favor, permita o acesso à câmera nas configurações do navegador e tente novamente.')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('Nenhuma câmera encontrada neste dispositivo.')
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('Câmera está sendo usada por outro aplicativo. Feche outros apps que usam a câmera e tente novamente.')
      } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
        // Tentar com configuração mais simples como fallback
        try {
          console.log('🔄 [CAMERA] Tentando com configuração mais simples...')
          const simpleStream = await navigator.mediaDevices.getUserMedia({ 
            video: {
              facingMode: 'environment'
            }
          })
          streamRef.current = simpleStream
          if (videoRef.current) {
            videoRef.current.srcObject = simpleStream
            await videoRef.current.play()
            setHasPermission(true)
            setIsLoading(false)
            setTimeout(() => startScanning(), 100)
            return
          }
        } catch (simpleErr: any) {
          console.error('❌ [CAMERA] Erro mesmo com configuração simples:', simpleErr)
          setError('Não foi possível acessar a câmera. Verifique se a câmera está disponível e as permissões estão concedidas.')
        }
      } else if (err.message?.includes('getUserMedia')) {
        setError('Navegador não suporta acesso à câmera. Use um navegador moderno (Chrome, Firefox, Safari).')
      } else {
        setError(`Erro ao acessar câmera: ${err.message || 'Erro desconhecido'}`)
      }
    }
  }

  const stopCamera = () => {
    console.log('🛑 [CAMERA] Parando câmera...')
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop()
      })
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    setHasPermission(false)
    setIsLoading(false)
    setError(null)
  }

  const startScanning = async () => {
    if (!videoRef.current || !canvasRef.current) {
      console.log('⏸️ [QR] Scanner não iniciado - elementos não disponíveis')
      console.log('⏸️ [QR] videoRef:', !!videoRef.current, 'canvasRef:', !!canvasRef.current)
      return
    }
    
    console.log('🔍 [QR] Iniciando detecção de QR code...')
    
    const canvas = canvasRef.current
    const context = canvas.getContext('2d', { willReadFrequently: true })
    const video = videoRef.current

    if (!context) {
      console.error('❌ [QR] Contexto 2D não disponível')
      setError('Não foi possível inicializar o contexto de vídeo')
      return
    }

    // Verificar se o vídeo tem stream
    if (!video.srcObject) {
      console.error('❌ [QR] Vídeo não tem stream')
      setError('Câmera não está ativa. Tente novamente.')
      return
    }

    // Aguardar vídeo estar pronto com timeout
    const waitForVideo = () => {
      return new Promise<void>((resolve, reject) => {
        let attempts = 0
        const maxAttempts = 50 // 5 segundos (50 * 100ms)
        
        const checkReady = () => {
          attempts++
          
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            console.log(`🎯 [QR] Canvas configurado: ${canvas.width}x${canvas.height}`)
            console.log(`🎯 [QR] Vídeo pronto: ${video.readyState} (HAVE_ENOUGH_DATA=${video.HAVE_ENOUGH_DATA})`)
            resolve()
          } else if (attempts >= maxAttempts) {
            console.warn('⚠️ [QR] Timeout aguardando vídeo estar pronto')
            // Tentar continuar mesmo assim
            if (video.readyState >= 1) {
              canvas.width = 640
              canvas.height = 480
              console.log('⚠️ [QR] Usando dimensões padrão do canvas')
              resolve()
            } else {
              reject(new Error('Vídeo não está pronto após timeout'))
            }
          } else {
            setTimeout(checkReady, 100)
          }
        }
        
        // Iniciar verificação imediatamente
        checkReady()
      })
    }

    try {
      await waitForVideo()
      console.log('✅ [QR] Vídeo pronto, iniciando detecção...')
    } catch (error) {
      console.error('❌ [QR] Erro ao aguardar vídeo:', error)
      setError('Erro ao inicializar câmera. Tente novamente.')
      return
    }

    // Tentar BarcodeDetector primeiro (mais eficiente)
    if (window.BarcodeDetector) {
      console.log('🔍 [QR] Usando BarcodeDetector nativo')
      
      const barcodeDetector = new window.BarcodeDetector({
        formats: ['qr_code']
      })

      scanIntervalRef.current = setInterval(async () => {
        if (!isActive || video.readyState !== video.HAVE_ENOUGH_DATA) return

        try {
          const barcodes = await barcodeDetector.detect(video)
          if (barcodes.length > 0) {
            const qrData = barcodes[0].rawValue
            console.log('✅ [QR] Código detectado:', qrData)
            onScan(qrData)
            stopCamera()
          }
        } catch (err) {
          // Ignorar erros de detecção
        }
      }, 500)

    } else {
      // Fallback para jsQR
      console.log('🔍 [QR] Usando jsQR (fallback)')
      
      try {
        // Importação dinâmica da biblioteca
        const jsQRLibrary = await import('jsqr')
        const jsQR = jsQRLibrary.default
        
        scanIntervalRef.current = setInterval(() => {
          if (!isActive || video.readyState !== video.HAVE_ENOUGH_DATA) return

          try {
            context.drawImage(video, 0, 0, canvas.width, canvas.height)
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            })
            
            if (code) {
              console.log('✅ [QR] Código detectado via jsQR:', code.data)
              onScan(code.data)
              stopCamera()
            }
          } catch (err) {
            // Ignorar erros de detecção
          }
        }, 300)
      } catch (importError) {
        console.error('❌ [QR] Erro ao carregar jsQR:', importError)
        setError('Biblioteca de QR code não disponível.')
      }
    }
  }

  // Se não está ativo, mostrar botão para ativar
  if (!isActive) {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Camera className="h-10 w-10 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Scanner QR Code</h3>
        <p className="text-gray-600 mb-6">Clique no botão abaixo para ativar a câmera</p>
        <Button
          onClick={onActivate}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8 py-3 text-lg font-semibold shadow-lg"
        >
          <Camera className="h-5 w-5 mr-2" />
          Ativar Scanner
        </Button>
      </div>
    )
  }

  // Scanner ativo - mostrar interface da câmera
  return (
    <div className="relative bg-black rounded-lg overflow-hidden w-full" style={{ minHeight: '400px' }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-center p-8 z-10">
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-white text-base font-medium">Iniciando câmera...</p>
            <p className="text-gray-400 text-sm mt-2">Aguarde um momento</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-center p-8 z-10 bg-black/95">
          <div>
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-base font-medium mb-2">Erro ao acessar câmera</p>
            <p className="text-red-300 text-sm mb-6 px-4">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={startCamera} size="sm" className="bg-green-500 hover:bg-green-600">
                <Camera className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
              <Button onClick={stopCamera} variant="secondary" size="sm">
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {hasPermission && !error && !isLoading && (
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            className="w-full h-full bg-gray-900"
            playsInline
            muted
            autoPlay
            style={{ 
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              minHeight: '400px'
            }}
          />
          
          {/* Overlay de scanning */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="border-2 border-green-500 rounded-lg w-64 h-64 sm:w-72 sm:h-72 relative shadow-lg">
              {/* Cantos do quadrado */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500 rounded-br-lg"></div>
              
              {/* Linha de scanning animada */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-green-500 opacity-50">
                <div className="absolute -top-1 left-1/2 w-6 h-3 bg-green-500 rounded-full transform -translate-x-1/2 animate-pulse"></div>
              </div>
            </div>
          </div>
          
          {/* Sobreposição escura ao redor do quadrado */}
          <div className="absolute inset-0 pointer-events-none">
            <div 
              className="absolute inset-0 bg-black/50"
              style={{
                clipPath: 'polygon(0% 0%, 0% 100%, calc(50% - 128px) 100%, calc(50% - 128px) calc(50% - 128px), calc(50% + 128px) calc(50% - 128px), calc(50% + 128px) calc(50% + 128px), calc(50% - 128px) calc(50% + 128px), calc(50% - 128px) 100%, 100% 100%, 100% 0%)'
              }}
            />
          </div>
          
          {/* Botão de fechar */}
          <div className="absolute top-4 right-4 z-20">
            <Button
              onClick={stopCamera}
              variant="ghost"
              size="sm"
              className="bg-black/70 border border-white/30 text-white hover:bg-black/90 backdrop-blur-sm"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <canvas
            ref={canvasRef}
            className="hidden"
          />
        </div>
      )}
      
      {/* Status - só mostrar se não houver erro nem loading */}
      {hasPermission && !error && !isLoading && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm border border-green-500/30">
            ✅ Scanner ativo - Aponte para o QR code
          </div>
        </div>
      )}
    </div>
  )
}

// Exportar também como named export para compatibilidade
export { QRScanner }
