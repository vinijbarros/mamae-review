/**
 * GERENCIAMENTO DE PERFIS DE USUÁRIO
 * 
 * Este arquivo contém funções para criar, ler e atualizar perfis de usuários
 * no Firestore. Cada usuário autenticado tem um documento correspondente na
 * coleção 'users' com seus dados de perfil.
 * 
 * ESTRUTURA DO DOCUMENTO (Firestore):
 * users/{uid}/
 *   - name: string (Nome completo do usuário)
 *   - email: string (Email do usuário)
 *   - createdAt: Timestamp (Data de criação da conta)
 *   - gestationWeek: number | null (Semana de gestação, opcional)
 * 
 * FLUXO TÍPICO:
 * 1. Usuário faz signup -> createUserProfile() é chamado
 * 2. Usuário visualiza dashboard -> getUserProfile() carrega os dados
 * 3. Usuário atualiza perfil -> updateUserProfile() salva mudanças
 * 
 * @module lib/user
 */

import { db } from './firebase';
import { doc, setDoc, getDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

/**
 * Interface que define a estrutura de um perfil de usuário.
 * 
 * @property {string} name - Nome completo do usuário
 * @property {string} email - Email do usuário (sincronizado com Firebase Auth)
 * @property {Timestamp | Date} createdAt - Data de criação da conta (auto-gerado)
 * @property {number | null} gestationWeek - Semana de gestação atual (0-42 ou null)
 */
export interface UserProfile {
  name: string;
  email: string;
  createdAt: Timestamp | Date;
  gestationWeek: number | null;
}

/**
 * Cria um novo perfil de usuário no Firestore.
 * 
 * Esta função deve ser chamada imediatamente após o signup do usuário
 * para criar o documento do perfil na coleção 'users'. O UID do Firebase Auth
 * é usado como ID do documento para facilitar buscas.
 * 
 * IMPORTANTE:
 * - Use serverTimestamp() para createdAt (garante consistência)
 * - O documento é criado em users/{uid}
 * - Se já existir, sobrescreve (use com cuidado!)
 * 
 * @param {string} uid - UID do usuário do Firebase Auth
 * @param {Object} data - Dados do perfil
 * @param {string} data.name - Nome completo do usuário
 * @param {string} data.email - Email do usuário
 * @param {number | null} [data.gestationWeek] - Semana de gestação (opcional)
 * 
 * @throws {Error} Se Firestore não estiver configurado
 * @throws {Error} Se houver erro ao escrever no Firestore
 * 
 * @example
 * ```typescript
 * // Após signup com email
 * await createUserProfile(user.uid, {
 *   name: "Maria Silva",
 *   email: "maria@example.com",
 *   gestationWeek: 20
 * });
 * 
 * // Após signup com Google (sem semana de gestação)
 * await createUserProfile(user.uid, {
 *   name: user.displayName!,
 *   email: user.email!
 * });
 * ```
 */
export async function createUserProfile(
  uid: string,
  data: {
    name: string;
    email: string;
    gestationWeek?: number | null;
  }
): Promise<void> {
  // Validação: Firestore deve estar configurado
  if (!db) {
    throw new Error('Firestore não está configurado');
  }

  try {
    // Referência ao documento do usuário (users/{uid})
    const userRef = doc(db, 'users', uid);
    
    // Cria o documento com serverTimestamp para createdAt
    // serverTimestamp() garante que o timestamp seja do servidor, não do cliente
    await setDoc(userRef, {
      name: data.name,
      email: data.email,
      createdAt: serverTimestamp(), // Timestamp do servidor
      gestationWeek: data.gestationWeek ?? null, // Usa null se não fornecido
    });

    console.log('✅ Perfil do usuário criado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar perfil do usuário:', error);
    throw error; // Re-throw para permitir tratamento no componente
  }
}

/**
 * Busca o perfil de um usuário no Firestore.
 * 
 * Retorna os dados do perfil se o documento existir, ou null caso contrário.
 * Útil para carregar dados do usuário no dashboard, por exemplo.
 * 
 * @param {string} uid - UID do usuário do Firebase Auth
 * 
 * @returns {Promise<UserProfile | null>} Dados do perfil ou null se não encontrado
 * 
 * @throws {Error} Se Firestore não estiver configurado
 * @throws {Error} Se houver erro ao ler do Firestore
 * 
 * @example
 * ```typescript
 * // Carregar perfil do usuário logado
 * const profile = await getUserProfile(user.uid);
 * 
 * if (profile) {
 *   console.log(`Nome: ${profile.name}`);
 *   console.log(`Semana: ${profile.gestationWeek || 'Não informada'}`);
 * } else {
 *   console.log('Perfil não encontrado');
 * }
 * ```
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  // Validação: Firestore deve estar configurado
  if (!db) {
    throw new Error('Firestore não está configurado');
  }

  try {
    // Referência ao documento do usuário
    const userRef = doc(db, 'users', uid);
    
    // Busca o documento
    const userSnap = await getDoc(userRef);

    // Verifica se o documento existe
    if (userSnap.exists()) {
      // Retorna os dados com tipo seguro
      return userSnap.data() as UserProfile;
    }

    // Documento não existe
    return null;
  } catch (error) {
    console.error('❌ Erro ao buscar perfil do usuário:', error);
    throw error;
  }
}

/**
 * Atualiza campos específicos do perfil do usuário.
 * 
 * Usa merge: true para atualizar apenas os campos fornecidos sem sobrescrever
 * o documento inteiro. O campo createdAt não pode ser atualizado.
 * 
 * CAMPOS PERMITIDOS:
 * - name: Atualizar nome
 * - email: Atualizar email (também deve atualizar no Auth)
 * - gestationWeek: Atualizar semana de gestação
 * 
 * @param {string} uid - UID do usuário do Firebase Auth
 * @param {Object} data - Campos a atualizar (parcial)
 * 
 * @throws {Error} Se Firestore não estiver configurado
 * @throws {Error} Se houver erro ao atualizar no Firestore
 * 
 * @example
 * ```typescript
 * // Atualizar apenas a semana de gestação
 * await updateUserProfile(user.uid, {
 *   gestationWeek: 25
 * });
 * 
 * // Atualizar nome e semana
 * await updateUserProfile(user.uid, {
 *   name: "Maria Santos",
 *   gestationWeek: 30
 * });
 * ```
 */
export async function updateUserProfile(
  uid: string,
  data: Partial<Omit<UserProfile, 'createdAt'>> // Exclui createdAt das opções
): Promise<void> {
  // Validação: Firestore deve estar configurado
  if (!db) {
    throw new Error('Firestore não está configurado');
  }

  try {
    // Referência ao documento do usuário
    const userRef = doc(db, 'users', uid);
    
    // Atualiza apenas os campos fornecidos (merge: true)
    // merge: true garante que outros campos não sejam deletados
    await setDoc(userRef, data, { merge: true });

    console.log('✅ Perfil do usuário atualizado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao atualizar perfil do usuário:', error);
    throw error;
  }
}

