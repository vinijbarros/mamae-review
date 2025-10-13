"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProduct } from "@/lib/products";
import { Product } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Package, Store, Link as LinkIcon, DollarSign, ArrowLeft } from "lucide-react";
import { ProductReviews } from "@/components/ProductReviews";

interface ProductDetailPageProps {
  params: { id: string };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const productId = params.id;

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;
      setLoading(true);
      try {
        const fetchedProduct = await getProduct(productId);
        if (fetchedProduct) {
          setProduct(fetchedProduct);
        } else {
          router.push("/"); // Redirect if product not found
        }
      } catch (error) {
        console.error("Erro ao carregar produto:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando produto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">Produto não encontrado</h2>
        <Button onClick={() => router.push("/")} className="mt-4">
          Voltar para Home
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
      </div>

      <Card>
        <CardContent className="p-6 grid md:grid-cols-2 gap-6">
          <div className="relative h-96 w-full rounded-lg overflow-hidden bg-muted">
            <img
              src={product.imageUrl || "/placeholder.png"}
              alt={product.name}
              className="object-cover w-full h-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.png";
              }}
            />
          </div>
          <div className="space-y-4">
            <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              <Package className="h-4 w-4 inline mr-1" />
              {product.category}
            </div>
            <h2 className="text-2xl font-bold">{product.name}</h2>
            <div className="flex items-center gap-2 text-lg font-semibold text-yellow-500">
              <Star className="h-5 w-5 fill-yellow-500" />
              <span>{product.rating.toFixed(1)}</span>
            </div>
            <p className="text-3xl font-bold text-primary flex items-center gap-2">
              <DollarSign className="h-6 w-6" /> R$ {product.price.toFixed(2)}
            </p>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm mb-2">
                <Store className="h-4 w-4" />
                <span className="font-medium">Loja:</span>
                <span>{product.storeName}</span>
              </div>
              {product.storeLink && (
                <a
                  href={product.storeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <LinkIcon className="h-4 w-4" />
                  Visitar Loja
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ProductReviews productId={productId} />
    </div>
  );
}

