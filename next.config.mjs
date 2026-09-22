import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n.ts')

const isProd = process.env.NODE_ENV === 'production'

function buildCsp() {
  // 'unsafe-eval'/'wasm-unsafe-eval' foram removidos: existiam apenas para o
  // WebAssembly do @react-pdf/renderer, que não está mais instalado (o
  // projeto migrou para pdfmake). Sem eles a CSP filtra melhor um payload de
  // XSS caso um seja introduzido no futuro. Se uma dependência futura
  // realmente precisar de eval/WASM, reintroduza de forma escopada em vez de
  // uma allowlist ampla e permanente.
  const scriptSrc = ["'self'", "'unsafe-inline'"]

  return [
    `default-src 'self'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    `frame-ancestors 'none'`,
    `form-action 'self'`,
    `script-src ${scriptSrc.join(' ')} blob:`,
    `worker-src 'self' blob:`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com data:`,
    `img-src 'self' data: blob: https:`,
    `media-src 'self' blob:`,
    `connect-src 'self' https: data: blob:`,
    `frame-src 'self' blob: data:`,
    `upgrade-insecure-requests`,
  ].join('; ')
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    '@prisma/client',
    'bcryptjs',
    '@react-pdf/renderer',
    'swagger-ui-react',
    'swagger-client',
  ],
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  // Otimizações de build
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: [
              'camera=(self)',
              'microphone=()',
              'geolocation=(self)',
              'payment=()',
              'usb=()',
              'magnetometer=()',
              'accelerometer=()',
              'gyroscope=()',
            ].join(', '),
          },
          {
            key: 'Content-Security-Policy',
            value: buildCsp(),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: isProd ? 'max-age=31536000; includeSubDomains; preload' : 'max-age=0',
          },
        ],
      },
    ]
  },
}

export default withNextIntl(nextConfig)
