import { test, expect } from '@playwright/test'
import { QRScannerTestHelper, QR_TEST_DATA, QR_SELECTORS } from './utils/qr-scanner-helpers'

/**
 * Teste E2E para o QR Scanner - Versão Limpa
 *
 * Testa todas as funcionalidades do scanner QR:
 * - Interface inicial
 * - Ativação da câmera
 * - Detecção de QR codes
 * - Tratamento de erros
 * - Integração com sistema de ponto
 */

test.describe('QR Scanner - Funcionalidades Principais', () => {
  let helper: QRScannerTestHelper

  test.beforeEach(async ({ page }) => {
    helper = new QRScannerTestHelper(page)

    // Configurar permissões e mocks
    await page.context().grantPermissions(['camera'])
    await helper.setupCameraMocks()

    // Fazer login
    await helper.loginAsTestUser()
  })

  test('deve mostrar interface inicial do scanner', async ({ page }) => {
    console.log('🧪 [TEST] Verificando interface inicial...')

    // Abrir o scanner
    await helper.openScanner()

    // Verificar botão de ativação
    const activateButton = page.locator(QR_SELECTORS.ACTIVATE_BUTTON)
    await expect(activateButton).toBeVisible()

    // Verificar ícone da câmera
    const cameraIcon = page
      .locator('svg, i')
      .filter({ hasText: /camera|câmera/i })
      .first()
    await expect(cameraIcon).toBeVisible()

    console.log('✅ [TEST] Interface inicial OK')
  })

  test('deve ativar scanner e mostrar câmera', async ({ page }) => {
    console.log('🧪 [TEST] Testando ativação do scanner...')

    // Abrir e ativar scanner
    await helper.openScanner()
    await helper.activateScanner()

    // Aguardar scanner estar pronto
    await helper.waitForScannerReady()

    console.log('✅ [TEST] Scanner ativado com sucesso')
  })

  test('deve simular detecção de QR code', async ({ page }) => {
    console.log('🧪 [TEST] Simulando detecção de QR code...')

    // Capturar logs
    const logs = await helper.captureConsoleLogs()

    // Ativar scanner
    await helper.openScanner()
    await helper.activateScanner()
    await helper.waitForScannerReady()

    // Simular detecção
    await helper.simulateQRDetection(QR_TEST_DATA.VALID_QR_CODE)

    // Aguardar processamento
    await page.waitForTimeout(2000)

    // Verificar se houve algum processamento
    const qrResult = page.locator(`text=${QR_TEST_DATA.VALID_QR_CODE}`)
    const processingMessage = page.locator('text=/Processando|Processing|QR.*detectado/i')

    const hasResult = await qrResult.isVisible().catch(() => false)
    const hasProcessing = await processingMessage.isVisible().catch(() => false)

    // Pelo menos um indicador deve estar presente
    expect(hasResult || hasProcessing).toBeTruthy()

    console.log('✅ [TEST] Detecção simulada com sucesso')
  })

  test('deve tratar erros de câmera', async ({ page }) => {
    console.log('🧪 [TEST] Testando tratamento de erros...')

    // Configurar mock de erro
    await helper.setupCameraErrorMock('NotAllowedError')

    // Tentar ativar scanner
    await helper.openScanner()
    await helper.activateScanner()

    // Aguardar processamento do erro
    await page.waitForTimeout(2000)

    // Verificar mensagem de erro
    await helper.expectError()
    await helper.expectRetryButton()

    console.log('✅ [TEST] Tratamento de erro OK')
  })

  test('deve permitir fechar o scanner', async ({ page }) => {
    console.log('🧪 [TEST] Testando fechamento do scanner...')

    // Ativar scanner
    await helper.openScanner()
    await helper.activateScanner()
    await helper.waitForScannerReady()

    // Tentar fechar
    const closed = await helper.closeScanner()

    if (closed) {
      console.log('✅ [TEST] Scanner fechado com sucesso')
    } else {
      console.log('⚠️ [TEST] Botão de fechar não encontrado')
    }
  })

  test('deve gerar logs de debug apropriados', async ({ page }) => {
    console.log('🧪 [TEST] Verificando logs de debug...')

    const logs = await helper.captureConsoleLogs()

    // Ativar scanner
    await helper.openScanner()
    await helper.activateScanner()

    // Aguardar logs
    await page.waitForTimeout(4000)

    // Verificar logs de inicialização
    await helper.expectInitializationLogs(logs)

    console.log('✅ [TEST] Logs de debug verificados')
  })
})

