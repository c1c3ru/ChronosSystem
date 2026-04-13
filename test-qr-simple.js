/**
 * Teste simples para validar a lógica de debounce do QR Scanner
 * Executável diretamente com Node.js
 */

const DEBOUNCE_TIME = 3000 // 3 segundos

function createScannerWithDebounce() {
  let lastQr = null
  let processing = false
  let processCount = 0
  let currentTime = Date.now()
  let processingTimer = null

  const shouldProcess = (qrData) => {
    if (processing) {
      return false
    }

    const now = currentTime
    if (lastQr && lastQr.data === qrData) {
      const timeDiff = now - lastQr.timestamp
      if (timeDiff < DEBOUNCE_TIME) {
        return false
      }
    }

    return true
  }

  const processQr = (qrData) => {
    if (!shouldProcess(qrData)) {
      return false
    }

    processing = true
    lastQr = { data: qrData, timestamp: currentTime }
    processCount++

    // Limpar timer anterior se existir
    if (processingTimer) {
      clearTimeout(processingTimer)
    }

    // Simular fim do processamento
    processingTimer = setTimeout(() => {
      processing = false
    }, 100)

    return true
  }

  const advanceTime = (ms) => {
    currentTime += ms
    // Se avançarmos mais que 100ms, liberar processamento
    if (ms >= 100) {
      processing = false
    }
  }

  return {
    processQr,
    shouldProcess,
    getProcessCount: () => processCount,
    getLastQr: () => lastQr,
    advanceTime,
  }
}

// Testes
let passed = 0
let failed = 0

function test(name, fn) {
  try {
    fn()
    console.log(`✅ ${name}`)
    passed++
  } catch (error) {
    console.log(`❌ ${name}`)
    console.log(`   Erro: ${error.message}`)
    failed++
  }
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Esperado ${expected}, mas recebeu ${actual}`)
      }
    },
    toBeLessThanOrEqual(expected) {
      if (actual > expected) {
        throw new Error(`Esperado <= ${expected}, mas recebeu ${actual}`)
      }
    },
  }
}

console.log('\n🧪 Testes do QR Scanner Debounce\n')
console.log('='.repeat(50))

test('deve processar o primeiro QR code', () => {
  const scanner = createScannerWithDebounce()
  const result = scanner.processQr('qr-code-123')
  expect(result).toBe(true)
  expect(scanner.getProcessCount()).toBe(1)
})

test('deve ignorar o mesmo QR code dentro de 3 segundos', () => {
  const scanner = createScannerWithDebounce()

  expect(scanner.processQr('qr-code-123')).toBe(true)
  expect(scanner.getProcessCount()).toBe(1)

  expect(scanner.processQr('qr-code-123')).toBe(false)
  expect(scanner.processQr('qr-code-123')).toBe(false)
  expect(scanner.processQr('qr-code-123')).toBe(false)

  expect(scanner.getProcessCount()).toBe(1)
})

test('deve permitir mesmo QR code após 3 segundos', () => {
  const scanner = createScannerWithDebounce()

  expect(scanner.processQr('qr-code-123')).toBe(true)
  expect(scanner.getProcessCount()).toBe(1)

  // Avançar tempo para liberar processamento (100ms) + debounce (3000ms)
  scanner.advanceTime(3200)

  expect(scanner.processQr('qr-code-123')).toBe(true)
  expect(scanner.getProcessCount()).toBe(2)
})

test('deve processar apenas 1 leitura de 30 disparos em 1 segundo', () => {
  const scanner = createScannerWithDebounce()
  const qrData = 'secure-qr-payload-123'

  for (let i = 0; i < 30; i++) {
    scanner.processQr(qrData)
  }

  expect(scanner.getProcessCount()).toBe(1)
})

test('deve bloquear enquanto processa', () => {
  const scanner = createScannerWithDebounce()

  scanner.processQr('qr-code-1')
  expect(scanner.processQr('qr-code-2')).toBe(false)
})

console.log('\n' + '='.repeat(50))
console.log(`\n📊 Resultados:`)
console.log(`   ✅ Aprovados: ${passed}`)
console.log(`   ❌ Falharam: ${failed}`)
console.log(`   📝 Total: ${passed + failed}`)

if (failed === 0) {
  console.log('\n🎉 Todos os testes passaram!')
  process.exit(0)
} else {
  console.log('\n⚠️  Alguns testes falharam')
  process.exit(1)
}
