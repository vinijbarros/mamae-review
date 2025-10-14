# 💗 Mamãe Review

> Plataforma de reviews de produtos para mamães gestantes e recentes

## 📑 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Como Executar](#como-executar)
- [Configuração do Firebase](#configuração-do-firebase)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Funcionalidades](#funcionalidades)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Troubleshooting](#troubleshooting)

---

## ✨ Sobre o Projeto

O **Mamãe Review** é uma plataforma onde mamães gestantes e recentes compartilham reviews de produtos essenciais para a maternidade.

**Principais recursos:**
- 📝 Compartilhar experiências com produtos
- ⭐ Avaliar produtos de 1 a 5 estrelas
- 🔍 Descobrir produtos recomendados pela comunidade
- 💬 Comentários e reviews detalhados
- 🔐 Sistema de autenticação completo
- 📱 Progressive Web App (PWA)

---

## 🚀 Tecnologias

- **Next.js 15.5.4** - App Router + Turbopack
- **TypeScript** - Tipagem rigorosa
- **TailwindCSS 4** - Estilização
- **shadcn/ui** - Componentes UI
- **Firebase** - Auth + Firestore + Analytics
- **react-hook-form + zod** - Formulários e validação

---

## 🛠️ Como Executar

### Pré-requisitos

- Node.js 20+ instalado
- npm ou yarn
- Conta no Firebase (gratuita)

### 1. Clonar e Instalar

```bash
git clone <seu-repositorio>
cd mamae-review
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Firebase (obrigatório)
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id

# Upload de imagens (opcional)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=seu_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=seu_preset
```

**Como obter credenciais do Firebase:**
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Crie um projeto (ou use existente)
3. Vá em **Configurações do Projeto** → **Seus aplicativos**
4. Copie as credenciais para o `.env.local`

### 3. Executar em Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

### 4. Build para Produção

```bash
npm run build
npm start
```

---

## 🔥 Configuração do Firebase

### Passo 1: Criar Projeto

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Criar um projeto"
3. Siga o assistente de configuração

### Passo 2: Habilitar Serviços

#### Authentication
1. Vá em **Authentication** → **Sign-in method**
2. Habilite:
   - **Email/Password**
   - **Google** (adicione email de suporte)

#### Firestore Database
1. Vá em **Firestore Database** → **Criar banco de dados**
2. Escolha **"Iniciar no modo de teste"**
3. Localização: **southamerica-east1** (São Paulo)

#### Regras de Segurança

No Firestore, vá na aba **Regras** e cole o conteúdo do arquivo `firestore.rules` do projeto.

**Regras básicas:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Produtos
    match /products/{productId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null 
                            && resource.data.createdBy == request.auth.uid;
    }
    
    // Reviews
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow delete: if request.auth != null 
                    && resource.data.authorId == request.auth.uid;
    }
  }
}
```

### Passo 3: Configurar Domínios Autorizados

Se for fazer deploy:
1. **Authentication** → **Settings** → **Authorized domains**
2. Adicione seu domínio (ex: `seu-app.vercel.app`)

---

## 📁 Estrutura do Projeto

```
mamae-review/
├── app/                      # Rotas Next.js (App Router)
│   ├── page.tsx             # Home / Feed público
│   ├── login/               # Página de login
│   ├── signup/              # Página de cadastro
│   ├── dashboard/           # Dashboard (privado)
│   │   └── products/        # Gerenciamento de produtos
│   └── products/[id]/       # Detalhes públicos do produto
│
├── components/              # Componentes React
│   ├── Header.tsx           # Cabeçalho com navegação
│   ├── ProtectedRoute.tsx   # HOC para rotas privadas
│   ├── ProductCard.tsx      # Card de produto
│   ├── ProductReviews.tsx   # Sistema de reviews
│   └── ui/                  # Componentes shadcn/ui
│
├── context/                 # Contexts React
│   ├── AuthContext.tsx      # Autenticação global
│   └── theme-provider.tsx   # Tema claro/escuro
│
├── lib/                     # Funções utilitárias
│   ├── firebase.ts          # Config Firebase Client
│   ├── user.ts              # CRUD de usuários
│   ├── products.ts          # CRUD de produtos
│   ├── reviews.ts           # CRUD de reviews
│   └── upload.ts            # Upload de imagens
│
├── scripts/                 # Scripts de manutenção
│   ├── firebase-admin.ts    # Config Firebase Admin
│   ├── backupFirestore.ts   # Backup do banco
│   └── restoreFirestore.ts  # Restaurar backup
│
├── types/                   # TypeScript types
│   ├── product.ts           # Tipos de produtos
│   └── review.ts            # Tipos de reviews
│
├── .env.local              # Variáveis de ambiente (criar!)
├── firestore.rules         # Regras de segurança
├── next.config.ts          # Config Next.js
├── package.json            # Dependências
└── tailwind.config.ts      # Config Tailwind
```

---

## 📱 Funcionalidades

### ✅ Implementado

**Autenticação:**
- Login com email/senha
- Login com Google
- Cadastro de usuários
- Proteção de rotas privadas
- Perfil de usuário no Firestore

**Produtos:**
- Criar, listar, editar e deletar produtos
- Upload de imagens (Cloudinary/Imgur/Base64)
- Paginação de listagem
- Busca e filtros
- Página de detalhes

**Reviews:**
- Avaliar produtos (1-5 estrelas)
- Escrever comentários
- 1 review por usuário por produto
- Atualização automática de média
- Visualização em tempo real (onSnapshot)
- Estatísticas de avaliações

**UI/UX:**
- Design responsivo (mobile-first)
- Tema claro/escuro
- Loading states e skeleton loaders
- Toast notifications
- Animações com Framer Motion
- Progressive Web App (PWA)

**Segurança:**
- Regras de segurança no Firestore
- Validação com Zod
- Autenticação obrigatória para ações sensíveis
- Firebase Security Rules

---

## 🔧 Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev          # Iniciar servidor de desenvolvimento
npm run build        # Build de produção
npm start            # Iniciar servidor de produção
npm run lint         # Executar linter
```

