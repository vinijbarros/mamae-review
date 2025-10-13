"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-primary font-poppins">
              Mamãe Review
            </h1>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          {!loading && (
            <>
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm">
                      Dashboard
                    </Button>
                  </Link>

                  <Link href="/dashboard/products">
                    <Button variant="ghost" size="sm">
                      Produtos
                    </Button>
                  </Link>
                  
                  <div className="hidden sm:flex items-center space-x-2 text-sm">
                    <span className="text-muted-foreground">Olá,</span>
                    <span className="font-medium">
                      {user.displayName || user.email?.split("@")[0]}
                    </span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                  >
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Entrar
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm">
                      Cadastrar
                    </Button>
                  </Link>
                </>
              )}
            </>
          )}
          
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

