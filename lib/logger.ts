/**
 * Sistema de logging estruturado e seguro
 * Remove dados sensíveis automaticamente
 */

enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogContext {
  userId?: string
  sessionId?: string
  ip?: string
  userAgent?: string
  action?: string
  resource?: string
  timestamp?: string
  [key: string]: unknown
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

  // Nomes de campo tratados como sensíveis em QUALQUER profundidade do
  // contexto (não só no nível superior) — cobre variantes comuns
  // (accessToken, apiKey, twoFactorSecret, Authorization, etc.) via
  // substring case-insensitive. `key`, `session` e `pin` ficam ancorados
  // (^...$) para não capturar campos legítimos como `sessionId`/`userId`.
  private static readonly SENSITIVE_KEY_REGEX =
    /password|token|secret|credential|authoriz|apikey|api_key|cookie|twofactorsecret|qrdata|^key$|^session$|^pin$/i

  // E-mails podem aparecer embutidos em strings livres (ex.: "login:fulano@ifce.edu.br"
  // ou mensagens de erro), não só em campos chamados `email` — por isso a
  // máscara é aplicada a qualquer string, via regex, não a um campo específico.
  private static readonly EMAIL_REGEX = /([a-zA-Z0-9._%+-]{1,64})@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g

  private static readonly MAX_SANITIZE_DEPTH = 6

  private maskEmailsInString(value: string): string {
    return value.replace(
      Logger.EMAIL_REGEX,
      (_match, local: string, domain: string) => `${local.substring(0, 2)}***@${domain}`
    )
  }

  private maskIp(value: string): string {
    const parts = value.split('.')
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.***.***`
    }
    return value
  }

  /**
   * Sanitiza um valor de contexto recursivamente, para que campos sensíveis
   * aninhados (ex.: `{ profileData: { email } }`, `{ user: { password } }`)
   * também sejam redigidos — o antigo código só olhava o nível superior.
   * `seen` evita loop infinito em referências circulares.
   */
  private sanitizeValue(value: unknown, depth: number, seen: WeakSet<object>): unknown {
    if (value === null || value === undefined) return value

    if (typeof value === 'string') {
      return this.maskEmailsInString(value)
    }

    if (typeof value !== 'object') {
      return value
    }

    if (value instanceof Date) {
      return value
    }

    if (value instanceof Error) {
      // Evita logar um Error bruto (propriedades customizadas de erros como
      // os do Prisma podem carregar dados que não passaram pela sanitização).
      return { name: value.name, message: this.maskEmailsInString(value.message) }
    }

    if (depth >= Logger.MAX_SANITIZE_DEPTH || seen.has(value as object)) {
      return '[REDACTED_DEPTH]'
    }
    seen.add(value as object)

    if (Array.isArray(value)) {
      return value.map((item) => this.sanitizeValue(item, depth + 1, seen))
    }

    const result: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (Logger.SENSITIVE_KEY_REGEX.test(key)) {
        result[key] = val ? '[REDACTED]' : val
        continue
      }
      if (key.toLowerCase() === 'ip' && typeof val === 'string') {
        result[key] = this.maskIp(val)
        continue
      }
      result[key] = this.sanitizeValue(val, depth + 1, seen)
    }
    return result
  }

  /**
   * Remove/mascara dados sensíveis do contexto antes de logar
   */
  private sanitizeContext(context: LogContext): LogContext {
    return (this.sanitizeValue(context, 0, new WeakSet<object>()) ?? {}) as LogContext
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
      service: this.serviceName,
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
      const contextStr =
        Object.keys(entry.context).length > 0 ? ` | ${JSON.stringify(entry.context)}` : ''
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
      action,
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
      resource,
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
      duration,
    })
  }
}

// Instância global do logger
export const logger = new Logger()

// Loggers específicos por módulo
export const authLogger = new Logger('auth')
export const qrLogger = new Logger('qr-scanner')
export const apiLogger = new Logger('api')
