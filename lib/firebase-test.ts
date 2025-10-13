import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  limit,
  deleteDoc,
  doc
} from 'firebase/firestore';

/**
 * Função de teste para verificar a conexão com o Firestore
 * 
 * Esta função:
 * 1. Escreve um documento de teste na coleção '_test'
 * 2. Lê o documento criado
 * 3. Remove o documento de teste
 * 
 * @returns Promise<boolean> - true se o teste passou, false caso contrário
 */
export async function testFirestoreConnection(): Promise<boolean> {
  if (!db) {
    console.error('❌ Firestore não está configurado');
    return false;
  }

  try {
    console.log('🔥 Iniciando teste de conexão com Firestore...');

    // 1. Criar um documento de teste
    const testData = {
      message: 'Teste de conexão Firebase',
      timestamp: new Date().toISOString(),
      testNumber: Math.random()
    };

    console.log('📝 Escrevendo documento de teste...');
    const docRef = await addDoc(collection(db, '_test'), testData);
    console.log('✅ Documento criado com ID:', docRef.id);

    // 2. Ler documentos da coleção de teste
    console.log('📖 Lendo documentos de teste...');
    const q = query(collection(db, '_test'), limit(5));
    const querySnapshot = await getDocs(q);
    
    console.log(`✅ ${querySnapshot.size} documento(s) encontrado(s)`);
    
    querySnapshot.forEach((doc) => {
      console.log(`  - ${doc.id}:`, doc.data());
    });

    // 3. Limpar - remover o documento de teste
    console.log('🧹 Removendo documento de teste...');
    await deleteDoc(doc(db, '_test', docRef.id));
    console.log('✅ Documento removido com sucesso');

    console.log('🎉 Teste de conexão concluído com sucesso!');
    return true;

  } catch (error) {
    console.error('❌ Erro no teste de conexão:', error);
    
    if (error instanceof Error) {
      console.error('Mensagem:', error.message);
      console.error('Stack:', error.stack);
    }
    
    return false;
  }
}

/**
 * Exemplo de uso:
 * 
 * import { testFirestoreConnection } from '@/lib/firebase-test';
 * 
 * // Em um componente ou API route:
 * const isConnected = await testFirestoreConnection();
 * if (isConnected) {
 *   console.log('Firebase está configurado corretamente!');
 * } else {
 *   console.log('Há problemas na configuração do Firebase');
 * }
 */

