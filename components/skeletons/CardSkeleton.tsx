import React from 'react'
import { Skeleton, SkeletonText } from '../ui/Skeleton'
import { cn } from '@/lib/utils'

export interface CardSkeletonProps {
    className?: string
    showImage?: boolean
    showActions?: boolean
}

/**
 * Card skeleton for loading card components
 */
export function CardSkeleton({
    className,
    showImage = false,
    showActions = true,
}: CardSkeletonProps) {
    return (
        <div
            className={cn(
                'card p-6 space-y-4',
                className
            )}
            role="status"
            aria-label="Carregando..."
        >
            {showImage && (
                <Skeleton variant="rectangular" height={200} className="w-full" />
            )}

            <div className="space-y-3">
                <Skeleton variant="text" height={24} width="60%" />
                <SkeletonText lines={3} />
            </div>

            {showActions && (
                <div className="flex gap-2 pt-2">
                    <Skeleton variant="rectangular" height={36} width={100} />
                    <Skeleton variant="rectangular" height={36} width={100} />
                </div>
            )}
        </div>
    )
}

export default CardSkeleton
