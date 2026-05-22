'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { ErrorMessage } from './ui/ErrorMessage'
import { AppError } from '@/lib/errors'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    // Update state with error info
    this.setState({
      errorInfo,
    })

    // TODO: Log error to error reporting service (e.g., Sentry)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Check if error is an AppError
      const isAppError = this.state.error instanceof AppError
      const appError = isAppError ? (this.state.error as AppError) : null

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-2xl w-full">
            <ErrorMessage
              title={isAppError ? 'Erro' : 'Algo deu errado'}
              message={
                appError?.userMessage ||
                appError?.message ||
                this.state.error.message ||
                'Ocorreu um erro inesperado. Por favor, tente novamente.'
              }
              severity={appError?.severity || 'high'}
              recoveryActions={
                appError?.recoveryActions || [
                  {
                    label: 'Tentar novamente',
                    action: this.handleReset,
                    description: 'Tentar carregar a página novamente',
                  },
                  {
                    label: 'Voltar ao início',
                    action: '/',
                    description: 'Voltar para a página inicial',
                  },
                ]
              }
              onAction={(action) => {
                if (typeof action === 'function') {
                  action()
                } else if (action === 'retry') {
                  this.handleReset()
                }
              }}
            />

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mt-4 p-4 bg-muted rounded-lg">
                <summary className="cursor-pointer font-semibold text-sm">
                  Detalhes técnicos (desenvolvimento)
                </summary>
                <pre className="mt-2 text-xs overflow-auto whitespace-pre-wrap">
                  {this.state.error.stack}
                  {'\n\n'}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
