"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Heart, Star, ShoppingBag, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard } from "@/components/ProductCard";
import { getTopRatedProducts, searchProducts } from "@/lib/products";
import { Product, PRODUCT_CATEGORIES } from "@/types/product";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce da busca
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Carregar produtos iniciais (top rated)
  useEffect(() => {
    const loadInitialProducts = async () => {
      setLoading(true);
      try {
        const topProducts = await getTopRatedProducts(10);
        setProducts(topProducts);
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
        } catch (error) {
          console.error("Erro ao buscar produtos:", error);
        } finally {
          setLoading(false);
        }
      } else {
        // Se não houver filtros, recarregar top rated
        setLoading(true);
        try {
          const topProducts = await getTopRatedProducts(10);
          setProducts(topProducts);
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

  const filteredProductsCount = useMemo(() => products.length, [products]);

  return (
    <div className="space-y-12">
      {/* Banner de boas-vindas */}
      <div className="text-center space-y-6 max-w-4xl mx-auto py-8">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-primary/20">
            <Heart className="h-12 w-12 text-primary" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-foreground font-poppins">
          Bem-vinda ao{" "}
          <span className="text-primary">Mamãe Review</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Plataforma para famílias e cuidadores compartilharem suas experiências e indicarem produtos essenciais para o enxoval e primeiros anos dos bebês. Encontre as melhores recomendações na nossa comunidade.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/signup">
            <Button size="lg" className="rounded-xl shadow-soft hover:scale-105 transition-transform">
              <Star className="mr-2 h-5 w-5" />
              Começar Agora
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="rounded-xl shadow-soft hover:scale-105 transition-transform">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Fazer Login
            </Button>
          </Link>
        </div>
      </div>

      {/* Cards de destaque */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <div className="bg-card rounded-xl p-6 shadow-soft border hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-secondary/20">
              <Star className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="text-lg font-semibold">Reviews Confiáveis</h3>
          </div>
          <p className="text-muted-foreground">
            Avaliações reais de mamães que testaram os produtos na prática.
          </p>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-soft border hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-accent/20">
              <Heart className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold">Comunidade Acolhedora</h3>
          </div>
          <p className="text-muted-foreground">
            Um espaço seguro para compartilhar experiências e dicas.
          </p>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-soft border hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/20">
              <ShoppingBag className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Produtos Essenciais</h3>
          </div>
          <p className="text-muted-foreground">
            Desde itens de maternidade até produtos para o bebê.
          </p>
        </div>
      </div>

      {/* Feed de Produtos */}
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">
            Produtos Mais Bem Avaliados
          </h2>
        </div>

        {/* Busca e Filtros */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por nome, categoria ou loja..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full md:w-[250px]">
              <SelectValue placeholder="Todas as Categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              {PRODUCT_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lista de Produtos */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Carregando produtos...</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum produto encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros ou adicionar novos produtos.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {filteredProductsCount} produto{filteredProductsCount !== 1 ? "s" : ""} encontrado{filteredProductsCount !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
