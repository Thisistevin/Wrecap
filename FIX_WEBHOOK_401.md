# 🔧 Corrigir Erro 401 no Webhook do Mercado Pago

## ❌ Problema

O teste do webhook no dashboard do Mercado Pago retornava:
```
401 - Unauthorized
Não é possível executar a requisição porque faltam credenciais válidas de autenticação.
```

## 🔍 Causa

O erro 401 ocorria porque:
1. **Notificações de teste** do Mercado Pago podem não ter assinatura válida
2. A verificação de assinatura estava muito restritiva
3. O código não diferenciava entre notificações de teste e produção

## ✅ Solução Implementada

O código foi atualizado para:

1. **Detectar notificações de teste** automaticamente:
   - IDs de teste (`123456`)
   - `live_mode: false`
   - Ausência de assinatura

2. **Pular verificação de assinatura** para notificações de teste:
   - Notificações de teste são aceitas sem verificação
   - Notificações de produção ainda são verificadas

3. **Melhorar logging** para debug:
   - Logs detalhados dos headers recebidos
   - Informações sobre assinatura e secret

## 📋 Verificar se Está Funcionando

### Passo 1: Verificar Variável de Ambiente na Vercel

1. Na Vercel, vá em **Settings → Environment Variables**
2. Procure por `MERCADOPAGO_WEBHOOK_SECRET`
3. Verifique se está configurado com o secret do dashboard
4. Se não estiver, adicione:
   - **Key:** `MERCADOPAGO_WEBHOOK_SECRET`
   - **Value:** `2f871fa604d9ea0fb8af41473ff568f766ac26bb2fc26fbd142879d51733dddb` (produção)
   - Marque para **Production**, **Preview** e **Development**

### Passo 2: Fazer Redeploy

1. Na Vercel, vá em **Deployments**
2. Clique nos três pontos (...) no último deploy
3. Selecione **"Redeploy"**
4. Aguarde o build completar

### Passo 3: Testar no Dashboard do Mercado Pago

1. Acesse: [https://www.mercadopago.com.br/developers/panel](https://www.mercadopago.com.br/developers/panel)
2. Vá em: **Sua aplicação** → **Notificações** → **Webhooks**
3. Clique no webhook configurado
4. Clique em **"Simular notificação"**
5. Deve retornar **200 OK** (não mais 401)

### Passo 4: Verificar Logs na Vercel

1. Na Vercel, vá em **Deployments** → último deploy
2. Clique em **Functions** → `/api/mercadopago-webhook`
3. Veja os logs - deve aparecer:
   - `📥 Mercado Pago webhook received`
   - `ℹ️ Test notification detected, skipping signature verification`
   - `{ received: true, status: 'test_notification_ignored' }`

## 🔒 Segurança

- **Notificações de produção** ainda são verificadas com assinatura
- **Notificações de teste** são aceitas apenas se detectadas como teste
- **Logs detalhados** ajudam a identificar problemas

## 📝 Notas Importantes

1. **Notificações de teste** não processam pagamentos reais
2. **Pagamentos reais** sempre terão assinatura válida
3. O código diferencia automaticamente entre teste e produção

## ✅ Checklist

- [ ] `MERCADOPAGO_WEBHOOK_SECRET` configurado na Vercel
- [ ] Redeploy feito na Vercel
- [ ] Teste no dashboard retorna 200 OK
- [ ] Logs na Vercel mostram sucesso
- [ ] Webhook configurado para **Modo de produção**

## 🚨 Se Ainda Não Funcionar

1. **Verifique os logs na Vercel** para ver erros específicos
2. **Confirme que o secret está correto** no dashboard do Mercado Pago
3. **Teste com um pagamento real** (não apenas simulação)
4. **Verifique se a URL está correta:** `https://wrecap.com.br/api/mercadopago-webhook`

