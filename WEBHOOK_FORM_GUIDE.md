# 📝 Guia para Preencher o Formulário de Webhook do AvocadoPay

## Campos do Formulário "Criar webhook"

### 1. **Nome do Webhook**
```
wrecap local
```
Ou qualquer nome descritivo que você preferir, como:
- `wrecap desenvolvimento`
- `wrecap localhost`
- `wrecap test`

### 2. **URL**

⚠️ **PROBLEMA:** O AvocadoPay NÃO aceita URLs com `localhost`!

**Solução: Use ngrok para expor seu localhost como URL pública**

#### Passo a Passo:

1. **Instale o ngrok** (se ainda não tiver):
   ```bash
   # macOS
   brew install ngrok
   
   # Ou baixe em: https://ngrok.com/download
   ```

2. **Inicie seu servidor Next.js** (em um terminal):
   ```bash
   npm run dev
   ```

3. **Inicie o ngrok** (em outro terminal):
   ```bash
   ngrok http 3000
   ```

4. **Copie a URL HTTPS** que o ngrok mostrará, algo como:
   ```
   Forwarding  https://abc123-def456.ngrok-free.app -> http://localhost:3000
   ```

5. **Use esta URL no formulário:**
   ```
   https://abc123-def456.ngrok-free.app/api/avocadopay-webhook
   ```
   (Substitua `abc123-def456.ngrok-free.app` pela URL que o ngrok gerou)

⚠️ **IMPORTANTE:** 
- Use a URL **HTTPS** do ngrok (não a HTTP)
- A URL do ngrok muda toda vez que você reinicia o ngrok (na versão gratuita)
- Para uma URL fixa, você precisará de uma conta paga do ngrok

**Para produção, use:**
```
https://seudominio.com/api/avocadopay-webhook
```

### 3. **Secret**

**Opção 1: Gerar um novo secret**
Execute no terminal:
```bash
openssl rand -hex 32
```

**Opção 2: Usar um secret existente**
Se você já tem um secret configurado no `.env.local`, use o mesmo valor.

**Exemplo de secret gerado:**
```
4b976a5abb46f28ada7d03fb388f9b196ce75faaaed864bbb338b567fde73cea
```

⚠️ **CRÍTICO:** 
- O secret que você colocar aqui DEVE ser o MESMO que está no seu `.env.local` como `AVOCADOPAY_WEBHOOK_SECRET`
- Se forem diferentes, a verificação de assinatura falhará

### 4. **Selecione os Eventos**

Selecione os eventos relacionados a pagamentos confirmados. Procure por:
- ✅ **billing.paid** (Cobrança paga)
- ✅ **payment.paid** (Pagamento confirmado)
- ✅ **paid** (Status de pagamento)

Ou qualquer evento que indique que o pagamento foi confirmado.

## 📋 Resumo - Valores para Copiar e Colar

### Para Desenvolvimento Local (com ngrok):

**Nome:**
```
wrecap local
```

**URL:**
```
https://SUA_URL_NGROK.ngrok-free.app/api/avocadopay-webhook
```
(Substitua `SUA_URL_NGROK` pela URL que o ngrok gerou)

**Secret:**
```
[Gere um secret com: openssl rand -hex 32]
[Ou use um secret existente do seu .env.local]
```

**Eventos:**
- billing.paid
- payment.paid
- paid

## ✅ Após Salvar o Webhook

1. **Copie o secret** que você usou no formulário
2. **Adicione ao seu `.env.local`:**
   ```env
   AVOCADOPAY_WEBHOOK_SECRET=seu_secret_aqui
   ```
3. **Reinicie o servidor** para carregar a nova variável de ambiente
4. **Teste o webhook** fazendo um pagamento de teste

## 🔍 Verificando se Está Funcionando

Após configurar, você pode verificar nos logs do servidor quando um webhook for recebido:
```
📥 AvocadoPay webhook received
✅ Webhook signature verified
💰 Payment confirmed for retrospective: xxx
```

Se aparecer "Invalid webhook signature", verifique se o secret no dashboard é o mesmo do `.env.local`.

