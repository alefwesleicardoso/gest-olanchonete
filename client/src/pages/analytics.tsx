import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Package, DollarSign, Layers, Palette, Gauge } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import type { Analytics } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useQuery<Analytics>({
    queryKey: ["/api/analytics"],
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const salesTrendData = {
    labels: analytics?.salesTrend.map((item) => format(new Date(item.date), "dd MMM", { locale: ptBR })) || [],
    datasets: [
      {
        label: "Receita",
        data: analytics?.salesTrend.map((item) => item.revenue) || [],
        borderColor: "rgb(33, 150, 243)",
        backgroundColor: "rgba(33, 150, 243, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Pedidos",
        data: analytics?.salesTrend.map((item) => item.orders) || [],
        borderColor: "rgb(76, 175, 80)",
        backgroundColor: "rgba(76, 175, 80, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const topProductsData = {
    labels: analytics?.topProducts.slice(0, 5).map((item) => item.productName) || [],
    datasets: [
      {
        label: "Unidades vendidas",
        data: analytics?.topProducts.slice(0, 5).map((item) => item.totalSold) || [],
        backgroundColor: "rgba(33, 150, 243, 0.8)",
      },
    ],
  };

  const categoryData = {
    labels: analytics?.categoryDistribution.map((item) => item.category) || [],
    datasets: [
      {
        label: "Receita por categoria",
        data: analytics?.categoryDistribution.map((item) => item.revenue) || [],
        backgroundColor: [
          "rgba(33, 150, 243, 0.8)",
          "rgba(76, 175, 80, 0.8)",
          "rgba(255, 152, 0, 0.8)",
          "rgba(156, 39, 176, 0.8)",
          "rgba(244, 67, 54, 0.8)",
          "rgba(0, 188, 212, 0.8)",
          "rgba(255, 235, 59, 0.8)",
          "rgba(121, 85, 72, 0.8)",
        ],
      },
    ],
  };

  const sizeData = {
    labels: analytics?.sizeDistribution.map((item) => item.size) || [],
    datasets: [
      {
        label: "Unidades",
        data: analytics?.sizeDistribution.map((item) => item.count) || [],
        backgroundColor: "rgba(33, 150, 243, 0.8)",
      },
    ],
  };

  const colorData = {
    labels: analytics?.colorDistribution.map((item) => item.color) || [],
    datasets: [
      {
        label: "Unidades",
        data: analytics?.colorDistribution.map((item) => item.count) || [],
        backgroundColor: "rgba(156, 39, 176, 0.8)",
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
      },
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground" data-testid="text-analytics-title">Análises</h1>
        <p className="text-muted-foreground">Insights e relatórios da sua loja de roupas</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {isLoading ? (
          <>
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                </CardHeader>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Receita total</CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground" data-testid="stat-analytics-revenue">
                  {formatCurrency(analytics?.totalRevenue ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Receita acumulada</p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total de pedidos</CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground" data-testid="stat-analytics-orders">
                  {analytics?.totalOrders || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Pedidos acumulados</p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pedido médio</CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950">
                  <Package className="h-5 w-5 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground" data-testid="stat-analytics-average">
                  {formatCurrency(analytics?.avgOrderValue ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Valor por pedido</p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Margem bruta</CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground" data-testid="stat-analytics-margin">
                  {formatCurrency(analytics?.grossMargin ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Receita menos custo dos produtos</p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Descontos e frete</CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950">
                  <Package className="h-5 w-5 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold text-foreground">
                  -{formatCurrency(analytics?.totalDiscounts ?? 0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Frete: {formatCurrency(analytics?.totalShipping ?? 0)}
                </div>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Risco operacional</CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950">
                  <TrendingUp className="h-5 w-5 text-rose-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {((analytics?.returnRate ?? 0) * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Itens com estoque baixo: {analytics?.lowStockCount ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Sem venda em 30 dias: {analytics?.slowMovingCount ?? 0}
                </p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Giro de estoque</CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-950">
                  <Gauge className="h-5 w-5 text-sky-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {((analytics?.sellThroughRate ?? 0) * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Cobertura estimada: {Math.round(analytics?.stockCoverageDays ?? 0)} dias
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tendência de vendas</CardTitle>
            <CardDescription>Receita e pedidos nos últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <div className="h-80">
                <Line data={salesTrendData} options={lineOptions} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produtos mais vendidos</CardTitle>
            <CardDescription>Itens mais vendidos por unidades</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : analytics?.topProducts && analytics.topProducts.length > 0 ? (
              <div className="h-80">
                <Bar data={topProductsData} options={barOptions} />
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Ainda não há vendas de produtos</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Variações mais vendidas</CardTitle>
            <CardDescription>Top tamanho/cor por unidades</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : analytics?.topVariants && analytics.topVariants.length > 0 ? (
              <div className="space-y-4">
                {analytics.topVariants.slice(0, 6).map((variant, index) => (
                  <div key={variant.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{variant.label}</p>
                        <p className="text-xs text-muted-foreground">{variant.totalSold} unidades</p>
                      </div>
                    </div>
                    <div className="text-right text-sm font-semibold text-foreground">
                      {formatCurrency(variant.revenue)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <Layers className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Nenhuma variação vendida ainda</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por categoria</CardTitle>
            <CardDescription>Receita por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : analytics?.categoryDistribution && analytics.categoryDistribution.length > 0 ? (
              <div className="h-80">
                <Doughnut data={categoryData} options={doughnutOptions} />
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Ainda não há dados por categoria</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produtos com maior receita</CardTitle>
            <CardDescription>Itens com maior faturamento</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : analytics?.topProducts && analytics.topProducts.length > 0 ? (
              <div className="space-y-4">
                {analytics.topProducts.slice(0, 5).map((product, index) => (
                  <div key={product.productId} className="flex items-center justify-between" data-testid={`top-product-${index}`}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{product.productName}</p>
                        <p className="text-xs text-muted-foreground">{product.totalSold} unidades vendidas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{formatCurrency(product.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Ainda não há dados de produtos</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por tamanho</CardTitle>
            <CardDescription>Unidades vendidas por tamanho</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : analytics?.sizeDistribution && analytics.sizeDistribution.length > 0 ? (
              <div className="h-80">
                <Bar data={sizeData} options={barOptions} />
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <Layers className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Sem dados de tamanho</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por cor</CardTitle>
            <CardDescription>Unidades vendidas por cor</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : analytics?.colorDistribution && analytics.colorDistribution.length > 0 ? (
              <div className="h-80">
                <Bar data={colorData} options={barOptions} />
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <Palette className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Sem dados de cor</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
