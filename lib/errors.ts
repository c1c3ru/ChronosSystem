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
            ...(this.recoveryActions && this.recoveryActions.length > 0 ? {
                recoveryActions: this.recoveryActions.map(action => ({
                    label: action.label,
                    action: typeof action.action === 'string' ? action.action : 'callback',
                    description: action.description
                }))
            } : {}),
            ...(process.env.NODE_ENV === 'development' && this.details ? { details: this.details } : {}),
            ...(process.env.NODE_ENV === 'development' && this.technicalDetails ? { technicalDetails: this.technicalDetails } : {}),
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
                { label: 'Voltar', action: 'back', description: 'Voltar para a página anterior' }
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
                { label: 'Ir para início', action: '/', description: 'Ir para a página inicial' }
            ],
            'medium'
        )
    }
}

/**
 * 400 Bad Request - Invalid input data
 */
export class ValidationError extends AppError {
    constructor(message = 'Dados inválidos', details?: unknown) {
        super(
            message,
            400,
            'VALIDATION_ERROR',
            details,
            'Os dados fornecidos são inválidos. Por favor, verifique e tente novamente.',
            details,
            [
                { label: 'Corrigir dados', action: 'retry', description: 'Revisar e corrigir os dados do formulário' }
            ],
            'low'
        )
    }
}

/**
 * 404 Not Found - Resource not found
 */
export class NotFoundError extends AppError {
    constructor(message = 'Recurso não encontrado', details?: unknown) {
        super(
            message,
            404,
            'NOT_FOUND',
            details,
            'O recurso solicitado não foi encontrado.',
            details,
            [
                { label: 'Voltar', action: 'back', description: 'Voltar para a página anterior' },
                { label: 'Ir para início', action: '/', description: 'Ir para a página inicial' }
            ],
            'low'
        )
    }
}

/**
 * 409 Conflict - Resource conflict (e.g., duplicate entry)
 */
export class ConflictError extends AppError {
    constructor(message = 'Conflito de dados', details?: unknown) {
        super(
            message,
            409,
            'CONFLICT',
            details,
            'Já existe um registro com estes dados.',
            details,
            [
                { label: 'Usar dados diferentes', action: 'retry', description: 'Tentar com dados diferentes' },
                { label: 'Ver registros existentes', action: 'view', description: 'Ver registros existentes' }
            ],
            'medium'
        )
    }
}

/**
 * 429 Too Many Requests - Rate limit exceeded
 */
export class RateLimitError extends AppError {
    constructor(message = 'Muitas requisições. Tente novamente mais tarde.', details?: unknown) {
        super(
            message,
            429,
            'RATE_LIMIT_EXCEEDED',
            details,
            'Você fez muitas requisições. Por favor, aguarde alguns minutos e tente novamente.',
            details,
            [
                { label: 'Aguardar e tentar novamente', action: 'retry', description: 'Aguardar alguns minutos antes de tentar novamente' }
            ],
            'medium'
        )
    }
}

/**
 * 500 Internal Server Error - Unexpected server error
 */
export class InternalServerError extends AppError {
    constructor(message = 'Erro interno do servidor', details?: unknown) {
        super(
            message,
            500,
            'INTERNAL_SERVER_ERROR',
            details,
            'Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver.',
            details,
            [
                { label: 'Tentar novamente', action: 'retry', description: 'Tentar a operação novamente' },
                { label: 'Reportar problema', action: 'report', description: 'Reportar este problema ao suporte' }
            ],
            'high'
        )
    }
}

/**
 * Business logic errors
 */
export class BusinessError extends AppError {
    constructor(message: string, code: string, details?: unknown, userMessage?: string, recoveryActions?: RecoveryAction[]) {
        super(
            message,
            400,
            code,
            details,
            userMessage || message,
            details,
            recoveryActions,
            'medium'
        )
    }
}

/**
 * QR Code specific errors
 */
export class QRCodeError extends AppError {
    constructor(message: string, code: string, details?: unknown, userMessage?: string, recoveryActions?: RecoveryAction[]) {
        super(
            message,
            400,
            code,
            details,
            userMessage || message,
            details,
            recoveryActions,
            'low'
        )
    }
}

export class QRExpiredError extends QRCodeError {
    constructor(message = 'QR Code expirado') {
        super(
            message,
            'QR_EXPIRED',
            undefined,
            'Este QR Code expirou. Por favor, gere um novo QR Code.',
            [
                { label: 'Gerar novo QR Code', action: 'refresh', description: 'Gerar um novo QR Code' }
            ]
        )
    }
}

export class QRInvalidError extends QRCodeError {
    constructor(message = 'QR Code inválido') {
        super(
            message,
            'QR_INVALID',
            undefined,
            'Este QR Code é inválido ou não foi reconhecido.',
            [
                { label: 'Tentar novamente', action: 'retry', description: 'Escanear o QR Code novamente' },
                { label: 'Gerar novo QR Code', action: 'refresh', description: 'Gerar um novo QR Code' }
            ]
        )
    }
}

export class QRAlreadyUsedError extends QRCodeError {
    constructor(message = 'QR Code já foi utilizado') {
        super(
            message,
            'QR_ALREADY_USED',
            undefined,
            'Este QR Code já foi utilizado e não pode ser usado novamente.',
            [
                { label: 'Gerar novo QR Code', action: 'refresh', description: 'Gerar um novo QR Code' }
            ]
        )
    }
}

