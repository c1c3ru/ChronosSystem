import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Construir URL de autorização do Google manualmente
    const clientId = process.env.GOOGLE_CLIENT_ID
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
    
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    googleAuthUrl.searchParams.set('client_id', clientId!)
    googleAuthUrl.searchParams.set('redirect_uri', redirectUri)
    googleAuthUrl.searchParams.set('response_type', 'code')
    googleAuthUrl.searchParams.set('scope', 'openid email profile')
    googleAuthUrl.searchParams.set('state', 'test-state')
    
    console.log('🔍 [TEST] URL de autorização:', googleAuthUrl.toString())
    console.log('🔍 [TEST] Client ID:', clientId)
    console.log('🔍 [TEST] Redirect URI:', redirectUri)
    
    return NextResponse.json({
      authUrl: googleAuthUrl.toString(),
      clientId: clientId ? 'DEFINIDO' : 'NÃO DEFINIDO',
      redirectUri,
      nextauthUrl: process.env.NEXTAUTH_URL
    })
  } catch (error) {
    console.error('❌ [TEST] Erro:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
