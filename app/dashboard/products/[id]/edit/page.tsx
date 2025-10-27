"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { BackButton } from "@/components/BackButton";
import { getProduct, updateProduct } from "@/lib/products";
import { uploadImage, createImagePreview } from "@/lib/upload";
import { PRODUCT_CATEGORIES, Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PriceInput } from "@/components/ui/price-input";
import { RatingInput } from "@/components/ui/rating-input";
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
  FormDescription,
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
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

// Schema de validação com Zod
const productSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(100),
  category: z.string().min(1, "Selecione uma categoria"),
  description: z.string().min(150, "Descrição deve ter no mínimo 150 caracteres").max(500, "Descrição deve ter no máximo 500 caracteres"),
  rating: z.number().min(0, "Mínimo 0").max(5, "Máximo 5"),
  price: z.number().min(0, "Preço deve ser maior que zero"),
  storeName: z.string().min(2, "Nome da loja é obrigatório").max(100),
  storeLink: z.string().url("Link inválido").or(z.literal("")),
  imageUrl: z.string().url("URL da imagem inválida").or(z.literal("")),
});

type ProductFormData = z.infer<typeof productSchema>;

function EditProductContent() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
      rating: 0,
      price: 0,
      storeName: "",
      storeLink: "",
      imageUrl: "",
    },
  });

  useEffect(() => {
    loadProduct();
  }, [productId]);

  async function loadProduct() {
    try {
      setLoading(true);
      const productData = await getProduct(productId);

      if (!productData) {
        toast.error("Produto não encontrado");
        router.push("/dashboard/products");
        return;
      }

      // Verifica se o produto pertence ao usuário
      if (productData.createdBy !== user?.uid) {
        toast.error("Você não tem permissão para editar este produto");
        router.push("/dashboard/products");
        return;
      }

      setProduct(productData);
      setImagePreview(productData.imageUrl);

      // Preenche o formulário
      form.reset({
        name: productData.name,
        category: productData.category,
        description: productData.description,
        rating: productData.rating,
        price: productData.price,
        storeName: productData.storeName,
        storeLink: productData.storeLink,
        imageUrl: productData.imageUrl,
      });
    } catch (error) {
      console.error("Erro ao carregar produto:", error);
      toast.error("Erro ao carregar produto");
      router.push("/dashboard/products");
    } finally {
      setLoading(false);
    }
  }

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação básica
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    setImageFile(file);

    // Gera preview
    try {
      const preview = await createImagePreview(file);
      setImagePreview(preview);
    } catch (error) {
      console.error("Erro ao gerar preview:", error);
      toast.error("Erro ao gerar preview da imagem");
    }
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview("");
    form.setValue("imageUrl", "");
  }

  async function onSubmit(data: ProductFormData) {
    if (!user || !product) return;

    setIsSubmitting(true);

    try {
      let imageUrl = data.imageUrl;

      // Upload da nova imagem se houver
      if (imageFile) {
        setUploadingImage(true);
        toast.info("Fazendo upload da imagem...");

        try {
          imageUrl = await uploadImage(imageFile);
          toast.success("Imagem enviada com sucesso!");
        } catch (error) {
          console.error("Erro no upload:", error);
          toast.error("Erro ao fazer upload da imagem. Mantendo imagem anterior.");
          imageUrl = product.imageUrl; // Mantém a imagem anterior
        } finally {
          setUploadingImage(false);
        }
      }

      // Atualiza o produto
      await updateProduct(productId, {
        ...data,
        imageUrl,
        createdBy: user.uid,
      });

      toast.success("Produto atualizado com sucesso!");
      router.push("/dashboard/products");
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      toast.error("Erro ao atualizar produto. Tente novamente.");
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <BackButton href="/dashboard/products" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Produto</h1>
          <p className="text-muted-foreground">
            Atualize as informações do produto
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Produto</CardTitle>
          <CardDescription>
            Edite os dados do produto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Imagem */}
              <div className="space-y-2">
                <FormLabel>Imagem do Produto</FormLabel>
                <div className="flex flex-col gap-4">
                  {imagePreview ? (
                    <div className="relative w-full max-w-md">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <div className="mt-4">
                        <label htmlFor="image-upload">
                          <Button type="button" variant="outline" asChild>
                            <span>Selecionar Nova Imagem</span>
                          </Button>
                        </label>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageSelect}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        PNG, JPG até 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Nome */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Produto</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Carrinho de Bebê Deluxe"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Categoria */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRODUCT_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Descrição */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descreva sua experiência com este produto</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <textarea
                          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                          placeholder="Conte detalhadamente como foi sua experiência com este produto. O que mais gostou? Houve algum problema? Recomendaria para outras mamães?"
                          {...field}
                        />
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {field.value.length}/500 caracteres
                          </span>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Preço */}
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço</FormLabel>
                      <FormControl>
                        <PriceInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0,00"
                        />
                      </FormControl>
                      <FormDescription>
                        Digite o preço em reais (ex: 129,90)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Avaliação */}
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avaliação</FormLabel>
                      <FormControl>
                        <RatingInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0.0"
                        />
                      </FormControl>
                      <FormDescription>
                        Sua avaliação de 0 a 5 estrelas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Nome da Loja */}
              <FormField
                control={form.control}
                name="storeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Loja</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Amazon, Magazine Luiza, Loja Física XYZ"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Link da Loja */}
              <FormField
                control={form.control}
                name="storeLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link da Loja (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://www.exemplo.com/produto"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Link onde o produto pode ser comprado
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Link href="/dashboard/products" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting || uploadingImage}
                >
                  {isSubmitting
                    ? uploadingImage
                      ? "Enviando imagem..."
                      : "Salvando..."
                    : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function EditProductPage() {
  return (
    <ProtectedRoute>
      <EditProductContent />
    </ProtectedRoute>
  );
}

