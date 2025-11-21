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
        redirect('/auth/signin')
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
