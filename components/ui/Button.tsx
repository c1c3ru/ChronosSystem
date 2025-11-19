import React from 'react'
import { cn } from '@/lib/utils'
import { designTokens } from '@/lib/design-tokens'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  asChild?: boolean
  children: React.ReactNode
  'aria-label'?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, asChild = false, children, disabled, ...props }, ref) => {
    const baseClasses = 'btn'

    const variantClasses = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      ghost: 'btn-ghost',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
    }

    const sizeClasses = {
      sm: 'btn-sm',
      md: 'btn-md',
      lg: 'btn-lg'
    }

    const buttonClasses = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      loading && 'opacity-50 cursor-not-allowed',
      className
    )

    // Keyboard event handler for accessibility
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      // Allow Enter and Space to trigger button click
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        e.currentTarget.click()
      }
      // Call user-provided onKeyDown if exists
      props.onKeyDown?.(e)
    }

    if (asChild) {
      return React.cloneElement(
        children as React.ReactElement,
        {
          className: cn(buttonClasses, (children as React.ReactElement).props?.className),
          ...props
        }
      )
    }

    return (
      <button
        className={buttonClasses}
        ref={ref}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {loading && (
          <div
            className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        )}
        {loading && <span className="sr-only">Carregando...</span>}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
