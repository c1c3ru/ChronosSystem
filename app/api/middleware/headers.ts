import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function addSecurityHeaders(request: NextRequest, response: NextResponse) {
  // Headers para permitir acesso à câmera e outros recursos
  response.headers.set('Permissions-Policy', 'camera=*, microphone=*, geolocation=*')
  response.headers.set('Feature-Policy', 'camera *; microphone *; geolocation *')
  
  // Headers de segurança adicionais
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // CSP para permitir câmera
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https:",
    "media-src 'self' blob:",
    "camera 'self'",
    "microphone 'self'"
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)
  
  return response
}
