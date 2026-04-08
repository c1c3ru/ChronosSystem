'use client'

import { useCallback, useEffect, useState } from 'react'
import { triggerHaptic, isHapticSupported, shouldEnableHaptic, type HapticPattern } from '../haptic'

/**
 * Hook for haptic feedback
 * 
 * Provides haptic feedback functions and feature detection
 */
export function useHaptic() {
    const [isSupported, setIsSupported] = useState(false)
    const [isEnabled, setIsEnabled] = useState(false)

    useEffect(() => {
        setIsSupported(isHapticSupported())
        setIsEnabled(shouldEnableHaptic())
    }, [])

    const trigger = useCallback((pattern: HapticPattern = 'light') => {
        if (isEnabled) {
            triggerHaptic(pattern)
        }
    }, [isEnabled])

    const tap = useCallback(() => trigger('light'), [trigger])
    const impact = useCallback(() => trigger('medium'), [trigger])
    const heavy = useCallback(() => trigger('heavy'), [trigger])
    const success = useCallback(() => trigger('success'), [trigger])
    const error = useCallback(() => trigger('error'), [trigger])
    const warning = useCallback(() => trigger('warning'), [trigger])
    const selection = useCallback(() => trigger('selection'), [trigger])

    return {
        isSupported,
        isEnabled,
        trigger,
        tap,
        impact,
        heavy,
        success,
        error,
        warning,
        selection,
    }
}

export default useHaptic
