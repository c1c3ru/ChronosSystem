import { test, expect } from '@playwright/test'

test.describe('Complete Profile Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock da sessão de usuário autenticado
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
  })

  test('should complete profile and redirect to employee dashboard', async ({ page }) => {
    // Mock da API de completar perfil
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
    
    // 1. Ir para a página de completar perfil
    await page.goto('/auth/complete-profile')
    await page.waitForLoadState('networkidle')
    
    // 2. Verificar se a página carregou
    await expect(page.locator('h1')).toBeVisible()
    
    // 3. Preencher todos os campos obrigatórios
    await page.fill('input[type="tel"]', '85988437783')
    await page.fill('textarea', 'Rua B, 51, Apartamento 501, Maraponga')
    
    // Preencher campos de data
    const dateInputs = page.locator('input[type="date"]')
    await dateInputs.first().fill('1984-02-06')
    await dateInputs.last().fill('2024-01-01')
    
    // Campos de texto
    const textInputs = page.locator('input[type="text"]')
    const textCount = await textInputs.count()
    for (let i = 0; i < textCount; i++) {
      await textInputs.nth(i).fill('Teste Campo ' + (i + 1))
    }
    
    // Preencher telefone de emergência
    const telInputs = page.locator('input[type="tel"]')
    if (await telInputs.count() > 1) {
      await telInputs.last().fill('85988437783')
    }
    
    // 4. Clicar no botão de salvar
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toContainText('Salvar e Continuar')
    await submitButton.click()
    
    // 5. Verificar estados do botão
    await expect(submitButton).toContainText('Salvando...', { timeout: 2000 })
    
    // 6. Aguardar processamento
    await page.waitForTimeout(2000)
    
    // 7. Verificar se o redirecionamento foi iniciado
    await expect(submitButton).toContainText('Redirecionando...', { timeout: 3000 })
  })

  test('should show validation errors for empty fields', async ({ page }) => {
    // 1. Ir para a página de completar perfil
    await page.goto('/auth/complete-profile')
    await page.waitForLoadState('networkidle')
    
    // 2. Tentar submeter sem preencher campos
    await page.click('button[type="submit"]')
    
    // 3. Aguardar validação
    await page.waitForTimeout(1000)
    
    // 4. Verificar se aparecem mensagens de erro (pelo menos algumas)
    const errorMessages = await page.locator('text=obrigatório').count()
    expect(errorMessages).toBeGreaterThan(0)
  })

  test('should format phone number automatically', async ({ page }) => {
    // 1. Ir para a página de completar perfil
    await page.goto('/auth/complete-profile')
    await page.waitForLoadState('networkidle')
    
    // 2. Digitar números do telefone
    const phoneInput = page.locator('input[type="tel"]').first()
    await phoneInput.fill('85988437783')
    
    // 3. Verificar se foi formatado automaticamente
    await expect(phoneInput).toHaveValue('(85) 98843-7783')
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // 1. Interceptar requisição da API para simular erro
    await page.route('/api/auth/complete-profile', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Erro interno do servidor' })
      })
    })
    
    // 2. Ir para a página de completar perfil
    await page.goto('/auth/complete-profile')
    await page.waitForLoadState('networkidle')
    
    // 3. Preencher formulário rapidamente
    await page.fill('input[type="tel"]', '85988437783')
    await page.fill('textarea', 'Rua Teste, 123')
    
    // 4. Submeter formulário
    await page.click('button[type="submit"]')
    
    // 5. Aguardar processamento
    await page.waitForTimeout(2000)
    
    // 6. Verificar se o botão volta ao estado normal (não trava em loading)
    await expect(page.locator('button[type="submit"]')).toContainText('Salvar e Continuar', { timeout: 5000 })
  })

  test('should maintain form data when validation fails', async ({ page }) => {
    // 1. Ir para a página de completar perfil
    await page.goto('/auth/complete-profile')
    await page.waitForLoadState('networkidle')
    
    // 2. Preencher alguns campos
    const phoneInput = page.locator('input[type="tel"]').first()
    const textArea = page.locator('textarea')
    
    await phoneInput.fill('85988437783')
    await textArea.fill('Rua Teste, 123')
    
    // 3. Tentar submeter (vai falhar por campos obrigatórios)
    await page.click('button[type="submit"]')
    
    // 4. Aguardar validação
    await page.waitForTimeout(1000)
    
    // 5. Verificar se os dados preenchidos foram mantidos
    await expect(phoneInput).toHaveValue('(85) 98843-7783')
    await expect(textArea).toHaveValue('Rua Teste, 123')
  })
})
