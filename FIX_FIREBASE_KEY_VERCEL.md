# 🔧 Corrigir FIREBASE_SERVICE_ACCOUNT_KEY na Vercel

## ❌ Erro

```
Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Please check the JSON format. 
Error: Unexpected token "", "\"{\"type\": \"... is not valid JSON"
```

## 🔍 Causa

O `FIREBASE_SERVICE_ACCOUNT_KEY` na Vercel está mal formatado. O JSON pode estar:
- Duplamente escapado (com `\"` em vez de `"`)
- Com aspas extras no início/fim
- Com quebras de linha que não foram removidas

## ✅ Solução

### Passo 1: Obter o JSON Correto

1. **Baixe o arquivo de service account do Firebase:**
   - Acesse: [https://console.firebase.google.com/project/wrecap-cb21d/settings/serviceaccounts/adminsdk](https://console.firebase.google.com/project/wrecap-cb21d/settings/serviceaccounts/adminsdk)
   - Clique em **"Generate new private key"** (se necessário)
   - Baixe o arquivo JSON

2. **Abra o arquivo JSON** em um editor de texto

3. **Copie TODO o conteúdo** do arquivo (deve começar com `{` e terminar com `}`)

### Passo 2: Formatar Corretamente para Vercel

**IMPORTANTE:** Na Vercel, o JSON deve estar em **UMA ÚNICA LINHA**, sem quebras de linha.

#### Opção A: Usar um Formatador Online

1. Cole o JSON completo em: [https://jsonformatter.org/](https://jsonformatter.org/)
2. Clique em **"Minify"** ou **"Compact"**
3. Copie o resultado (deve ser uma linha só)

#### Opção B: Usar Terminal (macOS/Linux)

```bash
# Se você tem o arquivo salvo localmente
cat seu-arquivo-firebase.json | jq -c .
```

#### Opção C: Manualmente

1. Abra o arquivo JSON
2. Remova TODAS as quebras de linha
3. Deixe tudo em uma única linha
4. Exemplo correto:
   ```json
   {"type":"service_account","project_id":"wrecap-cb21d","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
   ```

### Passo 3: Atualizar na Vercel

1. **Na Vercel:**
   - Vá em **Settings** → **Environment Variables**
   - Procure por `FIREBASE_SERVICE_ACCOUNT_KEY`
   - Clique em **Edit** (ou Delete e crie novo)

2. **Cole o JSON formatado:**
   - **NÃO** adicione aspas extras
   - **NÃO** adicione `\` antes das aspas
   - Cole o JSON **exatamente como está** (uma linha só)

3. **Marque para:**
   - ✅ Production
   - ✅ Preview  
   - ✅ Development

4. **Clique em Save**

### Passo 4: Fazer Redeploy

1. Na Vercel, vá em **Deployments**
2. Clique nos três pontos (...) no último deploy
3. Selecione **"Redeploy"**
4. Aguarde o build completar

## 🔍 Verificar se Está Correto

### Formato Correto:
```
{"type":"service_account","project_id":"wrecap-cb21d",...}
```

### Formato Incorreto (NÃO FAÇA ISSO):
```
"{'type':'service_account',...}"  ❌ Aspas extras
"{\"type\":\"service_account\",...}"  ❌ Escapado incorretamente
{
  "type": "service_account",  ❌ Com quebras de linha
  ...
}
```

## 🚨 Erros Comuns

### Erro 1: JSON com quebras de linha
**Solução:** Remova todas as quebras de linha, deixe em uma linha só

### Erro 2: Aspas extras no início/fim
**Solução:** Não adicione aspas. O JSON já tem aspas internas.

### Erro 3: Caracteres escapados (`\"`)
**Solução:** Use aspas normais (`"`), não escapadas

### Erro 4: JSON parcial
**Solução:** Copie TODO o conteúdo do arquivo, do `{` inicial ao `}` final

## 📝 Exemplo Visual

**❌ ERRADO:**
```
"{'type':'service_account','project_id':'wrecap-cb21d'}"
```

**✅ CORRETO:**
```
{"type":"service_account","project_id":"wrecap-cb21d","private_key_id":"abc123",...}
```

## ✅ Checklist

- [ ] JSON copiado completo (do `{` ao `}`)
- [ ] Todas as quebras de linha removidas
- [ ] JSON em uma única linha
- [ ] Sem aspas extras no início/fim
- [ ] Sem caracteres `\"` escapados
- [ ] Variável salva na Vercel
- [ ] Marcada para Production, Preview e Development
- [ ] Redeploy feito

## 🔄 Alternativa: Usar Arquivo (Não Recomendado para Vercel)

Se continuar tendo problemas, você pode usar `GOOGLE_APPLICATION_CREDENTIALS` com um arquivo, mas isso requer upload manual e não é recomendado para Vercel. É melhor corrigir o `FIREBASE_SERVICE_ACCOUNT_KEY`.

