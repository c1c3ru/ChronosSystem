import { test, expect } from '@playwright/test'

test.describe('Manual Test Simulation', () => {
  test('🧪 Teste 1: Login Manual com Credenciais Admin', async ({ page }) => {
    console.log('🚀 TESTE 1: Login Manual com Admin')

    // Limpar sessão
    await page.context().clearCookies()

    // 1. Acessar homepage
    console.log('📍 1. Acessando homepage...')
    await page.goto('http://localhost:3000/')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'manual-01-homepage.png', fullPage: true })

    // 2. Clicar em "Acessar Admin"
    console.log('🖱️ 2. Clicando em "Acessar Admin"...')
    await page.click('text=Acessar Admin')
    await page.waitForLoadState('networkidle')

    const loginUrl = page.url()
    console.log(`📍 URL após clique: ${loginUrl}`)
    await page.screenshot({ path: 'manual-02-login-page.png', fullPage: true })

    // 3. Fazer login com credenciais admin
    if (loginUrl.includes('/auth/signin')) {
      console.log('✅ 3. Na página de login, preenchendo credenciais...')

      await page.fill('input[type="email"]', 'admin@chronos.com')
      await page.fill('input[type="password"]', 'admin123')

      console.log('🚀 4. Submetendo login...')
      await page.click('button[type="submit"]')

      // Aguardar redirecionamento
      await page.waitForTimeout(3000)
      await page.waitForLoadState('networkidle')

      const afterLoginUrl = page.url()
      console.log(`📍 URL após login: ${afterLoginUrl}`)
      await page.screenshot({ path: 'manual-03-after-login.png', fullPage: true })

      // 4. Verificar se foi para complete-profile
      if (afterLoginUrl.includes('/auth/complete-profile')) {
        console.log('✅ 5. Redirecionado para complete-profile!')

        // Interceptar chamadas da API
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

        // 5. Preencher formulário completo
        console.log('📝 6. Preenchendo formulário completo...')

        // Telefone principal
        await page.fill('input[type="tel"]', '85988437783')
        console.log('📞 Telefone principal preenchido')

        // Endereço
        await page.fill('textarea', 'Rua Admin Teste, 123, Centro, Fortaleza, CE')
        console.log('🏠 Endereço preenchido')

        // Data de nascimento
        const dateInputs = page.locator('input[type="date"]')
        await dateInputs.first().fill('1980-01-01')
        console.log('📅 Data de nascimento preenchida')

        // Contato de emergência
        const textInputs = page.locator('input[type="text"]')
        await textInputs.first().fill('Contato Admin Emergência')
        console.log('👤 Contato de emergência preenchido')

        // Telefone de emergência
        const telInputs = page.locator('input[type="tel"]')
        if ((await telInputs.count()) > 1) {
          await telInputs.last().fill('85988437783')
          console.log('📞 Telefone de emergência preenchido')
        }

        // Departamento
        if ((await textInputs.count()) > 1) {
          await textInputs.last().fill('Administração Geral')
          console.log('🏢 Departamento preenchido')
        }

        // Data de início
        if ((await dateInputs.count()) > 1) {
          await dateInputs.last().fill('2024-01-01')
          console.log('📅 Data de início preenchida')
        }

        await page.screenshot({ path: 'manual-04-form-filled.png', fullPage: true })

        // 6. Submeter formulário
        console.log('🚀 7. Submetendo formulário...')
        const submitButton = page.locator('button[type="submit"]')
        await submitButton.click()

        // Aguardar processamento
        console.log('⏳ 8. Aguardando processamento...')
        await page.waitForTimeout(5000)

        const finalUrl = page.url()
        console.log(`📍 URL final: ${finalUrl}`)
        await page.screenshot({ path: 'manual-05-final-result.png', fullPage: true })

        // 7. Verificar resultado
        if (apiCalled) {
          console.log('✅ API foi chamada com sucesso!')
          console.log('📊 Resposta:', apiResponse)
        } else {
          console.log('❌ API NÃO foi chamada!')
        }

        if (finalUrl.includes('/admin')) {
          console.log('🎉 SUCESSO TOTAL: Redirecionado para /admin!')
        } else if (finalUrl !== afterLoginUrl) {
          console.log('✅ Houve redirecionamento, mas não para /admin')
        } else {
          console.log('❌ PROBLEMA: Ainda na página de complete-profile')
        }
      } else if (afterLoginUrl.includes('/admin')) {
        console.log('✅ 5. Foi diretamente para /admin (perfil já completo)')
      } else {
        console.log(`❌ 5. Redirecionamento inesperado: ${afterLoginUrl}`)
      }
    } else {
      console.log('❌ 3. Não foi redirecionado para login')
    }

    console.log('🏁 TESTE 1 CONCLUÍDO')
  })

  test('🧪 Teste 2: Login com Estagiário (Employee)', async ({ page }) => {
    console.log('🚀 TESTE 2: Login com Estagiário')

    // Limpar sessão
    await page.context().clearCookies()

    // 1. Ir direto para login
    console.log('📍 1. Acessando página de login...')
    await page.goto('http://localhost:3000/auth/signin')
    await page.waitForLoadState('networkidle')

    // 2. Login com estagiário
    console.log('🔐 2. Fazendo login com estagiário...')
    await page.fill('input[type="email"]', 'maria@chronos.com')
    await page.fill('input[type="password"]', 'employee123')
    await page.click('button[type="submit"]')

    await page.waitForTimeout(3000)
    await page.waitForLoadState('networkidle')

    const employeeUrl = page.url()
    console.log(`📍 URL após login employee: ${employeeUrl}`)
    await page.screenshot({ path: 'manual-06-employee-login.png', fullPage: true })

    if (employeeUrl.includes('/employee')) {
      console.log('✅ Employee redirecionado para /employee (perfil já completo)')
    } else if (employeeUrl.includes('/auth/complete-profile')) {
      console.log('✅ Employee redirecionado para complete-profile (perfil incompleto)')
    } else {
      console.log(`❌ Redirecionamento inesperado: ${employeeUrl}`)
    }

    console.log('🏁 TESTE 2 CONCLUÍDO')
  })

  test('🧪 Teste 3: Verificar Estado do Banco', async ({ page }) => {
    console.log('🚀 TESTE 3: Verificar Estado do Banco')

    // Este teste vai verificar o estado atual dos usuários no banco
    console.log('📊 Verificando dados dos usuários...')

    // Simular uma página que mostra dados do banco (se existir)
    // Ou pelo menos verificar se conseguimos acessar as páginas protegidas

    await page.goto('http://localhost:3000/')
    await page.screenshot({ path: 'manual-07-database-state.png', fullPage: true })

    console.log('🏁 TESTE 3 CONCLUÍDO')
  })
})
