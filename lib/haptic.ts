/**
 * Haptic Feedback Utilities
 *
 * Provides haptic feedback for mobile devices using the Vibration API
 */

export type HapticPattern =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'error'
  | 'warning'
  | 'selection'

/**
 * Haptic patterns in milliseconds
 * Format: [vibrate, pause, vibrate, pause, ...]
 */
const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 40,
  success: [10, 50, 10],
  error: [20, 100, 20, 100, 20],
  warning: [20, 50, 20],
  selection: 5,
}

/**
 * Check if haptic feedback is supported
 */
export function isHapticSupported(): boolean {
  return typeof window !== 'undefined' && 'vibrate' in navigator
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Check if haptic feedback should be enabled
 */
export function shouldEnableHaptic(): boolean {
  return isHapticSupported() && !prefersReducedMotion()
}

/**
 * Trigger haptic feedback
 */
export function triggerHaptic(pattern: HapticPattern = 'light'): void {
  if (!shouldEnableHaptic()) return

  try {
    const vibrationPattern = HAPTIC_PATTERNS[pattern]
    navigator.vibrate(vibrationPattern)
  } catch (error) {
    // Silently fail if vibration is not supported or blocked
    console.debug('Haptic feedback failed:', error)
  }
}

/**
 * Cancel any ongoing haptic feedback
 */
export function cancelHaptic(): void {
  if (!isHapticSupported()) return

  try {
    navigator.vibrate(0)
  } catch (error) {
    console.debug('Cancel haptic failed:', error)
  }
}

/**
 * Haptic feedback helpers for common interactions
 */
export const haptic = {
  /**
   * Light tap feedback (e.g., button press)
   */
  tap: () => triggerHaptic('light'),

  /**
   * Medium tap feedback (e.g., important button)
   */
  impact: () => triggerHaptic('medium'),

  /**
   * Heavy feedback (e.g., error or warning)
   */
  heavy: () => triggerHaptic('heavy'),

  /**
   * Success feedback (e.g., form submission)
   */
  success: () => triggerHaptic('success'),

  /**
   * Error feedback (e.g., validation error)
   */
  error: () => triggerHaptic('error'),

  /**
   * Warning feedback
   */
  warning: () => triggerHaptic('warning'),

  /**
   * Selection feedback (e.g., selecting an item)
   */
  selection: () => triggerHaptic('selection'),

  /**
   * Cancel any ongoing haptic
   */
  cancel: cancelHaptic,
}

export default haptic
