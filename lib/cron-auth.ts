import crypto from 'crypto'
import { NextRequest } from 'next/server'
import { apiLogger } from './logger'

/**
 * Valida o Bearer token de uma requisição de cron contra process.env.CRON_SECRET.
 *
 * Fail-closed por design: se CRON_SECRET não estiver configurado, retorna
 * false para QUALQUER requisição — os endpoints de cron nunca devem "abrir"
 * por ausência de configuração (e nunca devem depender de NODE_ENV para
 * decidir se validam ou não). A comparação usa crypto.timingSafeEqual (mesmo
 * padrão de lib/qr-security.ts) para não vazar o segredo por diferença de
 * tempo de resposta.
 */
export function isAuthorizedCronRequest(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    apiLogger.error('CRON_SECRET não configurado — recusando chamada a endpoint de cron', {
      path: request.nextUrl.pathname,
    })
    return false
  }

  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return false
  }

  const expectedBuffer = Buffer.from(`Bearer ${cronSecret}`)
  const receivedBuffer = Buffer.from(authHeader)

  return (
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  )
}
