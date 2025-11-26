/**
 * Centralized Security Headers Configuration
 * Implements comprehensive security headers following OWASP best practices
 */

export interface SecurityHeadersConfig {
    enableCSP?: boolean
    enableHSTS?: boolean
    enableFrameProtection?: boolean
    cspDirectives?: Record<string, string[]>
}

/**
 * Build Content Security Policy (CSP) header
 */
export function buildCSP(customDirectives?: Record<string, string[]>): string {
    const defaultDirectives = {
        'default-src': ["'self'"],
        'script-src': [
            "'self'",
            "'unsafe-inline'", // Required for Next.js
            "'unsafe-eval'", // Required for Next.js dev mode
            'https://vercel.live', // Vercel toolbar
        ],
        'style-src': [
            "'self'",
            "'unsafe-inline'", // Required for styled-components and CSS-in-JS
            'https://fonts.googleapis.com',
        ],
        'font-src': [
            "'self'",
            'https://fonts.gstatic.com',
            'data:',
        ],
        'img-src': [
            "'self'",
            'data:',
            'blob:',
            'https:', // Allow images from HTTPS sources
        ],
        'media-src': [
            "'self'",
            'blob:', // Required for camera/video
        ],
        'connect-src': [
            "'self'",
            'https://vercel.live', // Vercel toolbar
            'data:',
            'blob:',
        ],
        'frame-src': [
            "'self'",
        ],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        'frame-ancestors': ["'none'"], // Prevent clickjacking
        'upgrade-insecure-requests': [], // Upgrade HTTP to HTTPS
    }

    // Merge with custom directives
    const directives = { ...defaultDirectives, ...customDirectives }

    // Build CSP string
    return Object.entries(directives)
        .map(([key, values]) => {
            if (values.length === 0) {
                return key
            }
            return `${key} ${values.join(' ')}`
        })
        .join('; ')
}

/**
 * Get all security headers
 */
export function getSecurityHeaders(config: SecurityHeadersConfig = {}): Record<string, string> {
    const {
        enableCSP = true,
        enableHSTS = true,
        enableFrameProtection = true,
        cspDirectives,
    } = config

    const headers: Record<string, string> = {}

    // Content Security Policy
    if (enableCSP) {
        headers['Content-Security-Policy'] = buildCSP(cspDirectives)
    }

    // HTTP Strict Transport Security (HSTS)
    if (enableHSTS && process.env.NODE_ENV === 'production') {
        // Only enable HSTS in production with HTTPS
        headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
    }

    // Prevent clickjacking
    if (enableFrameProtection) {
        headers['X-Frame-Options'] = 'DENY'
    }

    // Prevent MIME type sniffing
    headers['X-Content-Type-Options'] = 'nosniff'

    // Referrer Policy
    headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'

    // XSS Protection (legacy, but still good to have)
    headers['X-XSS-Protection'] = '1; mode=block'

    // Permissions Policy (formerly Feature Policy)
    headers['Permissions-Policy'] = [
        'camera=(self)', // Allow camera for QR scanning
        'microphone=()', // Deny microphone
        'geolocation=(self)', // Allow geolocation
        'payment=()', // Deny payment
        'usb=()', // Deny USB
        'magnetometer=()', // Deny magnetometer
        'accelerometer=()', // Deny accelerometer
        'gyroscope=()', // Deny gyroscope
    ].join(', ')

    return headers
}

/**
 * Apply security headers to a Response object
 */
export function applySecurityHeaders(
    response: Response,
    config?: SecurityHeadersConfig
): Response {
    const headers = getSecurityHeaders(config)

    Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
    })

    return response
}

/**
 * Create a new Response with security headers
 */
export function createSecureResponse(
    body: BodyInit | null,
    init?: ResponseInit,
    config?: SecurityHeadersConfig
): Response {
    const response = new Response(body, init)
    return applySecurityHeaders(response, config)
}

/**
 * Security headers for development (more permissive)
 */
export function getDevSecurityHeaders(): Record<string, string> {
    return getSecurityHeaders({
        enableHSTS: false, // Don't enable HSTS in development
        cspDirectives: {
            'script-src': [
                "'self'",
                "'unsafe-inline'",
                "'unsafe-eval'", // Allow eval in development
                'https://vercel.live',
            ],
        },
    })
}

/**
 * Security headers for production (strict)
 */
export function getProdSecurityHeaders(): Record<string, string> {
    return getSecurityHeaders({
        enableCSP: true,
        enableHSTS: true,
        enableFrameProtection: true,
    })
}
