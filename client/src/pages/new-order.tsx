import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Minus, ShoppingCart, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, InsertOrder } from "@shared/schema";
import { categories, insertOrderSchema } from "@shared/schema";
import { formatCurrency } from "@/lib/currency";

interface CartItem {
  productId: string;
  variantId?: string;
  productName: string;
  variantLabel?: string;
  quantity: number;
  unitPrice: number;
}

export default function NewOrder() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const form = useForm<InsertOrder>({
    resolver: zodResolver(insertOrderSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      customerTaxId: "",
      shippingCost: 0,
      discountAmount: 0,
      couponCode: "",
      items: [],
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: (data: InsertOrder) => apiRequest("POST", "/api/orders", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({ title: "Sucesso", description: "Pedido criado com sucesso" });
      setCart([]);
      form.reset();
      setLocation("/orders");
    },
    onError: (error: any) => {
      const message = error?.message || "Falha ao criar o pedido";
      toast({ title: "Erro", description: message, variant: "destructive" });
    },
  });

  const filteredProducts = products?.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const inStock = product.variants && product.variants.length > 0
      ? product.variants.some((variant) => variant.stock > 0)
      : product.stock > 0;
    return matchesCategory && inStock;
  });

  const getUnitPrice = (product: Product) => product.salePrice ?? product.price;

  const productVariantOptions = useMemo(() => {
    const map = new Map<string, { id: string; label: string; stock: number }[]>();
    products?.forEach((product) => {
      if (product.variants && product.variants.length > 0) {
        map.set(
          product.id,
          product.variants.map((variant) => ({
            id: variant.id,
            label: `${variant.size} / ${variant.color}`,
            stock: variant.stock,
          }))
        );
      }
    });
    return map;
  }, [products]);

  const addToCart = (product: Product) => {
    const variantId = selectedVariants[product.id];
    const variantOptions = productVariantOptions.get(product.id);
    const selectedVariant = variantOptions?.find((variant) => variant.id === variantId);

    if (variantOptions && !selectedVariant) {
      toast({ title: "Erro", description: "Selecione tamanho e cor antes de adicionar", variant: "destructive" });
      return;
    }

    const existingItem = cart.find((item) =>
      item.productId === product.id && item.variantId === selectedVariant?.id
    );
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.productId === product.id && item.variantId === selectedVariant?.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          variantId: selectedVariant?.id,
          productName: product.name,
          variantLabel: selectedVariant?.label,
          quantity: 1,
          unitPrice: getUnitPrice(product),
        },
      ]);
    }
  };

  const updateQuantity = (productId: string, delta: number, variantId?: string) => {
    setCart(
      cart
        .map((item) =>
          item.productId === productId && item.variantId === variantId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    setCart(cart.filter((item) => !(item.productId === productId && item.variantId === variantId)));
  };

  const itemsTotal = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const shippingCost = Number(form.watch("shippingCost")) || 0;
  const discountAmount = Number(form.watch("discountAmount")) || 0;
  const totalAmount = Math.max(0, itemsTotal + shippingCost - discountAmount);

  const handleSubmit = (data: InsertOrder) => {
    if (cart.length === 0) {
      toast({ title: "Erro", description: "Adicione itens ao pedido", variant: "destructive" });
      return;
    }
    createOrderMutation.mutate({
      ...data,
      items: cart,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground" data-testid="text-new-order-title">Novo pedido</h1>
        <p className="text-muted-foreground">Crie um novo pedido para um cliente</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-64" data-testid="select-category-filter">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </CardHeader>
                  <CardFooter>
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="hover-elevate" data-testid={`card-product-${product.id}`}>
                  <CardHeader className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{product.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                    </div>
                    <CardDescription className="text-lg font-bold text-foreground">
                      {formatCurrency(getUnitPrice(product))}
                    </CardDescription>
                    {product.salePrice ? (
                      <p className="text-xs text-muted-foreground line-through">{formatCurrency(product.price)}</p>
                    ) : null}
                  </CardHeader>
                  <CardFooter>
                    <div className="flex w-full flex-col gap-2">
                      {product.variants && product.variants.length > 0 ? (
                        <Select
                          value={selectedVariants[product.id] ?? ""}
                          onValueChange={(value) =>
                            setSelectedVariants((prev) => ({ ...prev, [product.id]: value }))
                          }
                        >
                          <SelectTrigger data-testid={`select-variant-${product.id}`}>
                            <SelectValue placeholder="Selecione tamanho/cor" />
                          </SelectTrigger>
                          <SelectContent>
                            {product.variants.map((variant) => (
                              <SelectItem key={variant.id} value={variant.id} disabled={variant.stock === 0}>
                                {variant.size} / {variant.color} ({variant.stock} em estoque)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : null}
                      <Button
                        className="w-full"
                        onClick={() => addToCart(product)}
                        data-testid={`button-add-${product.id}`}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar ao carrinho
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">Nenhum produto disponível</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {selectedCategory !== "all"
                    ? "Nenhum produto nesta categoria"
                    : "Adicione produtos ao seu estoque"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Resumo do pedido</CardTitle>
              <CardDescription>
                {cart.length} {cart.length === 1 ? "item" : "itens"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={`${item.productId}-${item.variantId ?? "base"}`} className="flex items-start justify-between gap-2" data-testid={`cart-item-${item.productId}`}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{item.productName}</p>
                          {item.variantLabel ? (
                            <p className="text-xs text-muted-foreground">{item.variantLabel}</p>
                          ) : null}
                          <p className="text-xs text-muted-foreground">{formatCurrency(item.unitPrice)} cada</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.productId, -1, item.variantId)}
                            data-testid={`button-decrease-${item.productId}`}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium" data-testid={`quantity-${item.productId}`}>
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.productId, 1, item.variantId)}
                            data-testid={`button-increase-${item.productId}`}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => removeFromCart(item.productId, item.variantId)}
                            data-testid={`button-remove-${item.productId}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatCurrency(itemsTotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Frete</span>
                        <span>{formatCurrency(shippingCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Desconto</span>
                        <span>-{formatCurrency(discountAmount)}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span data-testid="text-total-amount">{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center">
                  <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Nenhum item no carrinho</p>
                </div>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do cliente</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="João Silva"
                            {...field}
                            data-testid="input-customer-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="(11) 90000-0000"
                            {...field}
                            data-testid="input-customer-phone"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customerAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço de entrega</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Rua das Flores, 123 - São Paulo, SP"
                            {...field}
                            data-testid="input-customer-address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customerTaxId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF/CNPJ (opcional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="000.000.000-00"
                            {...field}
                            data-testid="input-customer-tax-id"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="shippingCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frete</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                              data-testid="input-shipping-cost"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="discountAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Desconto</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                              data-testid="input-discount-amount"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="couponCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cupom (opcional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="BEMVINDO10"
                            {...field}
                            data-testid="input-coupon-code"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createOrderMutation.isPending || cart.length === 0}
                    data-testid="button-create-order"
                  >
                    Criar pedido
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
