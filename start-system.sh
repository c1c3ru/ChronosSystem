#!/bin/bash

echo "🚀 Iniciando Sistema ChronosSystem (Monolito Next.js)..."

# 1. Limpeza de processos antigos
echo "🛑 Parando processos existentes na porta 5000..."
fuser -k 5000/tcp 2>/dev/null || true
sudo pkill -9 node 2>/dev/null || true

# Verificação se o usuário deseja resetar o banco
if [ "$1" == "--reset-db" ]; then
    echo "⚠️  ATENÇÃO: Recriando o banco de dados do zero a partir do vercel_dump_backup.sql..."
    
    sudo -u postgres psql -p 5432 -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'chronos_db' AND pid <> pg_backend_pid();"
    sudo -u postgres psql -p 5432 -c "DROP DATABASE IF EXISTS chronos_db;"
    sudo -u postgres psql -p 5432 -c "CREATE DATABASE chronos_db OWNER chronos_user;"
    
    echo "📥 Importando Backup..."
    sudo -u postgres psql -p 5432 chronos_db < vercel_dump_backup.sql
    
    echo "🔐 Ajustando Permissões..."
    sudo -u postgres psql -p 5432 -d chronos_db -c "GRANT ALL ON SCHEMA public TO chronos_user;"
    sudo -u postgres psql -p 5432 -d chronos_db -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO chronos_user;"
    sudo -u postgres psql -p 5432 -d chronos_db -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO chronos_user;"
    
    for tbl in $(sudo -u postgres psql -p 5432 -qAt -c "select tablename from pg_tables where schemaname = 'public';" chronos_db); do  
        sudo -u postgres psql -p 5432 -c "alter table \"$tbl\" owner to chronos_user" chronos_db ; 
    done
    
    for seq in $(sudo -u postgres psql -p 5432 -qAt -c "select sequence_name from information_schema.sequences where sequence_schema = 'public';" chronos_db); do  
        sudo -u postgres psql -p 5432 -c "alter sequence \"$seq\" owner to chronos_user" chronos_db ; 
    done
    
    echo "✅ Banco de dados recriado e permissões restauradas!"
fi

# 2. Preparação do Banco de Dados / ORM
echo "🗄️ Gerando cliente Prisma e Sincronizando Schema..."
npx prisma generate
npx prisma db push --accept-data-loss

# 2.1 Limpar cache de rate limiting do Redis
echo "🧹 Limpando cache de rate limiting..."
if command -v redis-cli &> /dev/null; then
    redis-cli KEYS "rate_limit:*" | xargs -r redis-cli DEL 2>/dev/null || true
    echo "✅ Cache de rate limiting limpo"
else
    echo "⚠️ Redis não disponível, rate limits expirarão naturalmente"
fi

# 3. Build da aplicação (garante que mudanças de código entrem em produção)
echo "🔨 Compilando aplicação Next.js..."
npm run build || { echo "❌ FALHA CRÍTICA NO BUILD: A compilação falhou! O servidor não pode ser iniciado sem um build válido."; exit 1; }

# 4. Iniciar o Servidor em Produção
echo "🖥️ Iniciando servidor Chronos na porta 5000..."
nohup npm run start > logs_app.txt 2>&1 &

# 5. Aguardar e Testar
echo "⏳ Aguardando inicialização (10s)..."
sleep 10

# Testar se a porta 5000 respondeu
if curl -s http://localhost:5000 > /dev/null; then
    echo "✅ Sistema iniciado com sucesso!"
    echo "📍 URL de acesso: http://localhost:5000"
else
    echo "❌ O sistema não iniciou corretamente. Verifique o arquivo logs_app.txt"
fi

echo "🔍 Use 'tail -f logs_app.txt' para ver os logs em tempo real."
