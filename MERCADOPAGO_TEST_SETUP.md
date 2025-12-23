# 🧪 Configuração Rápida - Mercado Pago TESTE

## 📝 Variáveis de Ambiente para TESTE

Adicione/atualize no seu `.env.local`:

```env
# Credenciais de TESTE (Sandbox)
MERCADOPAGO_ACCESS_TOKEN=TEST-seu_access_token_de_teste_aqui
MERCADOPAGO_WEBHOOK_SECRET=seu_webhook_secret_de_teste_aqui
MERCADOPAGO_SANDBOX=true
```

## 🔑 Onde encontrar as credenciais de TESTE:

1. Acesse: [https://www.mercadopago.com.br/developers/panel](https://www.mercadopago.com.br/developers/panel)
2. Vá em **"Credenciais"**
3. Certifique-se de estar na aba **"TESTE"** (não "PRODUÇÃO")
4. Copie o **Access Token** (começa com `TEST-`)
5. Cole no `.env.local` como `MERCADOPAGO_ACCESS_TOKEN`

## 🔔 Webhook de TESTE:

1. No Dashboard, vá em **"Notificações" > "Webhooks"**
2. Certifique-se de estar no **"Modo de teste"**
3. Configure a URL do webhook (use ngrok para localhost):
   ```
   https://sua-url-ngrok.ngrok-free.app/api/mercadopago-webhook
   ```
4. Copie o **Secret Signature** que aparece no campo
5. Cole no `.env.local` como `MERCADOPAGO_WEBHOOK_SECRET`

## 💳 Cartões de Teste:

Use estes cartões para testar pagamentos:

- **Aprovado:**
  - Número: `5031 4332 1540 6351`
  - CVV: `123`
  - Vencimento: Qualquer data futura (ex: `12/25`)
  - Nome: Qualquer nome

- **Recusado:**
  - Número: `5031 4332 1540 6351`
  - CVV: `123`
  - Vencimento: Qualquer data futura

Mais cartões de teste: [https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/testing](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/testing)

## ⚠️ IMPORTANTE:

1. **Reinicie o servidor** após atualizar o `.env.local`:
   ```bash
   # Pare o servidor (Ctrl+C) e inicie novamente:
   npm run dev
   ```

2. **Verifique se está usando TESTE:**
   - O Access Token deve começar com `TEST-`
   - `MERCADOPAGO_SANDBOX=true` deve estar no `.env.local`

3. **O webhook de teste é diferente do de produção:**
   - Configure um webhook separado no "Modo de teste"
   - Use ngrok para expor localhost durante os testes

## ✅ Como verificar se está funcionando:

1. Após reiniciar o servidor, tente adicionar créditos
2. O checkout deve abrir na URL de sandbox do Mercado Pago
3. Use um cartão de teste para completar o pagamento
4. Verifique os logs do servidor para confirmar o processamento

