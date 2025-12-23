# 🐛 Troubleshooting - Deploy Vercel Falhou

## 🔍 Passo 1: Verificar os Logs de Erro

1. Na Vercel, vá em **Deployments**
2. Clique no deploy que falhou (status vermelho)
3. Expanda **"Build Logs"**
4. Procure pela mensagem de erro (geralmente no final)

## 🔧 Problemas Comuns e Soluções

### ❌ Erro: "FIREBASE_SERVICE_ACCOUNT_KEY is not set"

**Causa:** Variável de ambiente não configurada

**Solução:**
1. Vá em **Settings → Environment Variables**
2. Adicione: `FIREBASE_SERVICE_ACCOUNT_KEY`
3. Cole o JSON completo do service account (em uma linha)
4. Marque para **Production**, **Preview** e **Development**
5. Clique em **Save**
6. Faça **Redeploy**

### ❌ Erro: "Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY"

**Causa:** JSON mal formatado

**Solução:**
- O JSON deve estar em **UMA LINHA**
- Use aspas simples para envolver: `'{"type":"service_account",...}'`
- Certifique-se de que todas as aspas dentro do JSON estão escapadas

**Formato correto:**
```
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"wrecap-cb21d",...}'
```

### ❌ Erro: "NEXT_PUBLIC_FIREBASE_* is not set"

**Causa:** Variáveis do Firebase não configuradas

**Solução:**
Adicione todas estas variáveis na Vercel:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### ❌ Erro: "GEMINI_API_KEY is not set"

**Causa:** Chave do Gemini não configurada

**Solução:**
1. Adicione `GEMINI_API_KEY` nas variáveis de ambiente
2. Cole sua chave da API do Gemini
3. Faça Redeploy

### ❌ Erro: "Module not found" ou "Cannot find module"

**Causa:** Dependência faltando ou problema no package.json

**Solução:**
1. Verifique se `package.json` está commitado
2. Tente fazer commit e push novamente
3. Ou adicione a dependência faltante

### ❌ Erro de TypeScript durante build

**Causa:** Erros de tipo no código

**Solução:**
1. Teste localmente: `npm run build`
2. Corrija os erros de TypeScript
3. Faça commit e push

## 📋 Checklist Rápido

Antes de pedir ajuda, verifique:

- [ ] Todas as variáveis de ambiente estão na Vercel?
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` está no formato correto (JSON em uma linha)?
- [ ] Build local funciona? (`npm run build`)
- [ ] Não há erros de lint? (`npm run lint`)
- [ ] Todas as mudanças foram commitadas e enviadas?

## 🚀 Como Fazer Redeploy

1. Na Vercel, vá em **Deployments**
2. Clique nos três pontos (...) no deploy que falhou
3. Selecione **"Redeploy"**
4. Aguarde o build

## 💡 Dica: Testar Build Localmente

Antes de fazer deploy, teste localmente:

```bash
# 1. Configure todas as variáveis no .env.local
# 2. Teste o build
npm run build

# 3. Se funcionar localmente, deve funcionar na Vercel
```

## 📞 Se Nada Funcionar

1. Copie a mensagem de erro COMPLETA dos logs
2. Verifique se todas as variáveis estão configuradas
3. Tente fazer um novo deploy do zero:
   - Vá em **Settings → General**
   - Role até o final
   - Clique em **"Delete Project"** (cuidado!)
   - Ou simplesmente faça um novo import

