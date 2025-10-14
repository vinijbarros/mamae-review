/**
 * COMPONENTE DE PROTEÇÃO DE ROTAS
 * 
 * Este componente protege rotas privadas, redirecionando usuários não
 * autenticados para a página de login.
 * 
 * FUNCIONALIDADES:
 * - Verifica se o usuário está autenticado
 * - Redireciona para /login se não autenticado
 * - Mostra loading durante verificação
 * - Renderiza conteúdo apenas se autenticado
 * 
 * USO TÍPICO:
 * Envolver páginas que requerem autenticação (dashboard, perfil, etc)
 * 
 * @example
 * ```tsx
 * // app/dashboard/page.tsx
 * export default function DashboardPage() {
 *   return (
 *     <ProtectedRoute>
 *       <div>Conteúdo privado aqui</div>
 *     </ProtectedRoute>
 *   );
 * }
 * ```
 * 
 * @module components/ProtectedRoute
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * Props do componente ProtectedRoute.
 * 
 * @property {React.ReactNode} children - Conteúdo a ser protegido
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Componente que protege rotas privadas.
 * 
 * FLUXO:
 * 1. Verifica estado de loading do auth
 * 2. Se loading, mostra spinner
 * 3. Se não loading e sem user, redireciona para /login
 * 4. Se autenticado, renderiza children
 * 
 * IMPORTANTE:
 * - useEffect com deps [user, loading, router] garante atualização
 * - Retorna null enquanto redireciona para evitar flash de conteúdo
 * - Loading state previne redirecionamento prematuro
 * 
 * @param {ProtectedRouteProps} props
 * @returns {JSX.Element | null} Spinner, null, ou children
 * 
 * @example
 * ```tsx
 * // Página protegida
 * function ProfilePage() {
 *   return (
 *     <ProtectedRoute>
 *       <h1>Meu Perfil</h1>
 *       <p>Só usuários logados veem isso</p>
 *     </ProtectedRoute>
 *   );
 * }
 * 
 * // Múltiplas páginas podem usar
 * function SettingsPage() {
 *   return (
 *     <ProtectedRoute>
 *       <Settings />
 *     </ProtectedRoute>
 *   );
 * }
 * ```
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Obtém estado de autenticação do contexto
  const { user, loading } = useAuth();
  const router = useRouter();

  /**
   * Effect para redirecionar usuários não autenticados.
   * 
   * Só redireciona quando:
   * - loading = false (verificação completa)
   * - user = null (não autenticado)
   * 
   * Isso previne redirecionamentos durante a inicialização.
   */
  useEffect(() => {
    if (!loading && !user) {
      // Redireciona para login se não autenticado
      router.push("/login");
    }
  }, [user, loading, router]);

  /**
   * Estado 1: Loading
   * 
   * Mostra spinner enquanto verifica autenticação.
   * Importante para não mostrar conteúdo prematuro ou
   * redirecionar usuários que estão realmente logados.
   */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  /**
   * Estado 2: Não autenticado
   * 
   * Retorna null enquanto o useEffect faz o redirecionamento.
   * Isso previne "flash" de conteúdo protegido antes do redirect.
   */
  if (!user) {
    return null;
  }

  /**
   * Estado 3: Autenticado
   * 
   * Renderiza o conteúdo protegido normalmente.
   * O usuário tem permissão para ver esta página.
   */
  return <>{children}</>;
}
