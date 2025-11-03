'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Shield, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { TwoFactorSetup } from '@/components/two-factor-setup'
import Link from 'next/link'

export default function SecurityPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Verificar se o usuário tem permissão (admin ou supervisor)
    const userRole = (session.user as any)?.role
    if (!['ADMIN', 'SUPERVISOR'].includes(userRole)) {
      router.push('/employee')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Configurações de Segurança</h1>
                  <p className="text-slate-400">Gerencie a segurança da sua conta</p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-white font-medium">{session.user.name}</p>
              <p className="text-slate-400 text-sm">{(session.user as any).role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Informações da conta */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Informações da Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-300">Email</label>
                  <p className="text-white">{session.user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300">Função</label>
                  <p className="text-white">{(session.user as any).role}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300">Nome</label>
                  <p className="text-white">{session.user.name || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300">ID do Usuário</label>
                  <p className="text-slate-400 font-mono text-sm">{session.user.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuração 2FA */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
            <TwoFactorSetup />
          </div>

          {/* Outras configurações de segurança */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Outras Configurações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div>
                    <h3 className="font-medium text-white">Sessões Ativas</h3>
                    <p className="text-sm text-slate-400">Gerencie suas sessões de login</p>
                  </div>
                  <Button variant="secondary" disabled>
                    Em breve
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div>
                    <h3 className="font-medium text-white">Logs de Atividade</h3>
                    <p className="text-sm text-slate-400">Visualize suas atividades recentes</p>
                  </div>
                  <Link href="/admin/audit">
                    <Button variant="secondary">
                      Ver Logs
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div>
                    <h3 className="font-medium text-white">Alterar Senha</h3>
                    <p className="text-sm text-slate-400">Atualize sua senha de acesso</p>
                  </div>
                  <Button variant="secondary" disabled>
                    Em breve
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dicas de segurança */}
          <Card className="bg-blue-500/10 border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Dicas de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Use senhas fortes e únicas para cada conta</li>
                <li>• Habilite a autenticação de dois fatores (2FA) sempre que possível</li>
                <li>• Mantenha seus aplicativos autenticadores atualizados</li>
                <li>• Não compartilhe seus códigos 2FA com ninguém</li>
                <li>• Faça logout de dispositivos que não usa mais</li>
                <li>• Monitore regularmente suas atividades de login</li>
              </ul>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
