# 🔧 Corrigir Firebase Admin na Vercel

## ❌ Erro
```
Firebase Admin Storage not initialized. Check your service account configuration.
```

## 🔍 Causa
O Firebase Admin não está sendo inicializado corretamente na Vercel porque:
1. A variável `FIREBASE_SERVICE_ACCOUNT_KEY` não está configurada corretamente
2. O JSON do service account está mal formatado
3. A inicialização está falhando silenciosamente

## ✅ Solução

### Passo 1: Verificar Variável na Vercel

1. Na Vercel, vá em **Settings → Environment Variables**
2. Procure por `FIREBASE_SERVICE_ACCOUNT_KEY`
3. Verifique se está configurada

### Passo 2: Formato Correto do JSON

O `FIREBASE_SERVICE_ACCOUNT_KEY` deve ser o JSON completo em **UMA LINHA**.

**Formato correto:**
```
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"wrecap-cb21d","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}'
```

**⚠️ IMPORTANTE:**
- Use aspas simples `'` para envolver o JSON
- O JSON deve estar em UMA LINHA (sem quebras)
- As quebras de linha dentro do `private_key` devem ser `\n` (não quebras reais)

### Passo 3: Como Obter o JSON

1. Acesse: [https://console.firebase.google.com/project/wrecap-cb21d/settings/serviceaccounts/adminsdk](https://console.firebase.google.com/project/wrecap-cb21d/settings/serviceaccounts/adminsdk)
2. Clique em **"Generate new private key"**
3. Baixe o arquivo JSON
4. Abra o arquivo e copie TODO o conteúdo
5. Cole na Vercel como `FIREBASE_SERVICE_ACCOUNT_KEY`

### Passo 4: Converter para Uma Linha

Se o JSON tiver quebras de linha, você precisa convertê-lo para uma linha:

**Opção A: Usar ferramenta online**
- Use: [https://www.freeformatter.com/json-formatter.html](https://www.freeformatter.com/json-formatter.html)
- Cole o JSON
- Clique em "Minify" ou "Compact"
- Copie o resultado

**Opção B: Manualmente**
- Remova todas as quebras de linha
- Mantenha apenas `\n` dentro do `private_key`
- Envolva com aspas simples: `'...'`

### Passo 5: Adicionar na Vercel

1. Vá em **Settings → Environment Variables**
2. Adicione ou edite `FIREBASE_SERVICE_ACCOUNT_KEY`
3. Cole o JSON em uma linha (com aspas simples)
4. Marque para **Production**, **Preview** e **Development**
5. Clique em **Save**

### Passo 6: Fazer Redeploy

1. Vá em **Deployments**
2. Clique nos três pontos (...) no último deploy
3. Selecione **"Redeploy"**
4. Aguarde o build completar

## 🔍 Verificar se Funcionou

Após o redeploy, teste:
1. Acesse `wrecap.com.br`
2. Tente criar uma retrospectiva
3. Se ainda der erro, verifique os logs na Vercel:
   - **Deployments → [deploy] → Functions → [função que falhou]**
   - Veja os logs para identificar o erro específico

## 🐛 Troubleshooting

### Erro: "Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY"
- **Causa:** JSON mal formatado
- **Solução:** Certifique-se de que está em uma linha e com aspas simples

### Erro: "Firebase Admin Storage not initialized"
- **Causa:** Inicialização falhou
- **Solução:** Verifique se `FIREBASE_SERVICE_ACCOUNT_KEY` está correto e faça redeploy

### Erro: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is not set"
- **Causa:** Variável não configurada
- **Solução:** Adicione `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=wrecap-cb21d.firebasestorage.app` na Vercel

## 📝 Checklist

- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` está configurado na Vercel
- [ ] JSON está em uma linha
- [ ] JSON está envolvido em aspas simples
- [ ] Variável marcada para Production, Preview e Development
- [ ] Redeploy feito após configurar
- [ ] Logs verificados para erros específicos

