import { NextResponse } from 'next/server'

export async function GET() {
  const config = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV
  }
  
  console.log('🔍 [DEBUG] Configuração Google:', config)
  
  return NextResponse.json(config)
}
