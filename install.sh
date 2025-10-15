#!/bin/bash

echo "🚀 Instalando dependências do projeto..."

# Backend
echo "📦 Instalando backend..."
cd backend
npm install
cd ..

# Frontend Admin
echo "📦 Instalando frontend-admin..."
cd frontend-admin
npm install
cd ..

# PWA Estagiário
echo "📦 Instalando pwa-estagiario..."
cd pwa-estagiario
npm install
cd ..

# Kiosk
echo "📦 Instalando kiosk..."
cd kiosk
npm install
cd ..

echo "✅ Todas as dependências foram instaladas!"
echo ""
echo "Para iniciar o projeto:"
echo "  docker-compose up -d"
echo ""
echo "Ou manualmente:"
echo "  cd backend && npm run start:dev"
echo "  cd frontend-admin && npm run dev"
echo "  cd pwa-estagiario && npm run dev"
echo "  cd kiosk && npm run dev"
