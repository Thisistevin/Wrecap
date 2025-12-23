# 🔧 Corrigir Erro: auth/unauthorized-domain

## ❌ Erro
```
Firebase: Error (auth/unauthorized-domain)
```

## 🔍 Causa
O domínio `wrecap.com.br` não está autorizado no Firebase Authentication.

## ✅ Solução

### Passo 1: Acessar Firebase Console
1. Acesse: [https://console.firebase.google.com](https://console.firebase.google.com)
2. Selecione o projeto: **wrecap-cb21d**

### Passo 2: Configurar Domínios Autorizados
1. No menu lateral, vá em **Authentication** (Autenticação)
2. Clique na aba **Settings** (Configurações)
3. Role até a seção **Authorized domains** (Domínios autorizados)
4. Clique em **Add domain** (Adicionar domínio)

### Passo 3: Adicionar Domínios
Adicione os seguintes domínios:

1. **`wrecap.com.br`** (domínio de produção)
2. **`www.wrecap.com.br`** (com www, se usar)
3. **`*.vercel.app`** (se a Vercel gerar um subdomínio temporário)

**⚠️ IMPORTANTE:** 
- Não adicione `http://` ou `https://`
- Apenas o domínio: `wrecap.com.br`
- Não adicione barras ou caminhos

### Passo 4: Salvar
1. Clique em **Add** (Adicionar) para cada domínio
2. Os domínios aparecerão na lista
3. As alterações são salvas automaticamente

### Passo 5: Verificar
1. Recarregue a página `wrecap.com.br`
2. Tente fazer login novamente
3. O erro deve desaparecer

## 📋 Domínios que DEVEM estar autorizados:

- ✅ `localhost` (já deve estar - para desenvolvimento)
- ✅ `wrecap.com.br` (produção)
- ✅ `www.wrecap.com.br` (se usar www)
- ✅ `*.vercel.app` (para previews da Vercel)

## 🔍 Verificar Domínios Atuais

Para ver quais domínios estão autorizados:
1. Firebase Console → Authentication → Settings
2. Seção "Authorized domains"
3. Você verá uma lista com:
   - `localhost`
   - `wrecap.com.br` (depois de adicionar)
   - Outros domínios que você adicionar

## ⚠️ Nota Importante

Após adicionar o domínio, pode levar alguns segundos para as alterações serem propagadas. Se o erro persistir:
1. Aguarde 1-2 minutos
2. Limpe o cache do navegador (Ctrl+Shift+Delete ou Cmd+Shift+Delete)
3. Tente novamente

