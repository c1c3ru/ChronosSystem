import crypto from 'crypto'

// Chave secreta para HMAC - OBRIGATÓRIA
const QR_SECRET = process.env.QR_SECRET
if (!QR_SECRET) {
  throw new Error('QR_SECRET environment variable is required')
}

export interface QRPayload {
  machineId: string
  timestamp: number
  nonce: string
  expiresIn: number // segundos
  version: string
}

export interface SecureQRData {
  payload: string // base64url encoded
  signature: string // HMAC-SHA256 signature
  fullQR: string // payload.signature
}

/**
 * Gera um QR code seguro com assinatura HMAC-SHA256
 */
export function generateSecureQR(machineId: string): SecureQRData {
  // Gerar nonce único
  const nonce = crypto.randomBytes(16).toString('hex')
  
  // Criar payload
  const payload: QRPayload = {
    machineId,
    timestamp: Date.now(),
    nonce,
    expiresIn: 300, // 5 minutos (300 segundos)
    version: 'v1'
  }

  // Converter payload para base64url
  const payloadJson = JSON.stringify(payload)
  const payloadBase64 = Buffer.from(payloadJson).toString('base64url')

  // Gerar assinatura HMAC-SHA256
  const signature = crypto
    .createHmac('sha256', QR_SECRET!)
    .update(payloadBase64)
    .digest('base64url')

  // Combinar payload + signature
  const fullQR = `${payloadBase64}.${signature}`

  return {
    payload: payloadBase64,
    signature,
    fullQR
  }
}

/**
 * Valida um QR code seguro
 */
export function validateSecureQR(qrData: string): {
  isValid: boolean
  payload?: QRPayload
  error?: string
} {
  try {
    // Separar payload e signature
    const parts = qrData.split('.')
    if (parts.length !== 2) {
      return { isValid: false, error: 'Formato de QR inválido' }
    }

    const [payloadBase64, receivedSignature] = parts

    // Recalcular assinatura
    const expectedSignature = crypto
      .createHmac('sha256', QR_SECRET!)
      .update(payloadBase64)
      .digest('base64url')

    // Verificação timing-safe
    if (!crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'base64url'),
      Buffer.from(receivedSignature, 'base64url')
    )) {
      return { isValid: false, error: 'Assinatura inválida' }
    }

    // Decodificar payload
    const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf8')
    const payload: QRPayload = JSON.parse(payloadJson)

    // Validar timestamp (expiração)
    const now = Date.now()
    const expirationTime = payload.timestamp + (payload.expiresIn * 1000)
    
    if (now > expirationTime) {
      return { isValid: false, error: 'QR code expirado' }
    }

    // Validar campos obrigatórios
    if (!payload.machineId || !payload.nonce || !payload.timestamp) {
      return { isValid: false, error: 'Payload inválido' }
    }

    return { isValid: true, payload }

  } catch (error) {
    return { isValid: false, error: 'Erro ao validar QR code' }
  }
}

/**
 * Gera um nonce único para anti-replay
 */
export function generateNonce(): string {
  return crypto.randomBytes(16).toString('hex')
}

/**
 * Verifica se um nonce já foi usado (implementação em memória simples)
 * Em produção, usar Redis ou banco de dados
 */
const usedNonces = new Map<string, number>()

export function isNonceUsed(nonce: string): boolean {
  // Limpar nonces expirados (older than 5 minutes)
  const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)
  const entries = Array.from(usedNonces.entries())
  for (const [key, timestamp] of entries) {
    if (timestamp < fiveMinutesAgo) {
      usedNonces.delete(key)
    }
  }

  return usedNonces.has(nonce)
}

export function markNonceAsUsed(nonce: string): void {
  usedNonces.set(nonce, Date.now())
}

/**
 * Gera hash para integridade de registros (hash chain)
 */
export function generateRecordHash(
  userId: string,
  machineId: string,
  type: string,
  timestamp: number,
  prevHash?: string
): string {
  const data = `${userId}:${machineId}:${type}:${timestamp}:${prevHash || ''}`
  return crypto.createHash('sha256').update(data).digest('hex')
}
