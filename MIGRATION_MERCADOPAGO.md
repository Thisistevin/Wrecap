# 🔄 Migração para Mercado Pago

## ✅ O que foi feito

1. **Criado `lib/mercadopago.ts`** - Implementação do Mercado Pago Checkout Pro
2. **Atualizado `app/api/checkout-credits/route.ts`** - Agora usa Mercado Pago
3. **Criado `app/api/mercadopago-webhook/route.ts`** - Handler de webhook do Mercado Pago
4. **Atualizado `components/CreateRetrospectiveScreen.tsx`** - Passa email do usuário para checkout
5. **Criado `MERCADOPAGO_SETUP.md`** - Documentação de configuração

## 📋 Variáveis de Ambiente

Atualize seu `.env.local`:

```env
# Remova estas (Asaas/AvocadoPay):
# ASAAS_API_KEY=...
# ASAAS_WEBHOOK_TOKEN=...
# ASAAS_SANDBOX=...
# AVOCADOPAY_API_KEY=...
# AVOCADOPAY_WEBHOOK_SECRET=...

# Adicione estas (Mercado Pago):
MERCADOPAGO_ACCESS_TOKEN=seu_access_token_aqui
MERCADOPAGO_WEBHOOK_SECRET=seu_webhook_secret_aqui
MERCADOPAGO_SANDBOX=true  # true para teste, false para produção
```

## 🔧 Configuração no Dashboard do Mercado Pago

1. **Crie uma conta no Mercado Pago:**
   - Acesse [https://www.mercadopago.com.br](https://www.mercadopago.com.br)

2. **Crie uma aplicação:**
   - Dashboard do Desenvolvedor > Criar aplicação
   - Nome: WRecap
   - Solução: Pagamentos Online

3. **Obtenha o Access Token:**
   - Dashboard > Credenciais
   - Copie o **Access Token** (Test ou Production)
   - Adicione ao `.env.local` como `MERCADOPAGO_ACCESS_TOKEN`

4. **Configure o Webhook:**
   - Dashboard > Notificações > Webhooks
   - Selecione "Modo de teste" ou "Modo de produção"
   - URL: `https://wrecap.com.br/api/mercadopago-webhook` (produção)
   - Ou use ngrok para desenvolvimento: `https://sua-url-ngrok.ngrok-free.app/api/mercadopago-webhook`
   - Eventos: Marque "Pagamentos"
   - Copie o **Secret Signature** (Assinatura secreta) que aparece no campo
   - Adicione ao `.env.local` como `MERCADOPAGO_WEBHOOK_SECRET`
   - Clique em "Salvar configurações"

## 🧪 Testando

1. **Configure o ambiente de teste:**
   ```env
   MERCADOPAGO_SANDBOX=true
   MERCADOPAGO_ACCESS_TOKEN=seu_token_de_teste
   ```

2. **Reinicie o servidor:**
   ```bash
   npm run dev
   ```

3. **Teste o checkout de créditos:**
   - Abra o menu lateral
   - Selecione um valor
   - Clique em "Adicionar créditos"
   - Deve redirecionar para o checkout do Mercado Pago
   - Use cartão de teste: 5031 4332 1540 6351 (CVV: 123)

## 📝 Arquivos que podem ser removidos

Estes arquivos ainda referenciam Asaas/AvocadoPay (podem ser removidos):
- `lib/asaas.ts` - Pode ser removido
- `lib/avocadopay.ts` - Pode ser removido
- `app/api/asaas-webhook/route.ts` - Pode ser removido
- `app/api/avocadopay-webhook/route.ts` - Pode ser removido
- `ASAAS_SETUP.md` - Pode ser removido
- `AVOCADOPAY_SETUP.md` - Pode ser removido

## 💡 Vantagens do Mercado Pago

- ✅ **Múltiplos métodos de pagamento** - Cartão, PIX, Boleto automaticamente
- ✅ **Checkout Pro** - Interface pronta e otimizada
- ✅ **Alta taxa de conversão** - Interface familiar para brasileiros
- ✅ **Documentação completa** - Muito bem documentado
- ✅ **Sandbox robusto** - Fácil de testar

## 🔄 Próximos Passos

1. ✅ Criar conta no Mercado Pago
2. ✅ Obter Access Token
3. ✅ Configurar webhook
4. ✅ Testar checkout no ambiente de teste
5. ✅ Migrar para produção quando estiver tudo funcionando

