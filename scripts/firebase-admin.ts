/**
 * FIREBASE ADMIN SDK - Configuração
 * 
 * Este arquivo inicializa o Firebase Admin SDK para uso nos scripts de manutenção.
 * 
 * IMPORTANTE:
 * - Nunca exponha este arquivo no front-end
 * - Use apenas em scripts Node.js
 * - Mantenha as credenciais seguras
 */

import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Carregar variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Verificar se já foi inicializado
if (!admin.apps.length) {
  try {
    // Método 1: Service Account Key (Produção)
    // Baixe o arquivo JSON do Firebase Console
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    
    if (serviceAccountPath) {
      const serviceAccount = require(serviceAccountPath);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
      
      console.log('✅ Firebase Admin inicializado com Service Account');
    } else {
      // Método 2: Credenciais do ambiente (Development)
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
      
      console.log('✅ Firebase Admin inicializado com Application Default Credentials');
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase Admin:', error);
    throw error;
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();

export default admin;

