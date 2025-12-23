# 🔄 Migração do AvocadoPay para Asaas

## ✅ O que foi feito

1. **Criado `lib/asaas.ts`** - Nova implementação do Asaas
2. **Atualizado `app/api/checkout-credits/route.ts`** - Agora usa Asaas
3. **Criado `app/api/asaas-webhook/route.ts`** - Handler de webhook do Asaas
4. **Criado `ASAAS_SETUP.md`** - Documentação de configuração

## 📋 Variáveis de Ambiente

Atualize seu `.env.local`:

```env
# Remova estas (AvocadoPay):
# AVOCADOPAY_API_KEY=...
# AVOCADOPAY_WEBHOOK_SECRET=...
# NEXT_PUBLIC_AVOCADOPAY_API_URL=...
# NEXT_PUBLIC_AVOCADOPAY_CHECKOUT_URL=...

# Adicione estas (Asaas):
ASAAS_API_KEY=your_asaas_api_key_here
ASAAS_WEBHOOK_TOKEN=your_webhook_token_here
ASAAS_SANDBOX=true  # ou false para produção
```

## 🔧 Configuração no Dashboard do Asaas

1. **Crie uma conta no Asaas:**
   - Produção: [https://www.asaas.com](https://www.asaas.com)
   - Sandbox: [https://sandbox.asaas.com](https://sandbox.asaas.com)

2. **Gere a API Key:**
   - Dashboard > Integrações > API Key
   - Copie a chave e adicione ao `.env.local` como `ASAAS_API_KEY`

3. **Configure o Webhook:**
   - Dashboard > Integrações > Webhooks
   - URL: `https://wrecap.com.br/api/asaas-webhook` (produção)
   - Ou use ngrok para desenvolvimento: `https://sua-url-ngrok.ngrok-free.app/api/asaas-webhook`
   - Eventos: `PAYMENT_CONFIRMED`, `PAYMENT_RECEIVED`
   - Token: Gere um token e adicione ao `.env.local` como `ASAAS_WEBHOOK_TOKEN`

## 🧪 Testando

1. **Configure o ambiente sandbox:**
   ```env
   ASAAS_SANDBOX=true
   ASAAS_API_KEY=sua_key_sandbox
   ```

2. **Reinicie o servidor:**
   ```bash
   npm run dev
   ```

3. **Teste o checkout de créditos:**
   - Abra o menu lateral
   - Selecione um valor
   - Clique em "Adicionar créditos"
   - Deve redirecionar para o checkout do Asaas

## 📝 Arquivos que ainda referenciam AvocadoPay

Estes arquivos ainda têm referências ao AvocadoPay (podem ser removidos ou atualizados):
- `lib/avocadopay.ts` - Pode ser removido após migração completa
- `app/api/avocadopay-webhook/route.ts` - Pode ser removido
- `AVOCADOPAY_SETUP.md` - Pode ser removido ou renomeado para histórico
- `WEBHOOK_FORM_GUIDE.md` - Pode ser atualizado para Asaas
- `WEBHOOK_CONFIG.md` - Pode ser atualizado para Asaas

## ⚠️ Importante

- O Asaas requer um **customer** (cliente) para criar pagamentos
- Atualmente estamos usando string vazia, mas você pode precisar criar clientes primeiro
- Consulte a documentação do Asaas para criar clientes: [https://docs.asaas.com](https://docs.asaas.com)

## 🔄 Próximos Passos

1. Testar checkout de créditos no sandbox
2. Configurar webhook no dashboard do Asaas
3. Testar webhook com ngrok
4. Migrar para produção quando estiver tudo funcionando

