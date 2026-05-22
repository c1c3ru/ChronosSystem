import React from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'warning' | 'success'
  showIcon?: boolean
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', showIcon = true, children, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-neutral-100 text-neutral-900 border-neutral-200',
      destructive: 'bg-error-50 text-error-900 border-error-200',
      warning: 'bg-warning-50 text-warning-900 border-warning-200',
      success: 'bg-success-50 text-success-900 border-success-200',
    }

    const icons = {
      default: Info,
      destructive: AlertCircle,
      warning: AlertTriangle,
      success: CheckCircle,
    }

    const Icon = icons[variant]
    const ariaLive = variant === 'destructive' ? 'assertive' : 'polite'

    return (
      <div
        ref={ref}
        role="alert"
        aria-live={ariaLive}
        aria-atomic="true"
        className={cn(
          'relative w-full rounded-lg border p-4',
          variantClasses[variant],
          showIcon && 'flex gap-3',
          className
        )}
        {...props}
      >
        {showIcon && <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />}
        <div className="flex-1">{children}</div>
      </div>
    )
  }
)
Alert.displayName = 'Alert'

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />
))
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertDescription }
