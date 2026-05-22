import React from 'react'
import { Skeleton, SkeletonText } from '../ui/Skeleton'
import { cn } from '@/lib/utils'

export interface FormSkeletonProps {
  fields?: number
  className?: string
  showSubmitButton?: boolean
}

/**
 * Form skeleton for loading form components
 */
export function FormSkeleton({
  fields = 4,
  className,
  showSubmitButton = true,
}: FormSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)} role="status" aria-label="Carregando formulário...">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={`field-${index}`} className="space-y-2">
          {/* Label */}
          <Skeleton variant="text" height={16} width={120} />

          {/* Input field */}
          <Skeleton variant="rectangular" height={40} className="w-full" />

          {/* Helper text (random for some fields) */}
          {index % 3 === 0 && <Skeleton variant="text" height={12} width="70%" />}
        </div>
      ))}

      {showSubmitButton && (
        <div className="pt-4">
          <Skeleton variant="rectangular" height={44} width={150} />
        </div>
      )}
    </div>
  )
}

export default FormSkeleton
