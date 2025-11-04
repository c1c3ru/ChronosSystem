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

      // Get session to check user role and profile completion
      const session = await getSession()
      
      if (session?.user) {
        console.log('Login success - User:', session.user)
        console.log('Login success - Role:', session.user.role)
        console.log('Login success - ProfileComplete:', session.user.profileComplete)
        
        // Check if profile is complete
        if (session.user.profileComplete === false) {
          router.push('/auth/complete-profile')
        } else if (session.user.role === 'ADMIN' || session.user.role === 'SUPERVISOR') {
          router.push('/admin')
        } else {
          router.push('/employee')
        }
        
        toast.success('Login realizado com sucesso!')
      }
    } catch (error) {
      toast.error('Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    const result = await signIn('google', { redirect: false })
    
    if (result?.ok) {
      // Após login com Google, verificar se precisa completar perfil
      const session = await getSession()
      
      if (session?.user) {
        const profileComplete = (session.user as any).profileComplete
        
        if (profileComplete === false) {
          // Redirecionar para completar perfil
          router.push('/auth/complete-profile')
        } else {
          // Redirecionar baseado no role
          if (session.user.role === 'ADMIN' || session.user.role === 'SUPERVISOR') {
            router.push('/admin')
          } else {
            router.push('/employee')
          }
        }
      }
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
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-700 z-10" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-400 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-3 focus:ring-blue-600 focus:border-blue-600 focus:bg-gray-50 transition-all duration-200 font-semibold text-base shadow-inner"
                  placeholder="Digite seu email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-700 z-10" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-14 py-4 bg-white border-2 border-gray-400 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-3 focus:ring-blue-600 focus:border-blue-600 focus:bg-gray-50 transition-all duration-200 font-semibold text-base shadow-inner"
                  placeholder="Digite sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 hover:text-black z-10 p-1"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
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
            className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
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
            Entrar com Google
          </button>

          {/* Demo Accounts */}
          <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-600">
            <h3 className="text-sm font-medium text-slate-300 mb-2">Contas de Demonstração:</h3>
            <div className="text-xs text-slate-400 space-y-1">
              <div>👤 Admin: admin@chronos.com / admin123</div>
              <div>👤 Supervisor: supervisor@chronos.com / supervisor123</div>
              <div>👤 Estagiário: maria@chronos.com / employee123</div>
            </div>
          </div>
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
