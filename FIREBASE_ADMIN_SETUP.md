# Firebase Admin SDK Setup

## Problema

O Firebase Admin SDK precisa de credenciais para acessar o Firestore no servidor. Apenas o Project ID não é suficiente.

## Solução: Criar Service Account

### Passo 1: Criar Service Account no Firebase

1. Acesse: [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto: **wrecap-cb21d**
3. Vá em: **Project Settings** (ícone de engrenagem) > **Service Accounts**
4. Clique em: **Generate new private key**
5. Baixe o arquivo JSON (ex: `wrecap-cb21d-firebase-adminsdk-xxxxx.json`)

### Passo 2: Configurar no .env.local

**Opção A: Usar arquivo JSON (recomendado para desenvolvimento local)**

1. Coloque o arquivo JSON na raiz do projeto (ou em uma pasta `config/`)
2. Adicione no `.env.local`:
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=./wrecap-cb21d-firebase-adminsdk-xxxxx.json
   ```

**Opção B: Usar variável de ambiente (recomendado para produção/serverless)**

1. Abra o arquivo JSON baixado
2. Copie TODO o conteúdo do JSON
3. Adicione no `.env.local` (em uma única linha):
   ```env
   FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"wrecap-cb21d",...}'
   ```
   ⚠️ **Importante**: O JSON deve estar em uma única linha, entre aspas simples.

### Passo 3: Reiniciar o servidor

```bash
npm run dev
```

## Alternativa Rápida (Apenas para Teste)

Se você quiser testar rapidamente sem criar service account, pode temporariamente colocar o Firestore em **modo de teste**:

1. Firebase Console > Firestore Database > Rules
2. Use estas regras temporárias:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
3. ⚠️ **ATENÇÃO**: Isso permite acesso total! Use apenas para desenvolvimento.
4. Depois de configurar a service account, volte as regras de segurança.

## Verificação

Após configurar, teste fazendo upload novamente. O erro "Unable to detect a Project Id" não deve mais aparecer.

