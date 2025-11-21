import Link from 'next/link'
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center p-4">
            <Card variant="elevated" className="max-w-md w-full">
                <CardContent className="p-8 text-center">
                    <div className="mb-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 mb-4">
                            <ShieldAlert className="h-10 w-10 text-red-500" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Acesso Negado
                        </h1>
                        <p className="text-neutral-400">
                            Você não tem permissão para acessar esta página.
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
