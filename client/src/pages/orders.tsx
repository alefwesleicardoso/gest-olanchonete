import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ShoppingCart, Eye, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Order, OrderStatus } from "@shared/schema";
import { statusConfig, orderStatuses } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/lib/currency";

export default function Orders() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { toast } = useToast();

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      apiRequest("PUT", `/api/orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({ title: "Sucesso", description: "Status do pedido atualizado com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao atualizar o status do pedido", variant: "destructive" });
    },
  });

  const filteredOrders = orders?.filter((order) => {
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    return matchesStatus;
  });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground" data-testid="text-orders-title">Pedidos</h1>
          <p className="text-muted-foreground">Gerencie e acompanhe os pedidos dos clientes</p>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48" data-testid="select-filter-status">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {orderStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {statusConfig[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <Skeleton className="h-4 w-64" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : filteredOrders && filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusInfo = statusConfig[order.status];
            return (
              <Card key={order.id} className="hover-elevate" data-testid={`card-order-${order.id}`}>
                <CardHeader>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-3">
                        <span>{order.customerName}</span>
                        <Badge className={`${statusInfo.bgClass} ${statusInfo.textClass}`} data-testid={`badge-status-${order.id}`}>
                          {statusInfo.label}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Pedido #{order.id.slice(0, 8)} • {format(new Date(order.orderDate), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
                      </CardDescription>
                      <div className="flex flex-wrap gap-2 text-sm">
                        <span className="text-muted-foreground">Telefone:</span>
                        <span className="text-foreground">{order.customerPhone}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">Endereço de entrega:</span>
                        <span className="text-foreground">{order.customerAddress}</span>
                        {order.customerTaxId ? (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">CPF/CNPJ:</span>
                            <span className="text-foreground">{order.customerTaxId}</span>
                          </>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:items-end">
                      <div className="text-2xl font-bold text-foreground" data-testid={`text-amount-${order.id}`}>
                        {formatCurrency(order.totalAmount)}
                      </div>
                      <div className="flex gap-2">
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                        >
                          <SelectTrigger className="w-40" data-testid={`select-status-${order.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {orderStatuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                {statusConfig[status].label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setSelectedOrder(order)}
                              data-testid={`button-view-${order.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Detalhes do pedido</DialogTitle>
                              <DialogDescription>Pedido #{order.id.slice(0, 8)}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold text-foreground mb-2">Informações do cliente</h4>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Nome:</span>
                                    <span className="text-foreground">{order.customerName}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Telefone:</span>
                                    <span className="text-foreground">{order.customerPhone}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Endereço de entrega:</span>
                                    <span className="text-foreground text-right">{order.customerAddress}</span>
                                  </div>
                                  {order.customerTaxId ? (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">CPF/CNPJ:</span>
                                      <span className="text-foreground">{order.customerTaxId}</span>
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground mb-2">Itens do pedido</h4>
                                <div className="space-y-2">
                                  {order.items.map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                      <span className="text-foreground">
                                        {item.productName}
                                        {item.variantLabel ? ` (${item.variantLabel})` : ""} x {item.quantity}
                                      </span>
                                      <span className="text-foreground font-medium">
                                        {formatCurrency(item.quantity * item.unitPrice)}
                                      </span>
                                    </div>
                                  ))}
                                  <div className="border-t pt-2 text-sm space-y-1">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Frete</span>
                                      <span>{formatCurrency(order.shippingCost)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Desconto</span>
                                      <span>-{formatCurrency(order.discountAmount)}</span>
                                    </div>
                                    {order.couponCode ? (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Cupom</span>
                                        <span>{order.couponCode}</span>
                                      </div>
                                    ) : null}
                                  </div>
                                  <div className="border-t pt-2 flex justify-between font-bold">
                                    <span>Total</span>
                                    <span>{formatCurrency(order.totalAmount)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">Nenhum pedido encontrado</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {filterStatus !== "all"
                ? "Nenhum pedido com esse status"
                : "Os pedidos aparecerão aqui quando os clientes realizarem compras"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
