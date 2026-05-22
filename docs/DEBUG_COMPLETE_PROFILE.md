# 🔍 Debug - Complete Profile não está salvando

## Problema Relatado

O botão "Salvar e Continuar" em `/auth/complete-profile` não está salvando novos usuários no banco de dados.

## Diagnóstico

### 1. Verificar Logs do Servidor

Abra o terminal onde o servidor está rodando e procure por:

```
🚀 handleSubmit chamado!
📝 Dados do formulário: {...}
✅ Validação passou
Enviando dados: {...}
Response status: 200
✅ Perfil salvo com sucesso
```

Se ver `Response status: 500`, há um erro na API.

### 2. Verificar Console do Navegador

Pressione `F12` e vá para a aba "Console". Procure por:

```
❌ Erro na API: {...}
```

Se houver erro, ele mostrará a mensagem detalhada.

### 3. Possíveis Problemas

#### A. Usuário não foi criado no banco

- **Sintoma:** Erro 404 "Usuário não encontrado"
- **Causa:** O login com Google não criou o usuário
- **Solução:** Verifique se o usuário foi criado em `lib/auth.ts` linha 218

#### B. Campos obrigatórios faltando

- **Sintoma:** Erro 400 "Todos os campos básicos são obrigatórios"
- **Causa:** Algum campo não foi preenchido
- **Solução:** Preencha: telefone, endereço, data nascimento, contato emergência, telefone emergência

#### C. Erro de validação de SIAPE

- **Sintoma:** Erro 400 "Matrícula SIAPE deve ter exatamente 7 dígitos"
- **Causa:** SIAPE foi preenchido com menos de 7 dígitos
- **Solução:** Preencha com 7 dígitos ou deixe em branco

#### D. Erro de banco de dados

- **Sintoma:** Erro 500 com mensagem detalhada
- **Causa:** Problema ao atualizar usuário no Prisma
- **Solução:** Verifique se o banco está rodando e acessível

### 4. Passos para Debug

#### Passo 1: Verificar Sessão

```javascript
// No console do navegador
const session = await fetch('/api/auth/session').then((r) => r.json())
console.log(session)
```

Deve mostrar um usuário autenticado com `id`, `email`, `name`.

#### Passo 2: Testar API Manualmente

```javascript
// No console do navegador
const response = await fetch('/api/auth/complete-profile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone: '(11) 99999-9999',
    address: 'Rua Teste, 123',
    birthDate: '1990-01-01',
    emergencyContact: 'João Silva',
    emergencyPhone: '(11) 88888-8888',
    department: 'Alunos',
  }),
})
const result = await response.json()
console.log(result)
```

Deve retornar `{ success: true, message: '...', redirectUrl: '/employee' }`.

#### Passo 3: Verificar Banco de Dados

```bash
# Conectar ao banco
npx prisma studio

# Procurar pelo usuário
# Verificar se os campos foram atualizados
```

### 5. Melhorias Implementadas

Foram adicionados logs detalhados na API:

- ✅ Verificação se usuário existe antes de update
- ✅ Mensagens de erro mais detalhadas (não genérico 500)
- ✅ Stack trace do erro para debug
- ✅ Logs de cada etapa do processo

### 6. Próximas Ações

Se o problema persistir:

1. **Verifique o arquivo de log** do servidor
2. **Teste a API manualmente** usando o passo 2 acima
3. **Verifique o banco de dados** usando Prisma Studio
4. **Abra uma issue** com os logs do servidor e do console

## Arquivos Relevantes

- `/app/auth/complete-profile/page.tsx` - Frontend
- `/app/api/auth/complete-profile/route.ts` - Backend (API)
- `/lib/auth.ts` - Criação de usuário no login
- `/prisma/schema.prisma` - Schema do banco

## Commits Relacionados

- `618a3ec` - Fix: melhorar tratamento de erros em complete-profile
