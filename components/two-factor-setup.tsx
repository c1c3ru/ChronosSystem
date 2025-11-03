'use client'

import { useState, useEffect } from 'react'
import { Shield, ShieldCheck, ShieldX, Copy, Eye, EyeOff, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Alert, AlertDescription } from '@/components/ui/Alert'

interface TwoFactorStatus {
  enabled: boolean
  hasSecret: boolean
  email: string
}

interface TwoFactorSetup {
  qrCodeUrl: string
  manualEntryKey: string
  instructions: {
    step1: string
    step2: string
    step3: string
  }
}

export function TwoFactorSetup() {
  const [status, setStatus] = useState<TwoFactorStatus | null>(null)
  const [setup, setSetup] = useState<TwoFactorSetup | null>(null)
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showManualKey, setShowManualKey] = useState(false)
  const [step, setStep] = useState<'status' | 'setup' | 'verify'>('status')

  // Carregar status inicial
  useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    try {
      const response = await fetch('/api/auth/2fa/setup')
      const data = await response.json()
      
      if (response.ok) {
        setStatus(data)
      } else {
        setError(data.error || 'Erro ao carregar status')
      }
    } catch (error) {
      setError('Erro de conexão')
    }
  }

  const startSetup = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST'
      })
      const data = await response.json()
      
      if (response.ok) {
        setSetup(data.setup)
        setStep('setup')
      } else {
        setError(data.error || 'Erro ao configurar 2FA')
      }
    } catch (error) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const verifyToken = async () => {
    if (!token || token.length !== 6) {
      setError('Digite um código de 6 dígitos')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      })
      const data = await response.json()
      
      if (response.ok) {
        setSuccess(data.message)
        setStep('status')
        setToken('')
        setSetup(null)
        await loadStatus() // Recarregar status
      } else {
        setError(data.error || 'Token inválido')
      }
    } catch (error) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const disableTwoFactor = async () => {
    if (!token || token.length !== 6) {
      setError('Digite um código de 6 dígitos para confirmar')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      })
      const data = await response.json()
      
      if (response.ok) {
        setSuccess(data.message)
        setToken('')
        await loadStatus()
      } else {
        setError(data.error || 'Erro ao desabilitar 2FA')
      }
    } catch (error) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const copyManualKey = () => {
    if (setup?.manualEntryKey) {
      navigator.clipboard.writeText(setup.manualEntryKey)
      setSuccess('Chave copiada para a área de transferência!')
    }
  }

  if (!status) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {status.enabled ? (
              <ShieldCheck className="w-5 h-5 text-green-500" />
            ) : (
              <ShieldX className="w-5 h-5 text-red-500" />
            )}
            <span>Autenticação de Dois Fatores (2FA)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div>
              <p className="font-medium">
                Status: {status.enabled ? 'Habilitado' : 'Desabilitado'}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {status.enabled 
                  ? 'Sua conta está protegida com 2FA' 
                  : 'Adicione uma camada extra de segurança'
                }
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${status.enabled ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>

          {!status.enabled && (
            <Button onClick={startSetup} disabled={loading} className="w-full">
              <Shield className="w-4 h-4 mr-2" />
              Configurar 2FA
            </Button>
          )}

          {status.enabled && (
            <div className="space-y-3">
              <Alert>
                <Smartphone className="w-4 h-4" />
                <AlertDescription>
                  2FA está ativo. Use seu app autenticador para gerar códigos de acesso.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Código do app autenticador (para desabilitar):
                </label>
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="000000"
                    value={token}
                    onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                  />
                  <Button 
                    onClick={disableTwoFactor} 
                    disabled={loading || token.length !== 6}
                    variant="destructive"
                  >
                    Desabilitar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup do 2FA */}
      {step === 'setup' && setup && (
        <Card>
          <CardHeader>
            <CardTitle>Configurar Autenticador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Instruções */}
            <div className="space-y-2">
              <h3 className="font-medium">Instruções:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400">
                <li>{setup.instructions.step1}</li>
                <li>{setup.instructions.step2}</li>
                <li>{setup.instructions.step3}</li>
              </ol>
            </div>

            {/* QR Code */}
            <div className="text-center space-y-4">
              <div className="inline-block p-4 bg-white rounded-lg">
                <img 
                  src={setup.qrCodeUrl} 
                  alt="QR Code para 2FA" 
                  className="w-48 h-48"
                />
              </div>
              
              {/* Chave manual */}
              <div className="space-y-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowManualKey(!showManualKey)}
                >
                  {showManualKey ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showManualKey ? 'Ocultar' : 'Mostrar'} chave manual
                </Button>
                
                {showManualKey && (
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <code className="text-sm font-mono break-all">
                        {setup.manualEntryKey}
                      </code>
                      <Button size="sm" variant="ghost" onClick={copyManualKey}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Verificação */}
            <div className="space-y-3">
              <label className="text-sm font-medium">
                Digite o código de 6 dígitos do seu app:
              </label>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="000000"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
                <Button 
                  onClick={verifyToken} 
                  disabled={loading || token.length !== 6}
                >
                  Verificar
                </Button>
              </div>
            </div>

            <Button 
              variant="secondary" 
              onClick={() => setStep('status')}
              className="w-full"
            >
              Cancelar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Mensagens */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
