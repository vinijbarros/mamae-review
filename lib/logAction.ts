/**
 * SISTEMA DE LOGS E AUDITORIA
 * 
 * Registra ações importantes dos usuários no Firestore.
 * Use para rastrear operações CRUD e eventos de segurança.
 * 
 * USO:
 *   import { logAction } from '@/lib/logAction';
 *   
 *   await logAction({
 *     action: 'CREATE_PRODUCT',
 *     userId: user.uid,
 *     metadata: { productId: '123', productName: 'Fralda' }
 *   });
 */

import { db } from './firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';

// Tipos de ações
export const LOG_ACTIONS = {
  // Autenticação
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  SIGNUP: 'SIGNUP',
  
  // Produtos
  CREATE_PRODUCT: 'CREATE_PRODUCT',
  UPDATE_PRODUCT: 'UPDATE_PRODUCT',
  DELETE_PRODUCT: 'DELETE_PRODUCT',
  VIEW_PRODUCT: 'VIEW_PRODUCT',
  
  // Reviews
  CREATE_REVIEW: 'CREATE_REVIEW',
  DELETE_REVIEW: 'DELETE_REVIEW',
  
  // Busca
  SEARCH: 'SEARCH',
  
  // Erros
  ERROR: 'ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
} as const;

export type LogAction = typeof LOG_ACTIONS[keyof typeof LOG_ACTIONS];

// Interface do log
export interface Log {
  id: string;
  action: LogAction;
  userId: string;
  userEmail?: string;
  timestamp: Timestamp | Date;
  metadata?: Record<string, unknown>;
  userAgent?: string;
  ip?: string;
}

export interface LogInput {
  action: LogAction;
  userId: string;
  userEmail?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Registra uma ação no Firestore
 */
export async function logAction(input: LogInput): Promise<string> {
  if (!db) {
    console.warn('⚠️ Firestore não configurado. Log não registrado.');
    return '';
  }

  try {
    // Obter informações do navegador (se disponível)
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : 'Server';
    
    const logData = {
      action: input.action,
      userId: input.userId,
      userEmail: input.userEmail,
      timestamp: serverTimestamp(),
      metadata: input.metadata || {},
      userAgent,
      // IP seria obtido via API Route no backend
    };
    
    const docRef = await addDoc(collection(db, 'logs'), logData);
    
    // Log no console em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(`[LOG] ${input.action}:`, input.metadata);
    }
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Erro ao registrar log:', error);
    return '';
  }
}

/**
 * Busca logs de um usuário
 */
export async function getUserLogs(
  userId: string,
  limitCount: number = 50
): Promise<Log[]> {
  if (!db) {
    throw new Error('Firestore não está configurado');
  }

  try {
    const q = query(
      collection(db, 'logs'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const logs: Log[] = [];
    
    querySnapshot.forEach((doc) => {
      logs.push({
        id: doc.id,
        ...doc.data(),
      } as Log);
    });
    
    return logs;
  } catch (error) {
    console.error('❌ Erro ao buscar logs:', error);
    throw error;
  }
}

/**
 * Busca logs por ação
 */
export async function getLogsByAction(
  action: LogAction,
  limitCount: number = 100
): Promise<Log[]> {
  if (!db) {
    throw new Error('Firestore não está configurado');
  }

  try {
    const q = query(
      collection(db, 'logs'),
      where('action', '==', action),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const logs: Log[] = [];
    
    querySnapshot.forEach((doc) => {
      logs.push({
        id: doc.id,
        ...doc.data(),
      } as Log);
    });
    
    return logs;
  } catch (error) {
    console.error('❌ Erro ao buscar logs:', error);
    throw error;
  }
}

/**
 * Busca logs recentes (últimas 24h)
 */
export async function getRecentLogs(limitCount: number = 100): Promise<Log[]> {
  if (!db) {
    throw new Error('Firestore não está configurado');
  }

  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const q = query(
      collection(db, 'logs'),
      where('timestamp', '>=', yesterday),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const logs: Log[] = [];
    
    querySnapshot.forEach((doc) => {
      logs.push({
        id: doc.id,
        ...doc.data(),
      } as Log);
    });
    
    return logs;
  } catch (error) {
    console.error('❌ Erro ao buscar logs:', error);
    throw error;
  }
}

/**
 * Helper para registrar login
 */
export async function logLogin(userId: string, email?: string, method?: string): Promise<string> {
  return logAction({
    action: LOG_ACTIONS.LOGIN,
    userId,
    userEmail: email,
    metadata: { method: method || 'email' },
  });
}

/**
 * Helper para registrar logout
 */
export async function logLogout(userId: string, email?: string): Promise<string> {
  return logAction({
    action: LOG_ACTIONS.LOGOUT,
    userId,
    userEmail: email,
  });
}

/**
 * Helper para registrar criação de produto
 */
export async function logProductCreate(
  userId: string,
  productId: string,
  productName: string
): Promise<string> {
  return logAction({
    action: LOG_ACTIONS.CREATE_PRODUCT,
    userId,
    metadata: { productId, productName },
  });
}

/**
 * Helper para registrar erro
 */
export async function logError(
  userId: string,
  error: Error,
  context?: Record<string, unknown>
): Promise<string> {
  return logAction({
    action: LOG_ACTIONS.ERROR,
    userId,
    metadata: {
      error: error.message,
      stack: error.stack,
      ...context,
    },
  });
}

