import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { authLogger } from '@/lib/logger'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: string
      profileComplete: boolean
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    image?: string | null
    role: string
    profileComplete?: boolean
  }
}

// Validar variáveis obrigatórias
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET

if (!GOOGLE_CLIENT_ID) {
  throw new Error('GOOGLE_CLIENT_ID environment variable is required')
}
if (!GOOGLE_CLIENT_SECRET) {
  throw new Error('GOOGLE_CLIENT_SECRET environment variable is required')
}
if (!NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET environment variable is required')
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  debug: process.env.NODE_ENV === 'development',
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          })

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            profileComplete: user.profileComplete,
            image: user.image,
          }
        } catch (error) {
          authLogger.error('Authentication failed', { error })
          return null
        }
      },
    }),
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID!,
      clientSecret: GOOGLE_CLIENT_SECRET!,
      // Permite vincular conta Google ao email já cadastrado via credenciais
      // Seguro para emails institucionais IFCE (@ifce.edu.br)
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      // Apenas na primeira vez (quando user existe) OU quando explicitamente atualizado
      if (user) {
        // Primeira vez - dados vêm do PrismaAdapter ou authorize
        token.role = user.role
        token.sub = user.id
        token.profileComplete = user.profileComplete

        authLogger.debug('JWT callback - primeira vez', {
          userId: user.id,
          role: user.role,
          profileComplete: user.profileComplete,
        })
      } else if (trigger === 'update' && token.sub) {
        // Atualização explícita via update() - buscar dados atualizados do banco
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            role: true,
            profileComplete: true,
            name: true,
            email: true,
          },
        })

        if (dbUser) {
          token.role = dbUser.role
          token.profileComplete = dbUser.profileComplete
          token.name = dbUser.name
          token.email = dbUser.email

          authLogger.debug('JWT callback - atualização', {
            userId: token.sub,
            role: dbUser.role,
            profileComplete: dbUser.profileComplete,
          })
        }
      }
      // Chamadas subsequentes: apenas retornar o token sem modificações
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.profileComplete = token.profileComplete as boolean
      }
      return session
    },
    async signIn({ user, account, profile }) {
      authLogger.info('SignIn callback iniciado', {
        provider: account?.provider,
        email: user.email,
        userId: user.id,
        accountType: account?.type,
        profileData: profile ? { name: profile.name, email: profile.email } : null,
      })

      if (account?.provider === 'google') {
        try {
          authLogger.debug('Processando login Google', {
            email: user.email,
            profileData: {
              name: profile?.name,
              email: profile?.email,
              picture: (profile as any)?.picture,
              email_verified: (profile as any)?.email_verified,
            },
          })

          // Verificar se o email foi verificado pelo Google
          if (!(profile as any)?.email_verified) {
            authLogger.security('Google login blocked - email not verified', { email: user.email })
            return false
          }

          // Opcional: Validar domínio permitido
          // if (!user.email?.endsWith('@empresa.com')) {
          //   console.log('❌ [SIGNIN] Domínio não autorizado')
          //   console.error('Google login blocked - unauthorized domain', { email: user.email }) // Replaced logger.security
          //   return false
          // }

          authLogger.info('Google login authorized', { email: user.email })

          // PrismaAdapter irá criar/atualizar o usuário automaticamente
          // Não é necessário criar manualmente
          return true
        } catch (error) {
          authLogger.error('Google login error', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            email: user.email,
          })
          return false
        }
      }

      authLogger.debug('Login com outros providers permitido')
      return true
    },
    async redirect({ url, baseUrl }) {
      authLogger.debug('Redirect callback chamado', { url, baseUrl })

      // Permitir URLs relativas
      if (url.startsWith('/')) {
        authLogger.debug('Redirect - URL relativa', { url })
        return `${baseUrl}${url}`
      }

      // Permitir URLs da mesma origem
      try {
        if (new URL(url).origin === baseUrl) {
          authLogger.debug('Redirect - mesma origem permitida', { url })
          return url
        }
      } catch (error) {
        authLogger.warn('Erro ao parsear URL no redirect', { error })
      }

      // Fallback: redirecionar para dashboard baseado no role
      // O middleware irá redirecionar conforme role e profileComplete
      authLogger.debug('Redirect - fallback para dashboard')
      return `${baseUrl}/dashboard`
    },
  },
  secret: NEXTAUTH_SECRET!,
}
