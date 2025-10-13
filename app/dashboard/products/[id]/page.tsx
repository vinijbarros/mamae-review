"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getProduct } from "@/lib/products";
import { Product } from "@/types/product";
import { ProductReviews } from "@/components/ProductReviews";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, ExternalLink, Store, DollarSign, Pencil } from "lucide-react";
import { StarRating } from "@/components/StarRating";

function ProductDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  async function loadProduct() {
    try {
      setLoading(true);
      const productData = await getProduct(productId);

      if (!productData) {
        router.push("/dashboard/products");
        return;
      }

      setProduct(productData);
    } catch (error) {
      console.error("Erro ao carregar produto:", error);
      router.push("/dashboard/products");
    } finally {
      setLoading(false);
    }
  }

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
    return null;
  }

  const isOwner = user?.uid === product.createdBy;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {product.name}
            </h1>
            <p className="text-muted-foreground">{product.category}</p>
          </div>
        </div>

        {isOwner && (
          <Link href={`/dashboard/products/${productId}/edit`}>
            <Button variant="outline">
              <Pencil className="mr-2 h-4 w-4" />
              Editar Produto
            </Button>
          </Link>
        )}
      </div>

      {/* Detalhes do Produto */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Imagem e Informações Principais */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-gray-400">Sem imagem</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Avaliação
                  </p>
                  <StarRating
                    rating={product.rating}
                    readonly
                    size="md"
                    showValue
                  />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Preço</p>
                  <p className="text-2xl font-bold text-primary flex items-center gap-1">
                    <DollarSign className="h-5 w-5" />
                    R$ {product.price.toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Loja</p>
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    <p className="font-medium">{product.storeName}</p>
                  </div>
                  {product.storeLink && (
                    <a
                      href={product.storeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                    >
                      Visitar loja
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Descrição */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Sobre o Produto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reviews */}
      <ProductReviews productId={productId} />
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <ProtectedRoute>
      <ProductDetailContent />
    </ProtectedRoute>
  );
}

