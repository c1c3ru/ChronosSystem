'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ShieldAlert, ArrowLeft, Home, UserX, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

export default function UnauthorizedPage() {
    const searchParams = useSearchParams()
    const reason = searchParams.get('reason')
    const required = searchParams.get('required')

    // Determinar mensagem baseada no motivo
    const getMessage = () => {
        if (reason === 'role') {
            return {
                title: 'Permissão Insuficiente',
                description: required
                    ? `Esta página requer permissão de ${required}. Seu perfil atual não tem acesso a este recurso.`
                    : 'Você não tem a permissão necessária para acessar esta página.',
                icon: Lock
            }
        }

        if (reason === 'profile') {
            return {
                title: 'Perfil Incompleto',
                description: 'Complete seu perfil antes de acessar esta área do sistema.',
                icon: UserX
            }
        }

        // Mensagem padrão
        return {
            title: 'Acesso Negado',
            description: 'Você não tem permissão para acessar esta página.',
            icon: ShieldAlert
        }
    }

    const { title, description, icon: Icon } = getMessage()

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center p-4">
            <Card variant="elevated" className="max-w-md w-full">
                <CardContent className="p-8 text-center">
                    <div className="mb-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 mb-4">
                            <Icon className="h-10 w-10 text-red-500" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {title}
                        </h1>
                        <p className="text-neutral-400">
                            {description}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Button asChild className="w-full" variant="primary">
                            <Link href="/">
                                <Home className="h-4 w-4 mr-2" />
                                Voltar para Início
                            </Link>
                        </Button>
                        <Button asChild className="w-full" variant="secondary">
                            <Link href="/auth/signin">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Fazer Login
                            </Link>
                        </Button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-neutral-700">
                        <p className="text-sm text-neutral-500">
                            Se você acredita que isso é um erro, entre em contato com o administrador do sistema.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

