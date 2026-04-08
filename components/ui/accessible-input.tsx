/**
 * Componente Input acessível com suporte a ARIA e validação
 */

import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    helperText?: string
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            label,
            error,
            helperText,
            leftIcon,
            rightIcon,
            id,
            required,
            disabled,
            ...props
        },
        ref
    ) => {
        const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
        const errorId = `${inputId}-error`
        const helperId = `${inputId}-helper`

        const inputProps = {
            ...props,
            'aria-invalid': (error ? "true" : "false") as "true" | "false",
            'aria-required': (required ? "true" : "false") as boolean | "true" | "false",
            disabled: disabled,
            id: inputId,
            ref: ref,
            className: cn(
                'w-full h-10 px-3 rounded-md border bg-white text-gray-900 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
                error
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500',
                leftIcon && 'pl-10',
                rightIcon && 'pr-10',
                className
            ),
            'aria-describedby': cn(
                error && errorId,
                helperText && helperId
            )
        }

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        {label}
                        {required && (
                            <span className="text-red-500 ml-1" aria-label="obrigatório">
                                *
                            </span>
                        )}
                    </label>
                )}

                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
                            {leftIcon}
                        </div>
                    )}

                    <input {...inputProps} />

                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
                            {rightIcon}
                        </div>
                    )}
                </div>

                {error && (
                    <p
                        id={errorId}
                        className="mt-1 text-sm text-red-600"
                        role="alert"
                        aria-live="polite"
                    >
                        {error}
                    </p>
                )}

                {helperText && !error && (
                    <p
                        id={helperId}
                        className="mt-1 text-sm text-gray-500"
                    >
                        {helperText}
                    </p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'
