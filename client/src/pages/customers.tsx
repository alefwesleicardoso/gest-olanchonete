import { useQuery } from "@tanstack/react-query";
import { Users, ShoppingCart, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Customer } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Customers() {
  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground" data-testid="text-customers-title">Clientes</h1>
        <p className="text-muted-foreground">Veja o histórico de compras e estatísticas dos clientes</p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : customers && customers.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {customers.map((customer, index) => (
            <Card key={`${customer.phone}-${index}`} className="hover-elevate" data-testid={`card-customer-${index}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{customer.name}</CardTitle>
                    <CardDescription className="truncate">{customer.phone}</CardDescription>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground">Total de pedidos</span>
                    <Badge variant="secondary" data-testid={`badge-orders-${index}`}>
                      <ShoppingCart className="mr-1 h-3 w-3" />
                      {customer.totalOrders}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground">Total gasto</span>
                    <span className="font-semibold text-foreground" data-testid={`text-spent-${index}`}>
                      <DollarSign className="inline h-3 w-3" />
                      {formatCurrency(customer.totalSpent)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground">Último pedido</span>
                    <span className="text-foreground">{format(new Date(customer.lastOrderDate), "dd MMM yyyy", { locale: ptBR })}</span>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground truncate">{customer.address}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="mx-auto h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">Nenhum cliente ainda</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Os dados dos clientes aparecerão aqui após os pedidos serem realizados
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
