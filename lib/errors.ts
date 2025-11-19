/**
 * Custom Application Errors
 * 
 * Provides type-safe error classes for consistent error handling across the application.
 * Each error class includes a status code and error code for API responses.
 */

/**
 * Base application error class
 */
export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode: number,
        public code: string,
        public details?: unknown
    ) {
        super(message)
        this.name = this.constructor.name
        Error.captureStackTrace(this, this.constructor)
    }

    toJSON() {
        return {
            error: this.message,
            code: this.code,
            statusCode: this.statusCode,
            ...(process.env.NODE_ENV === 'development' && this.details ? { details: this.details } : {}),
        }
    }
}

/**
 * 401 Unauthorized - User is not authenticated
 */
export class UnauthorizedError extends AppError {
    constructor(message = 'Não autenticado', details?: unknown) {
        super(message, 401, 'UNAUTHORIZED', details)
    }
}

/**
 * 403 Forbidden - User is authenticated but lacks permissions
 */
export class ForbiddenError extends AppError {
    constructor(message = 'Acesso negado', details?: unknown) {
        super(message, 403, 'FORBIDDEN', details)
    }
}

/**
 * 400 Bad Request - Invalid input data
 */
export class ValidationError extends AppError {
    constructor(message = 'Dados inválidos', details?: unknown) {
        super(message, 400, 'VALIDATION_ERROR', details)
    }
}

/**
 * 404 Not Found - Resource not found
 */
export class NotFoundError extends AppError {
    constructor(message = 'Recurso não encontrado', details?: unknown) {
        super(message, 404, 'NOT_FOUND', details)
    }
}

/**
 * 409 Conflict - Resource conflict (e.g., duplicate entry)
 */
export class ConflictError extends AppError {
    constructor(message = 'Conflito de dados', details?: unknown) {
        super(message, 409, 'CONFLICT', details)
    }
}

/**
 * 429 Too Many Requests - Rate limit exceeded
 */
export class RateLimitError extends AppError {
    constructor(message = 'Muitas requisições. Tente novamente mais tarde.', details?: unknown) {
        super(message, 429, 'RATE_LIMIT_EXCEEDED', details)
    }
}

/**
 * 500 Internal Server Error - Unexpected server error
 */
export class InternalServerError extends AppError {
    constructor(message = 'Erro interno do servidor', details?: unknown) {
        super(message, 500, 'INTERNAL_SERVER_ERROR', details)
    }
}

/**
 * Business logic errors
 */
export class BusinessError extends AppError {
    constructor(message: string, code: string, details?: unknown) {
        super(message, 400, code, details)
    }
}

/**
 * QR Code specific errors
 */
export class QRCodeError extends AppError {
    constructor(message: string, code: string, details?: unknown) {
        super(message, 400, code, details)
    }
}

export class QRExpiredError extends QRCodeError {
    constructor(message = 'QR Code expirado') {
        super(message, 'QR_EXPIRED')
    }
}

export class QRInvalidError extends QRCodeError {
    constructor(message = 'QR Code inválido') {
        super(message, 'QR_INVALID')
    }
}

export class QRAlreadyUsedError extends QRCodeError {
    constructor(message = 'QR Code já foi utilizado') {
        super(message, 'QR_ALREADY_USED')
    }
}
