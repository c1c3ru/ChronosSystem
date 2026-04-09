import React from 'react'
import { Skeleton, SkeletonAvatar, SkeletonText } from '../ui/Skeleton'
import { cn } from '@/lib/utils'

export interface ListSkeletonProps {
  items?: number
  className?: string
  showAvatar?: boolean
  showActions?: boolean
}

/**
 * List skeleton for loading list items
 */
export function ListSkeleton({
  items = 5,
  className,
  showAvatar = false,
  showActions = false,
}: ListSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)} role="status" aria-label="Carregando lista...">
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={`item-${index}`}
          className="flex items-center gap-4 p-4 border border-border rounded-lg"
        >
          {showAvatar && <SkeletonAvatar size={48} />}

          <div className="flex-1 space-y-2">
            <Skeleton variant="text" height={20} width="40%" />
            <SkeletonText lines={2} />
          </div>

          {showActions && (
            <div className="flex gap-2">
              <Skeleton variant="rectangular" height={32} width={32} />
              <Skeleton variant="rectangular" height={32} width={32} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default ListSkeleton
