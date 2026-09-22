'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Alert } from './Alert'
import { Button } from './Button'
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react'
import type { RecoveryAction, ErrorSeverity } from '@/lib/errors'

export interface ErrorMessageProps {
  title?: string
  message: string
  severity?: ErrorSeverity
  recoveryActions?: RecoveryAction[]
  onAction?: (action: string | (() => void)) => void
  className?: string
  inline?: boolean
}

const severityToVariant = {
  low: 'default' as const,
  medium: 'warning' as const,
  high: 'destructive' as const,
  critical: 'destructive' as const,
}

export function ErrorMessage({
  title,
  message,
  severity = 'medium',
  recoveryActions = [],
  onAction,
  className,
  inline = false,
}: ErrorMessageProps) {
  const variant = severityToVariant[severity]

  const handleAction = (action: string | (() => void)) => {
    if (typeof action === 'function') {
      action()
    } else if (onAction) {
      onAction(action)
    } else {
      // Default action handlers
      switch (action) {
        case 'back':
          window.history.back()
          break
        case 'refresh':
          window.location.reload()
          break
        case 'retry':
          // Parent component should handle retry
          break
        default:
          // Navigate to the action URL
          if (action.startsWith('/') || action.startsWith('http')) {
            window.location.href = action
          }
      }
    }
  }

  return (
    <Alert variant={variant} className={cn(inline ? 'my-2' : 'my-4', className)}>
      <div className="flex flex-col gap-2">
        {title && <h3 className="font-semibold text-base">{title}</h3>}
        <p className="text-sm">{message}</p>

        {recoveryActions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {recoveryActions.map((recoveryAction, index) => (
              <Button
                key={index}
                variant={index === 0 ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleAction(recoveryAction.action)}
                aria-label={recoveryAction.description || recoveryAction.label}
              >
                {recoveryAction.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </Alert>
  )
}
