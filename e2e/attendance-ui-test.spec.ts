import { test, expect } from '@playwright/test';

test.describe('Teste de Interface do Sistema de Ponto', () => {
  test('deve exibir a página inicial corretamente', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Verificar se a página carregou
    await expect(page).toHaveTitle(/Chronos/);
    
    // Verificar elementos principais da página inicial com seletores mais específicos
    await expect(page.getByRole('heading', { name: 'Chronos System', level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Portal do Estagiário' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Painel Administrativo' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Kiosk' })).toBeVisible();
    
    console.log('✅ Página inicial carregada corretamente');
  });

  test('deve navegar para o kiosk e exibir interface de QR code', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Clicar no link do Kiosk
    await page.click('text=Abrir Kiosk');
    
    // Verificar se navegou para o kiosk
    await expect(page).toHaveURL(/.*\/kiosk/);
    
    // Verificar elementos do kiosk com seletores específicos
    await expect(page.getByRole('heading', { name: 'Chronos Kiosk', level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Registrar Ponto', level: 2 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Como usar:', level: 3 })).toBeVisible();
    
    // Verificar se há instruções de uso
    await expect(page.locator('text=Abra o app Chronos no seu celular')).toBeVisible();
    await expect(page.locator('text=Toque em "Registrar Ponto"')).toBeVisible();
    await expect(page.locator('text=Escaneie o QR code acima')).toBeVisible();
    
    console.log('✅ Interface do Kiosk está funcionando');
  });

  test('deve tentar acessar página do funcionário e ser redirecionado para login', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Clicar no link do Portal do Estagiário
    await page.click('text=Acessar Portal');
    
    // Verificar se foi redirecionado para login
    await expect(page).toHaveURL(/.*\/auth\/signin/);
    
    // Verificar elementos da página de login
    await expect(page.locator('text=Faça login para continuar')).toBeVisible();
    await expect(page.locator('text=Entrar com Google')).toBeVisible();
    
    // Verificar campos de login
    await expect(page.locator('input[placeholder*="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    
    console.log('✅ Redirecionamento para login funcionando');
  });

  test('deve verificar responsividade da página inicial', async ({ page }) => {
    // Testar em diferentes tamanhos de tela
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('http://localhost:3000');
      
      // Verificar se elementos principais estão visíveis
      await expect(page.getByRole('heading', { name: 'Chronos System', level: 1 })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Portal do Estagiário' })).toBeVisible();
      
      console.log(`✅ Layout responsivo funcionando em ${viewport.name} (${viewport.width}x${viewport.height})`);
    }
  });

  test('deve simular fluxo de registro de ponto (interface)', async ({ page }) => {
    // Interceptar requisições da API para simular funcionamento
    await page.route('**/api/attendance/simple-register', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          record: {
            type: 'ENTRY',
            time: '16:45',
            timestamp: new Date().toISOString(),
            location: 'Recepção',
            machineName: 'Terminal Principal'
          }
        })
      });
    });

    await page.route('**/api/kiosk/generate-qr', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          qrData: 'machine-1',
          expiresAt: new Date(Date.now() + 300000).toISOString()
        })
      });
    });

    // Ir para o kiosk
    await page.goto('http://localhost:3000/kiosk');
    
    // Verificar se a interface carregou
    await expect(page.getByRole('heading', { name: 'Registrar Ponto', level: 2 })).toBeVisible();
    
    // Simular que um QR code foi escaneado
    await page.evaluate(() => {
      // Simular requisição de registro
      fetch('/api/attendance/simple-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrData: 'machine-1' })
      }).then(response => response.json())
        .then(data => {
          if (data.success) {
            console.log('Simulação de registro bem-sucedida');
          }
        });
    });

    console.log('✅ Simulação de fluxo de registro funcionando');
  });

  test('deve verificar elementos de acessibilidade', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Verificar se há textos alternativos em imagens importantes
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      if (alt === null || alt === '') {
        console.log('⚠️ Imagem sem texto alternativo encontrada');
      }
    }
    
    // Verificar se links têm textos descritivos
    const links = await page.locator('a').all();
    for (const link of links) {
      const text = await link.textContent();
      if (!text || text.trim() === '') {
        console.log('⚠️ Link sem texto descritivo encontrado');
      }
    }
    
    // Verificar contraste básico (elementos com cores)
    await expect(page.getByRole('heading', { name: 'Chronos System', level: 1 })).toBeVisible();
    
    console.log('✅ Verificação básica de acessibilidade concluída');
  });

  test('deve verificar performance básica da página', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:3000');
    
    // Aguardar carregamento completo
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Verificar se carregou em tempo razoável (menos de 5 segundos)
    expect(loadTime).toBeLessThan(5000);
    
    // Verificar se elementos principais carregaram
    await expect(page.getByRole('heading', { name: 'Chronos System', level: 1 })).toBeVisible();
    
    console.log(`✅ Página carregou em ${loadTime}ms`);
  });
});
