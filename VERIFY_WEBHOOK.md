# 🔔 Verificar se o Webhook do Mercado Pago Está Funcionando

## ✅ Como Funciona

Quando você faz um pagamento via Pix:

1. **Você paga** → Escaneia o QR code ou copia o código Pix
2. **Mercado Pago detecta** → Pode levar 1-5 minutos (Pix é assíncrono)
3. **Webhook é enviado** → Mercado Pago chama `/api/mercadopago-webhook`
4. **Créditos são adicionados** → Automaticamente no seu Firestore

## 🔍 Como Verificar se o Webhook Foi Recebido

### Opção 1: Verificar Logs na Vercel

1. Na Vercel, vá em **Deployments**
2. Clique no último deploy
3. Vá em **Functions** → `/api/mercadopago-webhook`
4. Veja os logs - deve aparecer:
   - `📥 Mercado Pago webhook received`
   - `💰 Payment details: ...`
   - `✅ Credits updated: X`

### Opção 2: Verificar no Dashboard do Mercado Pago

1. Acesse: [https://www.mercadopago.com.br/developers/panel](https://www.mercadopago.com.br/developers/panel)
2. Vá em **Sua aplicação** → **Notificações** → **Webhooks**
3. Clique no webhook configurado
4. Veja o histórico de notificações enviadas
5. Verifique se há notificações recentes do seu pagamento

### Opção 3: Verificar Créditos no App

1. Acesse `wrecap.com.br`
2. Faça login
3. Abra o menu (sanduíche)
4. Veja a seção "Créditos"
5. Os créditos devem aparecer automaticamente quando o webhook processar

## ⏱️ Tempo de Processamento

- **Cartão de crédito:** Imediato (segundos)
- **Pix:** 1-5 minutos (depende do banco)
- **Boleto:** Até 2 dias úteis

## 🔧 Se o Webhook Não Está Funcionando

### Verificar Configuração

1. **URL do Webhook:**
   - Deve ser: `https://wrecap.com.br/api/mercadopago-webhook`
   - Verifique no dashboard do Mercado Pago

2. **Eventos Configurados:**
   - Deve ter ✅ **Pagamentos** marcado

3. **Modo:**
   - Para produção: **Modo de produção** (não teste)
   - Para desenvolvimento: **Modo de teste**

4. **Secret:**
   - Deve estar configurado na Vercel como `MERCADOPAGO_WEBHOOK_SECRET`
   - Deve ser o mesmo do dashboard

### Testar Manualmente

1. **No Dashboard do Mercado Pago:**
   - Vá em **Webhooks** → Seu webhook
   - Clique em **"Simular notificação"**
   - Verifique os logs na Vercel

2. **Acessar URL de Retorno:**
   - Após pagar, você pode acessar manualmente:
   - `https://wrecap.com.br/payment-success?payment_id=SEU_PAYMENT_ID&status=approved`
   - Isso processará o pagamento mesmo se o webhook falhar

## 📝 Checklist

- [ ] Webhook configurado no Mercado Pago: `https://wrecap.com.br/api/mercadopago-webhook`
- [ ] Evento "Pagamentos" está marcado
- [ ] Modo de produção está selecionado
- [ ] `MERCADOPAGO_WEBHOOK_SECRET` está configurado na Vercel
- [ ] Aguardou alguns minutos após o pagamento (Pix pode demorar)
- [ ] Verificou os logs na Vercel
- [ ] Verificou os créditos no app

## 🚨 Se Ainda Não Funcionou

1. **Verifique os logs na Vercel** para ver erros específicos
2. **Teste o webhook** usando "Simular notificação" no dashboard
3. **Acesse manualmente** `/payment-success` com os parâmetros do pagamento
4. **Verifique se o pagamento foi realmente aprovado** no dashboard do Mercado Pago

