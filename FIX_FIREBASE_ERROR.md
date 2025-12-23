# 🔧 Como Corrigir o Erro do Firebase Admin

## ❌ Erro Atual
```
Service account file not found: /Users/estevao/Programacao/wrecap/wrecap-cb21d-firebase-adminsdk-fbsvc-1ccd228308.json
```

## ✅ Solução Rápida (5 minutos)

### Método 1: Usar Variável de Ambiente (RECOMENDADO - Mais Fácil)

1. **Baixe o Service Account:**
   - Abra: https://console.firebase.google.com/project/wrecap-cb21d/settings/serviceaccounts/adminsdk
   - Clique em **"Generate new private key"**
   - Salve o arquivo JSON (ex: `wrecap-cb21d-firebase-adminsdk-xxxxx.json`)

2. **Abra o arquivo JSON** e copie TODO o conteúdo

3. **Edite o arquivo `.env.local`** na raiz do projeto:
   ```bash
   # Se não existir, crie:
   touch .env.local
   ```

4. **Remova a linha** `GOOGLE_APPLICATION_CREDENTIALS=...` se existir

5. **Adicione esta linha** (cole o JSON completo em uma única linha):
   ```env
   FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"wrecap-cb21d","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}'
   ```
   
   ⚠️ **IMPORTANTE:**
   - O JSON deve estar em **UMA ÚNICA LINHA**
   - Entre **aspas simples** `'...'`
   - Mantenha todas as quebras de linha `\n` no `private_key`

6. **Reinicie o servidor:**
   ```bash
   # Pare o servidor (Ctrl+C) e inicie novamente:
   npm run dev
   ```

### Método 2: Usar Arquivo (Alternativa)

1. **Baixe o Service Account** (mesmo passo acima)

2. **Mova o arquivo para a raiz do projeto:**
   ```bash
   # Se o arquivo estiver em Downloads:
   mv ~/Downloads/wrecap-cb21d-firebase-adminsdk-*.json /Users/estevao/Programacao/wrecap/
   ```

3. **Edite o arquivo `.env.local`:**
   - Remova `FIREBASE_SERVICE_ACCOUNT_KEY=...` se existir
   - Adicione (substitua `xxxxx` pelo nome real do arquivo):
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=./wrecap-cb21d-firebase-adminsdk-xxxxx.json
   ```

4. **Reinicie o servidor:**
   ```bash
   npm run dev
   ```

## 🚀 Script Automatizado

Você também pode usar o script de ajuda:

```bash
./SETUP_FIREBASE_ADMIN.sh
```

O script vai guiá-lo passo a passo!

## ✅ Verificação

Após configurar, você deve ver no console:
```
✅ Firebase Admin initialized with FIREBASE_SERVICE_ACCOUNT_KEY
```

Ou:
```
✅ Service account file loaded successfully
```

## 🆘 Ainda com Problemas?

1. Verifique se o `.env.local` está na raiz do projeto
2. Verifique se não há espaços extras nas variáveis
3. Verifique se o JSON está completo (deve ter `type`, `project_id`, `private_key`, etc.)
4. Veja `QUICK_SETUP.md` para mais detalhes

