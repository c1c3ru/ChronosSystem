'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Clock, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [googleError, setGoogleError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Credenciais inválidas')
        return
      }

      if (!result?.ok) {
        toast.error('Falha no login')
        return
      }

      // Get session to check user role and profile completion
      const session = await getSession()
      
      if (session?.user) {
        toast.success('Login realizado com sucesso!')
        
        // Check if profile is complete
        if (session.user.profileComplete === false) {
          router.push('/auth/complete-profile')
          return
        }
        
        // Redirect based on role
        if (session.user.role === 'ADMIN' || session.user.role === 'SUPERVISOR') {
          router.push('/admin')
        } else {
          router.push('/employee')
        }
      } else {
        toast.error('Erro ao obter dados do usuário')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true)
      setGoogleError(null)
      toast.loading('Verificando usuário...', { id: 'google-login' })
      
      const result = await signIn('google', { 
        callbackUrl: '/',
        redirect: false // Não redirecionar automaticamente para capturar erros
      })
      
      if (result?.error) {
        console.error('Google login error:', result.error)
        
        let errorMessage = 'Erro ao fazer login com Google'
        
        // Tratar diferentes tipos de erro
        switch (result.error) {
          case 'AccessDenied':
            errorMessage = '❌ Acesso negado. Usuário não autorizado no sistema.'
            setGoogleError('Apenas usuários autorizados podem acessar o sistema. Entre em contato com o administrador.')
            break
          case 'OAuthSignin':
            errorMessage = '❌ Erro na autenticação Google. Tente novamente.'
            setGoogleError('Falha na comunicação com o Google. Verifique sua conexão.')
            break
          case 'OAuthCallback':
            errorMessage = '❌ Erro no callback do Google. Tente novamente.'
            setGoogleError('Erro no retorno da autenticação. Tente fazer login novamente.')
            break
          case 'OAuthCreateAccount':
            errorMessage = '❌ Erro ao criar conta. Tente novamente.'
            setGoogleError('Não foi possível criar sua conta. Verifique se o email está correto.')
            break
          case 'EmailCreateAccount':
            errorMessage = '❌ Email já está em uso com outro provedor.'
            setGoogleError('Este email já está associado a outro método de login.')
            break
          case 'Callback':
            errorMessage = '❌ Erro de callback. Tente novamente.'
            setGoogleError('Erro no processo de autenticação. Tente novamente.')
            break
          case 'OAuthAccountNotLinked':
            errorMessage = '❌ Conta não vinculada. Use o mesmo método de login anterior.'
            setGoogleError('Esta conta Google não está vinculada. Use o método de login original.')
            break
          case 'EmailSignin':
            errorMessage = '❌ Erro no login por email.'
            setGoogleError('Problema com a verificação do email.')
            break
          case 'CredentialsSignin':
            errorMessage = '❌ Credenciais inválidas.'
            setGoogleError('Credenciais de login inválidas.')
            break
          case 'SessionRequired':
            errorMessage = '❌ Sessão necessária.'
            setGoogleError('É necessário fazer login para acessar esta página.')
            break
          default:
            errorMessage = `❌ Erro desconhecido: ${result.error}`
            setGoogleError('Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte.')
        }
        
        toast.error(errorMessage, { id: 'google-login' })
      } else if (result?.ok) {
        toast.success('Login realizado com sucesso!', { id: 'google-login' })
        // Redirecionar manualmente após sucesso
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Google login error:', error)
      toast.error('❌ Erro inesperado ao fazer login com Google', { id: 'google-login' })
      setGoogleError('Erro inesperado. Verifique sua conexão com a internet e tente novamente.')
    } finally {
      setIsGoogleLoading(false)
    }
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
          <p className="text-slate-400">Faça login para continuar</p>
        </div>

        {/* Login Form */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-blue-900 z-5 pointer-events-none" style={{ color: '#1e3a8a' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-16 pr-4 py-4 bg-gray-50 border-3 border-gray-600 rounded-lg text-gray-900 placeholder-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 font-bold text-lg shadow-lg"
                  placeholder="Digite seu email aqui"
                  required
                  style={{ color: '#1f2937', backgroundColor: '#f9fafb' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-blue-900 z-5 pointer-events-none" style={{ color: '#1e3a8a' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-16 pr-16 py-4 bg-gray-50 border-3 border-gray-600 rounded-lg text-gray-900 placeholder-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 font-bold text-lg shadow-lg"
                  placeholder="Digite sua senha aqui"
                  required
                  style={{ color: '#1f2937', backgroundColor: '#f9fafb' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-2 bg-gray-200 hover:bg-gray-300 rounded-full shadow-lg border-2 border-gray-400"
                >
                  {showPassword ? 
                    <EyeOff className="h-6 w-6 text-blue-900" style={{ color: '#1e3a8a' }} /> : 
                    <Eye className="h-6 w-6 text-blue-900" style={{ color: '#1e3a8a' }} />
                  }
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              onClick={() => console.log('🖱️ BOTÃO ENTRAR CLICADO!')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <div className="spinner" />
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-slate-600"></div>
            <span className="px-4 text-sm text-slate-400">ou</span>
            <div className="flex-1 border-t border-slate-600"></div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isGoogleLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                Verificando...
              </>
            ) : (
              'Entrar com Google'
            )}
          </button>

          {/* Google Error Display */}
          {googleError && (
            <div className="mt-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-400">
                    Erro no Login Google
                  </h3>
                  <p className="mt-1 text-sm text-red-300">
                    {googleError}
                  </p>
                  <div className="mt-3">
                    <button
                      onClick={() => setGoogleError(null)}
                      className="text-xs text-red-400 hover:text-red-300 underline"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Demo Accounts */}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link 
            href="/"
            className="text-slate-400 hover:text-slate-300 text-sm transition-colors"
          >
            ← Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  )
}
