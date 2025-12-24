# 🎫 Inicialização Automática de Créditos

## ✅ Funcionalidade Implementada

Quando um usuário cria uma conta ou faz login pela primeira vez, o sistema agora cria automaticamente um registro na coleção `credits` do Firestore com **0 créditos**.

## 🔧 Como Funciona

### 1. Quando o Usuário Faz Login

1. O usuário clica em "Entrar com Google"
2. O Firebase autentica o usuário
3. O `onAuthStateChanged` detecta o novo login
4. A função `initializeUserCredits()` é chamada automaticamente
5. Verifica se já existe um documento de créditos para o usuário
6. Se **não existir**, cria um novo documento com:
   ```json
   {
     "credits": 20,
     "createdAt": "timestamp"
   }
   ```
   
   **Nota:** Novos usuários recebem **20 créditos** como bônus de boas-vindas.

### 2. Quando a Página Carrega com Usuário Já Logado

1. A página verifica se há um usuário logado
2. Se houver, também chama `initializeUserCredits()`
3. Garante que mesmo usuários antigos terão o documento criado

## 📋 Estrutura do Documento

O documento é criado na coleção `credits` com:
- **ID do documento:** `userId` (UID do Firebase Auth)
- **Campos:**
  - `credits` (number): Quantidade de créditos (inicia com 20 para novos usuários)
  - `createdAt` (timestamp): Data de criação

### Exemplo:
```
Collection: credits
Document ID: Oo5qB3dQWmTRiQzlKN6HL5D5jau1
Fields:
  credits: 20
  createdAt: 2025-12-24T00:00:00Z
```

## 🔍 Verificação

### Como Verificar se Está Funcionando:

1. **Criar uma nova conta:**
   - Faça logout
   - Crie uma nova conta com Google
   - Verifique no Firebase Console:
     - Firestore → `credits` collection
     - Deve existir um documento com o `userId` do novo usuário
     - Campo `credits` deve ser `20` (bônus de boas-vindas)

2. **Fazer login com conta existente:**
   - Se a conta já existe mas não tem documento de créditos
   - Ao fazer login, o documento será criado automaticamente

3. **Verificar no código:**
   - Abra o console do navegador
   - Deve aparecer: `✅ Credits initialized for user: [userId]`

## 🛡️ Tratamento de Erros

- Se a inicialização falhar, **não bloqueia o login**
- O erro é logado no console, mas o usuário pode continuar usando o app
- A inicialização é tentada novamente na próxima vez que o usuário fizer login

## 📝 Código Implementado

### `lib/db.ts`
```typescript
export async function initializeUserCredits(userId: string): Promise<boolean> {
  // Verifica se o documento existe
  // Se não existir, cria com 20 créditos (bônus de boas-vindas)
  // Retorna true se criou, false se já existia
}
```

### `app/page.tsx`
```typescript
// Chama initializeUserCredits() quando:
// 1. Usuário faz login (onAuthStateChanged)
// 2. Página carrega com usuário já logado
```

## ✅ Benefícios

1. **Bônus de Boas-Vindas:** Novos usuários recebem 20 créditos automaticamente
2. **Consistência:** Todos os usuários têm um documento de créditos
3. **Simplicidade:** Não precisa verificar se existe antes de atualizar
4. **Automático:** Não requer ação manual do usuário
5. **Seguro:** Não duplica créditos se o documento já existir

## 🔄 Compatibilidade

- ✅ Funciona com usuários novos
- ✅ Funciona com usuários existentes (cria o documento se não existir)
- ✅ Não interfere com créditos já existentes
- ✅ Não duplica documentos

## 🚀 Próximos Passos

Após fazer deploy, todos os novos usuários terão automaticamente um documento de créditos criado. Usuários existentes terão o documento criado na próxima vez que fizerem login.

