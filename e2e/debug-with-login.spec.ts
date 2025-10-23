import { test, expect } from '@playwright/test'

test.describe('Debug With Login Flow', () => {
  test('Debug: Complete flow with login', async ({ page }) => {
    console.log('🔍 Testando fluxo completo com login...')
    
    // 1. Ir para homepage
    console.log('📍 Acessando homepage...')
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 2. Clicar em "Acessar Admin"
    console.log('🖱️ Clicando em "Acessar Admin"...')
    await page.click('text=Acessar Admin')
    await page.waitForLoadState('networkidle')
    
    console.log(`📍 URL após clicar admin: ${page.url()}`)
    
    // 3. Se foi para login, fazer login
    if (page.url().includes('/auth/signin')) {
      console.log('🔐 Fazendo login...')
      
      // Capturar screenshot da página de login
      await page.screenshot({ path: 'debug-login-page.png', fullPage: true })
      
      // Verificar se há campos de login
      const emailInput = page.locator('input[type="email"]')
      const passwordInput = page.locator('input[type="password"]')
      
      if (await emailInput.isVisible() && await passwordInput.isVisible()) {
        console.log('📝 Preenchendo credenciais...')
        
        // Usar credenciais corretas da página de login
        await emailInput.fill('admin@chronos.com')
        await passwordInput.fill('admin123')
        
        // Clicar no botão de login
        const loginButton = page.locator('button[type="submit"]')
        await loginButton.click()
        console.log('🚀 Login submetido')
        
        // Aguardar redirecionamento
        await page.waitForTimeout(3000)
        await page.waitForLoadState('networkidle')
        
        console.log(`📍 URL após login: ${page.url()}`)
        
        // Capturar screenshot após login
        await page.screenshot({ path: 'debug-after-login.png', fullPage: true })
        
      } else {
        console.log('❌ Campos de login não encontrados')
        
        // Verificar se há botão do Google
        const googleButton = page.locator('text=Continuar com Google, text=Google')
        if (await googleButton.isVisible()) {
          console.log('🔍 Botão do Google encontrado, mas não podemos testar OAuth automaticamente')
        }
      }
    }
    
    // 4. Se chegou no complete-profile, testar
    if (page.url().includes('/auth/complete-profile')) {
      console.log('✅ Chegou no complete-profile!')
      
      // Interceptar API
      let apiCalled = false
      page.on('response', response => {
        if (response.url().includes('/api/auth/complete-profile')) {
          apiCalled = true
          console.log(`📡 API complete-profile chamada! Status: ${response.status()}`)
        }
      })
      
      // Preencher formulário
      console.log('📝 Preenchendo formulário...')
      
      await page.fill('input[type="tel"]', '85988437783')
      await page.fill('textarea', 'Rua Teste, 123')
      
      const dateInputs = page.locator('input[type="date"]')
      const dateCount = await dateInputs.count()
      for (let i = 0; i < dateCount; i++) {
        await dateInputs.nth(i).fill('1990-01-01')
      }
      
      const textInputs = page.locator('input[type="text"]')
      const textCount = await textInputs.count()
      for (let i = 0; i < textCount; i++) {
        await textInputs.nth(i).fill('Teste')
      }
      
      // Submeter
      console.log('🚀 Submetendo formulário...')
      await page.click('button[type="submit"]')
      
      // Aguardar
      await page.waitForTimeout(5000)
      
      console.log(`📍 URL final: ${page.url()}`)
      console.log(`📡 API foi chamada: ${apiCalled}`)
      
      await page.screenshot({ path: 'debug-final-result.png', fullPage: true })
      
    } else {
      console.log(`❌ Não chegou no complete-profile. URL atual: ${page.url()}`)
    }
    
    console.log('🏁 Teste concluído!')
  })
})
