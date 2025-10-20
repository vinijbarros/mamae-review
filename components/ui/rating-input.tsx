"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

/**
 * Componente de input formatado para avaliações (0 a 5 estrelas)
 * 
 * @component
 * @description
 * Input personalizado que formata automaticamente valores de avaliação enquanto o usuário digita.
 * - Remove botões de incremento/decremento (spinners)
 * - Limita valores entre 0 e 5
 * - Permite até duas casas decimais (ex: 4.5, 3.75, 2.8)
 * - Mostra preview visual com estrelas
 * - Permite digitar com vírgula ou ponto
 * 
 * @example
 * ```tsx
 * <RatingInput
 *   value={rating}
 *   onChange={(value) => setRating(value)}
 *   placeholder="0.0"
 * />
 * ```
 */

export interface RatingInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "type"> {
  value?: number;
  onChange?: (value: number) => void;
}

/**
 * Formata um número para o formato de avaliação
 * @param value - Valor numérico a ser formatado
 * @returns String formatada (ex: "4.5" ou "3.75")
 */
function formatRating(value: number): string {
  if (isNaN(value) || value === 0) return "";
  
  // Limita entre 0 e 5
  const limited = Math.min(Math.max(value, 0), 5);
  
  // Remove zeros desnecessários no final
  // Ex: 4.50 → 4.5, 3.00 → 3
  return limited.toString();
}

/**
 * Converte uma string formatada para número
 * @param value - String formatada (ex: "4.5" ou "4,5")
 * @returns Número decimal entre 0 e 5
 */
function parseRating(value: string): number {
  if (!value) return 0;
  
  // Remove tudo exceto números, vírgula e ponto
  const cleaned = value.replace(/[^\d.,]/g, "");
  
  // Substitui vírgula por ponto
  const normalized = cleaned.replace(",", ".");
  
  const parsed = parseFloat(normalized) || 0;
  
  // Limita entre 0 e 5
  return Math.min(Math.max(parsed, 0), 5);
}

/**
 * Renderiza estrelas visuais baseadas na avaliação
 */
function StarRating({ value }: { value: number }) {
  const fullStars = Math.floor(value);
  const hasHalfStar = value % 1 >= 0.3;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {/* Estrelas cheias */}
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star
          key={`full-${i}`}
          className="h-4 w-4 fill-yellow-400 text-yellow-400"
        />
      ))}
      
      {/* Estrela pela metade */}
      {hasHalfStar && (
        <div className="relative">
          <Star className="h-4 w-4 text-yellow-400" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      )}
      
      {/* Estrelas vazias */}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star
          key={`empty-${i}`}
          className="h-4 w-4 text-gray-300"
        />
      ))}
    </div>
  );
}

export const RatingInput = React.forwardRef<HTMLInputElement, RatingInputProps>(
  ({ className, value = 0, onChange, placeholder = "0.0", ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState("");
    const [isFocused, setIsFocused] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);

    // Garante que o componente só renderiza após montar no cliente
    React.useEffect(() => {
      setMounted(true);
    }, []);

    // Atualiza o valor exibido apenas quando não estiver digitando
    React.useEffect(() => {
      if (mounted && !isFocused) {
        if (value === 0) {
          setDisplayValue("");
        } else {
          setDisplayValue(value.toString());
        }
      }
    }, [value, isFocused, mounted]);

    /**
     * Manipula mudanças no input
     * - Formata o valor enquanto o usuário digita
     * - Notifica o componente pai com o valor numérico
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value;

      // Remove tudo exceto números, vírgula e ponto
      inputValue = inputValue.replace(/[^\d.,]/g, "");

      // Permite apenas um separador decimal
      const separatorCount = (inputValue.match(/[.,]/g) || []).length;
      if (separatorCount > 1) {
        return;
      }

      // Normaliza vírgula para ponto
      inputValue = inputValue.replace(",", ".");

      // Limita a 2 casas decimais
      if (inputValue.includes(".")) {
        const [intPart, decPart] = inputValue.split(".");
        if (decPart && decPart.length > 2) {
          inputValue = `${intPart}.${decPart.slice(0, 2)}`;
        }
      }

      // Limita valor máximo a 5
      const numValue = parseFloat(inputValue);
      if (!isNaN(numValue) && numValue > 5) {
        inputValue = "5";
      }

      setDisplayValue(inputValue);

      // Converte para número e notifica o componente pai
      const numericValue = parseRating(inputValue);
      onChange?.(numericValue);
    };

    /**
     * Formata o valor quando o input perde o foco
     */
    const handleBlur = () => {
      setIsFocused(false);
      const numericValue = parseRating(displayValue);
      if (numericValue === 0) {
        setDisplayValue("");
      } else {
        setDisplayValue(formatRating(numericValue));
      }
    };

    /**
     * Seleciona todo o texto quando o input recebe foco
     */
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      // Seleciona todo o texto para facilitar edição
      setTimeout(() => e.target.select(), 0);
    };

    const numericValue = parseRating(displayValue);

    return (
      <div className="space-y-2">
        <div className="relative">
          <Input
            ref={ref}
            type="text"
            inputMode="decimal"
            className={cn("pr-16", className)}
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={placeholder}
            {...props}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
            / 5.0
          </span>
        </div>
        
        {/* Preview visual com estrelas */}
        {numericValue > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <StarRating value={numericValue} />
            <span className="text-muted-foreground">
              ({numericValue} {numericValue === 1 ? "estrela" : "estrelas"})
            </span>
          </div>
        )}
      </div>
    );
  }
);

RatingInput.displayName = "RatingInput";

