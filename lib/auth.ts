import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
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

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    })
  ],
  session: {
    strategy: 'jwt'
  },
  events: {
    async linkAccount({ user, account, profile }) {
      // Log quando uma conta é vinculada
      console.log('Account linked:', { user: user.email, provider: account.provider })
    },
    async createUser({ user }) {
      // Configurar novos usuários criados via OAuth
      // Usuários OAuth precisam completar perfil, usuários de credenciais não
      if (user.email) {
        await (prisma.user as any).update({
          where: { id: user.id },
          data: {
            role: 'EMPLOYEE',
            profileComplete: false // OAuth users need to complete profile
          }
        })
        console.log('New OAuth user configured:', user.email, '- needs to complete profile')
      }
    },
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Buscar dados completos do usuário do banco
        const dbUser = await (prisma.user as any).findUnique({
          where: { id: user.id },
          select: { role: true, profileComplete: true }
        })
        
        token.role = dbUser?.role || 'EMPLOYEE'
        token.sub = user.id
        token.profileComplete = dbUser?.profileComplete || false
      }
      
      // Atualizar token quando a sessão for atualizada
      if (trigger === 'update' && session) {
        // Buscar dados atualizados do usuário
        const updatedUser = await (prisma.user as any).findUnique({
          where: { id: token.sub! },
          select: { role: true, profileComplete: true }
        })
        
        if (updatedUser) {
          token.role = updatedUser.role
          token.profileComplete = updatedUser.profileComplete
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        ;(session.user as any).profileComplete = token.profileComplete as boolean
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        // Verificar se já existe um usuário com este email
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! }
        })
        
        if (existingUser) {
          // Se o usuário existe, permitir vinculação da conta Google
          console.log('Linking Google account to existing user:', user.email)
          return true
        }
      }
      
      // Permitir todos os outros logins
      return true
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
}
