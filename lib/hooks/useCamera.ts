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
    const [retryCount, setRetryCount] = useState(0)

    const stopCamera = useCallback(() => {
        qrLogger.debug('🛑 [CAMERA-HOOK] Parando câmera...')
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null
            videoRef.current.pause()
        }
        setHasPermission(false)
        setIsLoading(false)
        onStreamStopped?.()
    }, [onStreamStopped])

    const checkPermissions = async (): Promise<boolean> => {
        try {
            if (navigator.permissions && navigator.permissions.query) {
                const permission = await navigator.permissions.query({ name: 'camera' as PermissionName })
                if (permission.state === 'denied') {
                    const msg = '❌ Permissão da câmera negada permanentemente.'
                    setError(msg)
                    onError?.(msg)
                    return false
                }
                return permission.state === 'granted' || permission.state === 'prompt'
            }
            return true
        } catch (err) {
            return true
        }
    }

    const startCamera = useCallback(async (mode: 'environment' | 'user' = facingMode) => {
        try {
            setIsLoading(true)
            setError(null)

            if (!videoRef.current) throw new Error('Elemento de vídeo não disponível')
            if (!navigator.mediaDevices?.getUserMedia) throw new Error('Navegador não suporta câmera')

            // Verificar contexto seguro
            const isSecure = window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost'
            if (!isSecure) throw new Error('🔒 Acesso à câmera requer HTTPS')

            // Parar anterior
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
            }

            const constraints = [
                { video: { facingMode: { exact: mode }, width: { ideal: 1280 }, height: { ideal: 720 } } },
                { video: { facingMode: { ideal: mode }, width: { ideal: 1280 }, height: { ideal: 720 } } },
                { video: true }
            ]

            let stream: MediaStream | null = null
            let lastErr: any = null

            for (const config of constraints) {
                try {
                    stream = await navigator.mediaDevices.getUserMedia(config)
                    break
                } catch (e) {
                    lastErr = e
                }
            }

            if (!stream) throw lastErr || new Error('Não foi possível acessar a câmera')

            streamRef.current = stream
            videoRef.current.srcObject = stream
            videoRef.current.playsInline = true

            await videoRef.current.play()

            setHasPermission(true)
            setIsLoading(false)
            setFacingMode(mode)
            onStreamStarted?.(stream)

        } catch (err: any) {
            const msg = err.message || 'Erro ao acessar câmera'
            setError(msg)
            setIsLoading(false)
            onError?.(msg)
        }
    }, [facingMode, onStreamStarted, onError])

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
        setError
    }
}
