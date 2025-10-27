"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Filter, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard } from "@/components/ProductCard";
import { BackButton } from "@/components/BackButton";
import { getAllProducts, searchProducts } from "@/lib/products";
import { Product, PRODUCT_CATEGORIES } from "@/types/product";
import { DocumentSnapshot } from "firebase/firestore";

export default function AllProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Debounce da busca
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Carregar produtos iniciais
  useEffect(() => {
    const loadInitialProducts = async () => {
      setLoading(true);
      try {
        const { products: initialProducts, lastDoc: newLastDoc } = await getAllProducts(20);
        setProducts(initialProducts);
        setLastDoc(newLastDoc);
        setHasMore(initialProducts.length === 20);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialProducts();
  }, []);

  // Buscar produtos com filtros
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchTerm || selectedCategory !== "all") {
        setLoading(true);
        try {
          const results = await searchProducts(
            debouncedSearchTerm,
            selectedCategory,
            20
          );
          setProducts(results);
          setLastDoc(null);
          setHasMore(false);
        } catch (error) {
          console.error("Erro ao buscar produtos:", error);
        } finally {
          setLoading(false);
        }
      } else {
        // Se não houver filtros, recarregar todos os produtos
        setLoading(true);
        try {
          const { products: allProducts, lastDoc: newLastDoc } = await getAllProducts(20);
          setProducts(allProducts);
          setLastDoc(newLastDoc);
          setHasMore(allProducts.length === 20);
        } catch (error) {
          console.error("Erro ao carregar produtos:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    performSearch();
  }, [debouncedSearchTerm, selectedCategory]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleCategoryChange = useCallback((value: string) => {
    setSelectedCategory(value);
  }, []);

  const loadMoreProducts = useCallback(async () => {
    if (!lastDoc || !hasMore) return;

    try {
      const { products: moreProducts, lastDoc: newLastDoc } = await getAllProducts(20, lastDoc);
      setProducts(prev => [...prev, ...moreProducts]);
      setLastDoc(newLastDoc);
      setHasMore(moreProducts.length === 20);
    } catch (error) {
      console.error("Erro ao carregar mais produtos:", error);
    }
  }, [lastDoc, hasMore]);

  const filteredProductsCount = useMemo(() => products.length, [products]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <BackButton href="/" />
        </div>
        
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground font-poppins">
            Todos os Produtos
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore todos os produtos recomendados pela nossa comunidade
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar produtos, lojas, categorias..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="sm:w-48">
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {PRODUCT_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Resultados */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Carregando produtos...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredProductsCount} produto{filteredProductsCount !== 1 ? 's' : ''} encontrado{filteredProductsCount !== 1 ? 's' : ''}
              </p>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
                <p className="text-muted-foreground">
                  Tente ajustar os filtros ou buscar por outros termos
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Botão Carregar Mais */}
                {hasMore && !searchTerm && selectedCategory === "all" && (
                  <div className="text-center pt-8">
                    <Button
                      onClick={loadMoreProducts}
                      variant="outline"
                      size="lg"
                      className="min-w-48"
                    >
                      Carregar Mais Produtos
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
