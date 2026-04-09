# 🚀 Guia de Deploy - ChronosSystem

Este guia explica como fazer deploy do ChronosSystem em servidores Apache ou Nginx.

## 📋 Pré-requisitos

- Ubuntu/Debian 20.04+ ou CentOS/RHEL 8+
- Acesso root ou sudo
- Domínio configurado (opcional para produção)
- Certificado SSL (recomendado para produção)

## 🎯 Opções de Deploy

### **Opção 1: Nginx (Recomendado)**

- Melhor performance
- Menor uso de recursos
- Ideal para SPAs e PWAs

### **Opção 2: Apache**

- Mais tradicional
- Configuração familiar
- Suporte robusto

## 🚀 Deploy Automático

### **Com Nginx:**

```bash
sudo chmod +x deploy/scripts/deploy-nginx.sh
sudo ./deploy/scripts/deploy-nginx.sh
```

### **Com Apache:**

```bash
sudo chmod +x deploy/scripts/deploy-apache.sh
sudo ./deploy/scripts/deploy-apache.sh
```

## 🛠️ Deploy Manual

### **1. Preparar o Sistema**

#### Ubuntu/Debian:

```bash
sudo apt update
sudo apt install -y curl git

# Para Nginx
sudo apt install -y nginx nodejs npm postgresql redis-server

# Para Apache
sudo apt install -y apache2 nodejs npm postgresql redis-server
```

#### CentOS/RHEL:

```bash
sudo yum update
sudo yum install -y curl git

# Para Nginx
sudo yum install -y nginx nodejs npm postgresql-server redis

# Para Apache
sudo yum install -y httpd nodejs npm postgresql-server redis
```

### **2. Instalar PM2**

```bash
sudo npm install -g pm2
```

### **3. Configurar Banco de Dados**

```bash
# PostgreSQL
sudo -u postgres createuser chronos
sudo -u postgres createdb chronos_db
sudo -u postgres psql -c "ALTER USER chronos WITH PASSWORD 'chronos123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE chronos_db TO chronos;"

# Redis
sudo systemctl start redis
sudo systemctl enable redis
```

### **4. Build dos Frontends**

```bash
# Frontend Admin
cd frontend-admin
npm install
npm run build
sudo cp -r dist /var/www/chronos/frontend-admin

# PWA Estagiário
cd ../pwa-estagiario
npm install
npm run build
sudo cp -r dist /var/www/chronos/pwa-estagiario

# Kiosk
cd ../kiosk
npm install
npm run build
sudo cp -r dist /var/www/chronos/kiosk
```

### **5. Configurar Backend**

```bash
cd backend
npm install
npm run build

# Configurar variáveis de ambiente
cp ../deploy/env/.env.production .env
# Edite o arquivo .env com suas configurações

# Executar migrações
npm run prisma:migrate
npm run prisma:seed

# Iniciar com PM2
pm2 start npm --name "chronos-backend" -- run start:prod
pm2 save
pm2 startup
```

### **6. Configurar Servidor Web**

#### **Para Nginx:**

```bash
sudo cp deploy/nginx/chronos-system.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/chronos-system.conf /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

#### **Para Apache:**

```bash
sudo a2enmod rewrite proxy proxy_http headers deflate expires ssl
sudo cp deploy/apache/chronos-system.conf /etc/apache2/sites-available/
sudo a2ensite chronos-system.conf
sudo a2dissite 000-default.conf
sudo apache2ctl configtest
sudo systemctl restart apache2
```

### **7. Configurar Permissões**

```bash
sudo chown -R www-data:www-data /var/www/chronos
sudo chmod -R 755 /var/www/chronos
```

## 🌐 Configuração de Domínios

### **Para Teste Local:**

Adicione ao `/etc/hosts`:

```
127.0.0.1 admin.chronos.local
127.0.0.1 pwa.chronos.local
127.0.0.1 kiosk.chronos.local
127.0.0.1 api.chronos.local
```

### **Para Produção:**

Configure seus domínios no DNS:

- `admin.seudominio.com` → IP do servidor
- `pwa.seudominio.com` → IP do servidor
- `kiosk.seudominio.com` → IP do servidor
- `api.seudominio.com` → IP do servidor

## 🔒 Configuração SSL (HTTPS)

### **Com Certbot (Let's Encrypt):**

```bash
# Instalar Certbot
sudo apt install -y certbot

# Para Nginx
sudo apt install -y python3-certbot-nginx
sudo certbot --nginx -d admin.seudominio.com -d pwa.seudominio.com

# Para Apache
sudo apt install -y python3-certbot-apache
sudo certbot --apache -d admin.seudominio.com -d pwa.seudominio.com
```

### **Com Certificado Próprio:**

1. Descomente as seções HTTPS nos arquivos de configuração
2. Configure os caminhos dos certificados
3. Reinicie o servidor web

## 📊 Monitoramento

### **Logs do Sistema:**

```bash
# Backend
pm2 logs chronos-backend

# Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Apache
sudo tail -f /var/log/apache2/error.log
sudo tail -f /var/log/apache2/access.log

# PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### **Status dos Serviços:**

```bash
pm2 status                    # Backend
sudo systemctl status nginx  # Nginx
sudo systemctl status apache2 # Apache
sudo systemctl status postgresql
sudo systemctl status redis
```

## 🔧 Manutenção

### **Atualizar Sistema:**

```bash
# Parar backend
pm2 stop chronos-backend

# Atualizar código
git pull origin main

# Rebuild frontends
cd frontend-admin && npm run build && sudo cp -r dist /var/www/chronos/frontend-admin
cd ../pwa-estagiario && npm run build && sudo cp -r dist /var/www/chronos/pwa-estagiario
cd ../kiosk && npm run build && sudo cp -r dist /var/www/chronos/kiosk

# Atualizar backend
cd ../backend
npm install
npm run build
npm run prisma:migrate

# Reiniciar
pm2 restart chronos-backend
```

### **Backup do Banco:**

```bash
sudo -u postgres pg_dump chronos_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### **Restaurar Backup:**

```bash
sudo -u postgres psql chronos_db < backup_file.sql
```

## 🚨 Troubleshooting

### **Problemas Comuns:**

1. **Erro 502 Bad Gateway (Nginx):**
   - Verificar se o backend está rodando: `pm2 status`
   - Verificar logs: `pm2 logs chronos-backend`

2. **Erro 500 Internal Server Error:**
   - Verificar configurações do banco no `.env`
   - Verificar logs do servidor web

3. **PWA não funciona offline:**
   - Verificar se o service worker está sendo servido
   - Verificar headers de cache

4. **Google OAuth não funciona:**
   - Verificar configurações no Google Cloud Console
   - Verificar URLs de callback
   - Verificar variáveis de ambiente

### **Comandos de Diagnóstico:**

```bash
# Testar conectividade do banco
psql -h localhost -U chronos -d chronos_db -c "SELECT 1;"

# Testar Redis
redis-cli ping

# Testar API
curl http://api.chronos.local/health

# Verificar portas
netstat -tlnp | grep :4000
```

## 📞 Suporte

Para problemas específicos:

1. Verificar logs do sistema
2. Consultar documentação do erro
3. Verificar configurações de rede/firewall
4. Testar em ambiente local primeiro

## 🎯 URLs de Acesso

Após o deploy bem-sucedido:

- **Admin Dashboard:** http://admin.chronos.local
- **PWA Estagiário:** http://pwa.chronos.local
- **Kiosk:** http://kiosk.chronos.local
- **API:** http://api.chronos.local

**Usuário admin:** admin@ponto.com / admin123
