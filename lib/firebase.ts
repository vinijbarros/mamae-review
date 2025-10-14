/**
 * CONFIGURAÇÃO DO FIREBASE CLIENT SDK
 * 
 * Este arquivo inicializa e configura os serviços do Firebase para uso no lado do cliente.
 * É o ponto central para todas as operações com Firebase (Auth, Firestore, Storage, Analytics).
 * 
 * SERVIÇOS DISPONÍVEIS:
 * - auth: Autenticação de usuários (login, signup, logout)
 * - db: Firestore Database (operações CRUD em coleções)
 * - storage: Firebase Storage (upload e armazenamento de arquivos)
 * - analytics: Firebase Analytics (rastreamento de eventos)
 * 
 * COMO USAR:
 * ```typescript
 * import { auth, db, storage, analytics } from '@/lib/firebase';
 * 
 * // Exemplo: Buscar dados do Firestore
 * const snapshot = await getDocs(collection(db, 'products'));
 * 
 * // Exemplo: Verificar usuário logado
 * const user = auth.currentUser;
 * ```
 * 
 * SEGURANÇA:
 * - As credenciais vêm de variáveis de ambiente (.env.local)
 * - Nunca exponha o service account aqui (apenas no firebase-admin.ts)
 * - Este arquivo é incluído no bundle do cliente (frontend)
 * 
 * @module lib/firebase
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';

/**
 * Configuração do Firebase obtida das variáveis de ambiente.
 * 
 * IMPORTANTE: Todas as variáveis devem começar com NEXT_PUBLIC_ para serem
 * acessíveis no lado do cliente. Configure estas variáveis no arquivo .env.local
 * 
 * Para obter estas credenciais:
 * 1. Acesse Firebase Console: https://console.firebase.google.com
 * 2. Selecione seu projeto
 * 3. Vá em Configurações > Configurações do Projeto
 * 4. Role até "Seus aplicativos" e copie as credenciais
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

/**
 * Verifica se todas as credenciais essenciais do Firebase estão configuradas.
 * 
 * Validamos apiKey, authDomain e projectId pois são os campos mínimos
 * necessários para inicializar o Firebase corretamente.
 */
const isFirebaseConfigured = firebaseConfig.apiKey && 
                             firebaseConfig.authDomain && 
                             firebaseConfig.projectId;

/**
 * Instâncias dos serviços do Firebase.
 * 
 * Declaradas como 'undefined' inicialmente para permitir verificação
 * condicional e evitar erros quando Firebase não está configurado.
 */
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;
let analytics: Analytics | undefined;

/**
 * INICIALIZAÇÃO DO FIREBASE
 * 
 * Esta seção inicializa os serviços do Firebase se as credenciais estiverem configuradas.
 * 
 * PATTERN SINGLETON:
 * Verifica se já existe uma instância (getApps().length) para evitar múltiplas inicializações,
 * o que causaria erros. Isso é especialmente importante no Next.js com hot reload.
 */
if (isFirebaseConfigured) {
  // Inicializa o app Firebase (ou pega a instância existente)
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  
  // Inicializa serviços individuais
  auth = getAuth(app);              // Autenticação de usuários
  db = getFirestore(app);            // Banco de dados Firestore
  storage = getStorage(app);         // Armazenamento de arquivos
  
  /**
   * Analytics só funciona no navegador (client-side).
   * 
   * Verificamos 'typeof window !== undefined' pois o Next.js faz
   * server-side rendering e 'window' não existe no servidor.
   * 
   * Try/catch protege contra erros de inicialização (ex: ad blockers)
   */
  if (typeof window !== 'undefined') {
    try {
      analytics = getAnalytics(app);
    } catch (error) {
      console.warn('Analytics não pôde ser inicializado:', error);
    }
  }
} else if (typeof window !== 'undefined') {
  /**
   * Aviso de configuração faltando.
   * 
   * Só mostra no cliente (typeof window !== 'undefined') para evitar
   * warnings durante o build do Next.js no servidor.
   */
  console.warn(
    '⚠️ Firebase não está configurado. Configure o arquivo .env.local com suas credenciais.\n' +
    'Veja o arquivo .env.example para mais detalhes.'
  );
}

/**
 * EXPORTS
 * 
 * Exporta as instâncias dos serviços para uso em todo o aplicativo.
 * 
 * NOTA: Todos podem ser 'undefined' se Firebase não estiver configurado.
 * Sempre verifique antes de usar:
 * 
 * ```typescript
 * if (!db) {
 *   throw new Error('Firestore não está configurado');
 * }
 * ```
 */
export { auth, db, storage, analytics };
export default app;

