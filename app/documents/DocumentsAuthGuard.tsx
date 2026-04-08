'use client'

import { useSession, signIn } from 'next-auth/react'
import { Loading } from '@/components/ui/Loading'
import { Button } from '@/components/ui/Button'

export default function DocumentsAuthGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loading size="lg" text="Autenticando..." />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-4">
        <h1 className="text-2xl font-bold mb-4 font-outfit text-primary">Acesso Restrito</h1>
        <p className="text-slate-400 mb-6 text-center max-w-md font-outfit">
          Você precisa estar autenticado para acessar os documentos e formulários do sistema.
        </p>
        <Button onClick={() => signIn()} variant="primary" size="lg">
          Fazer Login agora
        </Button>
      </div>
    )
  }

  return <>{children}</>
}
