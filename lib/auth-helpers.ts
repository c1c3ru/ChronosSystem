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
export function requireRole(session: Session | null, roles: string[]): Session {
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

/**
 * Checks if user can access a specific user's data
 *
 * @param session - NextAuth session object
 * @param targetUserId - ID of the user whose data is being accessed
 * @throws ForbiddenError if user is not admin and not accessing their own data
 * @returns The session object
 *
 * @example
 * ```typescript
 * const session = await getServerSession(authOptions)
 * requireUserAccess(session, userId)
 * ```
 */
export function requireUserAccess(session: Session | null, targetUserId: string): Session {
  const authenticatedSession = requireAuth(session)

  const isAdmin = ['ADMIN', 'SUPERVISOR'].includes(authenticatedSession.user.role)
  const isOwnData = authenticatedSession.user.id === targetUserId

  if (!isAdmin && !isOwnData) {
    throw new ForbiddenError('Você só pode acessar seus próprios dados')
  }

  return authenticatedSession
}

/**
 * Checks if user has a specific role (non-throwing)
 *
 * @param session - NextAuth session object
 * @param roles - Array of roles to check
 * @returns true if user has one of the roles, false otherwise
 */
export function hasRole(session: Session | null, roles: string[]): boolean {
  if (!session) return false
  return roles.includes(session.user.role)
}

/**
 * Checks if user is admin or supervisor (non-throwing)
 *
 * @param session - NextAuth session object
 * @returns true if user is admin or supervisor
 */
export function isAdmin(session: Session | null): boolean {
  return hasRole(session, ['ADMIN', 'SUPERVISOR'])
}
