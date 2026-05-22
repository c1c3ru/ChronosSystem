'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { qrLogger } from '@/lib/logger'
import { validateQRFormat, validateQRSecurity, type QRValidationResult } from '@/lib/qr-validation'

interface UseQRScannerProps {
  onScan: (data: string) => void
  enabled: boolean
}

interface BarcodeDetector {
  detect(image: ImageBitmapSource): Promise<Array<{ rawValue: string }>>
}

export function useQRScanner({ onScan, enabled }: UseQRScannerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [validation, setValidation] = useState<QRValidationResult | null>(null)
  const [lastError, setLastError] = useState<string | null>(null)
  const barcodeDetectorRef = useRef<BarcodeDetector | null>(null)
  const jsQRRef = useRef<
    | ((
        data: Uint8ClampedArray,
        width: number,
        height: number,
        options?: {
          inversionAttempts?: 'dontInvert' | 'onlyInvert' | 'attemptBoth' | 'invertFirst'
        }
      ) => { data: string } | null)
    | null
  >(null)
  const isLoadingLibRef = useRef(false)

  // Use ref to stabilize the callback identity
  const onScanRef = useRef(onScan)

  // Update ref when prop changes
  useEffect(() => {
    onScanRef.current = onScan
  }, [onScan])

  const stopScanning = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
  }, [])

  const processFrame = useCallback(
    async (video: HTMLVideoElement) => {
      if (!canvasRef.current || video.readyState < video.HAVE_CURRENT_DATA) return

      const canvas = canvasRef.current
      const context = canvas.getContext('2d', {
        willReadFrequently: true,
        alpha: false, // Otimização: não precisamos de transparência
      }) as CanvasRenderingContext2D | null
      if (!context) return

      // Otimização: Downsampling
      // Para QR codes, 400px de largura é mais que suficiente e economiza muita CPU
      const maxDimension = 400
      let scanWidth = video.videoWidth
      let scanHeight = video.videoHeight

      if (scanWidth > maxDimension || scanHeight > maxDimension) {
        const scale = maxDimension / Math.max(scanWidth, scanHeight)
        scanWidth = Math.floor(scanWidth * scale)
        scanHeight = Math.floor(scanHeight * scale)
      }

      if (canvas.width !== scanWidth || canvas.height !== scanHeight) {
        canvas.width = scanWidth
        canvas.height = scanHeight
      }

      let qrData: string | null = null

      // 1. Tentar Native BarcodeDetector (High Performance)
      if ('BarcodeDetector' in window) {
        try {
          if (!barcodeDetectorRef.current) {
            barcodeDetectorRef.current = new (
              window as Window &
                typeof globalThis & { BarcodeDetector: new (opts?: unknown) => unknown }
            ).BarcodeDetector({
              formats: ['qr_code'],
            })
          }
          const barcodes = await barcodeDetectorRef.current.detect(video)
          if (barcodes.length > 0) {
            qrData = barcodes[0].rawValue
          }
        } catch (e) {
          // Fallback para jsQR
          qrLogger.debug('[QR-SCANNER] BarcodeDetector falhou, usando fallback')
        }
      }

      // 2. Fallback para jsQR (CPU Intensive)
      if (!qrData) {
        try {
          // Carregar biblioteca apenas se necessário e uma única vez
          if (!jsQRRef.current && !isLoadingLibRef.current) {
            isLoadingLibRef.current = true
            const { default: jsQR } = await import('jsqr')
            jsQRRef.current = jsQR
            isLoadingLibRef.current = false
          }

          if (jsQRRef.current) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height)
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
            const code = jsQRRef.current(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            })
            if (code) qrData = code.data
          }
        } catch (e) {
          qrLogger.warn('[QR-SCANNER] jsQR erro:', { error: e })
        }
      }

      if (qrData) {
        qrLogger.debug('[QR-SCANNER] QR code capturado, iniciando validação')

        const formatVal = validateQRFormat(qrData)
        const securityVal = validateQRSecurity(qrData)

        setValidation(formatVal)

        // Validação de segurança crítica
        if (!securityVal.isSafe && securityVal.risks.some((r) => r.includes('malicioso'))) {
          qrLogger.security('Ataque de QR Code detectado', {
            risks: securityVal.risks,
            qrLength: qrData.length,
          })
          setLastError('QR code bloqueado por segurança: código malicioso detectado')
          return // Mantém o scanner aberto para tentar outro, mas bloqueia este
        }

        // Validação de formato para o sistema Chronos
        if (!formatVal.isValid) {
          qrLogger.warn('[QR-SCANNER] QR code inválido para este sistema', {
            type: formatVal.type,
            error: formatVal.error,
          })
          // Não chamamos onScan e NÃO paramos o scanner
          // O estado de validation já fará a UI mostrar o erro
          return
        }

        qrLogger.info('[QR-SCANNER] QR code válido e seguro detectado', {
          machineId: formatVal.machineId,
          type: formatVal.type,
        })

        onScanRef.current(qrData)
        stopScanning()
      }
    },
    [stopScanning]
  )

  const startScanning = useCallback(
    (video: HTMLVideoElement) => {
      stopScanning()
      if (!enabled) return

      // 500ms é um equilíbrio perfeito entre responsividade e consumo de bateria
      scanIntervalRef.current = setInterval(() => {
        processFrame(video)
      }, 500)
    },
    [enabled, processFrame, stopScanning]
  )

  useEffect(() => {
    if (!enabled) stopScanning()
    return () => stopScanning()
  }, [enabled, stopScanning])

  return {
    canvasRef,
    validation,
    lastError,
    setLastError,
    startScanning,
    stopScanning,
  }
}
