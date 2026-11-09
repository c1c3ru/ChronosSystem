/**
 * @jest-environment node
 */

/**
 * Valores colados no painel da Vercel podem vir com "\n" no fim. Com
 * SMTP_HOST="smtp.gmail.com\n" todo envio de e-mail falhava em
 * `getaddrinfo EBUSY` — lib/env.ts precisa entregar os valores aparados.
 */
describe('lib/env', () => {
  const originalEnv = process.env

  afterEach(() => {
    process.env = originalEnv
    jest.resetModules()
  })

  function loadEnv(overrides: Record<string, string>) {
    process.env = { ...originalEnv, ...overrides }
    jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.spyOn(console, 'log').mockImplementation(() => {})
    let loaded: typeof import('@/lib/env').env | undefined
    jest.isolateModules(() => {
      loaded = (jest.requireActual('@/lib/env') as typeof import('@/lib/env')).env
    })
    return loaded!
  }

  it('remove quebras de linha e espaços das pontas dos valores', () => {
    const env = loadEnv({
      SMTP_HOST: 'smtp.gmail.com\n',
      SMTP_USER: ' cti@example.com\n',
      SMTP_FROM: 'Chronos IFCE <cti@example.com>\n',
      GMAIL_REFRESH_TOKEN: '1//token\r\n',
    })

    expect(env.SMTP_HOST).toBe('smtp.gmail.com')
    expect(env.SMTP_USER).toBe('cti@example.com')
    expect(env.SMTP_FROM).toBe('Chronos IFCE <cti@example.com>')
    expect(env.GMAIL_REFRESH_TOKEN).toBe('1//token')
  })
})
