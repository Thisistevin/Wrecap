# 🚀 Checklist de Deploy - WRecap

## ✅ Verificações Realizadas

### 1. Popup de Trial ✅
- [x] Dialog criado para trial gratuito
- [x] Mensagem clara sobre retrospectiva não salva
- [x] Opção de continuar grátis ou cancelar
- [x] Design consistente com o app

### 2. Fluxo de Pagamento ✅
- [x] Retry automático para `auto_return` (tenta com e sem)
- [x] Webhook configurado para processar pagamentos
- [x] Fallback para processamento via URL quando webhook falha
- [x] Validação de `back_urls` antes de enviar

### 3. Performance ✅
- [x] Queries Firestore otimizadas (sem loops infinitos)
- [x] `useEffect` com dependências corretas
- [x] Carregamento de créditos apenas quando necessário
- [x] Carregamento de retrospectivas apenas quando menu abre

## 📋 Configurações para Deploy

### Variáveis de Ambiente (Produção)

```env
# Firebase (MESMAS VARIÁVEIS EM DEV E PRODUÇÃO - mesmo projeto Firebase)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Server-side) - MESMA em dev e produção
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
# OU
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Mercado Pago (Produção)
MERCADOPAGO_ACCESS_TOKEN=APP_USR-9dee7f01-7f27-4dd6-a511-6569893de8d9
MERCADOPAGO_WEBHOOK_SECRET=2f871fa604d9ea0fb8af41473ff568f766ac26bb2fc26fbd142879d51733dddb
MERCADOPAGO_SANDBOX=false

# Gemini
GEMINI_API_KEY=your_gemini_api_key

# Next.js
NEXT_PUBLIC_APP_URL=https://wrecap.com.br
```

### Webhook URL (Mercado Pago)

Configure no Dashboard do Mercado Pago:
```
https://wrecap.com.br/api/mercadopago-webhook
```

**Eventos a marcar:**
- ✅ Pagamentos (payments)

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Credits collection
    match /credits/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Only server-side writes
    }
    
    // Retrospectives collection
    match /retrospectives/{retrospectiveId} {
      allow read: if request.auth != null && 
                     (resource.data.userId == request.auth.uid || 
                      resource.data.status == 'completed');
      allow create: if request.auth != null && 
                        request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && 
                        resource.data.userId == request.auth.uid;
      allow delete: if false; // Only server-side deletes
    }
    
    // Photos collection
    match /photos/{photoId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if false; // Only server-side
    }
  }
}
```

### Firestore Indexes Necessários

1. **retrospectives** collection:
   - `userId` (Ascending) + `createdAt` (Descending)
   - Campo: `ephemeral` (para filtrar retrospectivas salvas)

### Firebase Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /temp/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /photos/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🔍 Verificações Pós-Deploy

1. **Testar Login:**
   - [ ] Login com Google funciona
   - [ ] Redirecionamento após login

2. **Testar Criação de Retrospectiva:**
   - [ ] Upload de arquivos funciona
   - [ ] Processamento inicia corretamente
   - [ ] Trial gratuito funciona (sem créditos)

3. **Testar Pagamento:**
   - [ ] Checkout abre corretamente
   - [ ] Pagamento processa (use cartão de teste)
   - [ ] Créditos são adicionados após pagamento
   - [ ] Webhook recebe notificações

4. **Testar Visualização:**
   - [ ] Retrospectivas aparecem no menu
   - [ ] Página de retrospectiva carrega corretamente
   - [ ] Imagens carregam do Firebase Storage

## 🐛 Troubleshooting

### Webhook não recebe notificações
1. Verifique se a URL está correta no dashboard do Mercado Pago
2. Verifique se `MERCADOPAGO_WEBHOOK_SECRET` está configurado
3. Verifique logs do servidor para erros

### Créditos não são adicionados
1. Verifique logs do webhook (`/api/mercadopago-webhook`)
2. Verifique se `external_reference` contém `userId` e `credits`
3. Verifique Firestore rules para `credits` collection

### Retrospectivas não aparecem
1. Verifique Firestore index (`userId` + `createdAt`)
2. Verifique se `ephemeral: false` está sendo salvo
3. Verifique Firestore rules para `retrospectives` collection

## 📝 Notas Importantes

- **Trial Gratuito:** A primeira retrospectiva é sempre gratuita, mas não é salva (`ephemeral: true`)
- **Webhook:** O webhook processa pagamentos em segundo plano, mas há fallback via URL
- **Performance:** Queries são executadas apenas quando necessário (menu aberto, etc)
- **Segurança:** Todas as operações sensíveis (créditos, pagamentos) são server-side

