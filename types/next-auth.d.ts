import NextAuth, { DefaultSession, DefaultUser } from 'next-auth'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: string
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    id: string
    email: string
    name?: string | null
    image?: string | null
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    sub: string
  }
}
