# 🌐 Configurando ngrok para Webhooks Locais

## Por que usar ngrok?

O AvocadoPay (e a maioria dos serviços de pagamento) **não aceita URLs com `localhost`** porque precisa de uma URL pública para enviar webhooks. O ngrok cria um túnel público para seu servidor local.

## 🚀 Instalação Rápida

### macOS
```bash
brew install ngrok
```

### Outros sistemas
Baixe em: [https://ngrok.com/download](https://ngrok.com/download)

## 📝 Passo a Passo

### 1. Inicie seu servidor Next.js
```bash
npm run dev
```
Certifique-se de que está rodando na porta 3000 (ou anote a porta que está usando).

### 2. Em outro terminal, inicie o ngrok
```bash
ngrok http 3000
```

Se seu Next.js estiver em outra porta, ajuste:
```bash
ngrok http 3001  # se estiver na porta 3001
```

### 3. Copie a URL HTTPS

O ngrok mostrará algo assim:
```
Session Status                online
Account                       seu-email@example.com
Version                       3.x.x
Region                        United States (us)
Latency                       45ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123-def456.ngrok-free.app -> http://localhost:3000
```

**Copie a URL HTTPS:** `https://abc123-def456.ngrok-free.app`

### 4. Use no Dashboard do AvocadoPay

No formulário de webhook, use:
```
https://abc123-def456.ngrok-free.app/api/avocadopay-webhook
```

(Substitua `abc123-def456.ngrok-free.app` pela URL que o ngrok gerou)

## ⚠️ Importante

### URL muda a cada reinício
- Na versão **gratuita** do ngrok, a URL muda toda vez que você reinicia o ngrok
- Você precisará **atualizar a URL no dashboard do AvocadoPay** toda vez que reiniciar o ngrok

### URL fixa (pago)
- Com uma conta **paga** do ngrok, você pode ter uma URL fixa
- Útil para desenvolvimento contínuo sem precisar atualizar o dashboard

### Mantenha o ngrok rodando
- O ngrok precisa estar **rodando** enquanto você testa os webhooks
- Se você fechar o ngrok, os webhooks não funcionarão

## 🔍 Verificando se está funcionando

### Interface Web do ngrok
Acesse: `http://127.0.0.1:4040` no navegador para ver:
- Requisições recebidas
- Headers e body das requisições
- Respostas do servidor

### Logs do servidor
Quando um webhook for recebido, você verá nos logs:
```
📥 AvocadoPay webhook received
✅ Webhook signature verified
💰 Payment confirmed for retrospective: xxx
```

## 🛠️ Alternativas ao ngrok

### localtunnel (gratuito, sem cadastro)
```bash
npx localtunnel --port 3000
```

### Cloudflare Tunnel (gratuito)
```bash
# Instalar
npm install -g cloudflared

# Usar
cloudflared tunnel --url http://localhost:3000
```

## 📚 Recursos

- [Documentação do ngrok](https://ngrok.com/docs)
- [Guia de Webhooks do AvocadoPay](AVOCADOPAY_SETUP.md)

