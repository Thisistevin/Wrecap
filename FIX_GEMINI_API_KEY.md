# 🔑 Corrigir Chave da API do Gemini

## ❌ Erro
```
[403 Forbidden] Your API key was reported as leaked. Please use another API key.
```

## 🔍 Causa
A chave da API do Gemini (`GEMINI_API_KEY`) foi reportada como vazada (provavelmente commitada no Git ou exposta publicamente) e foi desativada pelo Google.

## ✅ Solução

### Passo 1: Gerar Nova Chave da API

1. Acesse: [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Faça login com sua conta Google
3. Clique em **"Create API Key"** (Criar chave de API)
4. Selecione o projeto (ou crie um novo)
5. Copie a nova chave gerada

### Passo 2: Revogar a Chave Antiga (Opcional mas Recomendado)

1. Acesse: [Google Cloud Console - API Credentials](https://console.cloud.google.com/apis/credentials)
2. Encontre a chave antiga
3. Clique nos três pontos → **"Delete"** ou **"Revoke"**

### Passo 3: Atualizar na Vercel

1. Na Vercel, vá em **Settings → Environment Variables**
2. Procure por `GEMINI_API_KEY`
3. Clique em **Edit** (ou adicione se não existir)
4. Cole a **nova chave da API**
5. Marque para **Production**, **Preview** e **Development**
6. Clique em **Save**

### Passo 4: Atualizar Localmente (Opcional)

Se você ainda desenvolve localmente:

1. Abra `.env.local`
2. Atualize `GEMINI_API_KEY` com a nova chave
3. Reinicie o servidor: `npm run dev`

### Passo 5: Fazer Redeploy

1. Na Vercel, vá em **Deployments**
2. Clique nos três pontos (...) no último deploy
3. Selecione **"Redeploy"**
4. Aguarde o build completar

## 🔒 Prevenção Futura

Para evitar que isso aconteça novamente:

1. **NUNCA** commite a chave da API no Git
2. Verifique se `.env.local` está no `.gitignore` ✅ (já está)
3. Use variáveis de ambiente na Vercel (não hardcode no código)
4. Se a chave for exposta, revogue imediatamente e gere uma nova

## ✅ Verificar se Funcionou

Após configurar a nova chave e fazer redeploy:
1. Acesse `wrecap.com.br`
2. Tente criar uma retrospectiva novamente
3. O erro deve desaparecer

## 📝 Nota Importante

- A chave antiga **não funcionará mais** - você precisa gerar uma nova
- A nova chave deve ser mantida **secreta** - nunca commite no Git
- Se precisar compartilhar o código, use variáveis de ambiente

