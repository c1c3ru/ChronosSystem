import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { getSecurityHeaders } from '@/lib/security-headers'
import { logger } from '@/lib/logger'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Rotas que requerem autenticação
    const protectedRoutes = ['/admin', '/employee', '/api/users', '/api/machines', '/api/attendance', '/api/dashboard']

    // Verificar se a rota atual é protegida
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

    if (isProtectedRoute && !token) {
      // Redirecionar para login se não autenticado
      const signInUrl = new URL('/auth/signin', req.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }

    // Verificar se o perfil está completo (apenas para usuários autenticados)
    if (token) {
      const profileComplete = token.profileComplete as boolean
      const role = token.role as string

      logger.debug('Middleware: User authenticated', {
        pathname,
        role,
        profileComplete,
        userId: token.sub
      })

      // Verificar se o usuário tem role válido
      if (!role || !['ADMIN', 'SUPERVISOR', 'EMPLOYEE'].includes(role)) {
        logger.security('Invalid role detected', { userId: token.sub, role })
        return NextResponse.redirect(new URL('/auth/signin?error=InvalidRole', req.url))
      }

      // Verificar se perfil está completo (exceto na própria página de completar perfil)
      if (profileComplete === false && pathname !== '/auth/complete-profile') {
        logger.debug('Incomplete profile, redirecting', {
          userId: token.sub,
          pathname
        })
        return NextResponse.redirect(new URL('/auth/complete-profile', req.url))
      }

      // Debug: Log quando perfil está completo
      if (profileComplete === true) {
        logger.debug('Profile complete, allowing access', {
          pathname,
          role,
          userId: token.sub
        })
      }

      // Se usuário autenticado está na página inicial, redirecionar para dashboard apropriado
      if (pathname === '/') {
        logger.debug('Redirecting from home page', { role })

        // Redirecionamento baseado no role REAL do usuário
        if (role === 'ADMIN' || role === 'SUPERVISOR') {
          return NextResponse.redirect(new URL('/admin', req.url))
        } else if (role === 'EMPLOYEE') {
          return NextResponse.redirect(new URL('/employee', req.url))
        }
      }

      // Se o perfil está completo e está na página de completar perfil, redirecionar
      if (profileComplete === true && pathname === '/auth/complete-profile') {
        if (role === 'ADMIN' || role === 'SUPERVISOR') {
          return NextResponse.redirect(new URL('/admin', req.url))
        } else {
          return NextResponse.redirect(new URL('/employee', req.url))
        }
      }

      // Se o perfil não está completo e não está na página de completar perfil
      if (profileComplete === false && isProtectedRoute && pathname !== '/auth/complete-profile') {
        return NextResponse.redirect(new URL('/auth/complete-profile', req.url))
      }
    }

    // Rotas específicas para roles
    if (pathname.startsWith('/admin')) {
      if (!token || !['ADMIN', 'SUPERVISOR'].includes(token.role as string)) {
        // Redirecionar para página do employee se não for admin/supervisor
        return NextResponse.redirect(new URL('/employee', req.url))
      }

    }

    // APIs administrativas
    if (pathname.startsWith('/api/users') ||
      pathname.startsWith('/api/machines') ||
      pathname.startsWith('/api/dashboard')) {
      if (!token || !['ADMIN', 'SUPERVISOR'].includes(token.role as string)) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
      }
    }

    // Criar resposta com headers de segurança
    const response = NextResponse.next()

    // Aplicar headers de segurança completos
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

        // Permitir acesso às rotas públicas
        const publicRoutes = ['/', '/auth/signin', '/auth/signup', '/auth/complete-profile', '/kiosk']
        if (publicRoutes.includes(pathname)) {
          return true
        }

        // Permitir acesso a APIs públicas
        if (pathname.startsWith('/api/auth/') || pathname.startsWith('/api/health') || pathname.startsWith('/api/kiosk/')) {
          return true
        }

        // Outras rotas requerem token
        const hasAccess = !!token
        return hasAccess
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
