import { Heart, Star, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      {/* Banner de boas-vindas */}
      <div className="text-center space-y-6 max-w-4xl mx-auto">
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
          A plataforma onde mamães gestantes e recentes compartilham reviews 
          de produtos essenciais para a maternidade. Encontre as melhores 
          recomendações da nossa comunidade.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button size="lg" className="rounded-xl shadow-soft hover:scale-105 transition-transform">
            <Star className="mr-2 h-5 w-5" />
            Ver Reviews
          </Button>
          <Button variant="outline" size="lg" className="rounded-xl shadow-soft hover:scale-105 transition-transform">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Adicionar Produto
          </Button>
        </div>
      </div>

      {/* Cards de destaque */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mt-12">
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
    </div>
  );
}
