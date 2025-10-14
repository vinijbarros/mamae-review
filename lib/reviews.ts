/**
 * GERENCIAMENTO DE REVIEWS (AVALIAÇÕES)
 * 
 * Este arquivo contém funções para manipular reviews de produtos no Firestore.
 * Reviews são avaliações que usuários deixam em produtos, com rating (1-5 estrelas) e comentário.
 * 
 * ESTRUTURA DO DOCUMENTO (Firestore):
 * reviews/{reviewId}/
 *   - productId: string (ID do produto avaliado)
 *   - authorId: string (UID do usuário autor)
 *   - authorName: string (Nome do autor)
 *   - rating: number (Avaliação 1-5 estrelas)
 *   - comment: string (Comentário textual)
 *   - createdAt: Timestamp (Data de criação)
 * 
 * REGRAS DE NEGÓCIO:
 * - Cada usuário pode fazer APENAS 1 review por produto
 * - Reviews são IMUTÁVEIS (não podem ser editados, apenas deletados)
 * - Ao criar/deletar review, o rating médio do produto é recalculado automaticamente
 * 
 * FLUXO TÍPICO:
 * 1. Usuário visualiza produto -> subscribeToProductReviews() para escutar atualizações em tempo real
 * 2. Usuário quer avaliar -> hasUserReviewed() verifica se já avaliou
 * 3. Usuário cria review -> createReview() + updateProductRating() automático
 * 4. Reviews aparecem na página -> calculateReviewStats() para estatísticas
 * 
 * @module lib/reviews
 */

import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  doc,
  updateDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { Review, ReviewInput, ReviewSortBy } from '@/types/review';

/**
 * Cria um novo review para um produto.
 * 
 * Adiciona o review à coleção 'reviews' e automaticamente atualiza o rating
 * médio do produto. Esta função garante que o rating do produto esteja sempre atualizado.
 * 
 * IMPORTANTE:
 * - Valide hasUserReviewed() ANTES de chamar esta função
 * - O rating deve ser entre 1-5
 * - O comentário deve ter no mínimo 10 caracteres (validar no form)
 * - createdAt é preenchido automaticamente com serverTimestamp()
 * 
 * FLUXO:
 * 1. Adiciona review na coleção 'reviews'
 * 2. Chama updateProductRating() para recalcular a média do produto
 * 
 * @param {ReviewInput} data - Dados do review
 * @param {string} data.productId - ID do produto
 * @param {string} data.authorId - UID do autor
 * @param {string} data.authorName - Nome do autor
 * @param {number} data.rating - Avaliação (1-5)
 * @param {string} data.comment - Comentário (min 10 caracteres)
 * 
 * @returns {Promise<string>} ID do review criado
 * 
 * @throws {Error} Se Firestore não estiver configurado
 * @throws {Error} Se houver erro ao escrever no Firestore
 * 
 * @example
 * ```typescript
 * // Verificar se já avaliou
 * const alreadyReviewed = await hasUserReviewed(productId, user.uid);
 * if (alreadyReviewed) {
 *   alert('Você já avaliou este produto');
 *   return;
 * }
 * 
 * // Criar review
 * const reviewId = await createReview({
 *   productId: 'abc123',
 *   authorId: user.uid,
 *   authorName: user.displayName!,
 *   rating: 5,
 *   comment: 'Produto excelente! Recomendo muito.'
 * });
 * ```
 */
export async function createReview(data: ReviewInput): Promise<string> {
  // Validação: Firestore deve estar configurado
  if (!db) {
    throw new Error('Firestore não está configurado');
  }

  try {
    // Adiciona review à coleção com timestamp automático
    const reviewsRef = collection(db, 'reviews');
    
    const reviewDoc = await addDoc(reviewsRef, {
      ...data,
      createdAt: serverTimestamp(), // Timestamp do servidor
    });

    console.log('✅ Review criado com sucesso:', reviewDoc.id);

    // Atualiza a média de avaliações do produto automaticamente
    // Isso garante que o produto sempre tenha o rating correto
    await updateProductRating(data.productId);

    return reviewDoc.id;
  } catch (error) {
    console.error('❌ Erro ao criar review:', error);
    throw error;
  }
}

/**
 * Busca reviews de um produto específico.
 * 
 * Retorna todos os reviews de um produto, com opção de ordenação por
 * "mais recentes" ou "maior avaliação".
 * 
 * ORDENAÇÃO:
 * - 'recent': Ordena por createdAt DESC (mais recentes primeiro)
 * - 'rating': Ordena por rating DESC (maior avaliação primeiro)
 * 
 * @param {string} productId - ID do produto
 * @param {ReviewSortBy} sortBy - Tipo de ordenação ('recent' | 'rating')
 * 
 * @returns {Promise<Review[]>} Lista de reviews
 * 
 * @throws {Error} Se Firestore não estiver configurado
 * 
 * @example
 * ```typescript
 * // Reviews mais recentes
 * const recentReviews = await getProductReviews('abc123', 'recent');
 * 
 * // Reviews com maior avaliação
 * const topReviews = await getProductReviews('abc123', 'rating');
 * ```
 */
