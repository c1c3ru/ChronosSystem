// Script para verificar configuração do OAuth
console.log('🔍 Verificando configuração do Google OAuth...\n')

// Verificar variáveis de ambiente
const requiredVars = {
  'NEXTAUTH_URL': process.env.NEXTAUTH_URL,
  'NEXTAUTH_SECRET': process.env.NEXTAUTH_SECRET ? '✓ Configurado' : '❌ Não configurado',
  'GOOGLE_CLIENT_ID': process.env.GOOGLE_CLIENT_ID ? `✓ ${process.env.GOOGLE_CLIENT_ID.substring(0, 20)}...` : '❌ Não configurado',
  'GOOGLE_CLIENT_SECRET': process.env.GOOGLE_CLIENT_SECRET ? '✓ Configurado' : '❌ Não configurado'
}

console.log('📋 Variáveis de Ambiente:')
Object.entries(requiredVars).forEach(([key, value]) => {
  console.log(`   ${key}: ${value}`)
})

console.log('\n🌐 URLs de Callback Esperadas:')
const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
console.log(`   Google: ${baseUrl}/api/auth/callback/google`)

console.log('\n⚙️ Configuração Necessária no Google Cloud Console:')
console.log('   1. Acesse: https://console.cloud.google.com/')
console.log('   2. APIs & Services > Credentials')
console.log('   3. OAuth 2.0 Client IDs > Seu Client ID')
console.log('   4. Authorized redirect URIs:')
console.log(`      - ${baseUrl}/api/auth/callback/google`)

if (process.env.NEXTAUTH_URL?.includes('localhost')) {
  console.log('\n🚨 Modo Desenvolvimento Detectado:')
  console.log('   Certifique-se de que o Google Cloud Console inclui:')
  console.log('   http://localhost:3000/api/auth/callback/google')
}

console.log('\n🔧 Para corrigir o erro redirect_uri_mismatch:')
console.log('   1. Adicione a URL de callback no Google Cloud Console')
console.log('   2. Aguarde alguns minutos para propagação')
console.log('   3. Reinicie o servidor: npm run dev')
console.log('   4. Teste novamente o login')

console.log('\n📝 Arquivo de configuração: .env.local')
console.log('   Certifique-se de que existe e contém as variáveis acima')
