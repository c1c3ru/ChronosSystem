import { NextRequest } from 'next/server'
import { getRedisClient, isRedisConnected } from './redis'
import { logger } from './logger'

interface RateLimitConfig {
  windowMs: number // Janela de tempo em milissegundos
  maxRequests: number // Máximo de requests por janela
  skipSuccessfulRequests?: boolean // Não contar requests bem-sucedidos
  requireRedisInProduction?: boolean // Em produção, falhar fechado sem Redis
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

// Cache em memória para fallback quando Redis não está disponível
const inMemoryCache = new Map<string, RateLimitEntry>()

/**
 * Rate limiter com Redis (sliding window) e fallback em memória
 */
export function rateLimit(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<RateLimitResult> => {
    const ip = getClientIP(request)
    const identifier = `${ip}:${request.nextUrl.pathname}`

    const isProd = process.env.NODE_ENV === 'production'
    const requireRedisInProduction = config.requireRedisInProduction ?? true

    // Tentar usar Redis primeiro
    if (isRedisConnected()) {
      return await redisRateLimit(identifier, config)
    }

    // Em produção, não permitir fallback silencioso em ambiente serverless
    if (isProd && requireRedisInProduction) {
      const reset = Date.now() + Math.min(config.windowMs, 60_000) // limita o "bloqueio" inicial a 60s
      logger.error('Rate limiting sem Redis em produção (fail-closed)', {
        path: request.nextUrl.pathname,
        ip,
      })
      return { success: false, limit: config.maxRequests, remaining: 0, reset }
    }

    // Fallback para rate limiting em memória
    logger.debug('Using in-memory rate limiting (Redis not available)')
    return inMemoryRateLimit(identifier, config)
  }
}

/**
 * Rate limiting usando Redis com sliding window algorithm
 */
async function redisRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const redis = getRedisClient()
  if (!redis) {
    return inMemoryRateLimit(identifier, config)
  }

  const key = `rate_limit:${identifier}`
  const now = Date.now()
  const windowStart = now - config.windowMs

  try {
    // Usar pipeline para operações atômicas
    const pipeline = redis.pipeline()

    // Remover entradas antigas (sliding window)
    pipeline.zremrangebyscore(key, 0, windowStart)

    // Contar requests na janela atual
    pipeline.zcard(key)

    // Adicionar request atual
    pipeline.zadd(key, now, `${now}:${Math.random()}`)

    // Definir expiração da chave
    pipeline.expire(key, Math.ceil(config.windowMs / 1000))

    const results = await pipeline.exec()

    if (!results) {
      throw new Error('Redis pipeline failed')
    }

    // Pegar contagem após remover entradas antigas
    const count = (results[1][1] as number) || 0
    const remaining = Math.max(0, config.maxRequests - count - 1)
    const resetTime = now + config.windowMs

    if (count >= config.maxRequests) {
      // Remover o request que acabamos de adicionar (limite excedido)
      await redis.zremrangebyrank(key, -1, -1)

      return {
        success: false,
        limit: config.maxRequests,
        remaining: 0,
        reset: resetTime
      }
    }

    return {
      success: true,
      limit: config.maxRequests,
      remaining,
      reset: resetTime
    }
  } catch (error: any) {
    logger.error('Redis rate limit error, falling back to in-memory', {
      error: error.message,
      identifier
    })
    return inMemoryRateLimit(identifier, config)
  }
}

/**
 * Rate limiting em memória (fallback)
 */
function inMemoryRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const key = `rate_limit:${identifier}`
  const now = Date.now()

  // Limpar entradas expiradas periodicamente
  cleanupExpiredEntries(now)

  const entry = inMemoryCache.get(key)

  if (!entry || now > entry.resetTime) {
    // Nova janela de tempo
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs
    }
    inMemoryCache.set(key, newEntry)

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
  inMemoryCache.set(key, entry)

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - entry.count,
    reset: entry.resetTime
  }
}

/**
 * Obter IP do cliente com suporte a proxies
 */
function getClientIP(request: NextRequest): string {
  // Tentar headers de proxy primeiro (Vercel, Cloudflare, etc)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  if (cfConnectingIP) {
    return cfConnectingIP
  }

  // Fallback para IP direto (desenvolvimento)
  return request.ip || 'unknown'
}

/**
 * Limpar entradas expiradas do cache em memória
 */
function cleanupExpiredEntries(now: number) {
  // Limpar apenas a cada 1000 requests para performance
  if (Math.random() > 0.001) return

  const entries = Array.from(inMemoryCache.entries())
  for (const [key, entry] of entries) {
    if (now > entry.resetTime) {
      inMemoryCache.delete(key)
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
  }),

  // Password Reset: 3 tentativas por hora
  passwordReset: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 3
  })
}

/**
 * Middleware helper para aplicar rate limiting (async)
 */
export function withRateLimit(
  rateLimiter: (request: NextRequest) => Promise<RateLimitResult>
) {
  return async (request: NextRequest): Promise<Response | null> => {
    const result = await rateLimiter(request)

    if (!result.success) {
      const retryAfter = Math.ceil((result.reset - Date.now()) / 1000)

      logger.warn('Rate limit exceeded', {
        ip: getClientIP(request),
        path: request.nextUrl.pathname,
        limit: result.limit,
        retryAfter
      })

      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retryAfter
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.reset.toString(),
            'Retry-After': retryAfter.toString()
          }
        }
      )
    }

    return null // Continue with normal processing
  }
}

/**
 * Helper para adicionar headers de rate limit em respostas bem-sucedidas
 */
export function addRateLimitHeaders(
  response: Response,
  result: RateLimitResult
): Response {
  response.headers.set('X-RateLimit-Limit', result.limit.toString())
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
  response.headers.set('X-RateLimit-Reset', result.reset.toString())
  return response
}
