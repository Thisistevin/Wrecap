# Debug: Processamento de Retrospectivas

## Problema
As fotos estão sendo enviadas, mas as retrospectivas não estão sendo processadas (status permanece "processing").

## O que foi corrigido

1. **Logs melhorados** em `/api/payment-success` e `/api/process-retrospective`
2. **Melhor tratamento de erros** com atualização de status para "failed" quando necessário

## Como debugar

### 1. Verificar logs do servidor

Quando você criar uma nova retrospectiva, verifique os logs do terminal onde o `npm run dev` está rodando. Você deve ver:

```
⚠️ Development mode: Skipping payment, redirecting to success URL
🚀 Triggering retrospective processing for: [ID]
📦 Zip file URL: [URL]
🔗 Processing URL: http://localhost:3000/api/process-retrospective
🔄 [process-retrospective] Endpoint called
📋 [process-retrospective] Processing retrospective: [ID]
```

### 2. Verificar se o endpoint está sendo chamado

Abra o Network tab do DevTools (F12) e procure por:
- `/api/payment-success` - deve retornar 302 (redirect)
- `/api/process-retrospective` - deve retornar 200 (success)

### 3. Verificar erros comuns

#### Erro: "Firebase Admin Storage not initialized"
**Solução:** Verifique se `GOOGLE_APPLICATION_CREDENTIALS` ou `FIREBASE_SERVICE_ACCOUNT_KEY` está configurado no `.env.local`

#### Erro: "GEMINI_API_KEY is not set"
**Solução:** Adicione `GEMINI_API_KEY` no `.env.local`

#### Erro: "Failed to download zip file"
**Solução:** Verifique se o `zipFileUrl` está correto no Firestore

#### Erro: "_chat.txt file not found"
**Solução:** Verifique se o arquivo ZIP contém `_chat.txt` na raiz

### 4. Testar manualmente

Se o processamento não estiver sendo acionado automaticamente, você pode testar manualmente:

```bash
curl -X POST http://localhost:3000/api/process-retrospective \
  -H "Content-Type: application/json" \
  -d '{"retrospectiveId": "SEU_ID_AQUI"}'
```

Substitua `SEU_ID_AQUI` pelo ID da retrospectiva que está com status "processing".

### 5. Verificar status no Firestore

1. Abra o Firebase Console
2. Vá em Firestore Database
3. Verifique o documento da retrospectiva:
   - `status` deve mudar de "processing" para "completed" ou "failed"
   - `textContentJson` deve ser preenchido com o caminho do JSON quando completado

## Próximos passos

1. **Criar uma nova retrospectiva** e observar os logs
2. **Verificar se há erros** nos logs do servidor
3. **Compartilhar os logs** se o problema persistir

## Logs esperados (sucesso)

```
⚠️ Development mode: Skipping payment, redirecting to success URL
🚀 Triggering retrospective processing for: wfuMcq5nKQxbElyrXHsr
📦 Zip file URL: https://firebasestorage.googleapis.com/...
🔗 Processing URL: http://localhost:3000/api/process-retrospective
🔄 [process-retrospective] Endpoint called
📋 [process-retrospective] Processing retrospective: wfuMcq5nKQxbElyrXHsr
📦 [process-retrospective] Zip file URL provided: Yes
Downloading zip file from: https://firebasestorage.googleapis.com/...
Chat file extracted, length: [número]
Generating retrospective with Gemini...
Retrospective generated, length: [número]
✅ Retrospective processing started successfully: { success: true, ... }
```

