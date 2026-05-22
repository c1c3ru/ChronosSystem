import { User as PrismaUser } from '@prisma/client'

// Extensão do tipo User para incluir campos de 2FA
export interface UserWith2FA extends PrismaUser {
  twoFactorEnabled: boolean
  twoFactorSecret: string | null
}

// Tipos específicos para seleções de 2FA
export type User2FASelect = {
  twoFactorEnabled: boolean
  twoFactorSecret: string | null
}

export type UserWith2FAFields = {
  id: string
  email: string
  twoFactorEnabled: boolean
  twoFactorSecret: string | null
}

// Helper type para operações de update com 2FA
export type User2FAUpdate = {
  twoFactorEnabled?: boolean
  twoFactorSecret?: string | null
}
