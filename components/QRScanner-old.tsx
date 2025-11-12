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
    if (isActive) {
      startCamera()
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [isActive])

  const startCamera = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setScanningActive(false)
      
      console.log('📱 [CAMERA] Iniciando câmera...')
      
      // Primeiro tentar câmera traseira, depois qualquer câmera
      let constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' }, // 'ideal' em vez de 'exact' para mais compatibilidade
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      }
      
      console.log('📱 [CAMERA] Solicitando permissão...')
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      console.log('✅ [CAMERA] Stream obtido')
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        // Usar event listeners mais confiáveis
        const onLoaded = () => {
          console.log('📹 [CAMERA] Vídeo carregado:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight)
          setHasPermission(true)
          setIsLoading(false)
          setScanningActive(true)
          startScanning()
        }

        const onError = (e: any) => {
          console.error('❌ [CAMERA] Erro no vídeo:', e)
          setError('Erro ao iniciar a câmera')
          setIsLoading(false)
        }

        videoRef.current.addEventListener('loadeddata', onLoaded, { once: true })
        videoRef.current.addEventListener('error', onError, { once: true })
        
        // Fallback timeout
        setTimeout(() => {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            onLoaded()
          }
        }, 3000)
        
      }
      
    } catch (err: any) {
      console.error('❌ [CAMERA] Erro ao acessar câmera:', err)
      setIsLoading(false)
      
      if (err.name === 'NotAllowedError') {
        setError('Permissão da câmera negada. Toque no ícone da câmera na barra de endereços e permita o acesso.')
      } else if (err.name === 'NotFoundError') {
        setError('Nenhuma câmera encontrada neste dispositivo.')
      } else if (err.name === 'NotReadableError') {
        setError('Câmera está sendo usada por outro aplicativo.')
      } else if (err.name === 'OverconstrainedError') {
        // Tentar com configuração mais simples
        console.log('⚠️ [CAMERA] Tentando câmera frontal...')
        try {
          const simpleStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user' } 
          })
          streamRef.current = simpleStream
          if (videoRef.current) {
            videoRef.current.srcObject = simpleStream
            setHasPermission(true)
            setIsLoading(false)
            setScanningActive(true)
            startScanning()
          }
        } catch (simpleErr) {
          setError('Nenhuma câmera compatível encontrada.')
        }
      } else {
        setError(`Erro ao acessar câmera: ${err.message}`)
      }
    }
  }

  const stopCamera = () => {
    console.log('🛑 [CAMERA] Parando câmera...')
    setScanningActive(false)
    
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
  }

  const startScanning = async () => {
    if (!videoRef.current || !canvasRef.current || !scanningActive) {
      console.log('⏸️ [QR] Scanner não iniciado - condições não atendidas')
      return
    }
    
    console.log('🔍 [QR] Iniciando detecção...')
    
    const canvas = canvasRef.current
    const context = canvas.getContext('2d', { willReadFrequently: true })
    const video = videoRef.current

    if (!context) {
      console.error('❌ [QR] Contexto 2D não disponível')
      return
    }

    // Aguardar vídeo estar pronto
    const waitForVideo = () => {
      return new Promise<void>((resolve) => {
        const checkReady = () => {
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            console.log(`🎯 [QR] Canvas configurado: ${canvas.width}x${canvas.height}`)
            resolve()
          } else {
            setTimeout(checkReady, 100)
          }
        }
        checkReady()
      })
    }

    await waitForVideo()

    // Tentar BarcodeDetector primeiro (mais eficiente)
    if (window.BarcodeDetector) {
      console.log('🔍 [QR] Usando BarcodeDetector nativo')
      
      const barcodeDetector = new window.BarcodeDetector({
        formats: ['qr_code']
      })

      scanIntervalRef.current = setInterval(async () => {
        if (!scanningActive || video.readyState !== video.HAVE_ENOUGH_DATA) return

        try {
          const barcodes = await barcodeDetector.detect(video)
          if (barcodes.length > 0) {
            const qrData = barcodes[0].rawValue
            console.log('✅ [QR] Código detectado:', qrData)
            onScan(qrData)
            stopCamera()
            onClose()
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
          if (!scanningActive || video.readyState !== video.HAVE_ENOUGH_DATA) return

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
              onClose()
            }
          } catch (err) {
            // Ignorar erros de detecção
          }
        }, 300)
      } catch (importError) {
        console.error('❌ [QR] Erro ao carregar jsQR:', importError)
        setError('Biblioteca de QR code não disponível. Instale: npm install jsqr')
      }
    }
  }

  const requestPermission = async () => {
    try {
      setError(null)
      await startCamera()
    } catch (err) {
      console.error('Erro ao solicitar permissão:', err)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Scanner QR</h3>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Camera Area */}
        <div className="relative bg-black rounded-lg overflow-hidden mb-4 min-h-[300px] flex items-center justify-center">
          {isLoading && (
            <div className="text-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-white text-sm">Iniciando câmera...</p>
            </div>
          )}
          
          {error && (
            <div className="text-center p-8">
              <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-400 text-sm mb-4">{error}</p>
              <Button onClick={requestPermission} size="sm">
                <Camera className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          )}
          
          {hasPermission && !error && !isLoading && (
            <div className="relative w-full">
              <video
                ref={videoRef}
                className="w-full h-auto bg-gray-900"
                playsInline
                muted
                autoPlay
                style={{ 
                  minHeight: '300px',
                  maxHeight: '400px',
                  objectFit: 'cover'
                }}
              />
              
              {/* Overlay de scanning */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-2 border-primary rounded-lg w-48 h-48 relative">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                  
                  {/* Linha de scanning animada */}
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary animate-pulse">
                    <div className="absolute -top-1 left-1/2 w-4 h-2 bg-primary rounded-full transform -translate-x-1/2"></div>
                  </div>
                </div>
              </div>
              
              <canvas
                ref={canvasRef}
                className="hidden"
              />
            </div>
          )}
          
        </div>

        {/* Status */}
        <div className="text-center mb-4">
          {scanningActive ? (
            <p className="text-green-400 text-sm">
              ✅ Scanner ativo - Aponte para o QR code
            </p>
          ) : (
            <p className="text-yellow-400 text-sm">
              ⚠️ Preparando scanner...
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className="text-center">
          <p className="text-slate-400 text-sm">
            Aponte a câmera para o código QR da máquina de ponto
          </p>
        </div>
      </div>
    </div>
  )
}
