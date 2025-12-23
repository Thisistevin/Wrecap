# Setup Instructions

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in all the required values:

```bash
cp .env.local.example .env.local
```

### Required Environment Variables:

#### Firebase Configuration
- Get these from your Firebase project settings
- `AIzaSyAvyKGTBn3unUY_be8219UTTd4R34w6JVc`
- `wrecap-cb21d.firebaseapp.com`
- `wrecap-cb21d`
- `wrecap-cb21d.firebasestorage.app`
- `852238638396`
- `1:852238638396:web:d3b5ae3c633702e8111239`

#### Google OAuth (for Firebase Authentication)
- Create a project in [Google Cloud Console](https://console.cloud.google.com/)
- Enable Google+ API
- Create OAuth 2.0 credentials (Web application)
- **Authorized JavaScript origins:**
  - `http://localhost:3000` (development - porta padrão)
  - `http://localhost:3001` (development - se usar porta 3001)
  - `https://yourdomain.com` (production)
- **Authorized redirect URIs:**
  - `http://localhost:3000` (development - porta padrão)
  - `http://localhost:3001` (development - se usar porta 3001)
  - `https://yourdomain.com` (production)
  - Firebase também usa automaticamente: `https://[PROJECT_ID].firebaseapp.com/__/auth/handler`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

**Nota:** Se o Next.js estiver rodando em uma porta diferente de 3000 (ex: 3001), adicione ambas as portas nas configurações do Google OAuth.

#### Gemini API
- Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- `AIzaSyAYiaxwW8hO7dE9j6HOMixixmi-0an8I1A`

#### AvocadoPay
- Get credentials from AvocadoPay dashboard
- `AVOCADOPAY_API_KEY=abc_dev_dnTnuzYJU14FUy2rUfE2nY1c`
- `AVOCADOPAY_WEBHOOK_SECRET=4b976a5abb46f28ada7d03fb388f9b196ce75faaaed864bbb338b567fde73cea`
  
  **Nota:** O `AVOCADOPAY_WEBHOOK_SECRET` deve ser o mesmo secret configurado no dashboard do Abacatepay quando você criar/editar o webhook.

## 3. Firebase Setup

### Enable Authentication Providers
1. Go to Firebase Console > Authentication > Sign-in method
2. Enable Google provider
3. Add authorized domains:
   - **Development**: `localhost` (já vem por padrão)
   - **Production**: Seu domínio de produção (ex: `wrecap.com`, `app.wrecap.com`)
   - **ngrok (para testes)**: Seu domínio ngrok (ex: `abc123.ngrok-free.app`)
   
   Para adicionar: Firebase Console > Authentication > Settings > Authorized domains > Add domain

### Set up Firestore Database
1. Go to Firebase Console > Firestore Database
2. Create database in production mode (or test mode for development)
3. The following collections will be created automatically:
   - `retrospectives`
   - `photos`

### Set up Storage
1. Go to Firebase Console > Storage
2. Create storage bucket
3. Set up security rules (example below)

### Firestore Security Rules (Example)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /retrospectives/{retrospectiveId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /photos/{photoId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### Storage Security Rules (Example)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /temp/{userId}/{allPaths=**} {
      allow write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && request.auth.uid == userId;
    }
    match /retrospectives/{retrospectiveId}/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 4. AvocadoPay Integration

### Webhook Configuration

1. **Webhook URL**: 
   - Development (porta 3000): `http://localhost:3000/api/avocadopay-webhook`
   - Development (porta 3001): `http://localhost:3001/api/avocadopay-webhook`
   - Production: `https://yourdomain.com/api/avocadopay-webhook`
   
   **Nota:** Para desenvolvimento local, você precisará usar ngrok ou localtunnel para expor o servidor (veja WEBHOOK_CONFIG.md)

2. **Webhook Secret**: 
   - Generate a secure random string (e.g., `openssl rand -hex 32`)
   - Add it to your `.env.local` as `AVOCADOPAY_WEBHOOK_SECRET`
   - Use the same secret when creating the webhook in AvocadoPay dashboard

3. **Webhook Events**: 
   - Select: `billing.paid` (Cobrança paga)

4. **Webhook Name**: 
   - Use: `wrecap` (or any name you prefer)

### AvocadoPay Setup Steps

1. Go to AvocadoPay Dashboard > Webhooks
2. Click "Criar webhook" (Create webhook)
3. Fill in:
   - **Nome do Webhook**: `wrecap`
   - **URL**: Your webhook URL (see above)
   - **Secret**: The secret you generated (same as `AVOCADOPAY_WEBHOOK_SECRET`)
   - **Selecione os Eventos**: Select `billing.paid - Cobrança paga`
4. Save the webhook

### Checkout Integration

Replace the `createAvocadoPayCheckout` function in `lib/avocadopay.ts` with the actual AvocadoPay SDK/API integration based on their documentation.

## 5. Run the Development Server

```bash
npm run dev
```

**Por padrão, o Next.js roda na porta 3000.** Se a porta 3000 estiver ocupada, o Next.js automaticamente usará a próxima porta disponível (ex: 3001).

Para forçar uma porta específica:
```bash
PORT=3001 npm run dev
# ou
npm run dev -- -p 3001
```

**Importante:** Se você usar uma porta diferente de 3000, certifique-se de:
1. Adicionar a porta nas configurações do Google OAuth (veja seção acima)
2. Atualizar a URL do webhook do AvocadoPay se estiver usando ngrok/localtunnel
3. Acessar a aplicação na porta correta (ex: `http://localhost:3001`)

Open [http://localhost:3000](http://localhost:3000) (ou a porta que o Next.js estiver usando) in your browser.

## Notes

- The zip file uploads are temporarily stored in Firebase Storage for 1 hour before automatic deletion
- The Gemini API call happens after successful payment
- Make sure your Firebase Storage bucket has sufficient space
- For production, consider using a queue system (like BullMQ or similar) for processing retrospectives instead of handling it in API routes

