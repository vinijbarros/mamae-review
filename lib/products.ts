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
 * Cria um novo produto no Firestore
 */
export async function createProduct(data: ProductInput): Promise<string> {
  if (!db) {
    throw new Error('Firestore não está configurado');
  }

  try {
    const productRef = await addDoc(collection(db, 'products'), {
      ...data,
      createdAt: serverTimestamp(),
    });

    console.log('✅ Produto criado com sucesso:', productRef.id);
    return productRef.id;
  } catch (error) {
    console.error('❌ Erro ao criar produto:', error);
    throw error;
  }
}

/**
 * Busca um produto por ID
 */
export async function getProduct(productId: string): Promise<Product | null> {
  if (!db) {
    throw new Error('Firestore não está configurado');
  }

  try {
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);

    if (productSnap.exists()) {
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
 * Lista produtos do usuário com paginação
 */
export async function getUserProducts(
  userId: string,
  limitCount: number = 10,
  lastDoc?: DocumentSnapshot
): Promise<{ products: Product[]; lastDoc: DocumentSnapshot | null }> {
  if (!db) {
    throw new Error('Firestore não está configurado');
  }

  try {
    let q = query(
      collection(db, 'products'),
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (lastDoc) {
      q = query(
        collection(db, 'products'),
        where('createdBy', '==', userId),
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
 * Lista todos os produtos (para página pública)
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
 * Atualiza um produto
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
 * Deleta um produto
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
 * Busca produtos mais bem avaliados (para feed público)
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
 * Busca produtos com filtros (busca textual e categoria)
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
    let q = query(
      collection(db, 'products'),
      orderBy('rating', 'desc'),
      limit(limitCount)
    );

    // Se houver filtro de categoria, adicionar ao query
    if (category && category !== 'all') {
      q = query(
        collection(db, 'products'),
        where('category', '==', category),
        orderBy('rating', 'desc'),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(q);
    let products: Product[] = [];

    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      } as Product);
    });

    // Filtro de busca textual (client-side) por limitação do Firestore
    if (searchTerm && searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      products = products.filter((product) => {
        return (
          product.name.toLowerCase().includes(searchLower) ||
          product.storeName.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower)
        );
      });
    }

    return products;
  } catch (error) {
    console.error('❌ Erro ao buscar produtos:', error);
    throw error;
  }
}

