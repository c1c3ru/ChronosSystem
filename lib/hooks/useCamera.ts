'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { qrLogger } from '@/lib/logger'

interface UseCameraProps {
  onStreamStarted?: (stream: MediaStream) => void
  onStreamStopped?: () => void
  onError?: (error: string) => void
}

export function useCamera({ onStreamStarted, onStreamStopped, onError }: UseCameraProps = {}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState(false)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')

  // Refs for callbacks to ensure stable identity of startCamera/stopCamera
  const onStreamStartedRef = useRef(onStreamStarted)
  const onStreamStoppedRef = useRef(onStreamStopped)
  const onErrorRef = useRef(onError)

  // Update refs when props change
  useEffect(() => {
    onStreamStartedRef.current = onStreamStarted
    onStreamStoppedRef.current = onStreamStopped
    onErrorRef.current = onError
  }, [onStreamStarted, onStreamStopped, onError])

  const stopCamera = useCallback(() => {
    qrLogger.debug('🛑 [CAMERA-HOOK] Parando câmera...')
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current.pause()
    }
    setHasPermission(false)
    setIsLoading(false)
    onStreamStoppedRef.current?.()
  }, [])

  const checkPermissions = async (): Promise<boolean> => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const permission = await navigator.permissions.query({ name: 'camera' as PermissionName })
        qrLogger.debug(`[CAMERA-HOOK] Estado da permissão: ${permission.state}`)
        if (permission.state === 'denied') {
          const msg = '❌ Permissão da câmera negada permanentemente.'
          setError(msg)
          onErrorRef.current?.(msg)
          return false
        }
        return permission.state === 'granted' || permission.state === 'prompt'
      }
      return true
    } catch (err) {
      qrLogger.warn('[CAMERA-HOOK] Falha ao consultar API de permissões', { error: err })
      return true
    }
  }

  const startCamera = useCallback(
    async (mode: 'environment' | 'user' = facingMode) => {
      qrLogger.info(`[CAMERA-HOOK] Iniciando câmera (modo: ${mode})...`)
      try {
        setIsLoading(true)
        setError(null)

        if (!videoRef.current) throw new Error('Elemento de vídeo não disponível')
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('Navegador não suporta câmera')

        // Verificar contexto seguro
        const isSecure =
          window.isSecureContext ||
          location.protocol === 'https:' ||
          location.hostname === 'localhost'
        if (!isSecure) {
          qrLogger.security('Tentativa de acesso à câmera em contexto não seguro')
          throw new Error('🔒 Acesso à câmera requer HTTPS')
        }

        // Parar anterior
        if (streamRef.current) {
          qrLogger.debug('[CAMERA-HOOK] Parando stream anterior antes de reiniciar')
          streamRef.current.getTracks().forEach((track) => track.stop())
        }

        const constraints = [
          {
            video: { facingMode: { exact: mode }, width: { ideal: 1280 }, height: { ideal: 720 } },
          },
          {
            video: { facingMode: { ideal: mode }, width: { ideal: 1280 }, height: { ideal: 720 } },
          },
          { video: true },
        ]

        let stream: MediaStream | null = null
        let lastErr: any = null

        for (let i = 0; i < constraints.length; i++) {
          qrLogger.debug(`[CAMERA-HOOK] Tentando configuração de câmera ${i + 1}`)
          try {
            stream = await navigator.mediaDevices.getUserMedia(constraints[i])
            qrLogger.info(`[CAMERA-HOOK] Conexão com câmera estabelecida (Configuraçao ${i + 1})`)
            break
          } catch (e) {
            lastErr = e
            qrLogger.warn(`[CAMERA-HOOK] Falha na configuração ${i + 1}`, { error: e })
          }
        }

        if (!stream) {
          qrLogger.error('[CAMERA-HOOK] Todas as configurações de câmera falharam', {
            lastError: lastErr,
          })
          throw lastErr || new Error('Não foi possível acessar a câmera')
        }

        streamRef.current = stream
        videoRef.current.srcObject = stream
        videoRef.current.playsInline = true

        try {
          await videoRef.current.play()
          qrLogger.debug('[CAMERA-HOOK] Playback iniciado')
        } catch (playError) {
          qrLogger.error('[CAMERA-HOOK] Erro no play() do vídeo', { error: playError })
        }

        setHasPermission(true)
        setIsLoading(false)
        setFacingMode(mode)
        onStreamStartedRef.current?.(stream)
        qrLogger.info('[CAMERA-HOOK] Câmera pronta e ativa')
      } catch (err: any) {
        const msg = err.message || 'Erro ao acessar câmera'
        qrLogger.error('[CAMERA-HOOK] Erro fatal ao iniciar câmera', {
          name: err.name,
          message: msg,
          stack: err.stack,
        })
        setError(msg)
        setIsLoading(false)
        onErrorRef.current?.(msg)
      }
    },
    [facingMode]
  ) // Removed onStreamStarted/onError from dependencies

  const switchCamera = useCallback(async () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment'
    await startCamera(newMode)
  }, [facingMode, startCamera])

  useEffect(() => {
    return () => stopCamera()
  }, [stopCamera])

  return {
    videoRef,
    isLoading,
    error,
    hasPermission,
    facingMode,
    startCamera,
    stopCamera,
    switchCamera,
    setError,
  }
}
