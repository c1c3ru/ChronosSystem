import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Chronos System - Sistema de Ponto Eletrônico',
  description: 'Sistema moderno de registro de ponto eletrônico para estagiários',
  keywords: ['ponto eletrônico', 'registro', 'estagiários', 'controle de ponto'],
  authors: [{ name: 'Chronos System' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#10B981',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
