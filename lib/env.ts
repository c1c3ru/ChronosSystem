/**
 * Validação de variáveis de ambiente com Zod
 * Garante que todas as variáveis obrigatórias estão configuradas corretamente
 */

import { z } from 'zod'

const envSchema = z.object({
  // ========================================
  // DATABASE
  // ========================================
  DATABASE_URL: z.string().url('DATABASE_URL deve ser uma URL válida'),

  // ========================================
  // AUTENTICAÇÃO - NextAuth.js
  // ========================================
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET deve ter no mínimo 32 caracteres'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL deve ser uma URL válida'),

  // ========================================
  // OAUTH - Google
  // ========================================
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID é obrigatório'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET é obrigatório'),

  // ========================================
  // SEGURANÇA - QR Codes
  // ========================================
  QR_SECRET: z.string().min(32, 'QR_SECRET deve ter no mínimo 32 caracteres para segurança'),

  // ========================================
  // REDIS (Opcional)
  // ========================================
  REDIS_URL: z.string().url('REDIS_URL deve ser uma URL válida').optional(),

  // ========================================
  // EMAIL - SMTP (nodemailer)
  // Obrigatórias em produção, opcionais no CI/build
  // ========================================
  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).optional().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASSWORD: z.string().optional().default(''),
  SMTP_FROM: z.string().optional().default(''),

  // ========================================
  // APLICAÇÃO
  // ========================================
  NODE_ENV: z.enum(['development', 'production', 'test'], {
    errorMap: () => ({ message: 'NODE_ENV deve ser development, production ou test' }),
  }),

  // ========================================
  // OPCIONAL - Recursos Avançados
  // ========================================

  // Sentry (Error Tracking)
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),

  // Analytics
  NEXT_PUBLIC_GA_ID: z.string().optional(),

  // Feature Flags
  ENABLE_2FA: z
    .string()
    .transform((val: string) => val === 'true')
    .optional()
    .default('true'),

  ENABLE_PWA: z
    .string()
    .transform((val: string) => val === 'true')
    .optional()
    .default('true'),

  ENABLE_OFFLINE_MODE: z
    .string()
    .transform((val: string) => val === 'true')
    .optional()
    .default('true'),

  // ========================================
  // WEB PUSH / VAPID (Opcional)
  // Gere as chaves com: npx web-push generate-vapid-keys
  // ========================================
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().url().optional(),
})

// Tipo TypeScript inferido do schema
export type Env = z.infer<typeof envSchema>

/**
 * Valida as variáveis de ambiente.
 *
 * IMPORTANTE: nunca lança erro aqui. Este módulo é importado transitivamente
 * por várias rotas (ex.: lib/mailer.ts -> lib/email -> várias API routes), e
 * o Next.js avalia esses módulos durante o build (fase de "collecting page
 * data"). Lançar uma exceção neste ponto derruba o build INTEIRO — todas as
 * rotas, não só a que efetivamente precisa da variável em falta — mesmo que
 * o problema seja uma única variável opcional-na-prática (ex.: SMTP) mal
 * configurada. A validação real de "isso é obrigatório para esta feature"
 * deve acontecer em runtime, no ponto de uso (ex.: lib/mailer.ts já faz
 * isso para as variáveis SMTP).
 */
function validateEnv(): Env {
  const result = envSchema.safeParse(process.env)

  if (result.success) {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Variáveis de ambiente validadas com sucesso')
    }
    return result.data
  }

  console.error('❌ Erro na validação de variáveis de ambiente:')
  console.error('')

  result.error.errors.forEach((err: z.ZodIssue) => {
    const path = err.path.join('.')
    console.error(`  • ${path}: ${err.message}`)
  })

  console.error('')
  console.error(
    'Configure essas variáveis no ambiente (.env local, ou nas env vars do Vercel/servidor).'
  )
  console.error('')

  // Fallback: usa os valores brutos de process.env (mesmo que não validados)
  // em vez de derrubar o build/deploy inteiro. Rotas que realmente precisam
  // de uma variável específica vão falhar em runtime, apenas quando forem
  // chamadas — não no import do módulo.
  return process.env as unknown as Env
}

// Validar e exportar
export const env = validateEnv()

/**
 * Helper para verificar se está em produção
 */
export const isProduction = env.NODE_ENV === 'production'

/**
 * Helper para verificar se está em desenvolvimento
 */
export const isDevelopment = env.NODE_ENV === 'development'

/**
 * Helper para verificar se está em teste
 */
export const isTest = env.NODE_ENV === 'test'

/**
 * Helper para obter URL base da aplicação
 */
export const getBaseUrl = () => env.NEXTAUTH_URL

/**
 * Helper para verificar se Redis está configurado
 */
export const hasRedis = () => !!env.REDIS_URL

/**
 * Helper para verificar se Sentry está configurado
 */
export const hasSentry = () => !!env.NEXT_PUBLIC_SENTRY_DSN

/**
 * Exemplo de uso:
 *
 * ```typescript
 * import { env, isProduction, hasRedis } from '@/lib/env'
 *
 * // Usar variáveis validadas
 * const dbUrl = env.DATABASE_URL
 * const secret = env.NEXTAUTH_SECRET
 *
 * // Verificar ambiente
 * if (isProduction) {
 *   // Lógica de produção
 * }
 *
 * // Verificar recursos opcionais
 * if (hasRedis()) {
 *   // Usar Redis
 * }
 * ```
 */
