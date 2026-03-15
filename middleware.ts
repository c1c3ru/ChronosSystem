import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { getSecurityHeaders } from '@/lib/security-headers'
import { logger } from '@/lib/logger'

// Definição centralizada de rotas públicas (matches exactos)
const PUBLIC_ROUTES = [
  '/',
  '/auth/signin',
  '/auth/recover',
  '/auth/error',
  '/kiosk',
  '/auth/reset-password',
  '/unauthorized'
]

// Rotas / caminhos públicos (prefixos)
const PUBLIC_PREFIXES = [
  '/api/auth',
  '/api/kiosk',
  '/api/reset-password',
  '/_next',
  '/favicon.ico',
  '/assets',
  '/images'
]

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Se não tiver token, deixa passar (withAuth já bloqueou o que não é público)
    if (!token) {
      return NextResponse.next()
    }

    const role = token?.role as string
    const profileComplete = token?.profileComplete as boolean
    const tokenExp = token?.exp as number

    // CHECK TOKEN EXPIRATION
    if (tokenExp) {
      const now = Math.floor(Date.now() / 1000)
      if (tokenExp < now) {
        logger.security('Token expired', { userId: token.sub, exp: tokenExp })

        // Evitar loop infinito: só redireciona se não estiver nas rotas de auth
        if (!pathname.startsWith('/auth/') && !pathname.startsWith('/api/auth')) {
          const signInUrl = new URL('/auth/signin', req.url)
          signInUrl.searchParams.set('error', 'SessionExpired')
          return NextResponse.redirect(signInUrl)
        }
        return NextResponse.next()
      }
    }

    // Se o usuário está autenticado e tenta acessar páginas de auth → redireciona para área logada
    if (pathname === '/auth/signin' || pathname === '/auth/signup') {
      if (profileComplete && (role === 'ADMIN' || role === 'SUPERVISOR')) {
        return NextResponse.redirect(new URL('/admin', req.url))
      } else if (profileComplete && role === 'EMPLOYEE') {
        return NextResponse.redirect(new URL('/employee', req.url))
      }
      // Perfil incompleto → complete-profile
      return NextResponse.redirect(new URL('/auth/complete-profile', req.url))
    }

    // VERIFICAÇÃO DE ROLE VÁLIDO
    if (!role || !['ADMIN', 'SUPERVISOR', 'EMPLOYEE'].includes(role)) {
      logger.security('Invalid role detected', { userId: token.sub, role })
      // Evita loop: não redireciona se já estiver em rota de auth
      if (!pathname.startsWith('/auth/')) {
        const signInUrl = new URL('/auth/signin', req.url)
        signInUrl.searchParams.set('error', 'InvalidRole')
        return NextResponse.redirect(signInUrl)
      }
      return NextResponse.next()
    }

    // VERIFICAÇÃO DE PERFIL COMPLETO
    if (profileComplete === false) {
      // Só redireciona se não estiver já na página de completar perfil
      const allowedWhileIncomplete = ['/auth/complete-profile', '/api/auth']
      const isAllowed = allowedWhileIncomplete.some(p => pathname.startsWith(p))
      if (!isAllowed) {
        const completeProfileUrl = new URL('/auth/complete-profile', req.url)
        completeProfileUrl.searchParams.set('reason', 'incomplete')
        return NextResponse.redirect(completeProfileUrl)
      }
      return NextResponse.next()
    }

    // Se o perfil ESTÁ completo e o usuário está na página de completar perfil
    if (profileComplete === true && pathname === '/auth/complete-profile') {
      if (role === 'ADMIN' || role === 'SUPERVISOR') {
        return NextResponse.redirect(new URL('/admin', req.url))
      } else if (role === 'EMPLOYEE') {
        return NextResponse.redirect(new URL('/employee', req.url))
      }
    }

    // Redirecionamentos da home (só redireciona de '/' para área logada)
    if (pathname === '/') {
      if (role === 'ADMIN' || role === 'SUPERVISOR') {
        return NextResponse.redirect(new URL('/admin', req.url))
      } else if (role === 'EMPLOYEE') {
        return NextResponse.redirect(new URL('/employee', req.url))
      }
    }

    // CONTROLE DE ACESSO BASEADO EM ROLES
    const adminOnlyRoutes = ['/admin', '/dashboard']
    const employeeOnlyRoutes = ['/employee']

    // ADMIN / SUPERVISOR
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

    // EMPLOYEE
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

    // APIs ADMINISTRATIVAS
    if (
      pathname.startsWith('/api/users') ||
      pathname.startsWith('/api/machines') ||
      pathname.startsWith('/api/dashboard')
    ) {
      if (!['ADMIN', 'SUPERVISOR'].includes(role)) {
        return NextResponse.json(
          { error: 'Não autorizado', reason: 'insufficient_permissions' },
          { status: 401 }
        )
      }
    }

    // HEADERS DE SEGURANÇA
    const response = NextResponse.next()
    const securityHeaders = getSecurityHeaders()
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        if (PUBLIC_ROUTES.includes(pathname)) {
          return true
        }

        if (PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
          return true
        }

        // Permite /auth/complete-profile sem token para não criar loop
        if (pathname.startsWith('/auth/complete-profile')) {
          return true
        }

        return !!token
      },
    },
    pages: {
      signIn: '/auth/signin',
    },
    secret: process.env.NEXTAUTH_SECRET,
  }
)

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|icon-.*\\.png|.*\\.svg|public).*)',
  ],
}
