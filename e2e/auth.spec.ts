import { test, expect, type Page } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    // Navigate to the home page
    await page.goto('/')
  })

  test('should display home page correctly', async ({ page }: { page: Page }) => {
    // Check if the main heading is visible
    await expect(page.getByRole('heading', { name: 'Chronos System' })).toBeVisible()
    
    // Check if the main description is visible
    await expect(page.getByText('Sistema moderno de registro de ponto eletrônico')).toBeVisible()
    
    // Check if all three access cards are present
    await expect(page.getByText('Painel Administrativo')).toBeVisible()
    await expect(page.getByText('Portal do Estagiário')).toBeVisible()
    await expect(page.getByText('Kiosk')).toBeVisible()
  })

  test('should navigate to admin login when clicking admin card', async ({ page }: { page: Page }) => {
    // Click on the admin card
    await page.getByRole('link', { name: /Acessar Admin/i }).click()
    
    // Should redirect to admin page (which will redirect to login if not authenticated)
    await expect(page).toHaveURL(/\/admin|\/auth\/signin/)
  })

  test('should navigate to employee portal when clicking employee card', async ({ page }: { page: Page }) => {
    // Click on the employee card
    await page.getByRole('link', { name: /Acessar Portal/i }).click()
    
    // Should redirect to employee page (which will redirect to login if not authenticated)
    await expect(page).toHaveURL(/\/employee|\/auth\/signin/)
  })

  test('should navigate to kiosk when clicking kiosk card', async ({ page }: { page: Page }) => {
    // Click on the kiosk card
    await page.getByRole('link', { name: /Abrir Kiosk/i }).click()
    
    // Should navigate to kiosk page
    await expect(page).toHaveURL('/kiosk')
    
    // Check if kiosk page loads correctly
    await expect(page.getByText('Chronos Kiosk')).toBeVisible()
    await expect(page.getByText('Registrar Ponto')).toBeVisible()
  })

  test('should show sign-in page when accessing protected route', async ({ page }: { page: Page }) => {
    // Try to access admin page directly
    await page.goto('/admin')
    
    // Should be redirected to sign-in page or show sign-in form
    const isSignInPage = page.url().includes('/auth/signin')
    const hasSignInButton = await page.getByRole('button', { name: /sign in|entrar/i }).isVisible().catch(() => false)
    
    expect(isSignInPage || hasSignInButton).toBeTruthy()
  })

  test('kiosk page should display QR code and instructions', async ({ page }: { page: Page }) => {
    await page.goto('/kiosk')
    
    // Check if the page title is correct
    await expect(page.getByRole('heading', { name: 'Chronos Kiosk' })).toBeVisible()
    
    // Check if QR code section is present
    await expect(page.getByText('Registrar Ponto')).toBeVisible()
    
    // Check if instructions are present
    await expect(page.getByText('Como usar:')).toBeVisible()
    await expect(page.getByText('Abra o app Chronos no seu celular')).toBeVisible()
    
    // Check if recent activity section is present
    await expect(page.getByText('Atividade Recente')).toBeVisible()
    
    // Check if status indicators are present
    await expect(page.getByText(/Online|Offline/)).toBeVisible()
  })

  test('should be responsive on mobile devices', async ({ page }: { page: Page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/')
    
    // Check if main elements are still visible on mobile
    await expect(page.getByRole('heading', { name: 'Chronos System' })).toBeVisible()
    await expect(page.getByText('Painel Administrativo')).toBeVisible()
    await expect(page.getByText('Portal do Estagiário')).toBeVisible()
    await expect(page.getByText('Kiosk')).toBeVisible()
  })

  test('should have proper meta tags and title', async ({ page }: { page: Page }) => {
    await page.goto('/')
    
    // Check page title
    await expect(page).toHaveTitle(/Chronos System|ChronosSystem/)
    
    // Check if favicon is present
    const favicon = page.locator('link[rel="icon"]')
    await expect(favicon).toHaveCount(1)
  })

  test('should handle network errors gracefully', async ({ page }: { page: Page }) => {
    // Simulate offline condition
    await page.context().setOffline(true)
    
    await page.goto('/')
    
    // The page should still load (static content)
    await expect(page.getByRole('heading', { name: 'Chronos System' })).toBeVisible()
    
    // Restore online condition
    await page.context().setOffline(false)
  })
})
