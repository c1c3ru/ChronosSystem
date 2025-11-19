import React from 'react'
import { Skeleton } from '../ui/Skeleton'
import { cn } from '@/lib/utils'

export interface TableSkeletonProps {
    rows?: number
    columns?: number
    className?: string
    showHeader?: boolean
}

/**
 * Table skeleton for loading table data
 */
export function TableSkeleton({
    rows = 5,
    columns = 4,
    className,
    showHeader = true,
}: TableSkeletonProps) {
    return (
        <div
            className={cn('w-full space-y-3', className)}
            role="status"
            aria-label="Carregando tabela..."
        >
            {showHeader && (
                <div className="flex gap-4 pb-3 border-b border-border">
                    {Array.from({ length: columns }).map((_, index) => (
                        <Skeleton
                            key={`header-${index}`}
                            variant="text"
                            height={20}
                            width={`${100 / columns}%`}
                        />
                    ))}
                </div>
            )}

            <div className="space-y-3">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={`row-${rowIndex}`} className="flex gap-4 py-2">
                        {Array.from({ length: columns }).map((_, colIndex) => (
                            <Skeleton
                                key={`cell-${rowIndex}-${colIndex}`}
                                variant="text"
                                height={16}
                                width={`${100 / columns}%`}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default TableSkeleton
