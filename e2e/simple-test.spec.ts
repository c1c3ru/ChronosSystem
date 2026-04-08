import { test, expect } from '@playwright/test'

test.describe('Simple Tests', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/')
    
    // Aguardar carregamento
    await page.waitForLoadState('networkidle')
    
    // Verificar se a página carregou
    await expect(page).toHaveTitle(/Chronos/)
  })

  test('should navigate to complete profile page', async ({ page }) => {
    await page.goto('/auth/complete-profile')
    
    // Aguardar carregamento
    await page.waitForLoadState('networkidle')
    
    // Verificar se chegou na página
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should show form fields', async ({ page }) => {
    await page.goto('/auth/complete-profile')
    
    // Aguardar carregamento
    await page.waitForLoadState('networkidle')
    
    // Verificar se os campos do formulário estão presentes
    await expect(page.locator('input[type="tel"]')).toBeVisible()
    await expect(page.locator('textarea')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })
})
