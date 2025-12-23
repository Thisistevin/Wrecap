# ✅ Checklist de Preparação para Deploy

## 📋 Arquivos para Remover/Revisar

### 1. Arquivos de Documentação (Manter apenas README.md)
- [ ] `DEBUG_PROCESSING.md` - Documentação de debug, pode ser removido
- [ ] `DECORATION_FIX.md` - Documentação temporária, pode ser removido
- [ ] `FIREBASE_ADMIN_SETUP.md` - Pode manter ou mover para README
- [ ] `FIX_FIREBASE_ERROR.md` - Documentação temporária, pode ser removido
- [ ] `QUICK_SETUP.md` - Pode consolidar no README
- [ ] `SETUP.md` - Verificar se ainda é necessário
- [ ] `VERIFICATION_REPORT.md` - Documentação temporária, pode ser removido
- [ ] `WEBHOOK_CONFIG.md` - Verificar se ainda é necessário

### 2. Scripts de Setup
- [ ] `SETUP_FIREBASE_ADMIN.sh` - Script de desenvolvimento, pode remover ou mover para docs

### 3. Pasta de Projeto Antigo
- [ ] `2025-rewind-main 2/` - **REMOVER COMPLETAMENTE** - Projeto Vite antigo não utilizado

### 4. Arquivos Não Utilizados
- [x] ✅ `lib/fileProcessor.ts` - **REMOVIDO** - Não estava sendo usado (processamento é feito direto na API route)

## 🔍 Verificações de Código

### Console Logs
- [x] ✅ Criado sistema de logging (`lib/logger.ts`) que só mostra logs em desenvolvimento
- [x] ✅ Substituídos `console.log` por `logger.log` em arquivos server-side
- [x] ✅ Removidos logs de debug do client-side
- [x] ✅ Console.logs no client-side agora só aparecem em desenvolvimento

### Variáveis de Ambiente
Verificar se todas estão configuradas:
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` ou `GOOGLE_APPLICATION_CREDENTIALS`
- [ ] `GEMINI_API_KEY`
- [ ] `AVOCADOPAY_API_KEY` (produção) ou `NEXT_PUBLIC_SKIP_PAYMENT=true` (dev)

### Configurações de Produção

#### next.config.js
- [x] ✅ `remotePatterns` configurado para Firebase Storage
- [ ] Verificar se precisa de outras configurações

#### .gitignore
- [x] ✅ Arquivos sensíveis ignorados (service account keys)
- [x] ✅ `.env*.local` ignorado
- [x] ✅ Pasta `2025-rewind-main 2/` adicionada ao .gitignore

### Dependências
- [x] ✅ Todas as dependências necessárias instaladas
- [ ] Verificar se há dependências não utilizadas

## 🚨 Problemas Potenciais

### 1. Console Logs em Produção
**Status:** ✅ **RESOLVIDO** - Sistema de logging implementado
**Ação:** Criado `lib/logger.ts` e substituídos todos os console.logs

### 2. Arquivo Não Utilizado
**Status:** ✅ **RESOLVIDO** - Arquivo removido
**Ação:** `lib/fileProcessor.ts` foi removido

### 3. Pasta de Projeto Antigo
**Status:** ⚠️ `2025-rewind-main 2/` ocupa espaço desnecessário
**Ação:** Remover completamente

## 📝 Próximos Passos

1. ✅ **Remover arquivos não utilizados** - `fileProcessor.ts` removido
2. ✅ **Limpar console.logs desnecessários** - Sistema de logging implementado
3. **Testar build de produção**: `npm run build` - Verificar se compila sem erros
4. **Verificar se todas as variáveis de ambiente estão configuradas** - Ver checklist acima
5. **Testar fluxo completo em ambiente de staging** - Login → Upload → Pagamento → Processamento → Visualização
6. **Remover documentação temporária** (opcional) - Ver seção "Arquivos para Remover/Revisar"
7. **Remover pasta `2025-rewind-main 2/`** (opcional) - Projeto antigo não utilizado
8. **Definir URL final do botão "Ver tutorial"** na página de criação (YouTube)

