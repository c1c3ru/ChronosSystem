/**
 * Sistema de logging estruturado e seguro
 * Remove dados sensíveis automaticamente
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

interface LogContext {
  userId?: string
  sessionId?: string
  ip?: string
  userAgent?: string
  action?: string
  resource?: string
  timestamp?: string
  [key: string]: any
}

interface LogEntry {
  level: LogLevel
  message: string
  context: LogContext
  timestamp: string
  service: string
}

class Logger {
  private serviceName: string
  private logLevel: LogLevel

  constructor(serviceName: string = 'chronos-system') {
    this.serviceName = serviceName
    this.logLevel = process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG
  }

  /**
   * Remove dados sensíveis do contexto
   */
  private sanitizeContext(context: LogContext): LogContext {
    const sanitized = { ...context }
    
    // Lista de campos sensíveis para remover
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'authorization',
      'cookie',
      'session',
      'twoFactorSecret',
      'qrData'
    ]
    
    // Remover campos sensíveis
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]'
      }
    }
    
    // Mascarar email parcialmente
    if (sanitized.email && typeof sanitized.email === 'string') {
      const email = sanitized.email
      const [local, domain] = email.split('@')
      if (local && domain) {
        sanitized.email = `${local.substring(0, 2)}***@${domain}`
      }
    }
    
    // Mascarar IP parcialmente
    if (sanitized.ip && typeof sanitized.ip === 'string') {
      const parts = sanitized.ip.split('.')
      if (parts.length === 4) {
        sanitized.ip = `${parts[0]}.${parts[1]}.***.***.`
      }
    }
    
    return sanitized
  }

  /**
   * Criar entrada de log estruturada
   */
  private createLogEntry(level: LogLevel, message: string, context: LogContext = {}): LogEntry {
    return {
      level,
      message,
      context: this.sanitizeContext(context),
      timestamp: new Date().toISOString(),
      service: this.serviceName
    }
  }

  /**
   * Formatar log para output
   */
  private formatLog(entry: LogEntry): string {
    const levelNames = ['ERROR', 'WARN', 'INFO', 'DEBUG']
    const levelName = levelNames[entry.level]
    
    if (process.env.NODE_ENV === 'production') {
      // JSON estruturado para produção
      return JSON.stringify(entry)
    } else {
      // Formato legível para desenvolvimento
      const contextStr = Object.keys(entry.context).length > 0 
        ? ` | ${JSON.stringify(entry.context)}`
        : ''
      return `[${entry.timestamp}] ${levelName}: ${entry.message}${contextStr}`
    }
  }

  /**
   * Fazer log se o nível permitir
   */
  private log(level: LogLevel, message: string, context: LogContext = {}) {
    if (level <= this.logLevel) {
      const entry = this.createLogEntry(level, message, context)
      const formatted = this.formatLog(entry)
      
      switch (level) {
        case LogLevel.ERROR:
          console.error(formatted)
          break
        case LogLevel.WARN:
          console.warn(formatted)
          break
        case LogLevel.INFO:
          console.info(formatted)
          break
        case LogLevel.DEBUG:
          console.log(formatted)
          break
      }
    }
  }

  /**
   * Métodos públicos de logging
   */
  error(message: string, context: LogContext = {}) {
    this.log(LogLevel.ERROR, message, context)
  }

  warn(message: string, context: LogContext = {}) {
    this.log(LogLevel.WARN, message, context)
  }

  info(message: string, context: LogContext = {}) {
    this.log(LogLevel.INFO, message, context)
  }

  debug(message: string, context: LogContext = {}) {
    this.log(LogLevel.DEBUG, message, context)
  }

  /**
   * Logs específicos para segurança
   */
  security(action: string, context: LogContext = {}) {
    this.error(`SECURITY: ${action}`, {
      ...context,
      security: true,
      action
    })
  }

  /**
   * Logs de auditoria
   */
  audit(action: string, resource: string, context: LogContext = {}) {
    this.info(`AUDIT: ${action} on ${resource}`, {
      ...context,
      audit: true,
      action,
      resource
    })
  }

  /**
   * Logs de performance
   */
  performance(operation: string, duration: number, context: LogContext = {}) {
    this.info(`PERFORMANCE: ${operation} took ${duration}ms`, {
      ...context,
      performance: true,
      operation,
      duration
    })
  }
}

// Instância global do logger
export const logger = new Logger()

// Loggers específicos por módulo
export const authLogger = new Logger('auth')
export const qrLogger = new Logger('qr-scanner')
export const apiLogger = new Logger('api')
export const dbLogger = new Logger('database')

/**
 * Helper para medir performance
 */
export function withPerformanceLogging<T>(
  operation: string,
  fn: () => Promise<T>,
  context: LogContext = {}
): Promise<T> {
  const start = Date.now()
  
  return fn()
    .then(result => {
      const duration = Date.now() - start
      logger.performance(operation, duration, context)
      return result
    })
    .catch(error => {
      const duration = Date.now() - start
      logger.error(`${operation} failed after ${duration}ms`, {
        ...context,
        error: error.message
      })
      throw error
    })
}

/**
 * Decorator para logging automático de métodos
 */
export function logMethod(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value
  
  descriptor.value = function (...args: any[]) {
    const className = target.constructor.name
    const methodName = `${className}.${propertyName}`
    
    logger.debug(`Calling ${methodName}`, {
      method: methodName,
      args: args.length
    })
    
    try {
      const result = method.apply(this, args)
      
      if (result instanceof Promise) {
        return result
          .then(res => {
            logger.debug(`${methodName} completed successfully`)
            return res
          })
          .catch(error => {
            logger.error(`${methodName} failed`, {
              method: methodName,
              error: error.message
            })
            throw error
          })
      }
      
      logger.debug(`${methodName} completed successfully`)
      return result
    } catch (error: any) {
      logger.error(`${methodName} failed`, {
        method: methodName,
        error: error.message
      })
      throw error
    }
  }
  
  return descriptor
}
