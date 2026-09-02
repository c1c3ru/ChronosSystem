/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { checkCronAuth } from '@/lib/cron-auth'

const ENDPOINT = 'https://example.com/api/cron/daily-justification-check'
const ORIGINAL_CRON_SECRET = process.env.CRON_SECRET

function requestWithAuthHeader(headerValue?: string): NextRequest {
  const headers = new Headers()
  if (headerValue !== undefined) {
    headers.set('authorization', headerValue)
  }
  return new NextRequest(ENDPOINT, { headers })
}

describe('checkCronAuth', () => {
  afterEach(() => {
    if (ORIGINAL_CRON_SECRET === undefined) {
      delete process.env.CRON_SECRET
    } else {
      process.env.CRON_SECRET = ORIGINAL_CRON_SECRET
    }
  })

  it('autoriza quando o header é exatamente "Bearer <CRON_SECRET>"', () => {
    process.env.CRON_SECRET = 'SECRET_CERTA'
    const result = checkCronAuth(requestWithAuthHeader('Bearer SECRET_CERTA'))
    expect(result).toEqual({ authorized: true })
  })

  it('rejeita com invalid_token quando o secret enviado está errado', () => {
    process.env.CRON_SECRET = 'SECRET_CERTA'
    const result = checkCronAuth(requestWithAuthHeader('Bearer SECRET_ERRADA'))
    expect(result).toEqual({ authorized: false, reason: 'invalid_token' })
  })

  it('rejeita com missing_header quando não há header Authorization', () => {
    process.env.CRON_SECRET = 'SECRET_CERTA'
    const result = checkCronAuth(requestWithAuthHeader(undefined))
    expect(result).toEqual({ authorized: false, reason: 'missing_header' })
  })

  it('rejeita com missing_header quando o header é uma string vazia', () => {
    process.env.CRON_SECRET = 'SECRET_CERTA'
    const result = checkCronAuth(requestWithAuthHeader(''))
    expect(result).toEqual({ authorized: false, reason: 'missing_header' })
  })

  it('rejeita com missing_header quando o header só contém "Bearer" sem token', () => {
    process.env.CRON_SECRET = 'SECRET_CERTA'
    const result = checkCronAuth(requestWithAuthHeader('Bearer '))
    expect(result).toEqual({ authorized: false, reason: 'missing_header' })
  })

  it('rejeita com missing_secret quando CRON_SECRET não está definido', () => {
    delete process.env.CRON_SECRET
    const result = checkCronAuth(requestWithAuthHeader('Bearer QUALQUER_COISA'))
    expect(result).toEqual({ authorized: false, reason: 'missing_secret' })
  })

  it('rejeita com missing_secret quando CRON_SECRET é uma string vazia', () => {
    process.env.CRON_SECRET = ''
    const result = checkCronAuth(requestWithAuthHeader('Bearer QUALQUER_COISA'))
    expect(result).toEqual({ authorized: false, reason: 'missing_secret' })
  })

  it('rejeita com missing_secret quando CRON_SECRET é só espaços/quebra de linha', () => {
    process.env.CRON_SECRET = '   \n'
    const result = checkCronAuth(requestWithAuthHeader('Bearer QUALQUER_COISA'))
    expect(result).toEqual({ authorized: false, reason: 'missing_secret' })
  })

  it('é robusto a espaços extras em volta do token no header', () => {
    process.env.CRON_SECRET = 'SECRET_CERTA'
    const result = checkCronAuth(requestWithAuthHeader('Bearer    SECRET_CERTA   '))
    expect(result).toEqual({ authorized: true })
  })

  it('é robusto a variações de caixa no prefixo "Bearer"', () => {
    process.env.CRON_SECRET = 'SECRET_CERTA'
    const result = checkCronAuth(requestWithAuthHeader('bearer SECRET_CERTA'))
    expect(result).toEqual({ authorized: true })
  })

  it('ainda autoriza se o CRON_SECRET no servidor tiver espaço/quebra de linha colado por engano', () => {
    process.env.CRON_SECRET = 'SECRET_CERTA\n'
    const result = checkCronAuth(requestWithAuthHeader('Bearer SECRET_CERTA'))
    expect(result).toEqual({ authorized: true })
  })

  it('lê o header Authorization independentemente de maiúsculas/minúsculas no nome do header', () => {
    process.env.CRON_SECRET = 'SECRET_CERTA'
    const headers = new Headers()
    headers.set('Authorization', 'Bearer SECRET_CERTA')
    const request = new NextRequest(ENDPOINT, { headers })
    expect(checkCronAuth(request)).toEqual({ authorized: true })
  })
})
