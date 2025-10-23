import { test as setup, expect } from '@playwright/test'

const authFile = 'e2e/.auth/user.json'

setup('authenticate', async ({ page }) => {
  // Ir para página de login
  await page.goto('/auth/signin')
  
  // Usar credenciais de teste
  await page.fill('input[type="email"]', 'test@chronos.com')
  await page.fill('input[type="password"]', 'test123')
  
  // Clicar em entrar
  await page.click('button[type="submit"]')
  
  // Aguardar redirecionamento ou sucesso
  await page.waitForURL(/\/(employee|admin|auth\/complete-profile)/)
  
  // Salvar estado de autenticação
  await page.context().storageState({ path: authFile })
})
