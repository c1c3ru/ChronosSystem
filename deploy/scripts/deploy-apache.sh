#!/bin/bash

# Script de Deploy para Apache - ChronosSystem
# Execute como root ou com sudo

set -e

echo "🚀 Iniciando deploy do ChronosSystem com Apache..."

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Execute este script como root ou com sudo"
    exit 1
fi

# Variáveis
PROJECT_DIR="/home/deppi/ChronosSystem"
WEB_DIR="/var/www/chronos"
APACHE_SITES="/etc/apache2/sites-available"

# Instalar dependências
echo "📦 Instalando dependências..."
apt update
apt install -y apache2 nodejs npm postgresql postgresql-contrib redis-server

# Habilitar módulos do Apache
echo "🔧 Habilitando módulos do Apache..."
a2enmod rewrite
a2enmod proxy
a2enmod proxy_http
a2enmod headers
a2enmod deflate
a2enmod expires
a2enmod ssl

# Instalar PM2 para gerenciar o backend
npm install -g pm2

# Criar diretório web
echo "📁 Criando estrutura de diretórios..."
mkdir -p $WEB_DIR
mkdir -p /var/log/chronos

# Build dos frontends
echo "🔨 Fazendo build dos frontends..."

# Frontend Admin
cd $PROJECT_DIR/frontend-admin
npm install
npm run build
cp -r dist $WEB_DIR/frontend-admin

# PWA Estagiário
cd $PROJECT_DIR/pwa-estagiario
npm install
npm run build
cp -r dist $WEB_DIR/pwa-estagiario

# Kiosk
cd $PROJECT_DIR/kiosk
npm install
npm run build
cp -r dist $WEB_DIR/kiosk

# Backend
echo "⚙️ Configurando backend..."
cd $PROJECT_DIR/backend
npm install
npm run build

# Configurar PM2 para o backend
pm2 delete chronos-backend 2>/dev/null || true
pm2 start npm --name "chronos-backend" -- run start:prod
pm2 save
pm2 startup

# Configurar Apache
echo "🌐 Configurando Apache..."
cp $PROJECT_DIR/deploy/apache/chronos-system.conf $APACHE_SITES/

# Habilitar site
a2ensite chronos-system.conf

# Desabilitar site padrão
a2dissite 000-default.conf

# Testar configuração do Apache
apache2ctl configtest

# Configurar permissões
echo "🔒 Configurando permissões..."
chown -R www-data:www-data $WEB_DIR
chmod -R 755 $WEB_DIR

# Configurar banco de dados
echo "🗄️ Configurando banco de dados..."
sudo -u postgres createuser chronos 2>/dev/null || true
sudo -u postgres createdb chronos_db 2>/dev/null || true
sudo -u postgres psql -c "ALTER USER chronos WITH PASSWORD 'chronos123';" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE chronos_db TO chronos;" 2>/dev/null || true

# Executar migrações
cd $PROJECT_DIR/backend
npm run prisma:migrate
npm run prisma:seed

# Reiniciar serviços
echo "🔄 Reiniciando serviços..."
systemctl restart apache2
systemctl enable apache2
systemctl restart redis-server
systemctl enable redis-server
systemctl restart postgresql
systemctl enable postgresql

# Configurar firewall (opcional)
echo "🔥 Configurando firewall..."
ufw allow 'Apache Full' 2>/dev/null || true
ufw allow 22 2>/dev/null || true

echo "✅ Deploy concluído!"
echo ""
echo "📋 URLs de acesso:"
echo "   Admin:     http://admin.chronos.local"
echo "   PWA:       http://pwa.chronos.local"
echo "   Kiosk:     http://kiosk.chronos.local"
echo "   API:       http://api.chronos.local"
echo ""
echo "⚠️  Adicione estas entradas ao seu /etc/hosts para teste local:"
echo "   127.0.0.1 admin.chronos.local"
echo "   127.0.0.1 pwa.chronos.local"
echo "   127.0.0.1 kiosk.chronos.local"
echo "   127.0.0.1 api.chronos.local"
echo ""
echo "🔐 Usuário admin: admin@ponto.com / admin123"
echo ""
echo "📊 Comandos úteis:"
echo "   pm2 status                 # Status do backend"
echo "   pm2 logs chronos-backend   # Logs do backend"
echo "   systemctl status apache2   # Status do Apache"
echo "   tail -f /var/log/apache2/error.log  # Logs do Apache"
