import { test, expect } from '@playwright/test'

test.describe('Debug Detailed Flow', () => {
  test('Investigar fluxo completo passo a passo', async ({ page }) => {
    console.log('🔍 Investigando fluxo detalhado...')

    // 1. Limpar cookies para garantir que não há sessão
    await page.context().clearCookies()
    console.log('🧹 Cookies limpos')

    // 2. Ir para homepage
    console.log('📍 Acessando homepage...')
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Capturar screenshot da homepage
    await page.screenshot({ path: 'debug-detailed-01-homepage.png', fullPage: true })

    // Verificar se há indicação de usuário logado
    const userInfo = await page.locator('text=Bem-vindo, text=Olá, text=Logado').count()
    console.log(`👤 Indicações de usuário logado: ${userInfo}`)

    // Listar todos os botões/links na página
    const buttons = await page.locator('button, a[href]').all()
    console.log(`🔘 Total de botões/links encontrados: ${buttons.length}`)

    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      const text = await buttons[i].textContent()
      const href = await buttons[i].getAttribute('href')
      console.log(`  ${i + 1}. "${text?.trim()}" ${href ? `(href: ${href})` : ''}`)
    }

    // 3. Procurar especificamente pelo botão "Acessar Admin"
    const adminButton = page.locator('text=Acessar Admin')
    const adminButtonExists = await adminButton.count()
    console.log(`🔍 Botão "Acessar Admin" encontrado: ${adminButtonExists > 0}`)

    if (adminButtonExists > 0) {
      // Verificar se é um link ou botão
      const tagName = await adminButton.evaluate((el) => el.tagName.toLowerCase())
      const href = await adminButton.getAttribute('href')
      console.log(`🏷️ Tag: ${tagName}, href: ${href}`)

      // Clicar no botão
      console.log('🖱️ Clicando em "Acessar Admin"...')
      await adminButton.click()

      // Aguardar um pouco
      await page.waitForTimeout(2000)
      await page.waitForLoadState('networkidle')

      const newUrl = page.url()
      console.log(`📍 URL após clique: ${newUrl}`)

      // Capturar screenshot após clique
      await page.screenshot({ path: 'debug-detailed-02-after-admin-click.png', fullPage: true })

      // 4. Analisar o que aconteceu
      if (newUrl.includes('/auth/signin')) {
        console.log('✅ Redirecionado para login como esperado')

        // Fazer login
        console.log('🔐 Fazendo login...')
        await page.fill('input[type="email"]', 'admin@chronos.com')
        await page.fill('input[type="password"]', 'admin123')

        // Capturar screenshot antes do login
        await page.screenshot({ path: 'debug-detailed-03-before-login.png', fullPage: true })

        await page.click('button[type="submit"]')
        console.log('🚀 Login submetido')

        // Aguardar redirecionamento
        await page.waitForTimeout(3000)
        await page.waitForLoadState('networkidle')

        const loginResultUrl = page.url()
        console.log(`📍 URL após login: ${loginResultUrl}`)

        // Capturar screenshot após login
        await page.screenshot({ path: 'debug-detailed-04-after-login.png', fullPage: true })

        // 5. Verificar se foi para complete-profile
        if (loginResultUrl.includes('/auth/complete-profile')) {
          console.log('✅ Redirecionado para complete-profile!')

          // Interceptar API calls
          let apiCalls: any[] = []
          page.on('response', (response) => {
            if (response.url().includes('/api/')) {
              apiCalls.push({
                url: response.url(),
                status: response.status(),
                method: response.request().method(),
              })
              console.log(
                `📡 API: ${response.request().method()} ${response.url()} - ${response.status()}`
              )
            }
          })

          // Testar o formulário
          console.log('📝 Testando formulário de complete-profile...')

          // Verificar se o formulário existe
          const formExists = await page.locator('form').count()
          console.log(`📋 Formulários encontrados: ${formExists}`)

          if (formExists > 0) {
            // Preencher campos básicos
            console.log('📝 Preenchendo campos...')

            const phoneInput = page.locator('input[type="tel"]').first()
            if (await phoneInput.isVisible()) {
              await phoneInput.fill('85988437783')
              console.log('📞 Telefone preenchido')
            }

            const textArea = page.locator('textarea')
            if (await textArea.isVisible()) {
              await textArea.fill('Rua Teste Admin, 123, Centro')
              console.log('🏠 Endereço preenchido')
            }

            // Preencher datas
            const dateInputs = page.locator('input[type="date"]')
            const dateCount = await dateInputs.count()
            console.log(`📅 Campos de data: ${dateCount}`)

            for (let i = 0; i < dateCount; i++) {
              await dateInputs.nth(i).fill('1980-01-01')
              console.log(`📅 Data ${i + 1} preenchida`)
            }

            // Preencher campos de texto
            const textInputs = page.locator('input[type="text"]')
            const textCount = await textInputs.count()
            console.log(`📝 Campos de texto: ${textCount}`)

            for (let i = 0; i < textCount; i++) {
              await textInputs.nth(i).fill('Admin Teste')
              console.log(`📝 Campo ${i + 1} preenchido`)
            }

            // Preencher telefones adicionais
            const telInputs = page.locator('input[type="tel"]')
            const telCount = await telInputs.count()

            for (let i = 1; i < telCount; i++) {
              await telInputs.nth(i).fill('85988437783')
              console.log(`📞 Telefone adicional ${i} preenchido`)
            }

            // Capturar screenshot com formulário preenchido
            await page.screenshot({ path: 'debug-detailed-05-form-filled.png', fullPage: true })

            // Submeter formulário
            console.log('🚀 Submetendo formulário...')
            const submitButton = page.locator('button[type="submit"]')

            if (await submitButton.isVisible()) {
              const buttonText = await submitButton.textContent()
              console.log(`🔘 Texto do botão: "${buttonText}"`)

              await submitButton.click()
              console.log('✅ Formulário submetido!')

              // Aguardar processamento
              await page.waitForTimeout(5000)

              const finalUrl = page.url()
              console.log(`📍 URL final: ${finalUrl}`)

              // Capturar screenshot final
              await page.screenshot({ path: 'debug-detailed-06-final-result.png', fullPage: true })

              // Mostrar chamadas da API
              console.log('📡 Chamadas da API durante o teste:')
              apiCalls.forEach((call, index) => {
                console.log(`  ${index + 1}. ${call.method} ${call.url} - ${call.status}`)
              })

              // Verificar se redirecionou
              if (finalUrl !== loginResultUrl) {
                console.log('✅ SUCESSO: Redirecionamento funcionou!')
              } else {
                console.log('❌ PROBLEMA: Ainda na mesma página')

                // Verificar se há erros
                const errorCount = await page
                  .locator('text=erro, text=Erro, text=obrigatório')
                  .count()
                console.log(`❗ Erros na página: ${errorCount}`)
              }
            } else {
              console.log('❌ Botão de submit não encontrado')
            }
          } else {
            console.log('❌ Formulário não encontrado')
          }
        } else {
          console.log(`❌ Não foi para complete-profile. URL: ${loginResultUrl}`)
        }
      } else if (newUrl.includes('/admin')) {
        console.log('✅ Foi diretamente para /admin (usuário já logado)')
      } else {
        console.log(`❌ Redirecionamento inesperado para: ${newUrl}`)
      }
    } else {
      console.log('❌ Botão "Acessar Admin" não encontrado')
    }

    console.log('🏁 Investigação concluída!')
  })
})
