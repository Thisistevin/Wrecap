# 💳 Configuração do Mercado Pago

## 📋 Variáveis de Ambiente Necessárias

### Produção
```env
MERCADOPAGO_ACCESS_TOKEN=your_access_token_here
MERCADOPAGO_WEBHOOK_SECRET=your_webhook_secret_here
MERCADOPAGO_SANDBOX=false
```

### Desenvolvimento (Test)
```env
MERCADOPAGO_ACCESS_TOKEN=your_test_access_token_here
MERCADOPAGO_WEBHOOK_SECRET=your_webhook_secret_here
MERCADOPAGO_SANDBOX=true
```

## 🔧 Configuração Inicial

### 1. Criar Conta no Mercado Pago
1. Acesse [https://www.mercadopago.com.br](https://www.mercadopago.com.br)
2. Crie uma conta ou faça login

### 2. Criar Aplicação
1. Acesse o [Dashboard do Desenvolvedor](https://www.mercadopago.com.br/developers/panel)
2. Clique em "Criar aplicação"
3. Preencha:
   - **Nome da aplicação:** WRecap
   - **Descrição:** Sistema de retrospectivas de WhatsApp
   - **URL do site:** https://wrecap.com.br (produção)
4. Selecione "Pagamentos Online" como solução

### 3. Obter Credenciais
1. No Dashboard, vá em "Credenciais"
2. Copie o **Access Token** (produção ou teste)
3. Adicione ao `.env.local` como `MERCADOPAGO_ACCESS_TOKEN`

### 4. Obter Webhook Secret
1. No Dashboard, vá em "Notificações" > "Webhooks"
2. Configure a URL do webhook (veja seção abaixo)
3. Copie o **Secret Signature** (Assinatura secreta) que aparece no campo
4. Adicione ao `.env.local` como `MERCADOPAGO_WEBHOOK_SECRET`

### 4. Credenciais de Teste
Para testar localmente:
1. No Dashboard, use as credenciais de **Teste**
2. Configure `MERCADOPAGO_SANDBOX=true` no `.env.local`
3. Use cartões de teste do Mercado Pago:
   - **Aprovado:** 5031 4332 1540 6351 (CVV: 123)
   - **Recusado:** 5031 4332 1540 6351 (CVV: 123)
   - Mais cartões: [https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/testing](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/testing)

## 🔔 Configuração do Webhook

### 1. URL do Webhook
Configure a seguinte URL no dashboard do Mercado Pago:

**Desenvolvimento (com ngrok):**
```
https://sua-url-ngrok.ngrok-free.app/api/mercadopago-webhook
```

**Produção:**
```
https://wrecap.com.br/api/mercadopago-webhook
```

### 2. Configurar Webhook no Dashboard
1. No Dashboard do Desenvolvedor, vá em "Notificações" > "Webhooks"
2. Selecione "Modo de teste" ou "Modo de produção"
3. Configure:
   - **URL:** `https://wrecap.com.br/api/mercadopago-webhook` (produção)
   - Ou use ngrok para desenvolvimento: `https://sua-url-ngrok.ngrok-free.app/api/mercadopago-webhook`
   - **Eventos:** Marque "Pagamentos" (recomendado para CheckoutPro)
   - **Secret Signature:** Copie o secret que aparece no campo "Assinatura secreta"
4. Adicione o secret ao `.env.local` como `MERCADOPAGO_WEBHOOK_SECRET`
5. Clique em "Salvar configurações"

### 3. Testar Webhook
O Mercado Pago permite testar o webhook diretamente no dashboard:
1. Vá em "Webhooks" > Selecione seu webhook
2. Clique em "Testar webhook"
3. Verifique os logs do servidor

## 🔄 Fluxo de Pagamento

1. **Usuário seleciona créditos** → Escolhe valor no slider
2. **Sistema cria preferência** → Chama `createMercadoPagoCheckout()`
3. **Redireciona para Mercado Pago** → Usuário completa o pagamento
4. **Mercado Pago redireciona de volta** → `/api/payment-success-credits?userId=xxx&credits=xxx`
5. **Webhook é chamado** → Mercado Pago envia notificação para `/api/mercadopago-webhook`
6. **Créditos adicionados** → Sistema adiciona créditos ao Firestore

## 🛡️ Segurança

### Verificação de Webhook
O webhook verifica a assinatura do Mercado Pago para garantir que a requisição veio do Mercado Pago.

### Headers Esperados
O webhook procura os seguintes headers:
- `x-signature` - Assinatura do webhook
- `x-request-id` - ID da requisição

## 📝 Estrutura do Payload do Webhook

```json
{
  "action": "payment.created",
  "api_version": "v1",
  "data": {
    "id": "123456789"
  },
  "date_created": "2024-01-01T00:00:00.000Z",
  "id": 123456,
  "live_mode": false,
  "type": "payment",
  "user_id": "123456"
}
```

## 🧪 Testando

### Modo Test (Sandbox)
Com `MERCADOPAGO_SANDBOX=true`, o sistema usa as credenciais de teste:
- Use cartões de teste do Mercado Pago
- Não há cobrança real

### Testando o Webhook Localmente
Use uma ferramenta como ngrok para expor sua aplicação local:

```bash
ngrok http 3000
```

Depois configure a URL do webhook no dashboard do Mercado Pago:
```
https://abc123.ngrok-free.app/api/mercadopago-webhook
```

### Cartões de Teste
- **Aprovado:** 5031 4332 1540 6351 (CVV: 123, Vencimento: 11/25)
- **Recusado:** Qualquer cartão com CVV diferente
- **Pendente:** Use cartões específicos para simular pendências

## 📚 Referências

- Dashboard do Desenvolvedor: [https://www.mercadopago.com.br/developers/panel](https://www.mercadopago.com.br/developers/panel)
- Documentação da API: [https://www.mercadopago.com.br/developers/pt/docs](https://www.mercadopago.com.br/developers/pt/docs)
- Checkout Pro: [https://www.mercadopago.com.br/developers/pt/docs/checkout-pro](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro)
- Cartões de Teste: [https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/testing](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/testing)

## 💡 Métodos de Pagamento Suportados

O Mercado Pago suporta automaticamente:
- **Cartão de Crédito** - Visa, Mastercard, Elo, etc.
- **Cartão de Débito** - Visa, Mastercard
- **PIX** - Pagamento instantâneo
- **Boleto Bancário** - Pagamento em até 3 dias úteis
- **Saldo Mercado Pago** - Se o usuário tiver saldo

Todos os métodos são habilitados automaticamente no checkout.

