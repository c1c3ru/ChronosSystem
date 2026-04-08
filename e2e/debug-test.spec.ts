import { test, expect } from '@playwright/test'

test('debug complete profile page', async ({ page }) => {
  await page.goto('/auth/complete-profile')
  
  // Aguardar carregamento
  await page.waitForLoadState('networkidle')
  
  // Capturar screenshot para debug
  await page.screenshot({ path: 'debug-complete-profile.png', fullPage: true })
  
  // Imprimir HTML da página para debug
  const html = await page.content()
  console.log('HTML da página:', html.substring(0, 1000))
  
  // Verificar se há algum elemento visível
  const allElements = await page.locator('*').count()
  console.log('Total de elementos na página:', allElements)
  
  // Verificar se há formulário
  const forms = await page.locator('form').count()
  console.log('Formulários encontrados:', forms)
  
  // Verificar se há inputs
  const inputs = await page.locator('input').count()
  console.log('Inputs encontrados:', inputs)
  
  // Verificar se há botões
  const buttons = await page.locator('button').count()
  console.log('Botões encontrados:', buttons)
  
  // Verificar URL atual
  console.log('URL atual:', page.url())
  
  // Verificar título
  const title = await page.title()
  console.log('Título da página:', title)
})
