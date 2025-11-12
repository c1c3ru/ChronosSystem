'use client'

import { useRef, useEffect, useState } from 'react'
import { Camera, X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface QRScannerProps {
  onScan: (data: string) => void
  onClose: () => void
  isOpen: boolean
}

export default function QRScanner({ onScan, onClose, isOpen }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)

  useEffect(() => {
    if (isOpen) {
      startCamera()
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [isOpen])

  const startCamera = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('📱 [CAMERA] Iniciando câmera nativa...')
      
      // Configuração mais simples primeiro
      let constraints: MediaStreamConstraints = { video: true }
      
      // Tentar câmera traseira se disponível
      try {
        constraints = {
          video: {
            facingMode: { exact: 'environment' }
          }
        }
      } catch {
        // Fallback para qualquer câmera
        constraints = { video: true }
      }
      
      console.log('📱 [CAMERA] Solicitando permissão com constraints:', constraints)
      
      // Solicitar acesso à câmera
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      console.log('✅ [CAMERA] Stream obtido:', stream.getTracks().length, 'tracks')
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        // AJUSTE: Anexar listener ANTES do play()
        videoRef.current.onloadedmetadata = () => {
          console.log('📹 [CAMERA] Vídeo carregado:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight)
          setHasPermission(true)
          setIsLoading(false)
          startScanning()
        }
        
        // Fallback se onloadedmetadata não disparar
        setTimeout(() => {
          if (videoRef.current && videoRef.current.videoWidth > 0 && !hasPermission) {
            console.log('📹 [CAMERA] Vídeo pronto (fallback)')
            setHasPermission(true)
            setIsLoading(false)
            startScanning()
          }
        }, 2000)
        
        // Aguardar um pouco antes de tentar reproduzir
        await new Promise(resolve => setTimeout(resolve, 100))
        
        try {
          await videoRef.current.play()
          console.log('▶️ [CAMERA] Vídeo iniciado')
          
        } catch (playError) {
          console.error('❌ [CAMERA] Erro ao reproduzir vídeo:', playError)
          setError('Erro ao iniciar reprodução do vídeo da câmera')
          stopCamera() // Limpar câmera em caso de erro
        }
      }
      
    } catch (err: any) {
      console.error('❌ [CAMERA] Erro ao acessar câmera:', err)
      setIsLoading(false)
      
      if (err.name === 'NotAllowedError') {
        setError('Permissão da câmera negada. Toque no ícone da câmera na barra de endereços e permita o acesso.')
      } else if (err.name === 'NotFoundError') {
        setError('Nenhuma câmera encontrada neste dispositivo.')
      } else if (err.name === 'NotReadableError') {
        setError('Câmera está sendo usada por outro aplicativo. Feche outros apps que usam câmera.')
      } else if (err.name === 'OverconstrainedError') {
        // Tentar novamente com configuração mais simples
        console.log('⚠️ [CAMERA] Câmera traseira não disponível, tentando qualquer câmera...')
        try {
          const simpleStream = await navigator.mediaDevices.getUserMedia({ video: true })
          streamRef.current = simpleStream
          if (videoRef.current) {
            videoRef.current.srcObject = simpleStream
            await videoRef.current.play()
            setHasPermission(true)
            setIsLoading(false)
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
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop()
        console.log('🛑 [CAMERA] Track parado:', track.kind)
      })
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    setHasPermission(false)
  }

  const startScanning = () => {
    if (!videoRef.current || !canvasRef.current) return
    
    console.log('🔍 [QR] Iniciando detecção de QR codes...')
    
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    const video = videoRef.current
    
    // Configurar canvas com o tamanho do vídeo
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Helper para jsQR
    const scanWithJsQR = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA && context) {
        // Ajustar tamanho do canvas para o vídeo
        if (canvas.width !== video.videoWidth) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
        }
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        
        return import('jsqr').then((jsQRModule: any) => {
          const jsQR = jsQRModule.default || jsQRModule
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          })
          return code ? code.data : null
        }).catch(() => null)
      }
      return Promise.resolve(null)
    }

    // Tentar usar BarcodeDetector se disponível (mais eficiente)
    if ('BarcodeDetector' in window) {
      console.log('🚀 [QR] Usando API BarcodeDetector (nativo)')
      const barcodeDetector = new (window as any).BarcodeDetector({
        formats: ['qr_code']
      })
      
      scanIntervalRef.current = setInterval(async () => {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          try {
            const barcodes = await barcodeDetector.detect(video)
            if (barcodes.length > 0) {
              console.log('✅ [QR] Código detectado via BarcodeDetector:', barcodes[0].rawValue)
              onScan(barcodes[0].rawValue)
              stopCamera()
              onClose()
              return
            }
          } catch (err) {
            // BarcodeDetector pode falhar, tentar jsQR como fallback
            console.warn('⚠️ [QR] BarcodeDetector falhou, tentando jsQR...', err)
            const qrData = await scanWithJsQR()
            if (qrData) {
              console.log('✅ [QR] Código detectado via jsQR (fallback):', qrData)
              onScan(qrData)
              stopCamera()
              onClose()
            }
          }
        }
      }, 200) // Verificar a cada 200ms
      
    } else {
      // Fallback: usar jsQR library
      console.log('🐌 [QR] Usando fallback jsQR (biblioteca)')
      scanIntervalRef.current = setInterval(async () => {
        const qrData = await scanWithJsQR()
        if (qrData) {
          console.log('✅ [QR] Código detectado via jsQR:', qrData)
          onScan(qrData)
          stopCamera()
          onClose()
        }
      }, 300) // Verificar a cada 300ms (jsQR é mais pesado)
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
        <div className="relative bg-black rounded-lg overflow-hidden mb-4">
          {isLoading && (
            <div className="aspect-square flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-white text-sm">Iniciando câmera...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="aspect-square flex items-center justify-center p-4">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                <p className="text-red-400 text-sm mb-4">{error}</p>
                <Button onClick={requestPermission} size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
              </div>
            </div>
          )}
          
          {hasPermission && !error && !isLoading && (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-auto min-h-[300px] bg-gray-900"
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
                <div className="border-2 border-primary rounded-lg w-48 h-48 relative animate-pulse">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                </div>
              </div>
              
              <canvas
                ref={canvasRef}
                className="hidden"
              />
            </div>
          )}
          
          {/* Debug info */}
          {hasPermission && !error && !isLoading && (
            <div className="text-center mt-2">
              <p className="text-green-400 text-xs">
                📹 Câmera ativa - Procurando QR code...
              </p>
            </div>
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
