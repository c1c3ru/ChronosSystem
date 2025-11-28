'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CheckCircle, XCircle, AlertTriangle, Camera, Smartphone } from 'lucide-react'

export default function QRDiagnosticPage() {
    const [diagnostics, setDiagnostics] = useState<any>({})
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        runDiagnostics()
    }, [])

    const runDiagnostics = async () => {
        setIsLoading(true)
        const results: any = {}

        // 1. Verificar HTTPS
        results.https = {
            status: location.protocol === 'https:',
            message: location.protocol === 'https:'
                ? '✅ Site rodando em HTTPS'
                : '❌ Site NÃO está em HTTPS (obrigatório para câmera)',
            protocol: location.protocol
        }

        // 2. Verificar getUserMedia
        const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
        results.getUserMedia = {
            status: hasGetUserMedia,
            message: hasGetUserMedia
                ? '✅ getUserMedia disponível'
                : '❌ getUserMedia NÃO disponível'
        }
        // 3. Verificar tipo de dispositivo
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        results.device = {
            status: true,
            message: isMobile ? '📱 Dispositivo Mobile' : '💻 Desktop',
            isMobile,
            userAgent: navigator.userAgent
        }

        // 4. Verificar permissões
        if (navigator.permissions && navigator.permissions.query) {
            try {
                const permission = await navigator.permissions.query({ name: 'camera' as PermissionName })
                results.permission = {
                    status: permission.state === 'granted',
                    message: permission.state === 'granted'
                        ? '✅ Permissão da câmera concedida'
                        : permission.state === 'prompt'
                            ? '⚠️ Permissão da câmera será solicitada'
                            : '❌ Permissão da câmera negada',
                    state: permission.state
                }
            } catch (err) {
                results.permission = {
                    status: false,
                    message: '⚠️ Não foi possível verificar permissões',
                    error: String(err)
                }
            }
        } else {
            results.permission = {
                status: false,
                message: '⚠️ API de permissões não disponível'
            }
        }

        // 5. Verificar câmeras disponíveis
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            try {
                // Primeiro solicitar permissão básica
                const tempStream = await navigator.mediaDevices.getUserMedia({ video: true })
                tempStream.getTracks().forEach(track => track.stop())

                const devices = await navigator.mediaDevices.enumerateDevices()
                const cameras = devices.filter(d => d.kind === 'videoinput')

                results.cameras = {
                    status: cameras.length > 0,
                    message: cameras.length > 0
                        ? `✅ ${cameras.length} câmera(s) encontrada(s)`
                        : '❌ Nenhuma câmera encontrada',
                    count: cameras.length,
                    devices: cameras.map(c => ({ id: c.deviceId, label: c.label }))
                }
            } catch (err: any) {
                results.cameras = {
                    status: false,
                    message: '❌ Erro ao listar câmeras: ' + err.message,
                    error: err.message
                }
            }
        } else {
            results.cameras = {
                status: false,
                message: '❌ enumerateDevices não disponível'
            }
        }

        // 6. Verificar BarcodeDetector
        results.barcodeDetector = {
            status: !!(window as any).BarcodeDetector,
            message: (window as any).BarcodeDetector
                ? '✅ BarcodeDetector nativo disponível (mais rápido)'
                : '⚠️ BarcodeDetector não disponível (usará jsQR como fallback)'
        }

        setDiagnostics(results)
        setIsLoading(false)
    }

    const getStatusIcon = (status: boolean | undefined) => {
        if (status === undefined) return <AlertTriangle className="h-5 w-5 text-warning" />
        return status
            ? <CheckCircle className="h-5 w-5 text-success" />
            : <XCircle className="h-5 w-5 text-error" />
    }

    const allPassed = Object.values(diagnostics).every((d: any) => d.status !== false)

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-6">
            <div className="container mx-auto max-w-4xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Diagnóstico do QR Scanner</h1>
                    <p className="text-neutral-400">Verificando compatibilidade e requisitos</p>
                </div>

                {isLoading ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-neutral-400">Executando diagnósticos...</p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Resumo Geral */}
                        <Card className={`mb-6 border-2 ${allPassed ? 'border-success' : 'border-error'}`}>
                            <CardContent className="p-6 text-center">
                                {allPassed ? (
                                    <>
                                        <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
                                        <h2 className="text-2xl font-bold text-success mb-2">✅ Tudo OK!</h2>
                                        <p className="text-neutral-300">Seu dispositivo está pronto para usar o QR Scanner</p>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-16 w-16 text-error mx-auto mb-4" />
                                        <h2 className="text-2xl font-bold text-error mb-2">❌ Problemas Detectados</h2>
                                        <p className="text-neutral-300">Verifique os itens abaixo para resolver</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Detalhes dos Testes */}
                        <div className="space-y-4">
                            {Object.entries(diagnostics).map(([key, value]: [string, any]) => (
                                <Card key={key}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-4">
                                            <div className="mt-1">
                                                {getStatusIcon(value.status)}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-white mb-1">{value.message}</h3>
                                                {value.error && (
                                                    <p className="text-sm text-error-400 mt-1">Erro: {value.error}</p>
                                                )}
                                                {value.devices && value.devices.length > 0 && (
                                                    <div className="mt-2 text-sm text-neutral-400">
                                                        <p className="font-medium mb-1">Câmeras detectadas:</p>
                                                        <ul className="list-disc list-inside">
                                                            {value.devices.map((device: any, idx: number) => (
                                                                <li key={idx}>{device.label || `Câmera ${idx + 1}`}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {key === 'device' && (
                                                    <p className="text-xs text-neutral-500 mt-1 break-all">{value.userAgent}</p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Botões de Ação */}
                        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                            <Button onClick={runDiagnostics} variant="primary">
                                🔄 Executar Novamente
                            </Button>
                            <Button asChild variant="secondary">
                                <a href="/employee">← Voltar ao Portal</a>
                            </Button>
                        </div>

                        {/* Dicas */}
                        {!allPassed && (
                            <Card className="mt-6 border-warning">
                                <CardHeader>
                                    <CardTitle className="text-warning flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5" />
                                        Dicas para Resolver Problemas
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-neutral-300 space-y-2">
                                    {!diagnostics.https?.status && (
                                        <div className="bg-error/10 border border-error/30 rounded p-3">
                                            <p className="font-semibold text-error mb-1">🔒 HTTPS Obrigatório</p>
                                            <p>Acesse o site via https:// - navegadores bloqueiam câmera em HTTP</p>
                                        </div>
                                    )}
                                    {diagnostics.permission?.state === 'denied' && (
                                        <div className="bg-error/10 border border-error/30 rounded p-3">
                                            <p className="font-semibold text-error mb-1">📹 Permissão Negada</p>
                                            <p>1. Clique no ícone 🔒 ou 📹 na barra de endereços</p>
                                            <p>2. Selecione "Permitir" para câmera</p>
                                            <p>3. Recarregue a página</p>
                                        </div>
                                    )}
                                    {!diagnostics.cameras?.status && (
                                        <div className="bg-warning/10 border border-warning/30 rounded p-3">
                                            <p className="font-semibold text-warning mb-1">📱 Nenhuma Câmera</p>
                                            <p>Verifique se há uma câmera conectada ao dispositivo</p>
                                            <p>Feche outros apps que possam estar usando a câmera</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
