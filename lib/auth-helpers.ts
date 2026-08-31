import { Session } from 'next-auth'
import { UnauthorizedError, ForbiddenError } from './errors'

/**
 * Authentication and authorization helpers
 *
 * Provides reusable functions for checking user authentication and permissions.
 */

/**
 * Ensures user is authenticated
 *
 * @param session - NextAuth session object
 * @throws UnauthorizedError if session is null
 * @returns The session object
 *
 * @example
 * ```typescript
 * const session = await getServerSession(authOptions)
 * requireAuth(session)
 * // Now TypeScript knows session is not null
 * ```
 */
export function requireAuth(session: Session | null): Session {
  if (!session) {
    throw new UnauthorizedError('Você precisa estar autenticado para acessar este recurso')
  }
  return session
}

/**
 * Ensures user has one of the required roles
 *
 * @param session - NextAuth session object (can be null)
 * @param roles - Array of allowed roles
 * @throws UnauthorizedError if session is null
 * @throws ForbiddenError if user doesn't have required role
 * @returns The session object
 *
 * @example
 * ```typescript
 * const session = await getServerSession(authOptions)
 * requireRole(session, ['ADMIN', 'SUPERVISOR'])
 * ```
 */
function requireRole(session: Session | null, roles: string[]): Session {
  const authenticatedSession = requireAuth(session)

  if (!roles.includes(authenticatedSession.user.role)) {
    throw new ForbiddenError('Você não tem permissão para acessar este recurso', {
      requiredRoles: roles,
      userRole: authenticatedSession.user.role,
    })
  }

  return authenticatedSession
}

/**
 * Checks if user has admin or supervisor role
 *
 * @param session - NextAuth session object
 * @returns The session object
 *
 * @example
 * ```typescript
 * const session = await getServerSession(authOptions)
 * requireAdmin(session)
 * ```
 */
export function requireAdmin(session: Session | null): Session {
  return requireRole(session, ['ADMIN', 'SUPERVISOR'])
}
