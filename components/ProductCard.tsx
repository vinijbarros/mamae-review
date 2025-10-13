"use client";

import React from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { StarRating } from "./StarRating";
import { Store, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} className="block group">
      <Card className={cn(
        "h-full overflow-hidden hover:shadow-lg transition-all duration-300",
        "group-hover:scale-[1.02]",
        className
      )}>
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          <img
            src={product.imageUrl || "/placeholder.png"}
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.png";
            }}
          />
          <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-md">
            <p className="text-xs font-medium text-muted-foreground">
              {product.category}
            </p>
          </div>
        </div>

        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center justify-between">
            <StarRating 
              rating={product.rating || 0} 
              readonly 
              size="sm" 
              showValue 
            />
          </div>

          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Store className="h-4 w-4" />
            <span className="truncate max-w-[120px]">{product.storeName}</span>
          </div>
          <div className="flex items-center gap-1 text-lg font-bold text-primary">
            <DollarSign className="h-5 w-5" />
            <span>{product.price.toFixed(2)}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

