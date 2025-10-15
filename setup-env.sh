#!/bin/bash

echo "🔧 Configurando arquivos de ambiente..."

# Copiar arquivos .env.example para .env
cp backend/.env.example backend/.env
cp frontend-admin/.env.example frontend-admin/.env  
cp pwa-estagiario/.env.example pwa-estagiario/.env
cp kiosk/.env.example kiosk/.env

echo "✅ Arquivos .env criados com sucesso!"

echo "🐳 Iniciando serviços Docker..."

# Iniciar Docker Compose
docker-compose up -d

echo "⏳ Aguardando containers iniciarem (30 segundos)..."
sleep 30

echo "📊 Status dos containers:"
docker-compose ps

echo "🗄️ Configurando banco de dados..."

# Executar migrações e seed
docker exec -it ponto-backend npm run prisma:migrate
docker exec -it ponto-backend npm run prisma:seed

echo "🎉 Sistema configurado com sucesso!"
echo ""
echo "📱 URLs de acesso:"
echo "• Admin Dashboard: http://localhost:3000 (admin@ponto.com / admin123)"
echo "• PWA Estagiário: http://localhost:3001 (estagiario@ponto.com / estagio123)"  
echo "• Kiosk: http://localhost:3002"
echo "• API Backend: http://localhost:4000/api"
echo ""
echo "🔍 Para ver logs: docker-compose logs -f [serviço]"
echo "🛑 Para parar: docker-compose down"
