/**
 * Cache abstraction layer for database queries
 * Provides caching strategies with automatic invalidation
 */

import { getRedisClient, isRedisConnected } from './redis'
import { logger } from './logger'

/**
 * Cache key prefixes for different data types
 */
const CachePrefix = {
  USER: 'user',
  USERS_LIST: 'users:list',
  ATTENDANCE: 'attendance',
  ATTENDANCE_LIST: 'attendance:list',
  MACHINES: 'machines',
  MACHINES_ACTIVE: 'machines:active',
  JUSTIFICATIONS: 'justifications',
  JUSTIFICATIONS_PENDING: 'justifications:pending',
  HOUR_BALANCE: 'hour-balance',
} as const

/**
 * Default TTL values (in seconds) for different cache types
 */
const CacheTTL = {
  USER: 300, // 5 minutes
  USERS_LIST: 300, // 5 minutes
  ATTENDANCE: 120, // 2 minutes
  ATTENDANCE_LIST: 120, // 2 minutes
  MACHINES: 600, // 10 minutes
  MACHINES_ACTIVE: 600, // 10 minutes
  JUSTIFICATIONS: 180, // 3 minutes
  JUSTIFICATIONS_PENDING: 180, // 3 minutes
  HOUR_BALANCE: 300, // 5 minutes
} as const

/**
 * Get a value from cache
 */
async function getCache<T>(key: string): Promise<T | null> {
  const client = getRedisClient()

  if (!client || !isRedisConnected()) {
    return null
  }

  try {
    const value = await client.get(key)
    if (!value) {
      return null
    }

    const parsed = JSON.parse(value) as T
    logger.info(`[Cache] Hit: ${key}`)
    return parsed
  } catch (error: unknown) {
    logger.error(`[Cache] Error getting key "${key}"`, {
      error: error instanceof Error ? error.message : String(error),
    })
    return null
  }
}

/**
 * Set a value in cache with TTL
 */
async function setCache<T>(key: string, value: T, ttlSeconds: number): Promise<boolean> {
  const client = getRedisClient()

  if (!client || !isRedisConnected()) {
    return false
  }

  try {
    const serialized = JSON.stringify(value)
    await client.setex(key, ttlSeconds, serialized)
    logger.info(`[Cache] Set: ${key} (TTL: ${ttlSeconds}s)`)
    return true
  } catch (error: unknown) {
    logger.error(`[Cache] Error setting key "${key}"`, {
      error: error instanceof Error ? error.message : String(error),
    })
    return false
  }
}

/**
 * Delete a specific cache key
 */
async function deleteCache(key: string): Promise<boolean> {
  const client = getRedisClient()

  if (!client || !isRedisConnected()) {
    return false
  }

  try {
    await client.del(key)
    logger.info(`[Cache] Deleted: ${key}`)
    return true
  } catch (error: unknown) {
    logger.error(`[Cache] Error deleting key "${key}"`, {
      error: error instanceof Error ? error.message : String(error),
    })
    return false
  }
}

/**
 * Delete all keys matching a pattern
 */
async function deleteCachePattern(pattern: string): Promise<boolean> {
  const client = getRedisClient()

  if (!client || !isRedisConnected()) {
    return false
  }

  try {
    const keys = await client.keys(pattern)
    if (keys.length > 0) {
      await client.del(...keys)
      logger.info(`[Cache] Deleted pattern: ${pattern} (${keys.length} keys)`)
    }
    return true
  } catch (error: unknown) {
    logger.error(`[Cache] Error deleting pattern "${pattern}"`, {
      error: error instanceof Error ? error.message : String(error),
    })
    return false
  }
}

/**
 * Cache helper for user data
 */
export const UserCache = {
  /**
   * Get user by ID from cache
   */
  async get(userId: string) {
    return getCache(`${CachePrefix.USER}:${userId}`)
  },

  /**
   * Set user in cache
   */
  async set(userId: string, user: unknown) {
    return setCache(`${CachePrefix.USER}:${userId}`, user, CacheTTL.USER)
  },

  /**
   * Invalidate user cache
   */
  async invalidate(userId: string) {
    return deleteCache(`${CachePrefix.USER}:${userId}`)
  },

  /**
   * Get users list from cache
   */
  async getList(cacheKey: string = 'default') {
    return getCache(`${CachePrefix.USERS_LIST}:${cacheKey}`)
  },

  /**
   * Set users list in cache
   */
  async setList(data: unknown, cacheKey: string = 'default') {
    return setCache(`${CachePrefix.USERS_LIST}:${cacheKey}`, data, CacheTTL.USERS_LIST)
  },

  /**
   * Invalidate all user-related caches
   */
  async invalidateAll() {
    await deleteCachePattern(`${CachePrefix.USER}:*`)
    await deleteCachePattern(`${CachePrefix.USERS_LIST}:*`)
  },
}

/**
 * Cache helper for machines
 */
export const MachineCache = {
  /**
   * Get machine by ID from cache
   */
  async get(machineId: string) {
    return getCache(`${CachePrefix.MACHINES}:${machineId}`)
  },

  /**
   * Set machine in cache
   */
  async set(machineId: string, machine: unknown) {
    return setCache(`${CachePrefix.MACHINES}:${machineId}`, machine, CacheTTL.MACHINES)
  },

  /**
   * Get active machines from cache
   */
  async getActive() {
    return getCache(CachePrefix.MACHINES_ACTIVE)
  },

  /**
   * Set active machines in cache
   */
  async setActive(machines: unknown[]) {
    return setCache(CachePrefix.MACHINES_ACTIVE, machines, CacheTTL.MACHINES_ACTIVE)
  },

  /**
   * Invalidate all machine caches
   */
  async invalidateAll() {
    await deleteCachePattern(`${CachePrefix.MACHINES}:*`)
    await deleteCache(CachePrefix.MACHINES_ACTIVE)
  },
}
