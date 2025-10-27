/**
 * GERENCIAMENTO DE PRODUTOS (CRUD)
 * 
 * Este arquivo contém todas as funções para manipular produtos no Firestore.
 * Produtos são itens cadastrados por usuários que podem receber reviews e avaliações.
 * 
 * ESTRUTURA DO DOCUMENTO (Firestore):
 * products/{productId}/
 *   - name: string (Nome do produto)
 *   - category: string (Categoria: Alimentação, Roupas, etc)
 *   - description: string (Descrição detalhada)
 *   - rating: number (Avaliação média 0-5, calculada automaticamente)
 *   - price: number (Preço do produto)
 *   - storeName: string (Nome da loja)
 *   - storeLink: string (Link para a loja online)
 *   - imageUrl: string (URL da imagem do produto)
 *   - createdBy: string (UID do usuário que criou)
 *   - createdAt: Timestamp (Data de criação)
 * 
 * FLUXO TÍPICO:
 * 1. Usuário cria produto -> createProduct()
 * 2. Produtos aparecem no feed -> getTopRatedProducts() ou searchProducts()
 * 3. Usuário edita produto -> updateProduct()
 * 4. Usuário deleta produto -> deleteProduct()
 * 
 * @module lib/products
 */

import { db } from './firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  DocumentSnapshot,
} from 'firebase/firestore';
import { Product, ProductInput } from '@/types/product';

/**
 * Cria um novo produto no Firestore.
 * 
 * O produto será adicionado à coleção 'products' com um ID auto-gerado.
 * O campo createdAt é preenchido automaticamente com serverTimestamp().
 * 
 * IMPORTANTE:
 * - O rating inicial deve ser 0 (será atualizado quando houver reviews)
 * - createdBy deve ser o UID do usuário autenticado
 * - Todos os campos são obrigatórios (ver ProductInput type)
 * 
 * @param {ProductInput} data - Dados do produto a ser criado
 * @returns {Promise<string>} ID do produto criado
 * 
 * @throws {Error} Se Firestore não estiver configurado
 * @throws {Error} Se houver erro ao escrever no Firestore
 * 
 * @example
 * ```typescript
 * const productId = await createProduct({
 *   name: "Carrinho de Bebê Premium",
 *   category: "Transporte",
 *   description: "Carrinho leve e dobrável",
 *   rating: 0,
 *   price: 899.90,
 *   storeName: "Bebê Store",
 *   storeLink: "https://bebestore.com/carrinho",
 *   imageUrl: "https://...",
 *   createdBy: user.uid
 * });
 * ```
 */
export async function createProduct(data: ProductInput): Promise<string> {
  // Validação: Firestore deve estar configurado
  if (!db) {
    throw new Error('Firestore não está configurado');
  }

  try {
    // Adiciona o produto à coleção com timestamp automático
    const productRef = await addDoc(collection(db, 'products'), {
      ...data,
      createdAt: serverTimestamp(), // Timestamp do servidor
    });

    console.log('✅ Produto criado com sucesso:', productRef.id);
    return productRef.id;
  } catch (error) {
    console.error('❌ Erro ao criar produto:', error);
    throw error;
  }
}

/**
 * Busca um produto específico por ID.
 * 
 * Retorna o produto completo com todos os campos, ou null se não encontrado.
 * Útil para página de detalhes do produto.
 * 
 * @param {string} productId - ID do produto no Firestore
 * @returns {Promise<Product | null>} Produto ou null se não encontrado
 * 
 * @throws {Error} Se Firestore não estiver configurado
 * 
 * @example
 * ```typescript
 * const product = await getProduct('abc123');
 * if (product) {
 *   console.log(product.name);
 *   console.log(product.rating);
 * }
 * ```
 */
