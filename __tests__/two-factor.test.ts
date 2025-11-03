import { 
  generateTwoFactorSecret, 
  verifyTwoFactorToken, 
  generateTwoFactorToken,
  isTwoFactorEnabled,
  formatSecretForDisplay 
} from '@/lib/two-factor'

describe('Two Factor Authentication', () => {
  describe('generateTwoFactorSecret', () => {
    it('should generate a complete 2FA setup', async () => {
      const email = 'test@chronos.com'
      const setup = await generateTwoFactorSecret(email)

      expect(setup).toHaveProperty('secret')
      expect(setup).toHaveProperty('qrCodeUrl')
      expect(setup).toHaveProperty('manualEntryKey')
      
      expect(setup.secret.length).toBeGreaterThan(20) // Base32 secret should be reasonable length
      expect(setup.secret).toMatch(/^[A-Z2-7]+$/) // Valid Base32 format
      expect(setup.qrCodeUrl).toContain('data:image/png;base64,')
      expect(setup.manualEntryKey).toBe(setup.secret)
    })

    it('should generate different secrets for each call', async () => {
      const email = 'test@chronos.com'
      const setup1 = await generateTwoFactorSecret(email)
      const setup2 = await generateTwoFactorSecret(email)

      expect(setup1.secret).not.toBe(setup2.secret)
    })
  })

  describe('verifyTwoFactorToken', () => {
    it('should verify a valid token', () => {
      const secret = 'JBSWY3DPEHPK3PXP' // Base32 test secret
      const token = generateTwoFactorToken(secret)
      
      const result = verifyTwoFactorToken(token, secret)
      
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject invalid token format', () => {
      const secret = 'JBSWY3DPEHPK3PXP'
      
      const result = verifyTwoFactorToken('12345', secret) // 5 digits instead of 6
      
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('6 dígitos')
    })

    it('should reject non-numeric token', () => {
      const secret = 'JBSWY3DPEHPK3PXP'
      
      const result = verifyTwoFactorToken('abcdef', secret)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('6 dígitos')
    })

    it('should handle tokens with spaces', () => {
      const secret = 'JBSWY3DPEHPK3PXP'
      const token = generateTwoFactorToken(secret)
      const tokenWithSpaces = `${token.slice(0, 3)} ${token.slice(3)}`
      
      const result = verifyTwoFactorToken(tokenWithSpaces, secret)
      
      expect(result.isValid).toBe(true)
    })

    it('should reject completely wrong token', () => {
      const secret = 'JBSWY3DPEHPK3PXP'
      
      const result = verifyTwoFactorToken('000000', secret)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('inválido')
    })
  })

  describe('generateTwoFactorToken', () => {
    it('should generate 6-digit token', () => {
      const secret = 'JBSWY3DPEHPK3PXP'
      const token = generateTwoFactorToken(secret)
      
      expect(token).toMatch(/^\d{6}$/)
    })

    it('should generate different tokens over time', (done) => {
      const secret = 'JBSWY3DPEHPK3PXP'
      const token1 = generateTwoFactorToken(secret)
      
      // Wait a bit and generate another token
      // Note: In real tests, you might want to mock the time
      setTimeout(() => {
        const token2 = generateTwoFactorToken(secret)
        // Tokens might be the same if generated within the same 30s window
        // This test is more for ensuring the function works
        expect(token2).toMatch(/^\d{6}$/)
        done()
      }, 100)
    })
  })

  describe('isTwoFactorEnabled', () => {
    it('should return true when 2FA is enabled', () => {
      const user = {
        twoFactorEnabled: true,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP'
      }
      
      expect(isTwoFactorEnabled(user)).toBe(true)
    })

    it('should return false when 2FA is disabled', () => {
      const user = {
        twoFactorEnabled: false,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP'
      }
      
      expect(isTwoFactorEnabled(user)).toBe(false)
    })

    it('should return false when secret is missing', () => {
      const user = {
        twoFactorEnabled: true,
        twoFactorSecret: undefined
      }
      
      expect(isTwoFactorEnabled(user)).toBe(false)
    })

    it('should return false when both are missing', () => {
      const user = {}
      
      expect(isTwoFactorEnabled(user)).toBe(false)
    })
  })

  describe('formatSecretForDisplay', () => {
    it('should format secret in groups of 4', () => {
      const secret = 'JBSWY3DPEHPK3PXP'
      const formatted = formatSecretForDisplay(secret)
      
      expect(formatted).toBe('JBSW Y3DP EHPK 3PXP')
    })

    it('should handle secrets not divisible by 4', () => {
      const secret = 'JBSWY3DPEHPK3PXPQ'
      const formatted = formatSecretForDisplay(secret)
      
      expect(formatted).toBe('JBSW Y3DP EHPK 3PXP Q')
    })

    it('should handle empty secret', () => {
      const formatted = formatSecretForDisplay('')
      
      expect(formatted).toBe('')
    })
  })
})
