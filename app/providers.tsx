'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'sonner'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { OfflineIndicator } from '@/components/OfflineIndicator'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <OfflineIndicator />
        {children}
        {/* Cores por tipo (verde = sucesso, vermelho = erro). O estilo antigo usava
            hsl() sobre variáveis RGB e deixava todo aviso bege com texto amarelo. */}
        <Toaster position="top-right" theme="dark" richColors closeButton />
      </SessionProvider>
    </ErrorBoundary>
  )
}