export async function getProduct(productId: string): Promise<Product | null> {
  // Validação: Firestore deve estar configurado
  if (!db) {
    throw new Error('Firestore não está configurado');
  }

  try {
    // Busca o documento específico
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);

    if (productSnap.exists()) {
      // Retorna produto com ID incluso
      return {
        id: productSnap.id,
        ...productSnap.data(),
      } as Product;
    }

    return null;
  } catch (error) {
    console.error('❌ Erro ao buscar produto:', error);
    throw error;
  }
}

/**
 * Lista produtos criados por um usuário específico (com paginação).
 * 
 * Retorna produtos do usuário ordenados por data de criação (mais recentes primeiro).
 * Suporta paginação para carregar mais produtos conforme o usuário rola a tela.
 * 
 * PAGINAÇÃO:
 * - Na primeira chamada, não passa lastDoc
 * - Nas próximas, passa o lastDoc retornado anteriormente
 * - lastDoc é null quando não há mais documentos
 * 
 * @param {string} userId - UID do usuário criador
 * @param {number} limitCount - Quantidade de produtos por página (padrão: 10)
 * @param {DocumentSnapshot} [lastDoc] - Último documento da página anterior
 * 
 * @returns {Promise<{products: Product[], lastDoc: DocumentSnapshot | null}>}
 * 
 * @throws {Error} Se Firestore não estiver configurado
 * 
 * @example
 * ```typescript
 * // Primeira página
 * const { products, lastDoc } = await getUserProducts(user.uid, 10);
 * 
 * // Próxima página
 * const { products: moreProducts, lastDoc: newLastDoc } = 
 *   await getUserProducts(user.uid, 10, lastDoc);
 * ```
 */
export async function getUserProducts(
  userId: string,
  limitCount: number = 10,
  lastDoc?: DocumentSnapshot
): Promise<{ products: Product[]; lastDoc: DocumentSnapshot | null }> {
  // Validação: Firestore deve estar configurado
  if (!db) {
    throw new Error('Firestore não está configurado');
  }

  try {
    // Monta query básica
    let q = query(
      collection(db, 'products'),
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    // Se tem lastDoc, adiciona para paginação
    if (lastDoc) {
      q = query(
        collection(db, 'products'),
        where('createdBy', '==', userId),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc), // Começa após o último documento da página anterior
        limit(limitCount)
      );
    }

    // Executa a query
    const querySnapshot = await getDocs(q);
    const products: Product[] = [];

    // Converte documentos para objetos Product
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      } as Product);
    });

    // Pega o último documento para próxima paginação
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

    return {
      products,
      lastDoc: lastVisible || null,
    };
  } catch (error) {
    console.error('❌ Erro ao listar produtos:', error);
    throw error;
  }
}

/**
 * Lista todos os produtos públicos (com paginação).
 * 
 * Similar ao getUserProducts, mas retorna produtos de todos os usuários.
 * Usado no feed público da home page.
 * 
 * @param {number} limitCount - Quantidade de produtos por página (padrão: 10)
 * @param {DocumentSnapshot} [lastDoc] - Último documento da página anterior
 * 
 * @returns {Promise<{products: Product[], lastDoc: DocumentSnapshot | null}>}
 * 
 * @throws {Error} Se Firestore não estiver configurado
 */
export async function getAllProducts(
  limitCount: number = 10,
  lastDoc?: DocumentSnapshot
): Promise<{ products: Product[]; lastDoc: DocumentSnapshot | null }> {
  if (!db) {
    throw new Error('Firestore não está configurado');
  }

  try {
    let q = query(
      collection(db, 'products'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (lastDoc) {
      q = query(
        collection(db, 'products'),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(q);
    const products: Product[] = [];

    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      } as Product);
    });

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

    return {
      products,
      lastDoc: lastVisible || null,
    };
  } catch (error) {
    console.error('❌ Erro ao listar produtos:', error);
    throw error;
  }
}

