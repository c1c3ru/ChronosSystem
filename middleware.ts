import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { getSecurityHeaders } from '@/lib/security-headers'
import { logger } from '@/lib/logger'

// Definição centralizada de rotas públicas (usada no callback authorized)
const PUBLIC_ROUTES = [
  '/',
  '/auth/signin',
  '/auth/signup',
  '/auth/complete-profile',
  '/kiosk',
  '/test-form',
  '/demo-form'
]

const PUBLIC_API_PREFIXES = [
  '/api/auth/',
  '/api/health',
  '/api/kiosk/'
]

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Se não há token, o callback authorized já tratou o redirecionamento
    if (!token) {
      return NextResponse.next()
    }

    // ========================================
    // VERIFICAÇÃO DE TOKEN EXPIRADO
    // ========================================
    const tokenExp = token.exp as number | undefined
    if (tokenExp) {
      const now = Math.floor(Date.now() / 1000)
      if (tokenExp < now) {
        logger.security('Token expired', { userId: token.sub, exp: tokenExp })
        const signInUrl = new URL('/auth/signin', req.url)
        signInUrl.searchParams.set('error', 'SessionExpired')
        signInUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(signInUrl)
      }
    }

    // ========================================
    // EXTRAÇÃO DE DADOS DO TOKEN
    // ========================================
    const profileComplete = token.profileComplete as boolean
    const role = token.role as string

    logger.debug('Middleware: User authenticated', {
      pathname,
      role,
      profileComplete,
      userId: token.sub
    })

    // ========================================
    // VERIFICAÇÃO DE ROLE VÁLIDO
    // ========================================
    if (!role || !['ADMIN', 'SUPERVISOR', 'EMPLOYEE'].includes(role)) {
      logger.security('Invalid role detected', { userId: token.sub, role })
      const signInUrl = new URL('/auth/signin', req.url)
      signInUrl.searchParams.set('error', 'InvalidRole')
      return NextResponse.redirect(signInUrl)
    }

    // ========================================
    // VERIFICAÇÃO DE PERFIL COMPLETO (CONSOLIDADA)
    // ========================================
    // Se o perfil NÃO está completo
    if (profileComplete === false) {
      // Permitir acesso apenas à página de completar perfil
      if (pathname !== '/auth/complete-profile') {
        logger.debug('Incomplete profile, redirecting', {
          userId: token.sub,
          pathname
        })
        const completeProfileUrl = new URL('/auth/complete-profile', req.url)
        completeProfileUrl.searchParams.set('reason', 'incomplete')
        return NextResponse.redirect(completeProfileUrl)
      }
      // Se já está na página de completar perfil, permitir acesso
      return NextResponse.next()
    }

    // Se o perfil ESTÁ completo e o usuário está na página de completar perfil
    if (profileComplete === true && pathname === '/auth/complete-profile') {
      logger.debug('Profile already complete, redirecting to dashboard', {
        userId: token.sub,
        role
      })
      // Verificar role ANTES de redirecionar para evitar loops
      if (role === 'ADMIN' || role === 'SUPERVISOR') {
        return NextResponse.redirect(new URL('/admin', req.url))
      } else if (role === 'EMPLOYEE') {
        return NextResponse.redirect(new URL('/employee', req.url))
      }
    }

    // ========================================
    // REDIRECIONAMENTO DE /DASHBOARD PARA DASHBOARD ESPECÍFICO
    // ========================================
    if (pathname === '/dashboard') {
      logger.debug('Redirecting from /dashboard to role-specific dashboard', {
        userId: token.sub,
        role
      })
      if (role === 'ADMIN' || role === 'SUPERVISOR') {
        return NextResponse.redirect(new URL('/admin', req.url))
      } else if (role === 'EMPLOYEE') {
        return NextResponse.redirect(new URL('/employee', req.url))
      }
    }

    // ========================================
    // CONTROLE DE ACESSO BASEADO EM ROLES
    // ========================================
    // Definição de rotas por role
    const adminOnlyRoutes = ['/admin']
    const employeeOnlyRoutes = ['/employee']
    const supervisorRoutes = ['/admin'] // Supervisores também acessam /admin

    // Verificar acesso a rotas de ADMIN
    if (adminOnlyRoutes.some(route => pathname.startsWith(route))) {
      if (!['ADMIN', 'SUPERVISOR'].includes(role)) {
        logger.security('Unauthorized access attempt to admin route', {
          userId: token.sub,
          role,
          pathname
        })
        const unauthorizedUrl = new URL('/unauthorized', req.url)
        unauthorizedUrl.searchParams.set('reason', 'role')
        unauthorizedUrl.searchParams.set('required', 'ADMIN')
        return NextResponse.redirect(unauthorizedUrl)
      }
    }

    // Verificar acesso a rotas de EMPLOYEE (apenas EMPLOYEE)
    if (employeeOnlyRoutes.some(route => pathname.startsWith(route))) {
      if (role !== 'EMPLOYEE') {
        logger.security('Unauthorized access attempt to employee route', {
          userId: token.sub,
          role,
          pathname
        })
        const unauthorizedUrl = new URL('/unauthorized', req.url)
        unauthorizedUrl.searchParams.set('reason', 'role')
        unauthorizedUrl.searchParams.set('required', 'EMPLOYEE')
        return NextResponse.redirect(unauthorizedUrl)
      }
    }

    // ========================================
    // PROTEÇÃO DE APIs ADMINISTRATIVAS
    // ========================================
    if (
      pathname.startsWith('/api/users') ||
      pathname.startsWith('/api/machines') ||
      pathname.startsWith('/api/dashboard')
    ) {
      if (!['ADMIN', 'SUPERVISOR'].includes(role)) {
        logger.security('Unauthorized API access attempt', {
          userId: token.sub,
          role,
          pathname
        })
        return NextResponse.json(
          { error: 'Não autorizado', reason: 'insufficient_permissions' },
          { status: 401 }
        )
      }
    }

    // ========================================
    // APLICAR HEADERS DE SEGURANÇA
    // ========================================
    const response = NextResponse.next()
    const securityHeaders = getSecurityHeaders()
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    logger.debug('Security headers applied', { pathname })

    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Permitir acesso às rotas públicas (definição centralizada)
        if (PUBLIC_ROUTES.includes(pathname)) {
          return true
        }

        // Permitir acesso a rotas públicas que começam com prefixos específicos
        if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
          return true
        }

        // Permitir acesso a APIs públicas
        if (PUBLIC_API_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
          return true
        }

        // Outras rotas requerem token
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - icon files (PWA icons)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|icon-.*\\.png|.*\\.svg|public).*)',
  ],
}
