'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Clock, Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

function ResetPasswordContent() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [tokenError, setTokenError] = useState('')
  const [userInfo, setUserInfo] = useState<any>(null)
  const [resetComplete, setResetComplete] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get('token')

  useEffect(() => {
    if (!token) {
      setTokenError('Token não fornecido')
      setIsValidating(false)
      return
    }

    validateToken()
  }, [token])

  const validateToken = async () => {
    try {
      const response = await fetch(`/api/auth/reset-password?token=${token}`)
      const data = await response.json()

      if (data.valid) {
        setTokenValid(true)
        setUserInfo(data.user)
      } else {
        setTokenError(data.error || 'Token inválido')
      }
    } catch (error) {
      console.error('Erro ao validar token:', error)
      setTokenError('Erro ao validar token')
    } finally {
      setIsValidating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    if (newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResetComplete(true)
        toast.success('Senha alterada com sucesso!')
      } else {
        toast.error(data.error || 'Erro ao alterar senha')
      }
    } catch (error) {
      console.error('Erro ao resetar senha:', error)
      toast.error('Erro ao alterar senha')
    } finally {
      setIsLoading(false)
    }
  }

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Clock className="h-10 w-10 text-primary mr-2" />
              <h1 className="text-2xl font-bold text-white">Chronos System</h1>
            </div>
            <p className="text-slate-400">Validando token...</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Clock className="h-10 w-10 text-primary mr-2" />
              <h1 className="text-2xl font-bold text-white">Chronos System</h1>
            </div>
            <p className="text-slate-400">Reset de Senha</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
            <div className="text-center">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Token Inválido</h2>
              <p className="text-slate-400 mb-6">{tokenError}</p>

              <Link
                href="/auth/signin"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Voltar ao Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (resetComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Clock className="h-10 w-10 text-primary mr-2" />
              <h1 className="text-2xl font-bold text-white">Chronos System</h1>
            </div>
            <p className="text-slate-400">Reset de Senha</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Senha Alterada!</h2>
              <p className="text-slate-400 mb-6">
                Sua senha foi alterada com sucesso. Agora você pode fazer login com a nova senha.
              </p>

              <Link
                href="/auth/signin"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Fazer Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Clock className="h-10 w-10 text-primary mr-2" />
            <h1 className="text-2xl font-bold text-white">Chronos System</h1>
          </div>
          <p className="text-slate-400">Definir Nova Senha</p>
        </div>

        {/* User Info */}
        {userInfo && (
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-600 p-4 mb-6">
            <div className="text-center">
              <p className="text-slate-300 text-sm">Alterando senha para:</p>
              <p className="text-white font-medium">{userInfo.name}</p>
              <p className="text-slate-400 text-sm">{userInfo.email}</p>
            </div>
          </div>
        )}

        {/* Reset Form */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <label
                htmlFor="reset-new-password"
                className="block text-sm font-medium text-white mb-2"
              >
                Nova Senha
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-blue-900 z-5 pointer-events-none"
                  style={{ color: '#1e3a8a' }}
                />
                <input
                  id="reset-new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-16 pr-16 py-4 bg-gray-50 border-3 border-gray-600 rounded-lg text-gray-900 placeholder-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 font-bold text-lg shadow-lg"
                  placeholder="Digite sua nova senha"
                  required
                  minLength={6}
                  style={{ color: '#1f2937', backgroundColor: '#f9fafb' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-2 bg-gray-200 hover:bg-gray-300 rounded-full shadow-lg border-2 border-gray-400"
                >
                  {showPassword ? (
                    <EyeOff className="h-6 w-6 text-blue-900" style={{ color: '#1e3a8a' }} />
                  ) : (
                    <Eye className="h-6 w-6 text-blue-900" style={{ color: '#1e3a8a' }} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="reset-confirm-password"
                className="block text-sm font-medium text-white mb-2"
              >
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-blue-900 z-5 pointer-events-none"
                  style={{ color: '#1e3a8a' }}
                />
                <input
                  id="reset-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-16 pr-16 py-4 bg-gray-50 border-3 border-gray-600 rounded-lg text-gray-900 placeholder-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duração-200 font-bold text-lg shadow-lg"
                  placeholder="Confirme sua nova senha"
                  required
                  minLength={6}
                  style={{ color: '#1f2937', backgroundColor: '#f9fafb' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-2 bg-gray-200 hover:bg-gray-300 rounded-full shadow-lg border-2 border-gray-400"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-6 w-6 text-blue-900" style={{ color: '#1e3a8a' }} />
                  ) : (
                    <Eye className="h-6 w-6 text-blue-900" style={{ color: '#1e3a8a' }} />
                  )}
                </button>
              </div>
            </div>

            {/* Password Match Indicator */}
            {confirmPassword && (
              <div className="text-sm">
                {newPassword === confirmPassword ? (
                  <p className="text-green-400 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    As senhas coincidem
                  </p>
                ) : (
                  <p className="text-red-400 flex items-center">
                    <XCircle className="h-4 w-4 mr-1" />
                    As senhas não coincidem
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || newPassword !== confirmPassword || newPassword.length < 6}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Alterando Senha...
                </>
              ) : (
                'Alterar Senha'
              )}
            </button>
          </form>
        </div>

        {/* Back to Login */}
        <div className="text-center mt-6">
          <Link
            href="/auth/signin"
            className="text-slate-400 hover:text-slate-300 text-sm transition-colors"
          >
            ← Voltar ao login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Clock className="h-10 w-10 text-primary mr-2" />
                <h1 className="text-2xl font-bold text-white">Chronos System</h1>
              </div>
              <p className="text-slate-400">Validando token...</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
