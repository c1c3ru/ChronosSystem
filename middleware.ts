import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

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

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Permitir acesso às rotas públicas
        const publicRoutes = ['/', '/auth/signin', '/auth/signup', '/kiosk']
        if (publicRoutes.includes(pathname)) {
          return true
        }

        // Rotas de API públicas
        if (pathname.startsWith('/api/auth')) {
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
