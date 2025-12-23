# 🔧 Guia de Configuração do Mercado Pago - Passo a Passo

## ⚠️ IMPORTANTE: Configurações Necessárias

Para que o pagamento funcione corretamente, você precisa configurar:

1. ✅ **Webhook** - Para processar pagamentos automaticamente
2. ✅ **URLs de Retorno** - Para redirecionar após o pagamento

## 📋 Passo 1: Configurar Webhook no Mercado Pago

### Para Desenvolvimento (Localhost com ngrok):

1. **Instale o ngrok:**
   ```bash
   brew install ngrok  # macOS
   # ou baixe em https://ngrok.com/download
   ```

2. **Inicie o ngrok:**
   ```bash
   ngrok http 3000
   ```

3. **Copie a URL HTTPS** que aparece (ex: `https://abc123.ngrok-free.app`)

4. **No Dashboard do Mercado Pago:**
   - Acesse: https://www.mercadopago.com.br/developers/panel
   - Vá em: **Sua aplicação** > **Notificações** > **Webhooks**
   - Selecione: **Modo de teste**
   - **URL:** `https://sua-url-ngrok.ngrok-free.app/api/mercadopago-webhook`
   - **Eventos:** Marque ✅ **Pagamentos**
   - **Assinatura secreta:** Copie o secret que aparece
   - Clique em **Salvar configurações**

5. **Adicione ao `.env.local`:**
   ```env
   MERCADOPAGO_WEBHOOK_SECRET=seu_secret_aqui
   ```

### Para Produção:

1. **No Dashboard do Mercado Pago:**
   - Acesse: https://www.mercadopago.com.br/developers/panel
   - Vá em: **Sua aplicação** > **Notificações** > **Webhooks**
   - Selecione: **Modo de produção**
   - **URL:** `https://wrecap.com.br/api/mercadopago-webhook`
   - **Eventos:** Marque ✅ **Pagamentos**
   - **Assinatura secreta:** Copie o secret que aparece
   - Clique em **Salvar configurações**

2. **Adicione ao `.env.local` (ou variáveis de ambiente do servidor):**
   ```env
   MERCADOPAGO_WEBHOOK_SECRET=seu_secret_aqui
   ```

## 📋 Passo 2: Verificar URLs de Retorno

As URLs de retorno são configuradas automaticamente no código, mas você precisa garantir que:

1. **Para desenvolvimento:** Use ngrok para expor o localhost
2. **Para produção:** Use o domínio real (wrecap.com.br)

As URLs configuradas são:
- **Sucesso:** `/payment-success`
- **Falha:** `/?canceled=true`
- **Pendente:** `/payment-success?status=pending`

## 📋 Passo 3: Testar o Webhook

1. **No Dashboard do Mercado Pago:**
   - Vá em: **Webhooks** > Selecione seu webhook
   - Clique em **"Simular notificação"**
   - Verifique os logs do servidor

2. **Verifique os logs:**
   - No terminal onde o Next.js está rodando
   - Deve aparecer: `📥 Mercado Pago webhook received`
   - E depois: `✅ Credits updated: X`

## 🔍 Verificando se Está Funcionando

### Se o webhook NÃO está funcionando:

1. **Verifique se o ngrok está rodando** (para desenvolvimento)
2. **Verifique se a URL do webhook está correta** no dashboard
3. **Verifique se o secret está correto** no `.env.local`
4. **Verifique os logs do servidor** para ver se o webhook está sendo chamado

### Se o redirecionamento NÃO está funcionando:

1. **Após o pagamento, clique em "Ver comprovante"** ou qualquer botão de retorno
2. **Ou acesse manualmente:** `http://localhost:3000/payment-success?payment_id=XXX&status=approved`
3. **A página deve processar o pagamento automaticamente**

## 🚨 Problemas Comuns

### Problema: "Webhook não está sendo chamado"

**Solução:**
- Verifique se o ngrok está rodando (desenvolvimento)
- Verifique se a URL está correta no dashboard
- Verifique se o evento "Pagamentos" está marcado

### Problema: "Créditos não estão sendo adicionados"

**Solução:**
- Verifique os logs do servidor
- Verifique se o webhook está processando corretamente
- Tente acessar `/payment-success` manualmente após o pagamento

### Problema: "Não redireciona após pagamento"

**Solução:**
- O Mercado Pago não redireciona automaticamente sem `auto_return`
- Clique em "Ver comprovante" ou qualquer botão na página de sucesso
- Ou acesse manualmente a URL de retorno

## 📞 Suporte

Se ainda tiver problemas:
1. Verifique os logs do servidor
2. Verifique os logs do webhook no dashboard do Mercado Pago
3. Teste o webhook usando "Simular notificação"

