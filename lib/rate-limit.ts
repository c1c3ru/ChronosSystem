import { NextRequest } from 'next/server'

interface RateLimitConfig {
  windowMs: number // Janela de tempo em milissegundos
  maxRequests: number // Máximo de requests por janela
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

// Cache em memória para rate limiting (em produção usar Redis)
const rateLimitCache = new Map<string, RateLimitEntry>()

/**
 * Rate limiter simples baseado em IP
 */
export function rateLimit(config: RateLimitConfig) {
  return (request: NextRequest): { success: boolean; limit: number; remaining: number; reset: number } => {
    const ip = getClientIP(request)
    const key = `rate_limit:${ip}`
    const now = Date.now()
    
    // Limpar entradas expiradas
    cleanupExpiredEntries(now)
    
    const entry = rateLimitCache.get(key)
    
    if (!entry || now > entry.resetTime) {
      // Nova janela de tempo
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + config.windowMs
      }
      rateLimitCache.set(key, newEntry)
      
      return {
        success: true,
        limit: config.maxRequests,
        remaining: config.maxRequests - 1,
        reset: newEntry.resetTime
      }
    }
    
    if (entry.count >= config.maxRequests) {
      // Limite excedido
      return {
        success: false,
        limit: config.maxRequests,
        remaining: 0,
        reset: entry.resetTime
      }
    }
    
    // Incrementar contador
    entry.count++
    rateLimitCache.set(key, entry)
    
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - entry.count,
      reset: entry.resetTime
    }
  }
}

/**
 * Obter IP do cliente
 */
function getClientIP(request: NextRequest): string {
  // Tentar headers de proxy primeiro
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  
  // Fallback para IP direto (desenvolvimento)
  return request.ip || 'unknown'
}

/**
 * Limpar entradas expiradas do cache
 */
function cleanupExpiredEntries(now: number) {
  const entries = Array.from(rateLimitCache.entries())
  for (const [key, entry] of entries) {
    if (now > entry.resetTime) {
      rateLimitCache.delete(key)
    }
  }
}

/**
 * Rate limiters pré-configurados
 */
export const rateLimiters = {
  // Login: 5 tentativas por minuto
  login: rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 5
  }),
  
  // 2FA: 3 tentativas por minuto
  twoFactor: rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 3
  }),
  
  // QR Scan: 20 scans por minuto
  qrScan: rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 20
  }),
  
  // API Geral: 100 requests por minuto
  general: rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 100
  })
}

/**
 * Middleware helper para aplicar rate limiting
 */
export function withRateLimit(
  rateLimiter: (request: NextRequest) => { success: boolean; limit: number; remaining: number; reset: number }
) {
  return (request: NextRequest) => {
    const result = rateLimiter(request)
    
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((result.reset - Date.now()) / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.reset.toString(),
            'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString()
          }
        }
      )
    }
    
    return null // Continue with normal processing
  }
}
