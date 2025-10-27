"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { getRelatedProducts } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface RelatedProductsProps {
  category: string;
  currentProductId: string;
}

export function RelatedProducts({ category, currentProductId }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRelatedProducts() {
      try {
        setLoading(true);
        const products = await getRelatedProducts(category, currentProductId, 4);
        setRelatedProducts(products);
      } catch (error) {
        console.error("Erro ao carregar produtos relacionados:", error);
      } finally {
        setLoading(false);
      }
    }

    loadRelatedProducts();
  }, [category, currentProductId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Produtos Relacionados</CardTitle>
          <CardDescription>
            Outros produtos da categoria {category}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Carregando produtos relacionados...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (relatedProducts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Produtos Relacionados</CardTitle>
          <CardDescription>
            Outros produtos da categoria {category}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Nenhum outro produto encontrado nesta categoria
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produtos Relacionados</CardTitle>
        <CardDescription>
          Outros produtos da categoria {category}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {relatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link 
            href={`/products?category=${encodeURIComponent(category)}`}
            className="text-primary hover:underline text-sm"
          >
            Ver todos os produtos desta categoria →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
