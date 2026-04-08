#!/bin/bash

# Script de build para Vercel
# Ignora erros de Prisma engine e usa cache quando disponível

export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
export NEXT_TELEMETRY_DISABLED=1

echo "🔨 Building ChronosSystem..."

# Tentar gerar Prisma, mas não falhar se não conseguir
echo "📦 Gerando Prisma Client..."
npx prisma generate || echo "⚠️ Prisma generate falhou, continuando com cache..."

# Build do Next.js
echo "🏗️ Buildando Next.js..."
npx next build

if [ $? -eq 0 ]; then
  echo "✅ Build concluído com sucesso!"
  exit 0
else
  echo "❌ Build falhou"
  exit 1
fi
