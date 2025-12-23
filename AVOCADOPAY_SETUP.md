# 🥑 Configuração do AvocadoPay

## 📋 Variáveis de Ambiente Necessárias

### Produção
```env
AVOCADOPAY_API_KEY=abc_dev_pDZQjfS5TTFHSY12jTDCwSDF
AVOCADOPAY_WEBHOOK_SECRET=webh_dev_6USdmnhjmKuXTBq1AuagB4Dm
NEXT_PUBLIC_AVOCADOPAY_API_URL=https://api.abacatepay.com/v1/checkouts
NEXT_PUBLIC_AVOCADOPAY_CHECKOUT_URL=https://checkout.abacatepay.com
```

### Desenvolvimento
```env
# Não é mais necessário pular o pagamento
# O sistema sempre tentará criar o checkout real do AvocadoPay
# Certifique-se de ter AVOCADOPAY_API_KEY configurada
```

## 🔧 Configuração do Webhook

### 📝 Guia Rápido para Preencher o Formulário

**Veja o guia detalhado em:** `WEBHOOK_FORM_GUIDE.md`

**Resumo dos campos:**

1. **Nome do Webhook:** `wrecap local` (ou qualquer nome descritivo)
2. **URL:** Use ngrok (veja instruções abaixo) - `https://sua-url-ngrok.ngrok-free.app/api/avocadopay-webhook`
3. **Secret:** Use o secret fornecido pelo AvocadoPay (ex: `webh_dev_6USdmnhjmKuXTBq1AuagB4Dm`) e use o MESMO no `.env.local`
4. **Eventos:** Selecione `billing.paid`, `payment.paid`, ou `paid`

### 1. URL do Webhook

⚠️ **IMPORTANTE:** O AvocadoPay **NÃO aceita URLs com `localhost`**!

Você precisa usar uma ferramenta como **ngrok** para expor seu localhost como URL pública.

**Desenvolvimento (com ngrok):**

1. Instale o ngrok: `brew install ngrok` (macOS) ou baixe em [ngrok.com](https://ngrok.com/download)
2. Inicie seu servidor: `npm run dev`
3. Em outro terminal, execute: `ngrok http 3000`
4. Copie a URL HTTPS que aparecer (ex: `https://abc123.ngrok-free.app`)
5. Use no dashboard: `https://abc123.ngrok-free.app/api/avocadopay-webhook`

**Produção:**
```
https://yourdomain.com/api/avocadopay-webhook
```

📖 **Veja o guia completo em:** `WEBHOOK_FORM_GUIDE.md`

### 2. Eventos do Webhook
O webhook processa os seguintes eventos:
- `billing.paid` - Cobrança paga
- `payment.paid` - Pagamento confirmado
- `paid` - Status de pagamento confirmado

### 3. Secret do Webhook
1. O AvocadoPay fornece um secret quando você cria o webhook (ex: `webh_dev_6USdmnhjmKuXTBq1AuagB4Dm`)
2. Adicione ao `.env.local` como `AVOCADOPAY_WEBHOOK_SECRET`
3. Use o **mesmo secret** que aparece no dashboard do AvocadoPay

⚠️ **IMPORTANTE:** 
- O secret no dashboard DEVE ser idêntico ao do `.env.local`!
- O secret atual configurado é: `webh_dev_6USdmnhjmKuXTBq1AuagB4Dm`
- Certifique-se de que este valor está no seu `.env.local`

## 🔄 Fluxo de Pagamento

1. **Usuário cria retrospectiva** → Upload de arquivos
2. **Sistema cria checkout** → Chama `createAvocadoPayCheckout()`
3. **Redireciona para AvocadoPay** → Usuário completa o pagamento
4. **AvocadoPay redireciona de volta** → `/api/payment-success?retrospectiveId=xxx`
5. **Webhook é chamado** → AvocadoPay envia confirmação para `/api/avocadopay-webhook`
6. **Processamento inicia** → Sistema processa a retrospectiva

## 🛡️ Segurança

### Verificação de Assinatura
O webhook verifica a assinatura HMAC SHA256 para garantir que a requisição veio do AvocadoPay:

```typescript
// O webhook verifica automaticamente a assinatura
// Se AVOCADOPAY_WEBHOOK_SECRET não estiver configurado, a verificação é pulada (apenas em dev)
```

### Headers Esperados
O webhook procura a assinatura nos seguintes headers:
- `x-avocadopay-signature`
- `x-signature`
- `signature`
- `x-webhook-signature`

## 📝 Estrutura do Payload do Webhook

```json
{
  "event": "billing.paid",
  "type": "billing.paid",
  "status": "paid",
  "id": "payment_id",
  "amount": 29.90,
  "currency": "BRL",
  "metadata": {
    "retrospectiveId": "xxx",
    "userId": "yyy"
  }
}
```

## 🧪 Testando

### Modo de Desenvolvimento
O sistema sempre tentará criar o checkout real do AvocadoPay. Certifique-se de ter:
- `AVOCADOPAY_API_KEY` configurada
- `AVOCADOPAY_WEBHOOK_SECRET` configurado
- Webhook configurado no dashboard do AvocadoPay (use ngrok para desenvolvimento local)

### Testando o Webhook Localmente
Use uma ferramenta como ngrok para expor sua aplicação local:

```bash
ngrok http 3000
```

Depois configure a URL do webhook no dashboard do AvocadoPay:
```
https://abc123.ngrok-free.app/api/avocadopay-webhook
```

## ⚠️ Troubleshooting

### Erro: "AVOCADOPAY_API_KEY is not configured"
- Verifique se a variável `AVOCADOPAY_API_KEY` está configurada no `.env.local`
- Certifique-se de que a API key está correta e válida

### Erro: "Invalid webhook signature"
- Verifique se `AVOCADOPAY_WEBHOOK_SECRET` está configurado corretamente
- Certifique-se de que o secret no dashboard do AvocadoPay é o mesmo do `.env.local`

### Erro: "No checkout URL in response"
- Verifique se a URL da API está correta (`NEXT_PUBLIC_AVOCADOPAY_API_URL`)
- Verifique se a API key está válida
- Verifique os logs do servidor para mais detalhes

## 📚 Referências

- Dashboard do AvocadoPay: [https://dashboard.abacatepay.com](https://dashboard.abacatepay.com)
- Documentação da API: Verifique a documentação oficial do AvocadoPay

