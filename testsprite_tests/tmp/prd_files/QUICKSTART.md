# ⚡ Quick Start - Sistema de Ponto

## 🚀 Início Rápido (5 minutos)

### 1. Clone e Configure

```bash
# Clone o repositório
git clone <repo-url>
cd personal-website

# Copie os arquivos de ambiente
cp backend/.env.example backend/.env
cp frontend-admin/.env.example frontend-admin/.env
cp pwa-estagiario/.env.example pwa-estagiario/.env
cp kiosk/.env.example kiosk/.env
```

### 2. Inicie com Docker

```bash
# Inicie todos os serviços
docker-compose up -d

# Aguarde os containers iniciarem (30-60 segundos)
docker-compose ps
```

### 3. Configure o Banco de Dados

```bash
# Entre no container do backend
docker exec -it ponto-backend sh

# Execute as migrações
npm run prisma:migrate

# Popule o banco com dados de teste
npm run prisma:seed

# Saia do container
exit
```

### 4. Acesse as Aplicações

| Aplicação           | URL                       | Credenciais                       |
| ------------------- | ------------------------- | --------------------------------- |
| **Admin Dashboard** | http://localhost:3000     | admin@ponto.com / admin123        |
| **PWA Estagiário**  | http://localhost:3001     | estagiario@ponto.com / estagio123 |
| **Kiosk**           | http://localhost:3002     | -                                 |
| **API Backend**     | http://localhost:4000/api | -                                 |

## 📱 Testando o Fluxo Completo

### Passo 1: Abra o Kiosk

1. Acesse http://localhost:3002
2. Você verá um QR code sendo exibido
3. O QR code atualiza automaticamente a cada 60 segundos

### Passo 2: Faça Login no PWA

1. Acesse http://localhost:3001
2. Login: `estagiario@ponto.com`
3. Senha: `estagio123`

### Passo 3: Registre Ponto

1. No PWA, clique em "Escanear QR Code"
2. Permita acesso à câmera
3. Aponte para o QR code do Kiosk (ou use uma ferramenta de QR code virtual)
4. Confirme o registro de ENTRADA
5. Veja a confirmação

### Passo 4: Verifique no Admin

1. Acesse http://localhost:3000
2. Login: `admin@ponto.com`
3. Senha: `admin123`
4. Vá em "Registros" para ver o ponto registrado

## 🎯 Funcionalidades Principais

### Para Estagiários

- ✅ Login com email/senha ou Google
- ✅ Escanear QR code para registrar ponto
- ✅ Ver histórico de registros
- ✅ Solicitar correções
- ✅ PWA funciona offline

### Para Administradores

- ✅ Dashboard com estatísticas
- ✅ Gerenciar usuários e máquinas
- ✅ Ver todos os registros
- ✅ Aprovar correções
- ✅ Relatórios e exportação
- ✅ Logs de auditoria
- ✅ Verificar integridade da cadeia de hashes

### Para Máquinas (Kiosk)

- ✅ QR code rotativo (60s)
- ✅ Relógio em tempo real
- ✅ Status de conectividade
- ✅ Interface fullscreen

## 🔐 Segurança

O sistema implementa:

- ✅ QR code assinado com HMAC-SHA256
- ✅ Nonce único (anti-replay)
- ✅ Hash chain imutável
- ✅ JWT + Refresh tokens
- ✅ 2FA opcional
- ✅ Google OAuth
- ✅ Geolocalização
- ✅ Rate limiting
- ✅ Logs de auditoria

## 🛠️ Comandos Úteis

### Docker

```bash
# Ver logs
docker-compose logs -f backend

# Parar serviços
docker-compose down

# Reiniciar um serviço
docker-compose restart backend

# Reconstruir containers
docker-compose build
docker-compose up -d
```

### Backend

```bash
# Entrar no container
docker exec -it ponto-backend sh

# Ver logs do Prisma
npm run prisma:studio

# Criar nova migração
npm run prisma:migrate

# Resetar banco (cuidado!)
npx prisma migrate reset
```

### Frontend

```bash
# Instalar dependências
cd frontend-admin
npm install

# Rodar localmente (sem Docker)
npm run dev

# Build para produção
npm run build
```

## 📊 Estrutura do Projeto

```
personal-website/
├── backend/              # API NestJS
│   ├── src/
│   │   ├── auth/        # Autenticação
│   │   ├── users/       # Usuários
│   │   ├── machines/    # Máquinas
│   │   ├── qr/          # QR codes
│   │   ├── attendance/  # Registros
│   │   └── audit/       # Auditoria
│   └── prisma/          # Schema DB
│
├── frontend-admin/       # Dashboard Admin
│   └── src/
│       ├── pages/       # Páginas
│       └── components/  # Componentes
│
├── pwa-estagiario/      # PWA Mobile
│   └── src/
│       └── pages/       # Login, Scan, History
│
├── kiosk/               # Máquina de Ponto
│   └── src/
│       └── App.tsx      # QR + Relógio
│
└── docker-compose.yml   # Orquestração
```

## 🐛 Problemas Comuns

### Porta já em uso

```bash
# Verificar portas em uso
lsof -i :3000
lsof -i :4000

# Matar processo
kill -9 <PID>
```

### Erro de conexão com banco

```bash
# Verificar se o PostgreSQL está rodando
docker ps | grep postgres

# Ver logs
docker logs ponto-postgres
```

### QR code não funciona

1. Verifique se o backend está rodando
2. Verifique se a máquina existe no banco
3. Veja os logs: `docker logs ponto-backend`
4. Verifique o HMAC_SECRET no .env

### PWA não escaneia QR

1. Permita acesso à câmera
2. Use HTTPS ou localhost
3. Teste com QR code impresso ou em outra tela

## 📚 Documentação Completa

- [README.md](./README.md) - Visão geral
- [SETUP.md](./SETUP.md) - Instalação detalhada
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitetura do sistema
- [SECURITY.md](./SECURITY.md) - Segurança
- [API.md](./API.md) - Documentação da API

## 🎓 Próximos Passos

1. **Personalize o sistema**
   - Altere cores no Tailwind
   - Adicione seu logo
   - Configure Google OAuth

2. **Adicione mais usuários**
   - Use o Admin Dashboard
   - Ou via API

3. **Configure máquinas**
   - Adicione mais máquinas de ponto
   - Configure localizações

4. **Explore funcionalidades**
   - Teste 2FA
   - Solicite correções
   - Veja logs de auditoria
   - Verifique hash chain

5. **Deploy em produção**
   - Configure HTTPS
   - Use banco de dados gerenciado
   - Configure CI/CD
   - Monitore com Sentry

## 💡 Dicas

- Use o Prisma Studio para visualizar dados: `npm run prisma:studio`
- Teste a API com Postman ou Insomnia
- Use React DevTools para debug do frontend
- Configure VS Code com extensões TypeScript e Prisma

## 🆘 Suporte

- GitHub Issues: <repo-url>/issues
- Email: suporte@exemplo.com
- Documentação: Veja os arquivos .md na raiz

## 🎉 Pronto!

Seu sistema de ponto está funcionando!

Explore as funcionalidades e personalize conforme necessário.
