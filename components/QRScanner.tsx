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
  const [currentFacingMode, setCurrentFacingMode] = useState<'environment' | 'user'>('environment')

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
    const tryStartCamera = async (attempt = 1, maxAttempts = 5) => {
      console.log(`🔄 [QR] Tentativa ${attempt}/${maxAttempts} - Verificando elementos DOM...`)

      if (videoRef.current && canvasRef.current) {
        console.log('✅ [QR] Elementos DOM prontos, verificando permissões...')

        try {
          // Verificar permissões antes de iniciar
          const canProceed = await checkPermissions()
          if (!canProceed) {
            return
          }

          console.log('✅ [QR] Permissões OK, iniciando câmera...')
          await startCamera()
        } catch (error: any) {
          console.error('❌ [QR] Erro ao iniciar câmera:', error)
          setError(error.message || 'Erro ao iniciar câmera')
        }
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

  const checkPermissions = async (): Promise<boolean> => {
    try {
      // Verificar se a API de permissões está disponível
      if (navigator.permissions && navigator.permissions.query) {
        const permission = await navigator.permissions.query({ name: 'camera' as PermissionName })
        console.log('📋 [PERMISSIONS] Status da permissão da câmera:', permission.state)

        if (permission.state === 'denied') {
          setError('❌ Permissão da câmera negada permanentemente. Redefina as permissões nas configurações do navegador.')
          return false
        }

        return permission.state === 'granted' || permission.state === 'prompt'
      }

      // Se a API não estiver disponível, assumir que pode tentar
      return true
    } catch (err) {
      console.warn('⚠️ [PERMISSIONS] Erro ao verificar permissões:', err)
      return true // Continuar tentando mesmo se não conseguir verificar
    }
  }

  const requestPermission = async () => {
    try {
      console.log('🔄 [QR] Tentando novamente...')
      setError(null)
      setIsLoading(true)
      setRetryCount(prev => prev + 1)

      // Verificar permissões primeiro
      const canProceed = await checkPermissions()
      if (!canProceed) {
        setIsLoading(false)
        return
      }

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

  // Função para alternar entre câmeras
  const switchCamera = async () => {
    try {
      console.log('🔄 [CAMERA] Alternando câmera...')
      setIsLoading(true)

      // Parar câmera atual
      stopCamera()

      // Alternar facing mode
      const newFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment'
      setCurrentFacingMode(newFacingMode)

      // Aguardar um pouco e reiniciar com nova câmera
      await new Promise(resolve => setTimeout(resolve, 500))
      await startCamera()

      console.log(`✅ [CAMERA] Câmera alternada para: ${newFacingMode === 'environment' ? 'traseira' : 'frontal'}`)
    } catch (err: any) {
      console.error('❌ [CAMERA] Erro ao alternar câmera:', err)
      setError('Erro ao alternar câmera. Tente novamente.')
      setIsLoading(false)
    }
  }

  // Processar QR code detectado
  const validateAndProcessQR = (qrData: string) => {
    console.log('🔍 [QR] QR code detectado:', qrData.substring(0, 50) + '...')

    // Validação básica apenas para feedback visual
    const validation = validateQRFormat(qrData)
    setQrValidation(validation)

    // Validação de segurança
    const security = validateQRSecurity(qrData)

    console.log('📋 [QR] Análise do QR:', {
      type: validation.type,
      confidence: validation.confidence,
      machineId: validation.machineId,
      securityRisks: security.risks
    })

    // Se há riscos de segurança críticos, bloquear
    if (!security.isSafe && security.risks.some(risk => risk.includes('malicioso'))) {
      console.error('❌ [QR] QR code bloqueado por segurança:', security.risks)
      setError('QR code rejeitado por motivos de segurança')
      setTimeout(() => {
        setError(null)
        setQrValidation(null)
      }, 3000)
      return
    }

    // SEMPRE enviar para o servidor - deixar a validação robusta para lá
    console.log('✅ [QR] Enviando QR para processamento no servidor...')
    onScan(qrData)
    stopCamera()
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
        throw new Error('getUserMedia não é suportado neste navegador. Use HTTPS ou um navegador moderno.')
      }

      // Verificar se estamos em contexto seguro (HTTPS ou localhost)
      if (location.protocol !== 'https:' && !location.hostname.includes('localhost') && location.hostname !== '127.0.0.1') {
        throw new Error('Acesso à câmera requer HTTPS. Por favor, acesse o site via HTTPS.')
      }

      // Parar stream anterior se existir
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }

      let stream: MediaStream | null = null

      // Estratégia baseada no facing mode atual
      const cameraConfigs = [
        // 1. Câmera específica obrigatória
        {
          video: {
            facingMode: { exact: currentFacingMode },
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 }
          }
        },
        // 2. Câmera específica preferencial
        {
          video: {
            facingMode: { ideal: currentFacingMode },
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 }
          }
        },
        // 3. Qualquer câmera com resolução boa
        {
          video: {
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 }
          }
        },
        // 4. Configuração mínima (último recurso)
        {
          video: true
        }
      ]

      let lastError: any = null

      for (let i = 0; i < cameraConfigs.length; i++) {
        try {
          console.log(`📱 [CAMERA] Tentativa ${i + 1}/${cameraConfigs.length}...`)
          stream = await navigator.mediaDevices.getUserMedia(cameraConfigs[i])
          console.log(`✅ [CAMERA] Câmera obtida na tentativa ${i + 1}`)
          break
        } catch (configError: any) {
          console.warn(`⚠️ [CAMERA] Tentativa ${i + 1} falhou:`, configError.name)
          lastError = configError
          continue
        }
      }

      // Se nenhuma configuração funcionou, tentar encontrar câmera traseira manualmente
      if (!stream) {
        console.log('🔍 [CAMERA] Tentando encontrar câmera traseira manualmente...')
        try {
          // Primeiro obter permissão básica
          const tempStream = await navigator.mediaDevices.getUserMedia({ video: true })
          tempStream.getTracks().forEach(track => track.stop())

          // Listar dispositivos disponíveis
          const devices = await navigator.mediaDevices.enumerateDevices()
          const videoDevices = devices.filter(d => d.kind === 'videoinput')
          console.log('📹 [CAMERA] Dispositivos encontrados:', videoDevices.map(d => ({ id: d.deviceId, label: d.label })))

          // Procurar câmera traseira por label ou posição
          const backCamera = videoDevices.find(device => {
            const label = device.label.toLowerCase()
            return label.includes('back') ||
              label.includes('rear') ||
              label.includes('environment') ||
              label.includes('traseira') ||
              label.includes('posterior') ||
              label.includes('camera 1') ||
              label.includes('0, facing back') ||
              (videoDevices.length > 1 && videoDevices.indexOf(device) === 1) // Segunda câmera geralmente é traseira
          })

          if (backCamera) {
            console.log('📱 [CAMERA] Câmera traseira encontrada:', backCamera.label)
            stream = await navigator.mediaDevices.getUserMedia({
              video: {
                deviceId: { exact: backCamera.deviceId },
                width: { ideal: 1280, min: 640 },
                height: { ideal: 720, min: 480 }
              }
            })
            console.log('✅ [CAMERA] Câmera traseira obtida por deviceId')
          }
        } catch (deviceError: any) {
          console.warn('⚠️ [CAMERA] Erro ao buscar câmera traseira manualmente:', deviceError.message)
        }
      }

      if (!stream) {
        console.error('❌ [CAMERA] Nenhuma configuração de câmera funcionou')
        throw lastError || new Error('Não foi possível acessar a câmera')
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

      console.log('📹 [CAMERA] Stream atribuído ao vídeo, configurando reprodução...')

      // Aguardar o vídeo estar pronto para reproduzir
      const waitForVideo = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout aguardando vídeo estar pronto'))
        }, 10000) // 10 segundos timeout

        const checkVideo = () => {
          if (video.readyState >= video.HAVE_ENOUGH_DATA) {
            clearTimeout(timeout)
            resolve()
          } else {
            setTimeout(checkVideo, 100)
          }
        }

        // Começar verificação imediatamente
        checkVideo()

        // Também escutar eventos
        video.addEventListener('loadeddata', () => {
          clearTimeout(timeout)
          resolve()
        }, { once: true })

        video.addEventListener('canplay', () => {
          clearTimeout(timeout)
          resolve()
        }, { once: true })
      })

      // Tentar reproduzir o vídeo
      try {
        await video.play()
        console.log('▶️ [CAMERA] Vídeo reproduzindo')
      } catch (playError: any) {
        console.warn('⚠️ [CAMERA] Erro ao reproduzir vídeo:', playError.message)
        // Continuar mesmo com erro - alguns navegadores bloqueiam autoplay
      }

      // Aguardar vídeo estar pronto (com timeout)
      try {
        await waitForVideo
        console.log('✅ [CAMERA] Vídeo pronto para scanning')
      } catch (videoError: any) {
        console.warn('⚠️ [CAMERA] Timeout aguardando vídeo, continuando...', videoError.message)
        // Continuar mesmo com timeout - pode funcionar
      }

      // Definir estados de sucesso
      setHasPermission(true)
      setIsLoading(false)

      // Iniciar scanner após pequeno delay
      setTimeout(() => {
        if (videoRef.current && videoRef.current.srcObject) {
          console.log('🔍 [CAMERA] Iniciando scanner de QR code...')
          startScanning()
        } else {
          console.error('❌ [CAMERA] Vídeo não está mais disponível para scanning')
          setError('Erro ao inicializar scanner. Tente novamente.')
        }
      }, 1000)

    } catch (err: any) {
      console.error('❌ [CAMERA] Erro ao acessar câmera:', err)
      console.error('❌ [CAMERA] Detalhes do erro:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      })
      setIsLoading(false)

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('❌ Permissão da câmera negada. Clique no ícone da câmera na barra de endereços e permita o acesso.')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('❌ Nenhuma câmera encontrada. Verifique se há uma câmera conectada ao dispositivo.')
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('❌ Câmera em uso por outro app. Feche outros aplicativos que usam a câmera e tente novamente.')
      } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
        setError('❌ Configuração da câmera não suportada. Tente usar um dispositivo diferente.')
      } else if (err.message?.includes('HTTPS')) {
        setError('🔒 Acesso à câmera requer HTTPS. Acesse o site via https:// ou use localhost.')
      } else if (err.message?.includes('getUserMedia')) {
        setError('❌ Navegador não suporta câmera. Use Chrome, Firefox ou Safari atualizado.')
      } else if (err.message?.includes('Timeout')) {
        setError('⏱️ Timeout ao inicializar câmera. Verifique a conexão e tente novamente.')
      } else {
        setError(`❌ Erro: ${err.message || 'Falha ao acessar câmera. Verifique permissões e tente novamente.'}`)
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
        <div className="w-20 h-20 bg-gradient-to-br from-secondary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Camera className="h-10 w-10 text-white" />
        </div>
        <h3 className="text-xl font-bold text-neutral-800 mb-2">Scanner QR Code</h3>
        <p className="text-neutral-600 mb-6">Clique no botão abaixo para ativar a câmera</p>
        <Button
          variant="primary"
          size="lg"
          onClick={onActivate}
          className="px-8 shadow-lg"
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-white text-base font-medium">Iniciando câmera...</p>
            <p className="text-neutral-400 text-sm mt-2">Aguarde um momento</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-center p-8 z-10 bg-black/95">
          <div className="max-w-md">
            <AlertTriangle className="h-12 w-12 text-error-400 mx-auto mb-4" />
            <p className="text-error-400 text-base font-medium mb-2">Erro ao acessar câmera</p>
            <p className="text-error-300 text-sm mb-6 px-4 leading-relaxed">{error}</p>

            {/* Dicas específicas baseadas no tipo de erro */}
            {error.includes('Permissão') && (
              <div className="bg-info-900/30 border border-info-500/30 rounded-lg p-3 mb-4 text-xs text-info-300">
                <p className="font-medium mb-1">💡 Como permitir acesso:</p>
                <p>1. Clique no ícone 🔒 ou 📹 na barra de endereços</p>
                <p>2. Selecione &quot;Permitir&quot; para câmera</p>
                <p>3. Recarregue a página se necessário</p>
              </div>
            )}

            {error.includes('HTTPS') && (
              <div className="bg-warning-900/30 border border-warning-500/30 rounded-lg p-3 mb-4 text-xs text-warning-300">
                <p className="font-medium mb-1">🔒 Contexto seguro necessário:</p>
                <p>Acesse via https:// ou use localhost para desenvolvimento</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={requestPermission} variant="primary" size="sm">
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

      {/* Elementos de vídeo e canvas sempre presentes (mas ocultos quando necessário) */}
      <div className={`relative w-full h-full ${hasPermission && !error && !isLoading ? '' : 'hidden'}`}>
        <video
          ref={videoRef}
          className="w-full h-full bg-neutral-900"
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
          <div className="border-2 border-primary-500 rounded-lg w-64 h-64 sm:w-72 sm:h-72 relative shadow-lg">
            {/* Cantos do quadrado */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-500 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-500 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-500 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-500 rounded-br-lg"></div>

            {/* Linha de scanning animada */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary-500 opacity-50">
              <div className="absolute -top-1 left-1/2 w-6 h-3 bg-primary-500 rounded-full transform -translate-x-1/2 animate-pulse"></div>
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
                  ? 'border-primary-500 text-primary-400'
                  : qrValidation.type === 'JSON'
                    ? 'border-warning-500 text-warning-400'
                    : 'border-info-500 text-info-400'
                : 'border-error-500 text-error-400'
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

        {/* Botões de controle */}
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          {/* Botão para alternar câmera */}
          <Button
            onClick={switchCamera}
            variant="ghost"
            size="sm"
            className="bg-black/70 border border-white/30 text-white hover:bg-black/90 backdrop-blur-sm"
            title={`Alternar para câmera ${currentFacingMode === 'environment' ? 'frontal' : 'traseira'}`}
          >
            <Camera className="h-5 w-5" />
          </Button>

          {/* Botão de fechar */}
          <Button
            onClick={stopCamera}
            variant="ghost"
            size="sm"
            className="bg-black/70 border border-white/30 text-white hover:bg-black/90 backdrop-blur-sm"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Canvas sempre presente (oculto) */}
      <canvas
        ref={canvasRef}
        className="hidden"
      />

      {/* Status - só mostrar se não houver erro nem loading */}
      {hasPermission && !error && !isLoading && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm border border-primary-500/30 flex items-center gap-2">
            <span>✅ Scanner ativo - Aponte para o QR code</span>
            <span className="text-xs opacity-70">
              📹 {currentFacingMode === 'environment' ? 'Traseira' : 'Frontal'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// Exportar também como named export para compatibilidade
export { QRScanner }