/**
 * Atualiza campos específicos de um produto.
 * 
 * Permite atualizar apenas os campos fornecidos sem sobrescrever o documento inteiro.
 * O campo createdAt e createdBy não podem ser alterados.
 * 
 * IMPORTANTE:
 * - Valide permissões no componente (apenas createdBy pode editar)
 * - Não atualize o rating manualmente (use updateProductRating em reviews.ts)
 * 
 * @param {string} productId - ID do produto a atualizar
 * @param {Partial<ProductInput>} data - Campos a atualizar
 * 
 * @throws {Error} Se Firestore não estiver configurado
 * 
 * @example
 * ```typescript
 * // Atualizar apenas preço
 * await updateProduct('abc123', {
 *   price: 799.90
 * });
 * 
 * // Atualizar vários campos
 * await updateProduct('abc123', {
 *   name: "Novo Nome",
 *   price: 799.90,
 *   description: "Nova descrição"
 * });
 * ```
 */
export async function updateProduct(
  productId: string,
  data: Partial<ProductInput>
): Promise<void> {
  if (!db) {
    throw new Error('Firestore não está configurado');
  }

  try {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, data);

    console.log('✅ Produto atualizado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao atualizar produto:', error);
    throw error;
  }
}

/**
 * Deleta um produto do Firestore.
 * 
 * IMPORTANTE:
 * - Valide permissões no componente (apenas createdBy pode deletar)
 * - Reviews associados NÃO são deletados automaticamente (considere implementar)
 * - Esta ação é IRREVERSÍVEL
 * 
 * @param {string} productId - ID do produto a deletar
 * 
 * @throws {Error} Se Firestore não estiver configurado
 * 
 * @example
 * ```typescript
 * // Com confirmação do usuário
 * if (confirm('Tem certeza?')) {
 *   await deleteProduct('abc123');
 * }
 * ```
 */
export async function deleteProduct(productId: string): Promise<void> {
  if (!db) {
    throw new Error('Firestore não está configurado');
  }

  try {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);

    console.log('✅ Produto deletado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao deletar produto:', error);
    throw error;
  }
}

/**
 * Busca produtos mais bem avaliados (Feed Público).
 * 
 * Retorna produtos ordenados por rating (maior primeiro).
 * Usado na home page para mostrar os melhores produtos da comunidade.
 * 
 * NOTA SOBRE ÍNDICES:
 * - Esta query requer um índice composto no Firestore
 * - Se der erro, o Firebase Console mostrará o link para criar o índice
 * - Índice: collection=products, fields=(rating DESC, createdAt DESC)
 * 
 * @param {number} limitCount - Quantidade de produtos (padrão: 10)
 * @returns {Promise<Product[]>} Lista de produtos mais bem avaliados
 * 
 * @throws {Error} Se Firestore não estiver configurado
 * 
 * @example
 * ```typescript
 * // Top 10 produtos
 * const topProducts = await getTopRatedProducts(10);
 * ```
 */
export async function getTopRatedProducts(
  limitCount: number = 10
): Promise<Product[]> {
  if (!db) {
    throw new Error('Firestore não está configurado');
  }

  try {
    // Query simplificada - ordena apenas por rating
    // Para usar orderBy múltiplo, crie o índice composto no Firebase Console
    const q = query(
      collection(db, 'products'),
      orderBy('rating', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const products: Product[] = [];

    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      } as Product);
    });

    return products;
  } catch (error) {
    console.error('❌ Erro ao buscar produtos mais bem avaliados:', error);
    throw error;
  }
}

