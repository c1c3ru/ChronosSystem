/**
 * Route prefetching utilities
 * Provides helpers for intelligent route prefetching based on user role and navigation patterns
 */

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Routes to prefetch based on user role
 */
export const ROLE_ROUTES = {
  ADMIN: [
    '/admin/dashboard',
    '/admin/users',
    '/admin/machines',
    '/admin/attendance',
    '/admin/reports',
  ],
  SUPERVISOR: ['/admin/dashboard', '/admin/attendance', '/admin/reports'],
  EMPLOYEE: ['/employee/dashboard', '/employee/attendance', '/employee/documents'],
} as const

/**
 * Critical routes that should be prefetched for all users
 */
export const CRITICAL_ROUTES = ['/api/auth/session', '/api/machines'] as const

/**
 * Hook to prefetch routes based on user role
 */
export function usePrefetchRoleRoutes(role?: string) {
  const router = useRouter()

  useEffect(() => {
    if (!role) return

    const routes = ROLE_ROUTES[role as keyof typeof ROLE_ROUTES] || []

    // Prefetch routes after a short delay to avoid blocking initial render
    const timeoutId = setTimeout(() => {
      routes.forEach((route) => {
        router.prefetch(route)
      })
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [role, router])
}

/**
 * Hook to prefetch critical data endpoints
 */
export function usePrefetchCriticalData() {
  useEffect(() => {
    // Prefetch critical API endpoints
    const timeoutId = setTimeout(() => {
      CRITICAL_ROUTES.forEach((route) => {
        fetch(route, { method: 'HEAD' }).catch(() => {
          // Silently fail - prefetch is optional
        })
      })
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [])
}

/**
 * Prefetch a route programmatically
 */
export function prefetchRoute(router: ReturnType<typeof useRouter>, route: string) {
  router.prefetch(route)
}

/**
 * Prefetch multiple routes
 */
export function prefetchRoutes(router: ReturnType<typeof useRouter>, routes: string[]) {
  routes.forEach((route) => router.prefetch(route))
}
