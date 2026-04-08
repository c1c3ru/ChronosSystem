import { Page, expect } from '@playwright/test'

/**
 * Utilitários para testes do QR Scanner
 */

// Declarações TypeScript para objetos globais do teste
declare global {
  interface Window {
    BarcodeDetector?: any;
    onScan?: (data: string) => void;
    processQrCode?: (data: string) => void;
  }
}

export class QRScannerTestHelper {
  constructor(private page: Page) {}

  /**
   * Configura mocks básicos para câmera e APIs
   */
  async setupCameraMocks() {
    await this.page.addInitScript(() => {
      // Mock do getUserMedia
      Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
        value: async () => {
          const canvas = document.createElement('canvas')
          canvas.width = 1280
          canvas.height = 720
          const stream = canvas.captureStream()
          return stream
        }
      })

      // Mock do BarcodeDetector se não existir
      if (!window.BarcodeDetector) {
        (window as any).BarcodeDetector = class {
          constructor() {}
          async detect() {
            return []
          }
        }
      }
    })
  }

  /**
   * Configura mock que simula erro de câmera
   */
  async setupCameraErrorMock(errorType: 'NotAllowedError' | 'NotFoundError' | 'NotReadableError' = 'NotAllowedError') {
    await this.page.addInitScript((error) => {
      Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
        value: async () => {
          const err = new Error(`${error}: Camera access denied`)
          err.name = error
          throw err
        }
      })
    }, errorType)
  }

  /**
   * Faz login como usuário de teste
   */
  async loginAsTestUser(email = 'test@example.com', password = 'password123') {
    await this.page.goto('/auth/signin')
    await this.page.fill('input[name="email"]', email)
    await this.page.fill('input[name="password"]', password)
    await this.page.click('button[type="submit"]')
    await this.page.waitForURL('/employee')
  }

  /**
   * Abre o scanner QR
   */
  async openScanner() {
    await this.page.click('button:has-text("Abrir Scanner QR")')
    
    // Verificar se o componente está visível
    const scanner = this.page.locator('[data-testid="qr-scanner"], .qr-scanner, div:has-text("Scanner QR Code")')
    await expect(scanner).toBeVisible()
  }

  /**
   * Ativa o scanner (clica no botão "Ativar Scanner")
   */
  async activateScanner() {
    const activateButton = this.page.locator('button:has-text("Ativar Scanner")')
    await expect(activateButton).toBeVisible()
    await activateButton.click()
  }

  /**
   * Aguarda o scanner estar totalmente carregado
   */
  async waitForScannerReady(timeout = 5000) {
    // Aguardar que o vídeo esteja visível
    const video = this.page.locator('video')
    await expect(video).toBeVisible({ timeout })

    // Aguardar que o overlay de scanning esteja visível
    const scanningOverlay = this.page.locator('div:has(div[class*="border"]):has(div[class*="animate"])')
    await expect(scanningOverlay).toBeVisible({ timeout })

    // Aguardar status ativo
    const activeStatus = this.page.locator('text=/Scanner ativo|✅/i')
    await expect(activeStatus).toBeVisible({ timeout })
  }

  /**
   * Simula a detecção de um QR code
   */
  async simulateQRDetection(qrCode: string) {
    await this.page.evaluate((code) => {
      // Tentar múltiplas formas de simular a detecção
      
      // 1. Evento customizado
      const event = new CustomEvent('qr-detected', { detail: code })
      document.dispatchEvent(event)
      
      // 2. Tentar chamar função global se existir
      if ((window as any).onScan) {
        (window as any).onScan(code)
      }
      
      // 3. Tentar chamar processQrCode se existir
      if ((window as any).processQrCode) {
        (window as any).processQrCode(code)
      }
      
      // 4. Log para debug
      console.log('🔍 [TEST] Simulando detecção de QR code:', code)
      
    }, qrCode)
  }

  /**
   * Verifica se há mensagem de erro
   */
  async expectError(errorText?: string) {
    const errorMessage = errorText 
      ? this.page.locator(`text=${errorText}`)
      : this.page.locator('text=/Erro|Error|Permissão.*negada|Permission.*denied/i')
    
    await expect(errorMessage).toBeVisible()
  }

  /**
   * Verifica se o botão "Tentar Novamente" está visível
   */
  async expectRetryButton() {
    const retryButton = this.page.locator('button:has-text("Tentar Novamente")')
    await expect(retryButton).toBeVisible()
  }

  /**
   * Fecha o scanner
   */
  async closeScanner() {
    const closeButton = this.page.locator('button:has(svg), button:has-text("×"), button:has-text("X")').first()
    
    if (await closeButton.isVisible()) {
      await closeButton.click()
      
      // Verificar se o vídeo não está mais visível
      const video = this.page.locator('video')
      await expect(video).not.toBeVisible()
      
      return true
    }
    
    return false
  }

  /**
   * Captura logs do console relacionados ao scanner
   */
  async captureConsoleLogs(): Promise<string[]> {
    const logs: string[] = []
    
    this.page.on('console', msg => {
      if (msg.text().includes('[CAMERA]') || 
          msg.text().includes('[QR]') || 
          msg.text().includes('[TEST]')) {
        logs.push(msg.text())
      }
    })
    
    return logs
  }

  /**
   * Verifica se há logs de inicialização
   */
  async expectInitializationLogs(logs: string[]) {
    const hasCameraLogs = logs.some(log => 
      log.includes('[CAMERA]') && 
      (log.includes('Iniciando') || log.includes('Stream obtido'))
    )

    const hasQRLogs = logs.some(log => 
      log.includes('[QR]') && 
      (log.includes('Iniciando') || log.includes('Canvas configurado'))
    )

    expect(hasCameraLogs).toBeTruthy()
    expect(hasQRLogs).toBeTruthy()
  }

  /**
   * Configura interceptação de API para testes de integração
   */
  async setupAPIInterception() {
    let apiCalled = false
    
    await this.page.route('**/api/attendance/**', route => {
      apiCalled = true
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Ponto registrado com sucesso',
          record: {
            id: '123',
            type: 'ENTRY',
            timestamp: new Date().toISOString()
          }
        })
      })
    })
    
    return () => apiCalled
  }

  /**
   * Verifica se mostra mensagem de sucesso após processamento
   */
  async expectSuccessMessage(timeout = 5000) {
    const successMessage = this.page.locator('text=/Ponto registrado|Sucesso|Success/i')
    await expect(successMessage).toBeVisible({ timeout })
  }
}

