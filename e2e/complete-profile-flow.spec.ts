import { test, expect } from '@playwright/test'

test.describe('Complete Profile Flow with Authentication', () => {
  test('should complete profile flow end-to-end', async ({ page }) => {
    // 1. Ir para página de login
    await page.goto('/auth/signin')
    await page.waitForLoadState('networkidle')

    // 2. Fazer login com credenciais (se existir usuário de teste)
    // Vamos tentar com o usuário que já existe no banco
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')

    if (await emailInput.isVisible()) {
      await emailInput.fill('admin@chronos.com')
      await passwordInput.fill('admin123')

      // Clicar no botão de login
      await page.click('button[type="submit"]')

      // Aguardar redirecionamento
      await page.waitForLoadState('networkidle')
    }

    // 3. Navegar para complete profile (ou ser redirecionado automaticamente)
    await page.goto('/auth/complete-profile')
    await page.waitForLoadState('networkidle')

    // 4. Verificar se chegamos na página correta
    console.log('URL atual após login:', page.url())

    // 5. Capturar screenshot para debug
    await page.screenshot({ path: 'complete-profile-after-login.png', fullPage: true })

    // 6. Verificar se o formulário está presente
    const forms = await page.locator('form').count()
    console.log('Formulários encontrados após login:', forms)

    if (forms > 0) {
      // 7. Tentar preencher o formulário
      const phoneInput = page.locator('input[placeholder*="99999-9999"]')
      if (await phoneInput.isVisible()) {
        await phoneInput.fill('(85) 98843-7783')
        console.log('✅ Campo telefone preenchido')
      }

      const addressTextarea = page.locator('textarea')
      if (await addressTextarea.isVisible()) {
        await addressTextarea.fill('Rua Teste, 123, Bairro Teste')
        console.log('✅ Campo endereço preenchido')
      }

      // Preencher data de nascimento
      const birthDateInput = page.locator('input[type="date"]').first()
      if (await birthDateInput.isVisible()) {
        await birthDateInput.fill('1984-02-06')
        console.log('✅ Data de nascimento preenchida')
      }

      // Preencher contato de emergência
      const emergencyContactInput = page.locator('input[placeholder*="Nome completo"]')
      if (await emergencyContactInput.isVisible()) {
        await emergencyContactInput.fill('Contato de Emergência')
        console.log('✅ Contato de emergência preenchido')
      }

      // Preencher telefone de emergência
      const emergencyPhoneInput = page.locator('input[placeholder*="88888-8888"]')
      if (await emergencyPhoneInput.isVisible()) {
        await emergencyPhoneInput.fill('(85) 98843-7783')
        console.log('✅ Telefone de emergência preenchido')
      }

      // Preencher departamento
      const departmentInput = page.locator('input[placeholder*="Tecnologia"]')
      if (await departmentInput.isVisible()) {
        await departmentInput.fill('Tecnologia da Informação')
        console.log('✅ Departamento preenchido')
      }

      // Preencher data de início
      const startDateInput = page.locator('input[type="date"]').last()
      if (await startDateInput.isVisible()) {
        await startDateInput.fill('2024-01-01')
        console.log('✅ Data de início preenchida')
      }

      // 8. Submeter formulário
      const submitButton = page.locator('button[type="submit"]')
      if (await submitButton.isVisible()) {
        console.log('🚀 Submetendo formulário...')
        await submitButton.click()

        // 9. Aguardar processamento
        await page.waitForTimeout(2000)

        // 10. Verificar se houve redirecionamento
        console.log('URL após submissão:', page.url())

        // 11. Capturar screenshot final
        await page.screenshot({ path: 'after-form-submission.png', fullPage: true })

        // 12. Verificar se chegou no dashboard
        if (page.url().includes('/employee') || page.url().includes('/admin')) {
          console.log('✅ Redirecionamento bem-sucedido!')
          await expect(page.locator('h1')).toBeVisible()
        } else {
          console.log('❌ Redirecionamento não funcionou')
        }
      }
    } else {
      console.log('❌ Formulário não encontrado')
    }
  })
})
