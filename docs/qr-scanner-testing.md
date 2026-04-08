# Testes E2E do QR Scanner

## Visão Geral

Este documento descreve os testes end-to-end (E2E) criados para o componente QR Scanner do sistema ChronosSystem. Os testes foram desenvolvidos usando Playwright e cobrem todas as funcionalidades principais do scanner.

## Estrutura dos Testes

### Arquivos de Teste

- **`e2e/qr-scanner.spec.ts`** - Testes principais do QR Scanner
- **`e2e/utils/qr-scanner-helpers.ts`** - Utilitários e helpers para os testes

### Categorias de Teste

#### 1. **Funcionalidades Principais**
- ✅ Interface inicial do scanner
- ✅ Ativação da câmera
- ✅ Detecção de QR codes
- ✅ Tratamento de erros
- ✅ Fechamento do scanner
- ✅ Logs de debug

#### 2. **Compatibilidade entre Navegadores**
- ✅ Chrome com BarcodeDetector nativo
- ✅ Firefox com jsQR fallback
- ✅ Safari com jsQR fallback

#### 3. **Integração com Sistema de Ponto**
- ✅ Processamento de QR codes válidos
- ✅ Tratamento de QR codes inválidos
- ✅ Chamadas de API para registro de ponto

#### 4. **Testes de Performance**
- ✅ Tempo de inicialização (< 5 segundos)
- ✅ Tempo de detecção (< 2 segundos)

## Como Executar os Testes

### Pré-requisitos

```bash
# Instalar dependências do Playwright (se ainda não instalado)
npm install
npx playwright install
```

### Executar Todos os Testes

```bash
# Executar todos os testes E2E
npm run test:e2e

# Ou diretamente com Playwright
npx playwright test
```

### Executar Apenas os Testes do QR Scanner

```bash
# Executar apenas os testes do QR Scanner
npx playwright test qr-scanner

# Com interface gráfica
npx playwright test qr-scanner --ui

# Com debug
npx playwright test qr-scanner --debug
```

### Executar em Navegadores Específicos

```bash
# Apenas Chrome
npx playwright test qr-scanner --project=chromium

# Apenas Firefox
npx playwright test qr-scanner --project=firefox

# Apenas Safari
npx playwright test qr-scanner --project=webkit

# Mobile
npx playwright test qr-scanner --project="Mobile Chrome"
```

## Funcionalidades Testadas

### 1. Interface Inicial

```typescript
test('deve mostrar interface inicial do scanner', async ({ page }) => {
  // Verifica se o botão "Ativar Scanner" está visível
  // Verifica se o ícone da câmera está presente
  // Verifica se a interface está corretamente renderizada
})
```

### 2. Ativação da Câmera

```typescript
test('deve ativar scanner e mostrar câmera', async ({ page }) => {
  // Simula clique no botão de ativação
  // Verifica se o elemento <video> está visível
  // Verifica se o overlay de scanning está presente
  // Verifica se o status "Scanner ativo" é mostrado
})
```

### 3. Detecção de QR Code

```typescript
test('deve simular detecção de QR code', async ({ page }) => {
  // Simula a detecção de um QR code válido
  // Verifica se o código é processado
  // Verifica se há feedback visual para o usuário
})
```

### 4. Tratamento de Erros

```typescript
test('deve tratar erros de câmera', async ({ page }) => {
  // Simula erro de permissão da câmera
  // Verifica se a mensagem de erro é mostrada
  // Verifica se o botão "Tentar Novamente" está presente
})
```

## Mocks e Simulações

### Mock da Câmera

Os testes usam mocks da API `getUserMedia` para simular o acesso à câmera:

```typescript
Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
  value: async () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1280
    canvas.height = 720
    return canvas.captureStream()
  }
})
```

### Mock do BarcodeDetector

Para navegadores que suportam a API nativa:

```typescript
window.BarcodeDetector = class {
  constructor() {}
  async detect() {
    return [{ rawValue: 'TEST_QR_CODE' }]
  }
}
```

### Simulação de Detecção

```typescript
// Simula a detecção de um QR code
await page.evaluate((code) => {
  const event = new CustomEvent('qr-detected', { detail: code })
  document.dispatchEvent(event)
}, 'SAMPLE_QR_CODE')
```

## Dados de Teste

### QR Codes de Teste

