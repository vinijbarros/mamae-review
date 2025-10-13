"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getUserProfile, UserProfile } from "@/lib/user";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, Plus } from "lucide-react";

function DashboardContent() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (user) {
        try {
          const userProfile = await getUserProfile(user.uid);
          setProfile(userProfile);
        } catch (error) {
          console.error("Erro ao carregar perfil:", error);
        } finally {
          setLoading(false);
        }
      }
    }

    loadProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando seu perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vinda, {profile?.name || user?.displayName || "Mamãe"}!
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
            <CardDescription>Suas informações pessoais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nome</p>
              <p className="text-base">
                {profile?.name || user?.displayName || "Não informado"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                E-mail
              </p>
              <p className="text-base">{user?.email}</p>
            </div>
            {profile?.gestationWeek !== null && profile?.gestationWeek !== undefined && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Semana de gestação
                </p>
                <p className="text-base">{profile.gestationWeek}ª semana</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Minhas Reviews</CardTitle>
            <CardDescription>Avaliações que você fez</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-4xl font-bold text-primary">0</p>
              <p className="text-sm text-muted-foreground mt-2">
                Nenhuma review ainda
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produtos Salvos</CardTitle>
            <CardDescription>Produtos que você favoritou</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-4xl font-bold text-primary">0</p>
              <p className="text-sm text-muted-foreground mt-2">
                Nenhum produto salvo
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximos passos</CardTitle>
          <CardDescription>
            Complete seu perfil e comece a avaliar produtos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="mr-2">📝</span>
                <span>Complete suas informações de perfil</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🔍</span>
                <span>Adicione produtos que você usa</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">⭐</span>
                <span>Avalie os produtos</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">💬</span>
                <span>Compartilhe sua experiência com outras mamães</span>
              </li>
            </ul>

            <div className="flex gap-2 pt-2">
              <Link href="/dashboard/products">
                <Button variant="outline">
                  <Package className="mr-2 h-4 w-4" />
                  Ver Meus Produtos
                </Button>
              </Link>
              <Link href="/dashboard/products/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Produto
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

