/**
 * CONTEXTO DE AUTENTICAÇÃO GLOBAL
 * 
 * Este arquivo implementa o Context da autenticação usando Firebase Auth.
 * Fornece estado global do usuário e funções de auth para todo o aplicativo.
 * 
 * FUNCIONALIDADES:
 * - Rastreia usuário logado em tempo real (onAuthStateChanged)
 * - Login com email/senha
 * - Login com Google (OAuth)
 * - Cadastro de novos usuários
 * - Logout
 * - Estado de loading durante inicialização
 * 
 * COMO USAR:
 * 1. Envolver app com <AuthProvider> no layout.tsx
 * 2. Usar hook useAuth() em qualquer componente para acessar o contexto
 * 
 * @example
 * ```tsx
 * // Em layout.tsx
 * <AuthProvider>
 *   {children}
 * </AuthProvider>
 * 
 * // Em qualquer componente
 * const { user, loading, signIn, signOut } = useAuth();
 * 
 * if (loading) return <Spinner />;
 * if (!user) return <LoginButton />;
 * return <Dashboard user={user} />;
 * ```
 * 
 * @module context/AuthContext
 */

"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPopup,
  GoogleAuthProvider,
  UserCredential,
  Auth
} from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase';

/**
 * Interface que define o shape do contexto de autenticação.
 * 
 * @property {User | null} user - Usuário logado ou null se não autenticado
 * @property {boolean} loading - true durante inicialização e mudanças de estado
 * @property {Function} signIn - Função para login com email/senha
 * @property {Function} signUp - Função para cadastro com email/senha
 * @property {Function} signInWithGoogle - Função para login com Google
 * @property {Function} signOut - Função para logout
 */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
  signOut: () => Promise<void>;
}

