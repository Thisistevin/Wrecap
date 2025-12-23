# 🚀 Guia de Deploy na Vercel - WRecap

## 📋 Pré-requisitos

1. Conta na Vercel: [https://vercel.com](https://vercel.com)
2. Repositório Git (GitHub, GitLab ou Bitbucket)
3. Todas as credenciais de produção prontas

## 🔧 Passo 1: Preparar o Repositório

1. **Certifique-se de que tudo está commitado:**
   ```bash
   git add .
   git commit -m "Preparar para deploy"
   git push
   ```

2. **Verifique se `.env.local` está no `.gitignore`** (já está configurado)

## 🌐 Passo 2: Conectar Projeto na Vercel

1. Acesse [https://vercel.com/new](https://vercel.com/new)
2. Faça login com GitHub/GitLab/Bitbucket
3. **Importe seu repositório:**
   - Selecione o repositório `wrecap`
   - Clique em "Import"

4. **Configure o projeto:**
   - **Framework Preset:** Next.js (detectado automaticamente)
   - **Root Directory:** `./` (raiz)
   - **Build Command:** `npm run build` (padrão)
   - **Output Directory:** `.next` (padrão)
   - **Install Command:** `npm install` (padrão)

## 🔐 Passo 3: Configurar Variáveis de Ambiente

Na Vercel, vá em **Settings → Environment Variables** e adicione:

### Firebase (Client-side)
```
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

### Firebase Admin (Server-side)
```
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

**⚠️ IMPORTANTE:** Cole o JSON completo do service account como uma única string. Use `\n` para quebras de linha se necessário.

### Mercado Pago (Produção)
```
MERCADOPAGO_ACCESS_TOKEN=APP_USR-9dee7f01-7f27-4dd6-a511-6569893de8d9
MERCADOPAGO_WEBHOOK_SECRET=2f871fa604d9ea0fb8af41473ff568f766ac26bb2fc26fbd142879d51733dddb
MERCADOPAGO_SANDBOX=false
```

### Gemini
```
GEMINI_API_KEY=sua_gemini_api_key
```

### Next.js
```
NEXT_PUBLIC_APP_URL=https://wrecap.com.br
```

**⚠️ IMPORTANTE:** 
- Marque todas as variáveis para **Production**, **Preview** e **Development**
- Clique em "Save" após adicionar cada variável

## 🌍 Passo 4: Configurar Domínio

1. Na Vercel, vá em **Settings → Domains**
2. Adicione seu domínio: `wrecap.com.br`
3. Siga as instruções para configurar DNS:
   - Adicione os registros CNAME ou A conforme indicado pela Vercel
   - Aguarde a propagação DNS (pode levar alguns minutos)

## 🚀 Passo 5: Fazer Deploy

1. Na página do projeto, clique em **"Deploy"**
2. Aguarde o build completar (pode levar 2-5 minutos)
3. Verifique os logs do build para garantir que não há erros

## 🔔 Passo 6: Configurar Webhook do Mercado Pago

Após o deploy, configure o webhook:

1. Acesse o Dashboard do Mercado Pago: [https://www.mercadopago.com.br/developers/panel](https://www.mercadopago.com.br/developers/panel)
2. Vá em **"Notificações" → "Webhooks"**
3. Certifique-se de estar no **"Modo de produção"** (não teste)
4. Configure:
   - **URL:** `https://wrecap.com.br/api/mercadopago-webhook`
   - **Eventos:** Marque "Pagamentos" (payments)
   - **Secret Signature:** `2f871fa604d9ea0fb8af41473ff568f766ac26bb2fc26fbd142879d51733dddb`
5. Clique em **"Salvar configurações"**

## ✅ Passo 7: Verificações Pós-Deploy

### 1. Testar Build Localmente (Opcional)
```bash
npm run build
npm run start
```

### 2. Verificar no Navegador
- [ ] Acesse `https://wrecap.com.br`
- [ ] Teste login com Google
- [ ] Verifique se as imagens carregam

### 3. Testar Fluxo Completo
- [ ] Criar retrospectiva (trial gratuito)
- [ ] Comprar créditos
- [ ] Verificar se webhook recebe notificações

### 4. Verificar Logs
- Na Vercel, vá em **Deployments → [último deploy] → Functions**
- Verifique se não há erros nos logs

## 🐛 Troubleshooting

### Build Falha
- Verifique se todas as variáveis de ambiente estão configuradas
- Verifique os logs do build na Vercel
- Certifique-se de que `FIREBASE_SERVICE_ACCOUNT_KEY` está como JSON válido

### Erro de Firebase Admin
- Verifique se `FIREBASE_SERVICE_ACCOUNT_KEY` está correto
- Certifique-se de que o JSON está em uma única linha ou com `\n` para quebras

### Webhook não funciona
- Verifique se a URL está correta: `https://wrecap.com.br/api/mercadopago-webhook`
- Verifique se está no modo de produção no Mercado Pago
- Verifique os logs da função na Vercel

### Imagens não carregam
- Verifique se `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` está correto
- Verifique as regras do Firebase Storage

## 📝 Notas Importantes

1. **Variáveis de Ambiente:** A Vercel permite diferentes valores para Production, Preview e Development. Configure todas para Production.

2. **FIREBASE_SERVICE_ACCOUNT_KEY:** Se tiver problemas, você pode usar `GOOGLE_APPLICATION_CREDENTIALS` com um arquivo, mas é mais complexo na Vercel. Prefira `FIREBASE_SERVICE_ACCOUNT_KEY`.

3. **Domínio:** Se ainda não configurou o domínio, a Vercel fornecerá uma URL temporária (ex: `wrecap.vercel.app`). Você pode usar essa URL para testar antes de configurar o domínio personalizado.

4. **Deploy Automático:** Após conectar o repositório, cada push para a branch `main` (ou `master`) fará deploy automático.

## 🎉 Pronto!

Seu app está no ar! Acesse `https://wrecap.com.br` e teste tudo.

