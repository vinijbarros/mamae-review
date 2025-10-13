import { db } from './firebase';
import { doc, setDoc, getDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

export interface UserProfile {
  name: string;
  email: string;
  createdAt: Timestamp | Date;
  gestationWeek: number | null;
}

/**
 * Cria ou atualiza o perfil do usuário no Firestore
 */
export async function createUserProfile(
  uid: string,
  data: {
    name: string;
    email: string;
    gestationWeek?: number | null;
  }
): Promise<void> {
  if (!db) {
    throw new Error('Firestore não está configurado');
  }

  try {
    const userRef = doc(db, 'users', uid);
    
    await setDoc(userRef, {
      name: data.name,
      email: data.email,
      createdAt: serverTimestamp(),
      gestationWeek: data.gestationWeek ?? null,
    });

    console.log('✅ Perfil do usuário criado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar perfil do usuário:', error);
    throw error;
  }
}

/**
 * Busca o perfil do usuário no Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db) {
    throw new Error('Firestore não está configurado');
  }

  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }

    return null;
  } catch (error) {
    console.error('❌ Erro ao buscar perfil do usuário:', error);
    throw error;
  }
}

/**
 * Atualiza o perfil do usuário no Firestore
 */
export async function updateUserProfile(
  uid: string,
  data: Partial<Omit<UserProfile, 'createdAt'>>
): Promise<void> {
  if (!db) {
    throw new Error('Firestore não está configurado');
  }

  try {
    const userRef = doc(db, 'users', uid);
    
    await setDoc(userRef, data, { merge: true });

    console.log('✅ Perfil do usuário atualizado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao atualizar perfil do usuário:', error);
    throw error;
  }
}

