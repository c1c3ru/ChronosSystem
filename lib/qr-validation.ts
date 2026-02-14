/**
 * Validação de QR Codes no Frontend
 * 
 * Fornece validação prévia antes de enviar ao servidor,
 * permitindo feedback imediato ao usuário.
 */

export interface QRValidationResult {
  isValid: boolean
  type: 'SECURE' | 'JSON' | 'TEXT' | 'INVALID'
  machineId?: string
  error?: string
  warnings?: string[]
  confidence: 'high' | 'medium' | 'low'
  details?: {
    hasNonce?: boolean
    hasExpiration?: boolean
    isExpired?: boolean
    format?: string
  }
}

/**
 * Valida formato de QR code no frontend
 */
export function validateQRFormat(qrData: string): QRValidationResult {
  if (!qrData || typeof qrData !== 'string') {
    return {
      isValid: false,
      type: 'INVALID',
      error: 'QR code vazio ou inválido',
      confidence: 'high'
    }
  }

  const trimmedData = qrData.trim()

  if (trimmedData.length === 0) {
    return {
      isValid: false,
      type: 'INVALID',
      error: 'QR code vazio',
      confidence: 'high'
    }
  }

  // VALIDAÇÃO 1: QR Seguro (HMAC-SHA256)
  if (trimmedData.includes('.')) {
    const parts = trimmedData.split('.')

    if (parts.length === 2) {
      try {
        // Tentar decodificar payload
        const payload = JSON.parse(atob(parts[0]))

        if (payload.machineId && payload.nonce && payload.timestamp) {
          const warnings: string[] = []

          // Verificar expiração no payload
          let isExpired = false
          if (payload.expiresIn) {
            const expirationTime = payload.timestamp + (payload.expiresIn * 1000)
            isExpired = Date.now() > expirationTime

            if (isExpired) {
              warnings.push('QR code pode estar expirado')
            }
          }

          return {
            isValid: true,
            type: 'SECURE',
            machineId: payload.machineId,
            confidence: 'high',
            warnings: warnings.length > 0 ? warnings : undefined,
            details: {
              hasNonce: true,
              hasExpiration: !!payload.expiresIn,
              isExpired,
              format: 'HMAC-SHA256'
            }
          }
        }
      } catch (error) {
        // Payload não é JSON válido
        return {
          isValid: false,
          type: 'INVALID',
          error: 'QR seguro com payload inválido',
          confidence: 'high'
        }
      }
    }

    // Tem ponto mas não é formato seguro válido
    return {
      isValid: false,
      type: 'INVALID',
      error: 'Formato de QR seguro inválido (deve ter payload.signature)',
      confidence: 'high'
    }
  }

  // VALIDAÇÃO 2: QR JSON Simples
  if (trimmedData.startsWith('{') && trimmedData.endsWith('}')) {
    try {
      const qrJson = JSON.parse(trimmedData)
      const machineId = qrJson.machineId || qrJson.id

      if (!machineId) {
        return {
          isValid: false,
          type: 'INVALID',
          error: 'QR JSON sem machineId ou id',
          confidence: 'high'
        }
      }

      const warnings: string[] = []
      let isExpired = false

      // Verificar expiração
      if (qrJson.expires) {
        isExpired = Date.now() > qrJson.expires
        if (isExpired) {
          warnings.push('QR code expirado')
        }
      }

      // Verificar se tem nonce (mais seguro)
      const hasNonce = !!qrJson.nonce

      return {
        isValid: false, // BLOQUEADO: Política de segurança exige QR Code Seguro (HMAC)
        type: 'JSON',
        machineId,
        confidence: hasNonce ? 'medium' : 'low',
        warnings: ['QR Code simples não é mais aceito por segurança'],
        error: 'Este formato de QR Code não é seguro e foi desabilitado',
        details: {
          hasNonce,
          hasExpiration: !!qrJson.expires,
          isExpired,
          format: 'JSON'
        }
      }
    } catch (error) {
      return {
        isValid: false,
        type: 'INVALID',
        error: 'QR JSON malformado',
        confidence: 'high'
      }
    }
  }

  // VALIDAÇÃO 3: Texto Direto (ID da máquina)
  // Verificar se parece com um ID válido
  const textPattern = /^[a-zA-Z0-9_-]+$/

  if (textPattern.test(trimmedData)) {
    // Verificar comprimento razoável
    if (trimmedData.length < 3) {
      return {
        isValid: false,
        type: 'INVALID',
        error: 'ID da máquina muito curto (mínimo 3 caracteres)',
        confidence: 'high'
      }
    }

    if (trimmedData.length > 50) {
      return {
        isValid: false,
        type: 'INVALID',
        error: 'ID da máquina muito longo (máximo 50 caracteres)',
        confidence: 'medium'
      }
    }

    return {
      isValid: false, // BLOQUEADO: Política de segurança exige QR Code Seguro (HMAC)
      type: 'TEXT',
      machineId: trimmedData,
      confidence: 'low',
      error: 'QR Code simples (texto) não é seguro e foi desabilitado',
      warnings: ['Use um QR Code gerado pelo sistema'],
      details: {
        hasNonce: false,
        hasExpiration: false,
        isExpired: false,
        format: 'TEXT'
      }
    }
  }

  // VALIDAÇÃO 4: Formato não reconhecido
  return {
    isValid: false,
    type: 'INVALID',
    error: 'Formato de QR code não reconhecido',
    confidence: 'high',
    details: {
      format: 'UNKNOWN'
    }
  }
}

