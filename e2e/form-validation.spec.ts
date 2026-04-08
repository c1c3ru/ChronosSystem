import { test, expect } from '@playwright/test'

test.describe('Complete Profile Form Validation', () => {
  test('should test form validation without authentication', async ({ page }) => {
    // Interceptar a API para simular usuário autenticado
    await page.route('/api/auth/session', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'test-user-id',
            email: 'test@chronos.com',
            name: 'Test User',
            role: 'EMPLOYEE',
            profileComplete: false
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
      })
    })
    
    // Ir para a página de completar perfil
    await page.goto('/auth/complete-profile')
    await page.waitForLoadState('networkidle')
    
    console.log('URL atual:', page.url())
    
    // Capturar screenshot
    await page.screenshot({ path: 'form-with-mocked-session.png', fullPage: true })
    
    // Verificar se o formulário carregou
    const forms = await page.locator('form').count()
    console.log('Formulários encontrados:', forms)
    
    if (forms > 0) {
      console.log('✅ Formulário encontrado!')
      
      // Testar validação - submeter formulário vazio
      const submitButton = page.locator('button[type="submit"]')
      await submitButton.click()
      
      // Aguardar validação
      await page.waitForTimeout(1000)
      
      // Verificar se aparecem mensagens de erro
      const errorMessages = await page.locator('text=obrigatório').count()
      console.log('Mensagens de erro encontradas:', errorMessages)
      
      if (errorMessages > 0) {
        console.log('✅ Validação funcionando!')
      }
      
      // Testar preenchimento de campos
      const phoneInput = page.locator('input[type="tel"]').first()
      if (await phoneInput.isVisible()) {
        await phoneInput.fill('85988437783')
        console.log('✅ Campo telefone preenchido')
        
        // Verificar formatação automática
        const phoneValue = await phoneInput.inputValue()
        console.log('Valor do telefone após formatação:', phoneValue)
        
        if (phoneValue.includes('(85) 98843-7783')) {
          console.log('✅ Formatação automática funcionando!')
        }
      }
      
      // Preencher todos os campos obrigatórios
      const addressTextarea = page.locator('textarea')
      if (await addressTextarea.isVisible()) {
        await addressTextarea.fill('Rua Teste, 123')
      }
      
      const dateInputs = page.locator('input[type="date"]')
      const dateCount = await dateInputs.count()
      console.log('Campos de data encontrados:', dateCount)
      
      for (let i = 0; i < dateCount; i++) {
        await dateInputs.nth(i).fill('2024-01-01')
      }
      
      const textInputs = page.locator('input[type="text"]')
      const textCount = await textInputs.count()
      console.log('Campos de texto encontrados:', textCount)
      
      for (let i = 0; i < textCount; i++) {
        await textInputs.nth(i).fill('Teste')
      }
      
      // Interceptar API de completar perfil
      await page.route('/api/auth/complete-profile', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Perfil completado com sucesso',
            redirectUrl: '/employee'
          })
        })
      })
      
      // Submeter formulário novamente
      await submitButton.click()
      
      // Aguardar processamento
      await page.waitForTimeout(3000)
      
      console.log('URL após submissão com dados válidos:', page.url())
      
      // Capturar screenshot final
      await page.screenshot({ path: 'after-valid-submission.png', fullPage: true })
      
    } else {
      console.log('❌ Formulário não encontrado')
    }
  })
  
  test('should test API error handling', async ({ page }) => {
    // Interceptar sessão
    await page.route('/api/auth/session', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'test-user-id',
            email: 'test@chronos.com',
            name: 'Test User',
            role: 'EMPLOYEE',
            profileComplete: false
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
      })
    })
    
    // Interceptar API para retornar erro
    await page.route('/api/auth/complete-profile', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Erro interno do servidor'
        })
      })
    })
    
    await page.goto('/auth/complete-profile')
    await page.waitForLoadState('networkidle')
    
    // Preencher formulário rapidamente
    await page.fill('input[type="tel"]', '(85) 98843-7783')
    await page.fill('textarea', 'Rua Teste, 123')
    
    // Submeter
    await page.click('button[type="submit"]')
    
    // Aguardar erro
    await page.waitForTimeout(2000)
    
    // Verificar se aparece toast de erro
    const toastError = await page.locator('text=Erro interno do servidor').count()
    console.log('Toast de erro encontrado:', toastError > 0 ? 'Sim' : 'Não')
    
    // Capturar screenshot
    await page.screenshot({ path: 'error-handling.png', fullPage: true })
  })
})
