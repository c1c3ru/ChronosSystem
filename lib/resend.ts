import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY

if (!apiKey) {
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️ RESEND_API_KEY is not defined in environment variables')
  }
}

// Use a dummy key during build/dev if real key is missing to prevent crash
export const resend = new Resend(apiKey || 're_12345678')

export const RESEND_FROM = process.env.RESEND_FROM || 'Chronos <notifications@resend.dev>'
