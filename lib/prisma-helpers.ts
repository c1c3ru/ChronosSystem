import { prisma } from '@/lib/prisma'
import { UserWith2FA, User2FASelect, User2FAUpdate, UserWith2FAFields } from '@/types/prisma-extensions'

// Helper type-safe para operações de 2FA
export const prisma2FA = {
  // Buscar usuário completo com campos de 2FA
  async findUserWith2FA(userId: string): Promise<UserWith2FA | null> {
    return prisma.user.findUnique({
      where: { id: userId }
    }) as Promise<UserWith2FA | null>
  },

  // Buscar apenas campos de 2FA
  async find2FAFields(userId: string): Promise<User2FASelect | null> {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        twoFactorEnabled: true,
        twoFactorSecret: true
      }
    }) as Promise<User2FASelect | null>
  },

  // Buscar campos de 2FA com ID e email
  async find2FAWithUserInfo(userId: string): Promise<UserWith2FAFields | null> {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        twoFactorEnabled: true,
        twoFactorSecret: true
      }
    }) as Promise<UserWith2FAFields | null>
  },

  // Update com campos de 2FA
  async update2FA(userId: string, data: User2FAUpdate): Promise<UserWith2FA> {
    return prisma.user.update({
      where: { id: userId },
      data
    }) as Promise<UserWith2FA>
  },

  // Habilitar 2FA
  async enable2FA(userId: string, secret: string): Promise<UserWith2FA> {
    return this.update2FA(userId, {
      twoFactorSecret: secret,
      twoFactorEnabled: true
    })
  },

  // Desabilitar 2FA
  async disable2FA(userId: string): Promise<UserWith2FA> {
    return this.update2FA(userId, {
      twoFactorEnabled: false,
      twoFactorSecret: null
    })
  },

  // Configurar secret temporário (sem habilitar)
  async setupSecret(userId: string, secret: string): Promise<UserWith2FA> {
    return this.update2FA(userId, {
      twoFactorSecret: secret,
      twoFactorEnabled: false
    })
  },

  // Verificar se 2FA está habilitado
  async is2FAEnabled(userId: string): Promise<boolean> {
    const user = await this.find2FAFields(userId)
    return user?.twoFactorEnabled || false
  },

  // Verificar se tem secret configurado
  async hasSecret(userId: string): Promise<boolean> {
    const user = await this.find2FAFields(userId)
    return !!user?.twoFactorSecret
  }
}
