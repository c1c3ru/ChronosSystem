import { test, expect } from '@playwright/test'

test.describe('Debug Real User Flow', () => {
  test('Debug: Complete profile flow exactly as user does', async ({ page }) => {
    console.log('🔍 Iniciando debug do fluxo real do usuário...')

    // 1. Ir para homepage
    console.log('📍 Acessando http://localhost:3000/')
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Capturar screenshot da homepage
    await page.screenshot({ path: 'debug-01-homepage.png', fullPage: true })
    console.log('📸 Screenshot da homepage capturada')

    // 2. Procurar pelo botão "Acessar Admin"
    console.log('🔍 Procurando botão "Acessar Admin"...')
    const adminButton = page.locator('text=Acessar Admin')

    if (await adminButton.isVisible()) {
      console.log('✅ Botão "Acessar Admin" encontrado!')
      await adminButton.click()
      console.log('🖱️ Clicou no botão "Acessar Admin"')
    } else {
      console.log('❌ Botão "Acessar Admin" não encontrado')
      // Procurar outros botões similares
      const buttons = await page.locator('button, a').all()
      console.log(`🔍 Encontrados ${buttons.length} botões/links na página`)

      for (let i = 0; i < Math.min(buttons.length, 5); i++) {
        const text = await buttons[i].textContent()
        console.log(`  - Botão ${i + 1}: "${text}"`)
      }
    }

    // 3. Aguardar redirecionamento
    await page.waitForLoadState('networkidle')
    console.log('🔄 Aguardou carregamento após clique')

    // Verificar URL atual
    const currentUrl = page.url()
    console.log(`📍 URL atual: ${currentUrl}`)

    // Capturar screenshot após redirecionamento
    await page.screenshot({ path: 'debug-02-after-admin-click.png', fullPage: true })
    console.log('📸 Screenshot após clique no admin capturada')

    // 4. Se estiver na página de complete-profile, testar o formulário
    if (currentUrl.includes('/auth/complete-profile')) {
      console.log('✅ Redirecionado para complete-profile como esperado')

      // Verificar se o formulário está presente
      const form = page.locator('form')
      const formCount = await form.count()
      console.log(`📋 Formulários encontrados: ${formCount}`)

      if (formCount > 0) {
        console.log('📝 Preenchendo formulário...')

        // Preencher campos básicos
        const phoneInput = page.locator('input[type="tel"]').first()
        if (await phoneInput.isVisible()) {
          await phoneInput.fill('85988437783')
          console.log('📞 Telefone preenchido')
        }

        const textArea = page.locator('textarea')
        if (await textArea.isVisible()) {
          await textArea.fill('Rua Teste, 123, Bairro Teste')
          console.log('🏠 Endereço preenchido')
        }

        // Preencher campos de data
        const dateInputs = page.locator('input[type="date"]')
        const dateCount = await dateInputs.count()
        console.log(`📅 Campos de data: ${dateCount}`)

        for (let i = 0; i < dateCount; i++) {
          await dateInputs.nth(i).fill('1990-01-01')
          console.log(`📅 Data ${i + 1} preenchida`)
        }

        // Preencher campos de texto
        const textInputs = page.locator('input[type="text"]')
        const textCount = await textInputs.count()
        console.log(`📝 Campos de texto: ${textCount}`)

        for (let i = 0; i < textCount; i++) {
          await textInputs.nth(i).fill('Campo Teste')
          console.log(`📝 Campo de texto ${i + 1} preenchido`)
        }

        // Preencher telefones adicionais
        const telInputs = page.locator('input[type="tel"]')
        const telCount = await telInputs.count()
        console.log(`📞 Total de telefones: ${telCount}`)

        for (let i = 1; i < telCount; i++) {
          await telInputs.nth(i).fill('85988437783')
          console.log(`📞 Telefone ${i + 1} preenchido`)
        }

        // Capturar screenshot com formulário preenchido
        await page.screenshot({ path: 'debug-03-form-filled.png', fullPage: true })
        console.log('📸 Screenshot do formulário preenchido')

        // 5. Interceptar a requisição da API para ver o que acontece
        let apiCalled = false
        let apiResponse = null

        page.on('response', (response) => {
          if (response.url().includes('/api/auth/complete-profile')) {
            apiCalled = true
            console.log(`📡 API chamada! Status: ${response.status()}`)
            response
              .json()
              .then((data) => {
                apiResponse = data
                console.log('📡 Resposta da API:', JSON.stringify(data, null, 2))
              })
              .catch(() => {
                console.log('📡 Erro ao ler resposta da API')
              })
          }
        })

        // 6. Clicar no botão "Salvar e Continuar"
        const submitButton = page.locator('button[type="submit"]')
        if (await submitButton.isVisible()) {
          const buttonText = await submitButton.textContent()
          console.log(`🚀 Clicando no botão: "${buttonText}"`)

          await submitButton.click()
          console.log('🚀 Botão clicado!')

          // Aguardar um tempo para ver o que acontece
          await page.waitForTimeout(5000)

          // Verificar se a API foi chamada
          if (apiCalled) {
            console.log('✅ API foi chamada com sucesso')
            console.log('📡 Resposta:', apiResponse)
          } else {
            console.log('❌ API NÃO foi chamada!')
          }

          // Verificar URL após submissão
          const finalUrl = page.url()
          console.log(`📍 URL final: ${finalUrl}`)

          // Capturar screenshot final
          await page.screenshot({ path: 'debug-04-after-submit.png', fullPage: true })
          console.log('📸 Screenshot final capturada')

          // Verificar se ainda está na mesma página
          if (finalUrl === currentUrl) {
            console.log('❌ PROBLEMA: Ainda na mesma página!')

            // Verificar se há erros na página
            const errorMessages = await page
              .locator('text=erro, text=Erro, text=obrigatório')
              .count()
            console.log(`❗ Mensagens de erro encontradas: ${errorMessages}`)

            // Verificar estado do botão
            const finalButtonText = await submitButton.textContent()
            console.log(`🔘 Estado final do botão: "${finalButtonText}"`)
          } else {
            console.log('✅ Redirecionamento funcionou!')
          }
        } else {
          console.log('❌ Botão "Salvar e Continuar" não encontrado')
        }
      } else {
        console.log('❌ Nenhum formulário encontrado na página')
      }
    } else {
      console.log(`❌ Não foi redirecionado para complete-profile. URL: ${currentUrl}`)
    }

    console.log('🏁 Debug concluído!')
  })
})
