# 🔧 Corrigir Adição de Créditos via Webhook

## ❌ Problema

O webhook do Mercado Pago estava recebendo notificações (200 OK), mas os créditos não estavam sendo adicionados no Firebase.

## 🔍 Problemas Identificados

### 1. Notificações de Teste Sendo Ignoradas
- O código ignorava notificações com IDs que começam com "123"
- Notificações de teste do dashboard eram completamente ignoradas
- **Correção:** Agora tenta buscar o pagamento primeiro, só ignora se realmente não existir

### 2. Pagamentos `pending` Não Processados
- O código só processava pagamentos com status `approved` ou `authorized`
- Pagamentos Pix começam com status `pending` e podem demorar para aprovar
- **Correção:** Agora processa pagamentos `pending` também (Pix será confirmado depois)

### 3. Falta de Logs Detalhados
- Difícil debugar quando algo falha
- **Correção:** Adicionados logs detalhados em cada etapa

## ✅ Correções Implementadas

### 1. Processamento de Notificações de Teste
```typescript
// Antes: Ignorava imediatamente
if (paymentId.startsWith('123')) {
  return { status: 'ignored' };
}

// Agora: Tenta buscar primeiro
if (isTestId) {
  logger.log('⚠️ Test payment ID detected, attempting to fetch...');
  // Continua o processamento
}
```

### 2. Processamento de Pagamentos `pending`
```typescript
// Antes: Só processava approved/authorized
if (isApproved) {
  // process credits
}

// Agora: Processa pending também
if (isApproved || paymentData.status === 'pending') {
  if (paymentData.status === 'pending') {
    logger.log('⏳ Payment is pending (Pix). Processing credits now...');
  }
  // process credits
}
```

### 3. Logs Detalhados Adicionados
- Log antes de buscar créditos atuais
- Log após atualizar créditos
- Verificação após atualização (confirma que foi salvo)
- Logs de erro mais detalhados

### 4. Tratamento de Erros Melhorado
- Try-catch específico para operações do Firestore
- Validação de valores de créditos
- Verificação após atualização

## 📋 Como Verificar se Está Funcionando

### 1. Verificar Logs na Vercel

1. Na Vercel, vá em **Deployments** → último deploy
2. Clique em **Functions** → `/api/mercadopago-webhook`
3. Veja os logs - deve aparecer:
   ```
   📥 Mercado Pago webhook received
   🔍 Fetching payment details for ID: ...
   💰 Payment details: { status: 'approved', ... }
   🎫 Adding credits to user: ...
   📊 Current credits: X
   📊 New credits total: Y
   ✅ Credits updated successfully: Y
   ✅ Verification: Credits in Firestore: Y
   ```

### 2. Testar com Notificação Real

1. **Faça um pagamento real** (não apenas simulação)
2. **Aguarde o webhook ser chamado** (1-5 minutos para Pix)
3. **Verifique os logs** na Vercel
4. **Verifique no Firebase:**
   - Vá em Firestore → `credits` collection
   - Procure pelo documento com ID = `userId`
   - Verifique se o campo `credits` foi atualizado

### 3. Verificar no App

1. Acesse `wrecap.com.br`
2. Faça login
3. Abra o menu (sanduíche)
4. Veja a seção "Créditos"
5. Os créditos devem aparecer automaticamente

## 🔍 Debugging

Se os créditos ainda não estiverem sendo adicionados, verifique os logs:

### Logs Esperados (Sucesso):
```
📥 Mercado Pago webhook received
🔍 Webhook headers: { hasSignature: true, ... }
📋 Webhook payload: { type: 'payment', ... }
🔍 Fetching payment details for ID: ...
💰 Payment details: { status: 'approved', external_reference: '...' }
✅ Parsed metadata: { userId: '...', credits: 2, type: 'credits' }
🎫 Adding credits to user: ...
📊 Current credits: 0
📊 New credits total: 2
✅ Credits updated successfully: 2
✅ Verification: Credits in Firestore: 2
```

### Possíveis Problemas:

1. **"Test notification ignored"**
   - **Solução:** Use um pagamento real, não simulação

2. **"Payment not approved yet: pending"**
   - **Solução:** Agora processa `pending` também, mas verifique os logs

3. **"Credits purchase not processed"**
   - **Causa:** `type !== 'credits'` ou falta `userId`/`credits` no metadata
   - **Solução:** Verifique se o `external_reference` está sendo enviado corretamente no checkout

4. **"Error updating credits in Firestore"**
   - **Causa:** Problema de permissões ou conexão com Firebase
   - **Solução:** Verifique as regras do Firestore e a configuração do Firebase

## 📝 Checklist

- [ ] Código atualizado e deployado
- [ ] Logs detalhados aparecendo na Vercel
- [ ] Teste com pagamento real (não simulação)
- [ ] Verificação no Firebase (documento `credits` atualizado)
- [ ] Verificação no app (créditos aparecendo)

## 🚀 Próximos Passos

1. **Fazer redeploy** na Vercel
2. **Testar com pagamento real** (não simulação do dashboard)
3. **Verificar logs** na Vercel para confirmar processamento
4. **Verificar Firebase** para confirmar que os créditos foram salvos

