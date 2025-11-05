import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    // Verificar se as variáveis estão definidas
    const config = {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'DEFINIDO' : 'NÃO DEFINIDO',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'DEFINIDO' : 'NÃO DEFINIDO',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'DEFINIDO' : 'NÃO DEFINIDO',
      providers: authOptions.providers?.length || 0,
      googleProviderExists: authOptions.providers?.some(p => p.id === 'google') || false
    }
    
    console.log('🔍 [TEST] Configuração Google:', config)
    
    return NextResponse.json(config)
  } catch (error) {
    console.error('❌ [TEST] Erro ao verificar config:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
