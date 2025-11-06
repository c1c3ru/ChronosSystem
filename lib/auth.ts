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

// Definir variáveis para garantir que estejam disponíveis
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  debug: false,
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
    async jwt({ token, user, account, trigger }) {
      // Se é um novo login ou trigger de update
      if (user || trigger === 'update') {
        if (user) {
          token.role = user.role
          token.sub = user.id
          token.profileComplete = user.profileComplete
        }
        
        // Sempre buscar dados atualizados do banco para garantir consistência
        if (token.sub) {
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
          }
        }
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
      console.log('🔵 [SIGNIN] Callback iniciado:', { 
        provider: account?.provider, 
        email: user.email,
        userId: user.id 
      })
      
      if (account?.provider === 'google') {
        try {
          console.log('🔍 [SIGNIN] Processando login Google para:', user.email)
          
          // Buscar usuário existente no banco de dados
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              profileComplete: true,
              image: true
            }
          })
          
          console.log('👤 [SIGNIN] Usuário existente:', existingUser ? 'SIM' : 'NÃO')

          if (existingUser) {
            console.log('✅ [SIGNIN] Dados do usuário existente:', {
              id: existingUser.id,
              role: existingUser.role,
              profileComplete: existingUser.profileComplete
            })
            
            // Atualizar dados do usuário no objeto user para o JWT
            user.id = existingUser.id
            user.role = existingUser.role
            user.profileComplete = existingUser.profileComplete
            user.name = existingUser.name || user.name
            user.image = existingUser.image || user.image
            
            return true
          } else {
            console.log('📝 [SIGNIN] Criando novo usuário Google')
            
            // Usuário não existe - criar novo com role padrão EMPLOYEE
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                role: 'EMPLOYEE', // Role padrão para novos usuários Google
                profileComplete: false, // SEMPRE false para novos usuários - devem completar perfil
              }
            })
            
            console.log('✅ [SIGNIN] Novo usuário criado:', {
              id: newUser.id,
              role: newUser.role,
              profileComplete: newUser.profileComplete
            })
            
            // Atualizar dados do usuário no objeto user para o JWT
            user.id = newUser.id
            user.role = newUser.role
            user.profileComplete = newUser.profileComplete // false - vai para complete-profile
            
            return true
          }
        } catch (error) {
          console.error('❌ [SIGNIN] Erro ao processar usuário Google:', error)
          return false
        }
      }
      
      console.log('✅ [SIGNIN] Login com outros providers permitido')
      return true
    },
    async redirect({ url, baseUrl }) {
      // Se for callback do Google ou outros providers OAuth
      if (url.includes('/api/auth/callback/')) {
        // Para callbacks OAuth, sempre redirecionar para a página inicial
        // O middleware irá verificar o role e redirecionar adequadamente
        return `${baseUrl}/`
      }
      
      // Se for URL relativa, usar baseUrl
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      
      // Se for mesma origem, permitir
      if (new URL(url).origin === baseUrl) {
        return url
      }
      
      return baseUrl
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
