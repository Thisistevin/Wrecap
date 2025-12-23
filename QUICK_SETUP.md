# 🔧 Configuração Rápida do Firebase Admin

## Erro Atual
```
Service account file not found: /Users/estevao/Programacao/wrecap/wrecap-cb21d-firebase-adminsdk-fbsvc-1ccd228308.json
```

## Solução Rápida (2 opções)

### Opção 1: Usar arquivo JSON (Mais fácil para desenvolvimento)

1. **Baixe o arquivo de service account:**
   - Acesse: https://console.firebase.google.com/project/wrecap-cb21d/settings/serviceaccounts/adminsdk
   - Clique em **"Generate new private key"**
   - Salve o arquivo JSON (ex: `wrecap-cb21d-firebase-adminsdk-xxxxx.json`)

2. **Coloque o arquivo na raiz do projeto:**
   ```bash
   # Mova o arquivo para a pasta do projeto
   mv ~/Downloads/wrecap-cb21d-firebase-adminsdk-*.json /Users/estevao/Programacao/wrecap/
   ```

3. **Configure no `.env.local`:**
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=./wrecap-cb21d-firebase-adminsdk-xxxxx.json
   ```
   (Substitua `xxxxx` pelo nome real do seu arquivo)

4. **Reinicie o servidor:**
   ```bash
   npm run dev
   ```

### Opção 2: Usar variável de ambiente (Melhor para produção)

1. **Baixe o arquivo de service account** (mesmo passo acima)

2. **Abra o arquivo JSON e copie TODO o conteúdo**

3. **Adicione no `.env.local`:**
   ```env
   FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"wrecap-cb21d","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'
   ```
   ⚠️ **Importante**: 
   - O JSON deve estar em UMA ÚNICA LINHA
   - Entre aspas simples `'...'`
   - Mantenha todas as quebras de linha `\n` no private_key

4. **Reinicie o servidor:**
   ```bash
   npm run dev
   ```

## Verificação

Após configurar, o erro não deve mais aparecer. Você verá no console:
```
✅ Service account file loaded successfully
```

## Precisa de ajuda?

Veja o arquivo `FIREBASE_ADMIN_SETUP.md` para instruções detalhadas.

