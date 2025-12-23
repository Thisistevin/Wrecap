# 💳 Configuração do Asaas

## 📋 Variáveis de Ambiente Necessárias

### Produção
```env
ASAAS_API_KEY=your_asaas_api_key_here
ASAAS_WEBHOOK_TOKEN=your_webhook_token_here
ASAAS_SANDBOX=false
```

### Desenvolvimento (Sandbox)
```env
ASAAS_API_KEY=your_sandbox_api_key_here
ASAAS_WEBHOOK_TOKEN=your_webhook_token_here
ASAAS_SANDBOX=true
```

## 🔧 Configuração do Webhook

### 1. URL do Webhook
Configure a seguinte URL no dashboard do Asaas:

**Desenvolvimento (com ngrok):**
```
https://sua-url-ngrok.ngrok-free.app/api/asaas-webhook
```

**Produção:**
```
https://wrecap.com.br/api/asaas-webhook
```

### 2. Eventos do Webhook
Configure os seguintes eventos no Asaas:
- `PAYMENT_CONFIRMED` - Pagamento confirmado
- `PAYMENT_RECEIVED` - Pagamento recebido

### 3. Token do Webhook
1. Gere um token seguro no dashboard do Asaas
2. Adicione ao `.env.local` como `ASAAS_WEBHOOK_TOKEN`
3. Use o **mesmo token** ao configurar o webhook no dashboard do Asaas

## 🔄 Fluxo de Pagamento

1. **Usuário seleciona créditos** → Escolhe valor no slider
2. **Sistema cria cobrança** → Chama `createAsaasPayment()`
3. **Redireciona para Asaas** → Usuário completa o pagamento (PIX, Boleto, Cartão)
4. **Asaas redireciona de volta** → `/api/payment-success-credits?userId=xxx&credits=xxx`
5. **Webhook é chamado** → Asaas envia confirmação para `/api/asaas-webhook`
6. **Créditos adicionados** → Sistema adiciona créditos ao Firestore

## 🛡️ Segurança

### Verificação de Assinatura
O webhook verifica o token do Asaas para garantir que a requisição veio do Asaas.

### Headers Esperados
O webhook procura o token nos seguintes headers:
- `asaas-access-token`
- `x-asaas-signature`
- `access-token`

## 📝 Estrutura do Payload do Webhook

```json
{
  "event": "PAYMENT_CONFIRMED",
  "payment": {
    "id": "pay_xxx",
    "customer": "cus_xxx",
    "billingType": "PIX",
    "value": 7.00,
    "status": "CONFIRMED",
    "externalReference": "{\"userId\":\"xxx\",\"credits\":5,\"type\":\"credits\"}"
  }
}
```

## 🧪 Testando

### Modo Sandbox
Com `ASAAS_SANDBOX=true`, o sistema usa a API sandbox do Asaas:
- URL: `https://api-sandbox.asaas.com/v3`
- Use uma API key do ambiente sandbox

### Testando o Webhook Localmente
Use uma ferramenta como ngrok para expor sua aplicação local:

```bash
ngrok http 3000
```

Depois configure a URL do webhook no dashboard do Asaas:
```
https://abc123.ngrok-free.app/api/asaas-webhook
```

## 📚 Referências

- Dashboard do Asaas: [https://www.asaas.com](https://www.asaas.com)
- Documentação da API: [https://docs.asaas.com](https://docs.asaas.com)
- Sandbox: [https://sandbox.asaas.com](https://sandbox.asaas.com)

## 🔄 Tipos de Pagamento Suportados

O Asaas suporta os seguintes tipos de pagamento:
- **PIX** - Pagamento instantâneo (recomendado)
- **BOLETO** - Boleto bancário
- **CREDIT_CARD** - Cartão de crédito
- **DEBIT_CARD** - Cartão de débito

Por padrão, o sistema usa **PIX** para pagamentos mais rápidos.

