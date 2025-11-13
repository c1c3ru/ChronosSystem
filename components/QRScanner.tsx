'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Camera, X, AlertTriangle, Shield, FileText, Edit3, CheckCircle, AlertCircle } from 'lucide-react'
import { validateQRFormat, validateQRSecurity, getQRFeedback, type QRValidationResult } from '@/lib/qr-validation'

// Declaração global para BarcodeDetector
declare global {
  interface Window {
    BarcodeDetector?: any
  }
}

interface QRScannerProps {
  onScan: (data: string) => void
  isActive: boolean
  onActivate: () => void
}

export default function QRScanner({ onScan, isActive, onActivate }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)
  const [qrValidation, setQrValidation] = useState<QRValidationResult | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

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
    
    // Função para verificar se elementos estão prontos e iniciar câmera
    const tryStartCamera = (attempt = 1, maxAttempts = 5) => {
      console.log(`🔄 [QR] Tentativa ${attempt}/${maxAttempts} - Verificando elementos DOM...`)
      
      if (videoRef.current && canvasRef.current) {
        console.log('✅ [QR] Elementos DOM prontos, iniciando câmera...')
        startCamera().catch((error) => {
          console.error('❌ [QR] Erro ao iniciar câmera:', error)
          setError(error.message || 'Erro ao iniciar câmera')
        })
      } else {
        console.warn(`⚠️ [QR] Elementos DOM não estão prontos (tentativa ${attempt}):`, {
          videoRef: !!videoRef.current,
          canvasRef: !!canvasRef.current
        })
        
        if (attempt < maxAttempts) {
          // Tentar novamente com delay progressivo
          const delay = attempt * 200 // 200ms, 400ms, 600ms, etc.
          setTimeout(() => tryStartCamera(attempt + 1, maxAttempts), delay)
        } else {
          console.error('❌ [QR] Elementos DOM não ficaram prontos após todas as tentativas')
          setError('Erro ao inicializar scanner. Os elementos da interface não estão prontos. Tente recarregar a página.')
        }
      }
    }
    
    // Iniciar após pequeno delay para garantir renderização
    const timer = setTimeout(() => tryStartCamera(), 100)
    
    return () => {
      clearTimeout(timer)
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
      if (!isActive) {
        stopCamera()
      }
    }
  }, [isActive]) // Dependência apenas de isActive

  const requestPermission = async () => {
    try {
      console.log('🔄 [QR] Tentando novamente...')
      setError(null)
      setIsLoading(true)
      setRetryCount(prev => prev + 1)
      
      // Parar qualquer stream anterior
      stopCamera()
      
      // Aguardar um pouco antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 500))
      
      await startCamera()
    } catch (err: any) {
      console.error('❌ [QR] Erro ao tentar novamente:', err)
      setError(err.message || 'Erro ao tentar novamente')
      setIsLoading(false)
      
      // Retry automático para falhas temporárias
      if (retryCount < 3 && isTemporaryError(err)) {
        scheduleAutoRetry()
      }
    }
  }

  // Verificar se é um erro temporário que pode ser resolvido com retry
  const isTemporaryError = (error: any): boolean => {
    const temporaryErrors = [
      'NotReadableError',
      'TrackStartError',
      'AbortError',
      'Elemento de vídeo não está disponível'
    ]
    
    return temporaryErrors.some(errType => 
      error.name === errType || error.message?.includes(errType)
    )
  }

  // Agendar retry automático
  const scheduleAutoRetry = () => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
    }
    
    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000) // Exponential backoff, max 10s
    console.log(`🔄 [QR] Agendando retry automático em ${delay}ms (tentativa ${retryCount + 1})`)
    
    setIsRetrying(true)
    retryTimeoutRef.current = setTimeout(() => {
      setIsRetrying(false)
      requestPermission()
    }, delay)
  }

  // Validar QR code detectado
  const validateAndProcessQR = (qrData: string) => {
    console.log('🔍 [QR] Validando QR code detectado:', qrData.substring(0, 50) + '...')
    
    // Validação de formato
    const validation = validateQRFormat(qrData)
    setQrValidation(validation)
    
    // Validação de segurança
    const security = validateQRSecurity(qrData)
    
    console.log('📋 [QR] Resultado da validação:', {
      isValid: validation.isValid,
      type: validation.type,
      confidence: validation.confidence,
      machineId: validation.machineId,
      warnings: validation.warnings,
      securityRisks: security.risks
    })
    
    // Se há riscos de segurança, avisar mas não bloquear
    if (!security.isSafe) {
      console.warn('⚠️ [QR] Riscos de segurança detectados:', security.risks)
    }
    
    // Se validação passou, processar QR
    if (validation.isValid) {
      console.log('✅ [QR] QR code válido, processando...')
      onScan(qrData)
      stopCamera()
    } else {
      console.error('❌ [QR] QR code inválido:', validation.error)
      setError(validation.error || 'QR code inválido')
      
      // Continuar scanning para tentar outro QR
      setTimeout(() => {
        setError(null)
        setQrValidation(null)
      }, 3000)
    }
  }

  const startCamera = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('📱 [CAMERA] Iniciando câmera...')
      
      // VERIFICAÇÃO CRÍTICA: Elementos DOM devem estar disponíveis
      if (!videoRef.current) {
        console.error('❌ [CAMERA] Elemento de vídeo não está disponível')
        throw new Error('Elemento de vídeo não está disponível')
      }
      
      if (!canvasRef.current) {
        console.error('❌ [CAMERA] Elemento canvas não está disponível')
        throw new Error('Elemento canvas não está disponível')
      }
      
      console.log('✅ [CAMERA] Elementos DOM verificados e disponíveis')
      
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
      
      if (!videoRef.current) {
        throw new Error('Elemento de vídeo não está disponível')
      }
      
      const video = videoRef.current
      
      // Atribuir stream ao vídeo
      video.srcObject = stream
      
      // Configurar atributos do vídeo
      video.playsInline = true
      video.muted = true
      video.autoplay = true
      
      console.log('📹 [CAMERA] Stream atribuído ao vídeo, aguardando estar pronto...')
      
      // Configurar vídeo imediatamente - não aguardar eventos
      console.log('📹 [CAMERA] Configurando vídeo...')
      
      // Tentar reproduzir o vídeo (sem bloquear)
      video.play().then(() => {
        console.log('▶️ [CAMERA] Vídeo iniciado com sucesso')
      }).catch((playError: any) => {
        console.warn('⚠️ [CAMERA] Erro ao reproduzir vídeo:', playError.message)
        // Continuar mesmo com erro - o vídeo pode começar automaticamente
      })
      
      // IMPORTANTE: Sempre definir estados imediatamente após obter o stream
      // Não aguardar eventos do vídeo - isso pode travar o código
      console.log('✅ [CAMERA] Stream configurado, mostrando vídeo...')
      setHasPermission(true)
      setIsLoading(false)
      
      // Aguardar um pouco para o vídeo renderizar, mas não bloquear
      // Iniciar scanner em background mesmo se o vídeo não estiver totalmente pronto
      setTimeout(() => {
        if (!videoRef.current || !videoRef.current.srcObject) {
          console.error('❌ [CAMERA] Vídeo não está mais disponível')
          setError('Erro ao inicializar scanner. Tente novamente.')
          return
        }
        
        const currentVideo = videoRef.current
        
        // Verificar estado do vídeo
        console.log('📹 [CAMERA] Estado do vídeo:', {
          readyState: currentVideo.readyState,
          paused: currentVideo.paused,
          videoWidth: currentVideo.videoWidth,
          videoHeight: currentVideo.videoHeight,
          srcObject: !!currentVideo.srcObject
        })
        
        // Tentar reproduzir novamente se estiver pausado
        if (currentVideo.paused) {
          console.log('🔄 [CAMERA] Vídeo pausado, tentando reproduzir...')
          currentVideo.play().catch((err: any) => {
            console.warn('⚠️ [CAMERA] Não foi possível reproduzir vídeo:', err.message)
          })
        }
        
        // Iniciar scanner mesmo se o vídeo não estiver totalmente pronto
        // O vídeo continuará carregando em background
        console.log('🔍 [CAMERA] Iniciando scanner de QR code...')
        startScanning()
      }, 500)
      
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
    
    try {
      // Parar intervalo de scanning
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current)
        scanIntervalRef.current = null
      }
      
      // Parar stream da câmera
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          try {
            track.stop()
            console.log('🛑 [CAMERA] Track parado:', track.kind)
          } catch (err) {
            console.warn('⚠️ [CAMERA] Erro ao parar track:', err)
          }
        })
        streamRef.current = null
      }
      
      // Limpar vídeo (verificar se elemento existe)
      if (videoRef.current) {
        try {
          videoRef.current.srcObject = null
          videoRef.current.pause()
          console.log('🛑 [CAMERA] Vídeo limpo e pausado')
        } catch (err) {
          console.warn('⚠️ [CAMERA] Erro ao limpar vídeo:', err)
        }
      }
      
      // Resetar estados
      setHasPermission(false)
      setIsLoading(false)
      setError(null)
      
      console.log('✅ [CAMERA] Câmera parada com sucesso')
    } catch (err) {
      console.error('❌ [CAMERA] Erro ao parar câmera:', err)
    }
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

    // Configurar canvas de forma mais simples - não bloquear
    // Usar dimensões do vídeo se disponíveis, senão usar padrão
    const setupCanvas = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        console.log(`🎯 [QR] Canvas configurado: ${canvas.width}x${canvas.height}`)
        return true
      } else {
        // Usar dimensões padrão se o vídeo ainda não tem dimensões
        canvas.width = 640
        canvas.height = 480
        console.log('⚠️ [QR] Usando dimensões padrão do canvas (vídeo ainda não tem dimensões)')
        return false
      }
    }
    
    // Tentar configurar canvas imediatamente
    const hasDimensions = setupCanvas()
    
    // Se não tem dimensões, tentar atualizar periodicamente (mas não bloquear)
    if (!hasDimensions) {
      const dimensionCheckInterval = setInterval(() => {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          console.log(`✅ [QR] Canvas atualizado: ${canvas.width}x${canvas.height}`)
          clearInterval(dimensionCheckInterval)
        }
      }, 200)
      
      // Limpar intervalo após 5 segundos
      setTimeout(() => {
        clearInterval(dimensionCheckInterval)
      }, 5000)
    }
    
    console.log('✅ [QR] Canvas configurado, iniciando detecção...')

    // Tentar BarcodeDetector primeiro (mais eficiente)
    if (window.BarcodeDetector) {
      console.log('🔍 [QR] Usando BarcodeDetector nativo')
      
      const barcodeDetector = new window.BarcodeDetector({
        formats: ['qr_code']
      })

      scanIntervalRef.current = setInterval(async () => {
        if (!isActive) return
        
        // Verificar se o vídeo tem dados (mas não bloquear se não tiver)
        if (video.readyState < video.HAVE_CURRENT_DATA) {
          return // Aguardar vídeo ter dados
        }

        try {
          const barcodes = await barcodeDetector.detect(video)
          if (barcodes.length > 0) {
            const qrData = barcodes[0].rawValue
            console.log('✅ [QR] Código detectado via BarcodeDetector:', qrData.substring(0, 50) + '...')
            validateAndProcessQR(qrData)
          }
        } catch (err: any) {
          // Ignorar erros de detecção (pode acontecer se o vídeo ainda não está pronto)
          if (err.message && !err.message.includes('detect')) {
            console.warn('⚠️ [QR] Erro ao detectar QR:', err.message)
          }
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
          if (!isActive) return
          
          // Verificar se o vídeo tem dados (mas não bloquear se não tiver)
          if (video.readyState < video.HAVE_CURRENT_DATA) {
            return // Aguardar vídeo ter dados
          }

          try {
            // Verificar se o vídeo tem dimensões antes de desenhar
            if (video.videoWidth === 0 || video.videoHeight === 0) {
              return // Aguardar vídeo ter dimensões
            }
            
            // Atualizar dimensões do canvas se necessário
            if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
              canvas.width = video.videoWidth
              canvas.height = video.videoHeight
            }
            
            context.drawImage(video, 0, 0, canvas.width, canvas.height)
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            })
            
            if (code) {
              console.log('✅ [QR] Código detectado via jsQR:', code.data.substring(0, 50) + '...')
              validateAndProcessQR(code.data)
            }
          } catch (err: any) {
            // Ignorar erros de detecção (pode acontecer se o vídeo ainda não está pronto)
            if (err.message && !err.message.includes('drawImage')) {
              console.warn('⚠️ [QR] Erro ao detectar QR:', err.message)
            }
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
              minHeight: '400px',
              display: 'block'
            }}
            onLoadedMetadata={() => {
              console.log('📹 [VIDEO] Metadata carregado')
            }}
            onLoadedData={() => {
              console.log('📹 [VIDEO] Dados carregados')
            }}
            onCanPlay={() => {
              console.log('📹 [VIDEO] Pode reproduzir')
            }}
            onPlaying={() => {
              console.log('▶️ [VIDEO] Reproduzindo')
            }}
            onError={(e) => {
              console.error('❌ [VIDEO] Erro no elemento de vídeo:', e)
              setError('Erro ao carregar vídeo da câmera')
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
          
          {/* Feedback de validação de QR */}
          {qrValidation && (
            <div className="absolute top-4 left-4 right-4 z-20">
              <div className={`
                bg-black/80 backdrop-blur-sm rounded-lg p-3 border-l-4
                ${qrValidation.isValid 
                  ? qrValidation.type === 'SECURE' 
                    ? 'border-green-500 text-green-400' 
                    : qrValidation.type === 'JSON'
                      ? 'border-yellow-500 text-yellow-400'
                      : 'border-orange-500 text-orange-400'
                  : 'border-red-500 text-red-400'
                }
              `}>
                <div className="flex items-center gap-2">
                  {qrValidation.type === 'SECURE' && <Shield className="h-4 w-4" />}
                  {qrValidation.type === 'JSON' && <FileText className="h-4 w-4" />}
                  {qrValidation.type === 'TEXT' && <Edit3 className="h-4 w-4" />}
                  {!qrValidation.isValid && <AlertCircle className="h-4 w-4" />}
                  {qrValidation.isValid && <CheckCircle className="h-4 w-4" />}
                  
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {qrValidation.isValid ? 'QR Válido' : 'QR Inválido'}
                      {qrValidation.machineId && ` - ${qrValidation.machineId}`}
                    </div>
                    {qrValidation.error && (
                      <div className="text-xs opacity-80 mt-1">
                        {qrValidation.error}
                      </div>
                    )}
                    {qrValidation.warnings && qrValidation.warnings.length > 0 && (
                      <div className="text-xs opacity-70 mt-1">
                        ⚠️ {qrValidation.warnings[0]}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs opacity-60">
                    {qrValidation.confidence === 'high' ? '🔒' : 
                     qrValidation.confidence === 'medium' ? '🔓' : '⚠️'}
                  </div>
                </div>
              </div>
            </div>
          )}

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
