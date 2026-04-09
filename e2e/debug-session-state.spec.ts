import { test, expect } from '@playwright/test'

test.describe('Debug Session State', () => {
  test('🔍 Verificar estado da sessão e botões', async ({ page }) => {
    console.log('🔍 Verificando estado da sessão...')

    // 1. Acessar homepage sem limpar cookies
    console.log('📍 1. Acessando homepage (sem limpar cookies)...')
    await page.goto('http://localhost:3000/')
    await page.waitForLoadState('networkidle')

    // Capturar screenshot
    await page.screenshot({ path: 'session-01-homepage.png', fullPage: true })

    // 2. Verificar se há indicação de usuário logado
    const sessionInfo = await page.evaluate(() => {
      return {
        cookies: document.cookie,
        localStorage: Object.keys(localStorage).length,
        sessionStorage: Object.keys(sessionStorage).length,
      }
    })
    console.log('🍪 Cookies:', sessionInfo.cookies ? 'Presentes' : 'Vazios')
    console.log('💾 LocalStorage items:', sessionInfo.localStorage)
    console.log('💾 SessionStorage items:', sessionInfo.sessionStorage)

    // 3. Verificar se o botão "Acessar Admin" está presente e clicável
    const adminButton = page.locator('text=Acessar Admin')
    const adminButtonExists = await adminButton.count()
    console.log(`🔘 Botão "Acessar Admin" encontrado: ${adminButtonExists > 0}`)

    if (adminButtonExists > 0) {
      const isVisible = await adminButton.isVisible()
      const isEnabled = await adminButton.isEnabled()
      console.log(`👁️ Visível: ${isVisible}, Habilitado: ${isEnabled}`)

      // Verificar o href do link
      const href = await adminButton.getAttribute('href')
      console.log(`🔗 Href: ${href}`)

      // Tentar clicar com força
      console.log('🖱️ Tentando clicar com force...')
      await adminButton.click({ force: true })

      await page.waitForTimeout(2000)
      await page.waitForLoadState('networkidle')

      const newUrl = page.url()
      console.log(`📍 URL após clique forçado: ${newUrl}`)

      await page.screenshot({ path: 'session-02-after-force-click.png', fullPage: true })
    }

    // 4. Tentar acessar /admin diretamente
    console.log('🔗 4. Tentando acessar /admin diretamente...')
    await page.goto('http://localhost:3000/admin')
    await page.waitForLoadState('networkidle')

    const adminUrl = page.url()
    console.log(`📍 URL ao acessar /admin: ${adminUrl}`)

    await page.screenshot({ path: 'session-03-direct-admin.png', fullPage: true })

    // 5. Verificar se foi redirecionado para login
    if (adminUrl.includes('/auth/signin')) {
      console.log('✅ Redirecionado para login como esperado')

      // Fazer login
      console.log('🔐 Fazendo login com admin...')
      await page.fill('input[type="email"]', 'admin@chronos.com')
      await page.fill('input[type="password"]', 'admin123')

      await page.screenshot({ path: 'session-04-login-filled.png', fullPage: true })

      await page.click('button[type="submit"]')

      await page.waitForTimeout(3000)
      await page.waitForLoadState('networkidle')

      const afterLoginUrl = page.url()
      console.log(`📍 URL após login: ${afterLoginUrl}`)

      await page.screenshot({ path: 'session-05-after-login.png', fullPage: true })

      if (afterLoginUrl.includes('/auth/complete-profile')) {
        console.log('✅ Redirecionado para complete-profile!')

        // Verificar estado do formulário
        const formExists = await page.locator('form').count()
        console.log(`📋 Formulários: ${formExists}`)

        if (formExists > 0) {
          console.log('📝 Preenchendo formulário rapidamente...')

          // Preencher apenas campos obrigatórios
          await page.fill('input[type="tel"]', '85988437783')
          await page.fill('textarea', 'Endereço Admin Teste')

          const dateInputs = page.locator('input[type="date"]')
          const dateCount = await dateInputs.count()
          for (let i = 0; i < dateCount; i++) {
            await dateInputs.nth(i).fill('1980-01-01')
          }

          const textInputs = page.locator('input[type="text"]')
          const textCount = await textInputs.count()
          for (let i = 0; i < textCount; i++) {
            await textInputs.nth(i).fill('Admin')
          }

          const telInputs = page.locator('input[type="tel"]')
          const telCount = await telInputs.count()
          for (let i = 1; i < telCount; i++) {
            await telInputs.nth(i).fill('85988437783')
          }

          await page.screenshot({ path: 'session-06-form-ready.png', fullPage: true })

          // Interceptar API
          let apiCalled = false
          page.on('response', (response) => {
            if (response.url().includes('/api/auth/complete-profile')) {
              apiCalled = true
              console.log(`📡 API chamada! Status: ${response.status()}`)
            }
          })

          // Submeter
          console.log('🚀 Submetendo formulário...')
          await page.click('button[type="submit"]')

          await page.waitForTimeout(5000)

          const finalUrl = page.url()
          console.log(`📍 URL final: ${finalUrl}`)
          console.log(`📡 API foi chamada: ${apiCalled}`)

          await page.screenshot({ path: 'session-07-final.png', fullPage: true })

          if (finalUrl.includes('/admin')) {
            console.log('🎉 SUCESSO: Chegou no /admin!')
          } else if (finalUrl !== afterLoginUrl) {
            console.log('✅ Houve redirecionamento')
          } else {
            console.log('❌ Ainda na mesma página')
          }
        }
      } else if (afterLoginUrl.includes('/admin')) {
        console.log('✅ Foi diretamente para /admin')
      } else {
        console.log(`❌ Redirecionamento inesperado: ${afterLoginUrl}`)
      }
    } else if (adminUrl.includes('/admin')) {
      console.log('✅ Acesso direto ao /admin (já logado)')
    } else {
      console.log(`❌ Redirecionamento inesperado: ${adminUrl}`)
    }

    console.log('🏁 Verificação concluída!')
  })
})
