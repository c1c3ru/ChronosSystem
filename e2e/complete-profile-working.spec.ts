import { test, expect } from '@playwright/test'

test.describe('Complete Profile - Working Test', () => {
  test('✅ Teste com TODOS os campos obrigatórios', async ({ page }) => {
    console.log('🚀 Teste completo com todos os campos obrigatórios')

    // 1. Fazer login
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

    // 3. Interceptar API
    let apiCalled = false
    let apiResponse = null

    page.on('response', async (response) => {
      if (response.url().includes('/api/auth/complete-profile')) {
        apiCalled = true
        console.log(`📡 API complete-profile chamada! Status: ${response.status()}`)
        try {
          const data = await response.json()
          apiResponse = data
          console.log('📡 Resposta da API:', JSON.stringify(data, null, 2))
        } catch (e) {
          console.log('📡 Erro ao ler resposta da API')
        }
      }
    })

    // 4. Preencher TODOS os campos obrigatórios corretamente
    console.log('📝 Preenchendo TODOS os campos obrigatórios...')

    // 1. Telefone principal (phone)
    const phoneInput = page.locator('input[type="tel"]').first()
    await phoneInput.fill('85988437783')
    const phoneValue = await phoneInput.inputValue()
    console.log(`📞 1. phone: "${phoneValue}"`)

    // 2. Endereço (address)
    const addressInput = page.locator('textarea')
    await addressInput.fill('Rua Admin Teste, 123, Centro, Fortaleza, CE')
    const addressValue = await addressInput.inputValue()
    console.log(`🏠 2. address: "${addressValue}"`)

    // 3. Data de nascimento (birthDate)
    const birthDateInput = page.locator('input[type="date"]').first()
    await birthDateInput.fill('1980-01-01')
    const birthDateValue = await birthDateInput.inputValue()
    console.log(`📅 3. birthDate: "${birthDateValue}"`)

    // 4. Contato de emergência (emergencyContact)
    const emergencyContactInput = page.locator('input[type="text"]').first()
    await emergencyContactInput.fill('João Silva Contato Emergência')
    const emergencyContactValue = await emergencyContactInput.inputValue()
    console.log(`👤 4. emergencyContact: "${emergencyContactValue}"`)

    // 5. Telefone de emergência (emergencyPhone)
    const emergencyPhoneInput = page.locator('input[type="tel"]').last()
    await emergencyPhoneInput.fill('85988437783')
    const emergencyPhoneValue = await emergencyPhoneInput.inputValue()
    console.log(`📞 5. emergencyPhone: "${emergencyPhoneValue}"`)

    // 6. Departamento (department)
    const departmentInput = page.locator('input[type="text"]').last()
    await departmentInput.fill('Administração Geral')
    const departmentValue = await departmentInput.inputValue()
    console.log(`🏢 6. department: "${departmentValue}"`)

    // 7. Data de início (startDate)
    const startDateInput = page.locator('input[type="date"]').last()
    await startDateInput.fill('2024-01-01')
    const startDateValue = await startDateInput.inputValue()
    console.log(`📅 7. startDate: "${startDateValue}"`)

    // 5. Capturar screenshot com formulário completo
    await page.screenshot({ path: 'working-form-complete.png', fullPage: true })

    // 6. Verificar se há erros de validação
    await page.waitForTimeout(1000) // Aguardar validação

    const errorMessages = await page.locator('text=obrigatório, text=erro, text=inválido').count()
    console.log(`❗ Mensagens de erro: ${errorMessages}`)

    if (errorMessages > 0) {
      console.log('❌ Há erros de validação, listando...')
      const errors = await page
        .locator('text=obrigatório, text=erro, text=inválido')
        .allTextContents()
      errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`)
      })
    }

    // 7. Verificar estado do botão
    const submitButton = page.locator('button[type="submit"]')
    const buttonText = await submitButton.textContent()
    const isEnabled = await submitButton.isEnabled()
    console.log(`🔘 Botão: "${buttonText}", Habilitado: ${isEnabled}`)

    // 8. Submeter formulário
    console.log('🚀 Submetendo formulário com todos os campos...')
    await submitButton.click()

    // 9. Aguardar processamento
    console.log('⏳ Aguardando processamento...')
    await page.waitForTimeout(5000)

    // 10. Verificar resultado
    const finalUrl = page.url()
    console.log(`📍 URL final: ${finalUrl}`)

    await page.screenshot({ path: 'working-form-result.png', fullPage: true })

    // 11. Verificar se a API foi chamada
    if (apiCalled) {
      console.log('🎉 SUCESSO: API foi chamada!')
      console.log('📊 Resposta:', apiResponse)

      if (finalUrl.includes('/admin')) {
        console.log('🎉 SUCESSO TOTAL: Redirecionado para /admin!')
      } else if (finalUrl !== currentUrl) {
        console.log('✅ Houve redirecionamento')
      } else {
        console.log('❌ Ainda na mesma página, mas API foi chamada')
      }
    } else {
      console.log('❌ PROBLEMA: API NÃO foi chamada')

      // Verificar se o botão mudou de estado
      const finalButtonText = await submitButton.textContent()
      console.log(`🔘 Estado final do botão: "${finalButtonText}"`)
    }

    console.log('🏁 Teste concluído!')
  })
})
