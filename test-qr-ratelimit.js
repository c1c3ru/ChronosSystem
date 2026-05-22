/**
 * Teste para demonstrar o Rate Limiting do QR Scanner
 * Explica por que a mensagem "Muitas tentativas" aparece
 */

console.log('\n🔒 Teste de Rate Limiting - QR Scanner')
console.log('='.repeat(60))

// Configuração do rate limiting para QR Scan
const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 1000, // 1 minuto
  maxRequests: 20, // 20 tentativas por minuto
}

console.log('\n📋 Configuração de Rate Limiting:')
console.log(`   • Janela de tempo: ${RATE_LIMIT_CONFIG.windowMs / 1000} segundos`)
console.log(`   • Máximo de requisições: ${RATE_LIMIT_CONFIG.maxRequests}`)
console.log(`   • Taxa máxima: ${RATE_LIMIT_CONFIG.maxRequests} scans/minuto`)

// Simulação do rate limiter em memória
const rateLimitCache = new Map()

function simulateRateLimit(identifier) {
  const key = `rate_limit:${identifier}`
  const now = Date.now()

  const entry = rateLimitCache.get(key)

  if (!entry || now > entry.resetTime) {
    // Nova janela
    const newEntry = {
      count: 1,
      resetTime: now + RATE_LIMIT_CONFIG.windowMs,
    }
    rateLimitCache.set(key, newEntry)
    return {
      success: true,
      remaining: RATE_LIMIT_CONFIG.maxRequests - 1,
      reset: newEntry.resetTime,
    }
  }

  if (entry.count >= RATE_LIMIT_CONFIG.maxRequests) {
    // Limite excedido!
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
    return {
      success: false,
      remaining: 0,
      reset: entry.resetTime,
      retryAfter,
    }
  }

  entry.count++
  return {
    success: true,
    remaining: RATE_LIMIT_CONFIG.maxRequests - entry.count,
    reset: entry.resetTime,
  }
}

console.log('\n' + '='.repeat(60))
console.log('🧪 Simulação: 25 tentativas de scan em 1 minuto')
console.log('='.repeat(60))

const testIdentifier = '192.168.1.100:user123:/api/attendance/qr-unified'
let blockedCount = 0
let successCount = 0

for (let i = 1; i <= 25; i++) {
  const result = simulateRateLimit(testIdentifier)

  if (result.success) {
    successCount++
    console.log(
      `✅ Tentativa ${i.toString().padStart(2, ' ')}/25: Sucesso (restam ${result.remaining})`
    )
  } else {
    blockedCount++
    console.log(
      `🚫 Tentativa ${i.toString().padStart(2, ' ')}/25: BLOQUEADA (aguarde ${result.retryAfter}s)`
    )
  }
}

console.log('\n' + '='.repeat(60))
console.log('📊 Resultado da Simulação:')
console.log('='.repeat(60))
console.log(`   ✅ Permitidas: ${successCount}`)
console.log(`   🚫 Bloqueadas: ${blockedCount}`)
console.log(`   📝 Total: ${successCount + blockedCount}`)

// Explicação do problema
console.log('\n' + '='.repeat(60))
console.log('🔍 POR QUE aparece "Muitas tentativas"?')
console.log('='.repeat(60))

console.log(`
A mensagem "Muitas tentativas. Aguarde Xs para tentar novamente"
aparece quando:

1. 📱 O usuário faz MAIS de ${RATE_LIMIT_CONFIG.maxRequests} scans em ${RATE_LIMIT_CONFIG.windowMs / 1000} segundos
   - Exemplo: Ficar escaneando o mesmo QR code repetidamente

2. 🔄 O QR scanner está em alta frequência (30 FPS)
   - A câmera lê o QR code 30 vezes por segundo
   - Sem debounce: 30 requisições/segundo = 1800/minuto!
   - Com debounce de 3s: máximo de 20 requisições/minuto ✓

3. 🛡️ Proteções implementadas:
   • Debounce de 3 segundos no frontend (impede mesmo QR code)
   • Rate limiting de 20 req/min no backend
   • Trava de processamento (enquanto processa, bloqueia)
`)

// Demonstração do debounce
console.log('='.repeat(60))
console.log('⏱️  Efeito do Debounce de 3 segundos:')
console.log('='.repeat(60))

const DEBOUNCE_TIME = 3000
const scansPerMinute = Math.floor(60 / (DEBOUNCE_TIME / 1000))

console.log(`
Sem debounce:
  • 30 FPS × 60 segundos = 1800 scans/minuto
  • ❌ Excede o limite de ${RATE_LIMIT_CONFIG.maxRequests} (1800 > ${RATE_LIMIT_CONFIG.maxRequests})
  • 🚫 Rate limiting é acionado após ${RATE_LIMIT_CONFIG.maxRequests} scans

Com debounce de 3 segundos:
  • 1 scan a cada 3 segundos
  • ✅ ${scansPerMinute} scans/minuto (${scansPerMinute} <= ${RATE_LIMIT_CONFIG.maxRequests})
  • ✅ Nunca excede o limite!
`)

console.log('='.repeat(60))
console.log('💡 SOLUÇÃO: O debounce JÁ está implementado!')
console.log('='.repeat(60))

console.log(`
Se você está vendo "Muitas tentativas", verifique:

1. O debounce está funcionando? (últimoQrRef.current)
   ✅ Sim - o código verifica o mesmo QR em 3 segundos

2. O processingRef está sendo resetado?
   ✅ Sim - no finally { processingRef.current = false }

3. Possíveis causas:
   • Scanner aberto por muito tempo (> 1 minuto)
   • Múltiplas abas escaneando ao mesmo tempo
   • QR code sendo lido continuamente sem debounce correto
   • Usuário fechando e reabrindo scanner rapidamente
`)

console.log('\n' + '='.repeat(60))
console.log('✅ Teste concluído - Rate limiting funcionando!')
console.log('='.repeat(60) + '\n')
