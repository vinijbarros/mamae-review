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

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseAuth) {
      setLoading(false);
      return;
    }

    // Listener para mudanças no estado de autenticação
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup do listener
    return () => unsubscribe();
  }, []);

  // Login com email e senha
  const signIn = async (email: string, password: string) => {
    if (!firebaseAuth) throw new Error('Firebase não está configurado');
    return signInWithEmailAndPassword(firebaseAuth, email, password);
  };

  // Cadastro com email e senha
  const signUp = async (email: string, password: string) => {
    if (!firebaseAuth) throw new Error('Firebase não está configurado');
    return createUserWithEmailAndPassword(firebaseAuth, email, password);
  };

  // Login com Google
  const signInWithGoogle = async () => {
    if (!firebaseAuth) throw new Error('Firebase não está configurado');
    const provider = new GoogleAuthProvider();
    return signInWithPopup(firebaseAuth, provider);
  };

  // Logout
  const signOut = async () => {
    if (!firebaseAuth) throw new Error('Firebase não está configurado');
    return firebaseSignOut(firebaseAuth);
  };

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

// Hook customizado para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
}

