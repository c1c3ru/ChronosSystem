#!/bin/bash

# Script para executar testes do QR Scanner
# Uso: ./scripts/test-qr-scanner.sh [opções]

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

# Função para mostrar ajuda
show_help() {
    echo "🧪 Script de Testes do QR Scanner"
    echo ""
    echo "Uso: $0 [OPÇÃO]"
    echo ""
    echo "Opções:"
    echo "  -h, --help          Mostrar esta ajuda"
    echo "  -a, --all           Executar todos os testes (padrão)"
    echo "  -f, --fast          Executar apenas testes rápidos"
    echo "  -b, --browser NAME  Executar em navegador específico (chromium|firefox|webkit)"
    echo "  -m, --mobile        Executar testes mobile"
    echo "  -d, --debug         Executar em modo debug"
    echo "  -u, --ui            Executar com interface gráfica"
    echo "  -r, --report        Mostrar relatório após execução"
    echo "  -c, --clean         Limpar resultados anteriores"
    echo ""
    echo "Exemplos:"
    echo "  $0                  # Executar todos os testes"
    echo "  $0 -b chromium      # Executar apenas no Chrome"
    echo "  $0 -d               # Executar em modo debug"
    echo "  $0 -u               # Executar com interface gráfica"
    echo "  $0 -f -r            # Testes rápidos + relatório"
}

# Função para verificar se o Playwright está instalado
check_playwright() {
    if ! command -v npx &> /dev/null; then
        print_error "npx não encontrado. Instale o Node.js primeiro."
        exit 1
    fi

    if ! npx playwright --version &> /dev/null; then
        print_error "Playwright não encontrado. Execute: npm install"
        exit 1
    fi

    print_success "Playwright encontrado: $(npx playwright --version)"
}

# Função para verificar se o servidor está rodando
check_server() {
    print_info "Verificando se o servidor está rodando..."
    
    if curl -s http://localhost:3000 > /dev/null; then
        print_success "Servidor rodando em http://localhost:3000"
    else
        print_warning "Servidor não está rodando. Iniciando..."
        npm run dev &
        SERVER_PID=$!
        
        # Aguardar servidor iniciar
        for i in {1..30}; do
            if curl -s http://localhost:3000 > /dev/null; then
                print_success "Servidor iniciado com sucesso"
                return 0
            fi
            sleep 2
        done
        
        print_error "Falha ao iniciar servidor"
        kill $SERVER_PID 2>/dev/null || true
        exit 1
    fi
}

# Função para limpar resultados anteriores
clean_results() {
    print_info "Limpando resultados anteriores..."
    rm -rf test-results/
    rm -rf playwright-report/
    print_success "Resultados limpos"
}

# Função para executar testes
run_tests() {
    local cmd="npx playwright test qr-scanner"
    
    # Adicionar opções baseadas nos parâmetros
    if [ "$BROWSER" != "" ]; then
        cmd="$cmd --project=$BROWSER"
        print_info "Executando no navegador: $BROWSER"
    fi
    
    if [ "$MOBILE" = true ]; then
        cmd="$cmd --project=\"Mobile Chrome\" --project=\"Mobile Safari\""
        print_info "Executando testes mobile"
    fi
    
    if [ "$DEBUG" = true ]; then
        cmd="$cmd --debug"
        print_info "Executando em modo debug"
    fi
    
    if [ "$UI" = true ]; then
        cmd="$cmd --ui"
        print_info "Executando com interface gráfica"
    fi
    
    if [ "$FAST" = true ]; then
        cmd="$cmd --grep=\"deve mostrar interface inicial|deve ativar scanner\""
        print_info "Executando apenas testes rápidos"
    fi
    
    print_info "Comando: $cmd"
    print_info "Iniciando testes do QR Scanner..."
    
    # Executar testes
    if eval $cmd; then
        print_success "Todos os testes passaram! 🎉"
        return 0
    else
        print_error "Alguns testes falharam"
        return 1
    fi
}

# Função para mostrar relatório
show_report() {
    if [ -d "playwright-report" ]; then
        print_info "Abrindo relatório..."
        npx playwright show-report
    else
        print_warning "Nenhum relatório encontrado"
    fi
}

# Função para mostrar estatísticas
show_stats() {
    print_info "📊 Estatísticas dos Testes:"
    
    if [ -f "test-results/.last-run.json" ]; then
        echo "   Última execução: $(date -r test-results/.last-run.json)"
    fi
    
    if [ -d "test-results" ]; then
        local failed_count=$(find test-results -name "*.zip" | wc -l)
        if [ $failed_count -gt 0 ]; then
            echo "   Testes com falha: $failed_count"
        else
            echo "   ✅ Nenhuma falha detectada"
        fi
    fi
    
    if [ -d "playwright-report" ]; then
        echo "   📄 Relatório disponível em: playwright-report/index.html"
    fi
}

# Variáveis padrão
BROWSER=""
MOBILE=false
DEBUG=false
UI=false
FAST=false
SHOW_REPORT=false
CLEAN=false

# Processar argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -a|--all)
            # Padrão, não faz nada
            shift
            ;;
        -f|--fast)
            FAST=true
            shift
            ;;
        -b|--browser)
            BROWSER="$2"
            shift 2
            ;;
        -m|--mobile)
            MOBILE=true
            shift
            ;;
        -d|--debug)
            DEBUG=true
            shift
            ;;
        -u|--ui)
            UI=true
            shift
            ;;
        -r|--report)
            SHOW_REPORT=true
            shift
            ;;
        -c|--clean)
            CLEAN=true
            shift
            ;;
        *)
            print_error "Opção desconhecida: $1"
            show_help
            exit 1
            ;;
    esac
done

# Banner
echo "🧪 =========================================="
echo "   TESTES E2E DO QR SCANNER - ChronosSystem"
echo "=========================================="
echo ""

# Executar ações
if [ "$CLEAN" = true ]; then
    clean_results
fi

check_playwright
check_server

# Executar testes
if run_tests; then
    TEST_SUCCESS=true
else
    TEST_SUCCESS=false
fi

# Mostrar estatísticas
show_stats

# Mostrar relatório se solicitado
if [ "$SHOW_REPORT" = true ]; then
    show_report
fi

# Resultado final
echo ""
echo "=========================================="
if [ "$TEST_SUCCESS" = true ]; then
    print_success "🎉 TESTES CONCLUÍDOS COM SUCESSO!"
else
    print_error "❌ ALGUNS TESTES FALHARAM"
    echo ""
    print_info "Para debug detalhado, execute:"
    print_info "  $0 --debug"
    print_info "  $0 --ui"
    echo ""
fi
echo "=========================================="

# Sair com código apropriado
if [ "$TEST_SUCCESS" = true ]; then
    exit 0
else
    exit 1
fi
