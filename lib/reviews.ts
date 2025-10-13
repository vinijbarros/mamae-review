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
 * Cria um novo review para um produto
 */
export async function createReview(data: ReviewInput): Promise<string> {
  if (!db) {
    throw new Error('Firestore não está configurado');
  }

  try {
    const reviewsRef = collection(db, 'reviews');
    
    const reviewDoc = await addDoc(reviewsRef, {
      ...data,
      createdAt: serverTimestamp(),
    });

    console.log('✅ Review criado com sucesso:', reviewDoc.id);

    // Atualiza a média de avaliações do produto
    await updateProductRating(data.productId);

    return reviewDoc.id;
  } catch (error) {
    console.error('❌ Erro ao criar review:', error);
    throw error;
  }
}

/**
 * Busca reviews de um produto
 */
export async function getProductReviews(
  productId: string,
  sortBy: ReviewSortBy = 'recent'
): Promise<Review[]> {
  if (!db) {
    throw new Error('Firestore não está configurado');
  }

  try {
    const reviewsRef = collection(db, 'reviews');
    
    const orderByField = sortBy === 'recent' ? 'createdAt' : 'rating';
    const orderDirection = sortBy === 'recent' ? 'desc' : 'desc';

    const q = query(
      reviewsRef,
      where('productId', '==', productId),
      orderBy(orderByField, orderDirection)
    );

    const querySnapshot = await getDocs(q);
    const reviews: Review[] = [];

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
 * Verifica se o usuário já fez review do produto
 */
export async function hasUserReviewed(
  productId: string,
  userId: string
): Promise<boolean> {
  if (!db) {
    throw new Error('Firestore não está configurado');
  }

  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('productId', '==', productId),
      where('authorId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('❌ Erro ao verificar review:', error);
    throw error;
  }
}

/**
 * Escuta reviews em tempo real
 */
export function subscribeToProductReviews(
  productId: string,
  sortBy: ReviewSortBy = 'recent',
  callback: (reviews: Review[]) => void
): Unsubscribe {
  if (!db) {
    throw new Error('Firestore não está configurado');
  }

  const reviewsRef = collection(db, 'reviews');
  const orderByField = sortBy === 'recent' ? 'createdAt' : 'rating';
  const orderDirection = sortBy === 'recent' ? 'desc' : 'desc';

  const q = query(
    reviewsRef,
    where('productId', '==', productId),
    orderBy(orderByField, orderDirection)
  );

  return onSnapshot(q, (querySnapshot) => {
    const reviews: Review[] = [];
    querySnapshot.forEach((doc) => {
      reviews.push({
        id: doc.id,
        ...doc.data(),
      } as Review);
    });
    callback(reviews);
  });
}

/**
 * Calcula e atualiza a média de avaliações do produto
 */
export async function updateProductRating(productId: string): Promise<void> {
  if (!db) {
    throw new Error('Firestore não está configurado');
  }

  try {
    const reviews = await getProductReviews(productId);
    
    if (reviews.length === 0) {
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    // Atualiza o produto com a nova média
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
 * Calcula estatísticas dos reviews
 */
export function calculateReviewStats(reviews: Review[]): {
  average: number;
  total: number;
  distribution: { [key: number]: number };
} {
  if (reviews.length === 0) {
    return {
      average: 0,
      total: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const total = reviews.length;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  const average = sum / total;

  const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((review) => {
    const rating = Math.round(review.rating);
    if (rating >= 1 && rating <= 5) {
      distribution[rating]++;
    }
  });

  return {
    average: Number(average.toFixed(1)),
    total,
    distribution,
  };
}

