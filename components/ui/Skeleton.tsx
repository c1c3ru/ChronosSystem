import React from 'react'
import { cn } from '@/lib/utils'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'text' | 'circular' | 'rectangular'
    width?: string | number
    height?: string | number
    animation?: 'pulse' | 'wave' | 'none'
}

/**
 * Base Skeleton component for loading states
 */
export function Skeleton({
    variant = 'rectangular',
    width,
    height,
    animation = 'pulse',
    className,
    style,
    ...props
}: SkeletonProps) {
    const variantClasses = {
        text: 'rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
    }

    const animationClasses = {
        pulse: 'animate-pulse',
        wave: 'animate-shimmer',
        none: '',
    }

    return (
        <div
            className={cn(
                'bg-muted',
                variantClasses[variant],
                animationClasses[animation],
                className
            )}
            style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: typeof height === 'number' ? `${height}px` : height,
                ...style,
            }}
            aria-hidden="true"
            {...props}
        />
    )
}

/**
 * Text skeleton for loading text content
 */
export function SkeletonText({
    lines = 1,
    className,
}: {
    lines?: number
    className?: string
}) {
    return (
        <div className={cn('space-y-2', className)}>
            {Array.from({ length: lines }).map((_, index) => (
                <Skeleton
                    key={index}
                    variant="text"
                    height={16}
                    width={index === lines - 1 ? '80%' : '100%'}
                />
            ))}
        </div>
    )
}

/**
 * Avatar skeleton for loading profile images
 */
export function SkeletonAvatar({
    size = 40,
    className,
}: {
    size?: number
    className?: string
}) {
    return (
        <Skeleton
            variant="circular"
            width={size}
            height={size}
            className={className}
        />
    )
}

export default Skeleton
