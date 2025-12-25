'use client';

import { useState } from 'react';
import { Order, ordersApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { File, PlusCircle } from 'lucide-react';
import { OrdersTable } from './orders-table';
import { TableSkeleton } from '@/components/table-skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { OrderForm } from './order-form';

interface OrdersPageClientProps {
  initialOrders: Order[];
}

export function OrdersPageClient({ initialOrders }: OrdersPageClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const refresh = async () => {
    setIsLoading(true);
    try {
      const data = await ordersApi.getAll();
      setOrders(data);
    } catch (e) {
      console.error('Error refrescando órdenes:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <TableSkeleton columns={5} rows={8} />;
  }

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">
          Gestiona órdenes, líneas, descuentos y pagos manuales.
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => {}}>
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Exportar</span>
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Crear Orden</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Crear orden</DialogTitle>
                <DialogDescription>
                  Selecciona un cliente y agrega líneas (producto, cantidad, precio, descuentos).
                </DialogDescription>
              </DialogHeader>
              <OrderForm
                onCreated={async () => {
                  setIsDialogOpen(false);
                  await refresh();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <OrdersTable orders={orders} onRefresh={refresh} />
    </div>
  );
}


