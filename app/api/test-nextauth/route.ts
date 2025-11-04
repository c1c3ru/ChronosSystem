import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    // Verificar configuração do NextAuth
    const providers = authOptions.providers || []
    const googleProvider = providers.find((p: any) => p.id === 'google') as any
    
    const config = {
      totalProviders: providers.length,
      providerIds: providers.map((p: any) => p.id),
      googleProvider: googleProvider ? {
        id: googleProvider.id,
        name: googleProvider.name,
        type: googleProvider.type,
        hasClientId: !!(googleProvider as any).clientId,
        hasClientSecret: !!(googleProvider as any).clientSecret,
      } : null,
      envVars: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
        GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
      }
    }
    
    console.log('🔍 [NEXTAUTH TEST]', JSON.stringify(config, null, 2))
    
    return NextResponse.json(config)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    console.error('❌ [NEXTAUTH TEST] Erro:', errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
