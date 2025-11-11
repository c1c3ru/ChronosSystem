#!/bin/bash

# ===========================================
# CHRONOS SYSTEM - VERCEL ENVIRONMENT SETUP
# ===========================================

echo "🚀 Configurando variáveis de ambiente no Vercel..."

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI não encontrado. Instale com: npm i -g vercel"
    exit 1
fi

# Project configuration
PROJECT_ID="prj_kUDaw1Z8oPHJShwXQk1bbwNCuNP6"
ORG_ID="team_ge7p7mFdCYM0IeLheUarDt1M"

echo "📋 Configurando projeto: $PROJECT_ID"

# Gerar secrets seguros
NEXTAUTH_SECRET=$(openssl rand -base64 32)
QR_SECRET=$(openssl rand -base64 32)

echo "🔐 Secrets gerados com segurança"

# Configurar variáveis de ambiente para produção
echo "⚙️ Configurando variáveis de ambiente..."

# NextAuth
vercel env add NEXTAUTH_URL production --value="https://chronos-system.vercel.app"
vercel env add NEXTAUTH_SECRET production --value="$NEXTAUTH_SECRET"

# QR Security
vercel env add QR_SECRET production --value="$QR_SECRET"

# Environment
vercel env add NODE_ENV production --value="production"
vercel env add NEXT_TELEMETRY_DISABLED production --value="1"

echo "✅ Variáveis de ambiente configuradas!"
echo ""
echo "🔑 SECRETS GERADOS (SALVE EM LOCAL SEGURO):"
echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET"
echo "QR_SECRET=$QR_SECRET"
echo ""
echo "🚀 Agora você pode fazer deploy com:"
echo "vercel --prod"
