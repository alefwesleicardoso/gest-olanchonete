import { randomUUID } from "crypto";
import type {
  Product,
  InsertProduct,
  Order,
  InsertOrder,
  OrderItem,
  Customer,
  Analytics,
  OrderStatus,
  StockMovement,
} from "@shared/schema";

export type StockMovementType = "entrada" | "saida" | "ajuste" | "devolucao";

export interface IStorage {
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: InsertProduct): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  updateProductStock(id: string, quantityChange: number, options?: { variantId?: string; reason?: string; type?: StockMovementType }): Promise<void>;

  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  getRecentOrders(limit: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: OrderStatus): Promise<Order | undefined>;

  getCustomers(): Promise<Customer[]>;

  getAnalytics(): Promise<Analytics>;

  getStockMovements(): Promise<StockMovement[]>;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private orders: Map<string, Order>;
  private stockMovements: StockMovement[];

  constructor() {
    this.products = new Map();
    this.orders = new Map();
    this.stockMovements = [];
    this.seedData();
  }

  private seedData() {
    const sampleProducts: InsertProduct[] = [
      {
        name: "Camiseta básica de algodão",
        price: 19.99,
        salePrice: 16.99,
        costPrice: 8.5,
        stock: 120,
        category: "Blusas",
        sku: "BLS-CTN-001",
        barcode: "7891000000010",
        supplier: "Malhas Brasil",
        imageUrl: "",
        variants: [
          { id: randomUUID(), size: "P", color: "Branco", sku: "BLS-CTN-001-P-BR", barcode: "7891000000011", stock: 40 },
          { id: randomUUID(), size: "M", color: "Branco", sku: "BLS-CTN-001-M-BR", barcode: "7891000000012", stock: 40 },
          { id: randomUUID(), size: "G", color: "Branco", sku: "BLS-CTN-001-G-BR", barcode: "7891000000013", stock: 40 },
        ],
      },
      {
        name: "Camisa de linho oversized",
        price: 34.99,
        costPrice: 15.5,
        stock: 80,
        category: "Blusas",
        sku: "BLS-LNH-002",
        barcode: "7891000000027",
        supplier: "Tecelagem Aurora",
        imageUrl: "",
      },
      {
        name: "Blusa de seda",
        price: 49.99,
        costPrice: 22.0,
        stock: 60,
        category: "Blusas",
        sku: "BLS-SED-003",
        barcode: "7891000000034",
        supplier: "Tecidos Nobres",
        imageUrl: "",
      },
      {
        name: "Calça chino slim",
        price: 39.99,
        costPrice: 18.0,
        stock: 90,
        category: "Calças",
        sku: "CLC-CHN-004",
        barcode: "7891000000041",
        supplier: "DenimWorks",
        imageUrl: "",
        variants: [
          { id: randomUUID(), size: "40", color: "Caqui", sku: "CLC-CHN-004-40-CQ", barcode: "7891000000042", stock: 30 },
          { id: randomUUID(), size: "42", color: "Caqui", sku: "CLC-CHN-004-42-CQ", barcode: "7891000000043", stock: 30 },
          { id: randomUUID(), size: "44", color: "Caqui", sku: "CLC-CHN-004-44-CQ", barcode: "7891000000044", stock: 30 },
        ],
      },
      {
        name: "Jeans de cintura alta",
        price: 54.99,
        costPrice: 26.0,
        stock: 70,
        category: "Calças",
        sku: "CLC-JNS-005",
        barcode: "7891000000058",
        supplier: "DenimWorks",
        imageUrl: "",
      },
      {
        name: "Saia plissada",
        price: 44.99,
        costPrice: 20.0,
        stock: 50,
        category: "Calças",
        sku: "CLC-SAI-006",
        barcode: "7891000000065",
        supplier: "Fabrica Lume",
        imageUrl: "",
      },
      {
        name: "Vestido midi transpassado",
        price: 69.99,
        costPrice: 32.0,
        stock: 45,
        category: "Vestidos",
        sku: "VST-MDI-007",
        barcode: "7891000000072",
        supplier: "Ateliê Laguna",
        imageUrl: "",
      },
      {
        name: "Vestido longo floral",
        price: 79.99,
        costPrice: 36.5,
        stock: 40,
        category: "Vestidos",
        sku: "VST-LNG-008",
        barcode: "7891000000089",
        supplier: "Ateliê Laguna",
        imageUrl: "",
      },
      {
        name: "Vestido de tricô",
        price: 59.99,
        costPrice: 28.0,
        stock: 35,
        category: "Vestidos",
        sku: "VST-TRI-009",
        barcode: "7891000000096",
        supplier: "Malhas Brasil",
        imageUrl: "",
      },
      {
        name: "Jaqueta jeans",
        price: 74.99,
        costPrice: 35.0,
        stock: 55,
        category: "Casacos",
        sku: "CSC-JNS-010",
        barcode: "7891000000102",
        supplier: "DenimWorks",
        imageUrl: "",
      },
      {
        name: "Casaco de lã",
        price: 129.99,
        costPrice: 62.0,
        stock: 30,
        category: "Casacos",
        sku: "CSC-LA-011",
        barcode: "7891000000119",
        supplier: "Tecidos Nobres",
        imageUrl: "",
      },
      {
        name: "Jaqueta puffer matelassê",
        price: 99.99,
        costPrice: 45.0,
        stock: 40,
        category: "Casacos",
        sku: "CSC-PUF-012",
        barcode: "7891000000126",
        supplier: "Fabrica Lume",
        imageUrl: "",
      },
      {
        name: "Tênis de couro",
        price: 89.99,
        costPrice: 40.0,
        stock: 65,
        category: "Calçados",
        sku: "CLD-TNS-013",
        barcode: "7891000000133",
        supplier: "Couro & Cia",
        imageUrl: "",
        variants: [
          { id: randomUUID(), size: "38", color: "Branco", sku: "CLD-TNS-013-38-BR", barcode: "7891000000134", stock: 20 },
          { id: randomUUID(), size: "39", color: "Branco", sku: "CLD-TNS-013-39-BR", barcode: "7891000000135", stock: 20 },
          { id: randomUUID(), size: "40", color: "Branco", sku: "CLD-TNS-013-40-BR", barcode: "7891000000136", stock: 25 },
        ],
      },
      {
        name: "Bota cano curto",
        price: 119.99,
        costPrice: 54.0,
        stock: 42,
        category: "Calçados",
        sku: "CLD-BOT-014",
        barcode: "7891000000140",
        supplier: "Couro & Cia",
        imageUrl: "",
      },
      {
        name: "Sandália de verão",
        price: 49.99,
        costPrice: 22.0,
        stock: 75,
        category: "Calçados",
        sku: "CLD-SND-015",
        barcode: "7891000000157",
        supplier: "Couro & Cia",
        imageUrl: "",
      },
      {
        name: "Cinto de couro",
        price: 24.99,
        costPrice: 9.0,
        stock: 110,
        category: "Acessórios",
        sku: "ACS-CNT-016",
        barcode: "7891000000164",
        supplier: "Couro & Cia",
        imageUrl: "",
      },
      {
        name: "Bolsa tote de lona",
        price: 29.99,
        costPrice: 11.0,
        stock: 90,
        category: "Acessórios",
        sku: "ACS-BLS-017",
        barcode: "7891000000171",
        supplier: "Ateliê Laguna",
        imageUrl: "",
      },
      {
        name: "Boné clássico",
        price: 18.99,
        costPrice: 7.0,
        stock: 130,
        category: "Acessórios",
        sku: "ACS-BNE-018",
        barcode: "7891000000188",
        supplier: "Fabrica Lume",
        imageUrl: "",
      },
      {
        name: "Legging performance",
        price: 49.99,
        costPrice: 21.0,
        stock: 85,
        category: "Moda esportiva",
        sku: "ESP-LGG-019",
        barcode: "7891000000195",
        supplier: "SportPro",
        imageUrl: "",
      },
      {
        name: "Moletom de treino",
        price: 59.99,
        costPrice: 25.0,
        stock: 60,
        category: "Moda esportiva",
        sku: "ESP-MLT-020",
        barcode: "7891000000201",
        supplier: "SportPro",
        imageUrl: "",
      },
      {
        name: "Camiseta promocional",
        price: 14.99,
        salePrice: 12.99,
        costPrice: 6.0,
        stock: 150,
        category: "Promoções",
        sku: "PRM-CTS-021",
        barcode: "7891000000218",
        supplier: "Malhas Brasil",
        imageUrl: "",
      },
    ];

    sampleProducts.forEach((product) => {
      const id = randomUUID();
      const normalizedVariants = product.variants?.map((variant) => ({
        ...variant,
      }));
      this.products.set(id, {
        id,
        ...product,
        variants: normalizedVariants,
        createdAt: new Date().toISOString(),
      });
    });

    const productArray = Array.from(this.products.values());
    const sampleOrders: Array<{
      customerName: string;
      customerPhone: string;
      customerAddress: string;
      customerTaxId?: string;
      shippingCost: number;
      discountAmount: number;
      couponCode?: string;
      items: Array<{ productId: string; productName: string; quantity: number; unitPrice: number; variantId?: string; variantLabel?: string }>;
      status: OrderStatus;
      daysAgo: number;
    }> = [
      {
        customerName: "John Smith",
        customerPhone: "+1 (555) 123-4567",
        customerAddress: "123 Main St, Springfield, IL 62701",
        customerTaxId: "123.456.789-00",
        shippingCost: 18.0,
        discountAmount: 10.0,
        couponCode: "BEMVINDO10",
        items: [
          {
            productId: productArray[0].id,
            productName: productArray[0].name,
            quantity: 2,
            unitPrice: productArray[0].salePrice ?? productArray[0].price,
            variantId: productArray[0].variants?.[0]?.id,
            variantLabel: "P / Branco",
          },
          {
            productId: productArray[3].id,
            productName: productArray[3].name,
            quantity: 2,
            unitPrice: productArray[3].price,
            variantId: productArray[3].variants?.[1]?.id,
            variantLabel: "42 / Caqui",
          },
          { productId: productArray[6].id, productName: productArray[6].name, quantity: 2, unitPrice: productArray[6].price },
        ],
        status: "delivered",
        daysAgo: 5,
      },
      {
        customerName: "Emma Johnson",
        customerPhone: "+1 (555) 234-5678",
        customerAddress: "456 Oak Ave, Chicago, IL 60601",
        shippingCost: 12.0,
        discountAmount: 0,
        items: [
          { productId: productArray[15].id, productName: productArray[15].name, quantity: 1, unitPrice: productArray[15].price },
          { productId: productArray[7].id, productName: productArray[7].name, quantity: 2, unitPrice: productArray[7].price },
        ],
        status: "shipped",
        daysAgo: 4,
      },
      {
        customerName: "Michael Brown",
        customerPhone: "+1 (555) 345-6789",
        customerAddress: "789 Elm St, Boston, MA 02101",
        shippingCost: 20.0,
        discountAmount: 5.0,
        couponCode: "FRETEGRATIS",
        items: [
          { productId: productArray[9].id, productName: productArray[9].name, quantity: 2, unitPrice: productArray[9].price },
          { productId: productArray[4].id, productName: productArray[4].name, quantity: 1, unitPrice: productArray[4].price },
          { productId: productArray[8].id, productName: productArray[8].name, quantity: 2, unitPrice: productArray[8].price },
        ],
        status: "packed",
        daysAgo: 0,
      },
      {
        customerName: "Sarah Davis",
        customerPhone: "+1 (555) 456-7890",
        customerAddress: "321 Pine Rd, Seattle, WA 98101",
        shippingCost: 16.0,
        discountAmount: 0,
        items: [
          { productId: productArray[17].id, productName: productArray[17].name, quantity: 1, unitPrice: productArray[17].price },
          { productId: productArray[18].id, productName: productArray[18].name, quantity: 1, unitPrice: productArray[18].price },
          { productId: productArray[6].id, productName: productArray[6].name, quantity: 1, unitPrice: productArray[6].price },
        ],
        status: "paid",
        daysAgo: 0,
      },
      {
        customerName: "James Wilson",
        customerPhone: "+1 (555) 567-8901",
        customerAddress: "654 Maple Dr, Austin, TX 78701",
        shippingCost: 0,
        discountAmount: 15.0,
        couponCode: "VIP15",
        items: [
          { productId: productArray[1].id, productName: productArray[1].name, quantity: 3, unitPrice: productArray[1].price },
          { productId: productArray[3].id, productName: productArray[3].name, quantity: 3, unitPrice: productArray[3].price },
          {
            productId: productArray[12].id,
            productName: productArray[12].name,
            quantity: 2,
            unitPrice: productArray[12].price,
            variantId: productArray[12].variants?.[1]?.id,
            variantLabel: "39 / Branco",
          },
        ],
        status: "paid",
        daysAgo: 0,
      },
      {
        customerName: "John Smith",
        customerPhone: "+1 (555) 123-4567",
        customerAddress: "123 Main St, Springfield, IL 62701",
        shippingCost: 10.0,
        discountAmount: 0,
        items: [
          { productId: productArray[15].id, productName: productArray[15].name, quantity: 2, unitPrice: productArray[15].price },
          { productId: productArray[6].id, productName: productArray[6].name, quantity: 3, unitPrice: productArray[6].price },
        ],
        status: "pending",
        daysAgo: 0,
      },
      {
        customerName: "Emma Johnson",
        customerPhone: "+1 (555) 234-5678",
        customerAddress: "456 Oak Ave, Chicago, IL 60601",
        shippingCost: 12.0,
        discountAmount: 0,
        items: [
          {
            productId: productArray[0].id,
            productName: productArray[0].name,
            quantity: 2,
            unitPrice: productArray[0].price,
            variantId: productArray[0].variants?.[2]?.id,
            variantLabel: "G / Branco",
          },
          { productId: productArray[3].id, productName: productArray[3].name, quantity: 2, unitPrice: productArray[3].price },
        ],
        status: "delivered",
        daysAgo: 3,
      },
      {
        customerName: "Michael Brown",
        customerPhone: "+1 (555) 345-6789",
        customerAddress: "789 Elm St, Boston, MA 02101",
        shippingCost: 22.0,
        discountAmount: 0,
        items: [
          { productId: productArray[16].id, productName: productArray[16].name, quantity: 1, unitPrice: productArray[16].price },
          { productId: productArray[7].id, productName: productArray[7].name, quantity: 2, unitPrice: productArray[7].price },
        ],
        status: "delivered",
        daysAgo: 2,
      },
    ];

    sampleOrders.forEach((orderData) => {
      const id = randomUUID();
      const itemsTotal = orderData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const totalAmount = Math.max(0, itemsTotal + orderData.shippingCost - orderData.discountAmount);
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - orderData.daysAgo);

      const order: Order = {
        id,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerAddress: orderData.customerAddress,
        customerTaxId: orderData.customerTaxId,
        shippingCost: orderData.shippingCost,
        discountAmount: orderData.discountAmount,
        couponCode: orderData.couponCode,
        totalAmount,
        status: orderData.status,
        orderDate: orderDate.toISOString(),
        items: orderData.items.map((item) => ({
          id: randomUUID(),
          orderId: id,
          ...item,
        })),
      };
      this.orders.set(id, order);
    });
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      id,
      ...insertProduct,
      createdAt: new Date().toISOString(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, insertProduct: InsertProduct): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing) return undefined;

    const updated: Product = {
      ...existing,
      ...insertProduct,
    };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  async updateProductStock(
    id: string,
    quantityChange: number,
    options?: { variantId?: string; reason?: string; type?: StockMovementType }
  ): Promise<void> {
    const product = this.products.get(id);
    if (product) {
      if (options?.variantId && product.variants?.length) {
        const updatedVariants = product.variants.map((variant) =>
          variant.id === options.variantId
            ? { ...variant, stock: Math.max(0, variant.stock + quantityChange) }
            : variant
        );
        product.variants = updatedVariants;
      } else {
        product.stock = Math.max(0, product.stock + quantityChange);
      }
      this.products.set(id, product);
      this.stockMovements.unshift({
        id: randomUUID(),
        productId: id,
        variantId: options?.variantId,
        type: options?.type ?? (quantityChange < 0 ? "saida" : "entrada"),
        quantity: Math.abs(quantityChange),
        reason: options?.reason ?? "Atualização de estoque",
        createdAt: new Date().toISOString(),
      });
    }
  }

  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort((a, b) => 
      new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
    );
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getRecentOrders(limit: number): Promise<Order[]> {
    const orders = await this.getOrders();
    return orders.slice(0, limit);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const itemsTotal = insertOrder.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const totalAmount = Math.max(0, itemsTotal + insertOrder.shippingCost - insertOrder.discountAmount);

    const order: Order = {
      id,
      customerName: insertOrder.customerName,
      customerPhone: insertOrder.customerPhone,
      customerAddress: insertOrder.customerAddress,
      customerTaxId: insertOrder.customerTaxId,
      shippingCost: insertOrder.shippingCost,
      discountAmount: insertOrder.discountAmount,
      couponCode: insertOrder.couponCode,
      totalAmount,
      status: "pending",
      orderDate: new Date().toISOString(),
      items: insertOrder.items.map((item) => ({
        id: randomUUID(),
        orderId: id,
        ...item,
      })),
    };

    for (const item of order.items) {
      await this.updateProductStock(item.productId, -item.quantity, {
        variantId: item.variantId,
        reason: `Pedido ${order.id.slice(0, 8)}`,
        type: "saida",
      });
    }

    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    order.status = status;
    this.orders.set(id, order);
    return order;
  }

  async getCustomers(): Promise<Customer[]> {
    const orders = Array.from(this.orders.values());
    const customerMap = new Map<string, Customer>();

    orders.forEach((order) => {
      const key = order.customerPhone;
      const existing = customerMap.get(key);

      if (existing) {
        existing.totalOrders += 1;
        existing.totalSpent += order.totalAmount;
        if (new Date(order.orderDate) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = order.orderDate;
        }
      } else {
        customerMap.set(key, {
          name: order.customerName,
          phone: order.customerPhone,
          address: order.customerAddress,
          totalOrders: 1,
          totalSpent: order.totalAmount,
          lastOrderDate: order.orderDate,
        });
      }
    });

    return Array.from(customerMap.values()).sort((a, b) => 
      new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime()
    );
  }

  async getAnalytics(): Promise<Analytics> {
    const products = Array.from(this.products.values());
    const orders = Array.from(this.orders.values());

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalDiscounts = orders.reduce((sum, order) => sum + (order.discountAmount || 0), 0);
    const totalShipping = orders.reduce((sum, order) => sum + (order.shippingCost || 0), 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const returnedOrders = orders.filter((order) => order.status === "returned" || order.status === "refunded").length;
    const returnRate = totalOrders > 0 ? returnedOrders / totalOrders : 0;

    const costMap = new Map(products.map((product) => [product.id, product.costPrice]));
    const totalCost = orders.reduce((sum, order) => {
      const orderCost = order.items.reduce((itemSum, item) => {
        const cost = costMap.get(item.productId) ?? 0;
        return itemSum + cost * item.quantity;
      }, 0);
      return sum + orderCost;
    }, 0);
    const grossMargin = totalRevenue - totalCost;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter((order) => new Date(order.orderDate) >= today).length;

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      return date;
    });

    const salesTrend = last7Days.map((date) => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayOrders = orders.filter((order) => {
        const orderDate = new Date(order.orderDate);
        return orderDate >= date && orderDate < nextDay;
      });

      return {
        date: date.toISOString(),
        revenue: dayOrders.reduce((sum, order) => sum + order.totalAmount, 0),
        orders: dayOrders.length,
      };
    });

    const productSales = new Map<string, { productName: string; totalSold: number; revenue: number }>();
    const variantSales = new Map<string, { totalSold: number; revenue: number }>();
    const sizeSales = new Map<string, number>();
    const colorSales = new Map<string, number>();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = productSales.get(item.productId);
        if (existing) {
          existing.totalSold += item.quantity;
          existing.revenue += item.quantity * item.unitPrice;
        } else {
          productSales.set(item.productId, {
            productName: item.productName,
            totalSold: item.quantity,
            revenue: item.quantity * item.unitPrice,
          });
        }
        if (item.variantLabel) {
          const variantKey = item.variantLabel;
          const variantExisting = variantSales.get(variantKey);
          if (variantExisting) {
            variantExisting.totalSold += item.quantity;
            variantExisting.revenue += item.quantity * item.unitPrice;
          } else {
            variantSales.set(variantKey, {
              totalSold: item.quantity,
              revenue: item.quantity * item.unitPrice,
            });
          }
          const [size, color] = item.variantLabel.split("/").map((value) => value.trim());
          if (size) {
            sizeSales.set(size, (sizeSales.get(size) ?? 0) + item.quantity);
          }
          if (color) {
            colorSales.set(color, (colorSales.get(color) ?? 0) + item.quantity);
          }
        }
      });
    });

    const topProducts = Array.from(productSales.entries())
      .map(([productId, data]) => ({
        productId,
        ...data,
      }))
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 10);

    const categoryRevenue = new Map<string, { count: number; revenue: number }>();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (product) {
          const existing = categoryRevenue.get(product.category);
          if (existing) {
            existing.count += item.quantity;
            existing.revenue += item.quantity * item.unitPrice;
          } else {
            categoryRevenue.set(product.category, {
              count: item.quantity,
              revenue: item.quantity * item.unitPrice,
            });
          }
        }
      });
    });

    const categoryDistribution = Array.from(categoryRevenue.entries())
      .map(([category, data]) => ({
        category,
        ...data,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const totalUnitsSold = Array.from(productSales.values()).reduce((sum, item) => sum + item.totalSold, 0);
    const totalStockUnits = products.reduce((sum, product) => {
      if (product.variants && product.variants.length > 0) {
        return sum + product.variants.reduce((variantSum, variant) => variantSum + variant.stock, 0);
      }
      return sum + product.stock;
    }, 0);
    const sellThroughRate = totalUnitsSold + totalStockUnits > 0
      ? totalUnitsSold / (totalUnitsSold + totalStockUnits)
      : 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const last30DaysOrders = orders.filter((order) => new Date(order.orderDate) >= thirtyDaysAgo);
    const unitsLast30Days = last30DaysOrders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);
    const avgDailySales = unitsLast30Days / 30;
    const stockCoverageDays = avgDailySales > 0 ? totalStockUnits / avgDailySales : 0;

    const salesLast30ByProduct = new Map<string, number>();
    last30DaysOrders.forEach((order) => {
      order.items.forEach((item) => {
        salesLast30ByProduct.set(item.productId, (salesLast30ByProduct.get(item.productId) ?? 0) + item.quantity);
      });
    });
    const slowMovingCount = products.filter((product) => (salesLast30ByProduct.get(product.id) ?? 0) === 0).length;

    const lowStockCount = products.filter((product) => {
      if (product.variants && product.variants.length > 0) {
        const totalVariantStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
        return totalVariantStock < 10;
      }
      return product.stock < 10;
    }).length;

    const sizeDistribution = Array.from(sizeSales.entries())
      .map(([size, count]) => ({ size, count }))
      .sort((a, b) => b.count - a.count);
    const colorDistribution = Array.from(colorSales.entries())
      .map(([color, count]) => ({ color, count }))
      .sort((a, b) => b.count - a.count);
    const topVariants = Array.from(variantSales.entries())
      .map(([label, data]) => ({ label, ...data }))
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 10);

    return {
      totalRevenue,
      grossMargin,
      avgOrderValue,
      totalDiscounts,
      totalShipping,
      returnRate,
      lowStockCount,
      sellThroughRate,
      stockCoverageDays,
      slowMovingCount,
      totalOrders,
      totalProducts,
      todayOrders,
      salesTrend,
      topProducts,
      categoryDistribution,
      sizeDistribution,
      colorDistribution,
      topVariants,
    };
  }

  async getStockMovements(): Promise<StockMovement[]> {
    return this.stockMovements;
  }
}

export const storage = new MemStorage();
