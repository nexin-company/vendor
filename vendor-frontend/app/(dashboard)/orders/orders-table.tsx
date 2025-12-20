'use client';

import {
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  Table,
  TableCell
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Order } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { shipmentsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useState } from 'react';

interface OrdersTableProps {
  orders: Order[];
  onRefresh: () => void;
}

function statusLabel(status: Order['status']) {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'processing':
      return 'Procesando';
    case 'shipped':
      return 'Enviado';
    case 'delivered':
      return 'Entregado';
    case 'cancelled':
      return 'Cancelado';
    default:
      return status;
  }
}

function statusVariant(status: Order['status']): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'delivered':
      return 'default';
    case 'cancelled':
      return 'destructive';
    case 'pending':
      return 'secondary';
    default:
      return 'outline';
  }
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [tracking, setTracking] = useState<Record<number, any[]>>({});
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const loadTracking = async (orderId: number) => {
    setLoadingId(orderId);
    try {
      const data = await shipmentsApi.getByOrderId(orderId);
      setTracking((prev) => ({ ...prev, [orderId]: data }));
    } catch (e) {
      console.error(e);
      setTracking((prev) => ({ ...prev, [orderId]: [] }));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Órdenes</CardTitle>
        <CardDescription>Listado de órdenes (cabecera). El detalle se agregará en la siguiente iteración.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="hidden md:table-cell">Actualizado</TableHead>
              <TableHead>
                <span className="sr-only">Tracking</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No hay órdenes todavía
                </TableCell>
              </TableRow>
            ) : (
              orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">#{o.id}</TableCell>
                  <TableCell>{o.customerName || o.customerId}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(o.status)}>{statusLabel(o.status)}</Badge>
                  </TableCell>
                  <TableCell className="text-right">${Number(o.total).toFixed(2)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(o.updatedAt).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog
                      onOpenChange={(open) => {
                        if (open) loadTracking(o.id);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          Tracking
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Tracking de la orden #{o.id}</DialogTitle>
                          <DialogDescription>Shipments asociados por `orderId` (read-only).</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2 text-sm">
                          {loadingId === o.id ? (
                            <div className="text-muted-foreground">Cargando...</div>
                          ) : (tracking[o.id] || []).length === 0 ? (
                            <div className="text-muted-foreground">Sin shipments todavía</div>
                          ) : (
                            (tracking[o.id] || []).map((s: any) => (
                              <div key={s.id} className="border rounded-md p-3">
                                <div className="flex items-center justify-between">
                                  <div className="font-medium">Shipment #{s.id}</div>
                                  <Badge variant="outline">{s.status}</Badge>
                                </div>
                                <div className="text-muted-foreground mt-1">
                                  {s.carrier ? `Carrier: ${s.carrier}` : 'Carrier: —'}
                                </div>
                                <div className="text-muted-foreground">
                                  {s.trackingNumber ? `Guía: ${s.trackingNumber}` : 'Guía: —'}
                                </div>
                                {s.trackingUrl ? (
                                  <a className="text-primary underline" href={s.trackingUrl} target="_blank" rel="noreferrer">
                                    Abrir tracking
                                  </a>
                                ) : null}
                              </div>
                            ))
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}