export async function getProductReviews(
  productId: string,
  sortBy: ReviewSortBy = 'recent'
): Promise<Review[]> {
  // Validação: Firestore deve estar configurado
  if (!db) {
    throw new Error('Firestore não está configurado');
  }

  try {
    const reviewsRef = collection(db, 'reviews');
    
    // Define campo e direção de ordenação
    const orderByField = sortBy === 'recent' ? 'createdAt' : 'rating';
    const orderDirection = sortBy === 'recent' ? 'desc' : 'desc';

    // Monta query com filtro e ordenação
    const q = query(
      reviewsRef,
      where('productId', '==', productId),
      orderBy(orderByField, orderDirection)
    );

    // Executa query
    const querySnapshot = await getDocs(q);
    const reviews: Review[] = [];

    // Converte documentos para objetos Review
    querySnapshot.forEach((doc) => {
      reviews.push({
        id: doc.id,
        ...doc.data(),
      } as Review);
    });

    return reviews;
  } catch (error) {
    console.error('❌ Erro ao buscar reviews:', error);
    throw error;
  }
}

/**
 * Verifica se um usuário já fez review de um produto.
 * 
 * Esta função implementa a regra de negócio: "1 review por usuário por produto".
 * SEMPRE chame esta função antes de permitir que o usuário crie um review.
 * 
 * COMO FUNCIONA:
 * - Faz uma query com dois where: productId E authorId
 * - Retorna true se encontrar algum documento (já avaliou)
 * - Retorna false se não encontrar nada (pode avaliar)
 * 
 * @param {string} productId - ID do produto
 * @param {string} userId - UID do usuário
 * 
 * @returns {Promise<boolean>} true se já avaliou, false caso contrário
 * 
 * @throws {Error} Se Firestore não estiver configurado
 * 
 * @example
 * ```typescript
 * // No componente do formulário
 * const canReview = !await hasUserReviewed(productId, user.uid);
 * 
 * if (!canReview) {
 *   toast.error('Você já avaliou este produto');
 *   return;
 * }
 * 
 * // Mostrar formulário...
 * ```
 */
export async function hasUserReviewed(
  productId: string,
  userId: string
): Promise<boolean> {
  // Validação: Firestore deve estar configurado
  if (!db) {
    throw new Error('Firestore não está configurado');
  }

  try {
    const reviewsRef = collection(db, 'reviews');
    
    // Query com dois where para verificar review específico
    const q = query(
      reviewsRef,
      where('productId', '==', productId),
      where('authorId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    
    // Se encontrou algum documento, o usuário já avaliou
    return !querySnapshot.empty;
  } catch (error) {
    console.error('❌ Erro ao verificar review:', error);
    throw error;
  }
}

/**
 * Escuta reviews de um produto em tempo real (real-time listener).
 * 
 * Usa onSnapshot do Firestore para receber atualizações automáticas quando
 * reviews são adicionados, modificados ou removidos. Perfeito para UX responsiva.
 * 
 * QUANDO USAR:
 * - Use em componentes que precisam mostrar reviews atualizados em tempo real
 * - Exemplo: Página de detalhes do produto
 * 
 * IMPORTANTE:
 * - SEMPRE chame o unsubscribe retornado quando o componente desmontar
 * - Isso evita memory leaks e listeners ativos desnecessários
 * 
 * @param {string} productId - ID do produto
 * @param {ReviewSortBy} sortBy - Tipo de ordenação ('recent' | 'rating')
 * @param {Function} callback - Função chamada quando reviews mudam
 * 
 * @returns {Unsubscribe} Função para cancelar a escuta
 * 
 * @throws {Error} Se Firestore não estiver configurado
 * 
 * @example
 * ```typescript
 * // Em um componente React
 * useEffect(() => {
 *   const unsubscribe = subscribeToProductReviews(
 *     productId,
 *     'recent',
 *     (reviews) => {
 *       setReviews(reviews); // Atualiza estado automaticamente
 *     }
 *   );
 * 
 *   // Cleanup: cancela a escuta quando componente desmonta
 *   return () => unsubscribe();
 * }, [productId]);
 * ```
 */
export function subscribeToProductReviews(
  productId: string,
  sortBy: ReviewSortBy = 'recent',
  callback: (reviews: Review[]) => void
): Unsubscribe {
  // Validação: Firestore deve estar configurado
  if (!db) {
    throw new Error('Firestore não está configurado');
  }

  const reviewsRef = collection(db, 'reviews');
  
  // Define campo e direção de ordenação
  const orderByField = sortBy === 'recent' ? 'createdAt' : 'rating';
  const orderDirection = sortBy === 'recent' ? 'desc' : 'desc';

  // Monta query
  const q = query(
    reviewsRef,
    where('productId', '==', productId),
    orderBy(orderByField, orderDirection)
  );

  // onSnapshot retorna uma função de unsubscribe
  return onSnapshot(q, (querySnapshot) => {
    const reviews: Review[] = [];
    
    // Converte documentos para objetos Review
    querySnapshot.forEach((doc) => {
      reviews.push({
        id: doc.id,
        ...doc.data(),
      } as Review);
    });
    
    // Chama callback com reviews atualizados
    callback(reviews);
  });
}

/**
 * Calcula e atualiza a média de avaliações de um produto.
 * 
 * Esta função é chamada automaticamente por createReview(), mas pode ser
 * chamada manualmente se necessário (ex: após deletar um review).
 * 
 * CÁLCULO:
 * 1. Busca todos os reviews do produto
 * 2. Calcula a média (soma / quantidade)
 * 3. Arredonda para 1 casa decimal (ex: 4.3)
 * 4. Atualiza o campo 'rating' do produto no Firestore
 * 
 * IMPORTANTE:
 * - Se não houver reviews, a função retorna sem fazer nada
 * - O rating é arredondado para 1 casa decimal para exibição limpa
 * 
 * @param {string} productId - ID do produto a atualizar
 * 
 * @throws {Error} Se Firestore não estiver configurado
 * 
 * @example
 * ```typescript
 * // Após criar review (chamado automaticamente por createReview)
 * await createReview({...}); // updateProductRating é chamado internamente
 * 
 * // Após deletar review (chamar manualmente)
 * await deleteReview(reviewId);
 * await updateProductRating(productId); // Recalcular média
 * ```
 */
export async function updateProductRating(productId: string): Promise<void> {
  // Validação: Firestore deve estar configurado
  if (!db) {
    throw new Error('Firestore não está configurado');
  }

  try {
    // Busca todos os reviews do produto
    const reviews = await getProductReviews(productId);
    
    // Se não houver reviews, não faz nada
    if (reviews.length === 0) {
      return;
    }

    // Calcula a média
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    // Atualiza o produto com a nova média (arredondada para 1 decimal)
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      rating: Number(averageRating.toFixed(1)),
    });

    console.log(`✅ Rating do produto atualizado: ${averageRating.toFixed(1)}`);
  } catch (error) {
    console.error('❌ Erro ao atualizar rating do produto:', error);
    throw error;
  }
}

