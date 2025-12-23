# 🔧 Corrigindo: Checkout do AvocadoPay não aparece

## Problema
O checkout do AvocadoPay não aparece e o usuário é redirecionado diretamente para a página de sucesso.

## Causa
A função `createAvocadoPayCheckout` está pulando o pagamento quando:
1. `NEXT_PUBLIC_SKIP_PAYMENT=true` está configurado no `.env.local`
2. OU `AVOCADOPAY_API_KEY` não está configurada

## Solução

### 1. Verifique seu `.env.local`

Abra o arquivo `.env.local` na raiz do projeto e verifique:

```env
# REMOVA ou COMENTE esta linha para testar o checkout real:
# NEXT_PUBLIC_SKIP_PAYMENT=true

# Certifique-se de que estas variáveis estão configuradas:
AVOCADOPAY_API_KEY=abc_dev_pDZQjfS5TTFHSY12jTDCwSDF
AVOCADOPAY_WEBHOOK_SECRET=webh_dev_6USdmnhjmKuXTBq1AuagB4Dm
NEXT_PUBLIC_AVOCADOPAY_API_URL=https://api.abacatepay.com/v1/checkouts
NEXT_PUBLIC_AVOCADOPAY_CHECKOUT_URL=https://checkout.abacatepay.com
```

### 2. Remova ou comente `NEXT_PUBLIC_SKIP_PAYMENT`

Se você quiser testar o checkout real do AvocadoPay, **remova ou comente** a linha:
```env
# NEXT_PUBLIC_SKIP_PAYMENT=true
```

### 3. Reinicie o servidor

Após alterar o `.env.local`, **reinicie o servidor Next.js**:
```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
npm run dev
```

## Verificando se está funcionando

Após reiniciar, quando você criar uma retrospectiva, você deve ver nos logs do servidor:

**Se o checkout for criado corretamente:**
```
🔄 Creating AvocadoPay checkout...
💰 Amount: 29.9 BRL
📝 Description: Retrospectiva WhatsApp 2025
✅ AvocadoPay checkout created successfully
🔗 Checkout URL: https://checkout.abacatepay.com/...
```

**Se ainda estiver pulando:**
```
⚠️ Development mode: Skipping payment, redirecting to success URL
```

## Modo de Desenvolvimento vs Produção

### Para testar o checkout real:
```env
# NÃO tenha esta linha, ou comente ela:
# NEXT_PUBLIC_SKIP_PAYMENT=true

# Certifique-se de ter:
AVOCADOPAY_API_KEY=abc_dev_pDZQjfS5TTFHSY12jTDCwSDF
```

### Para pular o pagamento (desenvolvimento rápido):
```env
NEXT_PUBLIC_SKIP_PAYMENT=true
```

## Troubleshooting

### Ainda não aparece o checkout?

1. **Verifique os logs do servidor** - Procure por mensagens de erro
2. **Verifique se a API key está correta** - A key deve começar com `abc_dev_` ou `abc_prod_`
3. **Verifique a URL da API** - Deve ser `https://api.abacatepay.com/v1/checkouts`
4. **Veja o console do navegador** - Pode haver erros JavaScript

### Erro na API do AvocadoPay?

Se você ver erros como:
```
❌ AvocadoPay API error: ...
```

Verifique:
- Se a API key está correta
- Se a URL da API está correta
- Se você está no modo de teste (dev) ou produção
- Consulte a documentação do AvocadoPay para o formato correto da requisição

