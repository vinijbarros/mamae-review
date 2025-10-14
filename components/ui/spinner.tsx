import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  return (
    <Loader2
      className={cn(
        "animate-spin text-primary",
        sizeClasses[size],
        className
      )}
    />
  );
}

interface LoadingProps {
  text?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Loading({ text = "Carregando...", size = "md" }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <Spinner size={size} />
      {text && <p className="text-muted-foreground text-sm">{text}</p>}
    </div>
  );
}