/**
 * Dados de teste comuns
 */
export const QR_TEST_DATA = {
  VALID_QR_CODE: 'EMP123456789',
  MACHINE_QR_CODE: 'MACHINE_001_VALID_QR',
  INVALID_QR_CODE: 'INVALID_CODE_123',
  MALFORMED_QR_CODE: '###INVALID###'
}

/**
 * Seletores comuns para elementos do scanner
 */
export const QR_SELECTORS = {
  SCANNER_CONTAINER: '[data-testid="qr-scanner"], .qr-scanner, div:has-text("Scanner QR Code")',
  ACTIVATE_BUTTON: 'button:has-text("Ativar Scanner")',
  VIDEO_ELEMENT: 'video',
  SCANNING_OVERLAY: 'div:has(div[class*="border"]):has(div[class*="animate"])',
  ACTIVE_STATUS: 'text=/Scanner ativo|✅/i',
  ERROR_MESSAGE: 'text=/Erro|Error|Permissão.*negada|Permission.*denied/i',
  RETRY_BUTTON: 'button:has-text("Tentar Novamente")',
  CLOSE_BUTTON: 'button:has(svg), button:has-text("×"), button:has-text("X")',
  SUCCESS_MESSAGE: 'text=/Ponto registrado|Sucesso|Success/i'
}
