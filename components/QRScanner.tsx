'use client'

import React, { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Camera, X, AlertTriangle, Shield, FileText, Edit3, CheckCircle, AlertCircle } from 'lucide-react'
import { useCamera } from '@/lib/hooks/useCamera'
import { useQRScanner } from '@/lib/hooks/useQRScanner'

interface QRScannerProps {
  onScan: (data: string) => void
  isActive: boolean
  onActivate: () => void
}

/**
 * QRScanner - Componente principal de leitura de QR Code
 * Refatorado para usar hooks customizados e subcomponentes funcionais.
 */
export default function QRScanner({ onScan, isActive, onActivate }: QRScannerProps) {
  const {
    videoRef,
    isLoading,
    error,
    hasPermission,
    facingMode,
    startCamera,
    stopCamera,
    switchCamera,
    setError
  } = useCamera({
    onStreamStarted: (stream) => {
      // Iniciar scanner quando a câmera estiver pronta
      if (videoRef.current) {
        startScanning(videoRef.current)
      }
    },
    onError: (msg) => {
      // Sincronizar erros do hook de câmera com o scanner se necessário
    }
  })

  const {
    canvasRef,
    validation,
    lastError,
    startScanning,
    stopScanning
  } = useQRScanner({
    onScan: (data) => {
      onScan(data)
      stopCamera()
    },
    enabled: isActive
  })

  // Efeito para ligar/desligar câmera baseado na prop isActive
  useEffect(() => {
    if (isActive) {
      startCamera()
    } else {
      stopCamera()
      stopScanning()
    }
  }, [isActive, startCamera, stopCamera, stopScanning])

  if (!isActive) {
    return <QRScannerIdle onActivate={onActivate} />
  }

  return (
    <div className="relative bg-black rounded-lg overflow-hidden w-full min-h-[400px]">
      {isLoading && <QRScannerLoading />}

      {(error || lastError) && (
        <QRScannerError
          error={error || lastError}
          onRetry={startCamera}
          onCancel={stopCamera}
        />
      )}

      {/* Camada de Vídeo */}
      <div className={`relative w-full h-full ${hasPermission && !error && !isLoading ? '' : 'hidden'}`}>
        <video
          ref={videoRef}
          className="w-full h-full bg-neutral-900 object-cover min-h-[400px] block"
          playsInline
          muted
          autoPlay
        />

        <QRScannerOverlay validation={validation} />

        <QRScannerControls
          onSwitch={switchCamera}
          onClose={stopCamera}
          facingMode={facingMode}
        />

        {hasPermission && !error && !isLoading && (
          <QRScannerStatus facingMode={facingMode} />
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

// --- SUBCOMPONENTES ---

function QRScannerIdle({ onActivate }: { onActivate: () => void }) {
  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-gradient-to-br from-secondary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
        <Camera className="h-10 w-10 text-white" />
      </div>
      <h3 className="text-xl font-bold text-neutral-800 mb-2">Scanner QR Code</h3>
      <p className="text-neutral-600 mb-6">Ative a câmera para registrar seu ponto</p>
      <Button variant="primary" size="lg" onClick={onActivate} className="px-8 shadow-lg">
        <Camera className="h-5 w-5 mr-2" />
        Ativar Scanner
      </Button>
    </div>
  )
}

function QRScannerLoading() {
  return (
    <div className="absolute inset-0 flex items-center justify-center text-center p-8 z-10 bg-black">
      <div>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-white text-base font-medium">Iniciando câmera...</p>
      </div>
    </div>
  )
}

function QRScannerError({ error, onRetry, onCancel }: { error: string | null, onRetry: () => void, onCancel: () => void }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center text-center p-8 z-10 bg-black/95">
      <div className="max-w-md">
        <AlertTriangle className="h-12 w-12 text-error-400 mx-auto mb-4" />
        <p className="text-error-400 text-base font-medium mb-2">Falha no Scanner</p>
        <p className="text-error-300 text-sm mb-6 px-4 leading-relaxed">{error}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={onRetry} variant="primary" size="sm">
            Tentar Novamente
          </Button>
          <Button onClick={onCancel} variant="secondary" size="sm">
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  )
}

function QRScannerOverlay({ validation }: { validation: any }) {
  return (
    <>
      {/* Moldura de scanning */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="border-2 border-primary-500 rounded-lg w-64 h-64 sm:w-72 sm:h-72 relative shadow-lg">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-500 rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-500 rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-500 rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-500 rounded-br-lg"></div>
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary-500/50 animate-pulse"></div>
        </div>
      </div>

      {/* Dimmed background around selection */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-black/50" style={{
          clipPath: 'polygon(0% 0%, 0% 100%, calc(50% - 128px) 100%, calc(50% - 128px) calc(50% - 128px), calc(50% + 128px) calc(50% - 128px), calc(50% + 128px) calc(50% + 128px), calc(50% - 128px) calc(50% + 128px), calc(50% - 128px) 100%, 100% 100%, 100% 0%)'
        }} />
      </div>

      {/* Validation Feedback */}
      {validation && (
        <div className="absolute top-4 left-4 right-4 z-20 animate-fade-in">
          <div className={`
            bg-black/80 backdrop-blur-md rounded-xl p-4 border-l-4 shadow-2xl
            ${validation.isValid ? 'border-success-500' : 'border-error-500'}
          `}>
            <div className="flex items-center gap-3">
              {validation.type === 'SECURE' ? <Shield className="h-5 w-5 text-success-400" /> : <AlertCircle className="h-5 w-5 text-warning-400" />}
              <div className="flex-1">
                <div className="text-sm font-bold text-white">
                  {validation.isValid ? 'QR Code Seguro Detectado' : 'Formato Não Seguro'}
                </div>
                {validation.machineId && <div className="text-xs text-neutral-400">Máquina: {validation.machineId}</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function QRScannerControls({ onSwitch, onClose, facingMode }: { onSwitch: () => void, onClose: () => void, facingMode: string }) {
  return (
    <div className="absolute top-4 right-4 z-20 flex gap-2">
      <Button
        onClick={onSwitch}
        variant="ghost"
        size="sm"
        className="bg-black/60 border border-white/20 text-white backdrop-blur-md"
      >
        <Camera className="h-5 w-5" />
      </Button>
      <Button
        onClick={onClose}
        variant="ghost"
        size="sm"
        className="bg-black/60 border border-white/20 text-white backdrop-blur-md"
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  )
}

function QRScannerStatus({ facingMode }: { facingMode: string }) {
  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
      <div className="bg-black/70 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-sm border border-primary-500/30 flex items-center gap-3 shadow-xl">
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
        <span className="font-medium">Scanner Ativo</span>
        <span className="text-xs text-neutral-400 border-l border-white/20 pl-3">
          Câmera {facingMode === 'environment' ? 'Traseira' : 'Frontal'}
        </span>
      </div>
    </div>
  )
}

export { QRScanner }
