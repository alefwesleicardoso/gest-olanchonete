import { useQuery } from "@tanstack/react-query";
import { PackageMinus, PackagePlus, RotateCcw, ClipboardList } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { StockMovement, Product } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const movementLabels: Record<StockMovement["type"], string> = {
  entrada: "Entrada",
  saida: "Saída",
  ajuste: "Ajuste",
  devolucao: "Devolução",
};

const movementIcons: Record<StockMovement["type"], typeof PackagePlus> = {
  entrada: PackagePlus,
  saida: PackageMinus,
  ajuste: ClipboardList,
  devolucao: RotateCcw,
};

export default function StockMovements() {
  const { data: movements, isLoading } = useQuery<StockMovement[]>({
    queryKey: ["/api/stock-movements"],
  });
  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const productMap = new Map(products?.map((product) => [product.id, product]) ?? []);

  return (
    <div className="space-y-6">
      <Card className="border border-primary/10 bg-gradient-to-br from-primary/10 via-background to-background shadow-sm">
        <CardContent className="flex flex-col gap-2 py-6">
          <p className="text-sm font-medium uppercase tracking-wide text-primary/80">Controle de estoque</p>
          <h1 className="text-3xl font-bold text-foreground" data-testid="text-stock-title">Movimentações de estoque</h1>
          <p className="text-muted-foreground">Entradas, saídas, ajustes e devoluções registradas</p>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
              <Card key={i} className="border border-border/60">
                <CardHeader className="flex flex-row items-center justify-between">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-64" />
                </CardContent>
              </Card>
          ))}
        </div>
      ) : movements && movements.length > 0 ? (
        <div className="space-y-4">
          {movements.map((movement) => {
            const Icon = movementIcons[movement.type];
            return (
              <Card key={movement.id} className="hover-elevate border border-border/60" data-testid={`stock-movement-${movement.id}`}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{movementLabels[movement.type]}</CardTitle>
                      <CardDescription>
                        {format(new Date(movement.createdAt), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">{movement.quantity} itens</Badge>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-muted-foreground">Produto:</span>
                    <span>{productMap.get(movement.productId)?.name ?? movement.productId}</span>
                    {movement.variantId ? (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">Variação:</span>
                        <span>
                          {productMap
                            .get(movement.productId)
                            ?.variants?.find((variant) => variant.id === movement.variantId)
                            ? `${productMap.get(movement.productId)?.variants?.find((variant) => variant.id === movement.variantId)?.size} / ${productMap.get(movement.productId)?.variants?.find((variant) => variant.id === movement.variantId)?.color}`
                            : movement.variantId}
                        </span>
                      </>
                    ) : null}
                  </div>
                  <div className="text-muted-foreground">Motivo: {movement.reason}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <ClipboardList className="mx-auto h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">Nenhuma movimentação registrada</h3>
            <p className="mt-2 text-sm text-muted-foreground">As movimentações aparecerão aqui quando o estoque mudar</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
