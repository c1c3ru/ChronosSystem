'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { qrLogger } from '@/lib/logger'
import { validateQRFormat, validateQRSecurity, type QRValidationResult } from '@/lib/qr-validation'

interface UseQRScannerProps {
    onScan: (data: string) => void
    enabled: boolean
}


export function useQRScanner({ onScan, enabled }: UseQRScannerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const [validation, setValidation] = useState<QRValidationResult | null>(null)
    const [lastError, setLastError] = useState<string | null>(null)

    // Use ref to stabilize the callback identity and prevent re-creation of processFrame
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

    const processFrame = useCallback(async (video: HTMLVideoElement) => {
        if (!canvasRef.current || video.readyState < video.HAVE_CURRENT_DATA) return

        const canvas = canvasRef.current
        const context = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D | null
        if (!context) return

        // Set canvas size to video size if not matches
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
        }

        let qrData: string | null = null

        // 1. Try Native BarcodeDetector
        if ('BarcodeDetector' in window) {
            try {
                const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] })
                const barcodes = await detector.detect(video)
                if (barcodes.length > 0) {
                    qrData = barcodes[0].rawValue
                }
            } catch (e) {
                // Fallback to jsQR
            }
        }

        // 2. Fallback to jsQR
        if (!qrData) {
            try {
                const { default: jsQR } = await import('jsqr')
                context.drawImage(video, 0, 0, canvas.width, canvas.height)
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: 'dontInvert',
                })
                if (code) qrData = code.data
            } catch (e) {
                qrLogger.warn('[QR-SCANNER] jsQR fail:', { error: e })
            }
        }

        if (qrData) {
            const formatVal = validateQRFormat(qrData)
            const securityVal = validateQRSecurity(qrData)

            setValidation(formatVal)

            if (!securityVal.isSafe && securityVal.risks.some(r => r.includes('malicioso'))) {
                setLastError('QR code bloqueado por segurança')
                return
            }

            // Call the ref instead of the prop
            onScanRef.current(qrData)
            stopScanning()
        }
    }, [stopScanning]) // Removed onScan from dependencies

    const startScanning = useCallback((video: HTMLVideoElement) => {
        stopScanning()
        if (!enabled) return

        scanIntervalRef.current = setInterval(() => {
            processFrame(video)
        }, 400) // Lower frequency for better battery/perf
    }, [enabled, processFrame, stopScanning])

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
        stopScanning
    }
}
