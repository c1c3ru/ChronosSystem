#!/bin/bash

# Script para deploy no Vercel
# Uso: ./scripts/deploy.sh [production|preview]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Banner
echo "🚀 =========================================="
echo "   DEPLOY SCRIPT - ChronosSystem"
echo "=========================================="
echo ""

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    print_error "Este script deve ser executado na raiz do projeto"
    exit 1
fi

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI não está instalado. Execute: npm i -g vercel"
    exit 1
fi

# Determinar tipo de deploy
DEPLOY_TYPE=${1:-production}

if [ "$DEPLOY_TYPE" != "production" ] && [ "$DEPLOY_TYPE" != "preview" ]; then
    print_error "Tipo de deploy inválido. Use: production ou preview"
    exit 1
fi

print_info "Iniciando deploy para $DEPLOY_TYPE..."

# 1. Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    print_warning "Há mudanças não commitadas. Deseja continuar? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        print_info "Deploy cancelado"
        exit 0
    fi
fi

# 2. Executar testes
print_info "Executando testes..."
if npm test > /dev/null 2>&1; then
    print_success "Testes passaram"
else
    print_warning "Alguns testes falharam. Deseja continuar? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        print_info "Deploy cancelado"
        exit 0
    fi
fi

# 3. Executar build local
print_info "Executando build local..."
if npm run build > /dev/null 2>&1; then
    print_success "Build local bem-sucedido"
else
    print_error "Build local falhou"
    exit 1
fi

# 4. Verificar migração
print_info "Verificando migração..."
if [ -f "scripts/check-migration.sh" ]; then
    if ./scripts/check-migration.sh > /dev/null 2>&1; then
        print_success "Migração verificada"
    else
        print_warning "Verificação de migração falhou. Deseja continuar? (y/N)"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            print_info "Deploy cancelado"
            exit 0
        fi
    fi
fi

# 5. Fazer deploy
print_info "Fazendo deploy para $DEPLOY_TYPE..."

if [ "$DEPLOY_TYPE" = "production" ]; then
    DEPLOY_OUTPUT=$(npx vercel --prod 2>&1)
else
    DEPLOY_OUTPUT=$(npx vercel 2>&1)
fi

DEPLOY_EXIT_CODE=$?

if [ $DEPLOY_EXIT_CODE -eq 0 ]; then
    print_success "Deploy realizado com sucesso!"
    
    # Extrair URL do deploy
    DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -E "https://.*\.vercel\.app" | tail -1 | sed 's/.*\(https:\/\/[^ ]*\).*/\1/')
    
    if [ -n "$DEPLOY_URL" ]; then
        echo ""
        echo "🌐 =========================================="
        echo "   DEPLOY CONCLUÍDO"
        echo "=========================================="
        echo ""
        echo "🔗 URL: $DEPLOY_URL"
        echo "📊 Tipo: $DEPLOY_TYPE"
        echo "⏰ Data: $(date '+%Y-%m-%d %H:%M:%S')"
        echo ""
        
        # Verificar se deploy está funcionando
        print_info "Verificando se deploy está funcionando..."
        
        if curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL" | grep -q "200\|401\|403"; then
            print_success "Deploy está respondendo"
        else
            print_warning "Deploy pode não estar funcionando corretamente"
        fi
        
        # Salvar URL em arquivo
        echo "$DEPLOY_URL" > .vercel/last-deploy-url.txt
        echo "$(date '+%Y-%m-%d %H:%M:%S') - $DEPLOY_TYPE - $DEPLOY_URL" >> .vercel/deploy-history.txt
        
        print_success "URL salva em .vercel/last-deploy-url.txt"
        
        # Abrir no navegador (opcional)
        if command -v xdg-open &> /dev/null; then
            print_info "Deseja abrir o deploy no navegador? (y/N)"
            read -r response
            if [[ "$response" =~ ^[Yy]$ ]]; then
                xdg-open "$DEPLOY_URL"
            fi
        fi
    fi
else
    print_error "Deploy falhou"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

echo ""
echo "=========================================="
print_success "Deploy concluído com sucesso! 🎉"
echo "=========================================="
