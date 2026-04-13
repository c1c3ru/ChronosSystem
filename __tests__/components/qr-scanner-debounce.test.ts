/**
 * Testes para o mecanismo de debounce/trava do QR Scanner
 * Previne múltiplos envios do mesmo QR code em rápida sucessão
 */

describe('QR Scanner Debounce Logic', () => {
  // Simulação da lógica de debounce usada no componente employee/page.tsx
  const DEBOUNCE_TIME = 3000 // 3 segundos

  function createScannerWithDebounce() {
    let lastQr: { data: string; timestamp: number } | null = null
    let processing = false
    let processCount = 0

    const shouldProcess = (qrData: string): boolean => {
      // Bloqueio 1: Já processando
      if (processing) {
        return false
      }

      // Bloqueio 2: Debounce - mesmo QR code em menos de 3 segundos
      const now = Date.now()
      if (lastQr && lastQr.data === qrData) {
        const timeDiff = now - lastQr.timestamp
        if (timeDiff < DEBOUNCE_TIME) {
          return false
        }
      }

      return true
    }

    const processQr = (qrData: string): boolean => {
      if (!shouldProcess(qrData)) {
        return false
      }

      processing = true
      lastQr = { data: qrData, timestamp: Date.now() }
      processCount++

      // Simular fim do processamento
      setTimeout(() => {
        processing = false
      }, 100)

      return true
    }

    return {
      processQr,
      shouldProcess,
      getProcessCount: () => processCount,
      getLastQr: () => lastQr,
    }
  }

  describe('Debounce básico', () => {
    it('deve processar o primeiro QR code', () => {
      const scanner = createScannerWithDebounce()
      const result = scanner.processQr('qr-code-123')

      expect(result).toBe(true)
      expect(scanner.getProcessCount()).toBe(1)
    })

    it('deve ignorar o mesmo QR code dentro de 3 segundos', () => {
      const scanner = createScannerWithDebounce()

      // Primeiro processamento
      expect(scanner.processQr('qr-code-123')).toBe(true)
      expect(scanner.getProcessCount()).toBe(1)

      // Mesmas leituras subsequentes devem ser ignoradas
      expect(scanner.processQr('qr-code-123')).toBe(false)
      expect(scanner.processQr('qr-code-123')).toBe(false)
      expect(scanner.processQr('qr-code-123')).toBe(false)

      // Contador não deve aumentar
      expect(scanner.getProcessCount()).toBe(1)
    })

    it('deve permitir processar QR codes diferentes', () => {
      jest.useFakeTimers()

      const scanner = createScannerWithDebounce()

      expect(scanner.processQr('qr-code-1')).toBe(true)

      // Aguardar 100ms para liberar a trava de processamento
      jest.advanceTimersByTime(100)
      expect(scanner.processQr('qr-code-2')).toBe(true)

      jest.advanceTimersByTime(100)
      expect(scanner.processQr('qr-code-3')).toBe(true)

      expect(scanner.getProcessCount()).toBe(3)

      jest.useRealTimers()
    })
  })

  describe('Debounce com tempo', () => {
    it('deve permitir mesmo QR code após 3 segundos', () => {
      jest.useFakeTimers()

      const scanner = createScannerWithDebounce()

      // Primeiro processamento
      expect(scanner.processQr('qr-code-123')).toBe(true)
      expect(scanner.getProcessCount()).toBe(1)

      // Avançar 4 segundos no tempo
      jest.advanceTimersByTime(4000)

      // Mesmo QR code deve ser processado novamente
      expect(scanner.processQr('qr-code-123')).toBe(true)
      expect(scanner.getProcessCount()).toBe(2)

      jest.useRealTimers()
    })

    it('deve bloquear QR code em 2999ms mas permitir em 3000ms', () => {
      jest.useFakeTimers()

      const scanner = createScannerWithDebounce()

      expect(scanner.processQr('qr-code-123')).toBe(true)

      // Avançar 2999ms - ainda deve bloquear
      jest.advanceTimersByTime(2999)
      expect(scanner.processQr('qr-code-123')).toBe(false)

      // Avançar mais 1ms (total 3000ms) - deve permitir
      jest.advanceTimersByTime(1)
      expect(scanner.processQr('qr-code-123')).toBe(true)

      jest.useRealTimers()
    })
  })

  describe('Simulação de alta frequência (30 FPS)', () => {
    it('deve processar apenas 1 leitura de 30 disparos em 1 segundo', () => {
      const scanner = createScannerWithDebounce()
      const qrData = 'secure-qr-payload-123'

      // Simular 30 leituras em 1 segundo (30 FPS)
      for (let i = 0; i < 30; i++) {
        scanner.processQr(qrData)
      }

      // Apenas 1 deve ter sido processado
      expect(scanner.getProcessCount()).toBe(1)
    })

    it('deve processar apenas 2 leituras em 60 disparos ao longo de 4 segundos', () => {
      jest.useFakeTimers()

      const scanner = createScannerWithDebounce()
      const qrData = 'secure-qr-payload-123'

      // Primeiros 30 disparos no tempo 0
      for (let i = 0; i < 30; i++) {
        scanner.processQr(qrData)
      }
      expect(scanner.getProcessCount()).toBe(1)

      // Avançar 2 segundos
      jest.advanceTimersByTime(2000)

      // Mais 30 disparos
      for (let i = 0; i < 30; i++) {
        scanner.processQr(qrData)
      }
      expect(scanner.getProcessCount()).toBe(1) // Ainda bloqueado

      // Avançar mais 2 segundos (total 4s)
      jest.advanceTimersByTime(2000)

      // Mais 30 disparos
      for (let i = 0; i < 30; i++) {
        scanner.processQr(qrData)
      }
      expect(scanner.getProcessCount()).toBe(2) // Agora permite

      jest.useRealTimers()
    })

    it('deve prevenir rate limiting (20 req/min) ao processar apenas 1 req a cada 3s', () => {
      jest.useFakeTimers()

      const scanner = createScannerWithDebounce()
      const qrData = 'secure-qr-payload-123'

      // Simular 1 minuto de leitura contínua (30 FPS)
      // Sem debounce: 30 * 60 = 1800 requisições (excederia limite de 20/min)
      // Com debounce: apenas 20 requisições (60s / 3s = 20)

      for (let second = 0; second < 60; second++) {
        // 30 leituras por segundo
        for (let frame = 0; frame < 30; frame++) {
          scanner.processQr(qrData)
        }
        jest.advanceTimersByTime(1000)
      }

      // Com debounce de 3s, máximo de 20 processamentos em 60s
      expect(scanner.getProcessCount()).toBeLessThanOrEqual(20)

      jest.useRealTimers()
    })
  })

  describe('Trava de processamento', () => {
    it('deve bloquear enquanto processa', () => {
      const scanner = createScannerWithDebounce()

      scanner.processQr('qr-code-1')

      // Processamento leva 100ms (setTimeout)
      // Tentar processar imediatamente deve falhar
      expect(scanner.processQr('qr-code-2')).toBe(false)
    })

    it('deve liberar após processamento', () => {
      jest.useFakeTimers()

      const scanner = createScannerWithDebounce()

      scanner.processQr('qr-code-1')
      expect(scanner.processQr('qr-code-2')).toBe(false)

      // Aguardar 100ms para processamento completar
      jest.advanceTimersByTime(100)

      // Agora deve permitir outro QR code
      expect(scanner.processQr('qr-code-2')).toBe(true)

      jest.useRealTimers()
    })
  })
})
