import { InternshipRegistrationForm } from '@/components/InternshipRegistrationForm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const metadata = {
    title: 'Solicitação de Cadastro de Estágio | ChronosSystem',
    description: 'Formulário de solicitação de cadastro no estágio'
}

export default async function InternshipRegistrationPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-4">
                <h1 className="text-2xl font-bold mb-4 font-outfit">Sessão Expirada</h1>
                <p className="text-slate-400 mb-6 text-center max-w-md font-outfit">
                    Sua sessão expirou ou você não está autenticado.
                </p>
                <div className="flex gap-4">
                  <a href="/auth/signin" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-bold transition-colors">
                    Fazer Login
                  </a>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-50 py-8">
            <div className="container mx-auto px-4">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-neutral-900">
                        Solicitação de Cadastro de Estágio
                    </h1>
                    <p className="text-neutral-600 mt-2">
                        Preencha o formulário abaixo para solicitar o cadastro do seu estágio
                    </p>
                </div>

                <InternshipRegistrationForm
                    userId={session.user.id}
                    userName={session.user.name || ''}
                    userEmail={session.user.email || ''}
                />
            </div>
        </div>
    )
}
