# 🛠️ Scripts de Manutenção - Mamãe Review

Scripts automatizados para backup, restore e manutenção do sistema.

---

## 📦 Scripts Disponíveis

### 1. **backupFirestore.ts**

Exporta todas as coleções do Firestore para arquivos JSON compactados.

**Uso:**
```bash
npx tsx scripts/backupFirestore.ts
```

**Saída:**
```
backups/YYYY-MM-DD/
  ├── users.json.gz
  ├── products.json.gz
  ├── reviews.json.gz
  └── metadata.json
```

**Recursos:**
- ✅ Exporta todas as coleções
- ✅ Compacta com gzip (economiza espaço)
- ✅ Gera arquivo de metadados
- ✅ Logs detalhados

---

### 2. **restoreFirestore.ts**

Restaura coleções do Firestore a partir de backup.

**Uso:**
```bash
# Restaurar backup de hoje
npx tsx scripts/restoreFirestore.ts

# Restaurar backup específico
npx tsx scripts/restoreFirestore.ts 2024-01-15

# Forçar sobrescrita
npx tsx scripts/restoreFirestore.ts 2024-01-15 --force
```

**Opções:**
- `--force`: Sobrescreve documentos existentes (padrão: não sobrescreve)

**Recursos:**
- ✅ Restaura de backup específico
- ✅ Proteção contra sobrescrita
- ✅ Confirmação interativa
- ✅ Logs detalhados

---

### 3. **cleanupStorage.ts**

Identifica e remove arquivos órfãos do Firebase Storage.

**Uso:**
```bash
# Apenas listar arquivos órfãos
npx tsx scripts/cleanupStorage.ts

# Deletar arquivos órfãos
npx tsx scripts/cleanupStorage.ts --delete
```

**Recursos:**
- ✅ Identifica arquivos sem referência
- ✅ Calcula espaço desperdiçado
- ✅ Confirmação antes de deletar
- ✅ Relatório detalhado

---

## ⚙️ Configuração

### 1. **Instalar Dependências**

```bash
npm install -D tsx firebase-admin @types/node dotenv
```

### 2. **Configurar Firebase Admin**

#### **Opção A: Service Account (Produção)**

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Vá em **Configurações do Projeto** → **Contas de Serviço**
3. Clique em **Gerar nova chave privada**
4. Salve o arquivo JSON baixado como `service-account.json` na raiz do projeto
5. Adicione ao `.env.local`:
   ```env
   FIREBASE_SERVICE_ACCOUNT_PATH=./service-account.json
   ```

⚠️ **IMPORTANTE:** Nunca commite o arquivo `service-account.json` no Git!

#### **Opção B: Application Default Credentials (Development)**

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Configurar credenciais padrão
gcloud auth application-default login
```

---

## 🤖 Automação

### GitHub Actions

O backup é executado automaticamente todos os dias às 02:00 UTC (23:00 horário de Brasília).

**Arquivo:** `.github/workflows/backup.yml`

**Para ativar:**

1. Configure os secrets no GitHub:
   - `FIREBASE_SERVICE_ACCOUNT`: Conteúdo do arquivo service-account.json
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: ID do projeto Firebase

2. O workflow rodará automaticamente conforme agendado

3. Para executar manualmente:
   - Vá em **Actions** → **Backup Firestore Diário** → **Run workflow**

---

## 📊 Sistema de Logs

### Registrar Ações

```typescript
import { logAction, LOG_ACTIONS } from '@/lib/logAction';

// Exemplo: Criar produto
await logAction({
  action: LOG_ACTIONS.CREATE_PRODUCT,
  userId: user.uid,
  metadata: {
    productId: '123',
    productName: 'Fralda Premium'
  }
});
```

### Helpers Disponíveis

```typescript
// Login
await logLogin(user.uid, user.email, 'google');

// Logout
await logLogout(user.uid, user.email);

// Criar produto
await logProductCreate(user.uid, productId, productName);

// Erro
await logError(user.uid, error, { context: 'product-creation' });
```

### Buscar Logs

```typescript
import { getUserLogs, getLogsByAction, getRecentLogs } from '@/lib/logAction';

// Logs de um usuário
const userLogs = await getUserLogs(userId, 50);

// Logs de uma ação
const loginLogs = await getLogsByAction(LOG_ACTIONS.LOGIN, 100);

// Logs recentes (últimas 24h)
const recentLogs = await getRecentLogs(100);
```

---

## 🔒 Segurança

### Regras do Firestore para Logs

```javascript
match /logs/{logId} {
  // Apenas admin pode ler (implementar lógica de admin)
  allow read: if false;
  
  // Sistema pode escrever
  allow write: if request.auth != null;
}
```

### Boas Práticas

✅ **Nunca exponha credenciais:**
- Service account keys devem ficar fora do repositório
- Use secrets do GitHub Actions

✅ **Limpe backups antigos:**
- Mantenha apenas últimos 30 dias
- Compacte backups antigos

✅ **Monitore uso:**
- Verifique logs regularmente
- Configure alertas para ações suspeitas

✅ **Teste recuperação:**
- Teste restore periodicamente
- Valide integridade dos backups

---

## 📝 Comandos Úteis

```bash
# Backup
npx tsx scripts/backupFirestore.ts

# Restore (sem sobrescrever)
npx tsx scripts/restoreFirestore.ts 2024-01-15

# Restore (forçar sobrescrita)
npx tsx scripts/restoreFirestore.ts 2024-01-15 --force

# Limpar storage (apenas listar)
npx tsx scripts/cleanupStorage.ts

# Limpar storage (deletar)
npx tsx scripts/cleanupStorage.ts --delete

# Ver logs de backup
tail -f scripts/*.log
```

---

## ❓ Troubleshooting

### "Firestore não está configurado"

**Solução:**
- Verifique se `.env.local` existe
- Confirme que `FIREBASE_SERVICE_ACCOUNT_PATH` está correto
- Tente usar `firebase login`

### "Permission denied"

**Solução:**
- Verifique se a service account tem permissões necessárias
- No Firebase Console, vá em **IAM** e adicione role **Firebase Admin**

### Backup falha no GitHub Actions

**Solução:**
- Verifique se secrets estão configurados corretamente
- Veja logs em **Actions** → **[workflow]** → **[run]**
- Confirme que o formato do `FIREBASE_SERVICE_ACCOUNT` está correto

---

## 📚 Recursos

- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Node.js Streams](https://nodejs.org/api/stream.html)
- [Zlib Compression](https://nodejs.org/api/zlib.html)

---

**💡 Dica:** Execute backups antes de mudanças importantes no sistema!

