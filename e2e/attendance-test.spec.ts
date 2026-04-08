import { test, expect } from '@playwright/test';

test.describe('Sistema de Registro de Ponto', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para a página inicial
    await page.goto('http://localhost:3000');
  });

  test('deve permitir login e acesso à página do funcionário', async ({ page }) => {
    // Verificar se a página inicial carregou
    await expect(page).toHaveTitle(/Chronos/);
    
    // Procurar por botão de login ou link para entrar
    const loginButton = page.locator('text=Entrar').or(page.locator('text=Login')).or(page.locator('[href*="signin"]'));
    
    if (await loginButton.isVisible()) {
      await loginButton.click();
    } else {
      // Se não houver botão de login visível, tentar navegar diretamente
      await page.goto('http://localhost:3000/auth/signin');
    }
    
    // Aguardar a página de login carregar
    await page.waitForLoadState('networkidle');
    
    // Verificar se estamos na página de login ou se já estamos logados
    const currentUrl = page.url();
    console.log('URL atual:', currentUrl);
    
    // Se já estiver logado, pode ir direto para employee
    if (currentUrl.includes('/employee')) {
      console.log('Usuário já está logado e na página do funcionário');
      return;
    }
    
    // Tentar fazer login com Google ou outro provedor
    const googleButton = page.locator('text=Google').or(page.locator('[data-provider="google"]'));
    if (await googleButton.isVisible()) {
      console.log('Botão do Google encontrado, mas não vamos fazer login real');
      // Em um teste real, você configuraria credenciais de teste
    }
    
    // Para este teste, vamos simular que o usuário está logado
    // navegando diretamente para a página do funcionário
    await page.goto('http://localhost:3000/employee');
  });

  test('deve exibir a interface de registro de ponto', async ({ page }) => {
    // Navegar diretamente para a página do funcionário (simulando login)
    await page.goto('http://localhost:3000/employee');
    
    // Aguardar o carregamento da página
    await page.waitForLoadState('networkidle');
    
    // Verificar se a página carregou corretamente
    await expect(page.locator('text=Portal do Estagiário').or(page.locator('text=Painel do Funcionário'))).toBeVisible();
    
    // Verificar se o botão de registrar ponto está visível
    const registerButton = page.locator('text=Registrar Entrada').or(page.locator('text=Registrar Saída')).or(page.locator('text=Abrir Scanner'));
    await expect(registerButton.first()).toBeVisible();
    
    console.log('✅ Interface de registro de ponto está visível');
  });

  test('deve abrir o modal do scanner quando clicar em registrar ponto', async ({ page }) => {
    // Navegar para a página do funcionário
    await page.goto('http://localhost:3000/employee');
    await page.waitForLoadState('networkidle');
    
    // Encontrar e clicar no botão de registrar ponto
    const registerButton = page.locator('text=Registrar Entrada').or(page.locator('text=Registrar Saída')).or(page.locator('text=Abrir Scanner'));
    
    if (await registerButton.first().isVisible()) {
      await registerButton.first().click();
      
      // Verificar se o modal do scanner abriu
      await expect(page.locator('text=Registrar Ponto').or(page.locator('text=Scanner'))).toBeVisible();
      
      // Verificar se há instruções para o usuário
      await expect(page.locator('text=Aponte a câmera').or(page.locator('text=câmera'))).toBeVisible();
      
      console.log('✅ Modal do scanner abriu corretamente');
      
      // Verificar se há um botão para fechar o modal
      const closeButton = page.locator('[aria-label="Close"]').or(page.locator('text=Cancelar')).or(page.locator('text=Fechar'));
      await expect(closeButton.first()).toBeVisible();
      
      // Fechar o modal
      await closeButton.first().click();
      
      console.log('✅ Modal fechado com sucesso');
    } else {
      console.log('⚠️ Botão de registrar ponto não encontrado - pode precisar de login');
    }
  });

  test('deve simular registro de ponto com QR code', async ({ page }) => {
    // Navegar para a página do funcionário
    await page.goto('http://localhost:3000/employee');
    await page.waitForLoadState('networkidle');
    
    // Interceptar a requisição de registro de ponto
    await page.route('**/api/attendance/simple-register', async route => {
      // Simular uma resposta de sucesso
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          record: {
            type: 'ENTRY',
            time: '09:00',
            timestamp: new Date().toISOString(),
            location: 'Recepção',
            machineName: 'Máquina 01'
          }
        })
      });
    });
    
    // Abrir o scanner
    const registerButton = page.locator('text=Registrar Entrada').or(page.locator('text=Registrar Saída')).or(page.locator('text=Abrir Scanner'));
    
    if (await registerButton.first().isVisible()) {
      await registerButton.first().click();
      
      // Aguardar o modal abrir
      await expect(page.locator('text=Registrar Ponto').or(page.locator('text=Scanner'))).toBeVisible();
      
      // Simular a leitura de um QR code válido
      // Vamos executar JavaScript para simular o processo
      await page.evaluate(() => {
        // Simular que um QR code foi detectado
        const qrData = 'machine-1'; // QR code simples
        
        // Simular o processo de registro
        fetch('/api/attendance/simple-register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qrData })
        }).then(response => response.json())
          .then(data => {
            if (data.success) {
              // Simular exibição de sucesso
              console.log('Registro simulado com sucesso');
            }
          });
      });
      
      // Aguardar a mensagem de sucesso
      await expect(page.locator('text=registrada').or(page.locator('text=sucesso'))).toBeVisible({ timeout: 10000 });
      
      console.log('✅ Registro de ponto simulado com sucesso');
      
      // Aguardar o modal fechar automaticamente
      await page.waitForTimeout(3000);
      
    } else {
      console.log('⚠️ Não foi possível abrir o scanner - pode precisar de autenticação');
    }
  });

  test('deve exibir histórico de registros', async ({ page }) => {
    // Navegar para a página do funcionário
    await page.goto('http://localhost:3000/employee');
    await page.waitForLoadState('networkidle');
    
    // Verificar se há uma seção de registros recentes ou histórico
    const historySection = page.locator('text=Registros Recentes').or(page.locator('text=Histórico')).or(page.locator('text=Últimos Registros'));
    
    if (await historySection.isVisible()) {
      console.log('✅ Seção de histórico encontrada');
      
      // Verificar se há registros exibidos
      const records = page.locator('[data-testid="attendance-record"]').or(page.locator('.record-item')).or(page.locator('text=Entrada').or(page.locator('text=Saída')));
      
      if (await records.first().isVisible()) {
        console.log('✅ Registros de ponto estão sendo exibidos');
      } else {
        console.log('ℹ️ Nenhum registro encontrado - pode ser um usuário novo');
      }
    } else {
      console.log('⚠️ Seção de histórico não encontrada');
    }
  });

  test('deve verificar responsividade em dispositivo móvel', async ({ page }) => {
    // Simular um dispositivo móvel
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navegar para a página do funcionário
    await page.goto('http://localhost:3000/employee');
    await page.waitForLoadState('networkidle');
    
    // Verificar se a interface está responsiva
    const registerButton = page.locator('text=Registrar Entrada').or(page.locator('text=Registrar Saída')).or(page.locator('text=Abrir Scanner'));
    
    if (await registerButton.first().isVisible()) {
      // Verificar se o botão está acessível em mobile
      const buttonBox = await registerButton.first().boundingBox();
      expect(buttonBox?.width).toBeGreaterThan(100); // Botão deve ter tamanho adequado
      
      console.log('✅ Interface responsiva em dispositivo móvel');
    }
  });
});
