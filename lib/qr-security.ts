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
 * Valida se QR_SECRET está configurado
 */
function validateQRSecret(): void {
  if (!QR_SECRET) {
    throw new Error('QR_SECRET não está configurado. Configure a variável de ambiente QR_SECRET.')
  }
}

/**
 * Gera um QR code seguro com assinatura HMAC-SHA256
 * @param machineId - ID da máquina
 * @param expiresIn - Tempo de expiração em segundos (padrão: 60 segundos)
 */
export function generateSecureQR(machineId: string, expiresIn: number = 60): SecureQRData {
  // Validar QR_SECRET
  validateQRSecret()
  
  // Gerar nonce único
  const nonce = crypto.randomBytes(16).toString('hex')
  
  // Criar payload
  const payload: QRPayload = {
    machineId,
    timestamp: Date.now(),
    nonce,
    expiresIn, // Usar expiresIn do parâmetro
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
    // Validar QR_SECRET
    if (!QR_SECRET) {
      return { isValid: false, error: 'QR_SECRET não está configurado no servidor' }
    }
    
    // Separar payload e signature
    const parts = qrData.split('.')
    if (parts.length !== 2) {
      return { isValid: false, error: 'Formato de QR inválido. Esperado: payload.signature' }
    }

    const [payloadBase64, receivedSignature] = parts

    // Recalcular assinatura
    const expectedSignature = crypto
      .createHmac('sha256', QR_SECRET)
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
 * OTIMIZAÇÃO: Cache de nonce removido
 * 
 * O sistema JÁ usa o banco de dados (QrEvent.used) como fonte principal de verdade.
 * O cache em memória era redundante e causava problemas em deploys/restarts.
 * 
 * A verificação de nonce usado agora é feita APENAS no banco de dados,
 * que é mais confiável e persistente.
 */

export function isNonceUsed(nonce: string): boolean {
  // DEPRECATED: Função mantida para compatibilidade
  // A verificação real é feita no banco de dados via QrEvent.used
  console.warn('⚠️ [QR-SECURITY] isNonceUsed() está deprecated. Use verificação no banco de dados.')
  return false
}

export function markNonceAsUsed(nonce: string): void {
  // DEPRECATED: Função mantida para compatibilidade
  // O nonce é marcado como usado no banco de dados via QrEvent.used
  console.warn('⚠️ [QR-SECURITY] markNonceAsUsed() está deprecated. Use QrEvent.used no banco.')
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