/**
 * Calcula estatísticas completas dos reviews de um produto.
 * 
 * Esta é uma função PURA (sem side-effects) que calcula estatísticas
 * úteis para exibição na UI, como média, total e distribuição de estrelas.
 * 
 * RETORNO:
 * - average: Média de rating (0-5, com 1 decimal)
 * - total: Quantidade total de reviews
 * - distribution: Objeto com contagem de cada rating (1-5 estrelas)
 * 
 * USO TÍPICO:
 * - Mostrar "4.5 estrelas (120 avaliações)"
 * - Gráfico de barras com distribuição (quantas pessoas deram 5★, 4★, etc)
 * 
 * @param {Review[]} reviews - Array de reviews para calcular
 * 
 * @returns {Object} Estatísticas calculadas
 * @returns {number} .average - Média de rating (0-5)
 * @returns {number} .total - Total de reviews
 * @returns {Object} .distribution - Distribuição por rating (1-5)
 * 
 * @example
 * ```typescript
 * const reviews = await getProductReviews('abc123');
 * const stats = calculateReviewStats(reviews);
 * 
 * console.log(`Média: ${stats.average} ⭐`);
 * console.log(`Total: ${stats.total} avaliações`);
 * console.log(`5 estrelas: ${stats.distribution[5]} pessoas`);
 * console.log(`4 estrelas: ${stats.distribution[4]} pessoas`);
 * // ...
 * 
 * // Exemplo de resultado:
 * // {
 * //   average: 4.3,
 * //   total: 87,
 * //   distribution: { 1: 2, 2: 5, 3: 10, 4: 30, 5: 40 }
 * // }
 * ```
 */
export function calculateReviewStats(reviews: Review[]): {
  average: number;
  total: number;
  distribution: { [key: number]: number };
} {
  // Se não houver reviews, retorna valores zerados
  if (reviews.length === 0) {
    return {
      average: 0,
      total: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  // Calcula total e média
  const total = reviews.length;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  const average = sum / total;

  // Calcula distribuição (quantas pessoas deram cada rating)
  const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((review) => {
    const rating = Math.round(review.rating); // Arredonda para inteiro (1-5)
    if (rating >= 1 && rating <= 5) {
      distribution[rating]++;
    }
  });

  return {
    average: Number(average.toFixed(1)), // Arredonda para 1 decimal
    total,
    distribution,
  };
}
