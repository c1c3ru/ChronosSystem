import React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  helperText?: string
  label?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, helperText, label, id, required, ...props }, ref) => {
    // Generate unique IDs for accessibility - MUST be called unconditionally
    const generatedId = React.useId()
    const inputId = id || generatedId
    const helperTextId = helperText ? `${inputId}-helper` : undefined
    const errorId = error && helperText ? `${inputId}-error` : undefined
    const describedBy = error ? errorId : helperTextId

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium mb-1',
              error ? 'text-destructive' : 'text-foreground'
            )}
          >
            {label}
            {required && <span className="text-destructive ml-1" aria-label="obrigatório">*</span>}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(
            'input',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          ref={ref}
          aria-invalid={error}
          aria-describedby={describedBy}
          aria-required={required}
          {...props}
        />
        {helperText && (
          <p
            id={error ? errorId : helperTextId}
            className={cn(
              'mt-1 text-xs',
              error ? 'text-destructive' : 'text-muted-foreground'
            )}
            role={error ? 'alert' : 'status'}
            aria-live={error ? 'assertive' : 'polite'}
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
