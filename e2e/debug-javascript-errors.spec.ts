import { test, expect } from '@playwright/test'

test.describe('Debug JavaScript Errors', () => {
  test('Investigar erros JavaScript detalhadamente', async ({ page }) => {
    console.log(' Investigando erros JavaScript...')
    
    // Capturar todos os logs e erros
    let allLogs: any[] = []
    let pageErrors: any[] = []
    let failedRequests: any[] = []
    
    page.on('console', msg => {
      const log = {
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      }
      allLogs.push(log)
      console.log(`🖥️ [${log.type.toUpperCase()}] ${log.text}`)
      if (log.location) {
        console.log(`   📍 ${log.location.url}:${log.location.lineNumber}`)
      }
    })
    
    // Interceptar erros de página
    const pageErrors = []
    page.on('pageerror', error => {
      pageErrors.push({
        message: error.message,
        stack: error.stack
      })
      console.log(`❌ PAGE ERROR: ${error.message}`)
      console.log(`📍 Stack: ${error.stack}`)
    })
    
    // Interceptar falhas de requisição
    const failedRequests = []
    page.on('requestfailed', request => {
      failedRequests.push({
        url: request.url(),
        failure: request.failure()
      })
      console.log(`🚫 REQUEST FAILED: ${request.url()}`)
      console.log(`   Reason: ${request.failure()?.errorText}`)
    })
    
    // 1. Fazer login
    await page.goto('http://localhost:3000/auth/signin')
    await page.waitForLoadState('networkidle')
    
    await page.fill('input[type="email"]', 'admin@chronos.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    
    await page.waitForTimeout(3000)
    await page.waitForLoadState('networkidle')
    
    console.log('✅ Login realizado')
    
    // 2. Verificar se chegou no complete-profile
    const currentUrl = page.url()
    if (!currentUrl.includes('/auth/complete-profile')) {
      console.log(`❌ Não chegou no complete-profile: ${currentUrl}`)
      return
    }
    
    console.log('✅ Na página de complete-profile')
    
    // 3. Aguardar carregamento completo
    await page.waitForTimeout(2000)
    
    // 4. Verificar se há erros até agora
    console.log(`\n📊 Erros até agora:`)
    console.log(`   Console logs: ${allLogs.length}`)
    console.log(`   Page errors: ${pageErrors.length}`)
    console.log(`   Failed requests: ${failedRequests.length}`)
    
    // 5. Testar se o JavaScript está funcionando
    console.log('\n🧪 Testando JavaScript básico...')
    
    const jsTest = await page.evaluate(() => {
      try {
        // Testar se React está carregado
        const hasReact = typeof window.React !== 'undefined'
        
        // Testar se conseguimos acessar elementos do DOM
        const form = document.querySelector('form')
        const submitButton = document.querySelector('button[type="submit"]')
        
        // Testar se conseguimos criar uma função
        const testFunction = () => 'test'
        
        return {
          hasReact,
          hasForm: !!form,
          hasSubmitButton: !!submitButton,
          functionWorks: testFunction() === 'test',
          userAgent: navigator.userAgent
        }
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : String(error)
        }
      }
    })
    
    console.log('🧪 Resultado do teste JS:', JSON.stringify(jsTest, null, 2))
    
    // 6. Testar se conseguimos acessar o handleSubmit
    console.log('\n🔍 Testando acesso ao formulário...')
    
    const formTest = await page.evaluate(() => {
      try {
        const form = document.querySelector('form')
        if (!form) return { error: 'Form not found' }
        
        // Verificar se o form tem onSubmit
        const hasOnSubmit = form.onsubmit !== null
        
        // Verificar se conseguimos disparar evento manualmente
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
        
        return {
          formExists: true,
          hasOnSubmit,
          canCreateEvent: !!submitEvent
        }
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : String(error)
        }
      }
    })
    
    console.log('🔍 Resultado do teste do form:', JSON.stringify(formTest, null, 2))
    
    // 7. Preencher formulário e testar submissão manual
    console.log('\n📝 Preenchendo formulário...')
    
    await page.fill('input[type="tel"]', '85988437783')
    await page.fill('textarea', 'Rua Teste')
    await page.fill('input[type="date"]', '1980-01-01')
    
    const textInputs = page.locator('input[type="text"]')
    const textCount = await textInputs.count()
    for (let i = 0; i < textCount; i++) {
      await textInputs.nth(i).fill('Teste')
    }
    
    const telInputs = page.locator('input[type="tel"]')
    const telCount = await telInputs.count()
    for (let i = 1; i < telCount; i++) {
      await telInputs.nth(i).fill('85988437783')
    }
    
    const dateInputs = page.locator('input[type="date"]')
    const dateCount = await dateInputs.count()
    for (let i = 1; i < dateCount; i++) {
      await dateInputs.nth(i).fill('2024-01-01')
    }
    
    console.log('✅ Formulário preenchido')
    
    // 8. Testar submissão via JavaScript
    console.log('\n🧪 Testando submissão via JavaScript...')
    
    const jsSubmitTest = await page.evaluate(() => {
      try {
        const form = document.querySelector('form')
        if (!form) return { error: 'Form not found' }
        
        // Tentar disparar submit programaticamente
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
        const dispatched = form.dispatchEvent(submitEvent)
        
        return {
          success: true,
          dispatched,
          formAction: form.action,
          formMethod: form.method
        }
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : String(error)
        }
      }
    })
    
    console.log('🧪 Resultado do submit JS:', JSON.stringify(jsSubmitTest, null, 2))
    
    // 9. Aguardar um pouco e ver se algo aconteceu
    await page.waitForTimeout(2000)
    
    // 10. Tentar clique normal no botão
    console.log('\n🖱️ Tentando clique normal no botão...')
    
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()
    
    await page.waitForTimeout(3000)
    
    // 11. Resumo final
    console.log('\n📊 RESUMO FINAL:')
    console.log(`   Total console logs: ${allLogs.length}`)
    console.log(`   Total page errors: ${pageErrors.length}`)
    console.log(`   Total failed requests: ${failedRequests.length}`)
    
    // Mostrar erros se houver
    if (pageErrors.length > 0) {
      console.log('\n❌ ERROS DE PÁGINA:')
      pageErrors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error.message}`)
      })
    }
    
    // Mostrar logs relevantes
    const errorLogs = allLogs.filter(log => log.type === 'error')
    if (errorLogs.length > 0) {
      console.log('\n❌ LOGS DE ERRO:')
      errorLogs.forEach((log, i) => {
        console.log(`  ${i + 1}. ${log.text}`)
      })
    }
    
    console.log('🏁 Investigação concluída!')
  })
})
