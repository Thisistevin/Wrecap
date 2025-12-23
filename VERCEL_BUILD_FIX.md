# 🔧 Correção de Build na Vercel

## Problema Comum: Build Falha

O build pode falhar por alguns motivos:

### 1. Variáveis de Ambiente Não Configuradas

**Sintoma:** Build falha com erro de variáveis não encontradas

**Solução:**
1. Vá em **Settings → Environment Variables** na Vercel
2. Adicione TODAS as variáveis necessárias
3. Marque para **Production**, **Preview** e **Development**
4. Clique em **Save**

### 2. FIREBASE_SERVICE_ACCOUNT_KEY com Formato Incorreto

**Sintoma:** Erro ao fazer parse do JSON

**Solução:**
- O JSON deve estar em UMA LINHA
- Use aspas simples para envolver: `FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'`
- OU escape as aspas: `FIREBASE_SERVICE_ACCOUNT_KEY="{\"type\":\"service_account\",...}"`

**Exemplo correto:**
```
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"wrecap-cb21d","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}'
```

### 3. Build Falha por Erro de TypeScript

**Sintoma:** Erros de TypeScript no build

**Solução:**
1. Teste localmente: `npm run build`
2. Corrija os erros antes de fazer deploy
3. Verifique se todos os tipos estão corretos

### 4. Dependências Faltando

**Sintoma:** Erro de módulo não encontrado

**Solução:**
1. Verifique se `package.json` está atualizado
2. Certifique-se de que todas as dependências estão listadas
3. Tente fazer commit e push novamente

## ✅ Checklist de Verificação

Antes de fazer deploy, verifique:

- [ ] Todas as variáveis de ambiente estão configuradas na Vercel
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` está no formato correto (JSON em uma linha)
- [ ] Build local funciona: `npm run build`
- [ ] Não há erros de TypeScript: `npm run lint`
- [ ] Todas as dependências estão no `package.json`

## 🔍 Como Ver os Logs de Erro

1. Na Vercel, vá em **Deployments**
2. Clique no deploy que falhou
3. Expanda **"Build Logs"**
4. Procure por erros em vermelho
5. Copie a mensagem de erro completa

## 📝 Variáveis Obrigatórias

Certifique-se de ter TODAS estas variáveis:

### Firebase (Client)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Firebase Admin (Server)
- `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON completo)

### Mercado Pago
- `MERCADOPAGO_ACCESS_TOKEN`
- `MERCADOPAGO_WEBHOOK_SECRET`
- `MERCADOPAGO_SANDBOX=false`

### Gemini
- `GEMINI_API_KEY`

### Next.js
- `NEXT_PUBLIC_APP_URL=https://wrecap.com.br`

## 🚀 Após Corrigir

1. Faça commit das correções
2. Push para o repositório
3. A Vercel fará deploy automático
4. Ou clique em **"Redeploy"** na Vercel