```typescript
export const QR_TEST_DATA = {
  VALID_QR_CODE: 'EMP123456789',
  MACHINE_QR_CODE: 'MACHINE_001_VALID_QR',
  INVALID_QR_CODE: 'INVALID_CODE_123',
  MALFORMED_QR_CODE: '###INVALID###'
}
```

### Seletores CSS

```typescript
export const QR_SELECTORS = {
  SCANNER_CONTAINER: '[data-testid="qr-scanner"], .qr-scanner',
  ACTIVATE_BUTTON: 'button:has-text("Ativar Scanner")',
  VIDEO_ELEMENT: 'video',
  SCANNING_OVERLAY: 'div:has(div[class*="border"])',
  ACTIVE_STATUS: 'text=/Scanner ativo|✅/i',
  ERROR_MESSAGE: 'text=/Erro|Error/i',
  RETRY_BUTTON: 'button:has-text("Tentar Novamente")',
  CLOSE_BUTTON: 'button:has(svg), button:has-text("×")',
  SUCCESS_MESSAGE: 'text=/Ponto registrado|Sucesso/i'
}
```

## Relatórios e Debug

### Visualizar Relatórios

```bash
# Gerar e abrir relatório HTML
npx playwright show-report
```

### Debug com Interface Gráfica

```bash
# Abrir interface de debug
npx playwright test qr-scanner --ui
```

### Captura de Screenshots

Os testes automaticamente capturam screenshots em caso de falha. Os arquivos ficam em:
- `test-results/`
- `playwright-report/`

### Logs de Console

Os testes capturam logs do console que contenham:
- `[CAMERA]` - Logs da inicialização da câmera
- `[QR]` - Logs da detecção de QR codes
- `[TEST]` - Logs específicos dos testes

## Troubleshooting

### Problemas Comuns

#### 1. **Testes falhando por timeout**
```bash
# Aumentar timeout global
npx playwright test --timeout=60000
```

#### 2. **Problemas de permissão de câmera**
```typescript
// Garantir que as permissões estão configuradas
await page.context().grantPermissions(['camera'])
```

#### 3. **Elementos não encontrados**
```typescript
// Usar waitFor para aguardar elementos
await expect(element).toBeVisible({ timeout: 10000 })
```

### Debug Avançado

#### Executar com trace

```bash
# Gerar trace para debug detalhado
npx playwright test qr-scanner --trace=on
```

#### Executar em modo headed

```bash
# Ver o navegador durante os testes
npx playwright test qr-scanner --headed
```

#### Pausar execução

```typescript
// Adicionar breakpoint no teste
await page.pause()
```

## Métricas de Performance

### Benchmarks Esperados

- **Inicialização do scanner**: < 5 segundos
- **Detecção de QR code**: < 2 segundos
- **Processamento do resultado**: < 1 segundo

### Monitoramento

Os testes incluem medições de performance:

```typescript
const startTime = Date.now()
// ... ação sendo testada
const endTime = Date.now()
const duration = endTime - startTime

expect(duration).toBeLessThan(5000) // 5 segundos
```

## Integração com CI/CD

### GitHub Actions

```yaml
- name: Run QR Scanner Tests
  run: |
    npx playwright test qr-scanner
    npx playwright show-report
```

### Configuração para CI

```typescript
// playwright.config.ts
export default defineConfig({
  // Configurações específicas para CI
  workers: process.env.CI ? 1 : undefined,
  retries: process.env.CI ? 2 : 0,
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  }
})
```

## Próximos Passos

### Melhorias Planejadas

1. **Testes de Acessibilidade**
   - Verificar compatibilidade com screen readers
   - Testar navegação por teclado

2. **Testes de Responsividade**
   - Diferentes tamanhos de tela
   - Orientação portrait/landscape

3. **Testes de Stress**
   - Múltiplas detecções consecutivas
   - Uso prolongado da câmera

4. **Testes de Rede**
   - Comportamento offline
   - Latência de rede alta

### Contribuindo

Para adicionar novos testes:

1. Use os helpers em `qr-scanner-helpers.ts`
2. Siga o padrão de nomenclatura existente
3. Adicione logs descritivos
4. Documente novos casos de teste

---

**Documentação atualizada em:** Novembro 2024  
**Versão dos testes:** 1.0.0  
**Compatibilidade:** Playwright 1.40+
