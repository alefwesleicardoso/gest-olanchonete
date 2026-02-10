import { z } from "zod";

export const categories = [
  "Blusas",
  "Calças",
  "Vestidos",
  "Casacos",
  "Calçados",
  "Acessórios",
  "Moda esportiva",
  "Promoções",
] as const;

export const orderStatuses = [
  "pending",
  "paid",
  "picking",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
  "refunded",
] as const;

export type OrderStatus = typeof orderStatuses[number];
export type Category = typeof categories[number];

export const productVariantSchema = z.object({
  id: z.string(),
  size: z.string().min(1, "O tamanho é obrigatório"),
  color: z.string().min(1, "A cor é obrigatória"),
  sku: z.string().min(1, "O SKU é obrigatório"),
  barcode: z.string().optional(),
  stock: z.coerce.number().int().min(0, "O estoque não pode ser negativo"),
});

const productBaseSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "O nome é obrigatório"),
  price: z.coerce.number().positive("O preço deve ser positivo"),
  salePrice: z.coerce.number().positive("O preço promocional deve ser positivo").optional(),
  costPrice: z.coerce.number().positive("O custo deve ser positivo"),
  stock: z.coerce.number().int().min(0, "O estoque não pode ser negativo"),
  category: z.enum(categories),
  sku: z.string().min(1, "O SKU é obrigatório"),
  barcode: z.string().optional(),
  supplier: z.string().min(1, "O fornecedor é obrigatório"),
  imageUrl: z.string().optional(),
  variants: z.array(productVariantSchema).optional(),
  createdAt: z.string(),
});

const validateProductPrices = (
  data: { salePrice?: number; price: number; costPrice: number },
  ctx: z.RefinementCtx
) => {
  if (data.salePrice !== undefined && data.salePrice > data.price) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "O preço promocional não pode ser maior que o preço",
      path: ["salePrice"],
    });
  }

  if (data.salePrice !== undefined && data.salePrice < data.costPrice) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "O preço promocional não pode ser menor que o custo",
      path: ["salePrice"],
    });
  }

  if (data.price < data.costPrice) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "O preço não pode ser menor que o custo",
      path: ["price"],
    });
  }
};

export const productSchema = productBaseSchema.superRefine(validateProductPrices);
export const insertProductSchema = productBaseSchema
  .omit({ id: true, createdAt: true })
  .superRefine(validateProductPrices);

export type ProductVariant = z.infer<typeof productVariantSchema>;
export type Product = z.infer<typeof productSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export const orderItemSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  productId: z.string(),
  variantId: z.string().optional(),
  productName: z.string(),
  variantLabel: z.string().optional(),
  quantity: z.number().int().positive("A quantidade deve ser positiva"),
  unitPrice: z.number().positive("O preço deve ser positivo"),
});

export const insertOrderItemSchema = orderItemSchema.omit({ id: true, orderId: true });

export type OrderItem = z.infer<typeof orderItemSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export const orderSchema = z.object({
  id: z.string(),
  customerName: z.string().min(1, "O nome do cliente é obrigatório"),
  customerPhone: z.string().min(1, "O telefone é obrigatório"),
  customerAddress: z.string().min(1, "O endereço é obrigatório"),
  customerTaxId: z.string().optional(),
  shippingCost: z.coerce.number().min(0, "O frete não pode ser negativo"),
  discountAmount: z.coerce.number().min(0, "O desconto não pode ser negativo"),
  couponCode: z.string().optional(),
  totalAmount: z.number().positive("O total deve ser positivo"),
  status: z.enum(orderStatuses),
  orderDate: z.string(),
  items: z.array(orderItemSchema),
});

export const insertOrderSchema = z.object({
  customerName: z.string().min(1, "O nome do cliente é obrigatório"),
  customerPhone: z.string().min(10, "O telefone deve ter pelo menos 10 dígitos"),
  customerAddress: z.string().min(5, "O endereço é obrigatório"),
  customerTaxId: z.string().optional(),
  shippingCost: z.coerce.number().min(0, "O frete não pode ser negativo").default(0),
  discountAmount: z.coerce.number().min(0, "O desconto não pode ser negativo").default(0),
  couponCode: z.string().optional(),
  items: z.array(insertOrderItemSchema).min(1, "Adicione pelo menos um item"),
});