/**
 * Valida se um QR code é potencialmente perigoso
 */
export function validateQRSecurity(qrData: string): {
  isSafe: boolean
  risks: string[]
  recommendations: string[]
} {
  const risks: string[] = []
  const recommendations: string[] = []

  // Verificar tamanho suspeito
  if (qrData.length > 2000) {
    risks.push('QR code muito longo (possível ataque)')
    recommendations.push('Use QR codes menores para melhor segurança')
  }

  // Verificar caracteres suspeitos
  const suspiciousPatterns = [
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /<script/i,
    /eval\(/i,
    /document\./i,
    /window\./i
  ]

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(qrData)) {
      risks.push('QR code contém código potencialmente malicioso')
      recommendations.push('Não use QR codes de fontes não confiáveis')
      break
    }
  }

  // Verificar URLs suspeitas
  if (qrData.startsWith('http://') && !qrData.startsWith('http://localhost')) {
    risks.push('QR code contém URL não segura (HTTP)')
    recommendations.push('Prefira URLs HTTPS para maior segurança')
  }

  return {
    isSafe: risks.length === 0,
    risks,
    recommendations
  }
}

/**
 * Formata mensagem de erro amigável para o usuário
 */
export function formatQRError(validation: QRValidationResult): string {
  if (validation.isValid) {
    return ''
  }

  const baseError = validation.error || 'QR code inválido'

  // Adicionar sugestões baseadas no tipo de erro
  switch (validation.type) {
    case 'INVALID':
      if (validation.error?.includes('expirado')) {
        return `${baseError}. Solicite um novo QR code.`
      }
      if (validation.error?.includes('JSON')) {
        return `${baseError}. Verifique se o QR code foi gerado corretamente.`
      }
      if (validation.error?.includes('seguro')) {
        return `${baseError}. Use um QR code gerado pelo sistema.`
      }
      return `${baseError}. Verifique se o QR code está correto.`

    default:
      return baseError
  }
}

/**
 * Gera feedback visual para o usuário baseado na validação
 */
export function getQRFeedback(validation: QRValidationResult): {
  icon: string
  color: string
  message: string
  showWarnings: boolean
} {
  if (!validation.isValid) {
    return {
      icon: '❌',
      color: 'red',
      message: formatQRError(validation),
      showWarnings: false
    }
  }

  switch (validation.type) {
    case 'SECURE':
      return {
        icon: '🔒',
        color: 'green',
        message: `QR seguro detectado (${validation.confidence === 'high' ? 'Alta segurança' : 'Segurança média'})`,
        showWarnings: !!validation.warnings?.length
      }

    case 'JSON':
      return {
        icon: '📄',
        color: validation.confidence === 'medium' ? 'yellow' : 'orange',
        message: `QR JSON detectado (${validation.confidence === 'medium' ? 'Segurança média' : 'Segurança baixa'})`,
        showWarnings: !!validation.warnings?.length
      }

    case 'TEXT':
      return {
        icon: '📝',
        color: 'orange',
        message: 'QR simples detectado (Segurança baixa)',
        showWarnings: true
      }

    default:
      return {
        icon: '❓',
        color: 'gray',
        message: 'QR code detectado',
        showWarnings: !!validation.warnings?.length
      }
  }
}
