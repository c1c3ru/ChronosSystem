import { test, expect, type ConsoleMessage } from '@playwright/test'

test.describe('Test Credential Users', () => {
  test('🔍 Verificar se usuários de credenciais não vão para complete-profile', async ({
    page,
  }) => {
    console.log('🔍 Testando usuários de credenciais...')

    // Interceptar console logs
    interface ConsoleLog {
      type: string
      text: string
    }
    const consoleLogs: ConsoleLog[] = []
    page.on('console', (msg: ConsoleMessage) => {
      const log: ConsoleLog = {
        type: msg.type(),
        text: msg.text(),
      }
      consoleLogs.push(log)
      console.log(`🖥️ [${log.type.toUpperCase()}] ${log.text}`)
    })

    // Limpar cookies
    await page.context().clearCookies()

    // Testar estagiário (maria@chronos.com)
    console.log('👩‍🎓 Testando login do estagiário...')
    await page.goto('http://localhost:3000/auth/signin')
    await page.waitForLoadState('networkidle')

    await page.fill('input[type="email"]', 'maria@chronos.com')
    await page.fill('input[type="password"]', 'employee123')
    await page.click('button[type="submit"]')

    await page.waitForTimeout(3000)
    await page.waitForLoadState('networkidle')

    const currentUrl = page.url()
    console.log(`📍 URL após login do estagiário: ${currentUrl}`)

    if (currentUrl.includes('/auth/complete-profile')) {
      console.log('❌ PROBLEMA: Estagiário foi para complete-profile (não deveria)')
    } else if (currentUrl.includes('/employee')) {
      console.log('✅ CORRETO: Estagiário foi direto para /employee')
    } else {
      console.log(`⚠️ INESPERADO: Estagiário foi para ${currentUrl}`)
    }

    // Limpar cookies para próximo teste
    await page.context().clearCookies()

    // Testar supervisor
    console.log('👨‍💼 Testando login do supervisor...')
    await page.goto('http://localhost:3000/auth/signin')
    await page.waitForLoadState('networkidle')

    await page.fill('input[type="email"]', 'supervisor@chronos.com')
    await page.fill('input[type="password"]', 'supervisor123')
    await page.click('button[type="submit"]')

    await page.waitForTimeout(3000)
    await page.waitForLoadState('networkidle')

    const supervisorUrl = page.url()
    console.log(`📍 URL após login do supervisor: ${supervisorUrl}`)

    if (supervisorUrl.includes('/auth/complete-profile')) {
      console.log('❌ PROBLEMA: Supervisor foi para complete-profile (não deveria)')
    } else if (supervisorUrl.includes('/admin')) {
      console.log('✅ CORRETO: Supervisor foi direto para /admin')
    } else {
      console.log(`⚠️ INESPERADO: Supervisor foi para ${supervisorUrl}`)
    }

    // Limpar cookies para próximo teste
    await page.context().clearCookies()

    // Testar admin
    console.log('👨‍💻 Testando login do admin...')
    await page.goto('http://localhost:3000/auth/signin')
    await page.waitForLoadState('networkidle')

    await page.fill('input[type="email"]', 'admin@chronos.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')

    await page.waitForTimeout(3000)
    await page.waitForLoadState('networkidle')

    const adminUrl = page.url()
    console.log(`📍 URL após login do admin: ${adminUrl}`)

    if (adminUrl.includes('/auth/complete-profile')) {
      console.log('❌ PROBLEMA: Admin foi para complete-profile (não deveria)')
    } else if (adminUrl.includes('/admin')) {
      console.log('✅ CORRETO: Admin foi direto para /admin')
    } else {
      console.log(`⚠️ INESPERADO: Admin foi para ${adminUrl}`)
    }

    console.log('🏁 Teste de usuários de credenciais concluído!')
  })
})
