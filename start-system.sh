#!/bin/bash

echo "🚀 Iniciando Sistema ChronosSystem..."

# Parar processos existentes
echo "🛑 Parando processos existentes..."
sudo pkill -f "nest start" || true
sudo pkill -f "vite" || true

# Corrigir permissões
echo "🔧 Corrigindo permissões..."
cd backend
sudo rm -rf dist temp-dist
mkdir -p dist
chmod -R 755 dist
cd ..

# Gerar cliente Prisma
echo "🗄️ Gerando cliente Prisma..."
cd backend
npx prisma generate
cd ..

# Iniciar serviços com Docker
echo "🐳 Iniciando serviços com Docker..."
docker-compose down
docker-compose up -d postgres redis

# Aguardar banco de dados
echo "⏳ Aguardando banco de dados..."
sleep 10

# Executar migrações
echo "📊 Executando migrações..."
cd backend
npx prisma migrate deploy
cd ..

# Iniciar backend
echo "🖥️ Iniciando backend..."
cd backend
npm run start:dev &
cd ..

# Aguardar backend
sleep 15

# Testar backend
echo "🧪 Testando backend..."
curl -s http://localhost:4000/api/health && echo "✅ Backend funcionando!" || echo "❌ Backend com problemas"

# Iniciar frontends
echo "🌐 Iniciando aplicações frontend..."
cd frontend-admin && npm run dev &
cd ../pwa-estagiario && npm run dev -- --port 3001 &
cd ../kiosk && npm run dev -- --port 3002 &
cd ..

echo "🎉 Sistema iniciado!"
echo ""
echo "📍 URLs de acesso:"
echo "   - Admin Dashboard: http://localhost:3000"
echo "   - API Backend: http://localhost:4000"
echo "   - PWA Estagiário: http://localhost:3001"
echo "   - Kiosk: http://localhost:3002"
echo ""
echo "🔍 Para verificar logs:"
echo "   - Backend: tail -f backend/logs/app.log"
echo "   - Docker: docker-compose logs -f"
