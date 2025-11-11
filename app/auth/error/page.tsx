'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, ArrowLeft, Mail, Shield } from 'lucide-react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams?.get('error') || null

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'AccessDenied':
        return {
          title: 'Acesso Negado - IFCE Maracanaú',
          message: 'Seu email não está cadastrado no sistema Chronos.',
          description: 'Apenas funcionários, professores e estudantes pré-cadastrados pelo IFCE campus Maracanaú podem acessar o sistema. Entre em contato com a administração para solicitar seu cadastro.',
          icon: Shield
        }
      case 'Configuration':
        return {
          title: 'Erro de Configuração',
          message: 'Há um problema na configuração do sistema.',
          description: 'Entre em contato com o suporte técnico.',
          icon: AlertCircle
        }
      case 'Verification':
        return {
          title: 'Erro de Verificação',
          message: 'Não foi possível verificar sua conta.',
          description: 'Tente novamente ou entre em contato com o suporte.',
          icon: Mail
        }
      default:
        return {
          title: 'Erro de Autenticação',
          message: 'Ocorreu um erro durante o processo de login.',
          description: 'Tente novamente ou entre em contato com o suporte.',
          icon: AlertCircle
        }
    }
  }

  const errorInfo = getErrorMessage(error)
  const IconComponent = errorInfo.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-red-500/20 rounded-full p-4">
              <IconComponent className="h-8 w-8 text-red-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-4">
            {errorInfo.title}
          </h1>

          {/* Message */}
          <p className="text-slate-300 mb-4">
            {errorInfo.message}
          </p>

          {/* Description */}
          <p className="text-slate-400 text-sm mb-8">
            {errorInfo.description}
          </p>

          {/* Actions */}
          <div className="space-y-4">
            <Link
              href="/auth/signin"
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Link>

            <Link
              href="/"
              className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Voltar ao Início
            </Link>
          </div>

          {/* Contact Info */}
          {error === 'AccessDenied' && (
            <div className="mt-8 p-4 bg-slate-900/50 rounded-lg border border-slate-600">
              <h3 className="text-sm font-medium text-slate-300 mb-2">
                Como solicitar acesso?
              </h3>
              <div className="text-xs text-slate-400 space-y-2">
                <p>• <strong>Funcionários/Professores:</strong> Procure o setor de RH ou TI</p>
                <p>• <strong>Estudantes:</strong> Procure o Registro Acadêmico</p>
                <p>• <strong>Terceirizados:</strong> Procure a Administração</p>
                <p className="mt-2 text-slate-500">
                  Informe seu email Google institucional para cadastro no sistema.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-slate-700/50 rounded-full p-4">
              <AlertCircle className="h-8 w-8 text-slate-400 animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Carregando...</h1>
          <p className="text-slate-400">Verificando erro de autenticação...</p>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ErrorContent />
    </Suspense>
  )
}
