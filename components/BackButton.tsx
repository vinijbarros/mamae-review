"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  /**
   * Texto do botão. Padrão: "Voltar"
   */
  children?: React.ReactNode;
  
  /**
   * URL específica para onde voltar. Se não especificado, usa router.back()
   */
  href?: string;
  
  /**
   * Classes CSS adicionais
   */
  className?: string;
  
  /**
   * Variante do botão
   */
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  
  /**
   * Tamanho do botão
   */
  size?: "default" | "sm" | "lg" | "icon";
  
  /**
   * Se deve mostrar apenas o ícone
   */
  iconOnly?: boolean;
  
  /**
   * Callback executado antes de navegar
   */
  onBeforeNavigate?: () => void;
}

export function BackButton({
  children = "Voltar",
  href,
  className,
  variant = "outline",
  size = "default",
  iconOnly = false,
  onBeforeNavigate,
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    // Executa callback se fornecido
    if (onBeforeNavigate) {
      onBeforeNavigate();
    }

    // Navega para URL específica ou volta na história
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn(
        "flex items-center gap-2 transition-all duration-200 hover:scale-105",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      {!iconOnly && <span>{children}</span>}
    </Button>
  );
}
