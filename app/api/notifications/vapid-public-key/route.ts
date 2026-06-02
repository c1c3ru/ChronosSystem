import { NextResponse } from 'next/server'

/**
 * GET /api/notifications/vapid-public-key
 * Retorna a chave pública VAPID para o cliente iniciar a subscription de push.
 * Exposta sem autenticação pois é uma chave pública.
 */
export async function GET() {
  const publicKey = process.env.VAPID_PUBLIC_KEY

  if (!publicKey) {
    return NextResponse.json({ error: 'Push notifications não configuradas' }, { status: 503 })
  }

  return NextResponse.json({ publicKey })
}
