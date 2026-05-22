/**
 * Cache abstraction layer for database queries
 * Provides caching strategies with automatic invalidation
 */

import { getRedisClient, isRedisConnected } from './redis'
import { logger } from './logger'

/**
 * Cache key prefixes for different data types
 */
export const CachePrefix = {
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
export const CacheTTL = {
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
export async function getCache<T>(key: string): Promise<T | null> {
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
export async function setCache<T>(key: string, value: T, ttlSeconds: number): Promise<boolean> {
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
export async function deleteCache(key: string): Promise<boolean> {
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
export async function deleteCachePattern(pattern: string): Promise<boolean> {
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
 * Cache helper for attendance records
 */
export const AttendanceCache = {
  /**
   * Get attendance record by ID from cache
   */
  async get(recordId: string) {
    return getCache(`${CachePrefix.ATTENDANCE}:${recordId}`)
  },

  /**
   * Set attendance record in cache
   */
  async set(recordId: string, record: unknown) {
    return setCache(`${CachePrefix.ATTENDANCE}:${recordId}`, record, CacheTTL.ATTENDANCE)
  },

  /**
   * Get attendance list from cache
   */
  async getList(cacheKey: string) {
    return getCache(`${CachePrefix.ATTENDANCE_LIST}:${cacheKey}`)
  },

  /**
   * Set attendance list in cache
   */
  async setList(data: unknown, cacheKey: string) {
    return setCache(`${CachePrefix.ATTENDANCE_LIST}:${cacheKey}`, data, CacheTTL.ATTENDANCE_LIST)
  },

  /**
   * Invalidate attendance caches for a user
   */
  async invalidateUser(userId: string) {
    await deleteCachePattern(`${CachePrefix.ATTENDANCE}:*`)
    await deleteCachePattern(`${CachePrefix.ATTENDANCE_LIST}:*${userId}*`)
  },

  /**
   * Invalidate all attendance caches
   */
  async invalidateAll() {
    await deleteCachePattern(`${CachePrefix.ATTENDANCE}:*`)
    await deleteCachePattern(`${CachePrefix.ATTENDANCE_LIST}:*`)
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

/**
 * Cache helper for justifications
 */
export const JustificationCache = {
  /**
   * Get justification by ID from cache
   */
  async get(justificationId: string) {
    return getCache(`${CachePrefix.JUSTIFICATIONS}:${justificationId}`)
  },

  /**
   * Set justification in cache
   */
  async set(justificationId: string, justification: unknown) {
    return setCache(
      `${CachePrefix.JUSTIFICATIONS}:${justificationId}`,
      justification,
      CacheTTL.JUSTIFICATIONS
    )
  },

  /**
   * Get pending justifications from cache
   */
  async getPending() {
    return getCache(CachePrefix.JUSTIFICATIONS_PENDING)
  },

  /**
   * Set pending justifications in cache
   */
  async setPending(justifications: unknown[]) {
    return setCache(
      CachePrefix.JUSTIFICATIONS_PENDING,
      justifications,
      CacheTTL.JUSTIFICATIONS_PENDING
    )
  },

  /**
   * Invalidate all justification caches
   */
  async invalidateAll() {
    await deleteCachePattern(`${CachePrefix.JUSTIFICATIONS}:*`)
    await deleteCache(CachePrefix.JUSTIFICATIONS_PENDING)
  },
}

/**
 * Cache helper for hour balance
 */
export const HourBalanceCache = {
  /**
   * Get hour balance for user and date
   */
  async get(userId: string, date: string) {
    return getCache(`${CachePrefix.HOUR_BALANCE}:${userId}:${date}`)
  },

  /**
   * Set hour balance in cache
   */
  async set(userId: string, date: string, balance: unknown) {
    return setCache(`${CachePrefix.HOUR_BALANCE}:${userId}:${date}`, balance, CacheTTL.HOUR_BALANCE)
  },

  /**
   * Invalidate hour balance for a user
   */
  async invalidateUser(userId: string) {
    await deleteCachePattern(`${CachePrefix.HOUR_BALANCE}:${userId}:*`)
  },

  /**
   * Invalidate all hour balance caches
   */
  async invalidateAll() {
    await deleteCachePattern(`${CachePrefix.HOUR_BALANCE}:*`)
  },
}
