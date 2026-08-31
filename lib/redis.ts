/**
 * Redis client configuration with graceful fallback
 * Supports both production (Redis) and development (in-memory) environments
 */

import Redis from 'ioredis'
import { logger } from './logger'

let redisClient: Redis | null = null
let isRedisAvailable = false

/**
 * Initialize Redis client with connection pooling and error handling
 */
function initializeRedis(): Redis | null {
  const redisUrl = process.env.REDIS_URL

  // Skip Redis in development if not configured
  if (!redisUrl) {
    if (process.env.NODE_ENV === 'production') {
      logger.warn(
        'Redis URL not configured in production. Rate limiting will use in-memory fallback.'
      )
    } else {
      logger.info('Redis not configured. Using in-memory rate limiting for development.')
    }
    return null
  }

  try {
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
      reconnectOnError(err) {
        const targetError = 'READONLY'
        if (err.message.includes(targetError)) {
          // Reconnect on READONLY errors
          return true
        }
        return false
      },
      lazyConnect: true,
      enableOfflineQueue: true,
      // Connection pool settings
      connectionName: 'chronos-rate-limit',
    })

    // Handle connection events
    client.on('connect', () => {
      logger.info('Redis client connected successfully')
      isRedisAvailable = true
    })

    client.on('error', (error) => {
      logger.error('Redis client error', { error: error.message })
      isRedisAvailable = false
    })

    client.on('close', () => {
      logger.warn('Redis connection closed')
      isRedisAvailable = false
    })

    client.on('reconnecting', () => {
      logger.info('Redis client reconnecting...')
    })

    // Attempt initial connection
    client.connect().catch((error) => {
      logger.error('Failed to connect to Redis', { error: error.message })
      isRedisAvailable = false
    })

    return client
  } catch (error: unknown) {
    logger.error('Failed to initialize Redis client', {
      error: error instanceof Error ? error.message : String(error),
    })
    return null
  }
}

/**
 * Get Redis client instance (singleton)
 */
export function getRedisClient(): Redis | null {
  if (!redisClient) {
    redisClient = initializeRedis()
  }
  return redisClient
}

/**
 * Check if Redis is available and connected
 */
export function isRedisConnected(): boolean {
  return isRedisAvailable && redisClient !== null && redisClient.status === 'ready'
}

/**
 * Gracefully close Redis connection
 */
async function closeRedis(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit()
      logger.info('Redis connection closed gracefully')
    } catch (error: unknown) {
      logger.error('Error closing Redis connection', {
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      redisClient = null
      isRedisAvailable = false
    }
  }
}

/**
 * Health check for Redis connection
 */
export async function redisHealthCheck(): Promise<{ healthy: boolean; message: string }> {
  if (!redisClient) {
    return { healthy: false, message: 'Redis client not initialized' }
  }

  if (!isRedisConnected()) {
    return { healthy: false, message: 'Redis not connected' }
  }

  try {
    const pong = await redisClient.ping()
    if (pong === 'PONG') {
      return { healthy: true, message: 'Redis connection healthy' }
    }
    return { healthy: false, message: 'Redis ping failed' }
  } catch (error: unknown) {
    return {
      healthy: false,
      message: `Redis health check failed: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// Graceful shutdown
if (typeof process !== 'undefined') {
  process.on('SIGTERM', async () => {
    await closeRedis()
  })

  process.on('SIGINT', async () => {
    await closeRedis()
  })
}
