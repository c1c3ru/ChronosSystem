'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Clock, Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function ChangePasswordPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    if (newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Senha alterada com sucesso!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast.error(data.error || 'Erro ao alterar senha')
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      toast.error('Erro ao alterar senha')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <Clock className="h-10 w-10 text-primary mr-2" />
              <h1 className="text-2xl font-bold text-white">Chronos System</h1>
            </div>
            <p className="text-slate-400">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Clock className="h-10 w-10 text-primary mr-2" />
            <h1 className="text-2xl font-bold text-white">Chronos System</h1>
          </div>
          <p className="text-slate-400">Alterar Senha</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Senha atual
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-blue-900 z-5 pointer-events-none" style={{ color: '#1e3a8a' }} />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-16 pr-16 py-4 bg-gray-50 border-3 border-gray-600 rounded-lg text-gray-900 placeholder-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 font-bold text-lg shadow-lg"
                  placeholder="Digite sua senha atual"
                  required
                  style={{ color: '#1f2937', backgroundColor: '#f9fafb' }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-2 bg-gray-200 hover:bg-gray-300 rounded-full shadow-lg border-2 border-gray-400"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-6 w-6 text-blue-900" style={{ color: '#1e3a8a' }} />
                  ) : (
                    <Eye className="h-6 w-6 text-blue-900" style={{ color: '#1e3a8a' }} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Nova senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-blue-900 z-5 pointer-events-none" style={{ color: '#1e3a8a' }} />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-16 pr-16 py-4 bg-gray-50 border-3 border-gray-600 rounded-lg text-gray-900 placeholder-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 font-bold text-lg shadow-lg"
                  placeholder="Digite a nova senha"
                  required
                  minLength={6}
                  style={{ color: '#1f2937', backgroundColor: '#f9fafb' }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-2 bg-gray-200 hover:bg-gray-300 rounded-full shadow-lg border-2 border-gray-400"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-6 w-6 text-blue-900" style={{ color: '#1e3a8a' }} />
                  ) : (
                    <Eye className="h-6 w-6 text-blue-900" style={{ color: '#1e3a8a' }} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Confirmar nova senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-blue-900 z-5 pointer-events-none" style={{ color: '#1e3a8a' }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-16 pr-16 py-4 bg-gray-50 border-3 border-gray-600 rounded-lg text-gray-900 placeholder-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 font-bold text-lg shadow-lg"
                  placeholder="Confirme a nova senha"
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

            <button
              type="submit"
              disabled={isLoading || newPassword !== confirmPassword || newPassword.length < 6}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Alterando senha...
                </>
              ) : (
                'Alterar senha'
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link 
            href="/employee"
            className="text-slate-400 hover:text-slate-300 text-sm transition-colors"
          >
            ← Voltar ao portal
          </Link>
        </div>
      </div>
    </div>
  )
}
