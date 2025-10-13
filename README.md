# 💗 Mamãe Review

> Plataforma de reviews de produtos para mamães gestantes e recentes

## 📑 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Como Executar](#como-executar)
- [PWA - Progressive Web App](#pwa---progressive-web-app)
- [Deploy na Vercel](#deploy-na-vercel)
- [Configuração do Firebase](#configuração-do-firebase)
- [Sistema de Autenticação](#sistema-de-autenticação)
- [CRUD de Produtos](#crud-de-produtos)
- [Sistema de Reviews](#sistema-de-reviews)
- [Feed Público](#feed-público)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Funcionalidades](#funcionalidades)
- [Design e UX](#design-e-ux)

---

## ✨ Sobre o Projeto

O **Mamãe Review** é uma plataforma acolhedora onde mamães gestantes e recentes compartilham reviews de produtos essenciais para a maternidade. Encontre as melhores recomendações da nossa comunidade!

### 🎯 Objetivo

Criar um espaço seguro e confiável onde mamães podem:
- 📝 Compartilhar experiências com produtos
- ⭐ Avaliar produtos de 0 a 5 estrelas
- 🔍 Descobrir produtos recomendados pela comunidade
- 💬 Ajudar outras mamães com informações úteis

---

## 🚀 Tecnologias

- **Next.js 15.5.4** com App Router e Turbopack
- **TypeScript** com tipagem rigorosa
- **TailwindCSS 4** para estilização
- **shadcn/ui** para componentes
- **Firebase** (Auth, Firestore)
- **react-hook-form** + **zod** para validação
- **next-themes** para tema claro/escuro

### 📦 Dependências Principais

```json
{
  "firebase": "^12.4.0",
  "next": "15.5.4",
  "react": "19.1.0",
  "react-hook-form": "^7.65.0",
  "zod": "^4.1.12",
  "@hookform/resolvers": "^5.2.2",
  "date-fns": "^4.1.0"
}
```

---

## 🛠️ Como Executar

### Pré-requisitos

- Node.js 20+ instalado
- npm ou yarn
- Conta no Firebase

### 1. Instalar Dependências

```bash
cd mamae-review
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

**Para upload de imagens (opcional):**

```env
# Cloudinary (recomendado)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=seu_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=seu_preset

# OU Imgur
NEXT_PUBLIC_IMGUR_CLIENT_ID=seu_client_id
```

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

## 📱 PWA - Progressive Web App

O **Mamãe Review** é um **Progressive Web App (PWA)**, o que significa que pode ser instalado como um aplicativo nativo no celular ou desktop!

### ✨ Benefícios do PWA

- 📲 **Instalável:** Adicione à tela inicial do celular
- 🚀 **Rápido:** Cache inteligente para carregamento instantâneo
- 📴 **Offline:** Funciona sem internet (páginas visitadas)
- 🔔 **Push Notifications:** (futuro) Notificações de novos reviews
- 💾 **Leve:** Menos de 5MB vs 50MB+ de apps nativos

### 🔧 Configuração PWA

#### Arquivos Necessários

O projeto já vem configurado com:

- ✅ `/public/manifest.json` - Manifesto do PWA
- ✅ `/public/icon.svg` - Ícone base
- ✅ `next.config.ts` - Configuração do next-pwa
- ✅ Service Workers automáticos

#### Gerar Ícones PNG

Os ícones PWA precisam estar em formato PNG. Veja `GENERATE_ICONS.md` para instruções detalhadas.

**Opção Rápida:**
1. Acesse https://www.pwabuilder.com/imageGenerator
2. Faça upload do `/public/icon.svg`
3. Baixe o ZIP e copie para `/public/`:
   - `icon-192x192.png`
   - `icon-512x512.png`

### 📲 Como Instalar o PWA

#### No Android

1. Abra o site no Chrome
2. Toque no menu (⋮) → "Instalar app"
3. Confirme a instalação
4. O app aparece na tela inicial

#### No iOS

1. Abra no Safari
2. Toque no botão compartilhar (quadrado com seta)
3. Selecione "Adicionar à Tela de Início"
4. Nomeie e confirme

#### No Desktop (Chrome/Edge)

1. Clique no ícone de instalação (⊕) na barra de URL
2. Ou vá em Menu → "Instalar Mamãe Review..."
3. O app abre em janela própria

### 🧪 Testar PWA Localmente

#### 1. Build de Produção

```bash
npm run build
npm start
```

⚠️ PWA só funciona em produção (não em `npm run dev`)

#### 2. Verificar Service Worker

1. Abra DevTools (F12)
2. Vá para **Application**
3. Verifique **Service Workers** (deve estar ativo)
4. Verifique **Manifest** (deve carregar sem erros)

#### 3. Testar Offline

1. Com o app aberto, navegue por algumas páginas
2. No DevTools → Application → Service Workers
3. Marque "Offline"
4. Recarregue a página
5. Páginas visitadas devem carregar normalmente

### 📦 Arquivos Gerados

Após o build, o PWA gera automaticamente:

```
public/
├── sw.js                   # Service Worker
├── workbox-*.js            # Scripts de cache
└── worker-*.js             # Web Workers
```

⚠️ **Estes arquivos estão no `.gitignore` e são gerados a cada build**

### 🎨 Personalizar Manifest

Edite `/public/manifest.json`:

```json
{
  "name": "Seu Nome do App",
  "short_name": "NomeApp",
  "theme_color": "#sua-cor",
  "background_color": "#sua-cor",
  "icons": [
    // seus ícones
  ]
}
```

---

## 🚀 Deploy na Vercel

O **Mamãe Review** está otimizado para deploy na Vercel. Veja o guia completo em **`DEPLOY_VERCEL.md`**.

### 🎯 Deploy Rápido

#### 1. Push para GitHub

```bash
git add .
git commit -m "feat: PWA configurado"
git push origin main
```

#### 2. Importar na Vercel

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Selecione seu repositório
3. Clique em "Import"

#### 3. Configurar Variáveis de Ambiente

Adicione todas as variáveis do Firebase em **Settings → Environment Variables**:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Opcional: Upload de imagens
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=...
```

#### 4. Deploy!

A Vercel automaticamente:
- ✅ Detecta Next.js
- ✅ Instala dependências
- ✅ Roda o build
- ✅ Gera o PWA
- ✅ Configura SSL
- ✅ Fornece URL: `https://seu-app.vercel.app`

### ⚙️ Configurações Importantes

#### Firebase Auth Domains

No Firebase Console, adicione o domínio da Vercel:

1. Authentication → Settings → Authorized domains
2. Adicione: `seu-app.vercel.app`
3. (Adicione também seu domínio customizado, se tiver)

#### Firestore Indexes

Se receber erro sobre índice faltando:
- Clique no link do erro
- Crie o índice no Firebase Console
- Aguarde 5-10 minutos

### 📊 Monitoramento

A Vercel fornece gratuitamente:
- 📈 Analytics de performance
- 🐛 Error tracking
- 📝 Logs em tempo real
- 🌍 Deploy preview para PRs

### 🔄 Deploy Automático

Cada `git push` para `main` = novo deploy automático! 🚀

**Para mais detalhes**, veja o guia completo em **[DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)**

---

## 🔥 Configuração do Firebase

### Passo 1: Criar Projeto

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Criar um projeto"
3. Nome do projeto: `mamae-review`
4. Desabilite Google Analytics (opcional)
5. Crie o projeto

### Passo 2: Adicionar App Web

1. No painel do projeto, clique no ícone `</>` (Web)
2. Nome do app: `Mamae Review Web`
3. **Copie as credenciais** para o `.env.local`

### Passo 3: Habilitar Authentication

1. Vá em **Authentication** → **Sign-in method**
2. Habilite **Email/Password**
3. Habilite **Google** (adicione email de suporte)

### Passo 4: Criar Firestore Database

1. Vá em **Firestore Database** → **Criar banco de dados**
2. Escolha **"Iniciar no modo de teste"**
3. Localização: **"southamerica-east1"** (São Paulo)
4. Clique em **"Ativar"**

### Passo 5: Configurar Regras de Segurança

No Firestore, vá na aba **"Regras"** e cole:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Coleção de teste
    match /_test/{document=**} {
      allow read, write: if true;
    }
    
    // Usuários
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Produtos
    match /products/{productId} {
      allow read: if true;
      allow create: if request.auth != null 
                    && request.resource.data.createdBy == request.auth.uid;
      allow update, delete: if request.auth != null 
                            && resource.data.createdBy == request.auth.uid;
    }
  }
}
```

### 🧪 Testar Conexão

```typescript
import { testFirestoreConnection } from '@/lib/firebase-test';

const isConnected = await testFirestoreConnection();
console.log(isConnected ? '✅ Conectado!' : '❌ Erro');
```

---

## 🔐 Sistema de Autenticação

Sistema completo de autenticação com Firebase Auth.

### 📄 Páginas

- `/login` - Login com email/senha e Google
- `/signup` - Cadastro com email/senha e Google  
- `/dashboard` - Área privada do usuário (protegida)

### 🎯 Funcionalidades

- ✅ Login com email e senha
- ✅ Cadastro com email e senha
- ✅ Login/cadastro com Google (popup)
- ✅ Proteção de rotas privadas
- ✅ Header dinâmico
- ✅ Armazenamento de perfil no Firestore
- ✅ Validação com Zod
- ✅ Tratamento de erros
- ✅ Loading states

### 🔧 Como Usar

#### Hook de Autenticação

```typescript
"use client";

import { useAuth } from "@/context/AuthContext";

function MeuComponente() {
  const { user, loading, signOut } = useAuth();

  if (loading) return <div>Carregando...</div>;
  if (!user) return <div>Não logado</div>;
  
  return (
    <div>
      <p>Olá, {user.displayName}!</p>
      <button onClick={signOut}>Sair</button>
    </div>
  );
}
```

#### Proteger Rotas

```typescript
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function MinhaRotaPrivada() {
  return (
    <ProtectedRoute>
      <div>Conteúdo privado aqui</div>
    </ProtectedRoute>
  );
}
```

### 📊 Estrutura do Perfil (Firestore)

Coleção: `users/{uid}`

```typescript
{
  name: string;              // Nome completo
  email: string;             // Email
  createdAt: Timestamp;      // Data de criação
  gestationWeek: number | null; // Semana de gestação
}
```

### ⚠️ Tratamento de Erros

**Login:**
- `auth/invalid-credential` → "Credenciais inválidas"
- `auth/too-many-requests` → "Muitas tentativas"

**Cadastro:**
- `auth/email-already-in-use` → "E-mail já em uso"
- `auth/weak-password` → "Senha muito fraca"

**Google:**
- `auth/popup-closed-by-user` → "Login cancelado"

---

## 🛍️ CRUD de Produtos

Sistema completo de gerenciamento de produtos.

### 📁 Estrutura

```
/dashboard/products          # Lista de produtos
/dashboard/products/new      # Criar produto
/dashboard/products/[id]/edit # Editar produto
```

### 🎯 Funcionalidades

1. **✅ Listagem**
   - Tabela responsiva com produtos
   - Paginação (10 por vez)
   - Botão "Carregar Mais"
   - Ações: Editar, Excluir, Link externo

2. **✅ Criar**
   - Formulário com validação
   - Upload de imagem com preview
   - Campos validados com Zod
   - Toast de feedback

3. **✅ Editar**
   - Carrega dados existentes
   - Permite trocar imagem
   - Proteção: apenas criador pode editar

4. **✅ Excluir**
   - Modal de confirmação
   - Exclusão imediata
   - Toast de sucesso/erro

### 📊 Estrutura do Produto (Firestore)

Coleção: `products`

```typescript
{
  id: string;                // ID do documento
  name: string;              // Nome do produto
  category: string;          // Categoria
  description: string;       // Descrição detalhada
  rating: number;            // 0-5 estrelas
  price: number;             // Preço em reais
  storeName: string;         // Nome da loja
  storeLink: string;         // URL da loja (opcional)
  imageUrl: string;          // URL da imagem
  createdBy: string;         // UID do usuário
  createdAt: Timestamp;      // Data de criação
}
```

### 🎨 Categorias Disponíveis

- Alimentação
- Roupas e Acessórios
- Higiene e Cuidados
- Brinquedos
- Móveis e Decoração
- Transporte
- Amamentação
- Gestação
- Outros

### 🖼️ Upload de Imagens

O sistema suporta 3 métodos:

#### 1. Cloudinary (Recomendado) 🌟
- 25GB grátis
- CDN global
- Transformação automática

**Configuração:**
1. Crie conta em https://cloudinary.com/
2. Configure Upload Preset (unsigned)
3. Adicione ao `.env.local`

#### 2. Imgur (Alternativa)
- Grátis e simples
- Registre app em https://api.imgur.com/
3. Adicione Client ID ao `.env.local`

#### 3. Base64 (Fallback)
- Apenas para desenvolvimento
- Usado automaticamente se nenhum serviço configurado

### 📝 Validações

- **Nome:** 3-100 caracteres
- **Categoria:** Obrigatória
- **Descrição:** 10-500 caracteres
- **Avaliação:** 0-5 (aceita decimais)
- **Preço:** Maior que 0
- **Nome da Loja:** 2-100 caracteres
- **Link da Loja:** URL válida (opcional)
- **Imagem:** Máximo 5MB

---

## ⭐ Sistema de Reviews

Sistema completo de avaliações para produtos com atualização em tempo real.

### 🎯 Funcionalidades

1. **✅ Avaliações**
   - Usuário pode avaliar produto (1 vez por produto)
   - Estrelas clicáveis de 1 a 5
   - Comentário obrigatório (min 10 caracteres)
   - Validação com Zod

2. **✅ Listagem**
   - Visualização em tempo real (onSnapshot)
   - Ordenação por recentes ou melhor avaliadas
   - Mostra nome do autor e data
   - Estatísticas detalhadas

3. **✅ Estatísticas**
   - Média de avaliações
   - Total de reviews
   - Distribuição por estrelas (1-5)
   - Gráfico de barras

4. **✅ Atualização Automática**
   - Média do produto atualiza automaticamente
   - Sincronização em tempo real

### 📊 Estrutura do Review (Firestore)

Coleção: `reviews`

```typescript
{
  id: string;              // ID do documento
  productId: string;       // ID do produto
  rating: number;          // 1-5 estrelas
  comment: string;         // Comentário do usuário
  authorId: string;        // UID do autor
  authorName: string;      // Nome do autor
  createdAt: Timestamp;    // Data de criação
}
```

### 🔧 Como Usar

#### Componente de Reviews

```typescript
import { ProductReviews } from "@/components/ProductReviews";

function ProductPage() {
  return (
    <div>
      <h1>Meu Produto</h1>
      <ProductReviews productId="product-id" />
    </div>
  );
}
```

#### Componente de Estrelas

```typescript
import { StarRating } from "@/components/StarRating";

function MyComponent() {
  const [rating, setRating] = useState(0);
  
  return (
    <StarRating
      rating={rating}
      onRatingChange={setRating}
      size="lg"
      showValue
    />
  );
}
```

### 📝 Validações

- **Rating:** 1-5 (obrigatório)
- **Comentário:** 10-500 caracteres
- **Limite:** 1 review por usuário por produto
- **Requer:** Usuário autenticado

### 🔄 Fluxo de Avaliação

```
1. Usuário visualiza produto
2. Clica em "Escrever Avaliação"
3. Seleciona estrelas (1-5)
4. Escreve comentário
5. Envia review
6. Sistema verifica se já avaliou
7. Salva no Firestore
8. Atualiza média do produto automaticamente
9. Outros usuários veem em tempo real
```

### 📊 Página de Detalhes

Acessível em: `/dashboard/products/[id]`

**Conteúdo:**
- Imagem do produto
- Informações (preço, loja, rating)
- Descrição completa
- Sistema de reviews completo
- Estatísticas de avaliações

### 🎨 UI/UX

**Estatísticas:**
- Card com média geral
- Estrelas grandes
- Distribuição visual (barras)
- Total de avaliações

**Formulário:**
- Estrelas clicáveis animadas
- Textarea expansível
- Botões de ação claros
- Loading states

**Lista de Reviews:**
- Card por review
- Nome do autor
- Estrelas + data relativa
- Comentário formatado
- Ordenação selecionável

### ⚠️ Regras de Segurança

No Firestore, configure:

```javascript
match /reviews/{reviewId} {
  allow read: if true;
  allow create: if request.auth != null 
                && request.resource.data.authorId == request.auth.uid;
  allow update, delete: if request.auth != null 
                        && resource.data.authorId == request.auth.uid;
}
```

### 🔍 Funções Disponíveis

**`createReview(data)`**
- Cria novo review
- Atualiza média automaticamente

**`getProductReviews(productId, sortBy)`**
- Busca reviews do produto
- Ordenação: 'recent' ou 'rating'

**`hasUserReviewed(productId, userId)`**
- Verifica se usuário já avaliou
- Retorna: boolean

**`subscribeToProductReviews(productId, sortBy, callback)`**
- Escuta em tempo real (onSnapshot)
- Retorna: Unsubscribe function

**`updateProductRating(productId)`**
- Calcula média de reviews
- Atualiza campo rating do produto

**`calculateReviewStats(reviews)`**
- Calcula estatísticas
- Retorna: average, total, distribution

### 💡 Dicas

- **Tempo Real:** Reviews aparecem instantaneamente para todos
- **Performance:** Use onSnapshot para atualizações automáticas
- **Validação:** Sistema impede múltiplos reviews do mesmo usuário
- **Formatação:** Datas em português (ex: "há 2 horas")

---

## 🌐 Feed Público

### 📋 Visão Geral

A página inicial (`/`) é uma **página pública** que qualquer pessoa pode acessar sem estar logada. Ela exibe os produtos mais bem avaliados da plataforma com recursos de busca e filtros.

### ✨ Funcionalidades

#### 1. **Lista de Produtos Top 10**
- Exibe os 10 produtos com melhor avaliação
- Ordenados por `rating` (maior para menor)
- Mostra imagem, nome, categoria, preço, loja e nota

#### 2. **Busca em Tempo Real**
- Campo de busca com ícone
- Busca por:
  - Nome do produto
  - Categoria
  - Nome da loja
  - Descrição
- **Debounce de 500ms** para otimizar performance
- Feedback visual durante busca

#### 3. **Filtro por Categoria**
- Dropdown com todas as categorias
- Opção "Todas as Categorias"
- Atualização instantânea ao selecionar

#### 4. **Cards de Produto**
- Design responsivo (1-4 colunas)
- Exibe:
  - Imagem do produto
  - Nome
  - Categoria (badge)
  - Avaliação (estrelas + número)
  - Preço (destaque)
  - Loja
- Hover effect com scale
- Link direto para detalhes

#### 5. **Página de Detalhes Pública**
- Rota: `/products/[id]`
- Qualquer pessoa pode visualizar
- Exibe:
  - Imagem grande
  - Informações completas
  - Descrição detalhada
  - Link para loja
  - Seção de reviews (leitura e criação se logado)

### 🎨 Componentes

**`ProductCard`**
```tsx
<ProductCard product={product} />
```
- Card reutilizável
- Animações suaves
- Tratamento de erro de imagem
- Link para detalhes

### 🔍 Funções de Busca

**`getTopRatedProducts(limit)`**
```typescript
const topProducts = await getTopRatedProducts(10);
```
- Retorna produtos ordenados por rating
- Limite configurável

**`searchProducts(searchTerm, category, limit)`**
```typescript
const results = await searchProducts(
  "fralda",
  "Higiene e Cuidados",
  20
);
```
- Busca textual (client-side)
- Filtro de categoria (Firestore)
- Limite configurável

### ⚡ Otimizações

**`useMemo`**
```typescript
const filteredProductsCount = useMemo(() => products.length, [products]);
```
- Evita recálculos desnecessários
- Melhora performance

**`useCallback`**
```typescript
const handleSearchChange = useCallback((e) => {
  setSearchTerm(e.target.value);
}, []);
```
- Evita recriação de funções
- Otimiza re-renders

**Debounce**
```typescript
useEffect(() => {
  const handler = setTimeout(() => {
    setDebouncedSearchTerm(searchTerm);
  }, 500);
  return () => clearTimeout(handler);
}, [searchTerm]);
```
- Reduz chamadas ao Firestore
- Melhora UX

### 📱 Responsividade

Grid adaptável:
- **Mobile:** 1 coluna
- **Tablet:** 2 colunas
- **Desktop:** 3 colunas
- **Large:** 4 colunas

### 💡 Estados de UI

- **Loading:** Spinner + mensagem
- **Empty State:** Ícone + mensagem amigável
- **Resultados:** Grid de cards
- **Contador:** "X produtos encontrados"

---

## 📁 Estrutura do Projeto

```
mamae-review/
├── app/
│   ├── login/page.tsx           # Login
│   ├── signup/page.tsx          # Cadastro
│   ├── dashboard/
│   │   ├── page.tsx             # Dashboard
│   │   └── products/
│   │       ├── page.tsx         # Lista de produtos (privada)
│   │       ├── new/page.tsx     # Criar produto
│   │       └── [id]/
│   │           ├── page.tsx     # Detalhes (privada)
│   │           └── edit/page.tsx # Editar produto
│   ├── products/
│   │   └── [id]/page.tsx        # Detalhes públicos
│   ├── layout.tsx               # Layout raiz
│   ├── page.tsx                 # Home / Feed Público
│   └── globals.css              # Estilos globais
│
├── components/
│   ├── Header.tsx               # Header dinâmico
│   ├── ProtectedRoute.tsx       # Proteção de rotas
│   ├── ProductCard.tsx          # Card de produto
│   ├── ProductReviews.tsx       # Sistema de reviews
│   ├── StarRating.tsx           # Componente de estrelas
│   ├── theme-toggle.tsx         # Toggle tema
│   └── ui/                      # shadcn/ui components
│
├── context/
│   ├── AuthContext.tsx          # Contexto de autenticação
│   └── theme-provider.tsx       # Provider de tema
│
├── lib/
│   ├── firebase.ts              # Configuração Firebase
│   ├── firebase-test.ts         # Teste de conexão
│   ├── user.ts                  # Funções de usuário
│   ├── products.ts              # Funções CRUD produtos + busca
│   ├── reviews.ts               # Funções CRUD reviews
│   ├── upload.ts                # Upload de imagens
│   └── utils.ts                 # Utilidades
│
├── types/
│   ├── product.ts               # Tipos TypeScript produtos
│   └── review.ts                # Tipos TypeScript reviews
│
├── .env.local                   # Variáveis de ambiente (criar!)
├── .gitignore
├── firestore.rules              # Regras do Firestore
├── package.json
└── README.md                    # Este arquivo
```

---

## 📱 Funcionalidades

### ✅ Implementado

- **Autenticação:**
  - Login com email/senha
  - Login com Google
  - Cadastro de usuários
  - Proteção de rotas
  - Perfil no Firestore

- **Produtos:**
  - Criar produtos
  - Listar produtos
  - Editar produtos
  - Excluir produtos
  - Paginação
  - Upload de imagens
  - Página de detalhes (privada e pública)

- **Reviews:**
  - Avaliar produtos (1-5 estrelas)
  - Escrever comentários
  - Visualizar em tempo real
  - Estatísticas de avaliações
  - Ordenação (recentes/melhor avaliadas)
  - 1 review por usuário por produto
  - Atualização automática da média

- **Feed Público:**
  - Página inicial com top 10 produtos
  - Busca em tempo real (nome, categoria, loja)
  - Filtro por categoria (dropdown)
  - Cards de produtos com imagem, nota, preço
  - Debounce na busca (500ms)
  - Loading states
  - Página de detalhes pública (/products/[id])

- **UI/UX:**
  - Interface acolhedora
  - Tema claro/escuro
  - Design responsivo
  - Loading states
  - Toast notifications
  - Modal de confirmação
  - Otimizações com useMemo e useCallback

### 🚧 Próximos Passos

- Sistema de favoritos
- Perfil completo do usuário
- Upload de múltiplas imagens
- Sistema de tags
- Notificações de novos reviews
- Moderação de comentários
- Compartilhamento em redes sociais

---

## 🎨 Design e UX

### Paleta de Cores

- **Primária:** Rosa pastel (#FADADD)
- **Secundária:** Verde menta (#C9E4CA)
- **Neutra:** Cinza claro (#F8F9FA)
- **Texto:** Cinza escuro (#333333)
- **Acento:** Amarelo suave (#FFE8A1)

### Tipografia

- **Títulos:** Poppins (legível e moderna)
- **Corpo:** Nunito (amigável e clara)
- **Destaques:** font-weight 600

### Componentes Visuais

- Bordas arredondadas (~1.25rem)
- Sombras sutis (0 2px 8px rgba(0,0,0,0.08))
- Espaços generosos
- Animações suaves
- Microinterações

### Mobile-First

- Layout responsivo
- Cards verticais com toque confortável
- Menu inferior com ícones grandes
- Experiência otimizada para celular

---

## 🐛 Troubleshooting

### Firebase não está configurado

**Solução:**
- Verifique se o `.env.local` existe
- Confirme que todas as variáveis estão preenchidas
- Reinicie o servidor (`Ctrl+C` e `npm run dev`)

### Erro: "auth/invalid-api-key"

**Solução:**
- API Key incorreta no `.env.local`
- Copie novamente do Firebase Console

### Erro: "Permission denied" no Firestore

**Solução:**
- Configure as regras de segurança
- Verifique se o usuário está autenticado
- Confirme que o `createdBy` é o UID correto

### Upload de imagem não funciona

**Solução:**
- Configure Cloudinary ou Imgur
- Adicione credenciais ao `.env.local`
- Sistema usa Base64 como fallback (dev apenas)

### Porta 3000 em uso

**Solução:**
```bash
npm run dev -- -p 3001
```

---

## 🤝 Contribuindo

Este projeto foi desenvolvido seguindo as melhores práticas de UX para o público de mamães gestantes e recentes.

### Diretrizes

- Código tipado e organizado
- Componentes reutilizáveis
- Design responsivo
- Acessibilidade (contraste e labels)
- Cores suaves e acolhedoras
- Feedback visual consistente

---

## 📄 Licença

MIT License

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique a seção [Troubleshooting](#troubleshooting)
2. Consulte a [Documentação do Firebase](https://firebase.google.com/docs)
3. Revise os [Issues do Next.js](https://github.com/vercel/next.js/issues)

---

**💗 Feito com amor para mamães! 🤱**
