'use client'

import { useState } from 'react'
import QRScanner from '@/components/QRScanner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CheckCircle, XCircle, Camera, Smartphone } from 'lucide-react'

export default function QRTestPage() {
    const [isScanning, setIsScanning] = useState(false)
    const [scannedData, setScannedData] = useState<string | null>(null)
    const [scanHistory, setScanHistory] = useState<string[]>([])

    const handleScan = (data: string) => {
        console.log('✅ QR Code escaneado:', data)
        setScannedData(data)
        setScanHistory(prev => [data, ...prev].slice(0, 5)) // Manter últimos 5
        setIsScanning(false)
    }

    const handleActivate = () => {
        setIsScanning(true)
        setScannedData(null)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-4">
            <div className="container mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-6 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">🔍 Teste de QR Scanner</h1>
                    <p className="text-neutral-400">Teste a funcionalidade do scanner em dispositivos móveis</p>
                </div>

                {/* Device Info */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Smartphone className="h-5 w-5" />
                            Informações do Dispositivo
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-neutral-400">User Agent:</span>
                                <span className="text-white text-xs break-all max-w-xs text-right">
                                    {typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-400">Plataforma:</span>
                                <span className="text-white">
                                    {typeof navigator !== 'undefined' ? navigator.platform : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-400">Protocolo:</span>
                                <span className={`font-semibold ${typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'text-success' : 'text-error'}`}>
                                    {typeof window !== 'undefined' ? window.location.protocol : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-400">getUserMedia:</span>
                                <span className={`font-semibold ${typeof navigator !== 'undefined' && navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function' ? 'text-success' : 'text-error'}`}>
                                    {typeof navigator !== 'undefined' && navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function' ? 'Disponível ✅' : 'Não disponível ❌'}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Scanner */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Camera className="h-5 w-5" />
                            Scanner QR Code
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <QRScanner
                            onScan={handleScan}
                            isActive={isScanning}
                            onActivate={handleActivate}
                        />
                    </CardContent>
                </Card>

                {/* Resultado */}
                {scannedData && (
                    <Card className="mb-6 border-success">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-success">
                                <CheckCircle className="h-5 w-5" />
                                QR Code Escaneado com Sucesso!
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-success/10 border border-success/30 rounded p-4">
                                <p className="text-sm text-neutral-400 mb-1">Dados:</p>
                                <p className="text-white font-mono text-sm break-all">{scannedData}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Histórico */}
                {scanHistory.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Histórico de Scans</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {scanHistory.map((data, index) => (
                                    <div key={index} className="bg-neutral-800 border border-neutral-700 rounded p-3">
                                        <div className="flex items-start gap-2">
                                            <span className="text-neutral-500 text-xs">#{index + 1}</span>
                                            <p className="text-white font-mono text-xs break-all flex-1">{data}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Instruções */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>📱 Como Testar</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-neutral-300 space-y-2">
                        <p>1. Clique em "Ativar Scanner"</p>
                        <p>2. Permita o acesso à câmera quando solicitado</p>
                        <p>3. Aponte a câmera para um QR Code</p>
                        <p>4. O scanner detectará automaticamente</p>
                        <div className="mt-4 p-3 bg-warning/10 border border-warning/30 rounded">
                            <p className="text-warning font-semibold mb-1">⚠️ Requisitos:</p>
                            <p className="text-xs">• Acesso via HTTPS (obrigatório)</p>
                            <p className="text-xs">• Permissão de câmera concedida</p>
                            <p className="text-xs">• Navegador moderno (Chrome, Safari, Firefox)</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Link para diagnóstico */}
                <div className="mt-6 text-center">
                    <Button asChild variant="secondary">
                        <a href="/qr-diagnostic">
                            🔧 Diagnóstico Completo
                        </a>
                    </Button>
                </div>
            </div>
        </div>
    )
}
