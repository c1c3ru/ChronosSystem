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

// Verificar variáveis de ambiente na inicialização
console.log('🔍 [AUTH INIT] GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'DEFINIDO' : 'NÃO DEFINIDO')
console.log('🔍 [AUTH INIT] GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'DEFINIDO' : 'NÃO DEFINIDO')

// Definir variáveis para garantir que estejam disponíveis
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

console.log('🔍 [AUTH INIT] Variáveis locais:', { 
  GOOGLE_CLIENT_ID: GOOGLE_CLIENT_ID ? 'DEFINIDO' : 'NÃO DEFINIDO',
  GOOGLE_CLIENT_SECRET: GOOGLE_CLIENT_SECRET ? 'DEFINIDO' : 'NÃO DEFINIDO'
})

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  debug: true,
  logger: {
    error(code, metadata) {
      console.error('🔥 [NEXTAUTH ERROR]', code, metadata)
    },
    warn(code) {
      console.warn('⚠️ [NEXTAUTH WARN]', code)
    },
    debug(code, metadata) {
      console.log('🔍 [NEXTAUTH DEBUG]', code, metadata)
    }
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔐 [AUTH] Tentativa de login:', credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ [AUTH] Credenciais faltando')
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        console.log('👤 [AUTH] Usuário encontrado:', user ? 'SIM' : 'NÃO')

        if (!user || !user.password) {
          console.log('❌ [AUTH] Usuário não encontrado ou sem senha')
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        console.log('🔑 [AUTH] Senha válida:', isPasswordValid ? 'SIM' : 'NÃO')

        if (!isPasswordValid) {
          console.log('❌ [AUTH] Senha inválida')
          return null
        }

        console.log('✅ [AUTH] Login autorizado para:', user.email)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        }
      }
    }),
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID as string,
      clientSecret: GOOGLE_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
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
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || 'EMPLOYEE'
        token.sub = user.id
        
        // Buscar dados completos do usuário para verificar profileComplete
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { profileComplete: true }
        })
        
        token.profileComplete = dbUser?.profileComplete ?? true
        
        console.log('JWT Callback - User ID:', user.id)
        console.log('JWT Callback - Role:', token.role)
        console.log('JWT Callback - ProfileComplete:', token.profileComplete)
      }
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
      console.log('🔵 [SIGNIN] Callback chamado:', { provider: account?.provider, email: user.email })
      
      if (account?.provider === 'google') {
        console.log('🔵 [SIGNIN] Login com Google detectado')
        try {
          // Verificar se o usuário já existe
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })
          
          console.log('👤 [SIGNIN] Usuário existente:', existingUser ? 'SIM' : 'NÃO')

          if (!existingUser) {
            console.log('📝 [SIGNIN] Criando novo usuário Google')
            // Criar novo usuário
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                role: 'EMPLOYEE', // Role padrão
                profileComplete: true, // Google users have complete profile
              }
            })
            console.log('✅ [SIGNIN] Usuário criado:', newUser.id)
          } else {
            console.log('✅ [SIGNIN] Usuário existente encontrado:', existingUser.id)
          }
          
          console.log('✅ [SIGNIN] Retornando true para Google login')
          return true
        } catch (error) {
          console.error('❌ [SIGNIN] Erro ao processar usuário Google:', error)
          return false
        }
      }
      
      console.log('✅ [SIGNIN] Retornando true para outros providers')
      return true
    },
    async redirect({ url, baseUrl }) {
      console.log('🔄 [REDIRECT] URL:', url, 'BaseURL:', baseUrl)
      
      // Se for callback do Google, redirecionar para employee
      if (url.includes('/api/auth/callback/google')) {
        console.log('🔄 [REDIRECT] Google callback, redirecionando para /employee')
        return `${baseUrl}/employee`
      }
      
      // Se for URL relativa, usar baseUrl
      if (url.startsWith('/')) {
        console.log('🔄 [REDIRECT] URL relativa:', `${baseUrl}${url}`)
        return `${baseUrl}${url}`
      }
      
      // Se for mesma origem, permitir
      if (new URL(url).origin === baseUrl) {
        console.log('🔄 [REDIRECT] Mesma origem:', url)
        return url
      }
      
      console.log('🔄 [REDIRECT] Fallback para baseUrl:', baseUrl)
      return baseUrl
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