/**
 * Busca produtos com filtros (busca textual + categoria).
 * 
 * Implementa busca textual e filtro por categoria para o feed público.
 * 
 * LIMITAÇÕES DO FIRESTORE:
 * - Firestore não tem busca full-text nativa
 * - A busca textual é feita no client-side após carregar os documentos
 * - Para produção, considere usar Algolia ou Elasticsearch
 * 
 * BUSCA TEXTUAL (client-side):
 * - Busca em: name, storeName, category, description
 * - Case-insensitive
 * - Busca por substring (contains)
 * 
 * @param {string} [searchTerm] - Termo de busca (opcional)
 * @param {string} [category] - Categoria para filtrar (opcional)
 * @param {number} limitCount - Quantidade máxima de resultados (padrão: 20)
 * 
 * @returns {Promise<Product[]>} Lista de produtos filtrados
 * 
 * @throws {Error} Se Firestore não estiver configurado
 * 
 * @example
 * ```typescript
 * // Buscar "carrinho" em qualquer categoria
 * const results = await searchProducts("carrinho");
 * 
 * // Filtrar apenas categoria "Transporte"
 * const results = await searchProducts("", "Transporte");
 * 
 * // Combinar busca e filtro
 * const results = await searchProducts("carrinho", "Transporte");
 * ```
 */
export async function searchProducts(
  searchTerm?: string,
  category?: string,
  limitCount: number = 20
): Promise<Product[]> {
  if (!db) {
    throw new Error('Firestore não está configurado');
  }

  try {
    // Query simplificada: apenas ordena por rating sem filtros
    // Os filtros serão aplicados client-side para evitar problemas de índice
    const q = query(
      collection(db, 'products'),
      orderBy('rating', 'desc'),
      limit(limitCount * 2) // Carrega mais para compensar filtros client-side
    );

    // Executa query
    const querySnapshot = await getDocs(q);
    const products: Product[] = [];

    // Converte documentos para objetos Product
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      } as Product);
    });

    // Aplicar filtros client-side
    let filteredProducts = products;

    // Filtro por categoria (client-side)
    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter((product) => 
        product.category === category
      );
    }

    // Filtro de busca textual (client-side)
    if (searchTerm && searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      filteredProducts = filteredProducts.filter((product) => {
        return (
          product.name.toLowerCase().includes(searchLower) ||
          product.storeName.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower)
        );
      });
    }

    // Limita o resultado final
    return filteredProducts.slice(0, limitCount);
  } catch (error) {
    console.error('❌ Erro ao buscar produtos:', error);
    throw error;
  }
}

/**
 * Busca produtos relacionados por categoria.
 * 
 * Retorna produtos da mesma categoria, excluindo o produto atual.
 * Usado para mostrar "produtos relacionados" na página de detalhes.
 * 
 * @param {string} category - Categoria dos produtos
 * @param {string} excludeProductId - ID do produto a excluir
 * @param {number} limitCount - Quantidade máxima de produtos (padrão: 4)
 * 
 * @returns {Promise<Product[]>} Lista de produtos relacionados
 * 
 * @throws {Error} Se Firestore não estiver configurado
 * 
 * @example
 * ```typescript
 * // Buscar produtos relacionados
 * const relatedProducts = await getRelatedProducts('Transporte', 'abc123', 4);
 * ```
 */
export async function getRelatedProducts(
  category: string,
  excludeProductId: string,
  limitCount: number = 4
): Promise<Product[]> {
  if (!db) {
    throw new Error('Firestore não está configurado');
  }

  try {
    // Query simplificada: busca produtos da mesma categoria sem ordenação
    // A ordenação será aplicada client-side para evitar problemas de índice
    const q = query(
      collection(db, 'products'),
      where('category', '==', category),
      limit(limitCount + 1) // +1 para compensar a exclusão
    );

    // Executa query
    const querySnapshot = await getDocs(q);
    const products: Product[] = [];

    // Converte documentos para objetos Product
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      } as Product);
    });

    // Filtra o produto atual, ordena por rating e limita a quantidade
    const filteredProducts = products
      .filter(product => product.id !== excludeProductId)
      .sort((a, b) => b.rating - a.rating) // Ordenação client-side por rating
      .slice(0, limitCount);

    return filteredProducts;
  } catch (error) {
    console.error('❌ Erro ao buscar produtos relacionados:', error);
    throw error;
  }
}
