/**
 * FIRESTORE SECURITY RULES - TESTES
 * 
 * Este arquivo contém funções utilitárias para testar as permissões
 * do Firestore. Use essas funções para validar que as regras de segurança
 * estão funcionando corretamente.
 * 
 * COMO USAR:
 * 1. Certifique-se de estar autenticado
 * 2. Execute as funções de teste no console do navegador
 * 3. Verifique os resultados (permitido/negado)
 * 
 * IMPORTANTE:
 * - Estas funções devem ser usadas apenas em DESENVOLVIMENTO
 * - Não inclua em produção
 * - Use o Firestore Rules Test API para testes automatizados
 */

import { db, auth } from './firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';

// =====================================
// TIPOS
// =====================================

type TestResult = {
  success: boolean;
  message: string;
  error?: unknown;
};

// =====================================
// FUNÇÕES AUXILIARES
// =====================================

/**
 * Verifica se há um usuário autenticado
 */
function getCurrentUser() {
  if (!auth?.currentUser) {
    throw new Error('Nenhum usuário autenticado. Faça login primeiro.');
  }
  return auth.currentUser;
}

/**
 * Formata o resultado do teste
 */
function formatResult(
  testName: string,
  expected: 'permitido' | 'negado',
  actual: 'permitido' | 'negado',
  error?: unknown
): TestResult {
  const success = expected === actual;
  const emoji = success ? '✅' : '❌';
  
  return {
    success,
    message: `${emoji} ${testName}: Esperado ${expected}, Resultado ${actual}`,
    error,
  };
}

// =====================================
// TESTES DE PRODUTOS
// =====================================

/**
 * Testa criação de produto pelo próprio usuário (deve permitir)
 */
export async function testCreateProductAsOwner(): Promise<TestResult> {
  if (!db) {
    return {
      success: false,
      message: 'Firestore não está configurado',
    };
  }

  try {
    const user = getCurrentUser();
    
    const testProduct = {
      name: 'Produto de Teste',
      category: 'Teste',
      description: 'Descrição de teste com mais de 10 caracteres',
      rating: 4.5,
      price: 99.99,
      storeName: 'Loja Teste',
      storeLink: 'https://teste.com',
      imageUrl: 'https://via.placeholder.com/150',
      createdBy: user.uid,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, 'products'), testProduct);
    
    // Limpar após teste
    await deleteDoc(docRef);
    
    return formatResult(
      'Criar produto como proprietário',
      'permitido',
      'permitido'
    );
  } catch (error: unknown) {
    return formatResult(
      'Criar produto como proprietário',
      'permitido',
      'negado',
      error
    );
  }
}

/**
 * Testa criação de produto com createdBy incorreto (deve negar)
 */
export async function testCreateProductWithWrongOwner(): Promise<TestResult> {
  if (!db) {
    return {
      success: false,
      message: 'Firestore não está configurado',
    };
  }

  try {
    getCurrentUser();
    
    const testProduct = {
      name: 'Produto de Teste',
      category: 'Teste',
      description: 'Descrição de teste com mais de 10 caracteres',
      rating: 4.5,
      price: 99.99,
      storeName: 'Loja Teste',
      storeLink: 'https://teste.com',
      imageUrl: 'https://via.placeholder.com/150',
      createdBy: 'outro-usuario-uid', // UID diferente do usuário atual
      createdAt: serverTimestamp(),
    };
    
    await addDoc(collection(db, 'products'), testProduct);
    
    return formatResult(
      'Criar produto com createdBy incorreto',
      'negado',
      'permitido'
    );
  } catch (error: unknown) {
    // Esperamos que falhe
    const firebaseError = error as { code?: string; message?: string };
    if (firebaseError.code === 'permission-denied') {
      return formatResult(
        'Criar produto com createdBy incorreto',
        'negado',
        'negado'
      );
    }
    
    return formatResult(
      'Criar produto com createdBy incorreto',
      'negado',
      'permitido',
      error
    );
  }
}

/**
 * Testa deletar produto de outro usuário (deve negar)
 */
export async function testDeleteProductByNonOwner(): Promise<TestResult> {
  if (!db) {
    return {
      success: false,
      message: 'Firestore não está configurado',
    };
  }

  try {
    getCurrentUser();
    
    // Buscar um produto existente de outro usuário
    const q = query(collection(db, 'products'));
    const querySnapshot = await getDocs(q);
    
    let productToDeleteId: string | null = null;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.createdBy !== auth?.currentUser?.uid) {
        productToDeleteId = doc.id;
      }
    });
    
    if (!productToDeleteId) {
      return {
        success: false,
        message: '⚠️ Nenhum produto de outro usuário encontrado para teste',
      };
    }
    
    // Tentar deletar
    await deleteDoc(doc(db, 'products', productToDeleteId));
    
    return formatResult(
      'Deletar produto de outro usuário',
      'negado',
      'permitido'
    );
  } catch (error: unknown) {
    // Esperamos que falhe
    const firebaseError = error as { code?: string; message?: string };
    if (firebaseError.code === 'permission-denied') {
      return formatResult(
        'Deletar produto de outro usuário',
        'negado',
        'negado'
      );
    }
    
    return formatResult(
      'Deletar produto de outro usuário',
      'negado',
      'permitido',
      error
    );
  }
}

