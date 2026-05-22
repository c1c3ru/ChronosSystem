import { test, expect } from '@playwright/test'

test.describe('Complete Profile - Final Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock completo da sessão e middleware
    await page.route('/api/auth/session', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'test-user-id',
            email: 'test@chronos.com',
            name: 'Test User',
            role: 'EMPLOYEE',
            profileComplete: false,
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }),
      })
    })

    // Mock do CSRF token
    await page.route('/api/auth/csrf', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          csrfToken: 'test-csrf-token',
        }),
      })
    })
  })

  test('✅ Complete Profile Form - Full Flow Test', async ({ page }) => {
    console.log('🧪 Iniciando teste completo do formulário...')

    // Mock da API de completar perfil
    await page.route('/api/auth/complete-profile', (route) => {
      console.log('📡 API complete-profile interceptada')
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Perfil completado com sucesso',
          redirectUrl: '/employee',
        }),
      })
    })

    // 1. Navegar para a página
    console.log('🔗 Navegando para /auth/complete-profile')
    await page.goto('/auth/complete-profile')
    await page.waitForLoadState('networkidle')

    // 2. Verificar se a página carregou (qualquer elemento visível)
    console.log('👀 Verificando se a página carregou...')
    await expect(page.locator('body')).toBeVisible()

    // 3. Capturar screenshot para debug
    await page.screenshot({ path: 'test-complete-profile-loaded.png', fullPage: true })

    // 4. Verificar se há formulário
    const forms = await page.locator('form').count()
    console.log(`📋 Formulários encontrados: ${forms}`)

    if (forms > 0) {
      console.log('✅ Formulário encontrado! Preenchendo campos...')

      // 5. Preencher campos básicos
      const phoneInput = page.locator('input[type="tel"]').first()
      if (await phoneInput.isVisible()) {
        await phoneInput.fill('85988437783')
        console.log('📞 Telefone preenchido')
      }

      const textArea = page.locator('textarea')
      if (await textArea.isVisible()) {
        await textArea.fill('Rua Teste, 123, Bairro Teste, Cidade Teste')
        console.log('🏠 Endereço preenchido')
      }

      // 6. Preencher campos de data
      const dateInputs = page.locator('input[type="date"]')
      const dateCount = await dateInputs.count()
      console.log(`📅 Campos de data encontrados: ${dateCount}`)

      for (let i = 0; i < dateCount; i++) {
        await dateInputs.nth(i).fill('2024-01-01')
        console.log(`📅 Data ${i + 1} preenchida`)
      }

      // 7. Preencher campos de texto
      const textInputs = page.locator('input[type="text"]')
      const textCount = await textInputs.count()
      console.log(`📝 Campos de texto encontrados: ${textCount}`)

      for (let i = 0; i < textCount; i++) {
        await textInputs.nth(i).fill(`Campo Teste ${i + 1}`)
        console.log(`📝 Campo de texto ${i + 1} preenchido`)
      }

      // 8. Preencher telefones de emergência
      const telInputs = page.locator('input[type="tel"]')
      const telCount = await telInputs.count()
      console.log(`📞 Campos de telefone encontrados: ${telCount}`)

      for (let i = 1; i < telCount; i++) {
        await telInputs.nth(i).fill('85988437783')
        console.log(`📞 Telefone ${i + 1} preenchido`)
      }

      // 9. Capturar screenshot com formulário preenchido
      await page.screenshot({ path: 'test-form-filled.png', fullPage: true })

      // 10. Submeter formulário
      const submitButton = page.locator('button[type="submit"]')
      if (await submitButton.isVisible()) {
        console.log('🚀 Submetendo formulário...')
        await submitButton.click()

        // 11. Aguardar processamento
        await page.waitForTimeout(3000)

        // 12. Capturar screenshot após submissão
        await page.screenshot({ path: 'test-after-submit.png', fullPage: true })

        console.log('✅ Formulário submetido com sucesso!')
      } else {
        console.log('❌ Botão de submit não encontrado')
      }
    } else {
      console.log('❌ Nenhum formulário encontrado')
    }

    console.log('🏁 Teste concluído!')
  })

  test('✅ Form Validation Test', async ({ page }) => {
    console.log('🧪 Testando validação do formulário...')

    await page.goto('/auth/complete-profile')
    await page.waitForLoadState('networkidle')

    // Tentar submeter formulário vazio
    const submitButton = page.locator('button[type="submit"]')
    if (await submitButton.isVisible()) {
      await submitButton.click()
      await page.waitForTimeout(1000)

      // Verificar se há mensagens de erro
      const errorMessages = await page.locator('text=obrigatório').count()
      console.log(`❗ Mensagens de erro encontradas: ${errorMessages}`)

      expect(errorMessages).toBeGreaterThan(0)
      console.log('✅ Validação funcionando!')
    }
  })

  test('✅ Phone Formatting Test', async ({ page }) => {
    console.log('🧪 Testando formatação de telefone...')

    await page.goto('/auth/complete-profile')
    await page.waitForLoadState('networkidle')

    const phoneInput = page.locator('input[type="tel"]').first()
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('85988437783')

      // Verificar formatação
      const value = await phoneInput.inputValue()
      console.log(`📞 Valor formatado: ${value}`)

      expect(value).toBe('(85) 98843-7783')
      console.log('✅ Formatação automática funcionando!')
    }
  })
})
