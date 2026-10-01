import {
  getAllowedGoogleEmailDomains,
  getAllowedGoogleEmails,
  isGoogleEmailAllowed,
} from '@/lib/google-email-allowlist'

describe('google-email-allowlist', () => {
  const domains = getAllowedGoogleEmailDomains({} as NodeJS.ProcessEnv)
  const emails = getAllowedGoogleEmails({} as NodeJS.ProcessEnv)

  it.each([
    'fulano@gmail.com',
    'Fulano@GMAIL.com',
    'fulano@googlemail.com',
    'servidor@ifce.edu.br',
    'aluno@aluno.ifce.edu.br',
    'aluno@aluno.ce.gov.br',
  ])('permite %s com a configuração padrão', (email) => {
    expect(isGoogleEmailAllowed(email, domains, emails)).toBe(true)
  })

  it.each(['fulano@hotmail.com', 'x@evil-gmail.com', 'x@gmail.com.evil.io', '', null, undefined])(
    'bloqueia %s com a configuração padrão',
    (email) => {
      expect(isGoogleEmailAllowed(email, domains, emails)).toBe(false)
    }
  )

  it('respeita a lista de domínios da variável de ambiente', () => {
    const custom = getAllowedGoogleEmailDomains({
      GOOGLE_ALLOWED_EMAIL_DOMAINS: ' IFCE.edu.br , ',
    } as unknown as NodeJS.ProcessEnv)
    expect(custom).toEqual(['ifce.edu.br'])
    expect(isGoogleEmailAllowed('fulano@gmail.com', custom, [])).toBe(false)
  })

  it('permite email específico da allowlist fora dos domínios', () => {
    expect(isGoogleEmailAllowed('chefe@outlook.com', ['ifce.edu.br'], ['chefe@outlook.com'])).toBe(
      true
    )
  })
})
