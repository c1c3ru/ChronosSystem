import { test, expect } from '@playwright/test'

test.describe('Debug Form Submission', () => {
  test('🔍 Investigar por que o formulário não submete', async ({ page }) => {
    console.log('🔍 Investigando submissão do formulário...')

    // 1. Fazer login primeiro
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

    // 3. Interceptar TODAS as requisições
    const requests: any[] = []
    const responses: any[] = []

    page.on('request', (request) => {
      requests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData(),
      })
      console.log(`📤 REQUEST: ${request.method()} ${request.url()}`)
    })

    page.on('response', (response) => {
      responses.push({
        url: response.url(),
        status: response.status(),
        headers: response.headers(),
      })
      console.log(`📥 RESPONSE: ${response.status()} ${response.url()}`)
    })

    // 4. Interceptar erros de console
    const consoleMessages: any[] = []
    page.on('console', (msg) => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
      })
      console.log(`🖥️ CONSOLE ${msg.type().toUpperCase()}: ${msg.text()}`)
    })

    // 5. Interceptar erros de página
    const pageErrors: any[] = []
    page.on('pageerror', (error) => {
      pageErrors.push(error.message)
      console.log(`❌ PAGE ERROR: ${error.message}`)
    })

    // 6. Verificar estado inicial do formulário
    const formExists = await page.locator('form').count()
    console.log(`📋 Formulários encontrados: ${formExists}`)

    const submitButton = page.locator('button[type="submit"]')
    const submitExists = await submitButton.count()
    console.log(`🔘 Botões submit encontrados: ${submitExists}`)

    if (submitExists > 0) {
      const buttonText = await submitButton.textContent()
      const isVisible = await submitButton.isVisible()
      const isEnabled = await submitButton.isEnabled()
      console.log(`🔘 Botão: "${buttonText}", Visível: ${isVisible}, Habilitado: ${isEnabled}`)
    }

    // 7. Preencher formulário passo a passo
    console.log('📝 Preenchendo formulário passo a passo...')

    // Telefone
    const phoneInput = page.locator('input[type="tel"]').first()
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('85988437783')
      const phoneValue = await phoneInput.inputValue()
      console.log(`📞 Telefone preenchido: "${phoneValue}"`)
    }

    // Endereço
    const addressInput = page.locator('textarea')
    if (await addressInput.isVisible()) {
      await addressInput.fill('Rua Admin Teste, 123, Centro')
      const addressValue = await addressInput.inputValue()
      console.log(`🏠 Endereço preenchido: "${addressValue}"`)
    }

    // Datas
    const dateInputs = page.locator('input[type="date"]')
    const dateCount = await dateInputs.count()
    console.log(`📅 Campos de data: ${dateCount}`)

    for (let i = 0; i < dateCount; i++) {
      await dateInputs.nth(i).fill('1980-01-01')
      const dateValue = await dateInputs.nth(i).inputValue()
      console.log(`📅 Data ${i + 1}: "${dateValue}"`)
    }

    // Campos de texto
    const textInputs = page.locator('input[type="text"]')
    const textCount = await textInputs.count()
    console.log(`📝 Campos de texto: ${textCount}`)

    for (let i = 0; i < textCount; i++) {
      await textInputs.nth(i).fill('Admin Teste')
      const textValue = await textInputs.nth(i).inputValue()
      console.log(`📝 Texto ${i + 1}: "${textValue}"`)
    }

    // Telefones adicionais
    const telInputs = page.locator('input[type="tel"]')
    const telCount = await telInputs.count()

    for (let i = 1; i < telCount; i++) {
      await telInputs.nth(i).fill('85988437783')
      const telValue = await telInputs.nth(i).inputValue()
      console.log(`📞 Telefone ${i + 1}: "${telValue}"`)
    }

    // 8. Verificar validação antes de submeter
    console.log('🔍 Verificando validação...')

    // Procurar por mensagens de erro
    const errorMessages = await page.locator('text=obrigatório, text=erro, text=inválido').count()
    console.log(`❗ Mensagens de erro visíveis: ${errorMessages}`)

    // Verificar estado do botão novamente
    if (submitExists > 0) {
      const buttonTextAfter = await submitButton.textContent()
      const isEnabledAfter = await submitButton.isEnabled()
      console.log(
        `🔘 Botão após preenchimento: "${buttonTextAfter}", Habilitado: ${isEnabledAfter}`
      )
    }

    // 9. Capturar screenshot antes de submeter
    await page.screenshot({ path: 'form-debug-before-submit.png', fullPage: true })

    // 10. Tentar submeter
    console.log('🚀 Tentando submeter formulário...')

    if (submitExists > 0) {
      await submitButton.click()
      console.log('✅ Clique no botão realizado')

      // Aguardar um pouco para ver o que acontece
      await page.waitForTimeout(3000)

      // Verificar se o botão mudou de estado
      const buttonTextFinal = await submitButton.textContent()
      console.log(`🔘 Texto do botão após clique: "${buttonTextFinal}"`)

      // Capturar screenshot após submissão
      await page.screenshot({ path: 'form-debug-after-submit.png', fullPage: true })

      // Aguardar mais um pouco
      await page.waitForTimeout(2000)

      const finalUrl = page.url()
      console.log(`📍 URL final: ${finalUrl}`)

      // 11. Resumir o que aconteceu
      console.log('\n📊 RESUMO:')
      console.log(`📤 Requisições enviadas: ${requests.length}`)
      console.log(`📥 Respostas recebidas: ${responses.length}`)
      console.log(`🖥️ Mensagens de console: ${consoleMessages.length}`)
      console.log(`❌ Erros de página: ${pageErrors.length}`)

      // Mostrar requisições da API
      const apiRequests = requests.filter((r) => r.url.includes('/api/auth/complete-profile'))
      console.log(`📡 Requisições para complete-profile API: ${apiRequests.length}`)

      if (apiRequests.length > 0) {
        apiRequests.forEach((req, i) => {
          console.log(`  ${i + 1}. ${req.method} ${req.url}`)
          if (req.postData) {
            console.log(`     Data: ${req.postData.substring(0, 200)}...`)
          }
        })
      }

      // Mostrar erros se houver
      if (pageErrors.length > 0) {
        console.log('\n❌ ERROS ENCONTRADOS:')
        pageErrors.forEach((error, i) => {
          console.log(`  ${i + 1}. ${error}`)
        })
      }

      // Mostrar mensagens de console relevantes
      const relevantConsole = consoleMessages.filter(
        (m) =>
          m.type === 'error' ||
          m.text.includes('erro') ||
          m.text.includes('fail') ||
          m.text.includes('API') ||
          m.text.includes('submit')
      )

      if (relevantConsole.length > 0) {
        console.log('\n🖥️ CONSOLE RELEVANTE:')
        relevantConsole.forEach((msg, i) => {
          console.log(`  ${i + 1}. [${msg.type}] ${msg.text}`)
        })
      }
    } else {
      console.log('❌ Botão de submit não encontrado')
    }

    console.log('🏁 Investigação concluída!')
  })
})
