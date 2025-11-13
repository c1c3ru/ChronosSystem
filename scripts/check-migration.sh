#!/bin/bash

# Script para verificar o progresso da migração
# Uso: ./scripts/check-migration.sh

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
echo "🔍 =========================================="
echo "   VERIFICAÇÃO DE MIGRAÇÃO - ChronosSystem"
echo "=========================================="
echo ""

print_info "Verificando progresso da migração..."

# 1. Verificar uso de APIs antigas no código
print_info "1. Verificando uso de APIs antigas no código..."

LEGACY_API_USAGE=$(grep -r "qr-scan\|simple-register\|qr/validate" app/ --exclude-dir=node_modules 2>/dev/null | grep -v "qr-unified" | wc -l)

if [ "$LEGACY_API_USAGE" -eq 0 ]; then
    print_success "Nenhum uso de APIs antigas encontrado no código"
else
    print_warning "Encontrados $LEGACY_API_USAGE usos de APIs antigas:"
    grep -r "qr-scan\|simple-register\|qr/validate" app/ --exclude-dir=node_modules 2>/dev/null | grep -v "qr-unified" | head -5
fi

# 2. Verificar funções deprecated
print_info "2. Verificando uso de funções deprecated..."

DEPRECATED_FUNCTIONS=$(grep -r "isNonceUsed\|markNonceAsUsed" app/ --exclude-dir=node_modules 2>/dev/null | wc -l)

if [ "$DEPRECATED_FUNCTIONS" -eq 0 ]; then
    print_success "Nenhuma função deprecated encontrada no código"
else
    print_warning "Encontradas $DEPRECATED_FUNCTIONS funções deprecated:"
    grep -r "isNonceUsed\|markNonceAsUsed" app/ --exclude-dir=node_modules 2>/dev/null | head -3
fi

# 3. Verificar se API unificada existe
print_info "3. Verificando API unificada..."

if [ -f "app/api/attendance/qr-unified/route.ts" ]; then
    print_success "API unificada encontrada"
else
    print_error "API unificada não encontrada!"
fi

# 4. Verificar se APIs antigas ainda existem
print_info "4. Verificando APIs antigas..."

LEGACY_APIS=0

if [ -f "app/api/attendance/qr-scan/route.ts" ]; then
    print_warning "API legacy qr-scan ainda existe (OK para compatibilidade)"
    LEGACY_APIS=$((LEGACY_APIS + 1))
fi

if [ -f "app/api/qr/validate/route.ts" ]; then
    print_error "API qr/validate ainda existe (deveria ter sido removida)"
    LEGACY_APIS=$((LEGACY_APIS + 1))
fi

if [ -f "app/api/attendance/simple-register/route.ts" ]; then
    print_error "API simple-register ainda existe (deveria ter sido removida)"
    LEGACY_APIS=$((LEGACY_APIS + 1))
fi

# 5. Verificar testes
print_info "5. Verificando testes..."

if [ -f "__tests__/qr-security.test.ts" ]; then
    print_success "Testes de segurança QR encontrados"
    
    # Executar testes
    if npm test -- __tests__/qr-security.test.ts > /dev/null 2>&1; then
        print_success "Testes de segurança QR passando"
    else
        print_warning "Alguns testes de segurança QR falhando"
    fi
else
    print_warning "Testes de segurança QR não encontrados"
fi

# 6. Verificar documentação
print_info "6. Verificando documentação..."

if [ -f "docs/api-deprecation.md" ]; then
    print_success "Documentação de deprecação encontrada"
else
    print_warning "Documentação de deprecação não encontrada"
fi

if [ -f "docs/migration-plan.md" ]; then
    print_success "Plano de migração encontrado"
else
    print_warning "Plano de migração não encontrado"
fi

# 7. Verificar build
print_info "7. Verificando build..."

if npm run build > /dev/null 2>&1; then
    print_success "Build funcionando corretamente"
else
    print_error "Build falhando"
fi

# 8. Calcular progresso da migração
print_info "8. Calculando progresso da migração..."

TOTAL_CHECKS=8
PASSED_CHECKS=0

# Contabilizar checks passados
[ "$LEGACY_API_USAGE" -eq 0 ] && PASSED_CHECKS=$((PASSED_CHECKS + 1))
[ "$DEPRECATED_FUNCTIONS" -eq 0 ] && PASSED_CHECKS=$((PASSED_CHECKS + 1))
[ -f "app/api/attendance/qr-unified/route.ts" ] && PASSED_CHECKS=$((PASSED_CHECKS + 1))
[ ! -f "app/api/qr/validate/route.ts" ] && PASSED_CHECKS=$((PASSED_CHECKS + 1))
[ ! -f "app/api/attendance/simple-register/route.ts" ] && PASSED_CHECKS=$((PASSED_CHECKS + 1))
[ -f "__tests__/qr-security.test.ts" ] && PASSED_CHECKS=$((PASSED_CHECKS + 1))
[ -f "docs/api-deprecation.md" ] && PASSED_CHECKS=$((PASSED_CHECKS + 1))
npm run build > /dev/null 2>&1 && PASSED_CHECKS=$((PASSED_CHECKS + 1))

PROGRESS=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

echo ""
echo "📊 =========================================="
echo "   RESUMO DA MIGRAÇÃO"
echo "=========================================="
echo ""
echo "✅ Checks passados: $PASSED_CHECKS/$TOTAL_CHECKS"
echo "📈 Progresso: $PROGRESS%"
echo ""

if [ "$PROGRESS" -eq 100 ]; then
    print_success "🎉 MIGRAÇÃO 100% COMPLETA!"
elif [ "$PROGRESS" -ge 80 ]; then
    print_success "🚀 MIGRAÇÃO QUASE COMPLETA ($PROGRESS%)"
elif [ "$PROGRESS" -ge 60 ]; then
    print_warning "🔄 MIGRAÇÃO EM PROGRESSO ($PROGRESS%)"
else
    print_error "⚠️ MIGRAÇÃO PRECISA DE ATENÇÃO ($PROGRESS%)"
fi

echo ""
echo "📋 PRÓXIMAS AÇÕES:"

if [ "$LEGACY_API_USAGE" -gt 0 ]; then
    echo "  - Migrar código que ainda usa APIs antigas"
fi

if [ "$DEPRECATED_FUNCTIONS" -gt 0 ]; then
    echo "  - Remover uso de funções deprecated"
fi

if [ -f "app/api/qr/validate/route.ts" ] || [ -f "app/api/attendance/simple-register/route.ts" ]; then
    echo "  - Remover APIs que deveriam ter sido deletadas"
fi

if [ ! -f "docs/api-deprecation.md" ]; then
    echo "  - Criar documentação de deprecação"
fi

if [ ! -f "docs/migration-plan.md" ]; then
    echo "  - Criar plano de migração"
fi

echo ""
echo "🔗 LINKS ÚTEIS:"
echo "  - Documentação: docs/api-deprecation.md"
echo "  - Plano de migração: docs/migration-plan.md"
echo "  - API unificada: app/api/attendance/qr-unified/route.ts"

echo ""
echo "=========================================="

# Sair com código baseado no progresso
if [ "$PROGRESS" -eq 100 ]; then
    exit 0
elif [ "$PROGRESS" -ge 80 ]; then
    exit 0
else
    exit 1
fi
