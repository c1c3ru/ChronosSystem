import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import { AppError } from './errors'
import { logger } from './logger'

/**
 * Centralized error handler for API routes
 *
 * Handles different types of errors and returns appropriate HTTP responses.
 * Logs errors for monitoring and debugging.
 *
 * @param error - The error to handle
 * @param context - Optional context for logging (e.g., route name, user ID)
 * @returns NextResponse with appropriate error message and status code
 *
 * @example
 * ```typescript
 * try {
 *   // API logic
 * } catch (error) {
 *   return handleApiError(error, { route: '/api/attendance', userId: session.user.id })
 * }
 * ```
 */
export function handleApiError(error: unknown, context?: Record<string, unknown>): NextResponse {
  // AppError - Custom application errors
  if (error instanceof AppError) {
    logger.warn('Application error', {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
      ...context,
    })

    return NextResponse.json(error.toJSON(), { status: error.statusCode })
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    logger.warn('Validation error', {
      errors: error.errors,
      ...context,
    })

    return NextResponse.json(
      {
        error: 'Dados inválidos',
        code: 'VALIDATION_ERROR',
        details: error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      },
      { status: 400 }
    )
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    logger.error('Database error', {
      code: error.code,
      meta: error.meta,
      ...context,
    })

    // Handle specific Prisma errors
    switch (error.code) {
      case 'P2002':
        return NextResponse.json(
          {
            error: 'Registro duplicado',
            code: 'DUPLICATE_ENTRY',
            field: (error.meta?.target as string[])?.[0],
          },
          { status: 409 }
        )
      case 'P2025':
        return NextResponse.json(
          {
            error: 'Registro não encontrado',
            code: 'NOT_FOUND',
          },
          { status: 404 }
        )
      default:
        return NextResponse.json(
          {
            error: 'Erro no banco de dados',
            code: 'DATABASE_ERROR',
          },
          { status: 500 }
        )
    }
  }

  // Unexpected errors - log but don't expose details
  logger.error('Unexpected error', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  })

  return NextResponse.json(
    {
      error: 'Erro interno do servidor',
      code: 'INTERNAL_SERVER_ERROR',
    },
    { status: 500 }
  )
}

/**
 * Error handler for client-side errors
 *
 * @param error - The error to handle
 * @returns User-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Ocorreu um erro inesperado'
}

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}
