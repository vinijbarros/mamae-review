"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";
import {
  subscribeToProductReviews,
  createReview,
  hasUserReviewed,
  calculateReviewStats,
} from "@/lib/reviews";
import { Review, ReviewSortBy } from "@/types/review";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, Calendar } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

// Schema de validação
const reviewSchema = z.object({
  rating: z.number().min(1, "Selecione uma avaliação").max(5),
  comment: z
    .string()
    .min(10, "Comentário deve ter no mínimo 10 caracteres")
    .max(500, "Comentário deve ter no máximo 500 caracteres"),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [sortBy, setSortBy] = useState<ReviewSortBy>("recent");
  const [showForm, setShowForm] = useState(false);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  // Verifica se o usuário já fez review
  useEffect(() => {
    async function checkUserReview() {
      if (user) {
        const reviewed = await hasUserReviewed(productId, user.uid);
        setHasReviewed(reviewed);
      }
    }
    checkUserReview();
  }, [productId, user]);

  // Escuta reviews em tempo real
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToProductReviews(
      productId,
      sortBy,
      (newReviews) => {
        setReviews(newReviews);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [productId, sortBy]);

  const stats = calculateReviewStats(reviews);

  async function onSubmit(data: ReviewFormData) {
    if (!user) {
      toast.error("Você precisa estar logado para avaliar");
      return;
    }

    if (hasReviewed) {
      toast.error("Você já avaliou este produto");
      return;
    }

    setSubmitting(true);

    try {
      await createReview({
        productId,
        rating: data.rating,
        comment: data.comment,
        authorId: user.uid,
        authorName: user.displayName || user.email?.split("@")[0] || "Anônimo",
      });

      toast.success("Avaliação enviada com sucesso!");
      form.reset();
      setShowForm(false);
      setHasReviewed(true);
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
      toast.error("Erro ao enviar avaliação. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(date: Date | { toDate: () => Date } | null | undefined): string {
    if (!date) return "";
    
    try {
      // Se for Timestamp do Firestore
      const dateObj = typeof date === 'object' && 'toDate' in date ? date.toDate() : new Date(date as Date);
      return formatDistanceToNow(dateObj, {
        addSuffix: true,
        locale: ptBR,
      });
    } catch {
      return "";
    }
  }

  if (loading && reviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">
              Carregando avaliações...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Avaliações dos Clientes
          </CardTitle>
          <CardDescription>
            {stats.total} avaliação(ões) com média de {stats.average} estrelas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">
                {stats.average}
              </div>
              <StarRating rating={stats.average} readonly size="sm" />
              <p className="text-sm text-muted-foreground mt-1">
                {stats.total} {stats.total === 1 ? "avaliação" : "avaliações"}
              </p>
            </div>

            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm w-8">{star}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{
                        width: `${stats.total > 0 ? (stats.distribution[star] / stats.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">
                    {stats.distribution[star]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de Nova Avaliação */}
      {user && !hasReviewed && (
        <Card>
          <CardHeader>
            <CardTitle>Deixe sua Avaliação</CardTitle>
            <CardDescription>
              Compartilhe sua experiência com este produto
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showForm ? (
              <Button onClick={() => setShowForm(true)}>
                Escrever Avaliação
              </Button>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sua Avaliação</FormLabel>
                        <FormControl>
                          <StarRating
                            rating={field.value}
                            onRatingChange={field.onChange}
                            size="lg"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comentário</FormLabel>
                        <FormControl>
                          <textarea
                            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            placeholder="Conte sua experiência com o produto..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        form.reset();
                      }}
                      disabled={submitting}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "Enviando..." : "Enviar Avaliação"}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      )}

      {user && hasReviewed && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-4">
            <p className="text-sm text-green-800">
              ✅ Você já avaliou este produto. Obrigada por compartilhar sua
              experiência!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Lista de Reviews */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Todas as Avaliações</CardTitle>
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as ReviewSortBy)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mais Recentes</SelectItem>
                <SelectItem value="rating">Melhor Avaliadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                Nenhuma avaliação ainda. Seja o primeiro a avaliar!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b last:border-0 pb-4 last:pb-0"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{review.authorName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating rating={review.rating} readonly size="sm" />
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

