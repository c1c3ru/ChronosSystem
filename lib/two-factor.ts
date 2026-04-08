import * as speakeasy from 'speakeasy'
import * as QRCode from 'qrcode'

export interface TwoFactorSetup {
  secret: string
  qrCodeUrl: string
  manualEntryKey: string
}

export interface TwoFactorVerification {
  isValid: boolean
  error?: string
}

/**
 * Gera um novo secret para 2FA e QR code
 */
export async function generateTwoFactorSecret(
  userEmail: string,
  serviceName: string = 'Chronos System'
): Promise<TwoFactorSetup> {
  // Gerar secret
  const secret = speakeasy.generateSecret({
    name: userEmail,
    issuer: serviceName,
    length: 32
  })

  // Gerar QR code
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!)

  return {
    secret: secret.base32!,
    qrCodeUrl,
    manualEntryKey: secret.base32!
  }
}

/**
 * Verifica um token 2FA
 */
export function verifyTwoFactorToken(
  token: string,
  secret: string,
  window: number = 1
): TwoFactorVerification {
  try {
    // Remover espaços e caracteres especiais do token
    const cleanToken = token.replace(/\s/g, '')

    // Verificar se o token tem 6 dígitos
    if (!/^\d{6}$/.test(cleanToken)) {
      return {
        isValid: false,
        error: 'Token deve conter exatamente 6 dígitos'
      }
    }

    // Verificar token usando speakeasy
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: cleanToken,
      window: window, // Permite tokens de até 30s antes/depois
      step: 30 // Intervalo de 30 segundos
    })

    return {
      isValid: verified,
      error: verified ? undefined : 'Token inválido ou expirado'
    }

  } catch (error) {
    return {
      isValid: false,
      error: 'Erro ao verificar token 2FA'
    }
  }
}

/**
 * Gera um token 2FA para testes (desenvolvimento)
 */
export function generateTwoFactorToken(secret: string): string {
  return speakeasy.totp({
    secret: secret,
    encoding: 'base32',
    step: 30
  })
}

/**
 * Verifica se um usuário tem 2FA habilitado
 */
export function isTwoFactorEnabled(user: { twoFactorEnabled?: boolean, twoFactorSecret?: string }): boolean {
  return !!(user.twoFactorEnabled && user.twoFactorSecret)
}

/**
 * Gera códigos de backup para 2FA (opcional)
 */
export function generateBackupCodes(count: number = 8): string[] {
  const codes: string[] = []
  
  for (let i = 0; i < count; i++) {
    // Gerar código de 8 caracteres alfanuméricos
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()
    codes.push(code)
  }
  
  return codes
}

/**
 * Formatar secret para exibição manual
 */
export function formatSecretForDisplay(secret: string): string {
  // Dividir em grupos de 4 caracteres para facilitar digitação
  return secret.match(/.{1,4}/g)?.join(' ') || secret
}
