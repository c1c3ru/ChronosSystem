// Domínios de email autorizados a logar via Google OAuth.
// Configurável via GOOGLE_ALLOWED_EMAIL_DOMAINS (lista separada por vírgula).
//   - ifce.edu.br        -> servidores/professores do IFCE
//   - aluno.ifce.edu.br  -> exclusivo para alunos do IFCE
//   - aluno.ce.gov.br    -> alunos da rede estadual do Ceará (SEDUC-CE) — também
//                           fazem estágio aqui e não têm email institucional @ifce
//   - gmail.com / googlemail.com -> contas Google pessoais (estagiários sem email
//                           institucional ativo). O Google é a autoridade desses
//                           domínios, então o email_verified continua confiável.
export const DEFAULT_GOOGLE_ALLOWED_EMAIL_DOMAINS =
  'ifce.edu.br,aluno.ifce.edu.br,aluno.ce.gov.br,gmail.com,googlemail.com'

// Emails específicos autorizados mesmo fora dos domínios acima.
// Configurável via GOOGLE_ALLOWED_EMAILS (lista separada por vírgula).
export const DEFAULT_GOOGLE_ALLOWED_EMAILS = 'cicerosilva.ifce@gmail.com'

export function parseList(value: string | undefined, fallback: string): string[] {
  return (value || fallback)
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
}

export function getAllowedGoogleEmailDomains(env: NodeJS.ProcessEnv = process.env): string[] {
  return parseList(env.GOOGLE_ALLOWED_EMAIL_DOMAINS, DEFAULT_GOOGLE_ALLOWED_EMAIL_DOMAINS)
}

export function getAllowedGoogleEmails(env: NodeJS.ProcessEnv = process.env): string[] {
  return parseList(env.GOOGLE_ALLOWED_EMAILS, DEFAULT_GOOGLE_ALLOWED_EMAILS)
}

export function isGoogleEmailAllowed(
  email: string | null | undefined,
  allowedDomains: string[],
  allowedEmails: string[]
): boolean {
  const normalizedEmail = email?.trim().toLowerCase()
  if (!normalizedEmail) return false

  const emailDomain = normalizedEmail.split('@')[1]
  return (
    (!!emailDomain && allowedDomains.includes(emailDomain)) ||
    allowedEmails.includes(normalizedEmail)
  )
}
