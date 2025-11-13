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
      allowDangerousEmailAccountLinking: true,
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
            return false
          }
          
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
            console.log('✅ [SIGNIN] Usuário autorizado encontrado:', {
              id: existingUser.id,
              email: existingUser.email,
              role: existingUser.role,
              profileComplete: existingUser.profileComplete
            })
            
            // Atualizar dados do usuário no objeto user para o JWT
            user.id = existingUser.id
            user.role = existingUser.role
            user.profileComplete = existingUser.profileComplete
            user.name = existingUser.name || user.name
            user.image = existingUser.image || user.image
            
            console.log('🔄 [SIGNIN] Dados do usuário atualizados para JWT:', {
              id: user.id,
              email: user.email,
              role: user.role,
              profileComplete: user.profileComplete
            })
            
            return true
          } else {
            // NOVA ESTRATÉGIA: Criar usuário automaticamente para login Google
            console.log('🆕 [SIGNIN] Criando novo usuário automaticamente:', user.email)
            
            try {
              // Criar novo usuário com role EMPLOYEE por padrão
              const newUser = await prisma.user.create({
                data: {
                  email: user.email!,
                  name: profile?.name || user.name || 'Usuário',
                  image: (profile as any)?.picture || user.image,
                  role: 'EMPLOYEE', // Padrão - pode ser alterado no completar perfil
                  profileComplete: false,
                  createdAt: new Date(),
                  updatedAt: new Date()
                }
              })
              
              console.log('✅ [SIGNIN] Novo usuário criado:', {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
                profileComplete: newUser.profileComplete
              })
              
              // Atualizar dados do usuário no objeto user para o JWT
              user.id = newUser.id
              user.role = newUser.role
              user.profileComplete = newUser.profileComplete
              user.name = newUser.name
              user.image = newUser.image
              
              // Log de auditoria
              await prisma.auditLog.create({
                data: {
                  userId: newUser.id,
                  action: 'AUTO_USER_CREATED_GOOGLE',
                  resource: 'AUTH',
                  details: `Usuário criado automaticamente via Google: ${newUser.email}`
                }
              })
              
              console.log('📝 [SIGNIN] Log de auditoria criado para novo usuário')
              
              return true
              
            } catch (createError) {
              console.error('❌ [SIGNIN] Erro ao criar usuário automaticamente:', createError)
              
              // Log de erro
              try {
                await prisma.auditLog.create({
                  data: {
                    userId: null,
                    action: 'FAILED_AUTO_USER_CREATION',
                    resource: 'AUTH',
                    details: `Falha ao criar usuário automaticamente: ${user.email} - ${createError}`
                  }
                })
              } catch (logError) {
                console.error('❌ [SIGNIN] Erro ao registrar falha de criação:', logError)
              }
              
              return false
            }
          }
        } catch (error) {
          console.error('❌ [SIGNIN] Erro ao processar usuário Google:', error)
          console.error('❌ [SIGNIN] Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
          return false
        }
      }
      
      console.log('✅ [SIGNIN] Login com outros providers permitido')
      return true
    },
    async redirect({ url, baseUrl }) {
      console.log('🔄 [REDIRECT] Callback chamado:', { url, baseUrl })
      
      // Se for callback do Google ou outros providers OAuth
      if (url.includes('/api/auth/callback/')) {
        console.log('📞 [REDIRECT] Callback OAuth detectado, redirecionando para /')
        // Para callbacks OAuth, sempre redirecionar para a página inicial
        // O middleware irá verificar o role e redirecionar adequadamente
        return `${baseUrl}/`
      }
      
      // Se for URL relativa, usar baseUrl
      if (url.startsWith('/')) {
        console.log('🔗 [REDIRECT] URL relativa:', url)
        return `${baseUrl}${url}`
      }
      
      // Se for mesma origem, permitir
      try {
        if (new URL(url).origin === baseUrl) {
          console.log('✅ [REDIRECT] Mesma origem permitida:', url)
          return url
        }
      } catch (error) {
        console.log('❌ [REDIRECT] Erro ao parsear URL:', error)
      }
      
      console.log('🏠 [REDIRECT] Fallback para baseUrl:', baseUrl)
      return baseUrl
    },
  },
  secret: NEXTAUTH_SECRET!,
}
