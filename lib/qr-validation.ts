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
      confidence: 'high',
    }
  }

  const dadosLimpos = qrData.trim()

  if (dadosLimpos.length === 0) {
    return {
      isValid: false,
      type: 'INVALID',
      error: 'QR code vazio',
      confidence: 'high',
    }
  }

  // VALIDAÇÃO 1: QR Seguro (HMAC-SHA256)
  if (dadosLimpos.includes('.')) {
    const partes = dadosLimpos.split('.')

    if (partes.length === 2) {
      try {
        // Função auxiliar para decodificar base64url com segurança no navegador
        const decodificarBase64Url = (dados: string) => {
          const base64 = dados.replace(/-/g, '+').replace(/_/g, '/')
          const preenchido = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
          return atob(preenchido)
        }

        // Tentar decodificar payload
        const payloadJson = decodificarBase64Url(partes[0])
        const cargaUtil = JSON.parse(payloadJson)

        // O novo formato seguro (v1.1-client) usa window e version em vez de nonce
        if (
          cargaUtil.machineId &&
          cargaUtil.timestamp &&
          (cargaUtil.nonce || (cargaUtil.window && cargaUtil.version))
        ) {
          const avisos: string[] = []

          // Verificar expiração no payload
          let estaExpirado = false
          if (cargaUtil.expiresIn) {
            const tempoExpiracao = cargaUtil.timestamp + cargaUtil.expiresIn * 1000
            estaExpirado = Date.now() > tempoExpiracao

            if (estaExpirado) {
              avisos.push('QR code pode estar expirado')
            }
          }

          return {
            isValid: true,
            type: 'SECURE',
            machineId: cargaUtil.machineId,
            confidence: 'high',
            warnings: avisos.length > 0 ? avisos : undefined,
            details: {
              hasNonce: true,
              hasExpiration: !!cargaUtil.expiresIn,
              isExpired: estaExpirado,
              format: 'HMAC-SHA256',
            },
          }
        }
      } catch (erro) {
        // Payload não é JSON válido
        return {
          isValid: false,
          type: 'INVALID',
          error: 'QR seguro com payload inválido',
          confidence: 'high',
        }
      }
    }

    // Tem ponto mas não é formato seguro válido
    return {
      isValid: false,
      type: 'INVALID',
      error: 'Formato de QR seguro inválido (deve ter payload.signature)',
      confidence: 'high',
    }
  }

  // VALIDAÇÃO 2: QR JSON Simples
  if (dadosLimpos.startsWith('{') && dadosLimpos.endsWith('}')) {
    try {
      const qrJson = JSON.parse(dadosLimpos)
      const machineId = qrJson.machineId || qrJson.id

      if (!machineId) {
        return {
          isValid: false,
          type: 'INVALID',
          error: 'QR JSON sem machineId ou id',
          confidence: 'high',
        }
      }

      const avisos: string[] = []
      let estaExpirado = false

      // Verificar expiração
      if (qrJson.expires) {
        estaExpirado = Date.now() > qrJson.expires
        if (estaExpirado) {
          avisos.push('QR code expirado')
        }
      }

      // Verificar se tem nonce (mais seguro)
      const temNonce = !!qrJson.nonce

      return {
        isValid: false, // BLOQUEADO: Política de segurança exige QR Code Seguro (HMAC)
        type: 'JSON',
        machineId,
        confidence: temNonce ? 'medium' : 'low',
        warnings: ['QR Code simples não é mais aceito por segurança'],
        error: 'Este formato de QR Code não é seguro e foi desabilitado',
        details: {
          hasNonce: temNonce,
          hasExpiration: !!qrJson.expires,
          isExpired: estaExpirado,
          format: 'JSON',
        },
      }
    } catch (erro) {
      return {
        isValid: false,
        type: 'INVALID',
        error: 'QR JSON malformado',
        confidence: 'high',
      }
    }
  }

  // VALIDAÇÃO 3: Texto Direto (ID da máquina)
  // Verificar se parece com um ID válido
  const padraoTexto = /^[a-zA-Z0-9_-]+$/

  if (padraoTexto.test(dadosLimpos)) {
    // Verificar comprimento razoável
    if (dadosLimpos.length < 3) {
      return {
        isValid: false,
        type: 'INVALID',
        error: 'ID da máquina muito curto (mínimo 3 caracteres)',
        confidence: 'high',
      }
    }

    if (dadosLimpos.length > 50) {
      return {
        isValid: false,
        type: 'INVALID',
        error: 'ID da máquina muito longo (máximo 50 caracteres)',
        confidence: 'medium',
      }
    }

    return {
      isValid: false, // BLOQUEADO: Política de segurança exige QR Code Seguro (HMAC)
      type: 'TEXT',
      machineId: dadosLimpos,
      confidence: 'low',
      error: 'QR Code simples (texto) não é seguro e foi desabilitado',
      warnings: ['Use um QR Code gerado pelo sistema'],
      details: {
        hasNonce: false,
        hasExpiration: false,
        isExpired: false,
        format: 'TEXT',
      },
    }
  }

  // VALIDAÇÃO 4: Formato não reconhecido
  return {
    isValid: false,
    type: 'INVALID',
    error: 'Formato de QR code não reconhecido',
    confidence: 'high',
    details: {
      format: 'UNKNOWN',
    },
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
  const riscos: string[] = []
  const recomendacoes: string[] = []

  // Verificar tamanho suspeito
  if (qrData.length > 2000) {
    riscos.push('QR code muito longo (possível ataque)')
    recomendacoes.push('Use QR codes menores para melhor segurança')
  }

  // Verificar caracteres suspeitos
  const padroesSuspeitos = [
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /<script/i,
    /eval\(/i,
    /document\./i,
    /window\./i,
  ]

  for (const padrao of padroesSuspeitos) {
    if (padrao.test(qrData)) {
      riscos.push('QR code contém código potencialmente malicioso')
      recomendacoes.push('Não use QR codes de fontes não confiáveis')
      break
    }
  }

  // Verificar URLs suspeitas
  if (qrData.startsWith('http://') && !qrData.startsWith('http://localhost')) {
    riscos.push('QR code contém URL não segura (HTTP)')
    recomendacoes.push('Prefira URLs HTTPS para maior segurança')
  }

  return {
    isSafe: riscos.length === 0,
    risks: riscos,
    recommendations: recomendacoes,
  }
}

/**
 * Formata mensagem de erro amigável para o usuário
 */
export function formatQRError(validacao: QRValidationResult): string {
  if (validacao.isValid) {
    return ''
  }

  const erroBase = validacao.error || 'QR code inválido'

  // Adicionar sugestões baseadas no tipo de erro
  switch (validacao.type) {
    case 'INVALID':
      if (validacao.error?.includes('expirado')) {
        return `${erroBase}. Solicite um novo QR code.`
      }
      if (validacao.error?.includes('JSON')) {
        return `${erroBase}. Verifique se o QR code foi gerado corretamente.`
      }
      if (validacao.error?.includes('seguro')) {
        return `${erroBase}. Use um QR code gerado pelo sistema.`
      }
      return `${erroBase}. Verifique se o QR code está correto.`

    default:
      return erroBase
  }
}

/**
 * Gera feedback visual para o usuário baseado na validação
 */
export function getQRFeedback(validacao: QRValidationResult): {
  icon: string
  color: string
  message: string
  showWarnings: boolean
} {
  if (!validacao.isValid) {
    return {
      icon: '❌',
      color: 'red',
      message: formatQRError(validacao),
      showWarnings: false,
    }
  }

  switch (validacao.type) {
    case 'SECURE':
      return {
        icon: '🔒',
        color: 'green',
        message: `QR seguro detectado (${validacao.confidence === 'high' ? 'Alta segurança' : 'Segurança média'})`,
        showWarnings: !!validacao.warnings?.length,
      }

    case 'JSON':
      return {
        icon: '📄',
        color: validacao.confidence === 'medium' ? 'yellow' : 'orange',
        message: `QR JSON detectado (${validacao.confidence === 'medium' ? 'Segurança média' : 'Segurança baixa'})`,
        showWarnings: !!validacao.warnings?.length,
      }

    case 'TEXT':
      return {
        icon: '📝',
        color: 'orange',
        message: 'QR simples detectado (Segurança baixa)',
        showWarnings: true,
      }

    default:
      return {
        icon: '❓',
        color: 'gray',
        message: 'QR code detectado',
        showWarnings: !!validacao.warnings?.length,
      }
  }
}
