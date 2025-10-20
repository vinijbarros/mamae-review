"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Componente de input formatado para valores monetários em reais (R$)
 * 
 * @component
 * @description
 * Input personalizado que formata automaticamente valores monetários enquanto o usuário digita.
 * - Remove botões de incremento/decremento (spinners)
 * - Formata com vírgula para centavos (ex: R$ 1.234,56)
 * - Permite apenas números e vírgula
 * - Converte automaticamente o valor formatado para número
 * 
 * @example
 * ```tsx
 * <PriceInput
 *   value={price}
 *   onChange={(value) => setPrice(value)}
 *   placeholder="0,00"
 * />
 * ```
 */

export interface PriceInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "type"> {
  value?: number;
  onChange?: (value: number) => void;
}

/**
 * Formata um número para o formato de moeda brasileira
 * @param value - Valor numérico a ser formatado
 * @returns String formatada (ex: "1.234,56")
 */
function formatPrice(value: number): string {
  if (isNaN(value) || value === 0) return "";
  
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Converte uma string formatada para número
 * @param value - String formatada (ex: "1.234,56")
 * @returns Número decimal
 */
function parsePrice(value: string): number {
  if (!value) return 0;
  
  // Remove tudo exceto números e vírgula
  const cleaned = value.replace(/[^\d,]/g, "");
  
  // Substitui vírgula por ponto
  const normalized = cleaned.replace(",", ".");
  
  return parseFloat(normalized) || 0;
}

export const PriceInput = React.forwardRef<HTMLInputElement, PriceInputProps>(
  ({ className, value = 0, onChange, placeholder = "0,00", ...props }, ref) => {
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
          setDisplayValue(formatPrice(value));
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

      // Remove tudo exceto números e vírgula
      inputValue = inputValue.replace(/[^\d,]/g, "");

      // Permite apenas uma vírgula
      const commaCount = (inputValue.match(/,/g) || []).length;
      if (commaCount > 1) {
        return;
      }

      // Limita a 2 casas decimais após a vírgula
      if (inputValue.includes(",")) {
        const [intPart, decPart] = inputValue.split(",");
        if (decPart && decPart.length > 2) {
          inputValue = `${intPart},${decPart.slice(0, 2)}`;
        }
      }

      setDisplayValue(inputValue);

      // Converte para número e notifica o componente pai
      const numericValue = parsePrice(inputValue);
      onChange?.(numericValue);
    };

    /**
     * Formata o valor quando o input perde o foco
     */
    const handleBlur = () => {
      setIsFocused(false);
      const numericValue = parsePrice(displayValue);
      if (numericValue === 0) {
        setDisplayValue("");
      } else {
        setDisplayValue(formatPrice(numericValue));
      }
    };

    /**
     * Remove a formatação quando o input recebe foco
     * Facilita a edição do valor
     */
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      // Remove formatação para facilitar edição
      if (displayValue) {
        const numericValue = parsePrice(displayValue);
        setDisplayValue(numericValue > 0 ? numericValue.toString().replace(".", ",") : "");
      }
      // Seleciona todo o texto para facilitar edição
      setTimeout(() => e.target.select(), 0);
    };

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          R$
        </span>
        <Input
          ref={ref}
          type="text"
          inputMode="decimal"
          className={cn("pl-12", className)}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          {...props}
        />
      </div>
    );
  }
);

PriceInput.displayName = "PriceInput";