/**
 * Testa atualizar produto com campos inválidos (deve negar)
 */
export async function testUpdateProductWithInvalidData(): Promise<TestResult> {
  if (!db) {
    return {
      success: false,
      message: 'Firestore não está configurado',
    };
  }

  try {
    const user = getCurrentUser();
    
    // Criar produto de teste
    const testProduct = {
      name: 'Produto de Teste',
      category: 'Teste',
      description: 'Descrição de teste com mais de 10 caracteres',
      rating: 4.5,
      price: 99.99,
      storeName: 'Loja Teste',
      storeLink: 'https://teste.com',
      imageUrl: 'https://via.placeholder.com/150',
      createdBy: user.uid,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, 'products'), testProduct);
    
    // Tentar atualizar com rating inválido
    await updateDoc(docRef, {
      rating: 10, // Rating inválido (máximo é 5)
    });
    
    // Limpar
    await deleteDoc(docRef);
    
    return formatResult(
      'Atualizar produto com dados inválidos',
      'negado',
      'permitido'
    );
  } catch (error: unknown) {
    // Esperamos que falhe
    const firebaseError = error as { code?: string; message?: string };
    if (firebaseError.code === 'permission-denied') {
      return formatResult(
        'Atualizar produto com dados inválidos',
        'negado',
        'negado'
      );
    }
    
    return formatResult(
      'Atualizar produto com dados inválidos',
      'negado',
      'permitido',
      error
    );
  }
}

// =====================================
// TESTES DE REVIEWS
// =====================================

/**
 * Testa criar review duplicada (deve negar)
 * Nota: A validação de duplicatas é feita no backend
 */
export async function testDuplicateReview(): Promise<TestResult> {
  if (!db) {
    return {
      success: false,
      message: 'Firestore não está configurado',
    };
  }

  try {
    const user = getCurrentUser();
    
    // Buscar um produto existente
    const productsSnapshot = await getDocs(collection(db, 'products'));
    
    if (productsSnapshot.empty) {
      return {
        success: false,
        message: '⚠️ Nenhum produto encontrado para teste',
      };
    }
    
    const productId = productsSnapshot.docs[0].id;
    
    // Criar primeira review
    const review1 = {
      productId,
      rating: 5,
      comment: 'Primeira review de teste com texto suficiente',
      authorId: user.uid,
      authorName: user.displayName || 'Teste',
      createdAt: serverTimestamp(),
    };
    
    const docRef1 = await addDoc(collection(db, 'reviews'), review1);
    
    // Tentar criar segunda review para o mesmo produto
    const review2 = {
      productId,
      rating: 4,
      comment: 'Segunda review de teste (duplicada) com texto suficiente',
      authorId: user.uid,
      authorName: user.displayName || 'Teste',
      createdAt: serverTimestamp(),
    };
    
    const docRef2 = await addDoc(collection(db, 'reviews'), review2);
    
    // Limpar
    await deleteDoc(docRef1);
    await deleteDoc(docRef2);
    
    return {
      success: false,
      message: '⚠️ Review duplicada foi permitida (validação deve ser no backend)',
    };
  } catch (error: unknown) {
    return formatResult(
      'Criar review duplicada',
      'negado',
      'negado'
    );
  }
}

/**
 * Testa criar review com authorId incorreto (deve negar)
 */
export async function testCreateReviewWithWrongAuthor(): Promise<TestResult> {
  if (!db) {
    return {
      success: false,
      message: 'Firestore não está configurado',
    };
  }

  try {
    getCurrentUser();
    
    // Buscar um produto existente
    const productsSnapshot = await getDocs(collection(db, 'products'));
    
    if (productsSnapshot.empty) {
      return {
        success: false,
        message: '⚠️ Nenhum produto encontrado para teste',
      };
    }
    
    const productId = productsSnapshot.docs[0].id;
    
    const review = {
      productId,
      rating: 5,
      comment: 'Review de teste com authorId incorreto e texto suficiente',
      authorId: 'outro-usuario-uid', // UID diferente
      authorName: 'Outro Usuario',
      createdAt: serverTimestamp(),
    };
    
    await addDoc(collection(db, 'reviews'), review);
    
    return formatResult(
      'Criar review com authorId incorreto',
      'negado',
      'permitido'
    );
  } catch (error: unknown) {
    // Esperamos que falhe
    const firebaseError = error as { code?: string; message?: string };
    if (firebaseError.code === 'permission-denied') {
      return formatResult(
        'Criar review com authorId incorreto',
        'negado',
        'negado'
      );
    }
    
    return formatResult(
      'Criar review com authorId incorreto',
      'negado',
      'permitido',
      error
    );
  }
}

