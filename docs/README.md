# 🚀 Sistema de Registro de Ponto - Estagiários

Sistema completo de registro de ponto eletrônico com QR code rotativo, autenticação segura e auditoria imutável.

## ✨ Principais Características

- 🚀 **Arquitetura Simplificada**: Monolito Next.js - tudo em um só projeto
- 🗃️ **SQLite**: Banco de dados zero-configuração
- 🔐 **NextAuth.js**: Autenticação completa (credenciais + Google OAuth)
- 📱 **Responsivo**: Interface única que se adapta a todos os dispositivos
- ⚡ **Performance**: Server-side rendering + otimizações automáticas
- 🎨 **Design Moderno**: Tailwind CSS + componentes elegantes
- 🔍 **QR Code Seguro**: Geração e validação com timestamps

## 🏗️ Nova Arquitetura (Simplificada)

```
┌─────────────────────────────────────┐
│         Chronos System              │
│        (Next.js 14 Monolito)       │
├─────────────────────────────────────┤
│  📱 /admin    - Dashboard Admin     │
│  👤 /employee - Portal Estagiário   │
│  🖥️  /kiosk    - Tela QR Code       │
│  🔌 /api      - Backend Routes      │
├─────────────────────────────────────┤
│         SQLite + Prisma             │
└─────────────────────────────────────┘
```

### Stack Tecnológica

- **Framework**: Next.js 14 (App Router)
- **Banco**: SQLite + Prisma ORM
- **Auth**: NextAuth.js
- **UI**: Tailwind CSS + Lucide Icons
- **QR**: qrcode + html5-qrcode
- **Deploy**: Vercel/Netlify (1-click)

## 🚀 Início Rápido (2 minutos)

### Pré-requisitos

- Node.js 18+
- Git

### 1. Clone e instale

```bash
git clone <repository-url>
cd ChronosSystem
npm install
```

### 2. Configure o banco

```bash
# Cria o banco SQLite e aplica o schema
npm run db:push

# Popula com dados de exemplo
npm run db:seed
```

### 3. Inicie o desenvolvimento

```bash
npm run dev
```

### 4. Acesse o sistema

- **Sistema Completo**: http://localhost:3000
- **Admin**: http://localhost:3000/admin
- **Estagiário**: http://localhost:3000/employee
- **Kiosk**: http://localhost:3000/kiosk

### 5. Faça login

- **Admin**: admin@chronos.com / admin123
- **Supervisor**: supervisor@chronos.com / supervisor123
- **Estagiário**: maria@chronos.com / employee123

## 📱 Funcionalidades

### 🏠 Página Inicial

- ✅ Landing page com links para todas as seções
- ✅ Design responsivo e moderno
- ✅ Navegação intuitiva

### 👨‍💼 Portal Administrativo (/admin)

- ✅ Dashboard com estatísticas em tempo real
- ✅ Gerenciamento de usuários (CRUD)
- ✅ Gerenciamento de máquinas
- ✅ Visualização de registros de ponto
- ✅ Relatórios e exportação de dados
- ✅ Logs de auditoria

### 👤 Portal do Estagiário (/employee)

- ✅ Login com email/senha ou Google
- ✅ Scanner de QR code integrado
- ✅ Registro de entrada/saída
- ✅ Histórico pessoal de registros
- ✅ Interface mobile-first

### 🖥️ Kiosk (/kiosk)

- ✅ QR code rotativo (atualização automática)
- ✅ Relógio em tempo real
- ✅ Interface fullscreen
- ✅ Design minimalista e claro

## 🔐 Segurança

### Autenticação

- **NextAuth.js**: Sistema robusto de autenticação
- **Múltiplos Providers**: Credenciais + Google OAuth
- **JWT Seguro**: Tokens com expiração automática
- **Roles**: ADMIN, SUPERVISOR, EMPLOYEE
- **2FA (TOTP)**: Autenticação de dois fatores ✨ **NOVO**

### QR Code Seguro ✨ **NOVO**

- **HMAC-SHA256**: Assinatura criptográfica dos QR codes
- **Anti-Replay**: Proteção contra reutilização de códigos
- **Expiração**: Códigos válidos por apenas 60 segundos
- **Timing-Safe**: Verificação resistente a ataques de timing
- **Hash Chain**: Integridade imutável dos registros

### PWA (Progressive Web App) ✨ **NOVO**

- **Service Worker**: Funcionamento offline completo
- **Instalável**: Banner inteligente de instalação
- **Cache Offline**: Recursos críticos em cache
- **Sincronização**: Background sync quando volta online

## 🛠️ Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Inicia servidor de produção

## 🔄 CI/CD

GitHub Actions configurado para:
- ✅ Lint e formatação
- ✅ Testes unitários e E2E
- ✅ Build e validação
- ✅ Deploy automático (staging/production)

## 📄 Licença

MIT

## 👥 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 🔧 Troubleshooting

### IDE Warnings
Se você ver warnings como "Context access might be invalid" nos arquivos GitHub Actions, consulte: [docs/IDE_WARNINGS.md](docs/IDE_WARNINGS.md)

### Deploy Issues
Para problemas de deploy e configuração de variáveis de ambiente, consulte: [DEPLOYMENT.md](DEPLOYMENT.md)

## 📞 Suporte

Para questões e suporte, abra uma issue no GitHub.
```
