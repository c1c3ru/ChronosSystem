// lib/client-crypto.ts

interface ClientQRPayload {
  machineId: string
  timestamp: number
  window: number
  expiresIn: number
  version: string
}

export interface ClientSecureQRData {
  payload: string // base64url encoded
  signature: string // HMAC-SHA256 signature
  fullQR: string // payload.signature
}

// Converte string para array buffer
function textToArrayBuffer(text: string): ArrayBuffer {
  const encoded = new TextEncoder().encode(text)
  return encoded.buffer.slice(encoded.byteOffset, encoded.byteOffset + encoded.byteLength)
}

// Converte array buffer para base64url
function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  const base64 = btoa(binary)
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Gera um QR code seguro com assinatura HMAC-SHA256 usando Web Crypto API
 * Totalmente Client-Side.
 */
export async function generateClientSecureQR(
  machineId: string,
  machineSecretHex: string,
  expiresIn: number = 60
): Promise<ClientSecureQRData> {
  const now = Date.now()
  // A janela de tempo (window) muda a cada `expiresIn` segundos
  const window = Math.floor(now / (expiresIn * 1000))

  const payload: ClientQRPayload = {
    machineId,
    timestamp: now,
    window,
    expiresIn,
    version: 'v1.1-client',
  }

  const payloadJson = JSON.stringify(payload)
  const payloadBase64 = arrayBufferToBase64Url(textToArrayBuffer(payloadJson))

  // Importar a chave HMAC-SHA256
  // machineSecretHex está em Hex, precisamos converter para Uint8Array
  const secretBytes = new Uint8Array(
    machineSecretHex.match(/[\da-f]{2}/gi)?.map((h) => parseInt(h, 16)) || []
  )

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  // Assinar o payload
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    textToArrayBuffer(payloadBase64)
  )

  const signature = arrayBufferToBase64Url(signatureBuffer)
  const fullQR = `${payloadBase64}.${signature}`

  return {
    payload: payloadBase64,
    signature,
    fullQR,
  }
}
