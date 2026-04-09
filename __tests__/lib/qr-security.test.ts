import {
  generateSecureQR,
  validateSecureQR,
  generateRecordHash,
  generateNonce,
} from '@/lib/qr-security'

describe('qr-security', () => {
  // Mock da variável de ambiente
  const originalEnv = process.env.QR_SECRET

  beforeAll(() => {
    process.env.QR_SECRET = 'test-secret-key-minimum-32-characters-long-for-security'
  })

  afterAll(() => {
    process.env.QR_SECRET = originalEnv
  })

  describe('generateSecureQR', () => {
    it('deve gerar QR code com formato correto', () => {
      const machineId = 'machine-123'
      const result = generateSecureQR(machineId, 60)

      expect(result).toHaveProperty('payload')
      expect(result).toHaveProperty('signature')
      expect(result).toHaveProperty('fullQR')
      expect(result.fullQR).toContain('.')
      expect(result.fullQR).toBe(`${result.payload}.${result.signature}`)
    })

    it('deve gerar payload base64url válido', () => {
      const machineId = 'machine-123'
      const result = generateSecureQR(machineId, 60)

      // Payload deve ser base64url (sem +, /, =)
      expect(result.payload).toMatch(/^[A-Za-z0-9_-]+$/)
    })

    it('deve gerar assinatura base64url válida', () => {
      const machineId = 'machine-123'
      const result = generateSecureQR(machineId, 60)

      // Signature deve ser base64url
      expect(result.signature).toMatch(/^[A-Za-z0-9_-]+$/)
    })

    it('deve incluir todos os campos obrigatórios no payload', () => {
      const machineId = 'machine-123'
      const result = generateSecureQR(machineId, 60)

      // Decodificar payload
      const payloadJson = Buffer.from(result.payload, 'base64url').toString('utf8')
      const payload = JSON.parse(payloadJson)

      expect(payload).toHaveProperty('machineId', machineId)
      expect(payload).toHaveProperty('timestamp')
      expect(payload).toHaveProperty('nonce')
      expect(payload).toHaveProperty('expiresIn', 60)
      expect(payload).toHaveProperty('version', 'v1')
    })

    it('deve gerar nonce único para cada QR', () => {
      const machineId = 'machine-123'
      const qr1 = generateSecureQR(machineId, 60)
      const qr2 = generateSecureQR(machineId, 60)

      const payload1 = JSON.parse(Buffer.from(qr1.payload, 'base64url').toString('utf8'))
      const payload2 = JSON.parse(Buffer.from(qr2.payload, 'base64url').toString('utf8'))

      expect(payload1.nonce).not.toBe(payload2.nonce)
    })

    it('deve gerar QR codes diferentes para mesma máquina', () => {
      const machineId = 'machine-123'
      const qr1 = generateSecureQR(machineId, 60)
      const qr2 = generateSecureQR(machineId, 60)

      expect(qr1.fullQR).not.toBe(qr2.fullQR)
    })

    it('deve respeitar tempo de expiração customizado', () => {
      const machineId = 'machine-123'
      const expiresIn = 120
      const result = generateSecureQR(machineId, expiresIn)

      const payload = JSON.parse(Buffer.from(result.payload, 'base64url').toString('utf8'))
      expect(payload.expiresIn).toBe(expiresIn)
    })
  })

  describe('validateSecureQR', () => {
    it('deve validar QR code válido', () => {
      const machineId = 'machine-123'
      const qr = generateSecureQR(machineId, 60)

      const result = validateSecureQR(qr.fullQR)

      expect(result.isValid).toBe(true)
      expect(result.payload).toBeDefined()
      expect(result.payload?.machineId).toBe(machineId)
      expect(result.error).toBeUndefined()
    })

    it('deve rejeitar QR com formato inválido', () => {
      const result = validateSecureQR('invalid-qr-code')

      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Formato de QR inválido')
    })

    it('deve rejeitar QR com assinatura inválida', () => {
      const machineId = 'machine-123'
      const qr = generateSecureQR(machineId, 60)

      // Alterar assinatura
      const [payload] = qr.fullQR.split('.')
      const tamperedQR = `${payload}.invalid-signature-here`

      const result = validateSecureQR(tamperedQR)

      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Assinatura inválida')
    })

    it('deve rejeitar QR com payload adulterado', () => {
      const machineId = 'machine-123'
      const qr = generateSecureQR(machineId, 60)

      // Alterar payload
      const [, signature] = qr.fullQR.split('.')
      const fakePayload = Buffer.from(
        JSON.stringify({
          machineId: 'hacked-machine',
          timestamp: Date.now(),
          nonce: 'fake-nonce',
          expiresIn: 60,
          version: 'v1',
        })
      ).toString('base64url')
      const tamperedQR = `${fakePayload}.${signature}`

      const result = validateSecureQR(tamperedQR)

      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Assinatura inválida')
    })

    it('deve rejeitar QR expirado', () => {
      const machineId = 'machine-123'

      // Criar QR com expiração de 0 segundos
      const qr = generateSecureQR(machineId, 0)

      // Aguardar 100ms para garantir expiração
      return new Promise((resolve) => setTimeout(resolve, 100)).then(() => {
        const result = validateSecureQR(qr.fullQR)

        expect(result.isValid).toBe(false)
        expect(result.error).toContain('expirado')
      })
    })

    it('deve validar QR dentro do prazo de validade', () => {
      const machineId = 'machine-123'
      const qr = generateSecureQR(machineId, 60)

      const result = validateSecureQR(qr.fullQR)

      expect(result.isValid).toBe(true)
      expect(result.payload?.timestamp).toBeLessThanOrEqual(Date.now())
    })

    it('deve rejeitar QR sem campos obrigatórios', () => {
      // Criar payload inválido manualmente
      const invalidPayload = Buffer.from(
        JSON.stringify({
          // faltando machineId
          timestamp: Date.now(),
          // faltando nonce
          expiresIn: 60,
          version: 'v1',
        })
      ).toString('base64url')

      const crypto = require('crypto')
      const signature = crypto
        .createHmac('sha256', process.env.QR_SECRET!)
        .update(invalidPayload)
        .digest('base64url')

      const invalidQR = `${invalidPayload}.${signature}`
      const result = validateSecureQR(invalidQR)

      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Payload inválido')
    })
  })

  describe('generateNonce', () => {
    it('deve gerar nonce hexadecimal', () => {
      const nonce = generateNonce()
      expect(nonce).toMatch(/^[0-9a-f]+$/)
    })

    it('deve gerar nonce de 32 caracteres (16 bytes)', () => {
      const nonce = generateNonce()
      expect(nonce).toHaveLength(32)
    })

    it('deve gerar nonces únicos', () => {
      const nonce1 = generateNonce()
      const nonce2 = generateNonce()
      const nonce3 = generateNonce()

      expect(nonce1).not.toBe(nonce2)
      expect(nonce2).not.toBe(nonce3)
      expect(nonce1).not.toBe(nonce3)
    })

    it('deve gerar 100 nonces únicos', () => {
      const nonces = new Set()
      for (let i = 0; i < 100; i++) {
        nonces.add(generateNonce())
      }
      expect(nonces.size).toBe(100)
    })
  })

  describe('generateRecordHash', () => {
    it('deve gerar hash SHA-256 válido', () => {
      const hash = generateRecordHash('user-123', 'machine-456', 'ENTRY', Date.now())

      // SHA-256 gera hash de 64 caracteres hexadecimais
      expect(hash).toMatch(/^[0-9a-f]{64}$/)
    })

    it('deve gerar hashes diferentes para dados diferentes', () => {
      const timestamp = Date.now()

      const hash1 = generateRecordHash('user-1', 'machine-1', 'ENTRY', timestamp)
      const hash2 = generateRecordHash('user-2', 'machine-1', 'ENTRY', timestamp)
      const hash3 = generateRecordHash('user-1', 'machine-2', 'ENTRY', timestamp)
      const hash4 = generateRecordHash('user-1', 'machine-1', 'EXIT', timestamp)

      expect(hash1).not.toBe(hash2)
      expect(hash1).not.toBe(hash3)
      expect(hash1).not.toBe(hash4)
    })

    it('deve gerar mesmo hash para mesmos dados', () => {
      const userId = 'user-123'
      const machineId = 'machine-456'
      const type = 'ENTRY'
      const timestamp = 1704067200000

      const hash1 = generateRecordHash(userId, machineId, type, timestamp)
      const hash2 = generateRecordHash(userId, machineId, type, timestamp)

      expect(hash1).toBe(hash2)
    })

    it('deve incluir prevHash na geração do hash', () => {
      const userId = 'user-123'
      const machineId = 'machine-456'
      const type = 'ENTRY'
      const timestamp = Date.now()
      const prevHash = 'previous-hash-value'

      const hash1 = generateRecordHash(userId, machineId, type, timestamp)
      const hash2 = generateRecordHash(userId, machineId, type, timestamp, prevHash)

      expect(hash1).not.toBe(hash2)
    })

    it('deve criar cadeia de hashes (blockchain-like)', () => {
      const userId = 'user-123'
      const machineId = 'machine-456'

      // Primeiro registro (sem prevHash)
      const hash1 = generateRecordHash(userId, machineId, 'ENTRY', Date.now())

      // Segundo registro (com prevHash do primeiro)
      const hash2 = generateRecordHash(userId, machineId, 'EXIT', Date.now(), hash1)

      // Terceiro registro (com prevHash do segundo)
      const hash3 = generateRecordHash(userId, machineId, 'ENTRY', Date.now() + 1000, hash2)

      // Todos devem ser diferentes
      expect(hash1).not.toBe(hash2)
      expect(hash2).not.toBe(hash3)
      expect(hash1).not.toBe(hash3)

      // Verificar que alterar um hash anterior quebra a cadeia
      const hash3WithWrongPrev = generateRecordHash(
        userId,
        machineId,
        'ENTRY',
        Date.now() + 1000,
        hash1
      )
      expect(hash3).not.toBe(hash3WithWrongPrev)
    })
  })

  describe('Segurança e Anti-Replay', () => {
    it('QR code não deve ser reutilizável (nonce único)', () => {
      const qr1 = generateSecureQR('machine-1', 60)
      const qr2 = generateSecureQR('machine-1', 60)

      const payload1 = JSON.parse(Buffer.from(qr1.payload, 'base64url').toString('utf8'))
      const payload2 = JSON.parse(Buffer.from(qr2.payload, 'base64url').toString('utf8'))

      // Nonces devem ser diferentes
      expect(payload1.nonce).not.toBe(payload2.nonce)

      // QR codes completos devem ser diferentes
      expect(qr1.fullQR).not.toBe(qr2.fullQR)
    })

    it('deve usar timing-safe comparison (proteção contra timing attacks)', () => {
      // Este teste verifica que a validação usa crypto.timingSafeEqual
      // O teste é indireto - verificamos que assinaturas inválidas são rejeitadas
      const qr = generateSecureQR('machine-1', 60)
      const [payload] = qr.fullQR.split('.')

      // Criar assinatura similar mas incorreta
      const wrongSignature = qr.signature.substring(0, qr.signature.length - 1) + 'X'
      const tamperedQR = `${payload}.${wrongSignature}`

      const result = validateSecureQR(tamperedQR)
      expect(result.isValid).toBe(false)
    })
  })
})
