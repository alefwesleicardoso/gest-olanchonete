import { randomUUID } from "crypto";
import type { Product, InsertProduct, Order, InsertOrder, OrderItem, Customer, Analytics, OrderStatus } from "@shared/schema";

export interface IStorage {
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: InsertProduct): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  updateProductStock(id: string, quantityChange: number): Promise<void>;

  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  getRecentOrders(limit: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: OrderStatus): Promise<Order | undefined>;

  getCustomers(): Promise<Customer[]>;

  getAnalytics(): Promise<Analytics>;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private orders: Map<string, Order>;

  constructor() {
    this.products = new Map();
    this.orders = new Map();
    this.seedData();
  }

  private seedData() {
    const sampleProducts: InsertProduct[] = [
      { name: "Cheeseburger", price: 12.99, stock: 50, category: "Burgers", imageUrl: "" },
      { name: "Double Bacon Burger", price: 15.99, stock: 35, category: "Burgers", imageUrl: "" },
      { name: "Veggie Burger", price: 11.99, stock: 40, category: "Burgers", imageUrl: "" },
      { name: "French Fries", price: 4.99, stock: 100, category: "Sides", imageUrl: "" },
      { name: "Onion Rings", price: 5.99, stock: 75, category: "Sides", imageUrl: "" },
      { name: "Coleslaw", price: 3.99, stock: 60, category: "Sides", imageUrl: "" },
      { name: "Coca-Cola", price: 2.99, stock: 200, category: "Drinks", imageUrl: "" },
      { name: "Sprite", price: 2.99, stock: 180, category: "Drinks", imageUrl: "" },
      { name: "Orange Juice", price: 3.99, stock: 120, category: "Drinks", imageUrl: "" },
      { name: "Chicken Wings", price: 9.99, stock: 30, category: "Appetizers", imageUrl: "" },
      { name: "Mozzarella Sticks", price: 7.99, stock: 45, category: "Appetizers", imageUrl: "" },
      { name: "Nachos", price: 8.99, stock: 50, category: "Appetizers", imageUrl: "" },
      { name: "Chocolate Cake", price: 6.99, stock: 20, category: "Desserts", imageUrl: "" },
      { name: "Ice Cream Sundae", price: 5.99, stock: 35, category: "Desserts", imageUrl: "" },
      { name: "Cheesecake", price: 7.99, stock: 25, category: "Desserts", imageUrl: "" },
      { name: "Pepperoni Pizza", price: 14.99, stock: 40, category: "Pizza", imageUrl: "" },
      { name: "Margherita Pizza", price: 12.99, stock: 45, category: "Pizza", imageUrl: "" },
      { name: "Spaghetti Carbonara", price: 13.99, stock: 30, category: "Pasta", imageUrl: "" },
      { name: "Caesar Salad", price: 8.99, stock: 55, category: "Salads", imageUrl: "" },
      { name: "Greek Salad", price: 9.99, stock: 50, category: "Salads", imageUrl: "" },
    ];

    sampleProducts.forEach((product) => {
      const id = randomUUID();
      this.products.set(id, {
        id,
        ...product,
        createdAt: new Date().toISOString(),
      });
    });

    const productArray = Array.from(this.products.values());
    const sampleOrders: Array<{
      customerName: string;
      customerPhone: string;
      customerAddress: string;
      items: Array<{ productId: string; productName: string; quantity: number; unitPrice: number }>;
      status: OrderStatus;
      daysAgo: number;
    }> = [
      {
        customerName: "John Smith",
        customerPhone: "+1 (555) 123-4567",
        customerAddress: "123 Main St, Springfield, IL 62701",
        items: [
          { productId: productArray[0].id, productName: productArray[0].name, quantity: 2, unitPrice: productArray[0].price },
          { productId: productArray[3].id, productName: productArray[3].name, quantity: 2, unitPrice: productArray[3].price },
          { productId: productArray[6].id, productName: productArray[6].name, quantity: 2, unitPrice: productArray[6].price },
        ],
        status: "delivered",
        daysAgo: 5,
      },
      {
        customerName: "Emma Johnson",
        customerPhone: "+1 (555) 234-5678",
        customerAddress: "456 Oak Ave, Chicago, IL 60601",
        items: [
          { productId: productArray[15].id, productName: productArray[15].name, quantity: 1, unitPrice: productArray[15].price },
          { productId: productArray[7].id, productName: productArray[7].name, quantity: 2, unitPrice: productArray[7].price },
        ],
        status: "delivered",
        daysAgo: 4,
      },
      {
        customerName: "Michael Brown",
        customerPhone: "+1 (555) 345-6789",
        customerAddress: "789 Elm St, Boston, MA 02101",
        items: [
          { productId: productArray[9].id, productName: productArray[9].name, quantity: 2, unitPrice: productArray[9].price },
          { productId: productArray[4].id, productName: productArray[4].name, quantity: 1, unitPrice: productArray[4].price },
          { productId: productArray[8].id, productName: productArray[8].name, quantity: 2, unitPrice: productArray[8].price },
        ],
        status: "ready",
        daysAgo: 0,
      },
      {
        customerName: "Sarah Davis",
        customerPhone: "+1 (555) 456-7890",
        customerAddress: "321 Pine Rd, Seattle, WA 98101",
        items: [
          { productId: productArray[17].id, productName: productArray[17].name, quantity: 1, unitPrice: productArray[17].price },
          { productId: productArray[18].id, productName: productArray[18].name, quantity: 1, unitPrice: productArray[18].price },
          { productId: productArray[6].id, productName: productArray[6].name, quantity: 1, unitPrice: productArray[6].price },
        ],
        status: "preparing",
        daysAgo: 0,
      },
      {
        customerName: "James Wilson",
        customerPhone: "+1 (555) 567-8901",
        customerAddress: "654 Maple Dr, Austin, TX 78701",
        items: [
          { productId: productArray[1].id, productName: productArray[1].name, quantity: 3, unitPrice: productArray[1].price },
          { productId: productArray[3].id, productName: productArray[3].name, quantity: 3, unitPrice: productArray[3].price },
          { productId: productArray[12].id, productName: productArray[12].name, quantity: 2, unitPrice: productArray[12].price },
        ],
        status: "confirmed",
        daysAgo: 0,
      },
      {
        customerName: "John Smith",
        customerPhone: "+1 (555) 123-4567",
        customerAddress: "123 Main St, Springfield, IL 62701",
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
        items: [
          { productId: productArray[0].id, productName: productArray[0].name, quantity: 2, unitPrice: productArray[0].price },
          { productId: productArray[3].id, productName: productArray[3].name, quantity: 2, unitPrice: productArray[3].price },
        ],
        status: "delivered",
        daysAgo: 3,
      },
      {
        customerName: "Michael Brown",
        customerPhone: "+1 (555) 345-6789",
        customerAddress: "789 Elm St, Boston, MA 02101",
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
      const totalAmount = orderData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - orderData.daysAgo);

      const order: Order = {
        id,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerAddress: orderData.customerAddress,
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

  async updateProductStock(id: string, quantityChange: number): Promise<void> {
    const product = this.products.get(id);
    if (product) {
      product.stock = Math.max(0, product.stock + quantityChange);
      this.products.set(id, product);
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
    const totalAmount = insertOrder.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    const order: Order = {
      id,
      customerName: insertOrder.customerName,
      customerPhone: insertOrder.customerPhone,
      customerAddress: insertOrder.customerAddress,
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
      await this.updateProductStock(item.productId, -item.quantity);
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
    const totalOrders = orders.length;
    const totalProducts = products.length;

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

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      todayOrders,
      salesTrend,
      topProducts,
      categoryDistribution,
    };
  }
}

export const storage = new MemStorage();