/**
 * Testa atualizar review (deve negar - reviews são imutáveis)
 */
export async function testUpdateReview(): Promise<TestResult> {
  if (!db) {
    return {
      success: false,
      message: 'Firestore não está configurado',
    };
  }

  try {
    const user = getCurrentUser();
    
    // Buscar reviews do usuário
    const q = query(
      collection(db, 'reviews'),
      where('authorId', '==', user.uid)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return {
        success: false,
        message: '⚠️ Nenhuma review do usuário encontrada para teste',
      };
    }
    
    const reviewId = querySnapshot.docs[0].id;
    
    // Tentar atualizar
    await updateDoc(doc(db, 'reviews', reviewId), {
      rating: 3,
    });
    
    return formatResult(
      'Atualizar review (imutável)',
      'negado',
      'permitido'
    );
  } catch (error: unknown) {
    // Esperamos que falhe
    const firebaseError = error as { code?: string; message?: string };
    if (firebaseError.code === 'permission-denied') {
      return formatResult(
        'Atualizar review (imutável)',
        'negado',
        'negado'
      );
    }
    
    return formatResult(
      'Atualizar review (imutável)',
      'negado',
      'permitido',
      error
    );
  }
}

// =====================================
// TESTES DE USUÁRIOS
// =====================================

/**
 * Testa atualizar perfil de outro usuário (deve negar)
 */
export async function testUpdateOtherUserProfile(): Promise<TestResult> {
  if (!db) {
    return {
      success: false,
      message: 'Firestore não está configurado',
    };
  }

  try {
    const user = getCurrentUser();
    
    // Tentar atualizar perfil de outro usuário
    const otherUserId = 'outro-usuario-uid-qualquer';
    
    await updateDoc(doc(db, 'users', otherUserId), {
      name: 'Nome Hackeado',
    });
    
    return formatResult(
      'Atualizar perfil de outro usuário',
      'negado',
      'permitido'
    );
  } catch (error: unknown) {
    // Esperamos que falhe
    const firebaseError = error as { code?: string; message?: string };
    if (firebaseError.code === 'permission-denied') {
      return formatResult(
        'Atualizar perfil de outro usuário',
        'negado',
        'negado'
      );
    }
    
    return formatResult(
      'Atualizar perfil de outro usuário',
      'negado',
      'permitido',
      error
    );
  }
}

// =====================================
// EXECUTAR TODOS OS TESTES
// =====================================

/**
 * Executa todos os testes de segurança
 */
export async function runAllSecurityTests(): Promise<void> {
  console.log('🔒 Iniciando testes de segurança do Firestore...\n');
  
  const tests = [
    // Produtos
    { name: 'Produtos: Criar como proprietário', fn: testCreateProductAsOwner },
    { name: 'Produtos: Criar com createdBy incorreto', fn: testCreateProductWithWrongOwner },
    { name: 'Produtos: Deletar produto de outro usuário', fn: testDeleteProductByNonOwner },
    { name: 'Produtos: Atualizar com dados inválidos', fn: testUpdateProductWithInvalidData },
    
    // Reviews
    { name: 'Reviews: Criar duplicada', fn: testDuplicateReview },
    { name: 'Reviews: Criar com authorId incorreto', fn: testCreateReviewWithWrongAuthor },
    { name: 'Reviews: Atualizar (imutável)', fn: testUpdateReview },
    
    // Usuários
    { name: 'Usuários: Atualizar perfil de outro usuário', fn: testUpdateOtherUserProfile },
  ];
  
  const results: TestResult[] = [];
  
  for (const test of tests) {
    console.log(`\n📝 Executando: ${test.name}`);
    try {
      const result = await test.fn();
      results.push(result);
      console.log(result.message);
      if (result.error) {
        const errorObj = result.error as { message?: string };
        console.log('   Erro:', errorObj.message || result.error);
      }
    } catch (error: unknown) {
      const errorObj = error as { message?: string };
      console.error(`   ❌ Erro ao executar teste: ${errorObj.message || 'Erro desconhecido'}`);
      results.push({
        success: false,
        message: `❌ ${test.name}: Erro ao executar`,
        error,
      });
    }
  }
  
  // Resumo
  const passed = results.filter((r) => r.success).length;
  const total = results.length;
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 RESUMO: ${passed}/${total} testes passaram`);
  console.log('='.repeat(50));
  
  if (passed === total) {
    console.log('✅ Todos os testes de segurança passaram!');
  } else {
    console.log('⚠️ Alguns testes falharam. Revise as regras de segurança.');
  }
}

