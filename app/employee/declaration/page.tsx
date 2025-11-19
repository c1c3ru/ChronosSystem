'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loading } from '@/components/ui/Loading'
import { AttendanceDeclarationForm } from '@/components/AttendanceDeclarationForm'

export default function DeclarationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return <Loading />
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Declaração de Participação
          </h1>
          <p className="text-neutral-400">
            Gere e exporte sua declaração de participação em experiência de extensão, iniciação científica ou monitoria.
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-neutral-800 rounded-lg shadow-xl p-6 border border-neutral-700">
          <AttendanceDeclarationForm
            userId={session.user.id}
            userName={session.user.name || 'Usuário'}
            userEmail={session.user.email || ''}
          />
        </div>

        {/* Informações */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
            <h3 className="text-white font-semibold mb-2">📋 Preenchimento</h3>
            <p className="text-sm text-neutral-400">
              Preencha todos os campos do formulário com as informações corretas.
            </p>
          </div>

          <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
            <h3 className="text-white font-semibold mb-2">📄 Exportação</h3>
            <p className="text-sm text-neutral-400">
              Clique em &quot;Exportar PDF&quot; para gerar e imprimir o documento.
            </p>
          </div>

          <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
            <h3 className="text-white font-semibold mb-2">✅ Assinatura</h3>
            <p className="text-sm text-neutral-400">
              Imprima e obtenha a assinatura do declarante antes de submeter.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