export type Order = z.infer<typeof orderSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export const customerSchema = z.object({
  name: z.string(),
  phone: z.string(),
  address: z.string(),
  totalOrders: z.number(),
  totalSpent: z.number(),
  lastOrderDate: z.string(),
});

export type Customer = z.infer<typeof customerSchema>;

export const analyticsSchema = z.object({
  totalRevenue: z.number(),
  grossMargin: z.number(),
  avgOrderValue: z.number(),
  totalDiscounts: z.number(),
  totalShipping: z.number(),
  returnRate: z.number(),
  lowStockCount: z.number(),
  sellThroughRate: z.number(),
  stockCoverageDays: z.number(),
  slowMovingCount: z.number(),
  totalOrders: z.number(),
  totalProducts: z.number(),
  todayOrders: z.number(),
  salesTrend: z.array(z.object({
    date: z.string(),
    revenue: z.number(),
    orders: z.number(),
  })),
  topProducts: z.array(z.object({
    productId: z.string(),
    productName: z.string(),
    totalSold: z.number(),
    revenue: z.number(),
  })),
  categoryDistribution: z.array(z.object({
    category: z.string(),
    count: z.number(),
    revenue: z.number(),
  })),
  sizeDistribution: z.array(z.object({
    size: z.string(),
    count: z.number(),
  })),
  colorDistribution: z.array(z.object({
    color: z.string(),
    count: z.number(),
  })),
  topVariants: z.array(z.object({
    label: z.string(),
    totalSold: z.number(),
    revenue: z.number(),
  })),
});

export type Analytics = z.infer<typeof analyticsSchema>;

export const stockMovementSchema = z.object({
  id: z.string(),
  productId: z.string(),
  variantId: z.string().optional(),
  type: z.enum(["entrada", "saida", "ajuste", "devolucao"]),
  quantity: z.number(),
  reason: z.string(),
  createdAt: z.string(),
});

export type StockMovement = z.infer<typeof stockMovementSchema>;

export const statusConfig: Record<OrderStatus, { label: string; color: string; bgClass: string; textClass: string }> = {
  pending: { 
    label: "Pendente", 
    color: "orange",
    bgClass: "bg-orange-100 dark:bg-orange-950",
    textClass: "text-orange-700 dark:text-orange-300"
  },
  paid: { 
    label: "Pago", 
    color: "blue",
    bgClass: "bg-blue-100 dark:bg-blue-950",
    textClass: "text-blue-700 dark:text-blue-300"
  },
  picking: { 
    label: "Separação", 
    color: "purple",
    bgClass: "bg-purple-100 dark:bg-purple-950",
    textClass: "text-purple-700 dark:text-purple-300"
  },
  packed: {
    label: "Em embalagem",
    color: "indigo",
    bgClass: "bg-indigo-100 dark:bg-indigo-950",
    textClass: "text-indigo-700 dark:text-indigo-300"
  },
  shipped: { 
    label: "Enviado", 
    color: "green",
    bgClass: "bg-green-100 dark:bg-green-950",
    textClass: "text-green-700 dark:text-green-300"
  },
  delivered: { 
    label: "Entregue", 
    color: "gray",
    bgClass: "bg-gray-100 dark:bg-gray-800",
    textClass: "text-gray-700 dark:text-gray-300"
  },
  cancelled: { 
    label: "Cancelado", 
    color: "red",
    bgClass: "bg-red-100 dark:bg-red-950",
    textClass: "text-red-700 dark:text-red-300"
  },
  returned: {
    label: "Devolvido",
    color: "amber",
    bgClass: "bg-amber-100 dark:bg-amber-950",
    textClass: "text-amber-700 dark:text-amber-300"
  },
  refunded: {
    label: "Estornado",
    color: "rose",
    bgClass: "bg-rose-100 dark:bg-rose-950",
    textClass: "text-rose-700 dark:text-rose-300"
  },
};