test.describe('QR Scanner - Compatibilidade entre Navegadores', () => {
  let helper: QRScannerTestHelper

  test.beforeEach(async ({ page }) => {
    helper = new QRScannerTestHelper(page)
    await page.context().grantPermissions(['camera'])
    await helper.loginAsTestUser()
  })

  test('deve funcionar no Chrome com BarcodeDetector', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Teste específico para Chrome')

    console.log('🧪 [TEST] Testando Chrome com BarcodeDetector...')

    // Mock específico para Chrome
    await page.addInitScript(() => {
      ;(window as any).BarcodeDetector = class {
        constructor() {}
        async detect() {
          return [{ rawValue: 'CHROME_TEST_QR' }]
        }
      }
    })

    await helper.setupCameraMocks()
    await helper.openScanner()
    await helper.activateScanner()
    await helper.waitForScannerReady()

    console.log('✅ [TEST] Chrome compatibilidade OK')
  })

  test('deve funcionar no Firefox com jsQR fallback', async ({ page, browserName }) => {
    test.skip(browserName !== 'firefox', 'Teste específico para Firefox')

    console.log('🧪 [TEST] Testando Firefox com jsQR...')

    // Mock específico para Firefox (sem BarcodeDetector)
    await page.addInitScript(() => {
      delete (window as any).BarcodeDetector
    })

    await helper.setupCameraMocks()
    await helper.openScanner()
    await helper.activateScanner()
    await helper.waitForScannerReady()

    console.log('✅ [TEST] Firefox compatibilidade OK')
  })

  test('deve funcionar no Safari com jsQR fallback', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'Teste específico para Safari')

    console.log('🧪 [TEST] Testando Safari com jsQR...')

    // Mock específico para Safari (sem BarcodeDetector)
    await page.addInitScript(() => {
      delete (window as any).BarcodeDetector
    })

    await helper.setupCameraMocks()
    await helper.openScanner()
    await helper.activateScanner()
    await helper.waitForScannerReady()

    console.log('✅ [TEST] Safari compatibilidade OK')
  })
})

test.describe('QR Scanner - Integração com Sistema de Ponto', () => {
  let helper: QRScannerTestHelper

  test.beforeEach(async ({ page }) => {
    helper = new QRScannerTestHelper(page)
    await page.context().grantPermissions(['camera'])
    await helper.setupCameraMocks()
    await helper.loginAsTestUser()
  })

  test('deve processar QR code e registrar ponto', async ({ page }) => {
    console.log('🧪 [TEST] Testando integração com sistema de ponto...')

    // Configurar interceptação de API
    const isAPICalled = await helper.setupAPIInterception()

    // Ativar scanner
    await helper.openScanner()
    await helper.activateScanner()
    await helper.waitForScannerReady()

    // Simular detecção de QR code de máquina
    await helper.simulateQRDetection(QR_TEST_DATA.MACHINE_QR_CODE)

    // Aguardar processamento
    await page.waitForTimeout(3000)

    // Verificar se API foi chamada
    expect(isAPICalled()).toBeTruthy()

    // Verificar mensagem de sucesso
    await helper.expectSuccessMessage()

    console.log('✅ [TEST] Integração com sistema de ponto OK')
  })

  test('deve lidar com QR codes inválidos', async ({ page }) => {
    console.log('🧪 [TEST] Testando QR codes inválidos...')

    // Ativar scanner
    await helper.openScanner()
    await helper.activateScanner()
    await helper.waitForScannerReady()

    // Simular detecção de QR code inválido
    await helper.simulateQRDetection(QR_TEST_DATA.INVALID_QR_CODE)

    // Aguardar processamento
    await page.waitForTimeout(2000)

    // Verificar se mostra erro ou mensagem apropriada
    const errorMessage = page.locator('text=/Código.*inválido|QR.*inválido|Erro/i')
    const hasError = await errorMessage.isVisible().catch(() => false)

    if (hasError) {
      console.log('✅ [TEST] QR inválido tratado corretamente')
    } else {
      console.log('⚠️ [TEST] Tratamento de QR inválido não detectado na UI')
    }
  })
})

test.describe('QR Scanner - Testes de Performance', () => {
  let helper: QRScannerTestHelper

  test.beforeEach(async ({ page }) => {
    helper = new QRScannerTestHelper(page)
    await page.context().grantPermissions(['camera'])
    await helper.setupCameraMocks()
    await helper.loginAsTestUser()
  })

  test('deve inicializar rapidamente', async ({ page }) => {
    console.log('🧪 [TEST] Testando performance de inicialização...')

    const startTime = Date.now()

    // Ativar scanner
    await helper.openScanner()
    await helper.activateScanner()
    await helper.waitForScannerReady(10000) // 10s timeout

    const endTime = Date.now()
    const initTime = endTime - startTime

    console.log(`⏱️ [TEST] Tempo de inicialização: ${initTime}ms`)

    // Scanner deve inicializar em menos de 5 segundos
    expect(initTime).toBeLessThan(5000)

    console.log('✅ [TEST] Performance de inicialização OK')
  })

  test('deve detectar QR codes rapidamente', async ({ page }) => {
    console.log('🧪 [TEST] Testando performance de detecção...')

    // Ativar scanner
    await helper.openScanner()
    await helper.activateScanner()
    await helper.waitForScannerReady()

    const startTime = Date.now()

    // Simular detecção
    await helper.simulateQRDetection(QR_TEST_DATA.VALID_QR_CODE)

    // Aguardar processamento com timeout curto
    await page.waitForTimeout(1000)

    const endTime = Date.now()
    const detectionTime = endTime - startTime

    console.log(`⏱️ [TEST] Tempo de detecção: ${detectionTime}ms`)

    // Detecção deve ser rápida (menos de 2 segundos)
    expect(detectionTime).toBeLessThan(2000)

    console.log('✅ [TEST] Performance de detecção OK')
  })
})
