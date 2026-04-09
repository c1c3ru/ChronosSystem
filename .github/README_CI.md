## 🏗️ Estrutura do Pipeline (Self-Hosted)

O arquivo principal é `.github/workflows/chronos-pipeline.yml`, que utiliza o **Self-Hosted Runner** instalado no seu servidor.

### 1. 🛡️ Quality Gate (Sempre executa no Servidor)
- Executa Lint, Format Check, Type Check e Testes diretamente no hardware do servidor.

### 2. 🌍 Local Deploy (Apenas em Push na `main`)
- O runner entra na pasta `/home/nac/ChronosSystem`.
- Sincroniza o código com o GitHub (`git pull`).
- Executa a verificação de migração.
- Reinicia o serviço usando o seu script `./start-system.sh`.

## 🔑 Configuração de Secrets

Com o Self-Hosted Runner, você não precisa mais de segredos de SSH (`SERVER_HOST`, `KEY`, etc), mas ainda precisa destes para os testes:

### Aplicação (Obrigatórios no GitHub Secrets)
- `DATABASE_URL`: URL do banco de dados (Necessária para migrations).
- `NEXTAUTH_SECRET`: Chave secreta para os testes de sessão.

### Opcionais
- `CODECOV_TOKEN`: Para relatórios de cobertura.

## ⚡ Vantagens do Self-Hosted no IFCE
- **Acesso Interno**: O runner consegue acessar o banco de dados e outros serviços que estão na rede interna `10.50.x.x`.
- **Velocidade**: Não há necessidade de transferir arquivos via rede, o deploy é praticamente instantâneo.

## ⚡ Otimizações Realizadas

- **Concorrência**: Cancelamento automático de execuções obsoletas no mesmo branch.
- **Caching**: Uso de cache para `node_modules` e build do Next.js.
- **Paralelismo**: Testes E2E e Security Audit rodam em paralelo para reduzir o tempo total.
- **Segurança**: Bloqueio de deploy caso existam vulnerabilidades críticas ou migrações pendentes.