/**
 * Context do React para autenticação.
 * 
 * Inicializado como undefined para detectar uso fora do Provider.
 * Só pode ser acessado através do hook useAuth().
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider do contexto de autenticação.
 * 
 * Este componente deve envolver toda a aplicação (geralmente no layout.tsx)
 * para disponibilizar o estado de autenticação globalmente.
 * 
 * COMPORTAMENTO:
 * - Escuta mudanças de auth em tempo real via onAuthStateChanged
 * - Mantém estado de loading durante a inicialização
 * - Cleanup automático do listener quando desmonta
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componentes filhos
 * 
 * @example
 * ```tsx
 * // app/layout.tsx
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <AuthProvider>
 *           {children}
 *         </AuthProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  /**
   * Estado do usuário logado.
   * null = não autenticado
   * User = autenticado
   */
  const [user, setUser] = useState<User | null>(null);
  
  /**
   * Estado de loading.
   * true = verificando auth ou durante transições
   * false = estado estável (logado ou deslogado)
   */
  const [loading, setLoading] = useState(true);

  /**
   * Effect para escutar mudanças no estado de autenticação.
   * 
   * onAuthStateChanged é um listener do Firebase que:
   * - Dispara imediatamente com o estado atual
   * - Dispara sempre que o usuário faz login/logout
   * - Persiste sessão automaticamente (localStorage)
   * 
   * IMPORTANTE: Sempre fazer cleanup retornando o unsubscribe.
   */
  useEffect(() => {
    // Se Firebase não configurado, apenas marca como não-loading
    if (!firebaseAuth) {
      setLoading(false);
      return;
    }

    // Escuta mudanças no estado de autenticação
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setUser(user); // Atualiza usuário (pode ser null)
      setLoading(false); // Marca como carregado
    });

    // Cleanup: cancela listener quando componente desmonta
    // Isso previne memory leaks
    return () => unsubscribe();
  }, []);

  /**
   * Faz login com email e senha.
   * 
   * Usa signInWithEmailAndPassword do Firebase Auth.
   * Em caso de sucesso, onAuthStateChanged dispara automaticamente.
   * 
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @returns {Promise<UserCredential>} Credenciais do usuário logado
   * 
   * @throws {Error} 'auth/user-not-found' - Usuário não existe
   * @throws {Error} 'auth/wrong-password' - Senha incorreta
   * @throws {Error} 'auth/invalid-email' - Email inválido
   * @throws {Error} 'Firebase não está configurado'
   * 
   * @example
   * ```tsx
   * const { signIn } = useAuth();
   * 
   * try {
   *   await signIn('user@example.com', 'senha123');
   *   router.push('/dashboard');
   * } catch (error) {
   *   if (error.code === 'auth/wrong-password') {
   *     alert('Senha incorreta');
   *   }
   * }
   * ```
   */
  const signIn = async (email: string, password: string) => {
    if (!firebaseAuth) throw new Error('Firebase não está configurado');
    return signInWithEmailAndPassword(firebaseAuth, email, password);
  };

  /**
   * Cadastra novo usuário com email e senha.
   * 
   * Usa createUserWithEmailAndPassword do Firebase Auth.
   * Em caso de sucesso, o usuário é automaticamente logado.
   * 
   * IMPORTANTE: Após signup, você deve criar o perfil no Firestore
   * usando createUserProfile() de lib/user.ts
   * 
   * @param {string} email - Email do novo usuário
   * @param {string} password - Senha do novo usuário (min 6 caracteres)
   * @returns {Promise<UserCredential>} Credenciais do usuário criado
   * 
   * @throws {Error} 'auth/email-already-in-use' - Email já cadastrado
   * @throws {Error} 'auth/weak-password' - Senha fraca (< 6 caracteres)
   * @throws {Error} 'auth/invalid-email' - Email inválido
   * @throws {Error} 'Firebase não está configurado'
   * 
   * @example
   * ```tsx
   * const { signUp } = useAuth();
   * 
   * try {
   *   const credential = await signUp('user@example.com', 'senha123');
   *   
   *   // IMPORTANTE: Criar perfil no Firestore
   *   await createUserProfile(credential.user.uid, {
   *     name: 'Nome do Usuário',
   *     email: credential.user.email!
   *   });
   *   
   *   router.push('/dashboard');
   * } catch (error) {
   *   if (error.code === 'auth/email-already-in-use') {
   *     alert('Email já cadastrado');
   *   }
   * }
   * ```
   */
  const signUp = async (email: string, password: string) => {
    if (!firebaseAuth) throw new Error('Firebase não está configurado');
    return createUserWithEmailAndPassword(firebaseAuth, email, password);
  };

  /**
   * Faz login com conta do Google (OAuth).
   * 
   * Abre popup do Google para autenticação.
   * Se o usuário já tiver conta, faz login.
   * Se for primeira vez, cria conta automaticamente.
   * 
   * IMPORTANTE: Após login com Google pela primeira vez, você deve
   * criar ou atualizar o perfil no Firestore.
   * 
   * @returns {Promise<UserCredential>} Credenciais do usuário logado
   * 
   * @throws {Error} 'auth/popup-closed-by-user' - Usuário fechou popup
   * @throws {Error} 'auth/popup-blocked' - Popup bloqueado pelo navegador
   * @throws {Error} 'auth/cancelled-popup-request' - Múltiplos popups abertos
   * @throws {Error} 'Firebase não está configurado'
   * 
   * @example
   * ```tsx
   * const { signInWithGoogle } = useAuth();
   * 
   * try {
   *   const credential = await signInWithGoogle();
   *   
   *   // Criar/atualizar perfil se necessário
   *   const existingProfile = await getUserProfile(credential.user.uid);
   *   
   *   if (!existingProfile) {
   *     await createUserProfile(credential.user.uid, {
   *       name: credential.user.displayName!,
   *       email: credential.user.email!
   *     });
   *   }
   *   
   *   router.push('/dashboard');
   * } catch (error) {
   *   if (error.code === 'auth/popup-closed-by-user') {
   *     // Usuário cancelou - não fazer nada
   *   } else {
   *     alert('Erro ao fazer login com Google');
   *   }
   * }
   * ```
   */
  const signInWithGoogle = async () => {
    if (!firebaseAuth) throw new Error('Firebase não está configurado');
    const provider = new GoogleAuthProvider();
    return signInWithPopup(firebaseAuth, provider);
  };

  /**
   * Faz logout do usuário.
   * 
   * Remove sessão local e dispara onAuthStateChanged com user=null.
   * 
   * @throws {Error} 'Firebase não está configurado'
   * 
   * @example
   * ```tsx
   * const { signOut } = useAuth();
   * 
   * const handleLogout = async () => {
   *   await signOut();
   *   router.push('/');
   * };
   * ```
   */
  const signOut = async () => {
    if (!firebaseAuth) throw new Error('Firebase não está configurado');
    return firebaseSignOut(firebaseAuth);
  };

  // Objeto de valor do contexto
  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook customizado para usar o contexto de autenticação.
 * 
 * Este hook fornece acesso fácil ao estado e funções de autenticação.
 * DEVE ser usado dentro de um componente envolvido por <AuthProvider>.
 * 
 * @returns {AuthContextType} Contexto de autenticação
 * 
 * @throws {Error} Se usado fora do AuthProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, loading, signOut } = useAuth();
 *   
 *   if (loading) {
 *     return <Spinner />;
 *   }
 *   
 *   if (!user) {
 *     return <LoginPage />;
 *   }
 *   
 *   return (
 *     <div>
 *       <p>Olá, {user.email}!</p>
 *       <button onClick={signOut}>Sair</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  // Validação: contexto deve existir
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
}
