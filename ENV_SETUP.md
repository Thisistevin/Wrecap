# 🔧 Configuração do .env.local

## ⚠️ Erro: "AVOCADOPAY_API_KEY is not configured"

Este erro aparece quando a variável de ambiente `AVOCADOPAY_API_KEY` não está configurada.

## ✅ Solução

### 1. Crie ou edite o arquivo `.env.local` na raiz do projeto

O arquivo deve estar em: `/Users/estevao/Programacao/wrecap/.env.local`

### 2. Adicione as seguintes variáveis:

```env
# AvocadoPay Configuration
AVOCADOPAY_API_KEY=abc_dev_pDZQjfS5TTFHSY12jTDCwSDF
AVOCADOPAY_WEBHOOK_SECRET=webh_dev_6USdmnhjmKuXTBq1AuagB4Dm
NEXT_PUBLIC_AVOCADOPAY_API_URL=https://api.abacatepay.com/v1/checkouts
NEXT_PUBLIC_AVOCADOPAY_CHECKOUT_URL=https://checkout.abacatepay.com

# Firebase Configuration (se ainda não tiver)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Firebase Admin (Server-side)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
# OU
# GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

### 3. Reinicie o servidor Next.js

⚠️ **IMPORTANTE:** Após alterar o `.env.local`, você DEVE reiniciar o servidor:

```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
npm run dev
```

## 🔍 Verificando se está configurado

Após reiniciar, você pode verificar nos logs do servidor se a API key está sendo carregada. Quando criar uma retrospectiva, você deve ver:

```
🔄 Creating AvocadoPay checkout...
💰 Amount: 29.9 BRL
✅ AvocadoPay checkout created successfully
```

Se ainda aparecer o erro, verifique:
1. ✅ O arquivo `.env.local` está na raiz do projeto (mesmo nível que `package.json`)
2. ✅ A variável `AVOCADOPAY_API_KEY` está escrita corretamente (sem espaços extras)
3. ✅ O servidor foi reiniciado após adicionar a variável
4. ✅ Não há erros de sintaxe no `.env.local` (sem aspas desnecessárias, etc.)

## 📝 Nota sobre .env.local

- O arquivo `.env.local` está no `.gitignore` e não será commitado
- Use este arquivo para variáveis de ambiente locais
- Para produção, configure as variáveis no seu provedor de hospedagem (Vercel, etc.)

