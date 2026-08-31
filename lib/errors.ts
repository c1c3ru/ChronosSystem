/**
 * Custom Application Errors
 *
 * Provides type-safe error classes for consistent error handling across the application.
 * Each error class includes a status code and error code for API responses.
 */

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface RecoveryAction {
  label: string
  action: string | (() => void)
  description?: string
}

/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string,
    public details?: unknown,
    public userMessage?: string,
    public technicalDetails?: unknown,
    public recoveryActions?: RecoveryAction[],
    public severity: ErrorSeverity = 'medium'
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      error: this.userMessage || this.message,
      code: this.code,
      statusCode: this.statusCode,
      severity: this.severity,
      ...(this.recoveryActions && this.recoveryActions.length > 0
        ? {
            recoveryActions: this.recoveryActions.map((action) => ({
              label: action.label,
              action: typeof action.action === 'string' ? action.action : 'callback',
              description: action.description,
            })),
          }
        : {}),
      ...(process.env.NODE_ENV === 'development' && this.details ? { details: this.details } : {}),
      ...(process.env.NODE_ENV === 'development' && this.technicalDetails
        ? { technicalDetails: this.technicalDetails }
        : {}),
    }
  }
}

/**
 * 401 Unauthorized - User is not authenticated
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Não autenticado', details?: unknown) {
    super(
      message,
      401,
      'UNAUTHORIZED',
      details,
      'Você precisa estar autenticado para acessar este recurso.',
      details,
      [
        { label: 'Fazer login', action: '/auth/signin', description: 'Ir para a página de login' },
        { label: 'Voltar', action: 'back', description: 'Voltar para a página anterior' },
      ],
      'medium'
    )
  }
}

/**
 * 403 Forbidden - User is authenticated but lacks permissions
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Acesso negado', details?: unknown) {
    super(
      message,
      403,
      'FORBIDDEN',
      details,
      'Você não tem permissão para acessar este recurso.',
      details,
      [
        { label: 'Voltar', action: 'back', description: 'Voltar para a página anterior' },
        { label: 'Ir para início', action: '/', description: 'Ir para a página inicial' },
      ],
      'medium'
    )
  }
}
