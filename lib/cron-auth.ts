import crypto from 'crypto'
import { NextRequest } from 'next/server'

export type CronAuthResult =
  | { authorized: true }
  | { authorized: false; reason: 'missing_secret' }
  | { authorized: false; reason: 'missing_header' }
  | { authorized: false; reason: 'invalid_token' }

// \s* (não \s+): "Bearer" sem nada depois também precisa cair para string
// vazia — com \s+ o próprio literal "Bearer" (sem espaço após, como o Web
// Headers normaliza ao remover espaço em branco no final do valor) escaparia
// do replace e seria tratado como se fosse o token.
const BEARER_PREFIX_RE = /^Bearer\s*/i

/**
 * Extrai o token de um header Authorization, removendo o prefixo "Bearer "
 * (case-insensitive, se presente) e espaços extras nas bordas. Robusto a
 * variações como "Bearer  <token>  " (espaços extras), "bearer <token>"
 * (case diferente) ou "Bearer" sem token nenhum; retorna string vazia se não
 * sobrar nada utilizável.
 */
function extractBearerToken(authHeader: string): string {
  return authHeader.trim().replace(BEARER_PREFIX_RE, '').trim()
}

/**
 * Valida o Bearer token de uma requisição de cron contra process.env.CRON_SECRET.
 *
 * Fail-closed por design: sem CRON_SECRET configurado, nenhuma requisição é
 * autorizada — mas o motivo ('missing_secret') é reportado separadamente de
 * um token incorreto/ausente, para que o endpoint responda 500 (erro de
 * configuração do servidor) em vez de 401. Isso distingue "a Vercel está sem
 * a variável de ambiente" (bug de config, 500) de "o secret enviado está
 * errado" (401) — os dois cenários antes eram indistinguíveis pelo chamador.
 *
 * `.headers.get()` do Web Headers já é case-insensitive por spec (Fetch
 * Standard) para o NOME do header, então 'authorization' cobre também
 *'Authorization' sem necessidade de checar as duas variantes.
 *
 * A comparação usa crypto.timingSafeEqual (mesmo padrão de
 * lib/qr-security.ts) para não vazar o segredo por diferença de tempo de
 * resposta, e é feita sobre o TOKEN já extraído (sem o prefixo "Bearer "),
 * não sobre a string bruta do header — isso é o que torna a validação
 * resiliente a espaços extras no header ou no valor da env var.
 */
export function checkCronAuth(request: NextRequest): CronAuthResult {
  // .trim() cobre o caso comum de a env var ter sido colada com um \n ou
  // espaço no final na Vercel — string "quase vazia" que passaria no `if`
  // sem o trim, mas nunca bateria com nenhum token real.
  const cronSecret = process.env.CRON_SECRET?.trim()
  if (!cronSecret) {
    return { authorized: false, reason: 'missing_secret' }
  }

  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return { authorized: false, reason: 'missing_header' }
  }

  const token = extractBearerToken(authHeader)
  if (!token) {
    return { authorized: false, reason: 'missing_header' }
  }

  const expectedBuffer = Buffer.from(cronSecret)
  const receivedBuffer = Buffer.from(token)

  const isValid =
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)

  return isValid ? { authorized: true } : { authorized: false, reason: 'invalid_token' }
}
