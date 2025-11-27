import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

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
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
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
            image: user.image
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    }),
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID!,
      clientSecret: GOOGLE_CLIENT_SECRET!,
      // Removido allowDangerousEmailAccountLinking por segurança
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
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

        console.log('JWT callback - primeira vez:', {
          userId: user.id,
          role: user.role,
          profileComplete: user.profileComplete
        })
      } else if (trigger === 'update' && token.sub) {
        // Atualização explícita via update() - buscar dados atualizados do banco
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            role: true,
            profileComplete: true,
            name: true,
            email: true
          }
        })

        if (dbUser) {
          token.role = dbUser.role
          token.profileComplete = dbUser.profileComplete
          token.name = dbUser.name
          token.email = dbUser.email

          console.log('JWT callback - atualização:', {
            userId: token.sub,
            role: dbUser.role,
            profileComplete: dbUser.profileComplete
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
      console.log('🔵 [SIGNIN] Callback iniciado:', {
        provider: account?.provider,
        email: user.email,
        userId: user.id,
        accountType: account?.type,
        profileData: profile ? { name: profile.name, email: profile.email } : null
      })

      if (account?.provider === 'google') {
        try {
          console.log('🔍 [SIGNIN] Processando login Google para:', user.email)
          console.log('📋 [SIGNIN] Dados do perfil Google:', {
            name: profile?.name,
            email: profile?.email,
            picture: (profile as any)?.picture,
            email_verified: (profile as any)?.email_verified
          })

          // Verificar se o email foi verificado pelo Google
          if (!(profile as any)?.email_verified) {
            console.log('❌ [SIGNIN] Email não verificado pelo Google')
            console.error('Google login blocked - email not verified', { email: user.email }) // Replaced logger.security
            return false
          }

          // Opcional: Validar domínio permitido
          // if (!user.email?.endsWith('@empresa.com')) {
          //   console.log('❌ [SIGNIN] Domínio não autorizado')
          //   console.error('Google login blocked - unauthorized domain', { email: user.email }) // Replaced logger.security
          //   return false
          // }

          console.log('✅ [SIGNIN] Login Google autorizado para:', user.email)
          console.log('Google login authorized', { email: user.email }) // Replaced logger.info

          // PrismaAdapter irá criar/atualizar o usuário automaticamente
          // Não é necessário criar manualmente
          return true

        } catch (error) {
          console.error('❌ [SIGNIN] Erro ao processar usuário Google:', error)
          console.error('❌ [SIGNIN] Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
          console.error('Google login error', { error, email: user.email }) // Replaced logger.error
          return false
        }
      }

      console.log('✅ [SIGNIN] Login com outros providers permitido')
      return true
    },
    async redirect({ url, baseUrl }) {
      console.log('🔄 [REDIRECT] Callback chamado:', { url, baseUrl })

      // Permitir URLs relativas
      if (url.startsWith('/')) {
        console.log('🔗 [REDIRECT] URL relativa:', url)
        return `${baseUrl}${url}`
      }

      // Permitir URLs da mesma origem
      try {
        if (new URL(url).origin === baseUrl) {
          console.log('✅ [REDIRECT] Mesma origem permitida:', url)
          return url
        }
      } catch (error) {
        console.log('❌ [REDIRECT] Erro ao parsear URL:', error)
      }

      // Fallback: redirecionar para dashboard baseado no role
      // O middleware irá redirecionar conforme role e profileComplete
      console.log('🏠 [REDIRECT] Fallback - redirecionando para dashboard')
      return `${baseUrl}/dashboard`
    },
  },
  secret: NEXTAUTH_SECRET!,
}
