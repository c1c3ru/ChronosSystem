# Chronos System

Sistema de Registro de Ponto Eletrônico - Monolito Next.js.

## Tecnologias Principais
- Next.js (14+)
- React (18+)
- Prisma
- Tailwind CSS
- NextAuth.js
- Jest / Playwright para testes

## Instalação

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```

## Configuração

1. Crie um arquivo `.env` na raiz do projeto (use o `.env.example` como base).
2. Configure a conexão com o banco de dados e as variáveis de ambiente necessárias.
3. Gere o Prisma Client:
   ```bash
   npm run postinstall
   ```

## Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento.
- `npm run build`: Compila a aplicação para produção.
- `npm start`: Inicia o servidor de produção.
- `npm run test`: Executa os testes unitários.
- `npm run test:e2e`: Executa os testes End-to-End.
- `npm run lint`: Verifica erros de linting.

## Licença

Este projeto está licenciado sob a licença GNU GPLv3 - veja o arquivo [LICENSE](LICENSE) para mais detalhes.
