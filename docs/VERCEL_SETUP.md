# 🚀 Configuração do Vercel para CI/CD

## ❌ Problema Atual
```
Error: No existing credentials found. Please run vercel login or pass "--token"
```

## ✅ Solução: Configurar Secrets do GitHub

### 1. **Gerar Token do Vercel**
1. Acesse: https://vercel.com/account/tokens
2. Clique em "Create Token"
3. Nome: `ChronosSystem CI/CD`
4. Escopo: `Full Account` ou específico do projeto
5. **Copie o token** (só aparece uma vez!)

### 2. **Obter IDs do Projeto**
```bash
# No terminal local:
npx vercel link
npx vercel env pull .env.vercel
```

Ou acesse o projeto no Vercel Dashboard e copie:
- **Project ID**: Settings → General → Project ID
- **Team/Org ID**: Settings → General → Team ID

### 3. **Configurar Secrets no GitHub**
Acesse: `https://github.com/c1c3ru/ChronosSystem/settings/secrets/actions`

Adicione os seguintes secrets:

| Nome | Valor | Descrição |
|------|-------|-----------|
| `VERCEL_TOKEN` | `vercel_xxx...` | Token gerado no passo 1 |
| `VERCEL_ORG_ID` | `team_xxx...` | ID da organização/team |
| `VERCEL_PROJECT_ID` | `prj_xxx...` | ID do projeto |
| `DATABASE_URL` | `postgresql://...` | URL do banco PostgreSQL |

### 4. **Secrets Adicionais (Opcional)**
Para funcionalidade completa:

| Nome | Valor |
|------|-------|
| `NEXTAUTH_SECRET` | `seu-secret-seguro` |
| `QR_SECRET` | `seu-qr-secret` |
| `GOOGLE_CLIENT_ID` | `669988829985-...` |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-...` |

## 🔧 Workflow Atual (Já Configurado)

O arquivo `.github/workflows/deploy.yml` já está correto:

```yaml
- name: Deploy Project Artifacts to Vercel
  run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
  env:
    VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
    VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

## ✅ Após Configurar

1. **Faça um push** para `main`
2. **Workflow executará** automaticamente
3. **Deploy será realizado** com sucesso
4. **Migrations** serão executadas na produção

## 🔍 Verificar Status

- **GitHub Actions**: https://github.com/c1c3ru/ChronosSystem/actions
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Logs de Deploy**: Disponíveis em ambos

## 🚨 Segurança

- ✅ **Tokens são secrets** - não aparecem nos logs
- ✅ **Acesso limitado** ao repositório
- ✅ **Rotação recomendada** a cada 90 dias
- ✅ **Princípio do menor privilégio**

---

**Após configurar os secrets, o deploy funcionará automaticamente!** 🎉
