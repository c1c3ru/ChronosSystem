export type Role = 'ADMIN' | 'SUPERVISOR' | 'EMPLOYEE'

export const VALID_ROLES: Role[] = ['ADMIN', 'SUPERVISOR', 'EMPLOYEE']

// Rotas públicas com match exato
export const PUBLIC_ROUTES = [
  '/',
  '/auth/signin',
  '/auth/recover',
  '/auth/error',
  '/kiosk',
  '/auth/reset-password',
  '/unauthorized',
] as const

// Rotas públicas por prefixo
export const PUBLIC_PREFIXES = [
  '/api/auth',
  '/api/kiosk',
  '/api/reset-password',
  '/_next',
  '/favicon.ico',
  '/assets',
  '/images',
] as const

export const ADMIN_ONLY_PREFIXES = ['/admin', '/dashboard'] as const
export const EMPLOYEE_ONLY_PREFIXES = ['/employee'] as const

export const ADMIN_API_PREFIXES = ['/api/users', '/api/machines', '/api/dashboard'] as const

export function isValidRole(role: unknown): role is Role {
  return typeof role === 'string' && (VALID_ROLES as readonly string[]).includes(role)
}

export function isPublicPath(pathname: string) {
  return (
    (PUBLIC_ROUTES as readonly string[]).includes(pathname) ||
    (PUBLIC_PREFIXES as readonly string[]).some((prefix) => pathname.startsWith(prefix)) ||
    pathname.startsWith('/auth/complete-profile')
  )
}

export function isAdminOnlyPath(pathname: string) {
  return (ADMIN_ONLY_PREFIXES as readonly string[]).some((prefix) => pathname.startsWith(prefix))
}

export function isEmployeeOnlyPath(pathname: string) {
  return (EMPLOYEE_ONLY_PREFIXES as readonly string[]).some((prefix) => pathname.startsWith(prefix))
}

export function isAdminApiPath(pathname: string) {
  return (ADMIN_API_PREFIXES as readonly string[]).some((prefix) => pathname.startsWith(prefix))
}
