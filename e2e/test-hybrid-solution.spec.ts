import { test, expect } from '@playwright/test'

test.describe('Test Hybrid Solution', () => {
  test('🔍 Verificar se a solução híbrida está funcionando', async ({ page }) => {
    console.log('🔍 Testando solução híbrida...')
    
    // Interceptar TODOS os console logs
    const consoleLogs: any[] = []
    page.on('console', msg => {
      const log = {
        type: msg.type(),
        text: msg.text()
      }
      consoleLogs.push(log)
      console.log(`🖥️ [${log.type.toUpperCase()}] ${log.text}`)
    })
    
    // Interceptar API calls
    let apiCalled = false
    page.on('response', response => {
      if (response.url().includes('/api/auth/complete-profile')) {
        apiCalled = true
        console.log(`📡 API complete-profile chamada! Status: ${response.status()}`)
      }
    })
    
    // 1. Limpar cookies e fazer login
    await page.context().clearCookies()
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
    
    // 3. Aguardar um pouco para ver os logs de hidratação
    console.log('⏳ Aguardando logs de hidratação...')
    await page.waitForTimeout(3000)
    
    // 4. Verificar se os logs de hidratação apareceram
    const hydrationLogs = consoleLogs.filter(log => 
      log.text.includes('hidratado') || 
      log.text.includes('Event listener') ||
      log.text.includes('anexando')
    )
    
    console.log(`📊 Logs de hidratação encontrados: ${hydrationLogs.length}`)
    hydrationLogs.forEach((log, i) => {
      console.log(`  ${i + 1}. [${log.type}] ${log.text}`)
    })
    
    // 5. Preencher formulário CORRETAMENTE
    console.log('📝 Preenchendo formulário com TODOS os campos...')
    
    // 1. Telefone principal
    await page.fill('input[type="tel"]', '85988437783')
    console.log('📞 1. phone preenchido')
    
    // 2. Endereço
    await page.fill('textarea', 'Rua Admin Teste, 123, Centro, Fortaleza, CE')
    console.log('🏠 2. address preenchido')
    
    // 3. Data de nascimento (primeiro date)
    const dateInputs = page.locator('input[type="date"]')
    await dateInputs.first().fill('1980-01-01')
    console.log('📅 3. birthDate preenchido')
    
    // 4. Contato de emergência (primeiro text)
    const textInputs = page.locator('input[type="text"]')
    await textInputs.first().fill('João Silva Emergência')
    console.log('👤 4. emergencyContact preenchido')
    
    // 5. Telefone de emergência (segundo tel)
    const telInputs = page.locator('input[type="tel"]')
    await telInputs.last().fill('85988437783')
    console.log('📞 5. emergencyPhone preenchido')
    
    // 6. Departamento (select dropdown)
    await page.selectOption('select', 'TI')
    console.log('🏢 6. department selecionado: Tecnologia da Informação (TI)')
    
    // 7. Data de início (último date)
    await dateInputs.last().fill('2024-01-01')
    console.log('📅 7. startDate preenchido')
    
    console.log('✅ Formulário preenchido')
    
    // 6. Aguardar um pouco e verificar logs
    await page.waitForTimeout(1000)
    
    // 7. Submeter formulário
    console.log('🚀 Submetendo formulário...')
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()
    
    // 8. Aguardar e verificar logs de submit
    console.log('⏳ Aguardando logs de submit...')
    await page.waitForTimeout(3000)
    
    // 9. Aguardar redirecionamento (múltiplas tentativas)
    console.log('⏳ Aguardando redirecionamento (até 5 segundos)...')
    await page.waitForTimeout(5000)
    
    // 9. Verificar se os logs de submit apareceram
    const submitLogs = consoleLogs.filter(log => 
      log.text.includes('handleSubmit') || 
      log.text.includes('Event listener manual') ||
      log.text.includes('Enviando dados') ||
      log.text.includes('Validação')
    )
    
    console.log(`📊 Logs de submit encontrados: ${submitLogs.length}`)
    submitLogs.forEach((log, i) => {
      console.log(`  ${i + 1}. [${log.type}] ${log.text}`)
    })
    
    // 10. Verificar resultado final
    const finalUrl = page.url()
    console.log(`📍 URL final: ${finalUrl}`)
    console.log(`📡 API foi chamada: ${apiCalled}`)
    
    // 11. Resumo
    console.log('\n📊 RESUMO:')
    console.log(`   Total de logs: ${consoleLogs.length}`)
    console.log(`   Logs de hidratação: ${hydrationLogs.length}`)
    console.log(`   Logs de submit: ${submitLogs.length}`)
    console.log(`   API chamada: ${apiCalled}`)
    
    if (hydrationLogs.length > 0) {
      console.log('✅ Hidratação detectada!')
    } else {
      console.log('❌ Hidratação NÃO detectada!')
    }
    
    if (submitLogs.length > 0) {
      console.log('✅ Submit detectado!')
    } else {
      console.log('❌ Submit NÃO detectado!')
    }
    
    if (apiCalled) {
      console.log('🎉 SUCESSO: API foi chamada!')
    } else {
      console.log('❌ PROBLEMA: API não foi chamada!')
    }
    
    console.log('🏁 Teste concluído!')
  })
})
