#!/bin/bash

# 🚀 Chronos System - Setup Script
# Este script configura o ambiente de desenvolvimento local

set -e

echo "🏗️  Configurando Chronos System..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js 18+ primeiro."
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js versão 18+ é necessária. Versão atual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) encontrado"

# Instalar dependências
echo "📦 Instalando dependências..."
npm ci

# Configurar arquivo de ambiente
if [ ! -f .env.local ]; then
    echo "⚙️  Criando arquivo .env.local..."
    if [ -f .env.example ]; then
        cp .env.example .env.local
        echo "📝 Configure as variáveis em .env.local antes de continuar"
    else
        echo "⚠️  Arquivo .env.example não encontrado. Criando .env.local básico..."
        cat > .env.local << 'EOF'
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-in-production"

# Google OAuth (opcional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# QR Code Security
QR_SECRET="your-qr-secret-key-change-in-production"
EOF
        echo "📝 Arquivo .env.local criado. Configure as variáveis antes de continuar"
    fi
else
    echo "✅ Arquivo .env.local já existe"
fi

# Gerar Prisma Client
echo "🗄️  Gerando Prisma Client..."
npx prisma generate

# Configurar banco de dados
echo "🗃️  Configurando banco de dados..."
npx prisma db push

# Seed do banco de dados
echo "🌱 Populando banco com dados iniciais..."
npm run db:seed

# Instalar browsers do Playwright (opcional)
read -p "🎭 Instalar browsers do Playwright para testes E2E? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🎭 Instalando browsers do Playwright..."
    npx playwright install
fi

echo ""
echo "🎉 Setup concluído com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Configure as variáveis em .env.local"
echo "   2. Execute: npm run dev"
echo "   3. Acesse: http://localhost:3000"
echo ""
echo "🔐 Credenciais padrão:"
echo "   Admin: admin@chronos.com / admin123"
echo "   Supervisor: supervisor@chronos.com / supervisor123"
echo "   Estagiário: maria@chronos.com / employee123"
echo ""
echo "🧪 Para executar testes:"
echo "   npm test              # Testes unitários"
echo "   npm run test:e2e      # Testes E2E"
echo "   npm run test:all      # Todos os testes"
echo ""
echo "🚀 Para deploy:"
echo "   npm run build         # Build de produção"
echo "   vercel --prod         # Deploy para Vercel"
echo ""