### Manutenção (Firebase Admin SDK)

⚠️ **Requer configuração do `service-account.json`**

```bash
# Backup do Firestore
npx tsx scripts/backupFirestore.ts

# Restaurar backup
npx tsx scripts/restoreFirestore.ts 2024-01-15

# Limpeza de arquivos órfãos no Storage
npx tsx scripts/cleanupStorage.ts
```

**Configurar Firebase Admin:**
1. Firebase Console → Configurações → Contas de Serviço
2. Gerar nova chave privada
3. Salvar como `service-account.json` na raiz
4. Adicionar ao `.env.local`:
   ```env
   FIREBASE_SERVICE_ACCOUNT_PATH=./service-account.json
   ```

⚠️ **Nunca commite `service-account.json` no Git!**

---

## 🐛 Troubleshooting

### Firebase não está configurado

**Erro:** `⚠️ Firebase não está configurado`

**Solução:**
- Verifique se o `.env.local` existe na raiz
- Confirme que todas as variáveis estão preenchidas
- Reinicie o servidor (`Ctrl+C` e `npm run dev`)

### Erro: "auth/invalid-api-key"

**Solução:**
- API Key incorreta no `.env.local`
- Copie novamente do Firebase Console

### Erro: "Permission denied" no Firestore

**Solução:**
- Configure as regras de segurança (veja seção [Configuração do Firebase](#configuração-do-firebase))
- Verifique se o usuário está autenticado
- Confirme que o `createdBy` é o UID correto

### Upload de imagem não funciona

**Solução:**
- Configure Cloudinary ou Imgur no `.env.local`
- Sistema usa Base64 como fallback (apenas para desenvolvimento)

### Porta 3000 já em uso

**Solução:**
```bash
npm run dev -- -p 3001
```

### Erro de módulos não encontrados

**Solução:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro de build

**Solução:**
```bash
rm -rf .next
npm run build
```

---

## 📚 Recursos e Links Úteis

### Documentação Oficial
- [Next.js](https://nextjs.org/docs)
- [Firebase](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

### Tutoriais
- [Firebase Auth com Next.js](https://firebase.google.com/docs/auth/web/start)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Next.js App Router](https://nextjs.org/docs/app)

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

MIT License - Veja o arquivo `LICENSE` para detalhes.

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique a seção [Troubleshooting](#troubleshooting)
2. Consulte a [Documentação do Firebase](https://firebase.google.com/docs)
3. Abra uma issue no repositório

---

**💗 Feito com amor para mamães! 🤱**
